/**
 * Completed Payments Store
 * 
 * In production, this would be a database (PostgreSQL, Redis, etc.)
 * For now, we use an in-memory store that persists during the server lifecycle
 */

export interface CompletedPayment {
    id: string;                    // Payment ID (e.g., "pay_abc123")
    sessionId: string;             // Original checkout session ID

    // Merchant info
    merchantId: string;
    merchantName: string;
    merchantWallet: string;

    // Customer info
    customerWallet: string;

    // Payment details
    amount: number;                // Human-readable (e.g., 29.99)
    currency: string;              // "USDC"
    description?: string;
    metadata?: Record<string, string>;

    // Transaction proof
    txSignature: string;
    explorerUrl: string;

    // Timestamps
    createdAt: number;             // When payment was initiated
    completedAt: number;           // When payment was confirmed

    // Status
    status: "completed" | "refunded" | "partially_refunded";
    refundedAmount?: number;
    refundSignature?: string;
}

// In-memory store (replace with DB in production)
export const completedPayments = new Map<string, CompletedPayment>();

// Generate a unique payment ID
export function generatePaymentId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "pay_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// Generate a receipt ID from payment ID
export function generateReceiptId(paymentId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `RCP-${year}${month}-${paymentId.replace("pay_", "").toUpperCase().slice(0, 8)}`;
}

// Store a completed payment
export function storePayment(payment: CompletedPayment): void {
    completedPayments.set(payment.id, payment);
}

// Get a payment by ID
export function getPayment(paymentId: string): CompletedPayment | undefined {
    return completedPayments.get(paymentId);
}

// Get a payment by session ID
export function getPaymentBySessionId(sessionId: string): CompletedPayment | undefined {
    for (const payment of completedPayments.values()) {
        if (payment.sessionId === sessionId) {
            return payment;
        }
    }
    return undefined;
}

// Get all payments for a merchant
export function getPaymentsByMerchant(merchantId: string): CompletedPayment[] {
    const payments: CompletedPayment[] = [];
    for (const payment of completedPayments.values()) {
        if (payment.merchantId === merchantId) {
            payments.push(payment);
        }
    }
    return payments.sort((a, b) => b.completedAt - a.completedAt);
}

// Get all payments (for admin/analytics)
export function getAllPayments(): CompletedPayment[] {
    return Array.from(completedPayments.values()).sort((a, b) => b.completedAt - a.completedAt);
}
