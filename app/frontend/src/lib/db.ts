/**
 * Database Service Layer
 * 
 * Provides a unified interface for database operations.
 * Falls back to in-memory storage if Supabase is not configured.
 */

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "./supabase";
import { explorerUrl as buildExplorerUrl } from "./constants";

/**
 * Money-touching records (checkout sessions, payments) must be durably
 * persisted. The in-memory fallback is fine for local dev, but in production a
 * process restart would silently lose payment state — so fail closed rather
 * than accept money we can't remember.
 */
function assertMoneyPersistence(what: string): void {
    if (process.env.NODE_ENV === "production" && !isSupabaseConfigured()) {
        throw new Error(
            `Refusing to ${what} without durable storage — Supabase is not configured in production.`,
        );
    }
}

// Types
export interface Merchant {
    id: string;
    name: string;
    websiteUrl?: string | null;
    walletAddress: string;
    /** The signer's personal wallet (Phantom/Solflare) — used for auth lookups */
    signerWallet?: string | null;
    /** The Squads multisig PDA that governs the vault */
    multisigPda?: string | null;
    /** Cannabis license number (METRC/BioTrack) */
    licenseNumber?: string | null;
    /** Long-lived X25519 public key (base58) for receipt encryption */
    receiptPubkey?: string | null;
    /** Hex-encoded 32-byte Cloak viewing key (nk) — published openly */
    cloakViewingNk?: string | null;
    /** Timestamp when this merchant first registered with Cloak */
    cloakSetAt?: Date | null;
    webhookUrl?: string | null;
    webhookSecret?: string | null;
    kycEnabled?: boolean;
    kycLevel?: "basic-kyc-level" | "gaming-kyc-level" | "enhanced-kyc-level";
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerKYC {
    id: string;
    externalUserId: string; // wallet address or email
    merchantId?: string; // null = global verification
    sumsubApplicantId?: string;
    status: "not_started" | "pending" | "verified" | "rejected";
    verifiedAt?: Date;
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
    // Privacy fields (MagicBlock PER)
    private?: boolean;              // Is this a private payment?
    sessionStatus?: string;         // PER session status (pending/active/processed/settled)
    isDelegated?: boolean;          // Is account delegated to PER?
    privateReceiptPda?: string;     // PDA of private receipt on-chain
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

// Payout types
export type PayoutStatus = "pending" | "funded" | "sent" | "claimed" | "expired" | "failed";

export interface Payout {
    id: string;
    merchantId: string;
    merchantWallet: string;
    email: string;
    amount: number;
    currency: string;
    memo?: string;
    metadata?: Record<string, string>;
    status: PayoutStatus;
    claimToken: string;
    claimUrl: string;
    recipientWallet?: string;
    txSignature?: string;
    batchId?: string;
    createdAt: Date;
    fundedAt?: Date;
    claimedAt?: Date;
    expiredAt?: Date;
    expiresAt: Date;
}

export interface PayoutBatch {
    id: string;
    merchantId: string;
    totalAmount: number;
    count: number;
    status: "processing" | "completed" | "partial" | "failed";
    createdAt: Date;
    completedAt?: Date;
}

// ---------------------------------------------------------------------------
// Invoice types
// ---------------------------------------------------------------------------

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface Invoice {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    invoiceNumber: string;
    // Buyer info
    buyerName: string;
    buyerEmail: string;
    buyerCompany?: string;
    // Amounts
    lineItems: InvoiceLineItem[];
    subtotal: number;
    taxRate?: number;
    taxAmount: number;
    total: number;
    currency: string;
    // Terms
    memo?: string;
    terms?: string; // e.g. "Net 30", "Due on receipt"
    dueDate: Date;
    // Payment
    status: InvoiceStatus;
    paymentSignature?: string;
    payerWallet?: string;
    paidAt?: Date;
    // Tracking
    viewToken: string;
    viewCount: number;
    lastViewedAt?: Date;
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Recipient Network types
// ---------------------------------------------------------------------------

export interface Recipient {
    id: string;
    email: string;
    walletAddress: string;
    displayName?: string;
    authToken?: string;
    authTokenExpiresAt?: Date;
    notificationsEnabled: boolean;
    autoWithdraw: boolean;
    totalReceived: number;
    totalPayouts: number;
    createdAt: Date;
    updatedAt: Date;
    lastPayoutAt?: Date;
}

export interface RecipientBalance {
    id: string;
    recipientId: string;
    currency: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

export type BalanceTransactionType = "credit" | "debit" | "withdrawal";

export interface BalanceTransaction {
    id: string;
    recipientId: string;
    type: BalanceTransactionType;
    amount: number;
    currency: string;
    payoutId?: string;
    txSignature?: string;
    description?: string;
    createdAt: Date;
}

// ---------------------------------------------------------------------------
// Merchant Treasury types
// ---------------------------------------------------------------------------

export interface MerchantBalance {
    id: string;
    merchantId: string;
    currency: string;
    available: number;   // Funds ready to be used for payouts
    pending: number;     // Deposits detected but not yet confirmed
    reserved: number;    // Funds reserved for in-flight payouts
    totalDeposited: number;
    totalWithdrawn: number;
    totalPayouts: number;
    totalFees: number;
    depositAddress?: string; // USDC deposit address for this merchant
    createdAt: Date;
    updatedAt: Date;
}

export type TreasuryTransactionType =
    | "deposit"          // USDC deposited to fund payouts
    | "payout_reserved"  // Funds reserved when payout is created
    | "payout_released"  // Reserved funds released (payout completed)
    | "payout_refund"    // Reserved funds returned (payout expired/failed)
    | "fee_deducted"     // Platform fee deducted
    | "withdrawal";      // Merchant withdrew excess funds

export interface TreasuryTransaction {
    id: string;
    merchantId: string;
    type: TreasuryTransactionType;
    amount: number;
    currency: string;
    payoutId?: string;
    txSignature?: string;
    description?: string;
    balanceAfter: number;
    createdAt: Date;
}

// In-memory fallback stores
const memoryMerchants = new Map<string, Merchant>();
const memorySessions = new Map<string, CheckoutSession>();
const memoryPayments = new Map<string, Payment>();
const memorySubscriptionPlans = new Map<string, SubscriptionPlan>();
const memorySubscriptions = new Map<string, Subscription>();
const memoryPayouts = new Map<string, Payout>();
const memoryPayoutBatches = new Map<string, PayoutBatch>();
const memoryRecipients = new Map<string, Recipient>(); // keyed by email
const memoryBalances = new Map<string, RecipientBalance>(); // keyed by recipientId:currency
const memoryBalanceTxs: BalanceTransaction[] = [];
const memoryMerchantBalances = new Map<string, MerchantBalance>(); // keyed by merchantId:currency
const memoryTreasuryTxs: TreasuryTransaction[] = [];
const memoryInvoices = new Map<string, Invoice>();

// ---------------------------------------------------------------------------
// Purchase Order types
// ---------------------------------------------------------------------------

export type OrderStatus = "draft" | "submitted" | "accepted" | "invoiced" | "paid" | "cancelled";

export interface OrderLineItem {
    description: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface PurchaseOrder {
    id: string;
    merchantId: string;
    merchantWallet: string;
    orderNumber: string;
    // Buyer info
    buyerName: string;
    buyerEmail: string;
    buyerCompany?: string;
    buyerWallet?: string;
    // Items
    lineItems: OrderLineItem[];
    subtotal: number;
    taxRate?: number;
    taxAmount: number;
    total: number;
    currency: string;
    // Terms
    notes?: string;
    terms?: string;
    expectedDate?: Date;
    // Lifecycle
    status: OrderStatus;
    invoiceId?: string;
    paymentId?: string;
    txSignature?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const memoryOrders = new Map<string, PurchaseOrder>();

function generateOrderId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "po_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateOrderNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `PO-${y}${m}-${seq}`;
}

// ============================================
// PURCHASE ORDERS
// ============================================

export async function createPurchaseOrder(data: {
    merchantId: string;
    merchantWallet: string;
    buyerName: string;
    buyerEmail: string;
    buyerCompany?: string;
    buyerWallet?: string;
    lineItems: OrderLineItem[];
    taxRate?: number;
    notes?: string;
    terms?: string;
    expectedDate?: Date;
    currency?: string;
}): Promise<PurchaseOrder> {
    const subtotal = data.lineItems.reduce((sum, li) => sum + li.amount, 0);
    const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
    const total = subtotal + taxAmount;
    const now = new Date();

    const order: PurchaseOrder = {
        id: generateOrderId(),
        merchantId: data.merchantId,
        merchantWallet: data.merchantWallet,
        orderNumber: generateOrderNumber(),
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerCompany: data.buyerCompany,
        buyerWallet: data.buyerWallet,
        lineItems: data.lineItems,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        total,
        currency: data.currency || "USDC",
        notes: data.notes,
        terms: data.terms,
        expectedDate: data.expectedDate,
        status: "draft",
        createdAt: now,
        updatedAt: now,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("purchase_orders").insert({
            id: order.id,
            merchant_id: order.merchantId,
            merchant_wallet: order.merchantWallet,
            order_number: order.orderNumber,
            buyer_name: order.buyerName,
            buyer_email: order.buyerEmail,
            buyer_company: order.buyerCompany,
            buyer_wallet: order.buyerWallet,
            line_items: order.lineItems,
            subtotal: order.subtotal,
            tax_rate: order.taxRate,
            tax_amount: order.taxAmount,
            total: order.total,
            currency: order.currency,
            notes: order.notes,
            terms: order.terms,
            expected_date: order.expectedDate?.toISOString(),
            status: order.status,
            created_at: order.createdAt.toISOString(),
            updated_at: order.updatedAt.toISOString(),
        });
        if (error) {
            // Table might not exist yet — fall back to in-memory
            if (error.message?.includes("purchase_orders")) {
                logger.warn("[db] purchase_orders table missing, using in-memory fallback");
                memoryOrders.set(order.id, order);
            } else {
                logger.error("[db] Error creating purchase order:", error);
                throw new Error("Failed to create purchase order");
            }
        }
    } else {
        memoryOrders.set(order.id, order);
    }

    return order;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("purchase_orders")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.message?.includes("purchase_orders")) {
            return memoryOrders.get(id) || null;
        }
        if (error || !data) return null;
        return mapSupabaseOrder(data);
    }
    return memoryOrders.get(id) || null;
}

export async function getPurchaseOrdersByMerchant(
    merchantId: string,
    opts?: { status?: string; limit?: number }
): Promise<PurchaseOrder[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("purchase_orders")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });
        if (opts?.status) query = query.eq("status", opts.status);
        if (opts?.limit) query = query.limit(opts.limit);
        const { data, error } = await query;
        // Fall back to in-memory if table doesn't exist yet
        if (error?.message?.includes("purchase_orders")) {
            const all = Array.from(memoryOrders.values())
                .filter((o) => o.merchantId === merchantId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            if (opts?.status) return all.filter((o) => o.status === opts.status);
            if (opts?.limit) return all.slice(0, opts.limit);
            return all;
        }
        if (error || !data) return [];
        return data.map(mapSupabaseOrder);
    }
    const all = Array.from(memoryOrders.values())
        .filter((o) => o.merchantId === merchantId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (opts?.status) return all.filter((o) => o.status === opts.status);
    if (opts?.limit) return all.slice(0, opts.limit);
    return all;
}

export async function updatePurchaseOrder(
    id: string,
    updates: Partial<Pick<PurchaseOrder, "status" | "invoiceId" | "paymentId" | "txSignature" | "paidAt">>
): Promise<PurchaseOrder | null> {
    const now = new Date();
    if (isSupabaseConfigured()) {
        const mapped: Record<string, unknown> = { updated_at: now.toISOString() };
        if (updates.status !== undefined) mapped.status = updates.status;
        if (updates.invoiceId !== undefined) mapped.invoice_id = updates.invoiceId;
        if (updates.paymentId !== undefined) mapped.payment_id = updates.paymentId;
        if (updates.txSignature !== undefined) mapped.tx_signature = updates.txSignature;
        if (updates.paidAt !== undefined) mapped.paid_at = updates.paidAt.toISOString();
        const { data, error } = await supabase
            .from("purchase_orders")
            .update(mapped)
            .eq("id", id)
            .select()
            .single();
        // Fall back to in-memory if table doesn't exist yet
        if (error?.message?.includes("purchase_orders")) {
            const memOrder = memoryOrders.get(id);
            if (!memOrder) return null;
            const updated = { ...memOrder, ...updates, updatedAt: now };
            memoryOrders.set(id, updated);
            return updated;
        }
        if (error || !data) return null;
        return mapSupabaseOrder(data);
    }
    const order = memoryOrders.get(id);
    if (!order) return null;
    const updated = { ...order, ...updates, updatedAt: now };
    memoryOrders.set(id, updated);
    return updated;
}

export async function getOrderStats(merchantId: string): Promise<{
    total: number;
    draft: number;
    submitted: number;
    accepted: number;
    invoiced: number;
    paid: number;
    cancelled: number;
    totalValue: number;
    paidValue: number;
}> {
    const orders = await getPurchaseOrdersByMerchant(merchantId);
    return {
        total: orders.length,
        draft: orders.filter((o) => o.status === "draft").length,
        submitted: orders.filter((o) => o.status === "submitted").length,
        accepted: orders.filter((o) => o.status === "accepted").length,
        invoiced: orders.filter((o) => o.status === "invoiced").length,
        paid: orders.filter((o) => o.status === "paid").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
        totalValue: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
        paidValue: orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.total, 0),
    };
}

function mapSupabaseOrder(data: Record<string, unknown>): PurchaseOrder {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        merchantWallet: data.merchant_wallet as string,
        orderNumber: data.order_number as string,
        buyerName: data.buyer_name as string,
        buyerEmail: data.buyer_email as string,
        buyerCompany: data.buyer_company as string | undefined,
        buyerWallet: data.buyer_wallet as string | undefined,
        lineItems: (data.line_items as OrderLineItem[]) || [],
        subtotal: Number(data.subtotal || 0),
        taxRate: data.tax_rate as number | undefined,
        taxAmount: Number(data.tax_amount || 0),
        total: Number(data.total || 0),
        currency: (data.currency as string) || "USDC",
        notes: data.notes as string | undefined,
        terms: data.terms as string | undefined,
        expectedDate: data.expected_date ? new Date(data.expected_date as string) : undefined,
        status: data.status as OrderStatus,
        invoiceId: data.invoice_id as string | undefined,
        paymentId: data.payment_id as string | undefined,
        txSignature: data.tx_signature as string | undefined,
        paidAt: data.paid_at ? new Date(data.paid_at as string) : undefined,
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
    };
}

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
    assertMoneyPersistence("create a checkout session");
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
            is_private: session.private || false,
            session_status: session.sessionStatus || null,
            is_delegated: session.isDelegated || false,
        });

        if (error) {
            // Don't hard-fail checkout on a DB write error (e.g. schema drift —
            // a missing column). Degrade to the in-memory store so the payment
            // + webhook flow still works; apply the pending migration to restore
            // durable persistence.
            logger.error(
                "Supabase error creating session — falling back to in-memory:",
                error,
            );
            memorySessions.set(session.id, session);
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
            // Privacy fields
            private: data.is_private || false,
            sessionStatus: data.session_status || undefined,
            isDelegated: data.is_delegated || undefined,
            privateReceiptPda: data.private_receipt_pda || undefined,
        };
    } else {
        return memorySessions.get(id) || null;
    }
}

/**
 * Find a pending checkout session by its Solana Pay `reference` key (stored in
 * metadata.reference). Used by the Helius webhook to match an incoming payment
 * to the checkout that created it.
 */
export async function getCheckoutSessionByReference(
    reference: string,
): Promise<CheckoutSession | null> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("checkout_sessions")
            .select("id")
            .filter("metadata->>reference", "eq", reference)
            .eq("status", "pending")
            .limit(1)
            .maybeSingle();
        if (data?.id) return getCheckoutSession(data.id);
        // Fall through to in-memory in case the row only lives there.
    }
    for (const s of memorySessions.values()) {
        if (
            s.status === "pending" &&
            (s.metadata as { reference?: string } | undefined)?.reference ===
                reference
        ) {
            return s;
        }
    }
    return null;
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

/**
 * Atomically flip a checkout session pending → completed. Returns the session
 * only if THIS call won the race (it was still pending). If it returns null,
 * another completion (client retry, webhook, or the reconciliation sweeper)
 * already finished it — the caller must not fire the webhook again.
 *
 * On Supabase this is a conditional UPDATE (`where status = 'pending'`), which
 * the database serialises for us. In the in-memory fallback the single-threaded
 * event loop makes the check-and-set atomic.
 */
export async function completeCheckoutSessionAtomic(
    id: string,
): Promise<CheckoutSession | null> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("checkout_sessions")
            .update({ status: "completed" })
            .eq("id", id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();
        if (!data) return null; // already completed/expired, or gone
        return getCheckoutSession(id);
    }
    const s = memorySessions.get(id);
    if (!s || s.status !== "pending") return null;
    s.status = "completed";
    memorySessions.set(id, s);
    return s;
}

/**
 * List checkout sessions that are still pending (optionally only those created
 * before `createdBeforeMs`). Used by the reconciliation sweeper to re-check the
 * chain for payments the client / webhook missed.
 */
export async function listPendingCheckoutSessions(
    limit = 100,
    createdBeforeMs?: number,
): Promise<CheckoutSession[]> {
    if (isSupabaseConfigured()) {
        let q = supabase
            .from("checkout_sessions")
            .select("id, metadata, amount, created_at, expires_at, status, merchant_id")
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(limit);
        if (createdBeforeMs) {
            q = q.lt("created_at", new Date(createdBeforeMs).toISOString());
        }
        const { data } = await q;
        if (!data) return [];
        // Hydrate each via getCheckoutSession so merchant wallet/webhook join in.
        const out: CheckoutSession[] = [];
        for (const row of data) {
            const full = await getCheckoutSession(row.id as string);
            if (full && full.status === "pending") out.push(full);
        }
        return out;
    }
    const now = createdBeforeMs ?? Date.now();
    return [...memorySessions.values()]
        .filter((s) => s.status === "pending" && s.createdAt < now)
        .slice(0, limit);
}

// ============================================
// PAYMENTS
// ============================================

export async function createPayment(
    data: Omit<Payment, "id">
): Promise<Payment> {
    assertMoneyPersistence("record a payment");
    const payment: Payment = {
        ...data,
        id: generatePaymentId(),
    };

    if (isSupabaseConfigured()) {
        const baseInsert = {
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
        };

        let { error } = await supabase.from("payments").insert(baseInsert);

        // Invoice and non-checkout flows may not have a backing checkout_sessions row.
        // Retry with NULL session_id so payment recording does not fail on FK constraint.
        if (
            error &&
            (error as any).code === "23503" &&
            String((error as any).message || "").includes("payments_session_id_fkey")
        ) {
            const retry = await supabase.from("payments").insert({
                ...baseInsert,
                session_id: null,
            });
            error = retry.error;
        }

        // Idempotency: a UNIQUE index on tx_signature means a duplicate insert
        // (webhook + client both completing, or a redelivery) collides here.
        // Treat that as success and return the payment already on record rather
        // than double-recording or throwing.
        if (error && (error as any).code === "23505") {
            const existing = await getPaymentByTxSignature(payment.txSignature);
            if (existing) return existing;
        }

        if (error) {
            logger.error("Supabase error creating payment:", error);
            throw new Error("Failed to create payment");
        }
    } else {
        // In-memory idempotency on the signature.
        for (const p of memoryPayments.values()) {
            if (p.txSignature && p.txSignature === payment.txSignature) return p;
        }
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
            explorerUrl: buildExplorerUrl(data.tx_signature),
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
            explorerUrl: buildExplorerUrl(data.tx_signature),
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

export async function getPaymentByTxSignature(txSignature: string): Promise<Payment | null> {
    if (!txSignature) return null;
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
            .eq("tx_signature", txSignature)
            .maybeSingle();

        if (error || !data) return null;

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
            explorerUrl: buildExplorerUrl(data.tx_signature),
            createdAt: new Date(data.created_at).getTime(),
            completedAt: new Date(data.completed_at).getTime(),
            status: data.status as Payment["status"],
            refundedAmount: data.refunded_amount || undefined,
            refundSignature: data.refund_signature || undefined,
        };
    } else {
        for (const payment of memoryPayments.values()) {
            if (payment.txSignature === txSignature) return payment;
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
                explorerUrl: buildExplorerUrl(row.tx_signature),
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
                explorerUrl: buildExplorerUrl(row.tx_signature),
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

export async function getPaymentsByMerchantWallet(walletAddress: string): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
        // First try wallet_address, then signer_wallet
        const merchant = await getMerchantByWallet(walletAddress);

        if (!merchant) {
            return [];
        }

        const { data, error } = await supabase
            .from("payments")
            .select(`
                *,
                merchants (
                    name,
                    wallet_address
                )
            `)
            .eq("merchant_id", merchant.id)
            .order("completed_at", { ascending: false })
            .limit(100);

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const merchantData = row.merchants as any;
            return {
                id: row.id,
                sessionId: row.session_id,
                merchantId: row.merchant_id,
                merchantName: merchantData?.name || "",
                merchantWallet: merchantData?.wallet_address || "",
                customerWallet: row.customer_wallet,
                amount: row.amount,
                currency: row.currency,
                description: row.description || undefined,
                metadata: row.metadata as Record<string, string> | undefined,
                txSignature: row.tx_signature,
                explorerUrl: buildExplorerUrl(row.tx_signature),
                createdAt: new Date(row.created_at).getTime(),
                completedAt: new Date(row.completed_at).getTime(),
                status: row.status as Payment["status"],
                refundedAmount: row.refunded_amount || undefined,
                refundSignature: row.refund_signature || undefined,
            };
        });
    } else {
        return Array.from(memoryPayments.values())
            .filter((p) => p.merchantWallet === walletAddress)
            .sort((a, b) => b.completedAt - a.completedAt);
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

/**
 * Parse a Supabase merchant row into a Merchant object.
 */
function parseMerchantRow(data: any): Merchant {
    return {
        id: data.id,
        name: data.name,
        walletAddress: data.wallet_address,
        signerWallet: data.signer_wallet || null,
        multisigPda: data.multisig_pda || null,
        licenseNumber: data.license_number || null,
        receiptPubkey: data.receipt_pubkey || null,
        cloakViewingNk: data.cloak_viewing_nk || null,
        cloakSetAt: data.cloak_set_at ? new Date(data.cloak_set_at) : null,
        websiteUrl: data.website_url || null,
        webhookUrl: data.webhook_url,
        webhookSecret: data.webhook_secret,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    };
}

export async function getMerchantByWallet(walletAddress: string): Promise<Merchant | null> {
    if (isSupabaseConfigured()) {
        // Try wallet_address first (vault PDA), then signer_wallet
        const { data, error } = await supabase
            .from("merchants")
            .select("*")
            .eq("wallet_address", walletAddress)
            .single();

        if (!error && data) return parseMerchantRow(data);

        // Fallback: check signer_wallet column
        const { data: data2, error: error2 } = await supabase
            .from("merchants")
            .select("*")
            .eq("signer_wallet", walletAddress)
            .single();

        if (!error2 && data2) return parseMerchantRow(data2);

        return null;
    } else {
        for (const merchant of memoryMerchants.values()) {
            if (merchant.walletAddress === walletAddress || merchant.signerWallet === walletAddress) {
                return merchant;
            }
        }
        return null;
    }
}

/**
 * Look up a merchant specifically by signer wallet (the user's Phantom/Solflare address).
 */
export async function getMerchantBySignerWallet(signerWallet: string): Promise<Merchant | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchants")
            .select("*")
            .eq("signer_wallet", signerWallet)
            .single();

        if (error || !data) return null;
        return parseMerchantRow(data);
    } else {
        for (const merchant of memoryMerchants.values()) {
            if (merchant.signerWallet === signerWallet) {
                return merchant;
            }
        }
        return null;
    }
}

/**
 * Look up a merchant by wallet address (checks both wallet_address and signer_wallet),
 * creating one if it doesn't exist. Used by dashboard routes that authenticate via wallet pubkey.
 */
export async function getOrCreateMerchantByWallet(walletAddress: string): Promise<Merchant> {
    // Check both wallet_address (vault PDA) and signer_wallet (personal wallet)
    const existing = await getMerchantByWallet(walletAddress);
    if (existing) return existing;

    // Auto-create a merchant record — store as both walletAddress and signerWallet
    // since we don't know if this wallet will later create a vault
    try {
        return await createMerchant({
            name: `Merchant ${walletAddress.slice(0, 8)}`,
            walletAddress,
            signerWallet: walletAddress,
            webhookUrl: null,
        });
    } catch {
        // Race condition: another request already created this merchant
        const retry = await getMerchantByWallet(walletAddress);
        if (retry) return retry;
        throw new Error("Failed to get or create merchant for wallet");
    }
}

export async function createMerchant(
    data: Pick<Merchant, "name" | "walletAddress" | "webhookUrl"> & {
        websiteUrl?: string | null;
        signerWallet?: string | null;
        multisigPda?: string | null;
        licenseNumber?: string | null;
    }
): Promise<Merchant> {
    if (isSupabaseConfigured()) {
        const insertData: Record<string, any> = {
            name: data.name,
            website_url: data.websiteUrl || null,
            wallet_address: data.walletAddress,
            webhook_url: data.webhookUrl,
        };
        // Only include optional columns if provided
        if (data.signerWallet) insertData.signer_wallet = data.signerWallet;
        if (data.multisigPda) insertData.multisig_pda = data.multisigPda;
        if (data.licenseNumber) insertData.license_number = data.licenseNumber;

        const { data: inserted, error } = await supabase
            .from("merchants")
            .insert(insertData)
            .select()
            .single();

        if (error || !inserted) {
            logger.error("Supabase error creating merchant:", error);
            throw new Error("Failed to create merchant");
        }

        return parseMerchantRow(inserted);
    } else {
        const merchant: Merchant = {
            id: crypto.randomUUID(),
            name: data.name,
            websiteUrl: data.websiteUrl || null,
            walletAddress: data.walletAddress,
            signerWallet: data.signerWallet || null,
            multisigPda: data.multisigPda || null,
            licenseNumber: data.licenseNumber || null,
            webhookUrl: data.webhookUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryMerchants.set(merchant.id, merchant);
        return merchant;
    }
}

// ============================================
// API KEY VALIDATION (legacy — used by payout/integration routes)
// ============================================

function hashApiKey(key: string): string {
    const { createHash } = require("crypto");
    return createHash("sha256").update(key).digest("hex");
}

const DEMO_API_KEY = "sk_test_demo_xxxxxxxxxxxx";
const DEMO_MERCHANT_STUB = {
    id: "demo_merchant",
    name: "Demo Store",
    walletAddress: "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV",
};

const DEMO_MODE = process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "development";

export async function validateApiKey(rawKey: string): Promise<{
    valid: boolean;
    merchantId?: string;
    merchantWallet?: string;
    merchantName?: string;
    tier?: "free" | "pro" | "enterprise";
    rateLimit?: number;
    error?: string;
}> {
    if (rawKey === DEMO_API_KEY) {
        if (!DEMO_MODE) {
            return { valid: false, error: "Demo keys are disabled in production" };
        }
        return {
            valid: true,
            merchantId: DEMO_MERCHANT_STUB.id,
            merchantWallet: DEMO_MERCHANT_STUB.walletAddress,
            merchantName: DEMO_MERCHANT_STUB.name,
            tier: "free",
            rateLimit: 60,
        };
    }

    if (isSupabaseConfigured()) {
        const keyHash = hashApiKey(rawKey);
        const { data, error } = await supabase
            .from("api_keys")
            .select(`*, merchants ( id, name, wallet_address )`)
            .eq("key_hash", keyHash)
            .eq("active", true)
            .single();

        if (error || !data) {
            return { valid: false, error: "Invalid API key" };
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return { valid: false, error: "API key expired" };
        }

        await supabase
            .from("api_keys")
            .update({ last_used_at: new Date().toISOString(), request_count: (data.request_count || 0) + 1 })
            .eq("id", data.id);

        const merchant = data.merchants as { id: string; name: string; wallet_address: string } | null;
        return {
            valid: true,
            merchantId: data.merchant_id,
            merchantWallet: merchant?.wallet_address,
            merchantName: merchant?.name,
            tier: data.tier,
            rateLimit: data.rate_limit,
        };
    }

    return { valid: false, error: "Invalid API key" };
}

function generateRawApiKey(): string {
    const { randomBytes } = require("crypto");
    return "sk_live_" + randomBytes(24).toString("hex");
}

export interface CreatedApiKey {
    id: string;
    /** The raw secret — returned ONCE at creation, never stored in plaintext. */
    key: string;
    keyPrefix: string;
    name: string;
    createdAt: string;
}

export interface ApiKeyInfo {
    id: string;
    keyPrefix: string;
    name: string;
    tier: string;
    active: boolean;
    createdAt: string;
    lastUsedAt: string | null;
    requestCount: number;
}

/** Issue a new API key for a merchant. Stores only the hash; returns the raw
 * key once for the caller to display. */
export async function createApiKey(
    merchantId: string,
    name: string,
): Promise<CreatedApiKey> {
    if (!isSupabaseConfigured()) {
        throw new Error("API key storage is not configured");
    }
    const rawKey = generateRawApiKey();
    const keyHash = hashApiKey(rawKey);
    const keyPrefix = rawKey.slice(0, 12); // e.g. "sk_live_a1b2"

    const { data, error } = await supabase
        .from("api_keys")
        .insert({
            merchant_id: merchantId,
            key_hash: keyHash,
            key_prefix: keyPrefix,
            name: name || "API key",
            tier: "free",
            rate_limit: 60,
            active: true,
        })
        .select("id, created_at")
        .single();

    if (error || !data) {
        logger.error("Failed to create API key:", error);
        throw new Error("Failed to create API key");
    }
    return {
        id: data.id,
        key: rawKey,
        keyPrefix,
        name: name || "API key",
        createdAt: data.created_at,
    };
}

/** List a merchant's keys (metadata only — never the secret). */
export async function listApiKeys(merchantId: string): Promise<ApiKeyInfo[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from("api_keys")
        .select(
            "id, key_prefix, name, tier, active, created_at, last_used_at, request_count",
        )
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });
    if (error || !data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((k) => ({
        id: k.id,
        keyPrefix: k.key_prefix,
        name: k.name,
        tier: k.tier,
        active: k.active,
        createdAt: k.created_at,
        lastUsedAt: k.last_used_at,
        requestCount: k.request_count || 0,
    }));
}

/** Revoke (deactivate) a key — scoped to the owning merchant. */
export async function revokeApiKey(
    merchantId: string,
    keyId: string,
): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase
        .from("api_keys")
        .update({ active: false })
        .eq("id", keyId)
        .eq("merchant_id", merchantId);
    return !error;
}

// ============================================================================
// MERCHANT SETTINGS (durable, JSON blob keyed by wallet)
// ============================================================================

// Hot in-memory copy — always written, used as a fallback so reads work within
// a process even if Supabase is unconfigured or a write transiently fails.
const memoryMerchantSettings = new Map<string, Record<string, unknown>>();

export async function getMerchantSettings(
    wallet: string,
): Promise<Record<string, unknown> | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchant_settings")
            .select("settings")
            .eq("wallet", wallet)
            .maybeSingle();
        if (error) logger.error("getMerchantSettings error:", error);
        if (data?.settings) return data.settings as Record<string, unknown>;
    }
    return memoryMerchantSettings.get(wallet) || null;
}

export async function upsertMerchantSettings(
    wallet: string,
    settings: Record<string, unknown>,
): Promise<void> {
    memoryMerchantSettings.set(wallet, settings);
    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_settings")
            .upsert(
                {
                    wallet,
                    settings,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "wallet" },
            );
        if (error) logger.error("upsertMerchantSettings error:", error);
    }
}

// ============================================================================
// WAITLIST
// ============================================================================

export interface WaitlistEntry {
    id: string;
    email: string;
    name?: string;
    company?: string;
    useCase?: string;
    walletAddress?: string;
    position: number;
    createdAt: Date;
    status: "pending" | "invited" | "active";
    inviteToken?: string;
}

// In-memory waitlist storage
const memoryWaitlist: WaitlistEntry[] = [];

export async function addToWaitlist(
    email: string,
    company?: string,
    useCase?: string,
    name?: string,
    walletAddress?: string
): Promise<WaitlistEntry> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        // Check if already exists by email or wallet
        const { data: existingByEmail } = await supabase
            .from("waitlist")
            .select("*")
            .eq("email", normalizedEmail)
            .single();

        if (existingByEmail) {
            // If they're re-submitting with a wallet, update the record
            if (walletAddress && !existingByEmail.wallet_address) {
                await supabase
                    .from("waitlist")
                    .update({ wallet_address: walletAddress, name: name || existingByEmail.name })
                    .eq("id", existingByEmail.id);
            }
            throw new Error("This email is already on the waitlist");
        }

        if (walletAddress) {
            const { data: existingByWallet } = await supabase
                .from("waitlist")
                .select("*")
                .eq("wallet_address", walletAddress)
                .single();

            if (existingByWallet) {
                throw new Error("This wallet is already on the waitlist");
            }
        }

        // Get current count for position
        const { count } = await supabase
            .from("waitlist")
            .select("*", { count: "exact", head: true });

        const { data, error } = await supabase
            .from("waitlist")
            .insert({
                email: normalizedEmail,
                name,
                company,
                use_case: useCase,
                wallet_address: walletAddress || null,
                position: (count || 0) + 1,
                status: "pending",
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            email: data.email,
            name: data.name,
            company: data.company,
            useCase: data.use_case,
            walletAddress: data.wallet_address,
            position: data.position,
            createdAt: new Date(data.created_at),
            status: data.status,
        };
    } else {
        // Check if already exists
        const existing = memoryWaitlist.find(
            e => e.email === normalizedEmail || (walletAddress && e.walletAddress === walletAddress)
        );
        if (existing) {
            throw new Error("This email or wallet is already on the waitlist");
        }

        const entry: WaitlistEntry = {
            id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: normalizedEmail,
            name,
            company,
            useCase,
            walletAddress,
            position: memoryWaitlist.length + 1,
            createdAt: new Date(),
            status: "pending",
        };

        memoryWaitlist.push(entry);
        return entry;
    }
}

export async function checkWaitlistAccess(wallet: string): Promise<{ approved: boolean; entry: WaitlistEntry | null }> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("waitlist")
            .select("*")
            .eq("wallet_address", wallet)
            .in("status", ["invited", "active"])
            .single();

        if (data) {
            return {
                approved: true,
                entry: {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    company: data.company,
                    useCase: data.use_case,
                    walletAddress: data.wallet_address,
                    position: data.position,
                    createdAt: new Date(data.created_at),
                    status: data.status,
                },
            };
        }
        return { approved: false, entry: null };
    } else {
        const entry = memoryWaitlist.find(
            e => e.walletAddress === wallet && (e.status === "invited" || e.status === "active")
        );
        return { approved: !!entry, entry: entry || null };
    }
}

export async function getWaitlistByWallet(wallet: string): Promise<WaitlistEntry | null> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("waitlist")
            .select("*")
            .eq("wallet_address", wallet)
            .single();

        if (!data) return null;
        return {
            id: data.id,
            email: data.email,
            name: data.name,
            company: data.company,
            useCase: data.use_case,
            walletAddress: data.wallet_address,
            position: data.position,
            createdAt: new Date(data.created_at),
            status: data.status,
        };
    } else {
        return memoryWaitlist.find(e => e.walletAddress === wallet) || null;
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
    status: "pending" | "invited" | "active",
    inviteToken?: string
): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const update: Record<string, unknown> = { status };
        if (inviteToken) update.invite_token = inviteToken;

        const { error } = await supabase
            .from("waitlist")
            .update(update)
            .eq("email", normalizedEmail);

        return !error;
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail);
        if (entry) {
            entry.status = status;
            if (inviteToken) (entry as any).inviteToken = inviteToken;
            return true;
        }
        return false;
    }
}

export async function verifyInviteToken(token: string): Promise<{ valid: boolean; email: string | null }> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("waitlist")
            .select("email, status")
            .eq("invite_token", token)
            .in("status", ["invited", "active"])
            .single();

        if (data) {
            return { valid: true, email: data.email };
        }
        return { valid: false, email: null };
    } else {
        const entry = memoryWaitlist.find(
            (e: any) => e.inviteToken === token && (e.status === "invited" || e.status === "active")
        );
        return { valid: !!entry, email: entry?.email || null };
    }
}

export async function claimInviteForWallet(
    token: string,
    wallet: string
): Promise<{ ok: boolean; reason?: "not_found" | "wallet_conflict"; message?: string; email?: string }> {
    if (isSupabaseConfigured()) {
        const { data: row, error: findError } = await supabase
            .from("waitlist")
            .select("email, wallet_address, status")
            .eq("invite_token", token)
            .in("status", ["invited", "active"])
            .single();

        if (findError || !row) {
            return { ok: false, reason: "not_found", message: "Invite token is invalid or expired" };
        }

        if (row.wallet_address && row.wallet_address !== wallet) {
            return {
                ok: false,
                reason: "wallet_conflict",
                message: "This invite is already linked to a different wallet",
            };
        }

        if (!row.wallet_address) {
            const { error: updateError } = await supabase
                .from("waitlist")
                .update({ wallet_address: wallet })
                .eq("invite_token", token)
                .is("wallet_address", null);

            if (updateError) {
                return { ok: false, message: "Failed to link wallet to invite" };
            }
        }

        return { ok: true, email: row.email };
    }

    const entry = memoryWaitlist.find(
        (e: any) => e.inviteToken === token && (e.status === "invited" || e.status === "active")
    );

    if (!entry) {
        return { ok: false, reason: "not_found", message: "Invite token is invalid or expired" };
    }

    if (entry.walletAddress && entry.walletAddress !== wallet) {
        return {
            ok: false,
            reason: "wallet_conflict",
            message: "This invite is already linked to a different wallet",
        };
    }

    if (!entry.walletAddress) {
        entry.walletAddress = wallet;
    }

    return { ok: true, email: entry.email };
}

export async function checkWaitlistByEmail(email: string): Promise<{ approved: boolean; entry: WaitlistEntry | null }> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("waitlist")
            .select("*")
            .eq("email", normalizedEmail)
            .single();

        if (!data) return { approved: false, entry: null };

        const entry: WaitlistEntry = {
            id: data.id,
            email: data.email,
            name: data.name,
            company: data.company,
            useCase: data.use_case,
            walletAddress: data.wallet_address,
            position: data.position,
            createdAt: new Date(data.created_at),
            status: data.status,
        };

        return {
            approved: data.status === "invited" || data.status === "active",
            entry,
        };
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail) || null;
        return {
            approved: !!entry && (entry.status === "invited" || entry.status === "active"),
            entry,
        };
    }
}

export async function linkWalletToWaitlist(email: string, wallet: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("waitlist")
            .update({ wallet_address: wallet })
            .eq("email", normalizedEmail)
            .is("wallet_address", null);

        return !error;
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail && !e.walletAddress);
        if (entry) {
            entry.walletAddress = wallet;
            return true;
        }
        return false;
    }
}

// ============================================
// PAYOUTS
// ============================================

function generatePayoutId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "po_";
    for (let i = 0; i < 20; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateClaimToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 48; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

function generateBatchId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "batch_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

const CLAIM_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://offbankpay.com";

export async function createPayout(
    data: {
        merchantId: string;
        merchantWallet: string;
        email: string;
        amount: number;
        currency?: string;
        memo?: string;
        metadata?: Record<string, string>;
        batchId?: string;
    }
): Promise<Payout> {
    const id = generatePayoutId();
    const claimToken = generateClaimToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const payout: Payout = {
        id,
        merchantId: data.merchantId,
        merchantWallet: data.merchantWallet,
        email: data.email.toLowerCase().trim(),
        amount: data.amount,
        currency: data.currency || "USDC",
        memo: data.memo,
        metadata: data.metadata,
        status: "sent",
        claimToken,
        claimUrl: `${CLAIM_BASE_URL}/claim/${claimToken}`,
        batchId: data.batchId,
        createdAt: now,
        expiresAt,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payouts").insert({
            id: payout.id,
            merchant_id: payout.merchantId,
            merchant_wallet: payout.merchantWallet,
            email: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            metadata: payout.metadata,
            status: payout.status,
            claim_token: payout.claimToken,
            batch_id: payout.batchId,
            expires_at: payout.expiresAt.toISOString(),
        });

        if (error) {
            logger.error("Error creating payout:", error);
            throw new Error("Failed to create payout");
        }
    } else {
        memoryPayouts.set(id, payout);
    }

    return payout;
}

export async function getPayoutById(id: string): Promise<Payout | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payouts")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;
        return mapSupabasePayout(data);
    } else {
        return memoryPayouts.get(id) || null;
    }
}

export async function getPayoutByClaimToken(claimToken: string): Promise<Payout | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payouts")
            .select("*")
            .eq("claim_token", claimToken)
            .single();

        if (error || !data) return null;
        return mapSupabasePayout(data);
    } else {
        for (const payout of memoryPayouts.values()) {
            if (payout.claimToken === claimToken) return payout;
        }
        return null;
    }
}

export async function getPayoutsByMerchant(
    merchantId: string,
    options?: { status?: PayoutStatus; limit?: number; offset?: number }
): Promise<Payout[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("payouts")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (options?.status) query = query.eq("status", options.status);
        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapSupabasePayout);
    } else {
        let payouts = Array.from(memoryPayouts.values())
            .filter(p => p.merchantId === merchantId);

        if (options?.status) payouts = payouts.filter(p => p.status === options.status);
        payouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) payouts = payouts.slice(options.offset);
        if (options?.limit) payouts = payouts.slice(0, options.limit);

        return payouts;
    }
}

export async function claimPayout(
    claimToken: string,
    recipientWallet: string,
    txSignature: string
): Promise<Payout | null> {
    const payout = await getPayoutByClaimToken(claimToken);
    if (!payout) return null;
    if (payout.status !== "sent") return null;
    if (new Date() > payout.expiresAt) {
        // Mark as expired
        await updatePayoutStatus(payout.id, "expired");
        return null;
    }

    const now = new Date();

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("payouts")
            .update({
                status: "claimed",
                recipient_wallet: recipientWallet,
                tx_signature: txSignature,
                claimed_at: now.toISOString(),
            })
            .eq("claim_token", claimToken);

        if (error) {
            logger.error("Error claiming payout:", error);
            return null;
        }
    } else {
        payout.status = "claimed";
        payout.recipientWallet = recipientWallet;
        payout.txSignature = txSignature;
        payout.claimedAt = now;
        memoryPayouts.set(payout.id, payout);
    }

    return { ...payout, status: "claimed", recipientWallet, txSignature, claimedAt: now };
}

export async function updatePayoutStatus(id: string, status: PayoutStatus): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const updates: Record<string, unknown> = { status };
        if (status === "expired") updates.expired_at = new Date().toISOString();
        if (status === "funded") updates.funded_at = new Date().toISOString();

        const { error } = await supabase
            .from("payouts")
            .update(updates)
            .eq("id", id);

        return !error;
    } else {
        const payout = memoryPayouts.get(id);
        if (!payout) return false;
        payout.status = status;
        if (status === "expired") payout.expiredAt = new Date();
        if (status === "funded") payout.fundedAt = new Date();
        return true;
    }
}

// Batch operations
export async function createPayoutBatch(
    merchantId: string,
    payouts: Array<{
        email: string;
        amount: number;
        memo?: string;
        metadata?: Record<string, string>;
    }>,
    merchantWallet: string
): Promise<{ batch: PayoutBatch; payouts: Payout[] }> {
    const batchId = generateBatchId();
    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

    const batch: PayoutBatch = {
        id: batchId,
        merchantId,
        totalAmount,
        count: payouts.length,
        status: "processing",
        createdAt: new Date(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payout_batches").insert({
            id: batch.id,
            merchant_id: batch.merchantId,
            total_amount: batch.totalAmount,
            count: batch.count,
            status: batch.status,
        });
        if (error) {
            logger.error("Error creating payout batch:", error);
            throw new Error("Failed to create batch");
        }
    } else {
        memoryPayoutBatches.set(batchId, batch);
    }

    const createdPayouts: Payout[] = [];
    for (const p of payouts) {
        const created = await createPayout({
            merchantId,
            merchantWallet,
            email: p.email,
            amount: p.amount,
            memo: p.memo,
            metadata: p.metadata,
            batchId,
        });
        createdPayouts.push(created);
    }

    // Mark batch as completed
    if (isSupabaseConfigured()) {
        await supabase.from("payout_batches").update({
            status: "completed",
            completed_at: new Date().toISOString(),
        }).eq("id", batchId);
    } else {
        batch.status = "completed";
        batch.completedAt = new Date();
    }

    return { batch: { ...batch, status: "completed", completedAt: new Date() }, payouts: createdPayouts };
}

// Helper to map Supabase snake_case to our camelCase interface
function mapSupabasePayout(data: Record<string, unknown>): Payout {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        merchantWallet: data.merchant_wallet as string,
        email: data.email as string,
        amount: Number(data.amount),
        currency: (data.currency as string) || "USDC",
        memo: data.memo as string | undefined,
        metadata: data.metadata as Record<string, string> | undefined,
        status: data.status as PayoutStatus,
        claimToken: data.claim_token as string,
        claimUrl: `${CLAIM_BASE_URL}/claim/${data.claim_token}`,
        recipientWallet: data.recipient_wallet as string | undefined,
        txSignature: data.tx_signature as string | undefined,
        batchId: data.batch_id as string | undefined,
        createdAt: new Date(data.created_at as string),
        fundedAt: data.funded_at ? new Date(data.funded_at as string) : undefined,
        claimedAt: data.claimed_at ? new Date(data.claimed_at as string) : undefined,
        expiredAt: data.expired_at ? new Date(data.expired_at as string) : undefined,
        expiresAt: new Date(data.expires_at as string),
    };
}


// =========================================================================
// Recipient Network — auto-delivery, balances, dashboard
// =========================================================================

function generateRecipientId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "rcp_";
    for (let i = 0; i < 16; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateAuthToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 48; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function generateBalanceTxId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "btx_";
    for (let i = 0; i < 16; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// ---------------------------------------------------------------------------
// Recipient CRUD
// ---------------------------------------------------------------------------

/**
 * Look up a known recipient by email.
 * This is the core of auto-delivery: if a recipient exists, we can skip the claim flow.
 */
export async function getRecipientByEmail(email: string): Promise<Recipient | null> {
    const normalized = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("recipients")
            .select("*")
            .eq("email", normalized)
            .single();
        if (error || !data) return null;
        return mapSupabaseRecipient(data);
    } else {
        return memoryRecipients.get(normalized) || null;
    }
}

/**
 * Register a new recipient (happens on first claim).
 */
export async function registerRecipient(data: {
    email: string;
    walletAddress: string;
    displayName?: string;
}): Promise<Recipient> {
    const normalized = data.email.toLowerCase().trim();
    const now = new Date();

    const recipient: Recipient = {
        id: generateRecipientId(),
        email: normalized,
        walletAddress: data.walletAddress,
        displayName: data.displayName,
        notificationsEnabled: true,
        autoWithdraw: true,
        totalReceived: 0,
        totalPayouts: 0,
        createdAt: now,
        updatedAt: now,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("recipients").insert({
            id: recipient.id,
            email: recipient.email,
            wallet_address: recipient.walletAddress,
            display_name: recipient.displayName,
            notifications_enabled: recipient.notificationsEnabled,
            auto_withdraw: recipient.autoWithdraw,
        });
        if (error) {
            logger.error("Error registering recipient:", error);
            throw new Error("Failed to register recipient");
        }
    } else {
        memoryRecipients.set(normalized, recipient);
    }

    return recipient;
}

/**
 * Update recipient wallet address or preferences.
 */
export async function updateRecipient(
    email: string,
    updates: {
        walletAddress?: string;
        displayName?: string;
        notificationsEnabled?: boolean;
        autoWithdraw?: boolean;
    }
): Promise<Recipient | null> {
    const normalized = email.toLowerCase().trim();
    const now = new Date();

    if (isSupabaseConfigured()) {
        const supaUpdates: Record<string, unknown> = { updated_at: now.toISOString() };
        if (updates.walletAddress !== undefined) supaUpdates.wallet_address = updates.walletAddress;
        if (updates.displayName !== undefined) supaUpdates.display_name = updates.displayName;
        if (updates.notificationsEnabled !== undefined) supaUpdates.notifications_enabled = updates.notificationsEnabled;
        if (updates.autoWithdraw !== undefined) supaUpdates.auto_withdraw = updates.autoWithdraw;

        const { data, error } = await supabase
            .from("recipients")
            .update(supaUpdates)
            .eq("email", normalized)
            .select()
            .single();

        if (error || !data) return null;
        return mapSupabaseRecipient(data);
    } else {
        const recipient = memoryRecipients.get(normalized);
        if (!recipient) return null;
        if (updates.walletAddress !== undefined) recipient.walletAddress = updates.walletAddress;
        if (updates.displayName !== undefined) recipient.displayName = updates.displayName;
        if (updates.notificationsEnabled !== undefined) recipient.notificationsEnabled = updates.notificationsEnabled;
        if (updates.autoWithdraw !== undefined) recipient.autoWithdraw = updates.autoWithdraw;
        recipient.updatedAt = now;
        return recipient;
    }
}

/**
 * Increment recipient stats after a successful payout.
 */
export async function updateRecipientStats(email: string, amount: number): Promise<void> {
    const normalized = email.toLowerCase().trim();
    const now = new Date();

    if (isSupabaseConfigured()) {
        // Use RPC or manual increment
        const { data } = await supabase
            .from("recipients")
            .select("total_received, total_payouts")
            .eq("email", normalized)
            .single();

        if (data) {
            await supabase.from("recipients").update({
                total_received: Number(data.total_received) + amount,
                total_payouts: Number(data.total_payouts) + 1,
                last_payout_at: now.toISOString(),
                updated_at: now.toISOString(),
            }).eq("email", normalized);
        }
    } else {
        const recipient = memoryRecipients.get(normalized);
        if (recipient) {
            recipient.totalReceived += amount;
            recipient.totalPayouts += 1;
            recipient.lastPayoutAt = now;
            recipient.updatedAt = now;
        }
    }
}

// ---------------------------------------------------------------------------
// Magic link auth for recipient dashboard
// ---------------------------------------------------------------------------

export async function createRecipientAuthToken(email: string): Promise<string | null> {
    const normalized = email.toLowerCase().trim();
    const token = generateAuthToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("recipients")
            .update({ auth_token: token, auth_token_expires_at: expiresAt.toISOString() })
            .eq("email", normalized);
        return error ? null : token;
    } else {
        const recipient = memoryRecipients.get(normalized);
        if (!recipient) return null;
        recipient.authToken = token;
        recipient.authTokenExpiresAt = expiresAt;
        return token;
    }
}

export async function validateRecipientAuthToken(token: string): Promise<Recipient | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("recipients")
            .select("*")
            .eq("auth_token", token)
            .single();

        if (error || !data) return null;
        if (new Date(data.auth_token_expires_at) < new Date()) return null;

        // Clear the token after use
        await supabase.from("recipients").update({
            auth_token: null,
            auth_token_expires_at: null,
        }).eq("auth_token", token);

        return mapSupabaseRecipient(data);
    } else {
        for (const recipient of memoryRecipients.values()) {
            if (recipient.authToken === token) {
                if (recipient.authTokenExpiresAt && recipient.authTokenExpiresAt < new Date()) return null;
                recipient.authToken = undefined;
                recipient.authTokenExpiresAt = undefined;
                return recipient;
            }
        }
        return null;
    }
}

// ---------------------------------------------------------------------------
// Get all payouts for a recipient email (across all platforms)
// ---------------------------------------------------------------------------

export async function getPayoutsByRecipientEmail(
    email: string,
    options?: { limit?: number; offset?: number }
): Promise<Payout[]> {
    const normalized = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        let query = supabase
            .from("payouts")
            .select("*")
            .eq("email", normalized)
            .order("created_at", { ascending: false });

        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
        if (options?.limit) query = query.limit(options.limit);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d: Record<string, unknown>) => mapSupabasePayout(d));
    } else {
        let payouts = Array.from(memoryPayouts.values())
            .filter(p => p.email === normalized);

        payouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) payouts = payouts.slice(options.offset);
        if (options?.limit) payouts = payouts.slice(0, options.limit);
        return payouts;
    }
}

// ---------------------------------------------------------------------------
// Recipient Balances
// ---------------------------------------------------------------------------

/**
 * Get or create a balance record for a recipient.
 */
export async function getOrCreateBalance(recipientId: string, currency: string = "USDC"): Promise<RecipientBalance> {
    if (isSupabaseConfigured()) {
        // Try to get existing
        const { data } = await supabase
            .from("recipient_balances")
            .select("*")
            .eq("recipient_id", recipientId)
            .eq("currency", currency)
            .single();

        if (data) {
            return {
                id: data.id,
                recipientId: data.recipient_id,
                currency: data.currency,
                balance: Number(data.balance),
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };
        }

        // Create new
        const { data: newData, error } = await supabase
            .from("recipient_balances")
            .insert({ recipient_id: recipientId, currency, balance: 0 })
            .select()
            .single();

        if (error || !newData) throw new Error("Failed to create balance");
        return {
            id: newData.id,
            recipientId: newData.recipient_id,
            currency: newData.currency,
            balance: 0,
            createdAt: new Date(newData.created_at),
            updatedAt: new Date(newData.updated_at),
        };
    } else {
        const key = `${recipientId}:${currency}`;
        let balance = memoryBalances.get(key);
        if (!balance) {
            balance = {
                id: `bal_${recipientId}`,
                recipientId,
                currency,
                balance: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryBalances.set(key, balance);
        }
        return balance;
    }
}

/**
 * Credit a recipient's balance (payout received, held instead of instant withdrawal).
 */
export async function creditBalance(
    recipientId: string,
    amount: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<RecipientBalance> {
    const balance = await getOrCreateBalance(recipientId, currency);
    const newBalance = balance.balance + amount;
    const now = new Date();

    if (isSupabaseConfigured()) {
        await supabase.from("recipient_balances")
            .update({ balance: newBalance, updated_at: now.toISOString() })
            .eq("id", balance.id);

        await supabase.from("balance_transactions").insert({
            id: generateBalanceTxId(),
            recipient_id: recipientId,
            type: "credit",
            amount,
            currency,
            payout_id: payoutId,
            description: `Payout ${payoutId} received`,
        });
    } else {
        balance.balance = newBalance;
        balance.updatedAt = now;
        memoryBalanceTxs.push({
            id: generateBalanceTxId(),
            recipientId,
            type: "credit",
            amount,
            currency,
            payoutId,
            description: `Payout ${payoutId} received`,
            createdAt: now,
        });
    }

    return { ...balance, balance: newBalance, updatedAt: now };
}

/**
 * Withdraw from balance (debit + on-chain transfer).
 */
export async function debitBalance(
    recipientId: string,
    amount: number,
    txSignature: string,
    currency: string = "USDC"
): Promise<RecipientBalance> {
    const balance = await getOrCreateBalance(recipientId, currency);
    if (balance.balance < amount) throw new Error("Insufficient balance");

    const newBalance = balance.balance - amount;
    const now = new Date();

    if (isSupabaseConfigured()) {
        await supabase.from("recipient_balances")
            .update({ balance: newBalance, updated_at: now.toISOString() })
            .eq("id", balance.id);

        await supabase.from("balance_transactions").insert({
            id: generateBalanceTxId(),
            recipient_id: recipientId,
            type: "withdrawal",
            amount,
            currency,
            tx_signature: txSignature,
            description: `Withdrawal to wallet`,
        });
    } else {
        balance.balance = newBalance;
        balance.updatedAt = now;
        memoryBalanceTxs.push({
            id: generateBalanceTxId(),
            recipientId,
            type: "withdrawal",
            amount,
            currency,
            txSignature,
            description: `Withdrawal to wallet`,
            createdAt: now,
        });
    }

    return { ...balance, balance: newBalance, updatedAt: now };
}

/**
 * Get balance transaction history for a recipient.
 */
export async function getBalanceTransactions(
    recipientId: string,
    options?: { limit?: number; offset?: number }
): Promise<BalanceTransaction[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("balance_transactions")
            .select("*")
            .eq("recipient_id", recipientId)
            .order("created_at", { ascending: false });

        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            recipientId: d.recipient_id as string,
            type: d.type as BalanceTransactionType,
            amount: Number(d.amount),
            currency: (d.currency as string) || "USDC",
            payoutId: d.payout_id as string | undefined,
            txSignature: d.tx_signature as string | undefined,
            description: d.description as string | undefined,
            createdAt: new Date(d.created_at as string),
        }));
    } else {
        let txs = memoryBalanceTxs.filter(t => t.recipientId === recipientId);
        txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) txs = txs.slice(options.offset);
        if (options?.limit) txs = txs.slice(0, options.limit);
        return txs;
    }
}

// Helper: map Supabase recipient row
function mapSupabaseRecipient(data: Record<string, unknown>): Recipient {
    return {
        id: data.id as string,
        email: data.email as string,
        walletAddress: data.wallet_address as string,
        displayName: data.display_name as string | undefined,
        authToken: data.auth_token as string | undefined,
        authTokenExpiresAt: data.auth_token_expires_at ? new Date(data.auth_token_expires_at as string) : undefined,
        notificationsEnabled: data.notifications_enabled as boolean ?? true,
        autoWithdraw: data.auto_withdraw as boolean ?? true,
        totalReceived: Number(data.total_received || 0),
        totalPayouts: Number(data.total_payouts || 0),
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
        lastPayoutAt: data.last_payout_at ? new Date(data.last_payout_at as string) : undefined,
    };
}

// ============================================
// MERCHANT TREASURY
// ============================================

function generateTreasuryTxId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "ttx_";
    for (let i = 0; i < 20; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateMerchantBalanceId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "mbal_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

/**
 * Get or create a merchant's balance for a given currency.
 */
export async function getOrCreateMerchantBalance(
    merchantId: string,
    currency: string = "USDC"
): Promise<MerchantBalance> {
    if (isSupabaseConfigured()) {
        // Try to get existing
        const { data, error } = await supabase
            .from("merchant_balances")
            .select("*")
            .eq("merchant_id", merchantId)
            .eq("currency", currency)
            .single();

        if (data && !error) {
            return mapSupabaseMerchantBalance(data);
        }

        // Create new
        const newBalance = {
            id: generateMerchantBalanceId(),
            merchant_id: merchantId,
            currency,
            available: 0,
            pending: 0,
            reserved: 0,
            total_deposited: 0,
            total_withdrawn: 0,
            total_payouts: 0,
            total_fees: 0,
        };

        const { data: inserted, error: insertError } = await supabase
            .from("merchant_balances")
            .insert(newBalance)
            .select()
            .single();

        if (insertError || !inserted) {
            // Race condition — another request created it, try to fetch again
            const { data: refetch } = await supabase
                .from("merchant_balances")
                .select("*")
                .eq("merchant_id", merchantId)
                .eq("currency", currency)
                .single();
            if (refetch) return mapSupabaseMerchantBalance(refetch);
            throw new Error("Failed to create merchant balance");
        }

        return mapSupabaseMerchantBalance(inserted);
    } else {
        const key = `${merchantId}:${currency}`;
        let balance = memoryMerchantBalances.get(key);
        if (!balance) {
            const now = new Date();
            balance = {
                id: generateMerchantBalanceId(),
                merchantId,
                currency,
                available: 0,
                pending: 0,
                reserved: 0,
                totalDeposited: 0,
                totalWithdrawn: 0,
                totalPayouts: 0,
                totalFees: 0,
                createdAt: now,
                updatedAt: now,
            };
            memoryMerchantBalances.set(key, balance);
        }
        return balance;
    }
}

/**
 * Get a merchant's current balance (read-only, no creation).
 */
export async function getMerchantBalance(
    merchantId: string,
    currency: string = "USDC"
): Promise<MerchantBalance | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchant_balances")
            .select("*")
            .eq("merchant_id", merchantId)
            .eq("currency", currency)
            .single();

        if (error || !data) return null;
        return mapSupabaseMerchantBalance(data);
    } else {
        return memoryMerchantBalances.get(`${merchantId}:${currency}`) || null;
    }
}

/**
 * Credit merchant balance (deposit confirmed).
 * Moves amount from pending → available (if pending was set) or directly adds to available.
 */
export async function creditMerchantBalance(
    merchantId: string,
    amount: number,
    options: {
        currency?: string;
        txSignature?: string;
        description?: string;
        fromPending?: boolean;
    } = {}
): Promise<MerchantBalance> {
    const currency = options.currency || "USDC";
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const now = new Date();

    const newAvailable = balance.available + amount;
    let newPending = balance.pending;
    const newTotalDeposited = balance.totalDeposited + amount;

    if (options.fromPending) {
        newPending = Math.max(0, balance.pending - amount);
    }

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                available: newAvailable,
                pending: newPending,
                total_deposited: newTotalDeposited,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) throw new Error("Failed to credit merchant balance");
    } else {
        balance.available = newAvailable;
        balance.pending = newPending;
        balance.totalDeposited = newTotalDeposited;
        balance.updatedAt = now;
    }

    // Record transaction
    const txId = generateTreasuryTxId();
    const tx: TreasuryTransaction = {
        id: txId,
        merchantId,
        type: "deposit",
        amount,
        currency,
        txSignature: options.txSignature,
        description: options.description || "USDC deposit",
        balanceAfter: newAvailable,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert({
            id: tx.id,
            merchant_id: tx.merchantId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            tx_signature: tx.txSignature,
            description: tx.description,
            balance_after: tx.balanceAfter,
        });
    } else {
        memoryTreasuryTxs.push(tx);
    }

    return { ...balance, available: newAvailable, pending: newPending, totalDeposited: newTotalDeposited, updatedAt: now };
}

/**
 * Reserve funds for a payout. Moves amount from available → reserved.
 * Returns false if insufficient balance.
 */
export async function reservePayoutFunds(
    merchantId: string,
    amount: number,
    fee: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<{ success: boolean; balance?: MerchantBalance; error?: string }> {
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const totalRequired = amount + fee;

    if (balance.available < totalRequired) {
        return {
            success: false,
            balance,
            error: `Insufficient balance. Required: $${totalRequired.toFixed(2)} (payout: $${amount.toFixed(2)} + fee: $${fee.toFixed(2)}). Available: $${balance.available.toFixed(2)}`,
        };
    }

    const now = new Date();
    const newAvailable = balance.available - totalRequired;
    const newReserved = balance.reserved + totalRequired;

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                available: newAvailable,
                reserved: newReserved,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) return { success: false, error: "Failed to reserve funds" };
    } else {
        balance.available = newAvailable;
        balance.reserved = newReserved;
        balance.updatedAt = now;
    }

    // Record reservation transaction
    const txId = generateTreasuryTxId();
    const tx: TreasuryTransaction = {
        id: txId,
        merchantId,
        type: "payout_reserved",
        amount: totalRequired,
        currency,
        payoutId,
        description: `Reserved for payout ${payoutId} ($${amount.toFixed(2)} + $${fee.toFixed(2)} fee)`,
        balanceAfter: newAvailable,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert({
            id: tx.id,
            merchant_id: tx.merchantId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            payout_id: tx.payoutId,
            description: tx.description,
            balance_after: tx.balanceAfter,
        });
    } else {
        memoryTreasuryTxs.push(tx);
    }

    return {
        success: true,
        balance: { ...balance, available: newAvailable, reserved: newReserved, updatedAt: now },
    };
}

/**
 * Release reserved funds after payout is completed (claimed/delivered).
 * Moves amount from reserved → totalPayouts, fee → totalFees.
 */
export async function releasePayoutFunds(
    merchantId: string,
    amount: number,
    fee: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<MerchantBalance> {
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const now = new Date();
    const totalReleased = amount + fee;

    const newReserved = Math.max(0, balance.reserved - totalReleased);
    const newTotalPayouts = balance.totalPayouts + amount;
    const newTotalFees = balance.totalFees + fee;

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                reserved: newReserved,
                total_payouts: newTotalPayouts,
                total_fees: newTotalFees,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) throw new Error("Failed to release payout funds");
    } else {
        balance.reserved = newReserved;
        balance.totalPayouts = newTotalPayouts;
        balance.totalFees = newTotalFees;
        balance.updatedAt = now;
    }

    // Record release + fee transactions
    const releaseTx: TreasuryTransaction = {
        id: generateTreasuryTxId(),
        merchantId,
        type: "payout_released",
        amount,
        currency,
        payoutId,
        description: `Payout ${payoutId} completed`,
        balanceAfter: balance.available, // available unchanged
        createdAt: now,
    };

    const feeTx: TreasuryTransaction = {
        id: generateTreasuryTxId(),
        merchantId,
        type: "fee_deducted",
        amount: fee,
        currency,
        payoutId,
        description: `Platform fee for payout ${payoutId}`,
        balanceAfter: balance.available,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert([
            {
                id: releaseTx.id,
                merchant_id: releaseTx.merchantId,
                type: releaseTx.type,
                amount: releaseTx.amount,
                currency: releaseTx.currency,
                payout_id: releaseTx.payoutId,
                description: releaseTx.description,
                balance_after: releaseTx.balanceAfter,
            },
            {
                id: feeTx.id,
                merchant_id: feeTx.merchantId,
                type: feeTx.type,
                amount: feeTx.amount,
                currency: feeTx.currency,
                payout_id: feeTx.payoutId,
                description: feeTx.description,
                balance_after: feeTx.balanceAfter,
            },
        ]);
    } else {
        memoryTreasuryTxs.push(releaseTx, feeTx);
    }

    return { ...balance, reserved: newReserved, totalPayouts: newTotalPayouts, totalFees: newTotalFees, updatedAt: now };
}

/**
 * Refund reserved funds back to available (payout expired/failed).
 */
export async function refundReservedFunds(
    merchantId: string,
    amount: number,
    fee: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<MerchantBalance> {
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const now = new Date();
    const totalRefund = amount + fee;

    const newAvailable = balance.available + totalRefund;
    const newReserved = Math.max(0, balance.reserved - totalRefund);

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                available: newAvailable,
                reserved: newReserved,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) throw new Error("Failed to refund reserved funds");
    } else {
        balance.available = newAvailable;
        balance.reserved = newReserved;
        balance.updatedAt = now;
    }

    // Record refund transaction
    const tx: TreasuryTransaction = {
        id: generateTreasuryTxId(),
        merchantId,
        type: "payout_refund",
        amount: totalRefund,
        currency,
        payoutId,
        description: `Refund for expired/failed payout ${payoutId}`,
        balanceAfter: newAvailable,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert({
            id: tx.id,
            merchant_id: tx.merchantId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            payout_id: tx.payoutId,
            description: tx.description,
            balance_after: tx.balanceAfter,
        });
    } else {
        memoryTreasuryTxs.push(tx);
    }

    return { ...balance, available: newAvailable, reserved: newReserved, updatedAt: now };
}

/**
 * Get treasury transaction history for a merchant.
 */
export async function getTreasuryTransactions(
    merchantId: string,
    options?: { type?: TreasuryTransactionType; limit?: number; offset?: number }
): Promise<TreasuryTransaction[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("treasury_transactions")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (options?.type) query = query.eq("type", options.type);
        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            merchantId: d.merchant_id as string,
            type: d.type as TreasuryTransactionType,
            amount: Number(d.amount),
            currency: (d.currency as string) || "USDC",
            payoutId: d.payout_id as string | undefined,
            txSignature: d.tx_signature as string | undefined,
            description: d.description as string | undefined,
            balanceAfter: Number(d.balance_after),
            createdAt: new Date(d.created_at as string),
        }));
    } else {
        let txs = memoryTreasuryTxs.filter(t => t.merchantId === merchantId);
        if (options?.type) txs = txs.filter(t => t.type === options.type);
        txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) txs = txs.slice(options.offset);
        if (options?.limit) txs = txs.slice(0, options.limit);
        return txs;
    }
}

/**
 * Calculate the fee for a payout amount.
 * 1% with a $0.25 minimum.
 */
export function calculatePayoutFee(amount: number): number {
    return Math.max(amount * 0.01, 0.25);
}

// ============================================
// INVOICES
// ============================================

function generateInvoiceId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "inv_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateInvoiceNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${y}${m}-${seq}`;
}

function generateViewToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

export async function createInvoice(data: {
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    invoiceNumber?: string;
    buyerName: string;
    buyerEmail: string;
    buyerCompany?: string;
    lineItems: InvoiceLineItem[];
    taxRate?: number;
    memo?: string;
    terms?: string;
    dueDate: Date;
    currency?: string;
}): Promise<Invoice> {
    const subtotal = data.lineItems.reduce((sum, li) => sum + li.amount, 0);
    const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
    const total = subtotal + taxAmount;
    const now = new Date();

    const invoice: Invoice = {
        id: generateInvoiceId(),
        merchantId: data.merchantId,
        merchantName: data.merchantName,
        merchantWallet: data.merchantWallet,
        invoiceNumber: data.invoiceNumber || generateInvoiceNumber(),
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerCompany: data.buyerCompany,
        lineItems: data.lineItems,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        total,
        currency: data.currency || "USDC",
        memo: data.memo,
        terms: data.terms,
        dueDate: data.dueDate,
        status: "draft",
        viewToken: generateViewToken(),
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("invoices").insert({
            id: invoice.id,
            merchant_id: invoice.merchantId,
            merchant_name: invoice.merchantName,
            merchant_wallet: invoice.merchantWallet,
            invoice_number: invoice.invoiceNumber,
            buyer_name: invoice.buyerName,
            buyer_email: invoice.buyerEmail,
            buyer_company: invoice.buyerCompany,
            line_items: invoice.lineItems,
            subtotal: invoice.subtotal,
            tax_rate: invoice.taxRate,
            tax_amount: invoice.taxAmount,
            total: invoice.total,
            currency: invoice.currency,
            memo: invoice.memo,
            terms: invoice.terms,
            due_date: invoice.dueDate.toISOString(),
            status: invoice.status,
            view_token: invoice.viewToken,
            view_count: 0,
            created_at: invoice.createdAt.toISOString(),
            updated_at: invoice.updatedAt.toISOString(),
        });
        if (error) {
            logger.error("[db] Error creating invoice:", error);
            throw new Error("Failed to create invoice");
        }
    } else {
        memoryInvoices.set(invoice.id, invoice);
    }

    return invoice;
}

export async function getInvoice(id: string): Promise<Invoice | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", id)
            .single();
        if (error || !data) return null;
        return mapSupabaseInvoice(data);
    }
    return memoryInvoices.get(id) || null;
}

export async function getInvoiceByViewToken(token: string): Promise<Invoice | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("view_token", token)
            .single();
        if (error || !data) return null;
        // Increment view count
        await supabase.from("invoices").update({
            view_count: (data.view_count || 0) + 1,
            last_viewed_at: new Date().toISOString(),
            status: data.status === "sent" ? "viewed" : data.status,
            updated_at: new Date().toISOString(),
        }).eq("id", data.id);
        return mapSupabaseInvoice(data);
    }
    for (const inv of memoryInvoices.values()) {
        if (inv.viewToken === token) {
            inv.viewCount++;
            inv.lastViewedAt = new Date();
            if (inv.status === "sent") inv.status = "viewed";
            inv.updatedAt = new Date();
            return inv;
        }
    }
    return null;
}

export async function getInvoicesByMerchant(
    merchantId: string,
    options?: { status?: InvoiceStatus; limit?: number; offset?: number }
): Promise<Invoice[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("invoices")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });
        if (options?.status) query = query.eq("status", options.status);
        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapSupabaseInvoice);
    }
    let invoices = Array.from(memoryInvoices.values()).filter(
        (i) => i.merchantId === merchantId
    );
    if (options?.status) invoices = invoices.filter((i) => i.status === options.status);
    invoices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (options?.offset) invoices = invoices.slice(options.offset);
    if (options?.limit) invoices = invoices.slice(0, options.limit);
    return invoices;
}

export async function updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
    extra?: {
        paymentSignature?: string;
        payerWallet?: string;
        paidAt?: Date;
        sentAt?: Date;
    }
): Promise<Invoice | null> {
    if (isSupabaseConfigured()) {
        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString(),
        };
        if (extra?.paymentSignature) updateData.payment_signature = extra.paymentSignature;
        if (extra?.payerWallet) updateData.payer_wallet = extra.payerWallet;
        if (extra?.paidAt) updateData.paid_at = extra.paidAt.toISOString();
        if (extra?.sentAt) updateData.sent_at = extra.sentAt.toISOString();

        const { data, error } = await supabase
            .from("invoices")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();
        if (error || !data) return null;
        return mapSupabaseInvoice(data);
    }
    const inv = memoryInvoices.get(id);
    if (!inv) return null;
    inv.status = status;
    inv.updatedAt = new Date();
    if (extra?.paymentSignature) inv.paymentSignature = extra.paymentSignature;
    if (extra?.payerWallet) inv.payerWallet = extra.payerWallet;
    if (extra?.paidAt) inv.paidAt = extra.paidAt;
    if (extra?.sentAt) inv.sentAt = extra.sentAt;
    return inv;
}

export async function getInvoiceStats(merchantId: string): Promise<{
    total: number;
    paid: number;
    outstanding: number;
    overdue: number;
    totalRevenue: number;
    outstandingAmount: number;
}> {
    const all = await getInvoicesByMerchant(merchantId, { limit: 10000 });
    const now = new Date();
    let paid = 0, outstanding = 0, overdue = 0, totalRevenue = 0, outstandingAmount = 0;
    for (const inv of all) {
        if (inv.status === "paid") {
            paid++;
            totalRevenue += inv.total;
        } else if (inv.status === "cancelled" || inv.status === "draft") {
            // skip
        } else {
            outstanding++;
            outstandingAmount += inv.total;
            if (inv.dueDate < now) overdue++;
        }
    }
    return { total: all.length, paid, outstanding, overdue, totalRevenue, outstandingAmount };
}

function mapSupabaseInvoice(data: Record<string, unknown>): Invoice {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        merchantName: data.merchant_name as string,
        merchantWallet: data.merchant_wallet as string,
        invoiceNumber: data.invoice_number as string,
        buyerName: data.buyer_name as string,
        buyerEmail: data.buyer_email as string,
        buyerCompany: data.buyer_company as string | undefined,
        lineItems: (data.line_items as InvoiceLineItem[]) || [],
        subtotal: Number(data.subtotal),
        taxRate: data.tax_rate ? Number(data.tax_rate) : undefined,
        taxAmount: Number(data.tax_amount || 0),
        total: Number(data.total),
        currency: (data.currency as string) || "USDC",
        memo: data.memo as string | undefined,
        terms: data.terms as string | undefined,
        dueDate: new Date(data.due_date as string),
        status: data.status as InvoiceStatus,
        paymentSignature: data.payment_signature as string | undefined,
        payerWallet: data.payer_wallet as string | undefined,
        paidAt: data.paid_at ? new Date(data.paid_at as string) : undefined,
        viewToken: data.view_token as string,
        viewCount: Number(data.view_count || 0),
        lastViewedAt: data.last_viewed_at ? new Date(data.last_viewed_at as string) : undefined,
        sentAt: data.sent_at ? new Date(data.sent_at as string) : undefined,
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
    };
}

// Helper: map Supabase merchant_balance row
function mapSupabaseMerchantBalance(data: Record<string, unknown>): MerchantBalance {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        currency: (data.currency as string) || "USDC",
        available: Number(data.available || 0),
        pending: Number(data.pending || 0),
        reserved: Number(data.reserved || 0),
        totalDeposited: Number(data.total_deposited || 0),
        totalWithdrawn: Number(data.total_withdrawn || 0),
        totalPayouts: Number(data.total_payouts || 0),
        totalFees: Number(data.total_fees || 0),
        depositAddress: data.deposit_address as string | undefined,
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
    };
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  COLLECTIONS / REMINDERS                                               */
/* ═══════════════════════════════════════════════════════════════════════ */

export type ReminderType = "pre_due_nudge" | "due_today" | "overdue_gentle" | "overdue_firm" | "overdue_final";
export type ReminderStatus = "scheduled" | "sent" | "failed" | "skipped";

export interface CollectionReminder {
    id: string;
    merchantId: string;
    invoiceId: string;
    invoiceNumber: string;
    buyerEmail: string;
    buyerName: string;
    type: ReminderType;
    status: ReminderStatus;
    scheduledFor: Date;
    sentAt?: Date;
    failedReason?: string;
    createdAt: Date;
}

/** Default reminder schedule relative to due date (days offset, negative = before due) */
export const REMINDER_SCHEDULE: { type: ReminderType; daysOffset: number; label: string }[] = [
    { type: "pre_due_nudge", daysOffset: -3, label: "3 days before due" },
    { type: "due_today", daysOffset: 0, label: "Due today" },
    { type: "overdue_gentle", daysOffset: 3, label: "3 days overdue" },
    { type: "overdue_firm", daysOffset: 7, label: "7 days overdue" },
    { type: "overdue_final", daysOffset: 14, label: "14 days overdue" },
];

const memoryReminders = new Map<string, CollectionReminder>();

export async function createRemindersForInvoice(
    invoice: Invoice,
    merchantId: string
): Promise<CollectionReminder[]> {
    const created: CollectionReminder[] = [];
    const now = new Date();

    for (const step of REMINDER_SCHEDULE) {
        const scheduledFor = new Date(invoice.dueDate);
        scheduledFor.setDate(scheduledFor.getDate() + step.daysOffset);

        // Skip reminders in the past (already missed window)
        if (scheduledFor < now) continue;

        const reminder: CollectionReminder = {
            id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            merchantId,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            buyerEmail: invoice.buyerEmail,
            buyerName: invoice.buyerName,
            type: step.type,
            status: "scheduled",
            scheduledFor,
            createdAt: now,
        };

        if (isSupabaseConfigured()) {
            await supabase.from("collection_reminders").insert({
                id: reminder.id,
                merchant_id: reminder.merchantId,
                invoice_id: reminder.invoiceId,
                invoice_number: reminder.invoiceNumber,
                buyer_email: reminder.buyerEmail,
                buyer_name: reminder.buyerName,
                type: reminder.type,
                status: reminder.status,
                scheduled_for: reminder.scheduledFor.toISOString(),
                created_at: reminder.createdAt.toISOString(),
            });
        } else {
            memoryReminders.set(reminder.id, reminder);
        }
        created.push(reminder);
    }

    return created;
}

export async function getRemindersByMerchant(
    merchantId: string,
    options?: { status?: ReminderStatus; invoiceId?: string; limit?: number }
): Promise<CollectionReminder[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("collection_reminders")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("scheduled_for", { ascending: true });
        if (options?.status) query = query.eq("status", options.status);
        if (options?.invoiceId) query = query.eq("invoice_id", options.invoiceId);
        if (options?.limit) query = query.limit(options.limit);
        const { data } = await query;
        if (!data) return [];
        return data.map(mapSupabaseReminder);
    }

    let reminders = Array.from(memoryReminders.values()).filter(
        (r) => r.merchantId === merchantId
    );
    if (options?.status) reminders = reminders.filter((r) => r.status === options.status);
    if (options?.invoiceId) reminders = reminders.filter((r) => r.invoiceId === options.invoiceId);
    reminders.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    if (options?.limit) reminders = reminders.slice(0, options.limit);
    return reminders;
}

export async function getDueReminders(merchantId: string): Promise<CollectionReminder[]> {
    const now = new Date();
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("collection_reminders")
            .select("*")
            .eq("merchant_id", merchantId)
            .eq("status", "scheduled")
            .lte("scheduled_for", now.toISOString())
            .order("scheduled_for", { ascending: true });
        if (!data) return [];
        return data.map(mapSupabaseReminder);
    }
    return Array.from(memoryReminders.values())
        .filter((r) => r.merchantId === merchantId && r.status === "scheduled" && r.scheduledFor <= now)
        .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}

export async function updateReminderStatus(
    id: string,
    status: ReminderStatus,
    extra?: { sentAt?: Date; failedReason?: string }
): Promise<CollectionReminder | null> {
    if (isSupabaseConfigured()) {
        const update: Record<string, unknown> = { status };
        if (extra?.sentAt) update.sent_at = extra.sentAt.toISOString();
        if (extra?.failedReason) update.failed_reason = extra.failedReason;
        const { data } = await supabase
            .from("collection_reminders")
            .update(update)
            .eq("id", id)
            .select()
            .single();
        if (!data) return null;
        return mapSupabaseReminder(data);
    }
    const rem = memoryReminders.get(id);
    if (!rem) return null;
    rem.status = status;
    if (extra?.sentAt) rem.sentAt = extra.sentAt;
    if (extra?.failedReason) rem.failedReason = extra.failedReason;
    return rem;
}

export async function cancelRemindersForInvoice(invoiceId: string): Promise<number> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("collection_reminders")
            .update({ status: "skipped" })
            .eq("invoice_id", invoiceId)
            .eq("status", "scheduled")
            .select("id");
        return data?.length || 0;
    }
    let cancelled = 0;
    for (const rem of memoryReminders.values()) {
        if (rem.invoiceId === invoiceId && rem.status === "scheduled") {
            rem.status = "skipped";
            cancelled++;
        }
    }
    return cancelled;
}

export async function getCollectionStats(merchantId: string): Promise<{
    totalReminders: number;
    sent: number;
    scheduled: number;
    skipped: number;
    failed: number;
    overdueInvoices: number;
    overdueAmount: number;
    collectedAfterReminder: number;
    collectedAmount: number;
    avgDaysToCollect: number;
}> {
    const reminders = await getRemindersByMerchant(merchantId, { limit: 100000 });
    const invoices = await getInvoicesByMerchant(merchantId, { limit: 100000 });
    const now = new Date();

    let sent = 0, scheduled = 0, skipped = 0, failed = 0;
    for (const r of reminders) {
        if (r.status === "sent") sent++;
        else if (r.status === "scheduled") scheduled++;
        else if (r.status === "skipped") skipped++;
        else if (r.status === "failed") failed++;
    }

    let overdueInvoices = 0, overdueAmount = 0;
    let collectedAfterReminder = 0, collectedAmount = 0;
    const daysList: number[] = [];

    // Invoices that had reminders sent and later got paid
    const invoiceIdsWithReminders = new Set(
        reminders.filter((r) => r.status === "sent").map((r) => r.invoiceId)
    );

    for (const inv of invoices) {
        if (inv.status !== "paid" && inv.status !== "cancelled" && inv.status !== "draft" && inv.dueDate < now) {
            overdueInvoices++;
            overdueAmount += inv.total;
        }
        if (inv.status === "paid" && invoiceIdsWithReminders.has(inv.id) && inv.paidAt) {
            collectedAfterReminder++;
            collectedAmount += inv.total;
            const daysToCollect = Math.ceil(
                (inv.paidAt.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            daysList.push(Math.max(0, daysToCollect));
        }
    }

    const avgDaysToCollect = daysList.length > 0
        ? Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length)
        : 0;

    return {
        totalReminders: reminders.length,
        sent,
        scheduled,
        skipped,
        failed,
        overdueInvoices,
        overdueAmount,
        collectedAfterReminder,
        collectedAmount,
        avgDaysToCollect,
    };
}

function mapSupabaseReminder(data: Record<string, unknown>): CollectionReminder {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        invoiceId: data.invoice_id as string,
        invoiceNumber: data.invoice_number as string,
        buyerEmail: data.buyer_email as string,
        buyerName: data.buyer_name as string,
        type: data.type as ReminderType,
        status: data.status as ReminderStatus,
        scheduledFor: new Date(data.scheduled_for as string),
        sentAt: data.sent_at ? new Date(data.sent_at as string) : undefined,
        failedReason: data.failed_reason as string | undefined,
        createdAt: new Date(data.created_at as string),
    };
}