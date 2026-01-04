import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, CSSProperties } from 'react';

declare const USDC_MINT_DEVNET: PublicKey;
declare const USDC_MINT_MAINNET: PublicKey;
declare const USDT_MINT_DEVNET: PublicKey;
declare const USDT_MINT_MAINNET: PublicKey;
declare const SUPPORTED_TOKENS: {
    readonly USDC: {
        readonly symbol: "USDC";
        readonly name: "USD Coin";
        readonly decimals: 6;
        readonly mint: {
            readonly devnet: PublicKey;
            readonly 'mainnet-beta': PublicKey;
        };
        readonly logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png";
    };
    readonly USDT: {
        readonly symbol: "USDT";
        readonly name: "Tether USD";
        readonly decimals: 6;
        readonly mint: {
            readonly devnet: PublicKey;
            readonly 'mainnet-beta': PublicKey;
        };
        readonly logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg";
    };
};
type SupportedToken = keyof typeof SUPPORTED_TOKENS;
declare const SETTLR_CHECKOUT_URL: {
    readonly production: "https://settlr.dev/checkout";
    readonly development: "http://localhost:3000/checkout";
};
declare const SUPPORTED_NETWORKS: readonly ["devnet", "mainnet-beta"];
type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];
/**
 * Get token mint address for a specific network
 */
declare function getTokenMint(token: SupportedToken, network: SupportedNetwork): PublicKey;
/**
 * Get token decimals
 */
declare function getTokenDecimals(token: SupportedToken): number;

/**
 * Payment status
 */
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'refunded';
/**
 * Options for creating a payment
 */
interface CreatePaymentOptions {
    /** Amount in stablecoin (e.g., 29.99) */
    amount: number;
    /** Token to accept (default: USDC) */
    token?: SupportedToken;
    /** Optional memo/description for the payment */
    memo?: string;
    /** Optional order/invoice ID for your records */
    orderId?: string;
    /** Optional metadata to attach to the payment */
    metadata?: Record<string, string>;
    /** URL to redirect after successful payment */
    successUrl?: string;
    /** URL to redirect after cancelled payment */
    cancelUrl?: string;
    /** Expiration time in seconds (default: 3600 = 1 hour) */
    expiresIn?: number;
}
/**
 * Payment object returned after creation
 */
interface Payment {
    /** Unique payment ID */
    id: string;
    /** Amount in stablecoin */
    amount: number;
    /** Token used for payment */
    token: SupportedToken;
    /** Amount in lamports (USDC atomic units) */
    amountLamports: bigint;
    /** Current status */
    status: PaymentStatus;
    /** Merchant wallet address */
    merchantAddress: string;
    /** Checkout URL for the customer */
    checkoutUrl: string;
    /** QR code data URL (base64 PNG) */
    qrCode: string;
    /** Memo/description */
    memo?: string;
    /** Order ID */
    orderId?: string;
    /** Custom metadata */
    metadata?: Record<string, string>;
    /** Creation timestamp */
    createdAt: Date;
    /** Expiration timestamp */
    expiresAt: Date;
    /** Transaction signature (when completed) */
    txSignature?: string;
    /** Payer wallet address (when completed) */
    payerAddress?: string;
}
/**
 * Result of a direct payment (not via checkout link)
 */
interface PaymentResult {
    /** Whether the payment succeeded */
    success: boolean;
    /** Transaction signature */
    signature: string;
    /** Amount paid in USDC */
    amount: number;
    /** Merchant address */
    merchantAddress: string;
    /** Block time of confirmation */
    blockTime?: number;
    /** Error message if failed */
    error?: string;
}
/**
 * Merchant configuration
 */
interface MerchantConfig {
    /** Merchant display name */
    name: string;
    /** Merchant wallet address (receives payments) */
    walletAddress: string | PublicKey;
    /** Optional logo URL */
    logoUrl?: string;
    /** Optional website URL */
    websiteUrl?: string;
    /** Webhook URL for payment notifications */
    webhookUrl?: string;
    /** Webhook secret for signature verification */
    webhookSecret?: string;
}
/**
 * Transaction options for direct payments
 */
interface TransactionOptions {
    /** Skip preflight simulation */
    skipPreflight?: boolean;
    /** Commitment level */
    commitment?: 'processed' | 'confirmed' | 'finalized';
    /** Max retries */
    maxRetries?: number;
}
/**
 * Subscription interval
 */
type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
/**
 * Subscription status
 */
type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due' | 'expired';
/**
 * Subscription plan
 */
interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    interval: SubscriptionInterval;
    intervalCount: number;
    trialDays?: number;
    features?: string[];
    active: boolean;
}
/**
 * Options for creating a subscription
 */
interface CreateSubscriptionOptions {
    /** The plan ID to subscribe to */
    planId: string;
    /** Customer's wallet address */
    customerWallet: string;
    /** Optional customer email for notifications */
    customerEmail?: string;
    /** Optional metadata */
    metadata?: Record<string, string>;
    /** URL to redirect after successful subscription */
    successUrl?: string;
    /** URL to redirect after cancelled subscription */
    cancelUrl?: string;
}
/**
 * Subscription object
 */
interface Subscription {
    id: string;
    planId: string;
    plan?: SubscriptionPlan;
    customerWallet: string;
    customerEmail?: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
    createdAt: string;
}
/**
 * Webhook event types
 */
type WebhookEventType = 'payment.created' | 'payment.completed' | 'payment.failed' | 'payment.expired' | 'payment.refunded' | 'subscription.created' | 'subscription.renewed' | 'subscription.cancelled' | 'subscription.expired';
/**
 * Webhook payload
 */
interface WebhookPayload {
    id: string;
    type: WebhookEventType;
    payment: Payment;
    timestamp: string;
    signature: string;
}

/**
 * Settlr SDK configuration
 */
interface SettlrConfig {
    /** Settlr API key (required for production) */
    apiKey: string;
    /** Merchant configuration */
    merchant: MerchantConfig;
    /** Network to use (default: devnet) */
    network?: SupportedNetwork;
    /** Custom RPC endpoint */
    rpcEndpoint?: string;
    /** Use testnet/sandbox mode */
    testMode?: boolean;
}
/**
 * Settlr SDK Client
 *
 * @example
 * ```typescript
 * const settlr = new Settlr({
 *   apiKey: 'sk_live_xxxxxxxxxxxx',
 *   merchant: {
 *     name: 'My Store',
 *     walletAddress: 'YOUR_WALLET_ADDRESS',
 *   },
 * });
 *
 * const payment = await settlr.createPayment({
 *   amount: 29.99,
 *   memo: 'Premium subscription',
 * });
 *
 * // Redirect customer to checkout
 * window.location.href = payment.checkoutUrl;
 * ```
 */
declare class Settlr {
    private config;
    private connection;
    private usdcMint;
    private merchantWallet;
    private apiBaseUrl;
    private validated;
    private merchantId?;
    private tier?;
    constructor(config: SettlrConfig);
    /**
     * Validate API key with Settlr backend
     */
    private validateApiKey;
    /**
     * Get the current tier
     */
    getTier(): 'free' | 'pro' | 'enterprise' | undefined;
    /**
     * Get a checkout URL for redirect-based payments
     *
     * This is the simplest integration - just redirect users to this URL.
     * Settlr handles auth (email or wallet) and payment processing.
     *
     * @example
     * ```typescript
     * const url = settlr.getCheckoutUrl({
     *   amount: 29.99,
     *   memo: 'Premium Pack',
     * });
     *
     * // Redirect user to checkout
     * window.location.href = url;
     * ```
     */
    getCheckoutUrl(options: {
        amount: number;
        memo?: string;
        orderId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }): string;
    /**
     * Create a payment link
     *
     * @example
     * ```typescript
     * const payment = await settlr.createPayment({
     *   amount: 29.99,
     *   memo: 'Order #1234',
     *   successUrl: 'https://mystore.com/success',
     * });
     *
     * console.log(payment.checkoutUrl);
     * // https://settlr.dev/pay?amount=29.99&merchant=...
     * ```
     */
    createPayment(options: CreatePaymentOptions): Promise<Payment>;
    /**
     * Build a transaction for direct payment (for wallet integration)
     *
     * @example
     * ```typescript
     * const tx = await settlr.buildTransaction({
     *   payerPublicKey: wallet.publicKey,
     *   amount: 29.99,
     * });
     *
     * const signature = await wallet.sendTransaction(tx, connection);
     * ```
     */
    buildTransaction(options: {
        payerPublicKey: PublicKey;
        amount: number;
        memo?: string;
    }): Promise<Transaction>;
    /**
     * Execute a direct payment (requires wallet adapter)
     *
     * @example
     * ```typescript
     * const result = await settlr.pay({
     *   wallet,
     *   amount: 29.99,
     *   memo: 'Order #1234',
     * });
     *
     * if (result.success) {
     *   console.log('Paid!', result.signature);
     * }
     * ```
     */
    pay(options: {
        wallet: {
            publicKey: PublicKey;
            signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        amount: number;
        memo?: string;
        txOptions?: TransactionOptions;
    }): Promise<PaymentResult>;
    /**
     * Check payment status by transaction signature
     */
    getPaymentStatus(signature: string): Promise<'pending' | 'completed' | 'failed'>;
    /**
     * Create a hosted checkout session (like Stripe Checkout)
     *
     * @example
     * ```typescript
     * const session = await settlr.createCheckoutSession({
     *   amount: 29.99,
     *   description: 'Premium Plan',
     *   successUrl: 'https://mystore.com/success',
     *   cancelUrl: 'https://mystore.com/cancel',
     *   webhookUrl: 'https://mystore.com/api/webhooks/settlr',
     * });
     *
     * // Redirect customer to hosted checkout
     * window.location.href = session.url;
     * ```
     */
    createCheckoutSession(options: {
        amount: number;
        description?: string;
        metadata?: Record<string, string>;
        successUrl: string;
        cancelUrl: string;
        webhookUrl?: string;
    }): Promise<{
        id: string;
        url: string;
        expiresAt: number;
    }>;
    /**
     * Get merchant's USDC balance
     */
    getMerchantBalance(): Promise<number>;
    /**
     * Generate QR code for payment URL
     */
    private generateQRCode;
    /**
     * Get the connection instance
     */
    getConnection(): Connection;
    /**
     * Get merchant wallet address
     */
    getMerchantAddress(): PublicKey;
    /**
     * Get USDC mint address
     */
    getUsdcMint(): PublicKey;
}

/**
 * Format lamports to USDC string
 * @param lamports - Amount in lamports (atomic units)
 * @param decimals - Number of decimal places (default: 2)
 */
declare function formatUSDC(lamports: bigint | number, decimals?: number): string;
/**
 * Parse USDC amount to lamports
 * @param amount - Amount in USDC (e.g., 29.99)
 */
declare function parseUSDC(amount: number | string): bigint;
/**
 * Shorten a Solana address for display
 * @param address - Full address string
 * @param chars - Number of chars to show on each end (default: 4)
 */
declare function shortenAddress(address: string, chars?: number): string;

/**
 * Checkout URL options
 */
interface CheckoutUrlOptions {
    amount: number;
    memo?: string;
    orderId?: string;
    successUrl?: string;
    cancelUrl?: string;
}
/**
 * Settlr context value
 */
interface SettlrContextValue {
    /** Settlr client instance */
    settlr: Settlr | null;
    /** Whether user is authenticated */
    authenticated: boolean;
    /** Create a payment link (redirect flow) */
    createPayment: (options: CreatePaymentOptions) => Promise<Payment>;
    /** Generate checkout URL for redirect */
    getCheckoutUrl: (options: CheckoutUrlOptions) => string;
    /** Get merchant's USDC balance */
    getBalance: () => Promise<number>;
}
/**
 * Settlr Provider Props
 */
interface SettlrProviderProps {
    children: ReactNode;
    config: SettlrConfig;
    /** Whether user is authenticated (from Privy or other auth) */
    authenticated?: boolean;
}
/**
 * Settlr Provider - Wraps your app to provide Settlr functionality
 *
 * Works with Privy authentication - just pass the authenticated state.
 *
 * @example
 * ```tsx
 * import { SettlrProvider } from '@settlr/sdk';
 * import { usePrivy } from '@privy-io/react-auth';
 *
 * function App() {
 *   const { authenticated } = usePrivy();
 *
 *   return (
 *     <SettlrProvider
 *       authenticated={authenticated}
 *       config={{
 *         apiKey: 'sk_live_xxxxxxxxxxxx',
 *         merchant: {
 *           name: 'My Game',
 *           walletAddress: 'YOUR_WALLET',
 *         },
 *       }}
 *     >
 *       <YourApp />
 *     </SettlrProvider>
 *   );
 * }
 * ```
 */
declare function SettlrProvider({ children, config, authenticated, }: SettlrProviderProps): react_jsx_runtime.JSX.Element;
/**
 * useSettlr hook - Access Settlr functionality in your components
 *
 * @example
 * ```tsx
 * import { useSettlr } from '@settlr/sdk';
 *
 * function CheckoutButton() {
 *   const { getCheckoutUrl, authenticated } = useSettlr();
 *
 *   const handleCheckout = () => {
 *     // Redirect to Settlr checkout (handles Privy auth internally)
 *     const url = getCheckoutUrl({ amount: 29.99, memo: 'Premium Pack' });
 *     window.location.href = url;
 *   };
 *
 *   return (
 *     <button onClick={handleCheckout}>
 *       Buy Premium Pack - $29.99
 *     </button>
 *   );
 * }
 * ```
 */
declare function useSettlr(): SettlrContextValue;

/**
 * Settlr Buy Button - Drop-in payment button component
 *
 * @example
 * ```tsx
 * import { BuyButton } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   return (
 *     <BuyButton
 *       amount={49.99}
 *       memo="Premium Game Bundle"
 *       onSuccess={(result) => {
 *         console.log('Payment successful!', result.signature);
 *         // Redirect to success page or unlock content
 *       }}
 *       onError={(error) => console.error(error)}
 *     >
 *       Buy Now - $49.99
 *     </BuyButton>
 *   );
 * }
 * ```
 */
interface BuyButtonProps {
    /** Payment amount in USDC */
    amount: number;
    /** Optional memo/description */
    memo?: string;
    /** Optional order ID for your records */
    orderId?: string;
    /** Button text/content (default: "Pay ${amount}") */
    children?: ReactNode;
    /** Called when payment succeeds */
    onSuccess?: (result: {
        signature: string;
        amount: number;
        merchantAddress: string;
    }) => void;
    /** Called when payment fails */
    onError?: (error: Error) => void;
    /** Called when payment starts processing */
    onProcessing?: () => void;
    /** Use redirect flow instead of direct payment */
    useRedirect?: boolean;
    /** Success URL for redirect flow */
    successUrl?: string;
    /** Cancel URL for redirect flow */
    cancelUrl?: string;
    /** Custom class name */
    className?: string;
    /** Custom styles */
    style?: CSSProperties;
    /** Disabled state */
    disabled?: boolean;
    /** Button variant */
    variant?: "primary" | "secondary" | "outline";
    /** Button size */
    size?: "sm" | "md" | "lg";
}
declare function BuyButton({ amount, memo, orderId, children, onSuccess, onError, onProcessing, useRedirect, // Default to redirect flow (works with Privy)
successUrl, cancelUrl, className, style, disabled, variant, size, }: BuyButtonProps): react_jsx_runtime.JSX.Element;
/**
 * Checkout Widget - Embeddable checkout form
 *
 * @example
 * ```tsx
 * import { CheckoutWidget } from '@settlr/sdk';
 *
 * function CheckoutPage() {
 *   return (
 *     <CheckoutWidget
 *       amount={149.99}
 *       productName="Annual Subscription"
 *       productDescription="Full access to all premium features"
 *       onSuccess={(result) => {
 *         router.push('/success');
 *       }}
 *     />
 *   );
 * }
 * ```
 */
interface CheckoutWidgetProps {
    /** Payment amount in USDC */
    amount: number;
    /** Product/service name */
    productName: string;
    /** Optional description */
    productDescription?: string;
    /** Optional product image URL */
    productImage?: string;
    /** Merchant name (from config if not provided) */
    merchantName?: string;
    /** Optional memo for the transaction */
    memo?: string;
    /** Optional order ID */
    orderId?: string;
    /** Called when payment succeeds */
    onSuccess?: (result: {
        signature: string;
        amount: number;
        merchantAddress: string;
    }) => void;
    /** Called when payment fails */
    onError?: (error: Error) => void;
    /** Called when user cancels */
    onCancel?: () => void;
    /** Custom class name */
    className?: string;
    /** Custom styles */
    style?: CSSProperties;
    /** Theme */
    theme?: "light" | "dark";
    /** Show powered by Settlr badge */
    showBranding?: boolean;
}
declare function CheckoutWidget({ amount, productName, productDescription, productImage, merchantName, memo, orderId, onSuccess, onError, onCancel, className, style, theme, showBranding, }: CheckoutWidgetProps): react_jsx_runtime.JSX.Element;
/**
 * Payment Link Generator - Create shareable payment links
 *
 * @example
 * ```tsx
 * const { generateLink } = usePaymentLink({
 *   merchantWallet: 'YOUR_WALLET',
 *   merchantName: 'My Store',
 * });
 *
 * const link = generateLink({
 *   amount: 29.99,
 *   memo: 'Order #1234',
 * });
 * // https://settlr.dev/pay?amount=29.99&merchant=My+Store&to=YOUR_WALLET&memo=Order+%231234
 * ```
 */
declare function usePaymentLink(config: {
    merchantWallet: string;
    merchantName: string;
    baseUrl?: string;
}): {
    generateLink: (options: {
        amount: number;
        memo?: string;
        orderId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) => string;
    generateQRCode: (options: Parameters<(options: {
        amount: number;
        memo?: string;
        orderId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) => string>[0]) => Promise<string>;
};
/**
 * Payment Modal - Iframe-based checkout that keeps users on your site
 *
 * @example
 * ```tsx
 * import { PaymentModal } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   const [showPayment, setShowPayment] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowPayment(true)}>
 *         Buy Now - $49.99
 *       </button>
 *
 *       {showPayment && (
 *         <PaymentModal
 *           amount={49.99}
 *           merchantName="Arena GG"
 *           merchantWallet="YOUR_WALLET_ADDRESS"
 *           memo="Tournament Entry"
 *           onSuccess={(result) => {
 *             console.log('Paid!', result.signature);
 *             setShowPayment(false);
 *           }}
 *           onClose={() => setShowPayment(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
interface PaymentModalProps {
    /** Payment amount in USDC */
    amount: number;
    /** Merchant display name */
    merchantName: string;
    /** Merchant wallet address */
    merchantWallet: string;
    /** Optional memo/description */
    memo?: string;
    /** Optional order ID */
    orderId?: string;
    /** Called when payment succeeds */
    onSuccess?: (result: {
        signature: string;
        amount: number;
    }) => void;
    /** Called when modal is closed */
    onClose?: () => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Checkout base URL (default: https://settlr.dev/checkout) */
    checkoutUrl?: string;
}
declare function PaymentModal({ amount, merchantName, merchantWallet, memo, orderId, onSuccess, onClose, onError, checkoutUrl, }: PaymentModalProps): react_jsx_runtime.JSX.Element;
/**
 * Hook to open payment modal programmatically
 *
 * @example
 * ```tsx
 * import { usePaymentModal } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   const { openPayment, PaymentModalComponent } = usePaymentModal({
 *     merchantName: "Arena GG",
 *     merchantWallet: "YOUR_WALLET",
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={() => openPayment({
 *         amount: 49.99,
 *         memo: "Tournament Entry",
 *         onSuccess: (result) => console.log("Paid!", result),
 *       })}>
 *         Buy Now
 *       </button>
 *       <PaymentModalComponent />
 *     </>
 *   );
 * }
 * ```
 */
declare function usePaymentModal(config: {
    merchantName: string;
    merchantWallet: string;
    checkoutUrl?: string;
}): {
    openPayment: (options: {
        amount: number;
        memo?: string;
        orderId?: string;
        onSuccess?: (result: {
            signature: string;
            amount: number;
        }) => void;
        onError?: (error: Error) => void;
    }) => void;
    closePayment: () => void;
    isOpen: boolean;
    PaymentModalComponent: () => react_jsx_runtime.JSX.Element | null;
};

/**
 * Verify a webhook signature
 * @param payload - The raw request body (string)
 * @param signature - The signature from the X-Settlr-Signature header
 * @param secret - Your webhook secret
 * @returns Whether the signature is valid
 */
declare function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
/**
 * Parse and verify a webhook payload
 * @param rawBody - The raw request body
 * @param signature - The signature from headers
 * @param secret - Your webhook secret
 * @returns The parsed and verified payload
 * @throws Error if signature is invalid
 */
declare function parseWebhookPayload(rawBody: string, signature: string, secret: string): WebhookPayload;
/**
 * Webhook event handler type
 */
type WebhookHandler = (event: WebhookPayload) => Promise<void> | void;
/**
 * Webhook event handlers map
 */
interface WebhookHandlers {
    'payment.created'?: WebhookHandler;
    'payment.completed'?: WebhookHandler;
    'payment.failed'?: WebhookHandler;
    'payment.expired'?: WebhookHandler;
    'payment.refunded'?: WebhookHandler;
    'subscription.created'?: WebhookHandler;
    'subscription.renewed'?: WebhookHandler;
    'subscription.cancelled'?: WebhookHandler;
    'subscription.expired'?: WebhookHandler;
}
/**
 * Create a webhook handler middleware
 *
 * @example Express.js
 * ```typescript
 * import express from 'express';
 * import { createWebhookHandler } from '@settlr/sdk/webhooks';
 *
 * const app = express();
 *
 * app.post('/webhooks/settlr',
 *   express.raw({ type: 'application/json' }),
 *   createWebhookHandler({
 *     secret: process.env.SETTLR_WEBHOOK_SECRET!,
 *     handlers: {
 *       'payment.completed': async (event) => {
 *         console.log('Payment completed:', event.payment.id);
 *         await fulfillOrder(event.payment.orderId);
 *       },
 *       'payment.failed': async (event) => {
 *         console.log('Payment failed:', event.payment.id);
 *         await notifyCustomer(event.payment.orderId);
 *       },
 *     },
 *   })
 * );
 * ```
 *
 * @example Next.js API Route
 * ```typescript
 * // pages/api/webhooks/settlr.ts
 * import { createWebhookHandler } from '@settlr/sdk/webhooks';
 *
 * export const config = { api: { bodyParser: false } };
 *
 * export default createWebhookHandler({
 *   secret: process.env.SETTLR_WEBHOOK_SECRET!,
 *   handlers: {
 *     'payment.completed': async (event) => {
 *       await fulfillOrder(event.payment.orderId);
 *     },
 *   },
 * });
 * ```
 */
declare function createWebhookHandler(options: {
    secret: string;
    handlers: WebhookHandlers;
    onError?: (error: Error) => void;
}): (req: any, res: any) => Promise<void>;

export { BuyButton, type BuyButtonProps, CheckoutWidget, type CheckoutWidgetProps, type CreatePaymentOptions, type CreateSubscriptionOptions, type MerchantConfig, type Payment, PaymentModal, type PaymentModalProps, type PaymentResult, type PaymentStatus, SETTLR_CHECKOUT_URL, SUPPORTED_NETWORKS, SUPPORTED_TOKENS, Settlr, type SettlrConfig, SettlrProvider, type Subscription, type SubscriptionInterval, type SubscriptionPlan, type SubscriptionStatus, type SupportedToken, type TransactionOptions, USDC_MINT_DEVNET, USDC_MINT_MAINNET, USDT_MINT_DEVNET, USDT_MINT_MAINNET, type WebhookEventType, type WebhookHandler, type WebhookHandlers, type WebhookPayload, createWebhookHandler, formatUSDC, getTokenDecimals, getTokenMint, parseUSDC, parseWebhookPayload, shortenAddress, usePaymentLink, usePaymentModal, useSettlr, verifyWebhookSignature };
