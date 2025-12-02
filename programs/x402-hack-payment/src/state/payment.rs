use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Payment {
    #[max_len(64)]
    pub payment_id: String,
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub fee_amount: u64,
    pub merchant_amount: u64,
    pub status: PaymentStatus,
    pub created_at: i64,
    pub refunded_at: Option<i64>,
    pub bump: u8,
}

impl Payment {
    pub const SEED: &'static [u8] = b"payment";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PaymentStatus {
    Completed,
    Refunded,
}
