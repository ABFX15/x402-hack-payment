"use client";

import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { X402PaymentClient } from "@/anchor/client";

export function useAnchorClient(): X402PaymentClient | null {
    const { connection } = useConnection();
    const wallet = useWallet();

    return useMemo(() => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            return null;
        }

        const anchorWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
        };

        return new X402PaymentClient(connection, anchorWallet);
    }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);
}
