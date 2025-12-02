"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Wallet,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  ArrowLeft,
  AlertCircle,
  Fuel,
} from "lucide-react";
import Link from "next/link";
import {
  loadOctaneConfig,
  buildTransactionWithAccountCheck,
  transferTokenWithFee,
  TokenFee,
  OctaneConfig,
} from "@/lib/octane";

// Dynamically import WalletMultiButton to avoid SSR hydration issues
const WalletButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// USDC mint address (devnet)
const USDC_MINT_DEVNET = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
// Demo merchant wallet - using a valid devnet address
// Replace with your actual merchant wallet address
const DEMO_MERCHANT_WALLET = new PublicKey(
  "FxhtQGJgytPCMbKTkWqwPVfBnjnsiBJcdY6zadFWcHMr"
);

// Payment status type
type PaymentStatus = "idle" | "processing" | "success" | "error";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } =
    useWallet();

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useGasless, setUseGasless] = useState(true); // Default to gasless
  const [octaneConfig, setOctaneConfig] = useState<OctaneConfig | null>(null);
  const [octaneFee, setOctaneFee] = useState<TokenFee | null>(null);

  // Parse URL params
  const amount = searchParams.get("amount") || "10.00";
  const merchantName = searchParams.get("merchant") || "Merchant";
  const memo = searchParams.get("memo") || "";

  useEffect(() => {
    setMounted(true);
    // Load Octane config
    loadOctaneConfig()
      .then((config) => {
        setOctaneConfig(config);
        // Find USDC fee
        const usdcFee = config.endpoints?.transfer?.tokens?.find(
          (t) => t.mint === USDC_MINT_DEVNET.toBase58()
        );
        if (usdcFee) {
          setOctaneFee(usdcFee);
        }
      })
      .catch((err) => {
        console.log("Octane not available:", err);
        setUseGasless(false);
      });
  }, []);

  // Process gasless payment via Octane
  const handleGaslessPayment = useCallback(async () => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !octaneConfig ||
      !octaneFee
    ) {
      setError("Gasless payment not available");
      return;
    }

    setStatus("processing");
    setError(null);

    try {
      const amountInLamports = parseFloat(amount) * 1_000_000;

      // Check balance (need amount + Octane fee)
      const senderAta = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        publicKey
      );
      const senderAccount = await getAccount(connection, senderAta);
      const balance = Number(senderAccount.amount);
      const totalNeeded = amountInLamports + octaneFee.fee;

      if (balance < totalNeeded) {
        throw new Error(
          `Insufficient USDC. Need ${(totalNeeded / 1_000_000).toFixed(
            4
          )} USDC (includes ${(octaneFee.fee / 1_000_000).toFixed(4)} gas fee)`
        );
      }

      // Build transaction with Octane fee
      const tx = await buildTransactionWithAccountCheck(
        connection,
        new PublicKey(octaneConfig.feePayer),
        octaneFee,
        USDC_MINT_DEVNET,
        publicKey,
        DEMO_MERCHANT_WALLET,
        amountInLamports
      );

      // Sign the transaction (user signs, Octane will add fee payer signature)
      const signedTx = await signTransaction(tx);

      // Submit to Octane
      const signature = await transferTokenWithFee(signedTx);

      setTxSignature(signature);
      setStatus("success");
    } catch (err: any) {
      console.error("Gasless payment error:", err);
      setError(err.message || "Gasless payment failed");
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
        setError(null);
      }, 8000);
    }
  }, [
    connected,
    publicKey,
    signTransaction,
    connection,
    amount,
    octaneConfig,
    octaneFee,
  ]);

  // Process actual payment (standard, with SOL gas)
  const handlePayment = useCallback(async () => {
    // Use gasless if available and enabled
    if (useGasless && octaneConfig && octaneFee) {
      return handleGaslessPayment();
    }

    if (!connected || !publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    setStatus("processing");
    setError(null);

    try {
      // Log network info for debugging
      const genesisHash = await connection.getGenesisHash();
      console.log("Connected to network with genesis hash:", genesisHash);
      console.log(
        "Devnet genesis hash should be: EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG"
      );

      const amountInLamports = parseFloat(amount) * 1_000_000; // USDC has 6 decimals

      // Get token accounts
      const senderAta = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        publicKey
      );
      const merchantAta = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        DEMO_MERCHANT_WALLET
      );

      // Check if sender has USDC token account
      try {
        const senderAccount = await getAccount(connection, senderAta);
        const balance = Number(senderAccount.amount) / 1_000_000;
        if (balance < parseFloat(amount)) {
          throw new Error(
            `Insufficient USDC balance. You have ${balance.toFixed(
              2
            )} USDC but need ${amount} USDC`
          );
        }
      } catch (err: any) {
        if (err.message?.includes("Insufficient")) {
          throw err;
        }
        throw new Error(
          "You don't have a USDC token account. Please get some devnet USDC first."
        );
      }

      const transaction = new Transaction();

      // Check if merchant ATA exists, create if not
      try {
        await getAccount(connection, merchantAta);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            merchantAta,
            DEMO_MERCHANT_WALLET,
            USDC_MINT_DEVNET
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          senderAta,
          merchantAta,
          publicKey,
          amountInLamports
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Simulate transaction first to catch errors
      try {
        const simulation = await connection.simulateTransaction(transaction);
        console.log("Simulation result:", simulation);
        if (simulation.value.err) {
          console.error("Simulation error:", simulation.value.err);
          console.error("Simulation logs:", simulation.value.logs);
          throw new Error(
            `Simulation failed: ${JSON.stringify(
              simulation.value.err
            )}\nLogs: ${simulation.value.logs?.join("\n")}`
          );
        }
        console.log("Simulation passed!");
      } catch (simErr: any) {
        console.error("Simulation error:", simErr);
        if (simErr.message?.includes("Simulation failed")) {
          throw simErr;
        }
        // Continue if simulation itself had network issues
      }

      // Sign and send transaction manually for better error handling
      let signature: string;
      try {
        console.log("Requesting wallet signature...");
        const signedTx = await signTransaction(transaction);
        console.log("Transaction signed, sending...");
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });
        console.log("Transaction sent:", signature);
      } catch (sendErr: any) {
        console.error("Send error details:", sendErr);
        console.error("Send error logs:", sendErr?.logs);
        // Try to get more specific error info
        const logs = sendErr?.logs?.join("\n") || "";
        const message = sendErr?.message || "Unknown error";
        throw new Error(
          `Transaction failed: ${message}${logs ? `\nLogs: ${logs}` : ""}`
        );
      }

      // Wait for confirmation
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      setTxSignature(signature);
      setStatus("success");
    } catch (err: any) {
      console.error("Payment error:", err);
      console.error("Error name:", err?.name);
      console.error("Error cause:", err?.cause);

      // Parse common error messages
      let errorMessage = err.message || "Payment failed. Please try again.";
      if (
        err.message?.includes("User rejected") ||
        err.message?.includes("rejected")
      ) {
        errorMessage = "Transaction was cancelled";
      } else if (
        err.message?.includes("insufficient funds") ||
        err.message?.includes("Insufficient")
      ) {
        errorMessage = err.message;
      } else if (err.message?.includes("0x1")) {
        errorMessage = "Insufficient token balance";
      } else if (err.message?.includes("AccountNotFound")) {
        errorMessage = "Token account not found. Do you have USDC?";
      }

      setError(errorMessage);
      setStatus("error");

      // Reset to idle after showing error
      setTimeout(() => {
        setStatus("idle");
        setError(null);
      }, 8000);
    }
  }, [connected, publicKey, signTransaction, connection, amount]);

  const merchant = {
    name: merchantName,
    logo: merchantName.charAt(0).toUpperCase(),
    address:
      DEMO_MERCHANT_WALLET.toBase58().slice(0, 4) +
      "..." +
      DEMO_MERCHANT_WALLET.toBase58().slice(-4),
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <PaymentSuccess
            key="success"
            amount={amount}
            merchant={merchant}
            txSignature={txSignature}
          />
        ) : (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            {/* Back button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] mb-4"
              >
                <Zap className="w-4 h-4 text-[var(--secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  Secure Payment
                </span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                Complete Payment
              </h1>
              {memo && <p className="text-[var(--text-muted)]">{memo}</p>}
            </div>

            {/* Payment Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 md:p-8"
            >
              {/* Merchant Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-[var(--border)]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-2xl font-bold text-white">
                  {merchant.logo}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {merchant.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] font-mono">
                    {merchant.address}
                  </p>
                </div>
                <div className="tooltip" data-tooltip="Verified Merchant">
                  <Shield className="w-5 h-5 text-[var(--success)]" />
                </div>
              </div>

              {/* Amount Display */}
              <div className="py-8 text-center">
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  Amount Due
                </p>
                <p className="text-5xl font-bold text-[var(--text-primary)]">
                  ${amount}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">USDC</p>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 mb-4"
                >
                  <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                  <p className="text-sm text-[var(--error)]">{error}</p>
                </motion.div>
              )}

              {/* Wallet Connection / Pay Button */}
              <div className="space-y-4">
                {!mounted ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-40 rounded-xl bg-[var(--card)] shimmer" />
                  </div>
                ) : !connected ? (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-[var(--text-muted)]">
                      Connect your wallet to pay
                    </p>
                    <WalletButton />
                  </div>
                ) : (
                  <>
                    {/* Connected Wallet */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm text-[var(--text-muted)]">
                            Paying from
                          </p>
                          <p className="font-mono text-sm text-[var(--text-primary)]">
                            {publicKey?.toBase58().slice(0, 4)}...
                            {publicKey?.toBase58().slice(-4)}
                          </p>
                        </div>
                      </div>
                      <WalletButton />
                    </div>

                    {/* Gasless Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <Zap
                          className={`w-5 h-5 ${
                            useGasless
                              ? "text-[var(--secondary)]"
                              : "text-[var(--text-muted)]"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            Zero Gas Fees
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {useGasless
                              ? "Pay small USDC fee instead of SOL"
                              : "Requires SOL for gas"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseGasless(!useGasless)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          useGasless
                            ? "bg-[var(--secondary)]"
                            : "bg-[var(--border)]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useGasless ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Pay Button */}
                    <button
                      onClick={
                        useGasless ? handleGaslessPayment : handlePayment
                      }
                      disabled={status === "processing"}
                      className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
                    >
                      {status === "processing" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay ${amount} USDC
                          {useGasless && (
                            <span className="text-xs opacity-75">
                              (No SOL needed)
                            </span>
                          )}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[var(--text-muted)]">
                <Shield className="w-3 h-3" />
                <span>Secured by Solana blockchain</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Success Animation Component
function PaymentSuccess({
  amount,
  merchant,
  txSignature,
}: {
  amount: string;
  merchant: { name: string; logo: string };
  txSignature: string | null;
}) {
  const explorerUrl = txSignature
    ? `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
    : "#";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md text-center"
    >
      <div className="glass-card p-8 md:p-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
          className="w-24 h-24 mx-auto rounded-full bg-[var(--success)] flex items-center justify-center mb-6 pulse-success"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Payment Sent!
          </h2>
          <p className="text-[var(--text-muted)] mb-6">
            Your payment has been confirmed on Solana
          </p>
        </motion.div>

        {/* Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--card)] rounded-2xl p-6 text-left space-y-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">Amount</span>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              ${amount} USDC
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">To</span>
            <span className="text-[var(--text-primary)]">
              {merchant.logo} {merchant.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">Status</span>
            <span className="flex items-center gap-1 text-[var(--success)]">
              <CheckCircle2 className="w-4 h-4" />
              Confirmed
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">Transaction</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-sm"
            >
              {txSignature ? `${txSignature.slice(0, 8)}...` : "View"} →
            </a>
          </div>
        </motion.div>

        {/* Done Button */}
        <Link href="/">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="btn-ghost w-full mt-6"
          >
            Done
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// Wrap in Suspense for useSearchParams
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
