/**
 * One-Click Payments API
 * 
 * Enables frictionless repeat payments for returning customers.
 * 
 * Flow:
 * 1. Customer authenticates (Privy email/social)
 * 2. Customer approves spending limit for a merchant
 * 3. Merchant can charge up to that limit without popups
 * 
 * Uses Privy embedded wallets for server-side signing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export interface SpendingApproval {
    id: string;
    customer_wallet: string;
    customer_email?: string;
    merchant_wallet: string;
    spending_limit: number;        // Max USDC amount approved
    amount_spent: number;          // USDC already charged
    expires_at: string;            // ISO timestamp
    status: 'active' | 'expired' | 'revoked';
    created_at: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json({ error: 'Missing action' }, { status: 400 });
        }

        switch (action) {
            case 'approve': {
                // Customer approves spending limit for a merchant
                const { customerWallet, customerEmail, merchantWallet, spendingLimit, expiresInDays = 30 } = body;

                if (!customerWallet || !merchantWallet || !spendingLimit) {
                    return NextResponse.json(
                        { error: 'Missing: customerWallet, merchantWallet, spendingLimit' },
                        { status: 400 }
                    );
                }

                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + expiresInDays);

                const approval: Partial<SpendingApproval> = {
                    customer_wallet: customerWallet,
                    customer_email: customerEmail,
                    merchant_wallet: merchantWallet,
                    spending_limit: spendingLimit,
                    amount_spent: 0,
                    expires_at: expiresAt.toISOString(),
                    status: 'active',
                };

                if (supabase) {
                    const { data, error } = await supabase
                        .from('spending_approvals')
                        .upsert(approval, {
                            onConflict: 'customer_wallet,merchant_wallet'
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    return NextResponse.json({
                        success: true,
                        approval: data,
                        message: `One-click payments enabled! Merchant can charge up to $${spendingLimit} USDC.`,
                    });
                }

                // Demo mode without Supabase
                return NextResponse.json({
                    success: true,
                    demo: true,
                    approval: { ...approval, id: 'demo-' + Date.now() },
                    message: `One-click approval simulated for $${spendingLimit} USDC`,
                });
            }

            case 'check': {
                // Check if customer has active approval for merchant
                const { customerWallet, merchantWallet } = body;

                if (!customerWallet || !merchantWallet) {
                    return NextResponse.json(
                        { error: 'Missing: customerWallet, merchantWallet' },
                        { status: 400 }
                    );
                }

                if (supabase) {
                    const { data } = await supabase
                        .from('spending_approvals')
                        .select('*')
                        .eq('customer_wallet', customerWallet)
                        .eq('merchant_wallet', merchantWallet)
                        .eq('status', 'active')
                        .gt('expires_at', new Date().toISOString())
                        .single();

                    if (data) {
                        const remaining = data.spending_limit - data.amount_spent;
                        return NextResponse.json({
                            success: true,
                            hasApproval: true,
                            approval: data,
                            remainingLimit: remaining,
                            canOneClick: remaining > 0,
                        });
                    }
                }

                return NextResponse.json({
                    success: true,
                    hasApproval: false,
                    message: 'No active approval found',
                });
            }

            case 'charge': {
                // Merchant charges customer (one-click)
                const { customerWallet, merchantWallet, amount, memo } = body;

                if (!customerWallet || !merchantWallet || !amount) {
                    return NextResponse.json(
                        { error: 'Missing: customerWallet, merchantWallet, amount' },
                        { status: 400 }
                    );
                }

                if (!supabase) {
                    return NextResponse.json({
                        success: true,
                        demo: true,
                        message: `Demo: Would charge $${amount} USDC from ${customerWallet}`,
                        txSignature: 'demo-tx-' + Date.now(),
                    });
                }

                // Check approval exists and has sufficient limit
                const { data: approval } = await supabase
                    .from('spending_approvals')
                    .select('*')
                    .eq('customer_wallet', customerWallet)
                    .eq('merchant_wallet', merchantWallet)
                    .eq('status', 'active')
                    .gt('expires_at', new Date().toISOString())
                    .single();

                if (!approval) {
                    return NextResponse.json(
                        { error: 'No active approval found. Customer must approve one-click payments first.' },
                        { status: 403 }
                    );
                }

                const remaining = approval.spending_limit - approval.amount_spent;
                if (amount > remaining) {
                    return NextResponse.json(
                        { error: `Exceeds spending limit. Remaining: $${remaining.toFixed(2)}` },
                        { status: 403 }
                    );
                }

                // Execute the payment via gasless API
                // In production, this would use Privy server SDK to sign on behalf of customer
                const gaslessResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gasless`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'transfer',
                        amount: Math.floor(amount * 1_000_000),
                        token: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC devnet
                        source: customerWallet,
                        destination: merchantWallet,
                    }),
                });

                if (!gaslessResponse.ok) {
                    const error = await gaslessResponse.json();
                    throw new Error(error.error || 'Payment failed');
                }

                // Update spent amount
                await supabase
                    .from('spending_approvals')
                    .update({
                        amount_spent: approval.amount_spent + amount
                    })
                    .eq('id', approval.id);

                const gaslessData = await gaslessResponse.json();

                return NextResponse.json({
                    success: true,
                    charged: amount,
                    remainingLimit: remaining - amount,
                    transaction: gaslessData.transaction,
                    message: `Charged $${amount} USDC via one-click`,
                });
            }

            case 'revoke': {
                // Customer revokes merchant's one-click access
                const { customerWallet, merchantWallet } = body;

                if (!customerWallet || !merchantWallet) {
                    return NextResponse.json(
                        { error: 'Missing: customerWallet, merchantWallet' },
                        { status: 400 }
                    );
                }

                if (supabase) {
                    await supabase
                        .from('spending_approvals')
                        .update({ status: 'revoked' })
                        .eq('customer_wallet', customerWallet)
                        .eq('merchant_wallet', merchantWallet);
                }

                return NextResponse.json({
                    success: true,
                    message: 'One-click access revoked',
                });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (error) {
        console.error('[OneClick] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const customerWallet = params.get('customer');
    const merchantWallet = params.get('merchant');

    if (customerWallet && merchantWallet) {
        return POST(new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ action: 'check', customerWallet, merchantWallet }),
            headers: { 'Content-Type': 'application/json' },
        }));
    }

    return NextResponse.json({
        error: 'Provide ?customer=<wallet>&merchant=<wallet>'
    }, { status: 400 });
}
