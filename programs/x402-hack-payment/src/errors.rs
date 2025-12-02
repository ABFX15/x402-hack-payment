use anchor_lang::prelude::*;

#[error_code]
pub enum PaymentError {
    #[msg("The provided fee basis points are invalid.")]
    InvalidFeeBps,
    #[msg("The provided minimum payment amount is invalid.")]
    InvalidMinPaymentAmount,
    #[msg("The provided USDC mint is invalid.")]
    InvalidUsdcMint,
    #[msg("The provided merchant ID is invalid.")]
    InvalidMerchantId,
    #[msg("The platform is currently inactive.")]
    PlatformInactive,
    #[msg("Fees too high.")]
    FeeTooHigh,
    #[msg("Invalid token mint.")]
    InvalidTokenMint,
    #[msg("Calculation error.")]
    CalculationError,
    #[msg("Payment below minimum amount.")]
    PaymentBelowMinimum,
    #[msg("Merchant is inactive")]
    MerchantInactive,
    #[msg("Unauthorized action.")]
    Unauthorized,
    #[msg("No fees available to claim.")]
    NoFeesToClaim,
    #[msg("Invalid payment ID.")]
    InvalidPaymentId,
    #[msg("Payment has already been refunded.")]
    PaymentAlreadyRefunded,
    #[msg("Refund not authorized.")]
    RefundNotAuthorized,
}