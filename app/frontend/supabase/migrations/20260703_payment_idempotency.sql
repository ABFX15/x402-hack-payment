-- Payment idempotency: one on-chain transaction can settle at most one payment.
--
-- Without this, a webhook firing twice, a client retry, and the reconciliation
-- sweeper could each record the same transaction as a separate payment (and
-- re-fire the merchant's fulfilment webhook). A partial UNIQUE index on the
-- transaction signature makes createPayment() collide (Postgres error 23505),
-- which the app catches and treats as an idempotent success.
--
-- Partial (WHERE tx_signature IS NOT NULL) so rows that legitimately have no
-- signature yet are unaffected, and Postgres would otherwise allow multiple
-- NULLs anyway.
--
-- NOTE: if this fails to create because pre-existing duplicate signatures exist,
-- de-duplicate first:
--   DELETE FROM payments a USING payments b
--   WHERE a.ctid < b.ctid AND a.tx_signature = b.tx_signature;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_payments_tx_signature
    ON payments (tx_signature)
    WHERE tx_signature IS NOT NULL;
