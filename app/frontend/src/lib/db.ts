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

export interface ApiKey {
    id: string;
    merchantId: string;
    key: string;  // hashed
    keyPrefix: string;  // first 8 chars for display
    name: string;
    tier: "free" | "pro" | "enterprise";
    rateLimit: number;  // requests per minute
    requestCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    expiresAt?: Date;
    active: boolean;
}

// Subscription types
export type SubscriptionInterval = "daily" | "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "past_due" | "expired";

export interface SubscriptionPlan {
    id: string;
    merchantId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    interval: SubscriptionInterval;
    intervalCount: number; // e.g., 1 for monthly, 3 for quarterly
    trialDays?: number;
    features?: string[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subscription {
    id: string;
    planId: string;
    merchantId: string;
    customerWallet: string;
    customerEmail?: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
    trialEnd?: Date;
    lastPaymentAt?: Date;
    lastPaymentId?: string;
    nextPaymentAt?: Date;
    failedPaymentCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// In-memory fallback stores
const memoryMerchants = new Map<string, Merchant>();
const memorySessions = new Map<string, CheckoutSession>();
const memoryPayments = new Map<string, Payment>();
const memoryApiKeys = new Map<string, ApiKey>();
const memorySubscriptionPlans = new Map<string, SubscriptionPlan>();
const memorySubscriptions = new Map<string, Subscription>();
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();

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

// ============================================
// API KEYS
// ============================================

function generateApiKey(prefix: "sk_live" | "sk_test" = "sk_live"): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = `${prefix}_`;
    for (let i = 0; i < 32; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

function hashApiKey(key: string): string {
    // Simple hash for demo - in production use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
}

export async function createApiKey(
    merchantId: string,
    name: string = "Default",
    tier: "free" | "pro" | "enterprise" = "free",
    isTest: boolean = false
): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = generateApiKey(isTest ? "sk_test" : "sk_live");
    const keyHash = hashApiKey(rawKey);

    const rateLimits = {
        free: 60,
        pro: 300,
        enterprise: 1000,
    };

    const apiKey: ApiKey = {
        id: crypto.randomUUID(),
        merchantId,
        key: keyHash,
        keyPrefix: rawKey.slice(0, 12) + "...",
        name,
        tier,
        rateLimit: rateLimits[tier],
        requestCount: 0,
        createdAt: new Date(),
        active: true,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("api_keys").insert({
            id: apiKey.id,
            merchant_id: merchantId,
            key_hash: keyHash,
            key_prefix: apiKey.keyPrefix,
            name,
            tier,
            rate_limit: apiKey.rateLimit,
            active: true,
        });

        if (error) {
            console.error("Supabase error creating API key:", error);
            throw new Error("Failed to create API key");
        }
    } else {
        // Store with raw key for in-memory lookup (demo only)
        memoryApiKeys.set(rawKey, apiKey);
    }

    return { apiKey, rawKey };
}

export async function validateApiKey(rawKey: string): Promise<{
    valid: boolean;
    merchantId?: string;
    tier?: "free" | "pro" | "enterprise";
    rateLimit?: number;
    error?: string;
}> {
    // Check for test keys in dev mode
    if (rawKey.startsWith("sk_test_")) {
        return {
            valid: true,
            merchantId: "test_merchant",
            tier: "free",
            rateLimit: 60,
        };
    }

    if (isSupabaseConfigured()) {
        const keyHash = hashApiKey(rawKey);

        const { data, error } = await supabase
            .from("api_keys")
            .select("*")
            .eq("key_hash", keyHash)
            .eq("active", true)
            .single();

        if (error || !data) {
            return { valid: false, error: "Invalid API key" };
        }

        // Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return { valid: false, error: "API key expired" };
        }

        // Update last used
        await supabase
            .from("api_keys")
            .update({
                last_used_at: new Date().toISOString(),
                request_count: (data.request_count || 0) + 1,
            })
            .eq("id", data.id);

        return {
            valid: true,
            merchantId: data.merchant_id,
            tier: data.tier,
            rateLimit: data.rate_limit,
        };
    } else {
        // In-memory lookup
        const apiKey = memoryApiKeys.get(rawKey);

        if (!apiKey || !apiKey.active) {
            return { valid: false, error: "Invalid API key" };
        }

        apiKey.lastUsedAt = new Date();
        apiKey.requestCount++;

        return {
            valid: true,
            merchantId: apiKey.merchantId,
            tier: apiKey.tier,
            rateLimit: apiKey.rateLimit,
        };
    }
}

export async function checkRateLimit(apiKey: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
}> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    let rateData = memoryRateLimits.get(apiKey);

    // Reset if window expired
    if (!rateData || rateData.resetAt < now) {
        rateData = { count: 0, resetAt: now + windowMs };
        memoryRateLimits.set(apiKey, rateData);
    }

    // Get rate limit for this key
    const validation = await validateApiKey(apiKey);
    const limit = validation.rateLimit || 60;

    rateData.count++;

    return {
        allowed: rateData.count <= limit,
        remaining: Math.max(0, limit - rateData.count),
        resetAt: rateData.resetAt,
    };
}

export async function getApiKeysByMerchant(merchantId: string): Promise<ApiKey[]> {
    console.log("[DB] getApiKeysByMerchant called with:", merchantId);

    if (isSupabaseConfigured()) {
        console.log("[DB] Using Supabase, querying for merchant_id:", merchantId);
        const { data, error } = await supabase
            .from("api_keys")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[DB] Supabase error:", error);
            return [];
        }

        if (!data) {
            console.log("[DB] No data returned from Supabase");
            return [];
        }

        console.log("[DB] Supabase returned", data.length, "keys");
        return data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            merchantId: row.merchant_id as string,
            key: row.key_hash as string,
            keyPrefix: row.key_prefix as string,
            name: row.name as string,
            tier: row.tier as "free" | "pro" | "enterprise",
            rateLimit: row.rate_limit as number,
            requestCount: (row.request_count as number) || 0,
            lastUsedAt: row.last_used_at ? new Date(row.last_used_at as string) : undefined,
            createdAt: new Date(row.created_at as string),
            expiresAt: row.expires_at ? new Date(row.expires_at as string) : undefined,
            active: row.active as boolean,
        }));
    } else {
        return Array.from(memoryApiKeys.values()).filter(k => k.merchantId === merchantId);
    }
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("api_keys")
            .update({ active: false })
            .eq("id", keyId);

        return !error;
    } else {
        for (const [rawKey, apiKey] of memoryApiKeys.entries()) {
            if (apiKey.id === keyId) {
                apiKey.active = false;
                return true;
            }
        }
        return false;
    }
}

// ============================================================================
// WAITLIST
// ============================================================================

export interface WaitlistEntry {
    id: string;
    email: string;
    company?: string;
    useCase?: string;
    position: number;
    createdAt: Date;
    status: "pending" | "invited" | "active";
}

// In-memory waitlist storage
const memoryWaitlist: WaitlistEntry[] = [];

export async function addToWaitlist(
    email: string,
    company?: string,
    useCase?: string
): Promise<WaitlistEntry> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        // Check if already exists
        const { data: existing } = await supabase
            .from("waitlist")
            .select("*")
            .eq("email", normalizedEmail)
            .single();

        if (existing) {
            throw new Error("This email is already on the waitlist");
        }

        // Get current count for position
        const { count } = await supabase
            .from("waitlist")
            .select("*", { count: "exact", head: true });

        const { data, error } = await supabase
            .from("waitlist")
            .insert({
                email: normalizedEmail,
                company,
                use_case: useCase,
                position: (count || 0) + 1,
                status: "pending",
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            email: data.email,
            company: data.company,
            useCase: data.use_case,
            position: data.position,
            createdAt: new Date(data.created_at),
            status: data.status,
        };
    } else {
        // Check if already exists
        const existing = memoryWaitlist.find(e => e.email === normalizedEmail);
        if (existing) {
            throw new Error("This email is already on the waitlist");
        }

        const entry: WaitlistEntry = {
            id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: normalizedEmail,
            company,
            useCase,
            position: memoryWaitlist.length + 1,
            createdAt: new Date(),
            status: "pending",
        };

        memoryWaitlist.push(entry);
        return entry;
    }
}

export async function getWaitlist(): Promise<WaitlistEntry[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("waitlist")
            .select("*")
            .order("position", { ascending: true });

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            email: row.email,
            company: row.company,
            useCase: row.use_case,
            position: row.position,
            createdAt: new Date(row.created_at),
            status: row.status,
        }));
    } else {
        return [...memoryWaitlist];
    }
}

export async function getWaitlistPosition(email: string): Promise<number | null> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("waitlist")
            .select("position")
            .eq("email", normalizedEmail)
            .single();

        return data?.position || null;
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail);
        return entry?.position || null;
    }
}

export async function updateWaitlistStatus(
    email: string,
    status: "pending" | "invited" | "active"
): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("waitlist")
            .update({ status })
            .eq("email", normalizedEmail);

        return !error;
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail);
        if (entry) {
            entry.status = status;
            return true;
        }
        return false;
    }
}
