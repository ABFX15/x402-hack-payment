/**
 * Jupiter Swap Integration
 * 
 * Enables payment with any Solana token by swapping to USDC.
 * Uses Jupiter's V6 API for best-price routing.
 * 
 * Flow:
 * 1. Customer selects token (SOL, BONK, etc.)
 * 2. Get quote from Jupiter for token → USDC
 * 3. Execute swap transaction
 * 4. Transfer USDC to merchant
 * 
 * Docs: https://station.jup.ag/docs/apis/swap-api
 */

import { VersionedTransaction, Connection, PublicKey } from "@solana/web3.js";

const JUPITER_API_URL = "https://quote-api.jup.ag/v6";

// USDC mint on Solana
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Token info interface
export interface TokenInfo {
    symbol: string;
    name: string;
    mint: string;
    decimals: number;
    logoURI: string;
}

// Popular tokens on Solana with their mint addresses
export const SOLANA_TOKENS: Record<string, TokenInfo> = {
    SOL: {
        symbol: "SOL",
        name: "Solana",
        mint: "So11111111111111111111111111111111111111112", // Wrapped SOL
        decimals: 9,
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
    USDC: {
        symbol: "USDC",
        name: "USD Coin",
        mint: USDC_MINT,
        decimals: 6,
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    },
    USDT: {
        symbol: "USDT",
        name: "Tether USD",
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        decimals: 6,
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
    },
    BONK: {
        symbol: "BONK",
        name: "Bonk",
        mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        decimals: 5,
        logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    },
    JUP: {
        symbol: "JUP",
        name: "Jupiter",
        mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        decimals: 6,
        logoURI: "https://static.jup.ag/jup/icon.png",
    },
    PYTH: {
        symbol: "PYTH",
        name: "Pyth Network",
        mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
        decimals: 6,
        logoURI: "https://pyth.network/token.svg",
    },
    WIF: {
        symbol: "WIF",
        name: "dogwifhat",
        mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        decimals: 6,
        logoURI: "https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link",
    },
    RENDER: {
        symbol: "RENDER",
        name: "Render Token",
        mint: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof",
        decimals: 8,
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png",
    },
    HNT: {
        symbol: "HNT",
        name: "Helium",
        mint: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux",
        decimals: 8,
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux/logo.png",
    },
    RAY: {
        symbol: "RAY",
        name: "Raydium",
        mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        decimals: 6,
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    },
};

export type TokenSymbol = keyof typeof SOLANA_TOKENS;

// Get array of supported tokens for UI
export function getSupportedTokens(): TokenInfo[] {
    return Object.values(SOLANA_TOKENS);
}

// Get token by mint address
export function getTokenByMint(mint: string): TokenInfo | undefined {
    return Object.values(SOLANA_TOKENS).find(t => t.mint === mint);
}

export interface JupiterQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: Array<{
        swapInfo: {
            ammKey: string;
            label: string;
            inputMint: string;
            outputMint: string;
            inAmount: string;
            outAmount: string;
            feeAmount: string;
            feeMint: string;
        };
        percent: number;
    }>;
    contextSlot: number;
    timeTaken: number;
}

export interface SwapResult {
    success: boolean;
    signature?: string;
    error?: string;
    inputAmount: string;
    outputAmount: string;
    inputToken: TokenInfo;
    outputToken: TokenInfo;
}

/**
 * Get a quote for swapping any token to USDC
 * 
 * @param inputMint - The token mint to swap from
 * @param amountInSmallestUnit - Amount in the smallest unit (e.g., lamports for SOL)
 * @param slippageBps - Slippage tolerance in basis points (default: 50 = 0.5%)
 */
export async function getSwapQuote(
    inputMint: string,
    amountInSmallestUnit: string,
    slippageBps: number = 50
): Promise<JupiterQuote> {
    const params = new URLSearchParams({
        inputMint,
        outputMint: USDC_MINT,
        amount: amountInSmallestUnit,
        slippageBps: slippageBps.toString(),
        // Use ExactIn mode - we know how much we're spending
        swapMode: "ExactIn",
    });

    const response = await fetch(`${JUPITER_API_URL}/quote?${params}`);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Jupiter quote error: ${error}`);
    }

    return response.json();
}

/**
 * Get quote for a specific USDC output amount
 * Useful when merchant needs exact amount (e.g., $10.00 USDC)
 * 
 * @param inputMint - The token mint to swap from  
 * @param usdcAmountRaw - USDC amount in smallest unit (e.g., 10000000 for $10)
 */
export async function getQuoteForExactOutput(
    inputMint: string,
    usdcAmountRaw: string,
    slippageBps: number = 50
): Promise<JupiterQuote> {
    const params = new URLSearchParams({
        inputMint,
        outputMint: USDC_MINT,
        amount: usdcAmountRaw,
        slippageBps: slippageBps.toString(),
        swapMode: "ExactOut", // We want exact USDC output
    });

    const response = await fetch(`${JUPITER_API_URL}/quote?${params}`);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Jupiter quote error: ${error}`);
    }

    return response.json();
}

/**
 * Build a swap transaction from a quote
 * Returns a serialized transaction ready for signing
 */
export async function buildSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: string,
    destinationWallet?: string, // If provided, USDC goes here instead of user
    wrapUnwrapSOL: boolean = true
): Promise<string> {
    const response = await fetch(`${JUPITER_API_URL}/swap`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey,
            wrapAndUnwrapSol: wrapUnwrapSOL,
            // If destination provided, route output there
            destinationTokenAccount: destinationWallet,
            // Dynamic slippage for better execution
            dynamicSlippage: { maxBps: 100 },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Jupiter swap error: ${error}`);
    }

    const { swapTransaction } = await response.json();
    return swapTransaction; // Base64 encoded VersionedTransaction
}

/**
 * Execute a swap: deserialize, sign, and send
 */
export async function executeSwap(
    connection: Connection,
    swapTransactionBase64: string,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransactionBase64, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign it
    const signedTransaction = await signTransaction(transaction);

    // Send it
    const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
            skipPreflight: true,
            maxRetries: 2,
        }
    );

    // Wait for confirmation
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        signature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    return signature;
}

/**
 * Calculate how much of a token is needed to get a specific USDC amount
 * Returns the input amount and the quote
 */
export async function calculateInputForUsdcAmount(
    inputMint: string,
    usdcAmount: number, // In dollars (e.g., 10.50)
    slippageBps: number = 50
): Promise<{
    quote: JupiterQuote;
    inputAmountRaw: string;
    inputAmountFormatted: string;
    inputToken: TokenInfo | undefined;
    outputAmountFormatted: string;
    priceImpact: string;
}> {
    const token = getTokenByMint(inputMint);
    const usdcAmountRaw = Math.floor(usdcAmount * 1_000_000).toString();

    const quote = await getQuoteForExactOutput(inputMint, usdcAmountRaw, slippageBps);

    const inputAmountFormatted = token
        ? (Number(quote.inAmount) / Math.pow(10, token.decimals)).toFixed(6)
        : quote.inAmount;

    return {
        quote,
        inputAmountRaw: quote.inAmount,
        inputAmountFormatted,
        inputToken: token,
        outputAmountFormatted: (Number(quote.outAmount) / 1_000_000).toFixed(2),
        priceImpact: quote.priceImpactPct,
    };
}

/**
 * High-level function: Swap any token to USDC and optionally send to merchant
 * 
 * This is the main function to use in the checkout flow:
 * 1. Gets a quote for exact USDC output
 * 2. Builds the swap transaction
 * 3. Signs and sends
 * 4. Returns the result
 */
export async function swapToUsdc(
    connection: Connection,
    userWallet: string,
    inputMint: string,
    usdcAmount: number, // How much USDC the merchant needs
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
    merchantWallet?: string // If provided, USDC goes directly to merchant
): Promise<SwapResult> {
    const inputToken = getTokenByMint(inputMint);
    const outputToken = SOLANA_TOKENS.USDC;

    if (!inputToken) {
        return {
            success: false,
            error: "Unknown input token",
            inputAmount: "0",
            outputAmount: "0",
            inputToken: SOLANA_TOKENS.SOL,
            outputToken,
        };
    }

    try {
        // 1. Get quote for exact output
        const usdcAmountRaw = Math.floor(usdcAmount * 1_000_000).toString();
        console.log(`[Jupiter] Getting quote: ${inputToken.symbol} → ${usdcAmount} USDC`);

        const quote = await getQuoteForExactOutput(inputMint, usdcAmountRaw);
        console.log(`[Jupiter] Need ${quote.inAmount} ${inputToken.symbol} (${quote.priceImpactPct}% impact)`);

        // 2. Build swap transaction
        // Note: merchantWallet destination is handled separately after swap
        // Jupiter doesn't support arbitrary destination for non-ATA
        const swapTx = await buildSwapTransaction(quote, userWallet);
        console.log("[Jupiter] Transaction built");

        // 3. Execute swap
        const signature = await executeSwap(connection, swapTx, signTransaction);
        console.log(`[Jupiter] Swap complete: ${signature}`);

        return {
            success: true,
            signature,
            inputAmount: quote.inAmount,
            outputAmount: quote.outAmount,
            inputToken,
            outputToken,
        };
    } catch (error) {
        console.error("[Jupiter] Swap failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Swap failed",
            inputAmount: "0",
            outputAmount: "0",
            inputToken,
            outputToken,
        };
    }
}

/**
 * Check if a token is directly swappable to USDC
 * (Jupiter supports most tokens, but good to verify)
 */
export async function isTokenSwappable(inputMint: string): Promise<boolean> {
    try {
        // Try to get a small quote
        const quote = await getSwapQuote(inputMint, "1000000");
        return !!quote.outAmount;
    } catch {
        return false;
    }
}

/**
 * Get user's token balance
 */
export async function getTokenBalance(
    connection: Connection,
    walletAddress: string,
    tokenMint: string
): Promise<{ balance: number; rawBalance: string }> {
    const token = getTokenByMint(tokenMint);

    // Special case for native SOL
    if (tokenMint === SOLANA_TOKENS.SOL.mint) {
        const balance = await connection.getBalance(new PublicKey(walletAddress));
        return {
            balance: balance / 1_000_000_000,
            rawBalance: balance.toString(),
        };
    }

    // For SPL tokens
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(walletAddress),
        { mint: new PublicKey(tokenMint) }
    );

    if (tokenAccounts.value.length === 0) {
        return { balance: 0, rawBalance: "0" };
    }

    const rawBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount;
    const decimals = token?.decimals || tokenAccounts.value[0].account.data.parsed.info.tokenAmount.decimals;

    return {
        balance: Number(rawBalance) / Math.pow(10, decimals),
        rawBalance,
    };
}
