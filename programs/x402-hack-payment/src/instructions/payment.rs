use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token, Transfer, transfer};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::Platform;
use crate::state::merchant::Merchant;
use crate::state::customer::Customer;
use crate::state::payment::{Payment, PaymentStatus};
use crate::errors::PaymentError;

#[derive(Accounts)]
#[instruction(payment_id: String)]
pub struct ProcessPayment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [Platform::SEED],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, Platform>,
    #[account(
        init,
        payer = payer,
        space = 8 + Payment::INIT_SPACE,
        seeds = [Payment::SEED, payment_id.as_bytes()],
        bump,
    )]
    pub payment_account: Account<'info, Payment>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + Customer::INIT_SPACE,
        seeds = [b"customer", payer.key().as_ref()],
        bump,
    )]
    pub customer_account: Account<'info, Customer>,
    #[account(
        mut,
        seeds = [b"merchant", merchant_account.merchant_id.as_bytes()],
        bump = merchant_account.bump,
    )]
    pub merchant_account: Account<'info, Merchant>,
    #[account(
        constraint = usdc_mint.key() == platform_config.usdc_mint @ PaymentError::InvalidTokenMint
    )]
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = payer,
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

impl<'info> ProcessPayment<'info> {
    pub fn process_payment(&mut self, payment_id: String, amount: u64, bumps: &ProcessPaymentBumps) -> Result<()> {
        require!(self.platform_config.is_active, PaymentError::PlatformInactive);
        require!(self.merchant_account.is_active, PaymentError::MerchantInactive);
        require!(amount >= self.platform_config.min_payment_amount, PaymentError::PaymentBelowMinimum);
        require!(!payment_id.is_empty() && payment_id.len() <= 64, PaymentError::InvalidPaymentId);

        // Calculate fee and merchant amount
        let fee = amount
            .checked_mul(self.platform_config.fee_bps as u64)
            .ok_or(PaymentError::CalculationError)?
            .checked_div(10_000)
            .ok_or(PaymentError::CalculationError)?;

        let merchant_amount = amount
            .checked_sub(fee)
            .ok_or(PaymentError::CalculationError)?;

        // Initialize customer account if this is their first payment
        if self.customer_account.transaction_count == 0 {
            self.customer_account.customer = self.payer.key();
            self.customer_account.total_spent = 0;
            self.customer_account.transaction_count = 0;
            self.customer_account.created_at = Clock::get()?.unix_timestamp;
            self.customer_account.bump = bumps.customer_account;
        }

        // Transfer merchant amount from customer to merchant
        let transfer_to_merchant_accounts = Transfer {
            from: self.customer_usdc.to_account_info(),
            to: self.merchant_usdc.to_account_info(),
            authority: self.payer.to_account_info(),
        };
        let transfer_to_merchant_ctx = CpiContext::new(
            self.token_program.to_account_info(),
            transfer_to_merchant_accounts,
        );
        transfer(transfer_to_merchant_ctx, merchant_amount)?;

        // Transfer fee from customer to platform treasury
        let transfer_fee_accounts = Transfer {
            from: self.customer_usdc.to_account_info(),
            to: self.platform_treasury_usdc.to_account_info(),
            authority: self.payer.to_account_info(),
        };
        let transfer_fee_ctx = CpiContext::new(
            self.token_program.to_account_info(),
            transfer_fee_accounts,
        );
        transfer(transfer_fee_ctx, fee)?;

        // Update customer stats
        self.customer_account.transaction_count = self.customer_account
            .transaction_count
            .checked_add(1)
            .ok_or(PaymentError::CalculationError)?;
        
        self.customer_account.total_spent = self.customer_account
            .total_spent
            .checked_add(amount)
            .ok_or(PaymentError::CalculationError)?;

        // Update merchant stats
        self.merchant_account.transaction_count = self.merchant_account
            .transaction_count
            .checked_add(1)
            .ok_or(PaymentError::CalculationError)?;
        
        self.merchant_account.volume = self.merchant_account
            .volume
            .checked_add(merchant_amount)
            .ok_or(PaymentError::CalculationError)?;

        self.merchant_account.total_fees = self.merchant_account
            .total_fees
            .checked_add(fee)
            .ok_or(PaymentError::CalculationError)?;

        // Create payment record
        self.payment_account.payment_id = payment_id.clone();
        self.payment_account.customer = self.payer.key();
        self.payment_account.merchant = self.merchant_account.key();
        self.payment_account.amount = amount;
        self.payment_account.fee_amount = fee;
        self.payment_account.merchant_amount = merchant_amount;
        self.payment_account.status = PaymentStatus::Completed;
        self.payment_account.created_at = Clock::get()?.unix_timestamp;
        self.payment_account.refunded_at = None;
        self.payment_account.bump = bumps.payment_account;

        msg!(
            "Payment {} processed: {} USDC to merchant {}, {} USDC fee to platform",
            payment_id,
            merchant_amount,
            self.merchant_account.merchant_id,
            fee
        );

        Ok(())
    }
}

pub fn handler(
    ctx: Context<ProcessPayment>, 
    payment_id: String,
    amount: u64
) -> Result<()> {
    ctx.accounts.process_payment(payment_id, amount, &ctx.bumps)
}