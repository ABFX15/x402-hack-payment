"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { usePrivy } from "@privy-io/react-auth";
import { BuyerTourModal } from "@/components/buyer/BuyerTourModal";
import {
  SOLANA_RPC_URL,
  USDC_MINT_ADDRESS as CONSTANTS_USDC_MINT,
  IS_DEVNET,
  solscanUrl,
} from "@/lib/constants";
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
  Lock,
  ShieldCheck,
  Building2,
  Landmark,
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
import { TokenSelector } from "@/components/TokenSelector";
import {
  useJupiterSwap,
  SOLANA_TOKENS,
  USDC_MINT as JUPITER_USDC_MINT,
} from "@/hooks/useJupiterSwap";
import {
  useOnRamp,
  getRecommendedTier,
  PAYMENT_TIERS,
} from "@/hooks/useOnRamp";
import {
  encryptReceipt,
  hashEncryptedReceipt,
  type ReceiptPlaintext,
} from "@/lib/receipt-encryption";

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
    mint: CONSTANTS_USDC_MINT,
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
const RPC_ENDPOINT = SOLANA_RPC_URL;

interface CheckoutClientProps {
  searchParams: URLSearchParams;
}

async function getTokenBalanceRaw(
  connection: Connection,
  tokenAccount: PublicKey,
): Promise<bigint> {
  try {
    const info = await connection.getTokenAccountBalance(tokenAccount);
    return BigInt(info.value.amount || "0");
  } catch {
    return BigInt(0);
  }
}

async function assertTransactionConfirmed(
  connection: Connection,
  signature: string,
  context: string,
): Promise<void> {
  const status = await connection.getSignatureStatuses([signature], {
    searchTransactionHistory: true,
  });
  const value = status.value[0];

  if (!value) {
    throw new Error(`${context}: transaction status unavailable`);
  }

  if (value.err) {
    throw new Error(`${context}: ${JSON.stringify(value.err)}`);
  }
}

export default function CheckoutClient({ searchParams }: CheckoutClientProps) {
  const router = useRouter();
  const {
    connected: authenticated,
    publicKey: walletPubkey,
    signTransaction: walletAdapterSignTransaction,
    sendTransaction: walletAdapterSendTransaction,
    disconnect,
  } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  // Privy email-first - the embedded Solana wallet auto-registers via the
  // Wallet Standard, so wallet-adapter picks it up after login. No extra
  // signing path needed here.
  const privyEnabled = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const privy = usePrivy();
  const ready = true;
  const walletsReady = true;

  // Payment params from URL
  const amount = parseFloat(searchParams.get("amount") || "0");
  const merchantName = searchParams.get("merchant") || "Merchant";
  const merchantWallet = searchParams.get("to") || "";
  const memo = searchParams.get("memo") || "";

  // Session-based checkout (for webhook support)
  const sessionId = searchParams.get("session") || "";
  const successUrl = searchParams.get("successUrl") || "";
  const cancelUrl = searchParams.get("cancelUrl") || "";

  // Privacy mode - encrypt amounts on-chain
  const isPrivatePayment = searchParams.get("private") === "true";

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
    | "kyc"
    | "confirm"
    | "otc-quote"
    | "processing"
    | "success"
    | "error"
  >("loading");
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [paidFromWallet, setPaidFromWallet] = useState<string>("");
  const [otcEmail, setOtcEmail] = useState("");
  const [otcQuote, setOtcQuote] = useState<{
    quoteId: string;
    indicativeRate: number;
    indicativeTotal: number;
    expiresAt: string;
    wireInstructions: {
      bankName: string;
      accountName: string;
      reference: string;
      note: string;
    };
    estimatedDelivery: string;
  } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null); // SOL balance for gas
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [useGasless, setUseGasless] = useState(false); // Gasless only works with external wallets
  const [gaslessAvailable, setGaslessAvailable] = useState(false);
  const [checkingGasless, setCheckingGasless] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Prevent double submissions

  // KYC state
  const [merchantKycEnabled, setMerchantKycEnabled] = useState(false);
  const [merchantKycLevel, setMerchantKycLevel] =
    useState<string>("basic-kyc-level");
  const [customerKycStatus, setCustomerKycStatus] = useState<
    "pending" | "verified" | "rejected" | "unknown"
  >("unknown");
  const [checkingKyc, setCheckingKyc] = useState(false);

  // Privacy state (MagicBlock PER)
  // If URL has private=true, force privacy on and don't allow toggling
  const [privacyEnabled, setPrivacyEnabled] = useState(isPrivatePayment);
  const isPrivacyForced = isPrivatePayment; // Can't toggle off if merchant requested private
  const [privateReceiptHandle, setPrivateReceiptHandle] = useState<
    string | null
  >(null);
  const [issuingPrivateReceipt, setIssuingPrivateReceipt] = useState(false);

  // Get a simple wallet reference for Jupiter
  const jupiterWalletAddress = walletPubkey?.toBase58() || null;

  // Jupiter swap hook (for paying with SOL/BONK/etc on Solana)
  const {
    status: jupiterStatus,
    error: jupiterError,
    selectedToken,
    availableTokens,
    quote: jupiterQuote,
    inputAmountFormatted: jupiterInputAmount,
    priceImpact: jupiterPriceImpact,
    tokenBalance: jupiterTokenBalance,
    hasEnoughBalance: jupiterHasEnoughBalance,
    selectToken: selectJupiterToken,
    getQuote: getJupiterQuote,
    executeSwap: executeJupiterSwap,
    reset: resetJupiter,
  } = useJupiterSwap(jupiterWalletAddress);

  // On-ramp: tiered system (card / bank / OTC) based on amount
  const {
    status: onRampStatus,
    error: onRampError,
    availableTiers,
    recommendedTier,
    openCardOnRamp,
    openBankOnRamp,
    requestOtcQuote,
    reset: resetOnRamp,
  } = useOnRamp(amount);

  // When on-ramp completes (popup closes), refresh balance
  useEffect(() => {
    if (onRampStatus === "funded" && activeWallet?.address) {
      fetchBalance();
      resetOnRamp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRampStatus]);

  // Auto off-ramp: trigger when payment succeeds
  useEffect(() => {
    if (step === "success" && merchantWallet && amount > 0 && txSignature) {
      // Fire-and-forget - don't block the success screen
      fetch("/api/auto-offramp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantWallet,
          amount,
          txSignature,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.triggered) {
            console.log(
              `[auto-offramp] Triggered: $${amount} → ${data.offramp.currency} via ${data.offramp.provider}`,
            );
          }
        })
        .catch(() => {
          // Silent fail - off-ramp is secondary to the payment
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Whether a Jupiter swap is needed (non-USDC token selected on Solana mainnet)
  // Jupiter only works on mainnet, not devnet
  const needsJupiterSwap =
    !IS_DEVNET && selectedToken.mint !== JUPITER_USDC_MINT;

  // Check if gasless is available (Kora for external wallets)
  useEffect(() => {
    async function checkGasless() {
      try {
        const response = await fetch("/api/gasless");
        const data = await response.json();
        const isEnabled = data.enabled === true;
        setGaslessAvailable(isEnabled);
        // Auto-enable gasless when available (best UX - no gas fees for users)
        if (isEnabled) {
          setUseGasless(true);
        }
      } catch {
        setGaslessAvailable(false);
      } finally {
        setCheckingGasless(false);
      }
    }
    checkGasless();
  }, []);

  // Check merchant KYC settings
  useEffect(() => {
    async function checkMerchantKyc() {
      if (!merchantWallet) return;

      try {
        const response = await fetch(
          `/api/merchants/settings?wallet=${merchantWallet}`,
        );
        if (response.ok) {
          const data = await response.json();
          setMerchantKycEnabled(data.kycEnabled === true);
          setMerchantKycLevel(data.kycLevel || "basic-kyc-level");
          console.log("[KYC] Merchant settings:", {
            enabled: data.kycEnabled,
            level: data.kycLevel,
          });
        }
      } catch (err) {
        console.log("[KYC] Could not fetch merchant settings:", err);
      }
    }
    checkMerchantKyc();
  }, [merchantWallet]);

  // Fetch Jupiter quote when Solana token changes (for non-USDC tokens)
  // Only runs on mainnet since Jupiter doesn't work on devnet
  useEffect(() => {
    if (IS_DEVNET) return; // Jupiter only works on mainnet
    if (needsJupiterSwap && amount > 0) {
      console.log(
        `[Jupiter] Getting quote for ${amount} USDC worth of ${selectedToken.symbol}`,
      );
      getJupiterQuote(amount);
    }
  }, [needsJupiterSwap, amount, selectedToken, getJupiterQuote]);

  // Get active wallet from wallet-adapter
  const activeWallet = walletPubkey
    ? { address: walletPubkey.toBase58(), connected: authenticated }
    : undefined;

  // With wallet-adapter, user always has external wallet
  const hasExternalWallet = authenticated;
  const isExternalWallet = true;

  // Check customer KYC status when merchant requires it
  useEffect(() => {
    async function checkCustomerKyc() {
      if (!merchantKycEnabled || !activeWallet?.address || !merchantWallet)
        return;

      setCheckingKyc(true);
      try {
        const response = await fetch(
          `/api/kyc/status?customerId=${activeWallet.address}&merchantId=${merchantWallet}`,
        );
        if (response.ok) {
          const data = await response.json();
          setCustomerKycStatus(data.status || "unknown");
          console.log("[KYC] Customer status:", data.status);
        }
      } catch (err) {
        console.log("[KYC] Could not fetch customer status:", err);
        setCustomerKycStatus("unknown");
      } finally {
        setCheckingKyc(false);
      }
    }
    checkCustomerKyc();
  }, [merchantKycEnabled, activeWallet?.address, merchantWallet]);

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

  // Issue a private receipt for the payment.
  //
  // Privacy model: the on-chain USDC transfer is unchanged (amount visible
  // on Solscan - that is unavoidable without a real ZK shielding integration).
  // What this hides from observers / DB readers is the *receipt metadata*:
  // memo, line items, customer email, exact split, etc.
  //
  // Flow:
  //   1. Fetch the merchant's published X25519 receipt-encryption pubkey
  //      from /api/merchants/receipt-key. If the merchant has never set
  //      one, fall back to an unencrypted receipt and surface a warning.
  //   2. Encrypt the full receipt details client-side using NaCl box.
  //   3. POST the ciphertext + payload hash to /api/privacy/receipt where
  //      it lands in Supabase. Only the merchant's wallet can decrypt.
  const issuePrivateReceipt = useCallback(
    async (
      paymentId: string,
      paymentAmount: number,
      customerAddress: string,
      merchantAddress: string,
    ) => {
      if (!privacyEnabled) return;

      setIssuingPrivateReceipt(true);
      try {
        // 1. Lookup merchant's encryption pubkey
        let recipientPubkey: string | null = null;
        try {
          const keyRes = await fetch(
            `/api/merchants/receipt-key?wallet=${encodeURIComponent(
              merchantAddress,
            )}`,
          );
          if (keyRes.ok) {
            const keyData = await keyRes.json();
            recipientPubkey = keyData.receiptPubkey || null;
          } else if (keyRes.status === 404) {
            console.warn(
              "[Privacy] Merchant has not published a receipt-encryption pubkey - receipt will be stored unencrypted (handle/hash only).",
            );
          }
        } catch (err) {
          console.warn("[Privacy] receipt-key lookup failed:", err);
        }

        // 2. Encrypt if we have a key
        let encrypted: ReturnType<typeof encryptReceipt> | null = null;
        let payloadHash: string | null = null;
        if (recipientPubkey) {
          const plaintext: ReceiptPlaintext = {
            paymentId,
            amount: paymentAmount,
            currency: "USDC",
            customerWallet: customerAddress,
            merchantWallet: merchantAddress,
            memo: memo || undefined,
            timestamp: new Date().toISOString(),
          };
          encrypted = encryptReceipt(plaintext, recipientPubkey);
          payloadHash = await hashEncryptedReceipt(encrypted);
        }

        // 3. POST to receipt API
        const response = await fetch("/api/privacy/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "issue",
            paymentId,
            amount: paymentAmount,
            customer: customerAddress,
            merchant: merchantAddress,
            txSignature: paymentId,
            encrypted,
            payloadHash,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.handleShort) {
            setPrivateReceiptHandle(data.handleShort);
          }
        } else {
          console.error(
            "[Privacy] Failed to issue private receipt:",
            await response.text(),
          );
        }
      } catch (err) {
        console.error("[Privacy] Error issuing private receipt:", err);
      } finally {
        setIssuingPrivateReceipt(false);
      }
    },
    [privacyEnabled, memo],
  );

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
        // Check if merchant requires KYC and customer isn't verified
        if (
          merchantKycEnabled &&
          customerKycStatus !== "verified" &&
          !checkingKyc
        ) {
          setStep("kyc");
        } else if (!merchantKycEnabled || customerKycStatus === "verified") {
          setStep("confirm");
        }
        fetchBalance();
      } else {
        setStep("wallet");
      }
    }
  }, [
    ready,
    authenticated,
    walletsReady,
    activeWallet,
    fetchBalance,
    merchantKycEnabled,
    customerKycStatus,
    checkingKyc,
  ]);

  // Connect wallet via wallet-adapter
  const handleCreateWallet = async () => {
    setError("");
    setCreatingWallet(true);
    try {
      openWalletModal(true);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet");
    } finally {
      setCreatingWallet(false);
    }
  };

  // Process gasless payment via Kora
  // Note: Privacy receipts are issued at the end of this flow if enabled
  const processGaslessPayment = async () => {
    if (!activeWallet?.address || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    // Prevent double submissions
    if (isProcessingPayment) {
      console.log(
        "[Gasless] Payment already in progress, ignoring duplicate request",
      );
      return;
    }

    setIsProcessingPayment(true);
    setStep("processing");
    setError("");

    // Track extracted signature for use in catch block
    let extractedSignature: string | null = null;

    try {
      // Step 0: Check merchant wallet safety with Range Security
      console.log("[Gasless] Checking merchant wallet safety...");
      const riskCheck = await fetch(
        `/api/risk-check?address=${merchantWallet}`,
      );
      const riskData = await riskCheck.json();

      if (riskData.blocked) {
        console.error("[Gasless] Merchant wallet blocked:", riskData.riskLevel);
        throw new Error(
          `Payment blocked: Merchant wallet flagged as ${riskData.riskLevel}. ${riskData.reasoning}`,
        );
      }

      if (riskData.warning) {
        console.warn("[Gasless] Merchant wallet warning:", riskData.riskLevel);
      }

      console.log(
        "[Gasless] Merchant wallet safe, risk score:",
        riskData.riskScore,
      );

      // Generate a unique nonce for this payment to prevent duplicate transaction errors
      const paymentNonce = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      console.log("[Gasless] Payment nonce:", paymentNonce);

      // Track expected platform fee and treasury balance delta for verification
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const PLATFORM_FEE_BPS = BigInt(100); // 1%
      const PROGRAM_ID = new PublicKey(
        "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5",
      );
      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID,
      );
      const totalAmount = BigInt(Math.floor(amount * 1_000_000));
      const platformFee = (totalAmount * PLATFORM_FEE_BPS) / BigInt(10000);
      const treasuryBalanceBefore = await getTokenBalanceRaw(
        connection,
        treasuryPDA,
      );

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
          nonce: paymentNonce, // Add unique nonce
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

      console.log("[Gasless] Requesting user signature...");
      if (!walletAdapterSignTransaction) throw new Error("Wallet cannot sign");
      const txToSign = Transaction.from(txBytes);
      const signedTx = await walletAdapterSignTransaction(txToSign);
      const signedTxBytes = signedTx.serialize({ requireAllSignatures: false });

      console.log("[Gasless] User signed, submitting via Kora...");

      // Step 3: Submit the transaction via Kora's signAndSendTransaction
      // Kora will add its fee payer signature and broadcast to Solana
      const signedTxBase64 = Buffer.from(signedTxBytes).toString("base64");

      // Try to extract the signature from the signed transaction before sending
      // This helps us get the signature even if something goes wrong
      try {
        const { Transaction, VersionedTransaction } = await import(
          "@solana/web3.js"
        );
        // Try parsing as versioned transaction first
        try {
          const vtx = VersionedTransaction.deserialize(txBytes);
          if (vtx.signatures[0]) {
            const bs58 = await import("bs58");
            extractedSignature = bs58.default.encode(vtx.signatures[0]);
            console.log(
              "[Gasless] Extracted signature from versioned tx:",
              extractedSignature,
            );
          }
        } catch {
          // Try legacy transaction
          const tx = Transaction.from(txBytes);
          if (tx.signature) {
            const bs58 = await import("bs58");
            extractedSignature = bs58.default.encode(tx.signature);
            console.log(
              "[Gasless] Extracted signature from legacy tx:",
              extractedSignature,
            );
          }
        }
      } catch (extractErr) {
        console.log("[Gasless] Could not extract signature:", extractErr);
      }

      // Use Kora's signAndSendTransaction to have Kora pay the gas and broadcast
      const koraResponse = await fetch("/api/gasless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signAndSend",
          transaction: signedTxBase64,
        }),
      });

      if (!koraResponse.ok) {
        const errorData = await koraResponse.json();
        throw new Error(errorData.error || "Failed to submit transaction");
      }

      const koraResult = await koraResponse.json();
      let { signature } = koraResult;
      const { alreadyProcessed } = koraResult;

      // If already processed but we extracted the signature, use that
      if (alreadyProcessed && !signature && extractedSignature) {
        signature = extractedSignature;
        console.log("[Gasless] Using extracted signature:", signature);
      }

      if (alreadyProcessed) {
        console.log(
          "[Gasless] Transaction was already processed - wallet likely auto-submitted",
        );
      } else {
        console.log("[Gasless] Transaction sent:", signature);
      }

      const finalSignature = signature || extractedSignature;
      if (!finalSignature) {
        throw new Error(
          "Gasless payment submitted but no transaction signature was returned.",
        );
      }

      await connection.confirmTransaction(finalSignature, "confirmed");
      await assertTransactionConfirmed(
        connection,
        finalSignature,
        "Gasless settlement transaction failed",
      );

      if (platformFee > BigInt(0)) {
        const treasuryBalanceAfter = await getTokenBalanceRaw(
          connection,
          treasuryPDA,
        );
        const feeCredited = treasuryBalanceAfter - treasuryBalanceBefore;
        if (feeCredited < platformFee) {
          throw new Error(
            `Gasless fee transfer missing: expected >= ${platformFee}, got ${feeCredited}`,
          );
        }
      }

      setTxSignature(finalSignature);

      // Complete checkout session if applicable
      if (sessionId) {
        try {
          const completeResponse = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              signature: finalSignature,
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
      } else {
        // No session - record payment for redirect-based checkouts
        try {
          await fetch("/api/payments/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signature: finalSignature,
              merchantWallet,
              customerWallet: activeWallet.address,
              amount,
              memo,
            }),
          });
          console.log("[Gasless] Payment recorded for redirect flow");
        } catch (recordErr) {
          console.error("[Gasless] Error recording payment:", recordErr);
        }
      }

      // Issue private receipt for the payment (MagicBlock PER)
      const paymentId = finalSignature || `payment_${Date.now()}`;
      issuePrivateReceipt(
        paymentId,
        amount,
        activeWallet.address,
        merchantWallet,
      );

      setPaidFromWallet(activeWallet.address);
      setStep("success");
      sendToParent("offbank:success", {
        signature: finalSignature,
        amount,
        merchantWallet,
        memo,
        gasless: true,
        privacy: privacyEnabled,
      });
    } catch (err: unknown) {
      console.error("[Gasless] Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gasless payment failed";

      // Check if it's an "already processed" error.
      // Treat as success only when we still have a concrete signature.
      if (
        errorMessage.includes("already been processed") ||
        errorMessage.includes("AlreadyProcessed") ||
        errorMessage.includes("-32002")
      ) {
        if (!extractedSignature) {
          setError(
            "Gasless transaction may have been processed, but no signature was available to verify treasury fee transfer.",
          );
          setStep("error");
          sendToParent("offbank:error", {
            message:
              "Gasless processed without signature; fee transfer could not be verified.",
          });
          return;
        }
      }

      // For other errors, show error state
      setError(`${errorMessage}. Please try again.`);
      setStep("error");
      sendToParent("offbank:error", { message: errorMessage });
    } finally {
      // Always reset the processing flag
      setIsProcessingPayment(false);
    }
  };

  // Process Jupiter swap payment (swap token to USDC, then transfer)
  const processJupiterPayment = async () => {
    if (!activeWallet?.address || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    if (!jupiterQuote) {
      setError("No swap quote available. Please try again.");
      setStep("error");
      return;
    }

    setStep("processing");
    setError("");

    try {
      console.log(
        `[Jupiter] Swapping ${jupiterInputAmount} ${selectedToken.symbol} → ${amount} USDC`,
      );

      // Step 1: Execute Jupiter swap (token → USDC)
      // The swap result gives user USDC in their wallet
      const swapSignature = await executeJupiterSwap(async (tx) => {
        // Sign the VersionedTransaction using wallet-adapter
        // wallet-adapter doesn't support VersionedTransaction signing directly,
        // but we can use the wallet provider's signTransaction
        if (!walletAdapterSignTransaction)
          throw new Error("Wallet cannot sign");
        // For VersionedTransaction, we need to use the wallet provider directly
        const provider =
          (window as any).phantom?.solana || (window as any).solflare;
        if (provider?.signTransaction) {
          return provider.signTransaction(tx);
        }
        throw new Error("Wallet does not support VersionedTransaction signing");
      });

      if (!swapSignature) {
        // Swap returned null - means it was USDC and no swap needed
        // This shouldn't happen if needsJupiterSwap is true, but handle it
        console.log("[Jupiter] No swap needed, proceeding with USDC transfer");
      } else {
        console.log(`[Jupiter] Swap complete: ${swapSignature}`);
      }

      // Step 2: Now transfer USDC to merchant with platform fee
      // At this point, user has USDC from the swap
      const connection = new Connection(RPC_ENDPOINT, "confirmed");

      // Platform fee configuration
      const PLATFORM_FEE_BPS_JUPITER = BigInt(100); // 1% = 100 basis points
      const PROGRAM_ID_JUPITER = new PublicKey(
        "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5",
      );
      // Use the on-chain program's treasury PDA (already initialized as token account)
      const [treasuryPDAJupiter] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID_JUPITER,
      );

      const userPubkey = new PublicKey(activeWallet.address);
      const merchantPubkey = new PublicKey(merchantWallet);
      const userAta = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
      const merchantAta = await getAssociatedTokenAddress(
        USDC_MINT,
        merchantPubkey,
      );

      // Calculate fee split
      const totalAmountJupiter = BigInt(
        Math.round(amount * Math.pow(10, USDC_DECIMALS)),
      );
      const platformFeeJupiter =
        (totalAmountJupiter * PLATFORM_FEE_BPS_JUPITER) / BigInt(10000);
      const merchantAmountJupiter = totalAmountJupiter - platformFeeJupiter;

      console.log(
        `[Jupiter] Fee split: merchant=${merchantAmountJupiter}, platform=${platformFeeJupiter}`,
      );

      const transaction = new Transaction();

      // Check if merchant ATA exists
      try {
        await getAccount(connection, merchantAta);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPubkey,
            merchantAta,
            merchantPubkey,
            USDC_MINT,
          ),
        );
      }

      // Treasury is already initialized on-chain, no need to create

      // Transfer merchant amount (99%)
      transaction.add(
        createTransferInstruction(
          userAta,
          merchantAta,
          userPubkey,
          merchantAmountJupiter,
        ),
      );

      // Transfer platform fee (1%)
      if (platformFeeJupiter > BigInt(0)) {
        transaction.add(
          createTransferInstruction(
            userAta,
            treasuryPDAJupiter,
            userPubkey,
            platformFeeJupiter,
          ),
        );
        console.log(
          `[Jupiter] Added fee transfer: ${platformFeeJupiter} to treasury`,
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      if (!walletAdapterSignTransaction) throw new Error("Wallet cannot sign");
      const treasuryBalanceBefore = await getTokenBalanceRaw(
        connection,
        treasuryPDAJupiter,
      );

      const signedTx = await walletAdapterSignTransaction(transaction);
      const connection2 = new Connection(RPC_ENDPOINT, "confirmed");
      const rawTx = signedTx.serialize();
      const sig = await connection2.sendRawTransaction(rawTx);
      await connection2.confirmTransaction(sig, "confirmed");
      await assertTransactionConfirmed(
        connection2,
        sig,
        "Jupiter settlement transaction failed",
      );

      if (platformFeeJupiter > BigInt(0)) {
        const treasuryBalanceAfter = await getTokenBalanceRaw(
          connection2,
          treasuryPDAJupiter,
        );
        const feeCredited = treasuryBalanceAfter - treasuryBalanceBefore;
        if (feeCredited < platformFeeJupiter) {
          throw new Error(
            `Jupiter fee transfer missing: expected >= ${platformFeeJupiter}, got ${feeCredited}`,
          );
        }
      }

      const transferSignature = sig;
      console.log(`[Jupiter] Transfer complete: ${transferSignature}`);

      setTxSignature(transferSignature);

      // Complete checkout session if applicable
      if (sessionId) {
        try {
          const completeResponse = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              signature: transferSignature,
              customerWallet: activeWallet.address,
            }),
          });

          if (completeResponse.ok && successUrl) {
            window.location.href = successUrl;
            return;
          }
        } catch (completeErr) {
          console.error("Error completing checkout:", completeErr);
        }
      } else {
        // No session - record payment for redirect-based checkouts
        try {
          await fetch("/api/payments/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signature: transferSignature,
              merchantWallet,
              customerWallet: activeWallet.address,
              amount,
              memo,
            }),
          });
          console.log("[Jupiter] Payment recorded for redirect flow");
        } catch (recordErr) {
          console.error("[Jupiter] Error recording payment:", recordErr);
        }
      }

      // Issue private receipt for Jupiter swap payment
      const paymentId = transferSignature || `payment_${Date.now()}`;
      issuePrivateReceipt(
        paymentId,
        amount,
        activeWallet.address,
        merchantWallet,
      );

      setPaidFromWallet(activeWallet.address);
      setStep("success");
      sendToParent("offbank:success", {
        signature: transferSignature,
        swapSignature,
        amount,
        merchantWallet,
        memo,
        paymentToken: selectedToken.symbol,
        swapType: "jupiter",
        privacy: privacyEnabled,
      });
    } catch (err: unknown) {
      console.error("[Jupiter] Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      setStep("error");
      sendToParent("offbank:error", { message: errorMessage });
    }
  };

  // Process payment (standard - user pays gas)
  const processPayment = async () => {
    // Privacy mode is now an additive layer applied AFTER the on-chain
    // transfer (see issuePrivateReceipt) - no separate code path. The
    // USDC transfer is identical; only the receipt metadata is encrypted
    // and stored off-chain so observers / DB readers cannot see line
    // items, customer email, or memo.

    // If Jupiter swap is needed (non-USDC token on Solana)
    if (needsJupiterSwap) {
      return processJupiterPayment();
    }

    // Gasless payment handling
    if (useGasless) {
      // External wallets use Kora
      if (isExternalWallet && gaslessAvailable) {
        return processGaslessPayment();
      }
    }

    if (!activeWallet?.address || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    setStep("processing");
    setError("");

    try {
      // Step 0: Check merchant wallet safety with Range Security
      console.log("[Payment] Checking merchant wallet safety...");
      const riskCheck = await fetch(
        `/api/risk-check?address=${merchantWallet}`,
      );
      const riskData = await riskCheck.json();

      if (riskData.blocked) {
        console.error("[Payment] Merchant wallet blocked:", riskData.riskLevel);
        throw new Error(
          `Payment blocked: Merchant wallet flagged as ${riskData.riskLevel}. ${riskData.reasoning}`,
        );
      }

      if (riskData.warning) {
        console.warn("[Payment] Merchant wallet warning:", riskData.riskLevel);
      }

      console.log(
        "[Payment] Merchant wallet safe, risk score:",
        riskData.riskScore,
      );

      const connection = new Connection(RPC_ENDPOINT, "confirmed");

      // Platform fee configuration
      const PLATFORM_FEE_BPS = BigInt(100); // 1% = 100 basis points
      const PROGRAM_ID = new PublicKey(
        "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5",
      );
      // Use the on-chain program's treasury PDA (already initialized as token account)
      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID,
      );

      // Get the user's ATA
      const userPubkey = new PublicKey(activeWallet.address);
      const merchantPubkey = new PublicKey(merchantWallet);
      const userAta = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
      const merchantAta = await getAssociatedTokenAddress(
        USDC_MINT,
        merchantPubkey,
      );

      // Calculate amount in base units and split for fees
      const totalAmount = BigInt(
        Math.round(amount * Math.pow(10, USDC_DECIMALS)),
      );
      const platformFee = (totalAmount * PLATFORM_FEE_BPS) / BigInt(10000);
      const merchantAmount = totalAmount - platformFee;

      console.log(
        `[Payment] Total: ${totalAmount}, Fee: ${platformFee}, Merchant: ${merchantAmount}`,
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
            USDC_MINT,
          ),
        );
      }

      // Treasury is already initialized on-chain, no need to create

      // Transfer merchant amount (99%)
      transaction.add(
        createTransferInstruction(
          userAta,
          merchantAta,
          userPubkey,
          merchantAmount,
        ),
      );

      // Transfer platform fee (1%) to treasury
      if (platformFee > BigInt(0)) {
        transaction.add(
          createTransferInstruction(
            userAta,
            treasuryPDA,
            userPubkey,
            platformFee,
          ),
        );
        console.log(
          `[Payment] Added fee transfer: ${platformFee} to treasury ${treasuryPDA.toBase58()}`,
        );
      }

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      // Serialize transaction
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      // Sign and send via wallet-adapter
      if (!walletAdapterSignTransaction) throw new Error("Wallet cannot sign");
      const treasuryBalanceBefore = await getTokenBalanceRaw(
        connection,
        treasuryPDA,
      );

      const signedTx = await walletAdapterSignTransaction(transaction);
      const connForSend = new Connection(RPC_ENDPOINT, "confirmed");
      const rawTx = signedTx.serialize();
      const txSig = await connForSend.sendRawTransaction(rawTx);
      await connForSend.confirmTransaction(txSig, "confirmed");
      await assertTransactionConfirmed(
        connForSend,
        txSig,
        "Settlement transaction failed",
      );

      if (platformFee > BigInt(0)) {
        const treasuryBalanceAfter = await getTokenBalanceRaw(
          connForSend,
          treasuryPDA,
        );
        const feeCredited = treasuryBalanceAfter - treasuryBalanceBefore;
        if (feeCredited < platformFee) {
          throw new Error(
            `Fee transfer missing: expected >= ${platformFee}, got ${feeCredited}`,
          );
        }
      }

      console.log("Transaction result:", txSig);
      const signatureBase58 = txSig;
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
              await completeResponse.text(),
            );
          }
        } catch (completeErr) {
          console.error("Error completing checkout:", completeErr);
        }
      } else {
        // No session - record payment for redirect-based checkouts
        try {
          await fetch("/api/payments/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signature: signatureBase58,
              merchantWallet,
              customerWallet: activeWallet.address,
              amount,
              memo,
            }),
          });
          console.log("[Checkout] Payment recorded for redirect flow");
        } catch (recordErr) {
          console.error("Error recording payment:", recordErr);
        }
      }

      // Issue private receipt for standard payment
      const paymentId = signatureBase58 || `payment_${Date.now()}`;
      issuePrivateReceipt(
        paymentId,
        amount,
        activeWallet.address,
        merchantWallet,
      );

      setPaidFromWallet(activeWallet.address);
      setStep("success");

      // Notify parent window if embedded
      sendToParent("offbank:success", {
        signature: signatureBase58,
        amount,
        merchantWallet,
        memo,
        privacy: privacyEnabled,
      });
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      setStep("error");

      // Notify parent window if embedded
      sendToParent("offbank:error", { message: errorMessage });
    }
  };

  // Loading step
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#34c759] animate-spin mx-auto mb-4" />
          <p className="text-[#8a8a8a]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Auth step - login with email/social
  if (step === "auth") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 pb-safe">
        {/* Close/Back button */}
        <button
          onClick={() => {
            if (isEmbed || isWidget) {
              sendToParent("offbank:cancel", {});
            } else if (cancelUrl) {
              window.location.href = cancelUrl;
            } else {
              router.push("/");
            }
          }}
          className="fixed top-4 right-4 p-2 bg-[#f2f2f2] hover:bg-[#f2f2f2] rounded-full transition-colors z-50 sm:top-6 sm:right-6"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#8a8a8a]" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-2 sm:px-0"
        >
          <div className="bg-[#FFFFFF]/80 backdrop-blur-xl rounded-3xl border border-[#d3d3d3] p-4 sm:p-6 mb-6">
            <div className="text-center mb-6">
              {/* Privacy indicator badge */}
              {isPrivatePayment && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-[#8e24aa]/20 rounded-full mb-3">
                  <Lock className="w-3 h-3 text-[#34c759]" />
                  <span className="text-[#34c759] text-xs font-medium">
                    Private Payment
                  </span>
                </div>
              )}

              <p className="text-[#8a8a8a] text-sm mb-1">Pay {merchantName}</p>
              <p className="text-3xl sm:text-4xl font-bold text-[#212121]">
                ${amount.toFixed(2)}
                <span className="text-base sm:text-lg text-[#8a8a8a] ml-2">
                  USDC
                </span>
              </p>
              {memo && <p className="text-[#8a8a8a] text-sm mt-2">{memo}</p>}

              {/* Privacy explanation */}
              {isPrivatePayment && (
                <p className="text-[#34c759]/70 text-xs mt-2">
                  Amount encrypted on-chain • Only you & merchant can see
                </p>
              )}
            </div>

            <div className="border-t border-[#d3d3d3] pt-6">
              <p className="text-center text-[#5c5c5c] mb-4">
                Choose how to pay
              </p>

              {!ready ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#34c759] animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pay with email - primary CTA for buyers without a wallet */}
                  {privyEnabled && (
                    <button
                      onClick={() => privy.login()}
                      className="w-full py-4 bg-[#34c759] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-[#2ba048] transition-colors"
                    >
                      Pay with email - no wallet needed
                    </button>
                  )}

                  {/* Connect existing wallet */}
                  <button
                    onClick={() => openWalletModal(true)}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-opacity ${
                      privyEnabled
                        ? "bg-white text-[#212121] font-semibold border border-[#d3d3d3] hover:bg-[#f2f2f2]"
                        : "bg-white text-[#212121] font-semibold hover:opacity-90"
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    {privyEnabled
                      ? "Connect existing wallet"
                      : "Connect Wallet (Phantom/Solflare)"}
                  </button>

                  {/* Pay with card - fiat on-ramp for non-crypto users */}
                  {
                    <>
                      <div className="flex items-center gap-3 text-[#8a8a8a] text-xs">
                        <div className="flex-1 h-px bg-[#d3d3d3]" />
                        <span>or pay without crypto</span>
                        <div className="flex-1 h-px bg-[#d3d3d3]" />
                      </div>

                      {/* Card option - amounts up to $5K */}
                      {amount <= 5000 && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              apiKey:
                                process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "",
                              currencyCode: "usdc_sol",
                              baseCurrencyCode: "usd",
                              baseCurrencyAmount: amount.toString(),
                              colorCode: "#34c759",
                              language: "en",
                              redirectURL: window.location.href,
                              showWalletAddressForm: "true",
                            });
                            window.open(
                              `https://buy.moonpay.com?${params.toString()}`,
                              "moonpay-onramp",
                              "width=500,height=700,toolbar=no,menubar=no,scrollbars=yes",
                            );
                          }}
                          className="w-full py-4 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-[#d3d3d3]/50 transition-colors border border-[#d3d3d3]"
                        >
                          <CreditCard className="w-5 h-5" />
                          Pay with Card (~5 min)
                        </button>
                      )}

                      {/* Bank transfer - amounts $100-$100K */}
                      {amount >= 100 && amount <= 100000 && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              amount: amount.toString(),
                              currency: "usdc",
                              network: "solana",
                            });
                            window.open(
                              `https://spherepay.co/buy?${params.toString()}`,
                              "sphere-onramp",
                              "width=600,height=750,toolbar=no,menubar=no,scrollbars=yes",
                            );
                          }}
                          className="w-full py-4 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-[#d3d3d3]/50 transition-colors border border-[#d3d3d3]"
                        >
                          <Building2 className="w-5 h-5" />
                          Bank Transfer / ACH
                          {amount > 5000 ? " (Recommended)" : ""}
                        </button>
                      )}

                      {/* OTC - amounts $25K+ */}
                      {amount >= 25000 && (
                        <button
                          onClick={() => {
                            setStep("otc-quote");
                          }}
                          className="w-full py-4 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-[#d3d3d3]/50 transition-colors border border-[#d3d3d3]"
                        >
                          <Landmark className="w-5 h-5" />
                          OTC Desk - Large Transfer
                          {amount >= 100000 ? " (Recommended)" : ""}
                        </button>
                      )}

                      {amount > 5000 && (
                        <p className="text-center text-[#8a8a8a] text-xs">
                          Card payments limited to $5,000.{" "}
                          {amount > 100000
                            ? "Use OTC desk for best rates on large transfers."
                            : "Bank transfer recommended for this amount."}
                        </p>
                      )}
                    </>
                  }
                </div>
              )}

              <p className="text-center text-[#8a8a8a] text-xs mt-4">
                {IS_DEVNET
                  ? "Use Phantom, Solflare, or any Solana wallet"
                  : "Connect an existing wallet or buy USDC instantly with a debit card"}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-[#8a8a8a] text-xs">
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

          <p className="text-center text-[#8a8a8a] text-xs mt-6">
            Powered by{" "}
            <Link href="/" className="text-[#34c759] hover:text-[#34c759]">
              Offbank
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // Wallet creation step
  if (step === "wallet") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 relative">
        <BuyerTourModal />
        {/* Close/Back button */}
        <button
          onClick={() => {
            disconnect();
            setStep("auth");
          }}
          className="absolute top-4 right-4 p-2 bg-[#f2f2f2] hover:bg-[#f2f2f2] rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#8a8a8a]" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#FFFFFF]/80 backdrop-blur-xl rounded-3xl border border-[#d3d3d3] p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-[#212121]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212121] mb-2">
                Create Your Wallet
              </h2>
              <p className="text-[#8a8a8a]">
                We&apos;ll create a secure wallet for you automatically
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#e74c3c]/10 border border-[#e74c3c]/30 rounded-xl mb-4">
                <p className="text-[#e74c3c] text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreateWallet}
              disabled={creatingWallet}
              className="w-full py-4 bg-white text-[#212121] font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
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

  // KYC verification step
  if (step === "kyc") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 relative">
        {/* Close/Back button */}
        <button
          onClick={() => {
            if (isEmbed || isWidget) {
              sendToParent("offbank:cancel", {});
            } else if (cancelUrl) {
              window.location.href = cancelUrl;
            } else {
              router.push("/");
            }
          }}
          className="absolute top-4 right-4 p-2 bg-[#f2f2f2] hover:bg-[#f2f2f2] rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#8a8a8a]" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#FFFFFF]/80 backdrop-blur-xl rounded-3xl border border-[#d3d3d3] p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#212121]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212121] mb-2">
                Identity Verification
              </h2>
              <p className="text-[#8a8a8a]">
                {merchantName} requires identity verification before payment
              </p>
            </div>

            {/* Payment preview */}
            <div className="p-4 bg-[#f2f2f2] rounded-xl mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a8a]">Amount</span>
                <span className="text-[#212121] font-semibold">
                  ${amount.toFixed(2)} USDC
                </span>
              </div>
            </div>

            {/* KYC Status */}
            {customerKycStatus === "pending" && (
              <div className="p-4 bg-[#d29500]/10 border border-[#d29500]/30 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#d29500] animate-spin" />
                  <div>
                    <p className="text-[#d29500] font-medium">
                      Verification in Progress
                    </p>
                    <p className="text-[#d29500]/70 text-sm">
                      Your verification is being reviewed. This usually takes a
                      few minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {customerKycStatus === "rejected" && (
              <div className="p-4 bg-[#e74c3c]/10 border border-[#e74c3c]/30 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#e74c3c]" />
                  <div>
                    <p className="text-[#e74c3c] font-medium">
                      Verification Failed
                    </p>
                    <p className="text-[#e74c3c]/70 text-sm">
                      Please try again with valid documents.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Start Verification Button */}
            {(customerKycStatus === "unknown" ||
              customerKycStatus === "rejected") && (
              <button
                onClick={async () => {
                  // Open Sumsub verification in a new window/modal
                  try {
                    const response = await fetch("/api/kyc/token", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        customerId: activeWallet?.address,
                        merchantId: merchantWallet,
                        levelName: merchantKycLevel,
                      }),
                    });

                    if (response.ok) {
                      const { token, applicantId } = await response.json();
                      // Store for later reference
                      console.log("[KYC] Token generated:", { applicantId });

                      // For now, show a message that Sumsub WebSDK would launch here
                      // In production, you'd initialize the Sumsub WebSDK
                      alert(
                        "Sumsub verification would launch here. Configure SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY to enable.",
                      );
                    } else {
                      const errorData = await response.json();
                      alert(errorData.error || "Failed to start verification");
                    }
                  } catch (err) {
                    console.error("[KYC] Error starting verification:", err);
                    alert("Failed to start verification. Please try again.");
                  }
                }}
                className="w-full py-4 bg-white text-[#212121] font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
              >
                <Shield className="w-5 h-5" />
                {customerKycStatus === "rejected"
                  ? "Retry Verification"
                  : "Start Verification"}
              </button>
            )}

            {/* Refresh status button for pending */}
            {customerKycStatus === "pending" && (
              <button
                onClick={async () => {
                  setCheckingKyc(true);
                  try {
                    const response = await fetch(
                      `/api/kyc/status?customerId=${activeWallet?.address}&merchantId=${merchantWallet}`,
                    );
                    if (response.ok) {
                      const data = await response.json();
                      setCustomerKycStatus(data.status || "unknown");
                      if (data.status === "verified") {
                        setStep("confirm");
                      }
                    }
                  } catch (err) {
                    console.error("[KYC] Error checking status:", err);
                  } finally {
                    setCheckingKyc(false);
                  }
                }}
                disabled={checkingKyc}
                className="w-full py-4 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-[#f2f2f2] transition-colors disabled:opacity-50"
              >
                {checkingKyc ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Check Verification Status
                  </>
                )}
              </button>
            )}

            <p className="text-center text-[#8a8a8a] text-xs mt-4">
              Your data is securely processed by Sumsub. We never store your
              documents.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Confirm step
  if (step === "confirm") {
    const currentBalance = balance;
    const hasEnoughBalance =
      currentBalance !== null && currentBalance >= amount;
    const hasCorrectWallet = !!activeWallet;

    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 pb-safe relative overflow-y-auto">
        {/* Close/Back button */}
        <button
          onClick={() => {
            if (isEmbed || isWidget) {
              sendToParent("offbank:cancel", {});
            } else if (cancelUrl) {
              window.location.href = cancelUrl;
            } else {
              router.push("/");
            }
          }}
          className="absolute top-4 right-4 p-2 bg-[#f2f2f2] hover:bg-[#f2f2f2] rounded-full transition-colors z-10 sm:top-6 sm:right-6"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#8a8a8a]" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-2 sm:px-0 my-4"
        >
          <div className="bg-[#FFFFFF]/80 backdrop-blur-xl rounded-3xl border border-[#d3d3d3] p-4 sm:p-6">
            {/* User info */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 bg-[#f2f2f2] rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#34c759] flex items-center justify-center">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#212121]" />
                </div>
                <div>
                  <p className="text-[#212121] text-sm font-medium">
                    {activeWallet?.address
                      ? `${activeWallet.address.slice(
                          0,
                          4,
                        )}…${activeWallet.address.slice(-4)}`
                      : "Wallet"}
                  </p>
                  <p className="text-[#8a8a8a] text-xs">Connected</p>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="text-[#8a8a8a] text-xs hover:text-[#5c5c5c]"
              >
                Disconnect
              </button>
            </div>

            {/* Wallet info */}
            {activeWallet && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-[#f2f2f2] rounded-xl">
                <Wallet className="w-5 h-5 text-[#34c759]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#8a8a8a] text-xs">
                    {isExternalWallet ? "Connected Wallet" : "Your Wallet"}
                  </p>
                  <p className="text-[#212121] text-sm font-mono truncate">
                    {activeWallet.address?.slice(0, 8)}...
                    {activeWallet.address?.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#8a8a8a] text-xs">Balance</p>
                  {loadingBalance ? (
                    <Loader2 className="w-4 h-4 text-[#34c759] animate-spin" />
                  ) : (
                    <p
                      className={`text-sm font-medium ${
                        hasEnoughBalance ? "text-[#34c759]" : "text-[#e74c3c]"
                      }`}
                    >
                      ${balance?.toFixed(2) || "0.00"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Token Selector (pay with SOL, BONK, etc.) */}
            {!IS_DEVNET && (
              <div className="mb-4">
                <p className="text-[#8a8a8a] text-xs mb-2">Pay with</p>
                <TokenSelector
                  selectedToken={selectedToken}
                  availableTokens={availableTokens}
                  onSelectToken={selectJupiterToken}
                  balance={jupiterTokenBalance}
                  requiredAmount={
                    needsJupiterSwap ? jupiterInputAmount : undefined
                  }
                  isLoadingQuote={jupiterStatus === "loading-quote"}
                  showBalance={true}
                />
                {needsJupiterSwap && jupiterQuote && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-[#d29500]/30 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8a8a8a]">You pay</span>
                      <span className="text-[#212121] font-medium">
                        {jupiterInputAmount} {selectedToken.symbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-[#8a8a8a]">You get</span>
                      <span className="text-[#34c759] font-medium">
                        ${amount.toFixed(2)} USDC
                      </span>
                    </div>
                    {parseFloat(jupiterPriceImpact) > 1 && (
                      <p className="text-[#d29500] text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Price impact: {jupiterPriceImpact}%
                      </p>
                    )}
                    <p className="text-[#8a8a8a] text-xs mt-2 text-center">
                      Swap powered by Jupiter
                    </p>
                  </div>
                )}
                {jupiterError && (
                  <p className="text-[#e74c3c] text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {jupiterError}
                  </p>
                )}
              </div>
            )}

            {/* Payment details */}
            <div className="bg-[#f2f2f2] rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#8a8a8a]">To</span>
                <span className="text-[#212121]">{merchantName}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#8a8a8a]">Amount</span>
                <span className="text-[#212121] font-bold">
                  ${amount.toFixed(2)} USDC
                </span>
              </div>
              {memo && (
                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a8a]">For</span>
                  <span className="text-[#212121] text-sm">{memo}</span>
                </div>
              )}
            </div>

            {/* Mayan Cross-chain Info (for EVM chains) */}

            {/* Gasless Toggle (Solana only, uses Kora) */}
            {!checkingGasless && gaslessAvailable && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-[#34c759]/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#34c759]/20 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-[#34c759]" />
                    </div>
                    <div>
                      <p className="text-[#212121] font-medium">
                        Gasless Payment
                      </p>
                      <p className="text-[#8a8a8a] text-xs">
                        No SOL needed for gas fees
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseGasless(!useGasless)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      useGasless ? "bg-[#34c759]" : "bg-white/20"
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
                  <p className="text-[#34c759] text-xs mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Gas fees covered by Offbank
                  </p>
                )}
              </div>
            )}

            {/* Privacy Toggle (Always visible on Solana) */}
            <div className="bg-[#34c759]/[0.06] border border-[#8e24aa]/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#34c759]/15 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#34c759]" />
                  </div>
                  <div>
                    <p className="text-[#212121] font-medium">
                      Private Receipt
                      {isPrivacyForced && (
                        <span className="ml-2 text-xs text-[#34c759] font-normal">
                          (Required)
                        </span>
                      )}
                    </p>
                    <p className="text-[#8a8a8a] text-xs">
                      Receipt private via MagicBlock PER
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    !isPrivacyForced && setPrivacyEnabled(!privacyEnabled)
                  }
                  disabled={isPrivacyForced}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    privacyEnabled || isPrivacyForced
                      ? "bg-[#34c759]"
                      : "bg-white/20"
                  } ${isPrivacyForced ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      privacyEnabled || isPrivacyForced
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {(privacyEnabled || isPrivacyForced) && (
                <p className="text-[#34c759] text-xs mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Payment details encrypted • Only you & merchant can see
                  receipt
                </p>
              )}
            </div>

            {/* Low balance warning with fund options */}
            {!hasEnoughBalance && balance !== null && activeWallet && (
              <div className="p-4 bg-[#d29500]/10 border border-[#d29500]/30 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-[#d29500] mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    You need ${(amount - balance).toFixed(2)} more USDC
                  </p>
                </div>

                {/* Tiered on-ramp options based on needed amount */}
                {(() => {
                  const needed = Math.ceil(amount - balance + 0.5);
                  return (
                    <div className="space-y-2 mb-3">
                      {needed <= 5000 && (
                        <button
                          onClick={() =>
                            openCardOnRamp({
                              walletAddress: activeWallet.address,
                              amount: needed,
                            })
                          }
                          disabled={
                            onRampStatus === "waiting" ||
                            onRampStatus === "opening"
                          }
                          className="w-full py-3 bg-[#34c759] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#2ba048] transition-colors disabled:opacity-60"
                        >
                          {onRampStatus === "waiting" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Complete purchase in MoonPay…
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Buy ${needed} USDC with Card
                            </>
                          )}
                        </button>
                      )}
                      {needed > 5000 && needed <= 100000 && (
                        <button
                          onClick={() =>
                            openBankOnRamp({
                              walletAddress: activeWallet.address,
                              amount: needed,
                            })
                          }
                          disabled={
                            onRampStatus === "waiting" ||
                            onRampStatus === "opening"
                          }
                          className="w-full py-3 bg-[#34c759] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#2ba048] transition-colors disabled:opacity-60"
                        >
                          {onRampStatus === "waiting" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Complete bank transfer…
                            </>
                          ) : (
                            <>
                              <Building2 className="w-4 h-4" />
                              Buy ${needed.toLocaleString()} USDC via Bank
                              Transfer
                            </>
                          )}
                        </button>
                      )}
                      {needed > 100000 && (
                        <button
                          onClick={() => setStep("otc-quote")}
                          className="w-full py-3 bg-[#34c759] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#2ba048] transition-colors"
                        >
                          <Landmark className="w-4 h-4" />
                          Request OTC Quote - ${needed.toLocaleString()} USDC
                        </button>
                      )}
                    </div>
                  );
                })()}
                {onRampError && (
                  <p className="text-[#e74c3c] text-xs mb-2">{onRampError}</p>
                )}

                {/* Devnet: Get test USDC from faucet */}
                {IS_DEVNET && (
                  <>
                    <div className="text-center text-[#8a8a8a] text-xs mb-2">
                      - or for testing -
                    </div>
                    <a
                      href="https://faucet.circle.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#f2f2f2] text-[#5c5c5c] text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#f2f2f2] transition-colors mb-3"
                    >
                      <Plus className="w-4 h-4" />
                      Get Devnet USDC (Circle Faucet)
                    </a>
                  </>
                )}

                {/* Or send from another wallet */}
                <div className="text-center">
                  <p className="text-[#8a8a8a] text-xs mb-2">
                    Or send USDC to:
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeWallet.address);
                      alert("Address copied!");
                    }}
                    className="flex items-center justify-center gap-2 mx-auto px-3 py-1.5 bg-[#f2f2f2] rounded-lg hover:bg-[#f2f2f2] transition-colors"
                  >
                    <span className="text-xs font-mono text-[#5c5c5c]">
                      {activeWallet.address.slice(0, 8)}...
                      {activeWallet.address.slice(-6)}
                    </span>
                    <Copy className="w-3 h-3 text-[#8a8a8a]" />
                  </button>
                  <p className="text-[#8a8a8a] text-xs mt-1">
                    {IS_DEVNET ? "Solana Devnet" : "Solana"}
                  </p>
                </div>
              </div>
            )}

            {/* Low SOL balance warning for gas (when not using Kora gasless) */}
            {!useGasless &&
              isExternalWallet &&
              solBalance !== null &&
              solBalance < 0.001 &&
              hasEnoughBalance &&
              activeWallet && (
                <div className="p-4 bg-[#d29500]/10 border border-[#d29500]/30 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-[#d29500] mb-2">
                    <Fuel className="w-4 h-4" />
                    <p className="text-sm font-medium">Need SOL for gas</p>
                  </div>
                  <p className="text-[#8a8a8a] text-xs mb-3">
                    You need a small amount of SOL (~0.001) to pay for
                    transaction fees.
                  </p>
                  {/* Devnet faucet */}
                  {IS_DEVNET && (
                    <a
                      href="https://faucet.solana.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#f2f2f2] text-[#5c5c5c] text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#f2f2f2] transition-colors"
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
                // Only check SOL balance for gas
                (!useGasless &&
                  isExternalWallet &&
                  solBalance !== null &&
                  solBalance < 0.001)
              }
              className={`w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                hasEnoughBalance &&
                !loadingBalance &&
                hasCorrectWallet &&
                (useGasless || (solBalance !== null && solBalance >= 0.001))
                  ? useGasless && gaslessAvailable
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90"
                    : "bg-white text-[#212121] hover:opacity-90"
                  : "bg-[#f2f2f2] text-[#8a8a8a] cursor-not-allowed"
              }`}
            >
              {needsJupiterSwap ? (
                <>
                  <Zap className="w-5 h-5" />
                  Pay {jupiterInputAmount} {selectedToken.symbol}
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
              className="w-full mt-3 py-2 text-[#8a8a8a] text-sm hover:text-[#5c5c5c]"
            >
              Refresh Balance
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // OTC quote step - large transfer ($25K+)
  if (step === "otc-quote") {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-[#d3d3d3] p-8">
            <button
              onClick={() => setStep("auth")}
              className="mb-6 text-[#8a8a8a] hover:text-[#212121] transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#34c759]/15 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-[#34c759]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#212121]">
                  OTC Desk - Large Transfer
                </h2>
                <p className="text-[#8a8a8a] text-sm">
                  Best rates for transfers over $25,000
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-[#f2f2f2] rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#8a8a8a]">Amount</span>
                  <span className="text-[#212121] font-semibold">
                    ${amount.toLocaleString()} USDC
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#8a8a8a]">Est. Rate</span>
                  <span className="text-[#212121]">~1:1 (near-peg)</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#8a8a8a]">Fees</span>
                  <span className="text-[#34c759]">~0.1-0.5% (negotiated)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8a8a]">Settlement</span>
                  <span className="text-[#212121]">
                    Same day (wire before 3 PM ET)
                  </span>
                </div>
              </div>

              {!otcQuote ? (
                <>
                  <div>
                    <label className="block text-sm text-[#5c5c5c] mb-1">
                      Email for wire instructions
                    </label>
                    <input
                      type="email"
                      value={otcEmail}
                      onChange={(e) => setOtcEmail(e.target.value)}
                      placeholder="treasury@yourcompany.com"
                      className="w-full px-4 py-3 bg-[#f2f2f2] border border-[#d3d3d3] rounded-xl text-[#212121] placeholder:text-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#34c759]/40"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!otcEmail || !otcEmail.includes("@")) return;
                      try {
                        const res = await fetch("/api/otc-quote", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            walletAddress:
                              activeWallet?.address || "pending-wallet",
                            amount,
                            email: otcEmail,
                          }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setOtcQuote(data);
                        }
                      } catch {
                        // ignore
                      }
                    }}
                    disabled={!otcEmail || !otcEmail.includes("@")}
                    className="w-full py-4 bg-[#34c759] text-white font-semibold rounded-xl hover:bg-[#2ba048] transition-colors disabled:opacity-50"
                  >
                    Request Quote & Wire Instructions
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[#34c759]/[0.06] border border-[#34c759]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[#34c759] mb-2">
                      <Check className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        Quote Received
                      </span>
                    </div>
                    <div className="text-sm text-[#5c5c5c] space-y-1">
                      <p>
                        Total:{" "}
                        <span className="font-semibold text-[#212121]">
                          ${otcQuote.indicativeTotal.toLocaleString()} USD
                        </span>{" "}
                        → {amount.toLocaleString()} USDC
                      </p>
                      <p>Reference: {otcQuote.quoteId}</p>
                      <p>Delivery: {otcQuote.estimatedDelivery}</p>
                    </div>
                  </div>

                  <div className="bg-[#f2f2f2] rounded-xl p-4">
                    <p className="text-sm font-medium text-[#212121] mb-2">
                      Wire Instructions
                    </p>
                    <p className="text-sm text-[#5c5c5c]">
                      {otcQuote.wireInstructions.note}
                    </p>
                    <p className="text-xs text-[#8a8a8a] mt-2">
                      Wire instructions and bank details will be sent to{" "}
                      <strong>{otcEmail}</strong>
                    </p>
                  </div>

                  <div className="bg-[#7086f2]/10 border border-[#7086f2]/20 rounded-xl p-3">
                    <p className="text-xs text-[#7086f2]">
                      Once your wire is received, USDC will be delivered to your
                      wallet automatically. You&apos;ll receive an email
                      confirmation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8a8a8a]">
              <Shield className="w-3 h-3" />
              <span>OTC trades via regulated partners. No card limits.</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Processing step
  if (step === "processing") {
    const statusMessage = "Please wait while we confirm your transaction...";
    const statusTitle = "Processing Payment";

    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-[#212121] animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-[#212121] mb-2">
            {statusTitle}
          </h2>
          <p className="text-[#8a8a8a]">{statusMessage}</p>
        </motion.div>
      </div>
    );
  }

  // Success step
  if (step === "success") {
    const explorerUrl = solscanUrl(txSignature);
    const explorerName = "Solscan";

    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#34c759] flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#212121]" />
          </div>
          <h2 className="text-2xl font-bold text-[#212121] mb-2">
            Payment Successful!
          </h2>
          <p className="text-[#8a8a8a] mb-6">
            You paid ${amount.toFixed(2)} USDC to {merchantName}
          </p>

          {/* Privacy Badge */}
          {(privacyEnabled || isPrivacyForced) && (
            <div className="mb-4 p-4 bg-[#34c759]/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-[#34c759] mb-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  🔒 Private Receipt Issued
                </span>
              </div>
              <p className="text-xs text-[#34c759]/80 mb-2">
                Payment receipt is private via MagicBlock PER
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Only you and {merchantName} can decrypt the payment details
              </p>
              {privateReceiptHandle && (
                <div className="mt-3 px-3 py-2 bg-purple-900/30 rounded-lg inline-block">
                  <p className="text-xs text-[#34c759] font-mono">
                    Encrypted Handle: {privateReceiptHandle}
                  </p>
                </div>
              )}
              {issuingPrivateReceipt && (
                <div className="flex items-center justify-center gap-2 text-[#34c759]/60 mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Encrypting receipt...</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {txSignature ? (
              <>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#34c759] text-white font-semibold rounded-xl hover:bg-[#2ba048] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Transaction on {explorerName}
                </a>
                {(privacyEnabled || isPrivacyForced) && (
                  <p className="text-xs text-[#34c759] text-center">
                    ℹ️ USDC transfer visible, but receipt details are encrypted
                  </p>
                )}
              </>
            ) : (
              <p className="text-[#8a8a8a] text-sm">
                Transaction confirmed on Solana
              </p>
            )}
          </div>

          {/* One-Click Payment Opt-in */}
          <div className="space-y-3">
            {successUrl ? (
              <a
                href={successUrl}
                className="block w-full py-3 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl hover:bg-[#f2f2f2] transition-colors text-center"
              >
                Return to Store
              </a>
            ) : (
              <Link
                href="/demo/store"
                className="block w-full py-3 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl hover:bg-[#f2f2f2] transition-colors text-center"
              >
                Browse Plans
              </Link>
            )}
            {!successUrl && (
              <Link
                href="/"
                className="block w-full py-2 text-[#8a8a8a] hover:text-[#212121] transition-colors text-sm text-center"
              >
                Back to Home
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Error step
  if (step === "error") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#e74c3c] flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[#212121]" />
          </div>
          <h2 className="text-2xl font-bold text-[#212121] mb-2">
            Payment Failed
          </h2>
          <p className="text-[#8a8a8a] mb-2">Something went wrong</p>
          {error && (
            <p className="text-[#e74c3c] text-sm mb-6 p-3 bg-[#e74c3c]/10 rounded-xl">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setStep("confirm")}
              className="block w-full py-3 bg-white text-[#212121] font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full py-3 bg-[#f2f2f2] text-[#212121] font-semibold rounded-xl hover:bg-[#f2f2f2] transition-colors"
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
