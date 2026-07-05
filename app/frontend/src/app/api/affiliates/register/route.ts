/**
 * POST /api/affiliates/register — public self-serve affiliate onboarding.
 *
 * An affiliate opens an operator's invite link and submits their own payout
 * details. No auth (it's a public form), but rate-limited and validated. The
 * operator later sees them in their Affiliate Payouts list and just enters an
 * amount. This is the "operator types nothing" path.
 *
 * Body: { merchantWallet, name, email, payoutWallet? }
 */

import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { logger } from "@/lib/logger";
import { registerAffiliate } from "@/lib/affiliate-registry";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const limited = await checkRateLimit(
            `aff-register:${getClientIp(request)}`,
        );
        if (limited) return limited;

        const body = await request.json();
        const merchantWallet = String(body.merchantWallet || "").trim();
        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();
        const payoutWallet = body.payoutWallet
            ? String(body.payoutWallet).trim()
            : undefined;

        if (!merchantWallet) {
            return NextResponse.json({ error: "Missing merchant" }, { status: 400 });
        }
        try {
            new PublicKey(merchantWallet);
        } catch {
            return NextResponse.json({ error: "Invalid merchant link" }, { status: 400 });
        }
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return NextResponse.json(
                { error: "A valid email is required" },
                { status: 400 },
            );
        }
        if (payoutWallet) {
            try {
                new PublicKey(payoutWallet);
            } catch {
                return NextResponse.json(
                    { error: "That doesn't look like a valid Solana wallet address" },
                    { status: 400 },
                );
            }
        }

        const rec = await registerAffiliate({
            merchantWallet,
            name,
            email,
            payoutWallet,
        });
        return NextResponse.json({ ok: true, id: rec.id });
    } catch (error) {
        logger.error("[affiliates/register] error:", error);
        return NextResponse.json(
            { error: "Failed to register" },
            { status: 500 },
        );
    }
}
