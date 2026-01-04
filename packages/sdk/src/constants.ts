import { PublicKey } from '@solana/web3.js';

// USDC Mint addresses
export const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// USDT Mint addresses
export const USDT_MINT_DEVNET = new PublicKey('EJwZgeZrdC8TXTQbQBoL6bfuAnFUQS7QrP5KpEgk3aSm'); // Devnet USDT (may vary)
export const USDT_MINT_MAINNET = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');

// Supported tokens
export const SUPPORTED_TOKENS = {
    USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        mint: {
            devnet: USDC_MINT_DEVNET,
            'mainnet-beta': USDC_MINT_MAINNET,
        },
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    },
    USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        mint: {
            devnet: USDT_MINT_DEVNET,
            'mainnet-beta': USDT_MINT_MAINNET,
        },
        logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    },
} as const;

export type SupportedToken = keyof typeof SUPPORTED_TOKENS;

// Settlr API URLs
export const SETTLR_API_URL = {
    production: 'https://settlr.dev/api',
    development: 'http://localhost:3000/api',
} as const;

// Settlr checkout URLs (embedded wallet checkout)
export const SETTLR_CHECKOUT_URL = {
    production: 'https://settlr.dev/checkout',
    development: 'http://localhost:3000/checkout',
} as const;

// Supported networks
export const SUPPORTED_NETWORKS = ['devnet', 'mainnet-beta'] as const;
export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

// Token decimals (default for stablecoins)
export const USDC_DECIMALS = 6;
export const USDT_DECIMALS = 6;

// Solana RPC endpoints
export const DEFAULT_RPC_ENDPOINTS = {
    devnet: 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
} as const;

/**
 * Get token mint address for a specific network
 */
export function getTokenMint(token: SupportedToken, network: SupportedNetwork): PublicKey {
    return SUPPORTED_TOKENS[token].mint[network];
}

/**
 * Get token decimals
 */
export function getTokenDecimals(token: SupportedToken): number {
    return SUPPORTED_TOKENS[token].decimals;
}

