/**
 * Gasless Transaction Sponsorship
 * 
 * Re-exports from the Kora integration for backwards compatibility.
 * See kora.ts for the full implementation.
 */

export {
    // Client
    getKoraClient,
    isKoraEnabled as isGaslessEnabled,

    // Core functions
    getKoraSigner,
    getSupportedTokens,
    getBlockhash,
    estimateTransactionFee,
    getPaymentInstruction,
    createGaslessTransfer,
    signWithKora,
    signAndSendWithKora,

    // Helpers
    serializeTransaction,
    serializeVersionedTransaction,

    // High-level checkout
    processGaslessPayment,

    // Types
    type KoraConfig,
    type KoraSignerInfo,
    type KoraFeeEstimate,
    type KoraSponsorResult,
} from "./kora";

