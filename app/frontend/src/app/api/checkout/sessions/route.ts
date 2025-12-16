import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
    createCheckoutSession,
    getCheckoutSession,
    updateCheckoutSession,
    CheckoutSession,
} from "@/lib/db";

// Re-export CheckoutSession type for other routes
export type { CheckoutSession };

// Legacy in-memory store for backwards compatibility during migration
// TODO: Remove after full migration to Supabase
const checkoutSessions = new Map<string, CheckoutSession>();
export { checkoutSessions };

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

        // Create checkout session using database layer
        const now = Date.now();
        const expiresAt = now + 30 * 60 * 1000; // 30 minutes expiry

        const session = await createCheckoutSession({
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
            expiresAt,
        });

        // Also store in legacy map for backwards compatibility
        checkoutSessions.set(session.id, session);

        // Build checkout URL
        const baseUrl = request.nextUrl.origin;
        const checkoutUrl = `${baseUrl}/checkout/${session.id}`;

        return NextResponse.json({
            id: session.id,
            url: checkoutUrl,
            expiresAt: session.expiresAt,
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

    // Try database first, then fallback to in-memory
    let session = await getCheckoutSession(sessionId);

    if (!session) {
        // Fallback to legacy in-memory store
        session = checkoutSessions.get(sessionId) || null;
    }

    if (!session) {
        return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
        );
    }

    // Check if expired
    if (session.status === "pending" && Date.now() > session.expiresAt) {
        session.status = "expired";
        await updateCheckoutSession(sessionId, { status: "expired" });
        checkoutSessions.set(sessionId, session);
    }

    return NextResponse.json(session);
}

// Clean up expired sessions (legacy, keep for backwards compatibility)
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
