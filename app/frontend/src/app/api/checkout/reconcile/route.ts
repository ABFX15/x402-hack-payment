/**
 * Reconciliation sweeper — the backstop that makes checkout reliable.
 *
 * The buyer's browser reports the payment (POST /complete) and, when Helius is
 * configured, a webhook confirms it too. If BOTH miss (tab closed + webhook
 * down), the money is on-chain but the session is stuck "pending" and the
 * merchant never gets told. This job re-checks every pending Solana session
 * against the chain via its Solana Pay reference key and self-completes any that
 * were actually paid — then expires the ones that never were.
 *
 * Runs on a cron (see vercel.json). Idempotent: it routes through the same
 * finalizeCheckoutPayment as /complete, so re-running it is always safe.
 *
 * Guarded by CRON_SECRET in production (Bearer header, matching the other crons).
 */

import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { logger } from "@/lib/logger";
import { SOLANA_RPC_URL } from "@/lib/constants";
import {
  listPendingCheckoutSessions,
  updateCheckoutSession,
} from "@/lib/db";
import { finalizeCheckoutPayment } from "@/lib/checkout-finalize";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";
// Only sweep sessions old enough that the client had a fair chance to report
// (avoids racing a payment that's completing right now).
const MIN_AGE_MS = 60_000;

async function handle(request: NextRequest) {
  if (
    CRON_SECRET &&
    process.env.NODE_ENV === "production" &&
    request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const sessions = await listPendingCheckoutSessions(200, now - MIN_AGE_MS);
  const connection = new Connection(SOLANA_RPC_URL, "confirmed");

  let recovered = 0;
  let expired = 0;
  let stillPending = 0;

  for (const session of sessions) {
    const reference = (session.metadata as { reference?: string } | undefined)
      ?.reference;

    // EVM-only checkouts have no Solana reference to scan; leave them for the
    // client/webhook (server-side EVM log scanning is a later enhancement).
    if (reference) {
      try {
        const sigs = await connection.getSignaturesForAddress(
          new PublicKey(reference),
          { limit: 5 },
        );
        const hit = sigs.find(
          (s) =>
            !s.err &&
            (s.confirmationStatus === "confirmed" ||
              s.confirmationStatus === "finalized"),
        );
        if (hit) {
          // Recover the payer for the record; not security-critical.
          let payer = "unknown";
          try {
            const tx = await connection.getParsedTransaction(hit.signature, {
              maxSupportedTransactionVersion: 0,
            });
            payer =
              tx?.transaction.message.accountKeys
                .find((k) => k.signer)
                ?.pubkey.toBase58() || "unknown";
          } catch {
            /* best-effort */
          }
          const res = await finalizeCheckoutPayment({
            session,
            signature: hit.signature,
            customerWallet: payer,
          });
          if (res.ok) {
            recovered++;
            logger.info(
              `[reconcile] recovered stuck session ${session.id} via ${hit.signature}`,
            );
            continue;
          }
          // Verification failed (e.g. underpaid) — leave pending for now.
        }
      } catch (e) {
        logger.warn(`[reconcile] scan failed for ${session.id}:`, e);
        stillPending++;
        continue;
      }
    }

    // No confirmed payment found — expire it once past its window.
    if (now > session.expiresAt) {
      await updateCheckoutSession(session.id, { status: "expired" });
      expired++;
    } else {
      stillPending++;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: sessions.length,
    recovered,
    expired,
    stillPending,
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}
