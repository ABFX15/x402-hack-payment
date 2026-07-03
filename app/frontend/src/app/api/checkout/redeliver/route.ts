/**
 * POST /api/checkout/redeliver  { sessionId }
 *
 * Re-fire the `payment.completed` webhook for a completed checkout session.
 * For when a merchant's endpoint was down during the original attempts — the
 * delivery outcome is recorded durably (webhook_deliveries), and this lets them
 * replay it. Merchant-authenticated; a merchant can only redeliver their own
 * sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { requireMerchantSession } from "@/lib/merchant-auth";
import { getCheckoutSession, getPaymentBySessionId } from "@/lib/db";
import { deliverCheckoutWebhook } from "@/lib/checkout-finalize";

export async function POST(request: NextRequest) {
  const auth = await requireMerchantSession(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string;
  try {
    ({ sessionId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = await getCheckoutSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  // Ownership: the session's merchant must be the authenticated merchant.
  if (
    session.merchantId !== auth.merchantId &&
    session.merchantWallet !== auth.merchantWallet
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!session.webhookUrl) {
    return NextResponse.json(
      { error: "This session has no webhook URL configured." },
      { status: 400 },
    );
  }
  const payment = await getPaymentBySessionId(sessionId);
  if (!payment) {
    return NextResponse.json(
      { error: "No completed payment for this session." },
      { status: 400 },
    );
  }

  try {
    await deliverCheckoutWebhook(
      session,
      payment.id,
      payment.txSignature,
      payment.customerWallet,
    );
    return NextResponse.json({ ok: true, delivered: true });
  } catch (e) {
    logger.warn(`[checkout/redeliver] failed for ${sessionId}:`, e);
    return NextResponse.json(
      { ok: false, error: "Delivery failed; recorded for another retry." },
      { status: 502 },
    );
  }
}
