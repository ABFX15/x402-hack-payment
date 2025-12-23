"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
  useCreateWallet,
} from "@privy-io/react-auth/solana";
import {
  Check,
  Loader2,
  Mail,
  CreditCard,
  Copy,
  Plus,
  Shield,
  Zap,
  ExternalLink,
  AlertCircle,
  Wallet,
  X,
  ArrowLeft,
} from "lucide-react";
import { FiatOnRamp } from "@/components/FiatOnRamp";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

// USDC Mint on Devnet
const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);
const USDC_DECIMALS = 6;

// RPC endpoint
const RPC_ENDPOINT = "https://api.devnet.solana.com";

interface CheckoutClientProps {
  searchParams: URLSearchParams;
}

export default function CheckoutClient({ searchParams }: CheckoutClientProps) {
  const router = useRouter();
  const { ready, authenticated, login, user, logout, connectWallet } =
    usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { createWallet } = useCreateWallet();

  // Payment params from URL
  const amount = parseFloat(searchParams.get("amount") || "0");
  const merchantName = searchParams.get("merchant") || "Merchant";
  const merchantWallet = searchParams.get("to") || "";
  const memo = searchParams.get("memo") || "";

  // Session-based checkout (for webhook support)
  const sessionId = searchParams.get("session") || "";
  const successUrl = searchParams.get("successUrl") || "";
  const cancelUrl = searchParams.get("cancelUrl") || "";

  // Widget/embed mode detection
  const isEmbed = searchParams.get("embed") === "true";
  const isWidget = searchParams.get("widget") === "true";

  // Helper to send messages to parent window (for embed mode)
  const sendToParent = (type: string, data?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({ type, data }, "*");
    }
  };

  // State
  const [step, setStep] = useState<
    | "loading"
    | "auth"
    | "wallet"
    | "confirm"
    | "processing"
    | "success"
    | "error"
  >("loading");
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  // Get active wallet - could be embedded (Privy) or external (Phantom/Solflare)
  // Privy returns all connected wallets in the wallets array
  const activeWallet = wallets?.[0];

  // Check if user has an external wallet linked (Phantom, Solflare, etc.)
  // If they logged in via wallet, they have an external wallet
  const hasExternalWallet = user?.linkedAccounts?.some(
    (account) =>
      account.type === "wallet" && account.walletClientType !== "privy"
  );
  const isExternalWallet = hasExternalWallet ?? false;

  // Fetch USDC balance
  const fetchBalance = useCallback(async () => {
    if (!activeWallet?.address) return;

    setLoadingBalance(true);
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const walletPubkey = new PublicKey(activeWallet.address);
      const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);

      try {
        const account = await getAccount(connection, ata);
        const bal = Number(account.amount) / Math.pow(10, USDC_DECIMALS);
        setBalance(bal);
      } catch {
        setBalance(0);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, [activeWallet?.address]);

  // Check auth and wallet status
  useEffect(() => {
    if (!ready) {
      setStep("loading");
      return;
    }

    if (!authenticated) {
      setStep("auth");
      return;
    }

    if (walletsReady) {
      if (activeWallet) {
        setStep("confirm");
        fetchBalance();
      } else {
        setStep("wallet");
      }
    }
  }, [ready, authenticated, walletsReady, activeWallet, fetchBalance]);

  // Create embedded wallet
  const handleCreateWallet = async () => {
    setError("");
    setCreatingWallet(true);
    try {
      await createWallet();
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError("Failed to create wallet");
    } finally {
      setCreatingWallet(false);
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!activeWallet?.address || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    setStep("processing");
    setError("");

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");

      // Get the user's ATA
      const userPubkey = new PublicKey(activeWallet.address);
      const merchantPubkey = new PublicKey(merchantWallet);
      const userAta = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
      const merchantAta = await getAssociatedTokenAddress(
        USDC_MINT,
        merchantPubkey
      );

      // Calculate amount in base units
      const amountInBaseUnits = BigInt(
        Math.round(amount * Math.pow(10, USDC_DECIMALS))
      );

      // Build transaction
      const transaction = new Transaction();

      // Check if merchant ATA exists
      try {
        await getAccount(connection, merchantAta);
      } catch {
        // Create ATA for merchant
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPubkey,
            merchantAta,
            merchantPubkey,
            USDC_MINT
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          userAta,
          merchantAta,
          userPubkey,
          amountInBaseUnits
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      // Serialize transaction for Privy (as Uint8Array)
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      // Sign and send via Privy
      const result = await signAndSendTransaction({
        transaction: serializedTx,
        wallet: activeWallet,
        chain: "solana:devnet",
      });

      console.log("Transaction result:", result);
      // Convert signature Uint8Array to base58 string
      const signatureBase58 = Buffer.from(result.signature).toString("base64");
      setTxSignature(signatureBase58);

      // If this is a session-based checkout, complete it (triggers webhooks)
      if (sessionId) {
        try {
          const completeResponse = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              signature: signatureBase58,
              customerWallet: activeWallet.address,
            }),
          });

          if (completeResponse.ok) {
            const completeData = await completeResponse.json();
            console.log("Checkout completed, webhook triggered:", completeData);

            // Redirect to merchant's success URL if provided
            if (successUrl) {
              window.location.href = successUrl;
              return;
            }
          } else {
            console.warn(
              "Failed to complete checkout session:",
              await completeResponse.text()
            );
          }
        } catch (completeErr) {
          console.error("Error completing checkout:", completeErr);
        }
      }

      setStep("success");

      // Notify parent window if embedded
      sendToParent("settlr:success", {
        signature: signatureBase58,
        amount,
        merchantWallet,
        memo,
      });
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      setStep("error");

      // Notify parent window if embedded
      sendToParent("settlr:error", { message: errorMessage });
    }
  };

  // Loading step
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Auth step - login with email/social
  if (step === "auth") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        {/* Close/Back button */}
        <button
          onClick={() => {
            if (isEmbed || isWidget) {
              sendToParent("settlr:cancel", {});
            } else if (cancelUrl) {
              window.location.href = cancelUrl;
            } else {
              router.push("/");
            }
          }}
          className="fixed top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-50"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-zinc-400 text-sm mb-1">Pay {merchantName}</p>
              <p className="text-4xl font-bold text-white">
                ${amount.toFixed(2)}
                <span className="text-lg text-zinc-500 ml-2">USDC</span>
              </p>
              {memo && <p className="text-zinc-500 text-sm mt-2">{memo}</p>}
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <p className="text-center text-zinc-300 mb-4">
                Choose how to pay
              </p>

              {!ready ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Connect existing wallet - Using login with wallet */}
                  <button
                    onClick={() => login({ loginMethods: ["wallet"] })}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet (Phantom/Solflare)
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-700" />
                    <span className="text-zinc-500 text-xs">or</span>
                    <div className="flex-1 h-px bg-zinc-700" />
                  </div>

                  {/* Email login - Creates embedded wallet */}
                  <button
                    onClick={() => login({ loginMethods: ["email"] })}
                    className="w-full py-4 bg-zinc-800 border border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-700 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Continue with Email
                  </button>
                </div>
              )}

              <p className="text-center text-zinc-500 text-xs mt-4">
                Use Phantom, Solflare, or create a new wallet with email
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-zinc-500 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>USDC</span>
            </div>
          </div>

          <p className="text-center text-zinc-600 text-xs mt-6">
            Powered by{" "}
            <Link href="/" className="text-pink-400 hover:text-pink-300">
              Settlr
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // Wallet creation step
  if (step === "wallet") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4 relative">
        {/* Close/Back button */}
        <button
          onClick={() => {
            logout();
            setStep("auth");
          }}
          className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Your Wallet
              </h2>
              <p className="text-zinc-400">
                We&apos;ll create a secure wallet for you automatically
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreateWallet}
              disabled={creatingWallet}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creatingWallet ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Create Wallet
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Confirm step
  if (step === "confirm") {
    const hasEnoughBalance = balance !== null && balance >= amount;

    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4 relative">
        {/* Close/Back button */}
        <button
          onClick={() => {
            if (isEmbed || isWidget) {
              sendToParent("settlr:cancel", {});
            } else if (cancelUrl) {
              window.location.href = cancelUrl;
            } else {
              router.push("/");
            }
          }}
          className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6">
            {/* User info */}
            <div className="flex items-center justify-between mb-6 p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user?.email?.address || user?.google?.email || "User"}
                  </p>
                  <p className="text-zinc-500 text-xs">Signed in</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-zinc-500 text-xs hover:text-zinc-300"
              >
                Sign out
              </button>
            </div>

            {/* Wallet info */}
            {activeWallet && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-800/50 rounded-xl">
                <Wallet className="w-5 h-5 text-pink-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-400 text-xs">
                    {isExternalWallet ? "Connected Wallet" : "Your Wallet"}
                  </p>
                  <p className="text-white text-sm font-mono truncate">
                    {activeWallet.address?.slice(0, 8)}...
                    {activeWallet.address?.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-xs">Balance</p>
                  {loadingBalance ? (
                    <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                  ) : (
                    <p
                      className={`text-sm font-medium ${
                        hasEnoughBalance ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ${balance?.toFixed(2) || "0.00"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment details */}
            <div className="bg-zinc-800/50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400">To</span>
                <span className="text-white">{merchantName}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400">Amount</span>
                <span className="text-white font-bold">
                  ${amount.toFixed(2)} USDC
                </span>
              </div>
              {memo && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">For</span>
                  <span className="text-white text-sm">{memo}</span>
                </div>
              )}
            </div>

            {/* Low balance warning with fund options */}
            {!hasEnoughBalance && balance !== null && activeWallet && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    You need ${(amount - balance).toFixed(2)} more USDC
                  </p>
                </div>

                {/* Buy USDC with Card (Fiat On-Ramp) - only for embedded wallets */}
                {!isExternalWallet && (
                  <div className="mb-3">
                    <FiatOnRamp
                      walletAddress={activeWallet.address}
                      defaultAmount={Math.ceil(amount - balance)}
                      onSuccess={() => {
                        // Refresh balance after purchase
                        setTimeout(() => {
                          window.location.reload();
                        }, 2000);
                      }}
                    />
                  </div>
                )}

                {/* Devnet: Get test USDC from faucet */}
                <div className="text-center text-zinc-500 text-xs mb-2">
                  — or for testing —
                </div>
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Get Devnet USDC (Circle Faucet)
                </a>

                {/* Or send from another wallet */}
                <div className="text-center">
                  <p className="text-zinc-500 text-xs mb-2">Or send USDC to:</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeWallet.address);
                      alert("Address copied!");
                    }}
                    className="flex items-center justify-center gap-2 mx-auto px-3 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <span className="text-xs font-mono text-zinc-300">
                      {activeWallet.address.slice(0, 8)}...
                      {activeWallet.address.slice(-6)}
                    </span>
                    <Copy className="w-3 h-3 text-zinc-400" />
                  </button>
                  <p className="text-zinc-600 text-xs mt-1">Solana Devnet</p>
                </div>
              </div>
            )}

            <button
              onClick={processPayment}
              disabled={!hasEnoughBalance || loadingBalance}
              className={`w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity ${
                hasEnoughBalance && !loadingBalance
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:opacity-90"
                  : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <Check className="w-5 h-5" />
              Pay ${amount.toFixed(2)} USDC
            </button>

            <button
              onClick={() => fetchBalance()}
              className="w-full mt-3 py-2 text-zinc-400 text-sm hover:text-zinc-300"
            >
              Refresh Balance
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Processing step
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Processing Payment
          </h2>
          <p className="text-zinc-400">
            Please wait while we confirm your transaction...
          </p>
        </motion.div>
      </div>
    );
  }

  // Success step
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Payment Successful!
          </h2>
          <p className="text-zinc-400 mb-6">
            You paid ${amount.toFixed(2)} USDC to {merchantName}
          </p>

          {txSignature && (
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 mb-6"
            >
              View on Solana Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error step
  if (step === "error") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
          <p className="text-zinc-400 mb-2">Something went wrong</p>
          {error && (
            <p className="text-red-400 text-sm mb-6 p-3 bg-red-500/10 rounded-xl">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setStep("confirm")}
              className="block w-full py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
