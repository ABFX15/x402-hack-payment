-- Settlr Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(44) NOT NULL,
    webhook_url TEXT,
    webhook_secret VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_wallet_address UNIQUE (wallet_address)
);

-- Checkout sessions table
CREATE TABLE IF NOT EXISTS checkout_sessions (
    id VARCHAR(32) PRIMARY KEY, -- cs_xxxx format
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount DECIMAL(18, 6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    description TEXT,
    metadata JSONB,
    success_url TEXT NOT NULL,
    cancel_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(24) PRIMARY KEY, -- pay_xxxx format
    session_id VARCHAR(32) REFERENCES checkout_sessions(id) ON DELETE SET NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_wallet VARCHAR(44) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    description TEXT,
    metadata JSONB,
    tx_signature VARCHAR(88) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'partially_refunded')),
    refunded_amount DECIMAL(18, 6),
    refund_signature VARCHAR(88),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_tx_signature UNIQUE (tx_signature)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_merchant ON checkout_sessions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_wallet);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_completed_at ON payments(completed_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at
    BEFORE UPDATE ON checkout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Enable for production
-- For now, we'll allow all operations (disable RLS)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (API key)
CREATE POLICY "Allow all for service role" ON merchants FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON checkout_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON payments FOR ALL USING (true);

-- Sample merchant for testing (optional)
-- INSERT INTO merchants (name, wallet_address) 
-- VALUES ('Test Merchant', 'YOUR_WALLET_ADDRESS_HERE');
