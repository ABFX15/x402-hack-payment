use anchor_lang::prelude::*;

use crate::state::platform::Platform;
use crate::errors::PaymentError;
use anchor_spl::token::{Transfer, transfer};

#[derive(Accounts)]
pub struct ClaimPlatformFees<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"platform_config"],
        bump = platform_config.bump,
        has_one = authority @ PaymentError::Unauthorized,
    )]
    pub platform_config: Account<'info, Platform>,

    #[account(
        mut,
        seeds = [Platform::TREASURY_SEED],
        bump = platform_config.treasury_bump,
        token::mint = usdc_mint,
        token::authority = platform_config,
    )]
    pub platform_treasury_usdc: Account<'info, anchor_spl::token::TokenAccount>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = authority,
    )]
    pub authority_usdc: Account<'info, anchor_spl::token::TokenAccount>,

    pub usdc_mint: Account<'info, anchor_spl::token::Mint>,

    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
}

impl<'info> ClaimPlatformFees<'info> {
    pub fn claim_platform_fees(&mut self) -> Result<()> {
        let treasury_balance = self.platform_treasury_usdc.amount;
        require!(treasury_balance > 0, PaymentError::NoFeesToClaim);

        let cpi_accounts = Transfer {
            from: self.platform_treasury_usdc.to_account_info(),
            to: self.authority_usdc.to_account_info(),
            authority: self.platform_config.to_account_info(),
        };

        let seeds = &[Platform::TREASURY_SEED, &[self.platform_config.treasury_bump]];
        let signer = &[&seeds[..]];

        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        transfer(cpi_ctx, treasury_balance)?;
        msg!("Claimed {} USDC fees to {}", treasury_balance, self.authority.key());

        Ok(())
    }
}

pub fn handler(ctx: Context<ClaimPlatformFees>) -> Result<()> {
    ctx.accounts.claim_platform_fees()
}