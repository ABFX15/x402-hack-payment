"use client";

import { useState, useCallback, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import {
    SOLANA_TOKENS,
    TokenInfo,
    getSupportedTokens,
    getTokenByMint,
    getQuoteForExactOutput,
    buildSwapTransaction,
    executeSwap,
    getTokenBalance,
    JupiterQuote,
    USDC_MINT,
} from "@/lib/jupiter";

export type SwapStatus =
    | "idle"
    | "loading-quote"
    | "quote-ready"
    | "swapping"
    | "success"
    | "error";

export interface UseJupiterSwapResult {
    // State
    status: SwapStatus;
    error: string | null;
    selectedToken: TokenInfo;
    availableTokens: TokenInfo[];

    // Quote data
    quote: JupiterQuote | null;
    inputAmountFormatted: string;
    priceImpact: string;

    // Balance
    tokenBalance: number;
    hasEnoughBalance: boolean;

    // Actions
    selectToken: (token: TokenInfo) => void;
    getQuote: (usdcAmount: number) => Promise<void>;
    executeSwap: (
        signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
    ) => Promise<string | null>;
    reset: () => void;
}

/**
 * Hook for Jupiter swap functionality
 * 
 * Usage:
 * 1. User selects a token (SOL, BONK, etc.)
 * 2. Call getQuote(usdcAmount) to see how much of that token is needed
 * 3. Call executeSwap(signTransaction) to perform the swap
 */
export function useJupiterSwap(
    walletAddress: string | null,
    defaultToken: TokenInfo = SOLANA_TOKENS.SOL
): UseJupiterSwapResult {
    const { connection } = useConnection();

    const [status, setStatus] = useState<SwapStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [selectedToken, setSelectedToken] = useState<TokenInfo>(defaultToken);
    const [quote, setQuote] = useState<JupiterQuote | null>(null);
    const [inputAmountFormatted, setInputAmountFormatted] = useState<string>("0");
    const [priceImpact, setPriceImpact] = useState<string>("0");
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const [requiredAmount, setRequiredAmount] = useState<number>(0);

    const availableTokens = getSupportedTokens();

    // Fetch balance when token or wallet changes
    useEffect(() => {
        if (!walletAddress || !connection) {
            setTokenBalance(0);
            return;
        }

        const fetchBalance = async () => {
            try {
                const { balance } = await getTokenBalance(
                    connection,
                    walletAddress,
                    selectedToken.mint
                );
                setTokenBalance(balance);
            } catch (err) {
                console.error("Error fetching balance:", err);
                setTokenBalance(0);
            }
        };

        fetchBalance();
    }, [walletAddress, selectedToken, connection]);

    // Select a different token
    const selectToken = useCallback((token: TokenInfo) => {
        setSelectedToken(token);
        setQuote(null);
        setInputAmountFormatted("0");
        setStatus("idle");
        setError(null);
    }, []);

    // Get a quote for swapping to a specific USDC amount
    const getQuoteForAmount = useCallback(async (usdcAmount: number) => {
        if (!walletAddress) {
            setError("Wallet not connected");
            return;
        }

        // If USDC is selected, no swap needed
        if (selectedToken.mint === USDC_MINT) {
            setQuote(null);
            setInputAmountFormatted(usdcAmount.toFixed(2));
            setRequiredAmount(usdcAmount);
            setStatus("quote-ready");
            return;
        }

        setStatus("loading-quote");
        setError(null);

        try {
            const usdcAmountRaw = Math.floor(usdcAmount * 1_000_000).toString();
            const quoteResult = await getQuoteForExactOutput(
                selectedToken.mint,
                usdcAmountRaw
            );

            setQuote(quoteResult);

            // Format input amount
            const inputAmount = Number(quoteResult.inAmount) / Math.pow(10, selectedToken.decimals);
            setInputAmountFormatted(inputAmount.toFixed(6));
            setRequiredAmount(inputAmount);
            setPriceImpact(quoteResult.priceImpactPct);
            setStatus("quote-ready");
        } catch (err) {
            console.error("Quote error:", err);
            setError(err instanceof Error ? err.message : "Failed to get quote");
            setStatus("error");
        }
    }, [walletAddress, selectedToken]);

    // Execute the swap
    const doSwap = useCallback(async (
        signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
    ): Promise<string | null> => {
        if (!walletAddress || !connection) {
            setError("Wallet not connected");
            return null;
        }

        // If USDC selected, no swap needed - return null to indicate direct payment
        if (selectedToken.mint === USDC_MINT) {
            return null;
        }

        if (!quote) {
            setError("No quote available");
            return null;
        }

        setStatus("swapping");
        setError(null);

        try {
            // Build swap transaction
            console.log("[Jupiter] Building swap transaction...");
            const swapTx = await buildSwapTransaction(quote, walletAddress);

            // Execute swap
            console.log("[Jupiter] Executing swap...");
            const signature = await executeSwap(connection, swapTx, signTransaction);

            console.log(`[Jupiter] Swap successful: ${signature}`);
            setStatus("success");
            return signature;
        } catch (err) {
            console.error("Swap error:", err);
            setError(err instanceof Error ? err.message : "Swap failed");
            setStatus("error");
            return null;
        }
    }, [walletAddress, connection, selectedToken, quote]);

    // Reset state
    const reset = useCallback(() => {
        setStatus("idle");
        setError(null);
        setQuote(null);
        setInputAmountFormatted("0");
        setPriceImpact("0");
    }, []);

    // Calculate if user has enough balance
    const hasEnoughBalance = selectedToken.mint === USDC_MINT
        ? tokenBalance >= requiredAmount
        : tokenBalance >= requiredAmount;

    return {
        status,
        error,
        selectedToken,
        availableTokens,
        quote,
        inputAmountFormatted,
        priceImpact,
        tokenBalance,
        hasEnoughBalance,
        selectToken,
        getQuote: getQuoteForAmount,
        executeSwap: doSwap,
        reset,
    };
}

// Re-export types for convenience
export { SOLANA_TOKENS, USDC_MINT };
export type { TokenInfo, JupiterQuote };
