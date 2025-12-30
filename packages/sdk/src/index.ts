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
} from './types';

// Constants
export {
    USDC_MINT_DEVNET,
    USDC_MINT_MAINNET,
    SETTLR_CHECKOUT_URL,
    SUPPORTED_NETWORKS,
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
