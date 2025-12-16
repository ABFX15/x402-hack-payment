import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";

// In production, use a database (Redis, PostgreSQL, etc.)
// For demo, we use an in-memory store
const checkoutSessions = new Map<string, CheckoutSession>();

export interface CheckoutSession {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    amount: number; // in USDC (human readable, e.g., 29.99)
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

// Generate a unique checkout session ID
function generateSessionId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "cs_";
    for (let i = 0; i < 24; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// Validate Solana address
function isValidSolanaAddress(address: string): boolean {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}

/**
 * POST /api/checkout/sessions
 * 
 * Create a new checkout session (like Stripe Checkout)
 * 
 * Request body:
 * {
 *   merchantId: string,
 *   merchantName: string,
 *   merchantWallet: string,
 *   amount: number,
 *   description?: string,
 *   metadata?: Record<string, string>,
 *   successUrl: string,
 *   cancelUrl: string,
 *   webhookUrl?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { merchantId, merchantName, merchantWallet, amount, successUrl, cancelUrl, webhookUrl, description, metadata } = body;

        if (!merchantId || !merchantName || !merchantWallet || !amount || !successUrl || !cancelUrl) {
            return NextResponse.json(
                { error: "Missing required fields: merchantId, merchantName, merchantWallet, amount, successUrl, cancelUrl" },
                { status: 400 }
            );
        }

        if (!isValidSolanaAddress(merchantWallet)) {
            return NextResponse.json(
                { error: "Invalid merchant wallet address" },
                { status: 400 }
            );
        }

        if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be a positive number" },
                { status: 400 }
            );
        }

        // Create checkout session
        const sessionId = generateSessionId();
        const now = Date.now();
        const expiresAt = now + 30 * 60 * 1000; // 30 minutes expiry

        const session: CheckoutSession = {
            id: sessionId,
            merchantId,
            merchantName,
            merchantWallet,
            amount,
            currency: "USDC",
            description,
            metadata,
            successUrl,
            cancelUrl,
            webhookUrl,
            status: "pending",
            createdAt: now,
            expiresAt,
        };

        // Store session
        checkoutSessions.set(sessionId, session);

        // Clean up expired sessions periodically
        cleanupExpiredSessions();

        // Build checkout URL
        const baseUrl = request.nextUrl.origin;
        const checkoutUrl = `${baseUrl}/checkout/${sessionId}`;

        return NextResponse.json({
            id: sessionId,
            url: checkoutUrl,
            expiresAt,
            status: "pending",
        });

    } catch (error) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/checkout/sessions?id=xxx
 * 
 * Get checkout session details
 */
export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get("id");

    if (!sessionId) {
        return NextResponse.json(
            { error: "Session ID required" },
            { status: 400 }
        );
    }

    const session = checkoutSessions.get(sessionId);

    if (!session) {
        return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
        );
    }

    // Check if expired
    if (session.status === "pending" && Date.now() > session.expiresAt) {
        session.status = "expired";
        checkoutSessions.set(sessionId, session);
    }

    return NextResponse.json(session);
}

// Clean up expired sessions
function cleanupExpiredSessions() {
    const now = Date.now();
    for (const [id, session] of checkoutSessions.entries()) {
        if (session.status === "pending" && now > session.expiresAt) {
            session.status = "expired";
            checkoutSessions.set(id, session);
        }
        // Remove sessions older than 24 hours
        if (now - session.createdAt > 24 * 60 * 60 * 1000) {
            checkoutSessions.delete(id);
        }
    }
}

// Export for use by other routes
export { checkoutSessions };
