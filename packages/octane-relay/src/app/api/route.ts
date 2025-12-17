import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getConfig } from '@/config';
import { getFeePayerKeypair } from '@/relay';

export async function GET() {
    try {
        const config = getConfig();
        const feePayer = getFeePayerKeypair().publicKey;
        const feePayerBase58 = feePayer.toBase58();

        // Include fee account (ATA) for each token
        const tokensWithAccounts = await Promise.all(
            config.tokens.map(async (t) => {
                const feeAccount = await getAssociatedTokenAddress(
                    new PublicKey(t.mint),
                    feePayer
                );
                return {
                    mint: t.mint,
                    symbol: t.symbol,
                    decimals: t.decimals,
                    fee: t.fee,
                    account: feeAccount.toBase58(),
                };
            })
        );

        return NextResponse.json({
            feePayer: feePayerBase58,
            endpoints: {
                transfer: {
                    tokens: tokensWithAccounts,
                },
            },
            rateLimit: config.rateLimit,
        });
    } catch (error) {
        console.error('Config error:', error);
        return NextResponse.json(
            { error: 'Relay not configured' },
            { status: 500 }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
