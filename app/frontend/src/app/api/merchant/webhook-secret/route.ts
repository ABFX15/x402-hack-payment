/**
 * GET /api/merchant/webhook-secret
 *
 * Returns the authenticated merchant's webhook signing secret — the value
 * Offbank uses to sign outbound webhooks, so the merchant can verify them with
 * @offbank/sdk's webhooks.verify(). Session-authenticated (dashboard only).
 */

import { NextRequest, NextResponse } from "next/server";
import { requireMerchantSession } from "@/lib/merchant-auth";
import { deriveMerchantWebhookSecret } from "@/lib/webhook-secret";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireMerchantSession(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    secret: deriveMerchantWebhookSecret(auth.merchantId),
    signatureHeader: "X-Offbank-Signature",
    scheme: "HMAC-SHA256 over `${t}.${rawBody}`, header format t=<ms>,v1=<hex>",
  });
}
