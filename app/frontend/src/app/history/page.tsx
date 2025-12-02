"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react";

const WalletButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// USDC mint on devnet
const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

interface Transaction {
  signature: string;
  timestamp: number;
  type: "sent" | "received";
  amount: number;
  otherParty: string;
  status: "confirmed" | "finalized";
}

export default function HistoryPage() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError(null);

    try {
      // Get recent signatures for the wallet
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 20,
      });

      const txs: Transaction[] = [];

      // Fetch and parse each transaction
      for (const sig of signatures) {
        try {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx?.meta || tx.meta.err) continue;

          // Look for token transfers
          const preBalances = tx.meta.preTokenBalances || [];
          const postBalances = tx.meta.postTokenBalances || [];

          // Find USDC transfers involving this wallet
          for (const post of postBalances) {
            if (post.mint !== USDC_MINT) continue;

            const pre = preBalances.find(
              (p) => p.accountIndex === post.accountIndex
            );
            const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
            const postAmount = post.uiTokenAmount?.uiAmount || 0;
            const diff = postAmount - preAmount;

            if (Math.abs(diff) < 0.001) continue;

            const isReceived = diff > 0;
            const owner = post.owner;

            if (owner === publicKey.toBase58()) {
              // Find the other party
              let otherParty = "Unknown";
              for (const balance of isReceived ? preBalances : postBalances) {
                if (balance.mint === USDC_MINT && balance.owner !== owner) {
                  otherParty = balance.owner || "Unknown";
                  break;
                }
              }

              txs.push({
                signature: sig.signature,
                timestamp: sig.blockTime || 0,
                type: isReceived ? "received" : "sent",
                amount: Math.abs(diff),
                otherParty,
                status: sig.confirmationStatus as "confirmed" | "finalized",
              });
            }
          }
        } catch (e) {
          // Skip transactions that can't be parsed
          continue;
        }
      }

      // Remove duplicates and sort by time
      const uniqueTxs = txs.filter(
        (tx, idx, arr) =>
          arr.findIndex((t) => t.signature === tx.signature) === idx
      );
      uniqueTxs.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(uniqueTxs);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactions();
    }
  }, [connected, publicKey, fetchTransactions]);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
  };

  const shortenAddress = (addr: string) => {
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          {connected && (
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="btn-ghost flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          )}
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Transaction History
          </h1>
          <p className="text-[var(--text-muted)]">
            Your recent USDC transactions
          </p>
        </motion.div>

        {/* Content */}
        {!mounted ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : !connected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <Wallet className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
            <p className="text-[var(--text-muted)] mb-4">
              Connect your wallet to view transaction history
            </p>
            <WalletButton />
          </motion.div>
        ) : loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            <p className="text-[var(--text-muted)]">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-[var(--error)] mb-4">{error}</p>
            <button onClick={fetchTransactions} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <Clock className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
            <p className="text-[var(--text-muted)]">
              No USDC transactions found
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Make a payment to see it here
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.signature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "received"
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "bg-[var(--primary)]/20 text-[var(--primary)]"
                    }`}
                  >
                    {tx.type === "received" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--text-primary)]">
                        {tx.type === "received" ? "Received" : "Sent"}
                      </p>
                      <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      {tx.type === "received" ? "From" : "To"}{" "}
                      {shortenAddress(tx.otherParty)}
                    </p>
                  </div>

                  {/* Amount & Time */}
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.type === "received"
                          ? "text-[var(--success)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {tx.type === "received" ? "+" : "-"}$
                      {tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatTime(tx.timestamp)}
                    </p>
                  </div>

                  {/* Explorer Link */}
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
