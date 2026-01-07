/**
 * Privy Server-Side SDK Utilities
 *
 * Used for gasless transactions with Privy's managed wallets as fee payers.
 * Requires PRIVY_APP_ID, PRIVY_APP_SECRET, and optionally PRIVY_AUTHORIZATION_KEY
 */

import { PrivyClient } from "@privy-io/server-auth";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

// Environment validation
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_AUTHORIZATION_KEY = process.env.PRIVY_AUTHORIZATION_KEY;

// Fee payer wallet ID - created in Privy dashboard as a managed wallet
const FEE_PAYER_WALLET_ID = process.env.PRIVY_FEE_PAYER_WALLET_ID;

let privyClient: PrivyClient | null = null;

/**
 * Get or create the Privy server client
 */
export function getPrivyClient(): PrivyClient {
    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
        throw new Error(
            "Privy server not configured. Set PRIVY_APP_ID and PRIVY_APP_SECRET."
        );
    }

    if (!privyClient) {
        privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET, {
            walletApi: PRIVY_AUTHORIZATION_KEY
                ? { authorizationPrivateKey: PRIVY_AUTHORIZATION_KEY }
                : undefined,
        });
    }

    return privyClient;
}

/**
 * Check if Privy gasless is enabled
 */
export function isPrivyGaslessEnabled(): boolean {
    return !!(PRIVY_APP_ID && PRIVY_APP_SECRET && FEE_PAYER_WALLET_ID);
}

/**
 * Get the fee payer wallet ID
 */
export function getFeePayerWalletId(): string | undefined {
    return FEE_PAYER_WALLET_ID;
}

/**
 * Sign and send a transaction using a Privy wallet
 *
 * @param walletId - The wallet ID to sign with (user's embedded wallet or fee payer)
 * @param transaction - The transaction to sign and send
 * @param caip2 - The CAIP-2 chain ID (e.g., 'solana:devnet')
 * @param sponsor - Whether to sponsor gas fees
 */
export async function signAndSendTransaction({
    walletId,
    transaction,
    caip2,
    sponsor = false,
}: {
    walletId: string;
    transaction: Transaction | VersionedTransaction;
    caip2:
    | "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
    | "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
    | "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z";
    sponsor?: boolean;
}): Promise<{ hash: string }> {
    const client = getPrivyClient();

    // Note: The wallet address/chainType are deprecated but still required
    // We need to get them from the wallet first
    const wallet = await client.walletApi.getWallet({ id: walletId });

    const result = await client.walletApi.solana.signAndSendTransaction({
        address: wallet.address,
        chainType: "solana",
        transaction,
        caip2,
        sponsor,
    });

    return { hash: result.hash };
}

/**
 * Sign a transaction using a Privy wallet (partial sign, doesn't send)
 *
 * @param walletId - The wallet ID to sign with
 * @param transaction - The transaction to sign
 */
export async function signTransaction({
    walletId,
    transaction,
}: {
    walletId: string;
    transaction: Transaction | VersionedTransaction;
}): Promise<{ signedTransaction: Transaction | VersionedTransaction }> {
    const client = getPrivyClient();

    const wallet = await client.walletApi.getWallet({ id: walletId });

    const result = await client.walletApi.solana.signTransaction({
        address: wallet.address,
        chainType: "solana",
        transaction,
    });

    return { signedTransaction: result.signedTransaction };
}

/**
 * Get wallet info from the API
 */
export async function getWallet(walletId: string) {
    const client = getPrivyClient();
    return client.walletApi.getWallet({ id: walletId });
}
