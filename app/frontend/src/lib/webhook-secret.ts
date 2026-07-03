/**
 * Per-merchant webhook signing secret.
 *
 * Derived deterministically from the platform SESSION_SECRET so it's stable
 * (no storage needed) and unguessable (a caller can't derive it without the
 * platform secret). The SAME value is used to sign outbound webhooks and is
 * shown to the merchant in the dashboard, so they can verify signatures with
 * @offbank/sdk's webhooks.verify().
 */

import crypto from "crypto";

export function deriveMerchantWebhookSecret(merchantId: string): string {
  const base = process.env.SESSION_SECRET || process.env.OFFBANK_WEBHOOK_SECRET;
  const hex = base
    ? crypto
        .createHmac("sha256", base)
        .update(`webhook:${merchantId}`)
        .digest("hex")
    : // Dev fallback when no platform secret is set — still stable per merchant.
      crypto.createHash("sha256").update(`offbank-dev:${merchantId}`).digest("hex");
  return `whsec_${hex}`;
}
