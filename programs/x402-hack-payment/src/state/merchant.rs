use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Merchant {
    #[max_len(200)]
    pub merchant_id: String,
    pub authority: Pubkey,
    pub settlement_wallet: Pubkey,
    pub fee: u16,
    pub volume: u64,
    pub total_fees: u64,
    pub transaction_count: u64,
    pub created_at: i64,
    pub is_active: bool,
    pub bump: u8,
}