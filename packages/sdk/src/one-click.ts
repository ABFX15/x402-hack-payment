/**
 * One-Click Payments Module
 * 
 * Enables frictionless repeat payments for returning customers.
 * Customer approves a spending limit once, merchant can charge without interaction.
 */

export interface SpendingApproval {
    id: string;
    customerWallet: string;
    customerEmail?: string;
    merchantWallet: string;
    spendingLimit: number;
    amountSpent: number;
    remainingLimit: number;
    expiresAt: Date;
    status: 'active' | 'expired' | 'revoked';
    createdAt: Date;
}

export interface ApproveOneClickOptions {
    /** Customer's wallet address */
    customerWallet: string;
    /** Customer's email (optional, for notifications) */
    customerEmail?: string;
    /** Merchant's wallet address */
    merchantWallet: string;
    /** Maximum USDC amount the merchant can charge */
    spendingLimit: number;
    /** Days until approval expires (default: 30) */
    expiresInDays?: number;
}

export interface ChargeOneClickOptions {
    /** Customer's wallet address */
    customerWallet: string;
    /** Merchant's wallet address */
    merchantWallet: string;
    /** Amount to charge in USDC */
    amount: number;
    /** Optional memo for the transaction */
    memo?: string;
}

export interface OneClickResult {
    success: boolean;
    error?: string;
    txSignature?: string;
    remainingLimit?: number;
}

/**
 * One-Click Payment Client
 * 
 * @example
 * ```typescript
 * import { OneClickClient } from '@settlr/sdk';
 * 
 * const oneClick = new OneClickClient('https://settlr.dev');
 * 
 * // Customer approves merchant
 * await oneClick.approve({
 *   customerWallet: 'Ac52MM...',
 *   merchantWallet: 'DjLFeM...',
 *   spendingLimit: 100, // $100 max
 * });
 * 
 * // Merchant charges customer later (no interaction needed)
 * const result = await oneClick.charge({
 *   customerWallet: 'Ac52MM...',
 *   merchantWallet: 'DjLFeM...',
 *   amount: 25,
 * });
 * ```
 */
export class OneClickClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'https://settlr.dev') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    /**
     * Customer approves a spending limit for a merchant
     */
    async approve(options: ApproveOneClickOptions): Promise<{ success: boolean; approval?: SpendingApproval }> {
        const response = await fetch(`${this.baseUrl}/api/one-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'approve',
                ...options,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create approval');
        }

        return {
            success: true,
            approval: data.approval,
        };
    }

    /**
     * Check if customer has active approval for merchant
     */
    async check(customerWallet: string, merchantWallet: string): Promise<{
        hasApproval: boolean;
        remainingLimit?: number;
        approval?: SpendingApproval;
    }> {
        const response = await fetch(`${this.baseUrl}/api/one-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'check',
                customerWallet,
                merchantWallet,
            }),
        });

        const data = await response.json();

        return {
            hasApproval: data.hasApproval || false,
            remainingLimit: data.remainingLimit,
            approval: data.approval,
        };
    }

    /**
     * Merchant charges customer using their one-click approval
     * No customer interaction required if approval exists with sufficient limit
     */
    async charge(options: ChargeOneClickOptions): Promise<OneClickResult> {
        const response = await fetch(`${this.baseUrl}/api/one-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'charge',
                ...options,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error,
            };
        }

        return {
            success: true,
            txSignature: data.txSignature,
            remainingLimit: data.remainingLimit,
        };
    }

    /**
     * Customer revokes merchant's one-click access
     */
    async revoke(customerWallet: string, merchantWallet: string): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/api/one-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'revoke',
                customerWallet,
                merchantWallet,
            }),
        });

        return { success: response.ok };
    }
}

/**
 * Create a one-click payment client
 * 
 * @param baseUrl - Settlr API base URL (default: https://settlr.dev)
 */
export function createOneClickClient(baseUrl?: string): OneClickClient {
    return new OneClickClient(baseUrl);
}
