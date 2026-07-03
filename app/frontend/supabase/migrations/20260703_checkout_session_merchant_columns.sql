-- Make param-mode (wallet-keyed) checkout sessions durable.
--
-- checkout_sessions.merchant_id is a UUID FK to merchants(id). The drop-in
-- widget's simplest call — OffbankCheckout.open({merchant: <wallet>, amount}) —
-- passed a raw wallet as merchant_id, which failed the UUID/FK constraint and
-- silently fell back to in-memory. On serverless that memory doesn't survive
-- between requests, so /complete couldn't find the session (no verified record,
-- no webhook). We now resolve the wallet to a real merchant record, and also
-- store the merchant's wallet/name/webhook directly on the session so read-back
-- never depends on the merchants join.
--
-- Idempotent — safe to re-run.

alter table public.checkout_sessions
  add column if not exists merchant_wallet text,
  add column if not exists merchant_name   text,
  add column if not exists webhook_url      text;
