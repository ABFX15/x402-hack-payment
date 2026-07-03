import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { checkoutSessions } from "../store";
import { getCheckoutSession } from "@/lib/db";
import { finalizeCheckoutPayment } from "@/lib/checkout-finalize";
import { EVM_CHAINS, type EvmChainKey } from "@/lib/evm";

/**
 * POST /api/checkout/complete
 *
 * Called by the client after it paid, to (independently) verify the payment
 * on-chain and complete the session. Verification, atomic completion,
 * idempotency, screening and webhook delivery all live in
 * finalizeCheckoutPayment — the SAME path the reconciliation sweeper uses — so
 * this route is a thin adapter.
 *
 * Request body:
 * {
 *   sessionId: string,
 *   signature: string,       // Solana tx signature OR 0x… EVM tx hash
 *   customerWallet: string,
 *   chain?: EvmChainKey       // required for EVM payments
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, signature, customerWallet, chain } = body;

        if (!sessionId || !signature || !customerWallet) {
            return NextResponse.json(
                { error: "Missing required fields: sessionId, signature, customerWallet" },
                { status: 400 }
            );
        }

        // Try database first, then fallback to in-memory
        let session = await getCheckoutSession(sessionId);
        if (!session) {
            session = checkoutSessions.get(sessionId) || null;
        }
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const evmChain: EvmChainKey | undefined =
            chain && EVM_CHAINS[chain as EvmChainKey]
                ? (chain as EvmChainKey)
                : undefined;

        const result = await finalizeCheckoutPayment({
            session,
            signature,
            customerWallet,
            evmChain,
        });

        if (!result.ok) {
            const status =
                result.code === "risk_blocked"
                    ? 403
                    : result.code === "error"
                        ? 502
                        : 400;
            logger.warn(
                `[checkout/complete] ${result.code} for ${sessionId}: ${result.error}`,
            );
            return NextResponse.json(
                {
                    error: result.code || "completion_failed",
                    message: result.error,
                    blockedParty: result.blockedParty,
                },
                { status },
            );
        }

        // Keep the legacy in-memory mirror consistent for any readers of it.
        const mem = checkoutSessions.get(sessionId);
        if (mem) {
            mem.status = "completed";
            mem.paymentSignature = signature;
            mem.customerWallet = customerWallet;
            mem.completedAt = Date.now();
            checkoutSessions.set(sessionId, mem);
        }

        return NextResponse.json({
            success: true,
            paymentId: result.paymentId,
            sessionId,
            signature,
            alreadyCompleted: result.alreadyCompleted || false,
            successUrl: session.successUrl,
        });
    } catch (error) {
        logger.error("Error completing checkout:", error);
        return NextResponse.json(
            { error: "Failed to complete checkout" },
            { status: 500 }
        );
    }
}
