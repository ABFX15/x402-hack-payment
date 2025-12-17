import { PublicKey } from '@solana/web3.js';

// USDC Mint addresses
export const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Settlr API URLs
export const SETTLR_API_URL = {
    production: 'https://settlr.dev/api',
    development: 'http://localhost:3000/api',
} as const;

// Settlr checkout URLs
export const SETTLR_CHECKOUT_URL = {
    production: 'https://settlr.dev/pay',
    development: 'http://localhost:3000/pay',
} as const;

// Supported networks
export const SUPPORTED_NETWORKS = ['devnet', 'mainnet-beta'] as const;
export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

// USDC decimals
export const USDC_DECIMALS = 6;

// Solana RPC endpoints
export const DEFAULT_RPC_ENDPOINTS = {
    devnet: 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
} as const;

