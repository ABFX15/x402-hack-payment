use anchor_lang::prelude::*;

pub mod instructions;
pub mod errors;
pub mod state;

use instructions::*;


declare_id!("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

#[program]
pub mod x402_hack_payment {
    use super::*;

    pub fn set_platform_config(ctx: Context<InitializePlatform>, fee_bps: u64, min_payment_amount: u64) -> Result<()> {
        instructions::platform::handler(ctx, fee_bps, min_payment_amount)
    }

    pub fn initialize_merchant(ctx: Context<InitializeMerchant>, merchant_id: String, fee_bps: u16) -> Result<()> {
        instructions::initialize::handler(ctx, merchant_id, fee_bps)
    }

    pub fn process_payment(ctx: Context<ProcessPayment>, payment_id: String, amount: u64) -> Result<()> {
        instructions::payment::handler(ctx, payment_id, amount)
    }

    pub fn claim_platform_fees(ctx: Context<ClaimPlatformFees>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    pub fn refund_payment(ctx: Context<RefundPayment>) -> Result<()> {
        instructions::refund::handler(ctx)
    }
}


