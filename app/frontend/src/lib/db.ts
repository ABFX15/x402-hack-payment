/**
 * Database Service Layer
 * 
 * Provides a unified interface for database operations.
 * Falls back to in-memory storage if Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

// Types
export interface Merchant {
    id: string;
    name: string;
    walletAddress: string;
    webhookUrl?: string | null;
    webhookSecret?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CheckoutSession {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
    webhookUrl?: string;
    status: "pending" | "completed" | "expired" | "cancelled";
    paymentSignature?: string;
    customerWallet?: string;
    createdAt: number;
    expiresAt: number;
    completedAt?: number;
}

export interface Payment {
    id: string;
    sessionId: string;
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    customerWallet: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
    txSignature: string;
    explorerUrl: string;
    createdAt: number;
    completedAt: number;
    status: "completed" | "refunded" | "partially_refunded";
    refundedAmount?: number;
    refundSignature?: string;
}

// In-memory fallback stores
const memoryMerchants = new Map<string, Merchant>();
const memorySessions = new Map<string, CheckoutSession>();
const memoryPayments = new Map<string, Payment>();

// ID generators
function generateSessionId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "cs_";
    for (let i = 0; i < 24; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generatePaymentId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "pay_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

export function generateReceiptId(paymentId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `RCP-${year}${month}-${paymentId.replace("pay_", "").toUpperCase().slice(0, 8)}`;
}

// ============================================
// CHECKOUT SESSIONS
// ============================================

export async function createCheckoutSession(
    data: Omit<CheckoutSession, "id" | "createdAt" | "status">
): Promise<CheckoutSession> {
    const session: CheckoutSession = {
        ...data,
        id: generateSessionId(),
        status: "pending",
        createdAt: Date.now(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("checkout_sessions").insert({
            id: session.id,
            merchant_id: session.merchantId,
            amount: session.amount,
            currency: session.currency,
            description: session.description,
            metadata: session.metadata,
            success_url: session.successUrl,
            cancel_url: session.cancelUrl,
            status: session.status,
            expires_at: new Date(session.expiresAt).toISOString(),
        });

        if (error) {
            console.error("Supabase error creating session:", error);
            throw new Error("Failed to create checkout session");
        }
    } else {
        memorySessions.set(session.id, session);
    }

    return session;
}

export async function getCheckoutSession(id: string): Promise<CheckoutSession | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("checkout_sessions")
            .select(`
        *,
        merchants (
          name,
          wallet_address,
          webhook_url
        )
      `)
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        const merchant = data.merchants as any;
        return {
            id: data.id,
            merchantId: data.merchant_id,
            merchantName: merchant?.name || "",
            merchantWallet: merchant?.wallet_address || "",
            amount: data.amount,
            currency: data.currency,
            description: data.description || undefined,
            metadata: data.metadata as Record<string, string> | undefined,
            successUrl: data.success_url,
            cancelUrl: data.cancel_url,
            webhookUrl: merchant?.webhook_url || undefined,
            status: data.status as CheckoutSession["status"],
            createdAt: new Date(data.created_at).getTime(),
            expiresAt: new Date(data.expires_at).getTime(),
        };
    } else {
        return memorySessions.get(id) || null;
    }
}

export async function updateCheckoutSession(
    id: string,
    updates: Partial<CheckoutSession>
): Promise<CheckoutSession | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("checkout_sessions")
            .update({
                status: updates.status,
            })
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            return null;
        }

        return getCheckoutSession(id);
    } else {
        const session = memorySessions.get(id);
        if (!session) return null;

        const updated = { ...session, ...updates };
        memorySessions.set(id, updated);
        return updated;
    }
}

// ============================================
// PAYMENTS
// ============================================

export async function createPayment(
    data: Omit<Payment, "id">
): Promise<Payment> {
    const payment: Payment = {
        ...data,
        id: generatePaymentId(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payments").insert({
            id: payment.id,
            session_id: payment.sessionId,
            merchant_id: payment.merchantId,
            customer_wallet: payment.customerWallet,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            metadata: payment.metadata,
            tx_signature: payment.txSignature,
            status: payment.status,
            completed_at: new Date(payment.completedAt).toISOString(),
        });

        if (error) {
            console.error("Supabase error creating payment:", error);
            throw new Error("Failed to create payment");
        }
    } else {
        memoryPayments.set(payment.id, payment);
    }

    return payment;
}

export async function getPayment(id: string): Promise<Payment | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        const merchant = data.merchants as any;
        return {
            id: data.id,
            sessionId: data.session_id,
            merchantId: data.merchant_id,
            merchantName: merchant?.name || "",
            merchantWallet: merchant?.wallet_address || "",
            customerWallet: data.customer_wallet,
            amount: data.amount,
            currency: data.currency,
            description: data.description || undefined,
            metadata: data.metadata as Record<string, string> | undefined,
            txSignature: data.tx_signature,
            explorerUrl: `https://explorer.solana.com/tx/${data.tx_signature}?cluster=devnet`,
            createdAt: new Date(data.created_at).getTime(),
            completedAt: new Date(data.completed_at).getTime(),
            status: data.status as Payment["status"],
            refundedAmount: data.refunded_amount || undefined,
            refundSignature: data.refund_signature || undefined,
        };
    } else {
        return memoryPayments.get(id) || null;
    }
}

export async function getPaymentBySessionId(sessionId: string): Promise<Payment | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .eq("session_id", sessionId)
            .single();

        if (error || !data) {
            return null;
        }

        const merchant = data.merchants as any;
        return {
            id: data.id,
            sessionId: data.session_id,
            merchantId: data.merchant_id,
            merchantName: merchant?.name || "",
            merchantWallet: merchant?.wallet_address || "",
            customerWallet: data.customer_wallet,
            amount: data.amount,
            currency: data.currency,
            description: data.description || undefined,
            metadata: data.metadata as Record<string, string> | undefined,
            txSignature: data.tx_signature,
            explorerUrl: `https://explorer.solana.com/tx/${data.tx_signature}?cluster=devnet`,
            createdAt: new Date(data.created_at).getTime(),
            completedAt: new Date(data.completed_at).getTime(),
            status: data.status as Payment["status"],
            refundedAmount: data.refunded_amount || undefined,
            refundSignature: data.refund_signature || undefined,
        };
    } else {
        for (const payment of memoryPayments.values()) {
            if (payment.sessionId === sessionId) {
                return payment;
            }
        }
        return null;
    }
}

export async function getPaymentsByMerchant(merchantId: string): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .eq("merchant_id", merchantId)
            .order("completed_at", { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const merchant = row.merchants as any;
            return {
                id: row.id,
                sessionId: row.session_id,
                merchantId: row.merchant_id,
                merchantName: merchant?.name || "",
                merchantWallet: merchant?.wallet_address || "",
                customerWallet: row.customer_wallet,
                amount: row.amount,
                currency: row.currency,
                description: row.description || undefined,
                metadata: row.metadata as Record<string, string> | undefined,
                txSignature: row.tx_signature,
                explorerUrl: `https://explorer.solana.com/tx/${row.tx_signature}?cluster=devnet`,
                createdAt: new Date(row.created_at).getTime(),
                completedAt: new Date(row.completed_at).getTime(),
                status: row.status as Payment["status"],
                refundedAmount: row.refunded_amount || undefined,
                refundSignature: row.refund_signature || undefined,
            };
        });
    } else {
        const payments: Payment[] = [];
        for (const payment of memoryPayments.values()) {
            if (payment.merchantId === merchantId) {
                payments.push(payment);
            }
        }
        return payments.sort((a, b) => b.completedAt - a.completedAt);
    }
}

export async function getAllPayments(): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .order("completed_at", { ascending: false })
            .limit(100);

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const merchant = row.merchants as any;
            return {
                id: row.id,
                sessionId: row.session_id,
                merchantId: row.merchant_id,
                merchantName: merchant?.name || "",
                merchantWallet: merchant?.wallet_address || "",
                customerWallet: row.customer_wallet,
                amount: row.amount,
                currency: row.currency,
                description: row.description || undefined,
                metadata: row.metadata as Record<string, string> | undefined,
                txSignature: row.tx_signature,
                explorerUrl: `https://explorer.solana.com/tx/${row.tx_signature}?cluster=devnet`,
                createdAt: new Date(row.created_at).getTime(),
                completedAt: new Date(row.completed_at).getTime(),
                status: row.status as Payment["status"],
                refundedAmount: row.refunded_amount || undefined,
                refundSignature: row.refund_signature || undefined,
            };
        });
    } else {
        return Array.from(memoryPayments.values()).sort(
            (a, b) => b.completedAt - a.completedAt
        );
    }
}

// ============================================
// MERCHANTS
// ============================================

export async function getMerchant(id: string): Promise<Merchant | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchants")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            walletAddress: data.wallet_address,
            webhookUrl: data.webhook_url,
            webhookSecret: data.webhook_secret,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } else {
        return memoryMerchants.get(id) || null;
    }
}

export async function getMerchantByWallet(walletAddress: string): Promise<Merchant | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchants")
            .select("*")
            .eq("wallet_address", walletAddress)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            walletAddress: data.wallet_address,
            webhookUrl: data.webhook_url,
            webhookSecret: data.webhook_secret,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } else {
        for (const merchant of memoryMerchants.values()) {
            if (merchant.walletAddress === walletAddress) {
                return merchant;
            }
        }
        return null;
    }
}

export async function createMerchant(
    data: Pick<Merchant, "name" | "walletAddress" | "webhookUrl">
): Promise<Merchant> {
    if (isSupabaseConfigured()) {
        const { data: inserted, error } = await supabase
            .from("merchants")
            .insert({
                name: data.name,
                wallet_address: data.walletAddress,
                webhook_url: data.webhookUrl,
            })
            .select()
            .single();

        if (error || !inserted) {
            console.error("Supabase error creating merchant:", error);
            throw new Error("Failed to create merchant");
        }

        return {
            id: inserted.id,
            name: inserted.name,
            walletAddress: inserted.wallet_address,
            webhookUrl: inserted.webhook_url,
            webhookSecret: inserted.webhook_secret,
            createdAt: new Date(inserted.created_at),
            updatedAt: new Date(inserted.updated_at),
        };
    } else {
        const merchant: Merchant = {
            id: crypto.randomUUID(),
            name: data.name,
            walletAddress: data.walletAddress,
            webhookUrl: data.webhookUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryMerchants.set(merchant.id, merchant);
        return merchant;
    }
}
