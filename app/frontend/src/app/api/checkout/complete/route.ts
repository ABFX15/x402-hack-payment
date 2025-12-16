import { NextRequest, NextResponse } from "next/server";
import { checkoutSessions, CheckoutSession } from "../sessions/route";

/**
 * POST /api/checkout/complete
 * 
 * Called after a successful payment to update session and trigger webhook
 * 
 * Request body:
 * {
 *   sessionId: string,
 *   signature: string,
 *   customerWallet: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, signature, customerWallet } = body;

        if (!sessionId || !signature || !customerWallet) {
            return NextResponse.json(
                { error: "Missing required fields: sessionId, signature, customerWallet" },
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

        if (session.status !== "pending") {
            return NextResponse.json(
                { error: `Session already ${session.status}` },
                { status: 400 }
            );
        }

        // Update session
        session.status = "completed";
        session.paymentSignature = signature;
        session.customerWallet = customerWallet;
        session.completedAt = Date.now();
        checkoutSessions.set(sessionId, session);

        // Trigger webhook asynchronously
        if (session.webhookUrl) {
            triggerWebhook(session).catch(err => {
                console.error("Webhook delivery failed:", err);
            });
        }

        return NextResponse.json({
            success: true,
            sessionId,
            signature,
            successUrl: session.successUrl,
        });

    } catch (error) {
        console.error("Error completing checkout:", error);
        return NextResponse.json(
            { error: "Failed to complete checkout" },
            { status: 500 }
        );
    }
}

/**
 * Trigger webhook to merchant's endpoint
 */
async function triggerWebhook(session: CheckoutSession): Promise<void> {
    if (!session.webhookUrl) return;

    const webhookPayload = {
        event: "checkout.completed",
        data: {
            sessionId: session.id,
            merchantId: session.merchantId,
            amount: session.amount,
            currency: session.currency,
            customerWallet: session.customerWallet,
            paymentSignature: session.paymentSignature,
            description: session.description,
            metadata: session.metadata,
            completedAt: session.completedAt,
        },
        timestamp: Date.now(),
    };

    // Generate a simple signature for webhook verification
    // In production, use HMAC with a shared secret
    const webhookSignature = generateWebhookSignature(webhookPayload, session.merchantId);

    // Retry logic for webhook delivery
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(session.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Settlr-Signature": webhookSignature,
                    "X-Settlr-Timestamp": Date.now().toString(),
                    "X-Settlr-Event": "checkout.completed",
                },
                body: JSON.stringify(webhookPayload),
            });

            if (response.ok) {
                console.log(`Webhook delivered successfully to ${session.webhookUrl}`);
                return;
            }

            // Log failed attempt
            console.warn(`Webhook attempt ${attempt} failed with status ${response.status}`);
            lastError = new Error(`HTTP ${response.status}`);

        } catch (error) {
            console.warn(`Webhook attempt ${attempt} failed:`, error);
            lastError = error as Error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw new Error(`Webhook delivery failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Generate a simple webhook signature
 * In production, use proper HMAC-SHA256 with merchant's webhook secret
 */
function generateWebhookSignature(payload: any, merchantId: string): string {
    const data = JSON.stringify(payload) + merchantId;
    // Simple hash for demo - use crypto.subtle.sign in production
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `sha256=${Math.abs(hash).toString(16)}`;
}
