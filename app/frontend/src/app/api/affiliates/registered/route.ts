/**
 * GET /api/affiliates/registered — the operator's self-registered affiliates.
 *
 * Session-authed. Returns everyone who onboarded themselves via this merchant's
 * invite link, plus the merchant's display name and wallet so the dashboard can
 * build the shareable invite URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { requireMerchantSession } from "@/lib/merchant-auth";
import { listRegisteredAffiliates } from "@/lib/affiliate-registry";

export async function GET(request: NextRequest) {
    try {
        const session = await requireMerchantSession(request);
        if (!session) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 },
            );
        }
        const affiliates = await listRegisteredAffiliates(session.merchantWallet);
        return NextResponse.json({
            affiliates,
            merchantName: session.merchantName,
            merchantWallet: session.merchantWallet,
        });
    } catch (error) {
        logger.error("[affiliates/registered] error:", error);
        return NextResponse.json(
            { error: "Failed to load affiliates" },
            { status: 500 },
        );
    }
}
