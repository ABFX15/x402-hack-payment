/**
 * Shared helper for routes that authenticate a merchant via the
 * `offbank_session` cookie set by /api/auth/wallet/verify.
 *
 * Replaces the previous pattern of trusting the `x-merchant-wallet`
 * request header (which any caller could forge to impersonate any
 * merchant in the database).
 *
 * Backwards-compatible escape hatch: when ALLOW_HEADER_AUTH=true (dev
 * only — must NEVER be set in production), the helper falls back to
 * the legacy header so the dashboard can still be exercised before the
 * client-side wallet sign-in flow lands.
 */

import { NextRequest } from "next/server";
import { getSessionWallet, isValidSolanaAddress } from "@/lib/wallet-session";
import { getOrCreateMerchantByWallet, validateApiKey } from "@/lib/db";

export interface MerchantSession {
    valid: true;
    merchantId: string;
    merchantWallet: string;
    merchantName: string;
}

export async function requireMerchantSession(
    request: NextRequest,
): Promise<MerchantSession | null> {
    let wallet = getSessionWallet(request);

    // Dev-only: allow the legacy header until all clients migrate.
    // Production builds must not set this env var.
    if (
        !wallet &&
        process.env.NODE_ENV !== "production" &&
        process.env.ALLOW_HEADER_AUTH === "true"
    ) {
        const headerWallet = request.headers.get("x-merchant-wallet");
        if (headerWallet && isValidSolanaAddress(headerWallet)) {
            wallet = headerWallet;
        }
    }

    if (!wallet) return null;

    try {
        const merchant = await getOrCreateMerchantByWallet(wallet);
        return {
            valid: true,
            merchantId: merchant.id,
            merchantWallet: merchant.walletAddress || wallet,
            merchantName: merchant.name,
        };
    } catch {
        return null;
    }
}

/**
 * Authenticate a merchant via EITHER an API key (`x-api-key` header or
 * `Authorization: Bearer <key>`) OR the browser session cookie. Use this on
 * routes that must serve both the dashboard (session) and the SDK / REST API
 * (API key) — e.g. invoices. Returns null if neither succeeds.
 */
export async function requireMerchantAuth(
    request: NextRequest,
): Promise<MerchantSession | null> {
    const apiKey =
        request.headers.get("x-api-key") ||
        request.headers.get("authorization")?.replace(/^Bearer /i, "");

    if (apiKey) {
        const v = await validateApiKey(apiKey);
        if (v.valid && v.merchantId && v.merchantWallet) {
            return {
                valid: true,
                merchantId: v.merchantId,
                merchantWallet: v.merchantWallet,
                merchantName: v.merchantName || "Merchant",
            };
        }
        // An explicit but invalid API key is a hard failure — don't silently
        // fall through to session auth.
        return null;
    }

    return requireMerchantSession(request);
}
