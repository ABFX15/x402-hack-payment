-- Self-serve affiliate registrations.
-- An affiliate opens an operator's invite link (/join/<merchant_wallet>) and
-- registers their own payout details, so the operator never types them in.
create table if not exists affiliate_registrations (
    id uuid primary key default gen_random_uuid(),
    merchant_wallet text not null,
    name text not null,
    email text not null,
    payout_wallet text,
    created_at timestamptz not null default now(),
    unique (merchant_wallet, email)
);

create index if not exists idx_affiliate_reg_merchant
    on affiliate_registrations (merchant_wallet);

-- Writes/reads go through server routes using the service role key, so keep
-- RLS on with no anon policies (locked down by default).
alter table affiliate_registrations enable row level security;
