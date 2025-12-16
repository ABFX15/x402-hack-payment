"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Wallet,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  AlertCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Fuel,
} from "lucide-react";
import Link from "next/link";
import {
  loadOctaneConfig,
  transferTokenWithFee,
  buildTransaction,
  TokenFee,
  OctaneConfig,
} from "@/lib/octane";

// Dynamic import for wallet button
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

interface CheckoutSession {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantWallet: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  status: "pending" | "completed" | "expired" | "cancelled";
  expiresAt: number;
}

type PageStatus =
  | "loading"
  | "ready"
  | "processing"
  | "success"
  | "error"
  | "expired";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } =
    useWallet();

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [useGasless, setUseGasless] = useState(true);
  const [octaneConfig, setOctaneConfig] = useState<OctaneConfig | null>(null);
  const [octaneFee, setOctaneFee] = useState<TokenFee | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Load checkout session
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`/api/checkout/sessions?id=${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Checkout session not found");
          } else {
            setError("Failed to load checkout session");
          }
          setStatus("error");
          return;
        }

        const data = await response.json();
        setSession(data);

        if (data.status === "expired") {
          setStatus("expired");
        } else if (data.status === "completed") {
          setStatus("success");
          setTxSignature(data.paymentSignature);
        } else {
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError("Failed to load checkout session");
        setStatus("error");
      }
    }

    loadSession();
  }, [sessionId]);

  // Load Octane config
  useEffect(() => {
    loadOctaneConfig()
      .then((config) => {
        setOctaneConfig(config);
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

  // Countdown timer
  useEffect(() => {
    if (!session || status !== "ready") return;

    const updateTimer = () => {
      const remaining = Math.max(0, session.expiresAt - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) {
        setStatus("expired");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, status]);

  // Format time remaining
  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Process payment
  const handlePayment = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction || !session) {
      setError("Please connect your wallet first");
      return;
    }

    setStatus("processing");
    setError(null);

    try {
      const merchantWallet = new PublicKey(session.merchantWallet);
      const amountLamports = BigInt(Math.round(session.amount * 1_000_000)); // USDC has 6 decimals

      // Get token accounts
      const payerATA = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        publicKey
      );
      const merchantATA = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        merchantWallet
      );

      let signature: string;

      if (useGasless && octaneConfig && octaneFee) {
        // Gasless payment via Octane - build the transaction first
        const feePayer = new PublicKey(octaneConfig.feePayer);
        const transaction = await buildTransaction(
          connection,
          feePayer,
          octaneFee,
          USDC_MINT_DEVNET,
          publicKey,
          merchantWallet,
          Number(amountLamports)
        );

        // Sign the transaction (user signs their part, Octane signs fee payer)
        const signedTx = await signTransaction(transaction);

        // Send to Octane relay
        signature = await transferTokenWithFee(signedTx);
      } else {
        // Standard payment
        const transaction = new Transaction();

        // Check if merchant has ATA, create if needed
        try {
          await getAccount(connection, merchantATA);
        } catch {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              merchantATA,
              merchantWallet,
              USDC_MINT_DEVNET
            )
          );
        }

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            payerATA,
            merchantATA,
            publicKey,
            amountLamports
          )
        );

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });
      }

      setTxSignature(signature);

      // Notify backend of completion
      const completeResponse = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          signature,
          customerWallet: publicKey.toBase58(),
        }),
      });

      const completeData = await completeResponse.json();
      setPaymentId(completeData.paymentId);

      setStatus("success");

      // Redirect to success URL after a short delay
      setTimeout(() => {
        const successUrl = new URL(session.successUrl);
        successUrl.searchParams.set("session_id", session.id);
        successUrl.searchParams.set("payment_id", completeData.paymentId);
        successUrl.searchParams.set("signature", signature);
        window.location.href = successUrl.toString();
      }, 3000);
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
      setStatus("ready");
    }
  }, [
    connected,
    publicKey,
    signTransaction,
    sendTransaction,
    session,
    connection,
    useGasless,
    octaneConfig,
    octaneFee,
  ]);

  // Handle cancel
  const handleCancel = () => {
    if (session?.cancelUrl) {
      window.location.href = session.cancelUrl;
    } else {
      router.push("/");
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pop-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Checkout Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="pop-button inline-flex">
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Expired state
  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pop-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expired
          </h1>
          <p className="text-gray-600 mb-6">
            This checkout session has expired. Please request a new payment
            link.
          </p>
          <button onClick={handleCancel} className="pop-button">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pop-card p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-4">
            Your payment of ${session?.amount.toFixed(2)} USDC has been
            confirmed.
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] text-sm hover:underline font-semibold"
              >
                View on Explorer →
              </a>
            )}
            {paymentId && (
              <>
                <span className="text-gray-300">|</span>
                <a
                  href={`/receipts/${paymentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] text-sm hover:underline font-semibold"
                >
                  View Receipt →
                </a>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500">Redirecting you back...</p>
        </motion.div>
      </div>
    );
  }

  // Main checkout UI
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Checkout
          </h1>
          <p className="text-[var(--text-secondary)]">
            Complete your payment securely
          </p>
        </div>

        {/* Main Card - POP STYLE */}
        <div className="card-pop overflow-hidden">
          {/* Timer */}
          <div className="bg-black px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-white/80">Session expires in</span>
            <span className="font-mono text-white font-bold">
              {formatTimeLeft(timeLeft)}
            </span>
          </div>

          {/* Payment Details */}
          <div className="p-6 border-b-3 border-black">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--card-pop-text-secondary)]">
                Pay to
              </span>
              <span className="font-bold text-[var(--card-pop-text)]">
                {session?.merchantName}
              </span>
            </div>
            {session?.description && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--card-pop-text-secondary)]">
                  For
                </span>
                <span className="text-[var(--card-pop-text)]">
                  {session.description}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[var(--card-pop-text-secondary)]">
                Amount
              </span>
              <span className="text-3xl font-black text-[var(--card-pop-text)]">
                ${session?.amount.toFixed(2)}
                <span className="text-lg text-[var(--card-pop-text-secondary)] ml-1">
                  USDC
                </span>
              </span>
            </div>
          </div>

          {/* Gasless Toggle */}
          {octaneConfig && octaneFee && (
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Fuel
                    className={`w-5 h-5 ${
                      useGasless
                        ? "text-[var(--success)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  />
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">
                      Gasless Payment
                    </span>
                    <p className="text-xs text-[var(--text-secondary)]">
                      No SOL needed • Fee:{" "}
                      {(Number(octaneFee.fee) / 1_000_000).toFixed(4)} USDC
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    useGasless ? "bg-[var(--success)]" : "bg-[var(--border)]"
                  }`}
                  onClick={() => setUseGasless(!useGasless)}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                      useGasless ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </label>
            </div>
          )}

          {/* Wallet Connection */}
          <div className="p-6">
            {!connected ? (
              <div className="text-center">
                <p className="text-[var(--text-secondary)] mb-4">
                  Connect your wallet to pay
                </p>
                <WalletButton className="!bg-[var(--primary)] !rounded-xl !h-12 !px-6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    Connected
                  </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {publicKey?.toBase58().slice(0, 4)}...
                    {publicKey?.toBase58().slice(-4)}
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-[var(--error)]/10 rounded-lg text-[var(--error)] text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={status === "processing"}
                  className="pop-button w-full"
                >
                  {status === "processing" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ${session?.amount.toFixed(2)} USDC</>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  className="w-full py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Security Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t-2 border-black rounded-b-2xl">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Secure
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Instant
              </div>
              <span className="font-semibold text-[var(--primary)]">
                Powered by Settlr
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
