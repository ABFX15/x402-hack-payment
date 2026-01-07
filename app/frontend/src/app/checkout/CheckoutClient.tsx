"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
  useSignTransaction,
  useCreateWallet,
  useFundWallet,
} from "@privy-io/react-auth/solana";
import { useWallets as useEvmWallets } from "@privy-io/react-auth";
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
  Fuel,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { ChainSelector, getExplorerUrl } from "@/components/ChainSelector";
import { useEvmPayment } from "@/hooks/useEvmPayment";
import { useMayanSwap, MayanStatus } from "@/hooks/useMayanSwap";
import { ChainType, USDC_ADDRESSES } from "@/hooks/useMultichainWallet";

// Base58 alphabet for encoding signatures
const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function encodeBase58(bytes: Uint8Array): string {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = "";
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }
  return result;
}

// Token configurations
const TOKENS = {
  USDC: {
    mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  },
  USDT: {
    mint: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUQS7QrP5KpEgk3aSm", // Devnet USDT
    decimals: 6,
    symbol: "USDT",
    name: "Tether USD",
  },
} as const;

type TokenSymbol = keyof typeof TOKENS;

// Default to USDC for backward compatibility
const DEFAULT_TOKEN: TokenSymbol = "USDC";
const USDC_MINT_ADDRESS = TOKENS.USDC.mint;
const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);
const USDC_DECIMALS = 6;

// RPC endpoint
const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Devnet mode - EVM/Mayan doesn't work on devnet, only Solana
const IS_DEVNET = RPC_ENDPOINT.includes("devnet");

interface CheckoutClientProps {
  searchParams: URLSearchParams;
}

export default function CheckoutClient({ searchParams }: CheckoutClientProps) {
  const router = useRouter();
  const { ready, authenticated, login, user, logout, connectWallet } =
    usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { signTransaction } = useSignTransaction();
  const { createWallet } = useCreateWallet();
  const { fundWallet } = useFundWallet();

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
  const [solBalance, setSolBalance] = useState<number | null>(null); // SOL balance for gas
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [useGasless, setUseGasless] = useState(false); // Gasless only works with external wallets
  const [gaslessAvailable, setGaslessAvailable] = useState(false);
  const [checkingGasless, setCheckingGasless] = useState(true);

  // Multichain state
  const [selectedChain, setSelectedChain] = useState<ChainType>("solana");
  const [evmBalance, setEvmBalance] = useState<number | null>(null);
  const [mayanQuotePreview, setMayanQuotePreview] = useState<{
    expectedOut: number;
    fee: number;
    eta: string;
  } | null>(null);

  // EVM wallet and payment hooks
  const { wallets: evmWalletsList, ready: evmWalletsReady } = useEvmWallets();
  const {
    sendPayment: sendEvmPayment,
    getBalance: getEvmBalance,
    loading: evmLoading,
  } = useEvmPayment();

  // Mayan cross-chain swap hook
  const {
    executeSwap: executeMayanSwap,
    getQuotePreview: getMayanQuotePreview,
    trackSwap: trackMayanSwap,
    loading: mayanLoading,
    status: mayanStatus,
    error: mayanError,
  } = useMayanSwap();

  // Get active EVM wallet
  const activeEvmWallet =
    evmWalletsList?.find((w) => w.walletClientType !== "privy") ||
    evmWalletsList?.[0];
  const hasEvmWallet = !!activeEvmWallet;

  // Determine if selected chain is EVM
  const isEvmChain = selectedChain !== "solana";

  // Check if gasless is available
  useEffect(() => {
    async function checkGasless() {
      try {
        const response = await fetch("/api/gasless");
        const data = await response.json();
        setGaslessAvailable(data.enabled === true);
      } catch {
        setGaslessAvailable(false);
      } finally {
        setCheckingGasless(false);
      }
    }
    checkGasless();
  }, []);

  // Fetch Mayan quote preview when EVM chain is selected
  useEffect(() => {
    async function fetchMayanQuote() {
      if (!isEvmChain || amount <= 0) {
        setMayanQuotePreview(null);
        return;
      }

      const preview = await getMayanQuotePreview(amount, selectedChain);
      setMayanQuotePreview(preview);
    }
    fetchMayanQuote();
  }, [isEvmChain, amount, selectedChain, getMayanQuotePreview]);

  // Get active wallet - prefer the wallet that's actually connected
  // Privy may detect multiple wallet extensions, but only one is actively connected
  const activeWallet = (() => {
    if (!wallets || wallets.length === 0) return undefined;

    // Type helper for wallet client type check
    type WalletWithClientType = {
      walletClientType?: string;
      connected?: boolean;
      address: string;
    };

    // First, try to find an external wallet that's explicitly connected
    const connectedExternal = wallets.find(
      (w) =>
        (w as WalletWithClientType).walletClientType !== "privy" &&
        (w as WalletWithClientType).connected === true
    );
    if (connectedExternal) return connectedExternal;

    // Next, check the user's linked accounts to see which wallet they authenticated with
    const linkedWalletAddress = user?.linkedAccounts?.find(
      (account) =>
        account.type === "wallet" && account.walletClientType !== "privy"
    );
    if (linkedWalletAddress && "address" in linkedWalletAddress) {
      const matchingWallet = wallets.find(
        (w) => w.address === linkedWalletAddress.address
      );
      if (matchingWallet) return matchingWallet;
    }

    // Fall back to any external wallet
    const externalWallet = wallets.find(
      (w) => (w as WalletWithClientType).walletClientType !== "privy"
    );
    if (externalWallet) return externalWallet;

    // Last resort: embedded wallet
    return wallets[0];
  })();

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

      // Get SOL balance for gas
      const lamports = await connection.getBalance(walletPubkey);
      setSolBalance(lamports / 1_000_000_000); // Convert lamports to SOL

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
      setSolBalance(0);
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

  // Process gasless payment via Kora
  const processGaslessPayment = async () => {
    if (!activeWallet?.address || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    setStep("processing");
    setError("");

    try {
      // Step 1: Create transfer transaction via Kora API
      const transferResponse = await fetch("/api/gasless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer",
          amount: Math.floor(amount * 1_000_000), // Convert to atomic units
          token: USDC_MINT_ADDRESS,
          source: activeWallet.address,
          destination: merchantWallet,
        }),
      });

      if (!transferResponse.ok) {
        const errorData = await transferResponse.json();
        throw new Error(errorData.error || "Failed to create transfer");
      }

      const { transaction: txBase64 } = await transferResponse.json();
      console.log("[Gasless] Transfer transaction created");

      // Step 2: Sign with user's wallet (sign only, don't send - Kora will send)
      const txBytes = Buffer.from(txBase64, "base64");
      const wallet = activeWallet;

      console.log("[Gasless] Requesting user signature...");
      const signedResult = await signTransaction({
        transaction: txBytes,
        wallet: wallet,
        chain: "solana:devnet",
      });

      console.log("[Gasless] User signed, sending to Kora for submission...");

      // Step 3: Send user-signed transaction to Kora for fee payer signature + submission
      const signedTxBase64 = Buffer.from(
        signedResult.signedTransaction
      ).toString("base64");

      const signAndSendResponse = await fetch("/api/gasless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signAndSend",
          transaction: signedTxBase64,
        }),
      });

      if (!signAndSendResponse.ok) {
        const errorData = await signAndSendResponse.json();
        throw new Error(errorData.error || "Failed to submit transaction");
      }

      const { signature } = await signAndSendResponse.json();
      console.log("[Gasless] Transaction sent:", signature);
      setTxSignature(signature);

      // Complete checkout session if applicable
      if (sessionId) {
        try {
          const completeResponse = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              signature: signature,
              customerWallet: activeWallet.address,
            }),
          });

          if (completeResponse.ok) {
            console.log("[Gasless] Checkout completed");
            if (successUrl) {
              window.location.href = successUrl;
              return;
            }
          }
        } catch (completeErr) {
          console.error("Error completing checkout:", completeErr);
        }
      }

      setStep("success");
      sendToParent("settlr:success", {
        signature: signature,
        amount,
        merchantWallet,
        memo,
        gasless: true,
      });
    } catch (err: unknown) {
      console.error("[Gasless] Payment error:", err);
      // If gasless fails, offer to retry with normal payment
      const errorMessage =
        err instanceof Error ? err.message : "Gasless payment failed";
      setError(`${errorMessage}. Try disabling gasless mode.`);
      setStep("error");
      sendToParent("settlr:error", { message: errorMessage });
    }
  };

  // Process EVM payment via Mayan (cross-chain to Solana)
  const processEvmPayment = async () => {
    if (!activeEvmWallet?.address || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    setStep("processing");
    setError("");

    try {
      // Use Mayan to bridge USDC from EVM chain to merchant's Solana wallet
      const result = await executeMayanSwap({
        amount,
        fromChain: selectedChain,
        toAddress: merchantWallet, // Merchant's Solana address
      });

      if (!result.success) {
        throw new Error(result.error || "Cross-chain payment failed");
      }

      setTxSignature(result.hash || "");

      // Complete checkout session if applicable
      if (sessionId && result.hash) {
        try {
          const completeResponse = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              signature: result.hash,
              customerWallet: activeEvmWallet.address,
              chain: selectedChain,
              bridgeType: "mayan",
              destinationChain: "solana",
            }),
          });

          if (completeResponse.ok) {
            console.log("[Mayan] Checkout completed");
            if (successUrl) {
              window.location.href = successUrl;
              return;
            }
          }
        } catch (completeErr) {
          console.error("Error completing checkout:", completeErr);
        }
      }

      setStep("success");
      sendToParent("settlr:success", {
        signature: result.hash,
        amount,
        merchantWallet,
        memo,
        sourceChain: selectedChain,
        destinationChain: "solana",
        bridgeType: "mayan",
      });
    } catch (err: unknown) {
      console.error("[EVM] Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      setStep("error");
      sendToParent("settlr:error", { message: errorMessage });
    }
  };

  // Process payment (standard - user pays gas)
  const processPayment = async () => {
    // If EVM chain is selected, use EVM payment flow
    if (isEvmChain) {
      return processEvmPayment();
    }

    // If gasless is enabled, use that flow
    if (useGasless && gaslessAvailable) {
      return processGaslessPayment();
    }

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

      // Sign and send via Privy with gas sponsorship
      // For embedded wallets, use sponsor: true so Privy pays gas (like Pump.fun)
      // For external wallets, user pays their own gas
      const result = await signAndSendTransaction({
        transaction: serializedTx,
        wallet: activeWallet,
        chain: "solana:devnet",
        options: {
          skipPreflight: true,
          commitment: "confirmed",
          // Enable Privy gas sponsorship for embedded wallets (no SOL needed!)
          sponsor: !isExternalWallet,
        },
      });

      console.log("Transaction result:", result);
      // Convert signature Uint8Array to base58 string
      const signatureBase58 = encodeBase58(result.signature);
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Auth step - login with email/social
  if (step === "auth") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
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
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Connect existing wallet - Using login with wallet */}
                  <button
                    onClick={() => login({ loginMethods: ["wallet"] })}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
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
            <Link href="/" className="text-purple-400 hover:text-purple-300">
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative">
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
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
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
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
    // Check balance based on selected chain
    const currentBalance = isEvmChain ? evmBalance : balance;
    const hasEnoughBalance =
      currentBalance !== null && currentBalance >= amount;
    const hasCorrectWallet = isEvmChain ? hasEvmWallet : !!activeWallet;

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
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
                <Wallet className="w-5 h-5 text-purple-400" />
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
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
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

            {/* Chain Selector */}
            <div className="mb-4 p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs mb-1">Pay with USDC on</p>
                  <ChainSelector
                    selectedChain={selectedChain}
                    onSelect={(chain) => {
                      setSelectedChain(chain);
                      // Reset balance when chain changes
                      if (chain === "solana") {
                        fetchBalance();
                      } else {
                        // Fetch EVM balance
                        getEvmBalance(chain).then(setEvmBalance);
                      }
                    }}
                    availableChains={IS_DEVNET ? ["solana"] : undefined}
                  />
                </div>
                {isEvmChain && activeEvmWallet && (
                  <div className="text-right">
                    <p className="text-zinc-400 text-xs">Balance</p>
                    <p
                      className={`text-sm font-medium ${
                        (evmBalance || 0) >= amount
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ${evmBalance?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                )}
              </div>
              {IS_DEVNET && (
                <p className="text-yellow-400/70 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Devnet mode - multichain disabled
                </p>
              )}
              {isEvmChain && !hasEvmWallet && !IS_DEVNET && (
                <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Connect an Ethereum wallet to pay on {selectedChain}
                </p>
              )}
            </div>

            {/* Payment details */}
            <div className="bg-zinc-800/50 rounded-2xl p-4 mb-4">
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

            {/* Mayan Cross-chain Info (for EVM chains) */}
            {isEvmChain && (
              <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Cross-Chain Payment
                    </p>
                    <p className="text-zinc-400 text-xs">
                      Bridged to Solana via Mayan
                    </p>
                  </div>
                </div>
                {mayanQuotePreview ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>You pay ({selectedChain})</span>
                      <span className="text-white">
                        ${amount.toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Merchant receives (Solana)</span>
                      <span className="text-green-400">
                        ~${mayanQuotePreview.expectedOut.toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Bridge fee</span>
                      <span>${mayanQuotePreview.fee.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Estimated time</span>
                      <span>{mayanQuotePreview.eta}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Fetching best route...</span>
                  </div>
                )}
              </div>
            )}

            {/* Gasless Toggle (Solana only, external wallets only) */}
            {/* Note: Gasless requires partial signing which Privy embedded wallets don't support */}
            {!isEvmChain &&
              !checkingGasless &&
              gaslessAvailable &&
              isExternalWallet && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Gasless Payment
                        </p>
                        <p className="text-zinc-400 text-xs">
                          No SOL needed for gas fees
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUseGasless(!useGasless)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        useGasless ? "bg-emerald-500" : "bg-zinc-600"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          useGasless ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {useGasless && (
                    <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Gas fees covered by Settlr
                    </p>
                  )}
                </div>
              )}

            {/* Low balance warning with fund options */}
            {!hasEnoughBalance && balance !== null && activeWallet && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    You need ${(amount - balance).toFixed(2)} more USDC
                  </p>
                </div>

                {/* Privy Fund Wallet - Primary CTA */}
                {!isExternalWallet && (
                  <button
                    onClick={() => {
                      fundWallet({
                        address: activeWallet.address,
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 mb-3"
                  >
                    <CreditCard className="w-5 h-5" />
                    Add Funds
                  </button>
                )}

                {/* Devnet: Get test USDC from faucet */}
                {IS_DEVNET && (
                  <>
                    <div className="text-center text-zinc-500 text-xs mb-2">
                      — or for testing —
                    </div>
                    <a
                      href="https://faucet.circle.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors mb-3"
                    >
                      <Plus className="w-4 h-4" />
                      Get Devnet USDC (Circle Faucet)
                    </a>
                  </>
                )}

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

            {/* Low SOL balance warning for gas (only for external wallets on Solana, not using Kora gasless) */}
            {/* Embedded wallets get Privy gas sponsorship, so they don't need SOL */}
            {!isEvmChain &&
              !useGasless &&
              isExternalWallet &&
              solBalance !== null &&
              solBalance < 0.001 &&
              hasEnoughBalance &&
              activeWallet && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Fuel className="w-4 h-4" />
                    <p className="text-sm font-medium">Need SOL for gas</p>
                  </div>
                  <p className="text-zinc-400 text-xs mb-3">
                    You need a small amount of SOL (~0.001) to pay for
                    transaction fees.
                  </p>
                  {/* Privy Fund SOL - for embedded wallets */}
                  {!isExternalWallet && (
                    <button
                      onClick={() => {
                        fundWallet({
                          address: activeWallet.address,
                          options: {
                            asset: "native-currency", // Fund with SOL
                            amount: "0.01", // Small amount for gas
                          },
                        });
                      }}
                      className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors mb-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Add SOL for Gas
                    </button>
                  )}
                  {/* Fallback: Devnet faucet */}
                  {IS_DEVNET && (
                    <a
                      href="https://faucet.solana.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
                    >
                      <Fuel className="w-4 h-4" />
                      Get Devnet SOL (Faucet)
                    </a>
                  )}
                </div>
              )}

            <button
              onClick={processPayment}
              disabled={
                !hasEnoughBalance ||
                loadingBalance ||
                !hasCorrectWallet ||
                evmLoading ||
                // Only check SOL balance for external wallets (embedded wallets have Privy gas sponsorship)
                (!isEvmChain &&
                  !useGasless &&
                  isExternalWallet &&
                  solBalance !== null &&
                  solBalance < 0.001)
              }
              className={`w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                hasEnoughBalance &&
                !loadingBalance &&
                hasCorrectWallet &&
                (isEvmChain ||
                  useGasless ||
                  !isExternalWallet || // Embedded wallets always enabled (Privy sponsors gas)
                  (solBalance !== null && solBalance >= 0.001))
                  ? isEvmChain
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
                    : useGasless && gaslessAvailable
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90"
                    : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-90"
                  : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {isEvmChain ? (
                <>
                  <Check className="w-5 h-5" />
                  Pay ${amount.toFixed(2)} USDC on{" "}
                  {selectedChain.charAt(0).toUpperCase() +
                    selectedChain.slice(1)}
                </>
              ) : useGasless && gaslessAvailable ? (
                <>
                  <Fuel className="w-5 h-5" />
                  Pay ${amount.toFixed(2)} USDC (No Gas)
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Pay ${amount.toFixed(2)} USDC
                </>
              )}
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
    // Determine status message based on Mayan status for cross-chain payments
    let statusMessage = "Please wait while we confirm your transaction...";
    let statusTitle = "Processing Payment";

    if (isEvmChain && mayanStatus !== "idle") {
      switch (mayanStatus) {
        case "quoting":
          statusTitle = "Finding Best Route";
          statusMessage = "Getting the best cross-chain swap rate...";
          break;
        case "approving":
          statusTitle = "Approving USDC";
          statusMessage = "Please approve USDC spending in your wallet...";
          break;
        case "swapping":
          statusTitle = "Bridging to Solana";
          statusMessage = "Sending USDC cross-chain via Mayan...";
          break;
        case "tracking":
          statusTitle = "Confirming Bridge";
          statusMessage = "Waiting for cross-chain confirmation...";
          break;
      }
    }

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{statusTitle}</h2>
          <p className="text-zinc-400">{statusMessage}</p>
          {isEvmChain && (
            <p className="text-xs text-zinc-500 mt-4">
              Cross-chain payment powered by Mayan
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Success step
  if (step === "success") {
    // For EVM cross-chain payments, link to Mayan explorer
    // For Solana direct payments, link to Solana explorer
    const isCrossChain = selectedChain !== "solana";
    const explorerUrl = isCrossChain
      ? `https://explorer.mayan.finance/swap/${txSignature}`
      : getExplorerUrl(selectedChain, txSignature);
    const explorerName = isCrossChain ? "Mayan Explorer" : "Solana Explorer";

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
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
            {selectedChain !== "solana" && (
              <span className="block text-sm text-zinc-500 mt-1">
                Bridged from{" "}
                {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}{" "}
                → Solana via Mayan
              </span>
            )}
          </p>

          {txSignature && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
            >
              View on {explorerName}
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
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
              className="block w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
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
