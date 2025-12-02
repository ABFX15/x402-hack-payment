use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub usdc_mint: Pubkey,
    pub min_payment_amount: u64,
    pub fee_bps: u64,
    pub is_active: bool,
    pub bump: u8,
    pub treasury_bump: u8,
}

impl Platform {
    pub const SEED: &'static [u8] = b"platform_config";
    pub const TREASURY_SEED: &'static [u8] = b"platform_treasury";
}
