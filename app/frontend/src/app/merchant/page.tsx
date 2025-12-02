"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Store,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useAnchorClient } from "@/hooks/useAnchorClient";
import { getMerchantPDA, Merchant } from "@/anchor/client";
import { PublicKey } from "@solana/web3.js";

export default function MerchantPage() {
  const { connected, publicKey } = useWallet();
  const anchorClient = useAnchorClient();

  const [merchantId, setMerchantId] = useState("");
  const [existingMerchant, setExistingMerchant] = useState<Merchant | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Check if merchant already registered
  useEffect(() => {
    async function checkMerchant() {
      if (!anchorClient || !publicKey) return;

      setChecking(true);
      try {
        // Try to find merchant by wallet
        // For now, we'll let the user enter their merchant ID to check
      } catch (err) {
        console.error("Error checking merchant:", err);
      } finally {
        setChecking(false);
      }
    }

    checkMerchant();
  }, [anchorClient, publicKey]);

  const checkMerchantId = async () => {
    if (!anchorClient || !merchantId.trim()) return;

    setLoading(true);
    setError("");
    setExistingMerchant(null);

    try {
      const merchant = await anchorClient.getMerchant(merchantId.trim());
      if (merchant) {
        setExistingMerchant(merchant);
      } else {
        setError("Merchant not found. You can register with this ID.");
      }
    } catch (err) {
      setError("Merchant not found. You can register with this ID.");
    } finally {
      setLoading(false);
    }
  };

  const registerMerchant = async () => {
    if (!anchorClient || !publicKey || !merchantId.trim()) return;

    setRegistering(true);
    setError("");
    setSuccess("");

    try {
      const tx = await anchorClient.initializeMerchant(
        merchantId.trim(),
        publicKey,
        0 // Default 0 merchant fee
      );

      setSuccess(`Merchant registered! Transaction: ${tx}`);

      // Fetch the merchant account
      const merchant = await anchorClient.getMerchant(merchantId.trim());
      if (merchant) {
        setExistingMerchant(merchant);
      }
    } catch (err: any) {
      console.error("Error registering merchant:", err);
      setError(err.message || "Failed to register merchant");
    } finally {
      setRegistering(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-[var(--text-muted)] mb-6">
            Connect your Solana wallet to register as a merchant and start
            accepting payments.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Merchant Dashboard
          </h1>
          <p className="text-[var(--text-muted)]">
            Register your business on-chain to accept payments with platform fee
            support
          </p>
        </motion.div>

        {/* Check/Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Merchant ID
          </h2>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="Enter your merchant ID (e.g., my-store)"
              className="input-field flex-1"
            />
            <button
              onClick={checkMerchantId}
              disabled={loading || !merchantId.trim()}
              className="btn-ghost whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </button>
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            Choose a unique identifier for your business. This will be used to
            derive your on-chain merchant account.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6 border-[var(--warning)]/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[var(--text-primary)]">{error}</p>
                {!existingMerchant && merchantId && (
                  <button
                    onClick={registerMerchant}
                    disabled={registering}
                    className="btn-primary mt-4 flex items-center gap-2"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        Register Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6 border-[var(--success)]/30"
          >
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
              <p className="text-[var(--text-primary)]">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Existing Merchant Info */}
        {existingMerchant && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Merchant Registered
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Your business is active on-chain
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--background)]">
                <div className="text-sm text-[var(--text-muted)] mb-1">
                  Merchant ID
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[var(--text-primary)]">
                    {existingMerchant.merchantId}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(existingMerchant.merchantId, "merchantId")
                    }
                    className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                  >
                    {copied === "merchantId" ? (
                      <Check className="w-4 h-4 text-[var(--success)]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--background)]">
                <div className="text-sm text-[var(--text-muted)] mb-1">
                  Settlement Wallet
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[var(--text-primary)] text-sm">
                    {existingMerchant.settlementWallet.toBase58().slice(0, 8)}
                    ...
                    {existingMerchant.settlementWallet.toBase58().slice(-8)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          existingMerchant.settlementWallet.toBase58(),
                          "wallet"
                        )
                      }
                      className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                    >
                      {copied === "wallet" ? (
                        <Check className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${existingMerchant.settlementWallet.toBase58()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--background)]">
                  <div className="text-sm text-[var(--text-muted)] mb-1">
                    Total Volume
                  </div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">
                    ${(Number(existingMerchant.volume) / 1_000_000).toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)]">
                  <div className="text-sm text-[var(--text-muted)] mb-1">
                    Transactions
                  </div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">
                    {existingMerchant.transactionCount.toString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--background)]">
                <div className="text-sm text-[var(--text-muted)] mb-1">
                  Total Fees Paid
                </div>
                <div className="text-lg font-bold text-[var(--text-primary)]">
                  ${(Number(existingMerchant.totalFees) / 1_000_000).toFixed(4)}{" "}
                  USDC
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    existingMerchant.isActive
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-[var(--error)]/10 text-[var(--error)]"
                  }`}
                >
                  {existingMerchant.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            How On-Chain Merchants Work
          </h3>
          <ul className="space-y-3 text-[var(--text-muted)]">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--primary)]">
                  1
                </span>
              </div>
              <span>
                Register your merchant account on-chain with a unique ID
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--primary)]">
                  2
                </span>
              </div>
              <span>
                Payments are processed through the smart contract with automatic
                fee distribution
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--primary)]">
                  3
                </span>
              </div>
              <span>
                All payments are tracked on-chain with full transparency
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--primary)]">
                  4
                </span>
              </div>
              <span>
                Refunds can be processed by the merchant with on-chain
                verification
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
