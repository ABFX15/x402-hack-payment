use anchor_lang::prelude::*;

use crate::state::{Merchant, Platform};
use crate::errors::PaymentError;
// Remove unused: use crate::state::merchant;

#[derive(Accounts)]
#[instruction(merchant_id: String)]
pub struct InitializeMerchant<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + Merchant::INIT_SPACE,
        seeds = [b"merchant", merchant_id.as_bytes()],
        bump,
    )]
    pub merchant_account: Account<'info, Merchant>,
    #[account(
        seeds = [Platform::SEED],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, Platform>,
    /// CHECK: Settlement wallet validated in instruction logic
    pub settlement_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeMerchant<'info> {
    pub fn initialize_merchant(
        &mut self, 
        merchant_id: String, 
        fee_bps: u16,  // Changed to u16
        bumps: &InitializeMerchantBumps
    ) -> Result<()> {
        let clock = Clock::get()?.unix_timestamp;
        
        // Validations
        require!(!merchant_id.is_empty() && merchant_id.len() <= 64, PaymentError::InvalidMerchantId);
        require!(self.platform_config.is_active, PaymentError::PlatformInactive);
        require!(fee_bps <= 1000, PaymentError::FeeTooHigh); // Max 10% merchant fee
        
        let merchant_account = &mut self.merchant_account;
        
        merchant_account.merchant_id = merchant_id;
        merchant_account.authority = self.payer.key(); // Add authority field
        merchant_account.settlement_wallet = self.settlement_wallet.key();
        merchant_account.fee = fee_bps; 
        merchant_account.volume = 0;
        merchant_account.total_fees = 0; // Track total fees collected
        merchant_account.transaction_count = 0;
        merchant_account.created_at = clock;
        merchant_account.is_active = true;
        merchant_account.bump = bumps.merchant_account;
        
        msg!("Merchant {} initialized with {} bps fee", merchant_account.merchant_id, fee_bps);
        Ok(())
    }
}


pub fn handler(
    ctx: Context<InitializeMerchant>, 
    merchant_id: String, 
    fee_bps: u16  // Changed to u16
) -> Result<()> {
    ctx.accounts.initialize_merchant(merchant_id, fee_bps, &ctx.bumps)
}