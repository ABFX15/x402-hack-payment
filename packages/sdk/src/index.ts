/**
 * @settlr/sdk
 * Solana USDC payments in 7 lines of code
 */

// Core client
export { Settlr, type SettlrConfig } from './client';

// Types
export type {
    CreatePaymentOptions,
    Payment,
    PaymentStatus,
    PaymentResult,
    MerchantConfig,
    TransactionOptions,
    WebhookEventType,
    WebhookPayload,
    // Subscription types
    SubscriptionInterval,
    SubscriptionStatus,
    SubscriptionPlan,
    Subscription,
    CreateSubscriptionOptions,
} from './types';

// Constants
export {
    USDC_MINT_DEVNET,
    USDC_MINT_MAINNET,
    USDT_MINT_DEVNET,
    USDT_MINT_MAINNET,
    SUPPORTED_TOKENS,
    SETTLR_CHECKOUT_URL,
    SUPPORTED_NETWORKS,
    getTokenMint,
    getTokenDecimals,
    type SupportedToken,
} from './constants';

// Utilities
export { formatUSDC, parseUSDC, shortenAddress } from './utils';

// React hook and provider
export { useSettlr, SettlrProvider } from './react';

// React components
export {
    BuyButton,
    CheckoutWidget,
    PaymentModal,
    usePaymentLink,
    usePaymentModal,
    type BuyButtonProps,
    type CheckoutWidgetProps,
    type PaymentModalProps,
} from './components';

// Webhooks
export {
    createWebhookHandler,
    verifyWebhookSignature,
    parseWebhookPayload,
    type WebhookHandler,
    type WebhookHandlers,
} from './webhooks';

// Privacy (Inco Lightning FHE encryption)
export {
    INCO_LIGHTNING_PROGRAM_ID,
    SETTLR_PROGRAM_ID,
    findAllowancePda,
    findPrivateReceiptPda,
    encryptAmount,
    buildPrivateReceiptAccounts,
    simulateAndGetHandle,
    buildAllowanceRemainingAccounts,
    PrivacyFeatures,
    type PrivateReceiptConfig,
    type IssuePrivateReceiptResult,
} from './privacy';

// One-Click Payments
export {
    OneClickClient,
    createOneClickClient,
    type SpendingApproval,
    type ApproveOneClickOptions,
    type ChargeOneClickOptions,
    type OneClickResult,
} from './one-click';
