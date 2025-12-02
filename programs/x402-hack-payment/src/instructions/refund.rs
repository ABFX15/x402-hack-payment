use anchor_lang::prelude::*;

use crate::state::platform::Platform;
use crate::state::merchant::Merchant;
use crate::state::payment::{Payment, PaymentStatus};

use crate::errors::PaymentError;
use anchor_spl::token::{Transfer, transfer, Mint, TokenAccount, Token};
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
#[instruction()]
pub struct RefundPayment<'info> {
    /// The merchant authority who can initiate refunds
    #[account(mut)]
    pub merchant_authority: Signer<'info>,
    
    #[account(
        seeds = [Platform::SEED],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, Platform>,
    
    #[account(
        mut,
        seeds = [Payment::SEED, payment_account.payment_id.as_bytes()],
        bump = payment_account.bump,
        constraint = payment_account.status == PaymentStatus::Completed @ PaymentError::PaymentAlreadyRefunded,
        constraint = payment_account.merchant == merchant_account.key() @ PaymentError::RefundNotAuthorized,
    )]
    pub payment_account: Account<'info, Payment>,
    
    #[account(
        mut,
        seeds = [b"merchant", merchant_account.merchant_id.as_bytes()],
        bump = merchant_account.bump,
        constraint = merchant_account.authority == merchant_authority.key() @ PaymentError::RefundNotAuthorized,
    )]
    pub merchant_account: Account<'info, Merchant>,
    
    /// CHECK: The original customer who made the payment
    #[account(
        constraint = customer.key() == payment_account.customer @ PaymentError::RefundNotAuthorized
    )]
    pub customer: UncheckedAccount<'info>,
    
    #[account(
        constraint = usdc_mint.key() == platform_config.usdc_mint @ PaymentError::InvalidTokenMint
    )]
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = customer,
    )]
    pub customer_usdc: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = merchant_account.settlement_wallet,
    )]
    pub merchant_usdc: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [Platform::TREASURY_SEED],
        bump = platform_config.treasury_bump,
        token::mint = usdc_mint,
        token::authority = platform_config,
    )]
    pub platform_treasury_usdc: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> RefundPayment<'info> {
    pub fn refund(&mut self) -> Result<()> {
        let merchant_amount = self.payment_account.merchant_amount;
        let fee_amount = self.payment_account.fee_amount;
        
        // Transfer merchant amount back to customer
        let transfer_merchant_accounts = Transfer {
            from: self.merchant_usdc.to_account_info(),
            to: self.customer_usdc.to_account_info(),
            authority: self.merchant_authority.to_account_info(),
        };
        let transfer_merchant_ctx = CpiContext::new(
            self.token_program.to_account_info(),
            transfer_merchant_accounts,
        );
        transfer(transfer_merchant_ctx, merchant_amount)?;
        
        // Transfer fee back from treasury to customer (requires PDA signer)
        let seeds = &[Platform::SEED, &[self.platform_config.bump]];
        let signer = &[&seeds[..]];
        
        let transfer_fee_accounts = Transfer {
            from: self.platform_treasury_usdc.to_account_info(),
            to: self.customer_usdc.to_account_info(),
            authority: self.platform_config.to_account_info(),
        };
        let transfer_fee_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_fee_accounts,
            signer,
        );
        transfer(transfer_fee_ctx, fee_amount)?;
        
        // Update payment status
        self.payment_account.status = PaymentStatus::Refunded;
        self.payment_account.refunded_at = Some(Clock::get()?.unix_timestamp);
        
        // Update merchant stats
        self.merchant_account.transaction_count = self.merchant_account
            .transaction_count
            .saturating_sub(1);
        self.merchant_account.volume = self.merchant_account
            .volume
            .saturating_sub(merchant_amount);
        self.merchant_account.total_fees = self.merchant_account
            .total_fees
            .saturating_sub(fee_amount);
        
        msg!(
            "Payment {} refunded: {} USDC to customer {}",
            self.payment_account.payment_id,
            self.payment_account.amount,
            self.payment_account.customer
        );
        
        Ok(())
    }
}

pub fn handler(ctx: Context<RefundPayment>) -> Result<()> {
    ctx.accounts.refund()
}