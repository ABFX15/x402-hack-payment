use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Customer {
    pub customer: Pubkey,
    pub total_spent: u64,
    pub transaction_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

