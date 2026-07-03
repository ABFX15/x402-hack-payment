/**
 * The single, authoritative path that turns a checkout session into a
 * completed, verified payment. Used by BOTH:
 *   • POST /api/checkout/complete   (client reports the tx after paying), and
 *   • the reconciliation sweeper     (server finds the tx on-chain itself).
 *
 * Every completion — no matter who triggers it — goes through here so the
 * guarantees hold uniformly:
 *   1. Verify the payment on-chain (Solana OR EVM) against the server-fixed
 *      session amount. Nothing is trusted from the browser.
 *   2. Screen both parties (Solana) for sanctions/risk.
 *   3. Flip the session pending → completed ATOMICALLY (compare-and-set), so
 *      two concurrent completions can't both fulfil the order.
 *   4. Record the payment idempotently (UNIQUE tx_signature).
 *   5. Deliver a signed, durably-recorded webhook to the merchant.
 */

import crypto from "crypto";
import { logger } from "@/lib/logger";
import { explorerUrl } from "@/lib/constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { signPayload } from "@/lib/webhooks";
import { screenPaymentParties } from "@/lib/range";
import { verifyUsdcTransferToMerchant } from "@/lib/verify-payment";
import { verifyEvmUsdcTransfer, isEvmTxHash } from "@/lib/evm-verify";
import { isEvmAddress, EVM_CHAINS, type EvmChainKey } from "@/lib/evm";
import { deriveMerchantWebhookSecret } from "@/lib/webhook-secret";
import {
  completeCheckoutSessionAtomic,
  createPayment,
  getPaymentBySessionId,
  type CheckoutSession,
} from "@/lib/db";

export interface FinalizeArgs {
  session: CheckoutSession;
  signature: string;
  customerWallet: string;
  /** For EVM payments, which chain the tx is on. Ignored for Solana. */
  evmChain?: EvmChainKey;
}

export interface FinalizeResult {
  ok: boolean;
  paymentId?: string;
  alreadyCompleted?: boolean;
  /** machine-readable failure reason */
  code?:
    | "verification_failed"
    | "risk_blocked"
    | "evm_not_configured"
    | "error";
  error?: string;
  blockedParty?: "payer" | "merchant";
}

export async function finalizeCheckoutPayment(
  args: FinalizeArgs,
): Promise<FinalizeResult> {
  const { session, signature, customerWallet, evmChain } = args;

  // ── 1. Verify on-chain (chain inferred from the signature shape) ──────────
  const isEvm = isEvmTxHash(signature);
  let verify;
  if (isEvm) {
    const merchantEvm = session.metadata?.evm;
    if (!merchantEvm || !isEvmAddress(merchantEvm)) {
      return {
        ok: false,
        code: "evm_not_configured",
        error: "This checkout has no EVM receiving address configured.",
      };
    }
    const chain: EvmChainKey =
      evmChain && EVM_CHAINS[evmChain] ? evmChain : "base";
    verify = await verifyEvmUsdcTransfer({
      txHash: signature,
      merchant: merchantEvm,
      chain,
      totalUsdc: session.amount,
    });
  } else {
    verify = await verifyUsdcTransferToMerchant({
      signature,
      merchantWallet: session.merchantWallet,
      totalUsdc: session.amount,
    });
  }

  if (!verify.ok) {
    return {
      ok: false,
      code: "verification_failed",
      error: verify.error || "Could not verify this payment on-chain.",
    };
  }

  // ── 2. Sanctions / risk screening (Solana addresses only) ─────────────────
  // Range screens Solana wallets; EVM payer screening uses a different provider,
  // so for EVM we screen only the merchant side and never hard-block on the
  // 0x payer here.
  try {
    const payerToScreen = isEvm ? session.merchantWallet : customerWallet;
    const risk = await screenPaymentParties(payerToScreen, session.merchantWallet, {
      testMode: process.env.NODE_ENV !== "production",
    });
    if (!risk.canProceed) {
      logger.warn(`[checkout] blocked by risk screening: ${risk.blockedParty}`, {
        sessionId: session.id,
      });
      return {
        ok: false,
        code: "risk_blocked",
        blockedParty: risk.blockedParty as "payer" | "merchant",
        error:
          risk.blockedParty === "payer"
            ? risk.payer.summary
            : risk.merchant.summary,
      };
    }
  } catch (e) {
    // Screening outage must not silently pass a payment through in production.
    if (process.env.NODE_ENV === "production") {
      logger.error("[checkout] risk screening error:", e);
      return {
        ok: false,
        code: "error",
        error: "Risk screening is temporarily unavailable.",
      };
    }
  }

  // ── 3. Atomic pending → completed (only the winner proceeds) ──────────────
  const completed = await completeCheckoutSessionAtomic(session.id);
  if (!completed) {
    // Another completion (client retry, webhook, or sweeper) already won.
    const existing = await getPaymentBySessionId(session.id);
    return { ok: true, alreadyCompleted: true, paymentId: existing?.id };
  }

  // ── 4. Record the payment (idempotent on tx_signature) ────────────────────
  const payment = await createPayment({
    sessionId: session.id,
    merchantId: session.merchantId,
    merchantName: session.merchantName,
    merchantWallet: session.merchantWallet,
    customerWallet,
    amount: session.amount,
    currency: session.currency,
    description: session.description,
    metadata: session.metadata,
    txSignature: signature,
    explorerUrl: explorerUrl(signature),
    createdAt: session.createdAt,
    completedAt: Date.now(),
    status: "completed",
  });

  // ── 5. Merchant webhook — signed + durably recorded, fire-and-forget ──────
  if (session.webhookUrl) {
    deliverCheckoutWebhook(session, payment.id, signature, customerWallet).catch(
      (err) => logger.error("[checkout] webhook delivery failed:", err),
    );
  }

  return { ok: true, paymentId: payment.id };
}

// ── Webhook delivery ────────────────────────────────────────────────────────

const WEBHOOK_MAX_ATTEMPTS = 4;

/** Deliver the `payment.completed` webhook: HMAC-signed with a per-merchant
 * secret, retried with backoff, and recorded in webhook_deliveries so a failed
 * delivery is durable and can be inspected / redelivered. */
export async function deliverCheckoutWebhook(
  session: CheckoutSession,
  paymentId: string,
  signature: string,
  customerWallet: string,
): Promise<void> {
  if (!session.webhookUrl) return;

  const timestamp = Date.now();
  const payload = {
    event: "payment.completed",
    data: {
      paymentId,
      sessionId: session.id,
      merchantId: session.merchantId,
      amount: session.amount,
      currency: session.currency,
      customerWallet,
      paymentSignature: signature,
      description: session.description,
      metadata: session.metadata,
      completedAt: timestamp,
      receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://offbankpay.com"}/receipts/${paymentId}`,
    },
    timestamp,
  };
  const body = JSON.stringify(payload);
  const secret = deriveMerchantWebhookSecret(session.merchantId);
  const sig = signPayload(`${timestamp}.${body}`, secret);

  let attempts = 0;
  let httpStatus: number | undefined;
  let lastError: string | undefined;

  for (let i = 1; i <= WEBHOOK_MAX_ATTEMPTS; i++) {
    attempts = i;
    try {
      const res = await fetch(session.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Offbank-Signature": `t=${timestamp},v1=${sig}`,
          "X-Offbank-Event": "payment.completed",
        },
        body,
      });
      httpStatus = res.status;
      if (res.ok) {
        await recordDelivery(session, paymentId, "success", {
          attempts,
          httpStatus,
        });
        return;
      }
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "network error";
    }
    if (i < WEBHOOK_MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }

  await recordDelivery(session, paymentId, "failed", {
    attempts,
    httpStatus,
    error: lastError,
  });
  throw new Error(
    `webhook delivery failed after ${attempts} attempts: ${lastError}`,
  );
}

/** Best-effort durable record of a webhook delivery outcome. Never throws. */
async function recordDelivery(
  session: CheckoutSession,
  paymentId: string,
  status: "success" | "failed",
  meta: { attempts: number; httpStatus?: number; error?: string },
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const eventId = `evt_${crypto.randomBytes(12).toString("hex")}`;
    await supabase.from("webhook_events").insert({
      id: eventId,
      type: "payment.completed",
      merchant_id: session.merchantId,
      data: { paymentId, sessionId: session.id, amount: session.amount },
    });
    await supabase.from("webhook_deliveries").insert({
      id: `del_${crypto.randomBytes(12).toString("hex")}`,
      event_id: eventId,
      webhook_id: `checkout:${session.id}`,
      url: session.webhookUrl,
      status,
      http_status: meta.httpStatus ?? null,
      attempts: meta.attempts,
      max_attempts: WEBHOOK_MAX_ATTEMPTS,
      last_attempt_at: new Date().toISOString(),
      error_message: meta.error ?? null,
    });
  } catch (e) {
    logger.warn("[checkout] could not record webhook delivery:", e);
  }
}
