import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

declare const USDC_MINT_DEVNET: PublicKey;
declare const USDC_MINT_MAINNET: PublicKey;
declare const SETTLR_CHECKOUT_URL: {
    readonly production: "https://settlr.dev/pay";
    readonly development: "http://localhost:3000/pay";
};
declare const SUPPORTED_NETWORKS: readonly ["devnet", "mainnet-beta"];
type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

/**
 * Payment status
 */
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'refunded';
/**
 * Options for creating a payment
 */
interface CreatePaymentOptions {
    /** Amount in USDC (e.g., 29.99) */
    amount: number;
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
    /** Amount in USDC */
    amount: number;
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
 * Settlr context value
 */
interface SettlrContextValue {
    /** Settlr client instance */
    settlr: Settlr | null;
    /** Whether wallet is connected */
    connected: boolean;
    /** Create a payment link */
    createPayment: (options: CreatePaymentOptions) => Promise<Payment>;
    /** Execute a direct payment */
    pay: (options: {
        amount: number;
        memo?: string;
    }) => Promise<PaymentResult>;
    /** Get merchant's USDC balance */
    getBalance: () => Promise<number>;
}
/**
 * Settlr Provider Props
 */
interface SettlrProviderProps {
    children: ReactNode;
    config: Omit<SettlrConfig, "rpcEndpoint">;
}
/**
 * Settlr Provider - Wraps your app to provide Settlr functionality
 *
 * @example
 * ```tsx
 * import { SettlrProvider } from '@settlr/sdk';
 *
 * function App() {
 *   return (
 *     <WalletProvider wallets={wallets}>
 *       <SettlrProvider config={{
 *         merchant: {
 *           name: 'My Store',
 *           walletAddress: 'YOUR_WALLET',
 *         },
 *       }}>
 *         <YourApp />
 *       </SettlrProvider>
 *     </WalletProvider>
 *   );
 * }
 * ```
 */
declare function SettlrProvider({ children, config }: SettlrProviderProps): react_jsx_runtime.JSX.Element;
/**
 * useSettlr hook - Access Settlr functionality in your components
 *
 * @example
 * ```tsx
 * import { useSettlr } from '@settlr/sdk';
 *
 * function CheckoutButton() {
 *   const { createPayment, pay, connected } = useSettlr();
 *
 *   const handlePay = async () => {
 *     // Option 1: Create payment link
 *     const payment = await createPayment({ amount: 29.99 });
 *     window.location.href = payment.checkoutUrl;
 *
 *     // Option 2: Direct payment
 *     const result = await pay({ amount: 29.99 });
 *     if (result.success) {
 *       console.log('Paid!');
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handlePay} disabled={!connected}>
 *       Pay $29.99
 *     </button>
 *   );
 * }
 * ```
 */
declare function useSettlr(): SettlrContextValue;

export { type CreatePaymentOptions, type MerchantConfig, type Payment, type PaymentResult, type PaymentStatus, SETTLR_CHECKOUT_URL, SUPPORTED_NETWORKS, Settlr, type SettlrConfig, SettlrProvider, type TransactionOptions, USDC_MINT_DEVNET, USDC_MINT_MAINNET, formatUSDC, parseUSDC, shortenAddress, useSettlr };
