use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};

use crate::state::platform::Platform;
use crate::errors::PaymentError;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init, 
        payer = authority,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform_config"],
        bump,
    )]
    pub platform_config: Account<'info, Platform>,

    pub usdc_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = platform_config,
        seeds = [b"platform_treasury".as_ref()],
        bump,
    )]
    pub platform_treasury: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializePlatform<'info> {
    pub fn set_platform_config(&mut self, fee_bps: u64, min_payment_amount: u64, platform_bump: u8, treasury_bump: u8) -> Result<()> {
        require!(fee_bps <= 1000, PaymentError::InvalidFeeBps);
        require!(min_payment_amount > 0, PaymentError::InvalidMinPaymentAmount);
        require!(self.usdc_mint.decimals == 6, PaymentError::InvalidUsdcMint);

        self.platform_config.authority = self.authority.key();
        self.platform_config.treasury = self.platform_treasury.key();
        self.platform_config.usdc_mint = self.usdc_mint.key();
        self.platform_config.fee_bps = fee_bps;
        self.platform_config.min_payment_amount = min_payment_amount;
        self.platform_config.is_active = true;
        self.platform_config.bump = platform_bump;
        self.platform_config.treasury_bump = treasury_bump;

        msg!("Platform initialized successfully with fee {}", fee_bps);
        msg!("Minimum payment amount set to {}", min_payment_amount);
        msg!("USDC mint set to {}", self.usdc_mint.key());
        msg!("Treasury token account created at {}", self.platform_treasury.key());
        
        Ok(())
    } 
}

pub fn handler(ctx: Context<InitializePlatform>, fee_bps: u64, min_payment_amount: u64) -> Result<()> {
    let platform_bump = ctx.bumps.platform_config;
    let treasury_bump = ctx.bumps.platform_treasury;
    ctx.accounts.set_platform_config(fee_bps, min_payment_amount, platform_bump, treasury_bump)
}
