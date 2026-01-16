-- One-Click Payments: Spending Approvals
-- Enables frictionless repeat payments for returning customers

CREATE TABLE IF NOT EXISTS spending_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer info
    customer_wallet TEXT NOT NULL,
    customer_email TEXT,
    
    -- Merchant receiving approval
    merchant_wallet TEXT NOT NULL,
    
    -- Spending limits
    spending_limit DECIMAL(18, 6) NOT NULL,  -- Max USDC amount approved
    amount_spent DECIMAL(18, 6) DEFAULT 0,   -- USDC already charged
    
    -- Validity
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Each customer can have one approval per merchant
    UNIQUE(customer_wallet, merchant_wallet)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spending_approvals_customer ON spending_approvals(customer_wallet);
CREATE INDEX IF NOT EXISTS idx_spending_approvals_merchant ON spending_approvals(merchant_wallet);
CREATE INDEX IF NOT EXISTS idx_spending_approvals_status ON spending_approvals(status);

-- One-Click Payment Log
CREATE TABLE IF NOT EXISTS one_click_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID REFERENCES spending_approvals(id),
    
    customer_wallet TEXT NOT NULL,
    merchant_wallet TEXT NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    
    tx_signature TEXT,
    memo TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_one_click_payments_approval ON one_click_payments(approval_id);
CREATE INDEX IF NOT EXISTS idx_one_click_payments_customer ON one_click_payments(customer_wallet);

-- Update trigger
CREATE OR REPLACE FUNCTION update_spending_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_spending_approvals_updated_at
    BEFORE UPDATE ON spending_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_spending_approvals_updated_at();

-- RLS
ALTER TABLE spending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_click_payments ENABLE ROW LEVEL SECURITY;

-- Allow all for demo (in production: auth.uid() checks)
CREATE POLICY "Allow all spending_approvals" ON spending_approvals FOR ALL USING (true);
CREATE POLICY "Allow all one_click_payments" ON one_click_payments FOR ALL USING (true);
