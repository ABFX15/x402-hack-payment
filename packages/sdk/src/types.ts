import { PublicKey } from '@solana/web3.js';
import type { SupportedNetwork, SupportedToken } from './constants';

/**
 * Payment status
 */
export type PaymentStatus =
    | 'pending'      // Payment link created, awaiting payment
    | 'processing'   // Transaction submitted, awaiting confirmation
    | 'completed'    // Payment confirmed on-chain
    | 'failed'       // Payment failed
    | 'expired'      // Payment link expired
    | 'refunded';    // Payment was refunded

/**
 * Options for creating a payment
 */
export interface CreatePaymentOptions {
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
export interface Payment {
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
export interface PaymentResult {
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
export interface MerchantConfig {
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
export interface TransactionOptions {
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
export type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due' | 'expired';

/**
 * Subscription plan
 */
export interface SubscriptionPlan {
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
export interface CreateSubscriptionOptions {
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
export interface Subscription {
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
export type WebhookEventType =
    | 'payment.created'
    | 'payment.completed'
    | 'payment.failed'
    | 'payment.expired'
    | 'payment.refunded'
    | 'subscription.created'
    | 'subscription.renewed'
    | 'subscription.cancelled'
    | 'subscription.expired';

/**
 * Webhook payload
 */
export interface WebhookPayload {
    id: string;
    type: WebhookEventType;
    payment: Payment;
    timestamp: string;
    signature: string;
}
