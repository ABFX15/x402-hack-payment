"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  HelpCircle,
  Info,
  Lock,
  Send,
  Shield,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PayoutInfo {
  id: string;
  amount: number;
  currency: string;
  memo?: string;
  status: string;
  email?: string;
  expiresAt: string;
  createdAt: string;
  claimedAt?: string;
  recipientWallet?: string;
  txSignature?: string;
  senderName?: string;
}

type ClaimStep =
  | "loading"
  | "ready"
  | "claiming"
  | "success"
  | "error"
  | "expired"
  | "already-claimed";

// ---------------------------------------------------------------------------
// Off-ramp data by region (geo-localized)
// ---------------------------------------------------------------------------

interface OffRampOption {
  name: string;
  type: "e-wallet" | "bank" | "mobile-money";
  speed: "Instant" | "Minutes" | "1-2 business days";
  description: string;
}

interface RegionOffRamps {
  country: string;
  currencyCode: string;
  currencySymbol: string;
  rate: number;
  options: OffRampOption[];
}

const OFFRAMP_DATA: Record<string, RegionOffRamps> = {
  PH: {
    country: "Philippines",
    currencyCode: "PHP",
    currencySymbol: "₱",
    rate: 57.0,
    options: [
      {
        name: "GCash",
        type: "e-wallet",
        speed: "Instant",
        description: "Send direct to your GCash account",
      },
      {
        name: "Maya",
        type: "e-wallet",
        speed: "Instant",
        description: "Withdraw to your Maya wallet",
      },
      {
        name: "Local Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "BDO, BPI, Metrobank, UnionBank, etc.",
      },
    ],
  },
  BR: {
    country: "Brazil",
    currencyCode: "BRL",
    currencySymbol: "R$",
    rate: 5.1,
    options: [
      {
        name: "Pix",
        type: "e-wallet",
        speed: "Instant",
        description: "Receive via Pix key - CPF, phone, or email",
      },
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "Bradesco, Itaú, Nubank, etc.",
      },
    ],
  },
  KE: {
    country: "Kenya",
    currencyCode: "KES",
    currencySymbol: "KSh",
    rate: 153.0,
    options: [
      {
        name: "M-Pesa",
        type: "mobile-money",
        speed: "Instant",
        description: "Send to your Safaricom M-Pesa",
      },
      {
        name: "Airtel Money",
        type: "mobile-money",
        speed: "Minutes",
        description: "Withdraw to Airtel Money",
      },
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "KCB, Equity Bank, Co-op, etc.",
      },
    ],
  },
  IN: {
    country: "India",
    currencyCode: "INR",
    currencySymbol: "₹",
    rate: 83.5,
    options: [
      {
        name: "UPI",
        type: "e-wallet",
        speed: "Instant",
        description: "Send to any UPI ID - Google Pay, PhonePe, Paytm",
      },
      {
        name: "IMPS / NEFT",
        type: "bank",
        speed: "Minutes",
        description: "Any Indian bank account",
      },
    ],
  },
  NG: {
    country: "Nigeria",
    currencyCode: "NGN",
    currencySymbol: "₦",
    rate: 1600.0,
    options: [
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "Minutes",
        description: "GTBank, Access, Zenith, First Bank, etc.",
      },
      {
        name: "Opay",
        type: "e-wallet",
        speed: "Instant",
        description: "Withdraw to your OPay wallet",
      },
    ],
  },
  MX: {
    country: "Mexico",
    currencyCode: "MXN",
    currencySymbol: "$",
    rate: 17.5,
    options: [
      {
        name: "SPEI",
        type: "bank",
        speed: "Instant",
        description: "Instant transfer to any Mexican bank",
      },
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "BBVA, Banorte, Santander, etc.",
      },
    ],
  },
  AR: {
    country: "Argentina",
    currencyCode: "ARS",
    currencySymbol: "$",
    rate: 950.0,
    options: [
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "Galicia, Santander, Macro, etc.",
      },
      {
        name: "Mercado Pago",
        type: "e-wallet",
        speed: "Minutes",
        description: "Withdraw to your Mercado Pago",
      },
    ],
  },
  US: {
    country: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    rate: 1.0,
    options: [
      {
        name: "ACH Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "Any US checking or savings account",
      },
      {
        name: "Wire Transfer",
        type: "bank",
        speed: "Minutes",
        description: "Same-day wire to your bank",
      },
    ],
  },
  GB: {
    country: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    rate: 0.79,
    options: [
      {
        name: "Faster Payments",
        type: "bank",
        speed: "Instant",
        description: "Arrives within seconds to any UK bank",
      },
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "Barclays, HSBC, Lloyds, etc.",
      },
    ],
  },
  DEFAULT: {
    country: "your country",
    currencyCode: "USD",
    currencySymbol: "$",
    rate: 1.0,
    options: [
      {
        name: "Bank Transfer",
        type: "bank",
        speed: "1-2 business days",
        description: "Transfer to your local bank account",
      },
      {
        name: "Digital Wallet",
        type: "e-wallet",
        speed: "Minutes",
        description: "Send to a supported e-wallet or mobile money",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRegionData(countryCode: string): RegionOffRamps {
  return OFFRAMP_DATA[countryCode] || OFFRAMP_DATA.DEFAULT;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatLocal(amount: number, symbol: string): string {
  return `${symbol}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

function speedColor(speed: string): string {
  if (speed === "Instant")
    return "bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20";
  if (speed === "Minutes")
    return "bg-[#34c759]/10 text-[#7086f2] border-[#34c759]/20";
  return "bg-[#f2f2f2] text-[#8a8a8a] border-[#d3d3d3]";
}

function OptionIcon({ type }: { type: string }) {
  if (type === "e-wallet" || type === "mobile-money") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34c759]/10">
        <Send className="h-5 w-5 text-[#34c759]" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7086f2]/10">
      <Building2 className="h-5 w-5 text-[#34c759]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string>("");
  const [step, setStep] = useState<ClaimStep>("loading");
  const [payout, setPayout] = useState<PayoutInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCashOut, setShowCashOut] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [countryCode, setCountryCode] = useState("DEFAULT");

  // Detect country via timezone heuristic (no external API)
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzMap: Record<string, string> = {
        "Asia/Manila": "PH",
        "America/Sao_Paulo": "BR",
        "Africa/Nairobi": "KE",
        "Asia/Kolkata": "IN",
        "Asia/Calcutta": "IN",
        "Africa/Lagos": "NG",
        "America/Mexico_City": "MX",
        "America/Argentina/Buenos_Aires": "AR",
        "America/New_York": "US",
        "America/Chicago": "US",
        "America/Denver": "US",
        "America/Los_Angeles": "US",
        "Europe/London": "GB",
      };
      setCountryCode(tzMap[tz] || "DEFAULT");
    } catch {
      setCountryCode("DEFAULT");
    }
  }, []);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Fetch payout info
  useEffect(() => {
    if (!token) return;

    async function fetchPayout() {
      try {
        const res = await fetch(`/api/payouts/claim?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error?.toLowerCase().includes("expired")) {
            setStep("expired");
          } else {
            setErrorMessage(data.error || "Payment not found");
            setStep("error");
          }
          return;
        }

        setPayout(data);

        if (data.status === "claimed" || data.claimedAt) {
          setStep("already-claimed");
        } else {
          setStep("ready");
        }
      } catch {
        setErrorMessage("Failed to load payment. Please try again.");
        setStep("error");
      }
    }

    fetchPayout();
  }, [token]);

  // Claim the payout (auto-claim with embedded wallet)
  const claimPayout = useCallback(async () => {
    if (!token) return;

    setStep("claiming");
    try {
      const res = await fetch("/api/payouts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, recipientWallet: "embedded" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong");
        setStep("error");
        return;
      }

      setStep("success");
    } catch {
      setErrorMessage("Connection error. Please try again.");
      setStep("error");
    }
  }, [token]);

  const region = getRegionData(countryCode);
  const senderName = payout?.senderName || "Your employer";
  const localAmount = payout ? payout.amount * region.rate : 0;

  const expiresAt = payout?.expiresAt
    ? new Date(payout.expiresAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a2e] flex flex-col">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#d3d3d3]">
        <button className="inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#212121] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to {senderName}</span>
        </button>
        <button className="inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#212121] transition-colors">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help &amp; FAQ</span>
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {/* ────── Loading ────── */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] p-10 text-center"
              >
                <div className="w-8 h-8 border-2 border-[#7086f2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#8a8a8a] text-sm">Loading your payment…</p>
              </motion.div>
            )}

            {/* ────── Ready - main claim view ────── */}
            {step === "ready" && payout && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Sender branding */}
                <div className="text-center mb-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#34c759] text-white text-xl font-bold mb-3">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm text-[#8a8a8a]">{senderName}</p>
                </div>

                {/* Main card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] overflow-hidden">
                  {/* Status */}
                  <div className="px-6 pt-6 pb-2">
                    <h1 className="text-lg font-semibold text-[#1a1a2e]">
                      Payment Received
                    </h1>
                    <div className="flex items-center gap-1.5 text-[#34c759] text-sm mt-1">
                      <Check className="h-4 w-4" />
                      <span>Settled instantly.</span>
                    </div>
                  </div>

                  {/* Balance box */}
                  <div className="mx-6 my-4 rounded-xl bg-[#f7f7f7] border border-[#d3d3d3] p-5">
                    <p className="text-xs font-medium text-[#8a8a8a] uppercase tracking-wider mb-2">
                      Your Available Balance
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#1a1a2e]">
                        {formatUSD(payout.amount)}
                      </span>
                      <span className="text-sm font-medium text-[#8a8a8a]">
                        USDC
                      </span>
                    </div>

                    {/* Local currency estimate */}
                    {region.rate !== 1 && (
                      <p className="text-sm text-[#8a8a8a] mt-1">
                        Approx.{" "}
                        {formatLocal(localAmount, region.currencySymbol)}{" "}
                        {region.currencyCode}
                      </p>
                    )}

                    {/* USDC explainer */}
                    <div className="relative mt-3">
                      <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#34c759] hover:text-[#7086f2] transition-colors"
                      >
                        <Info className="h-3.5 w-3.5" />
                        USDC is a digital currency pegged 1:1 to the US Dollar
                      </button>
                      <AnimatePresence>
                        {showTooltip && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="absolute left-0 top-full mt-2 z-10 w-full rounded-lg bg-white text-[#212121] p-3 text-xs leading-relaxed shadow-lg"
                          >
                            <p>
                              USDC (USD Coin) is a regulated digital dollar
                              issued by Circle. Each USDC is backed 1:1 by US
                              dollars held in reserve. It won&apos;t lose value
                              like volatile cryptocurrencies.
                            </p>
                            <button
                              onClick={() => setShowTooltip(false)}
                              className="mt-2 text-[#34c759] hover:text-[#7086f2] font-medium"
                            >
                              Got it
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Memo */}
                  {payout.memo && (
                    <div className="mx-6 mb-4 rounded-lg bg-[#7086f2]/10 border border-[#7086f2]/20 px-4 py-3">
                      <p className="text-xs text-[#34c759] font-medium mb-0.5">
                        Note from sender
                      </p>
                      <p className="text-sm text-[#7086f2]">
                        &ldquo;{payout.memo}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="px-6 pb-6 space-y-3">
                    <p className="text-sm font-medium text-[#212121]">
                      What would you like to do?
                    </p>

                    {/* Primary: Cash Out */}
                    <button
                      onClick={() => setShowCashOut(true)}
                      className="w-full flex items-center gap-4 rounded-xl border-2 border-[#7086f2] bg-[#7086f2]/10 p-4 text-left transition-all hover:bg-[#7086f2]/15 hover:shadow-sm group"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#34c759] text-white">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e]">
                          Cash Out to Bank / E-Wallet
                        </p>
                        <p className="text-xs text-[#8a8a8a] mt-0.5">
                          Send directly to your local bank, GCash, M-Pesa, Pix,
                          etc.
                        </p>
                        <p className="text-[11px] text-[#8a8a8a] mt-0.5">
                          Fees may apply via local partners
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#34c759] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {/* Secondary: Keep in USD */}
                    <button
                      onClick={claimPayout}
                      className="w-full flex items-center gap-4 rounded-xl border border-[#d3d3d3] bg-white p-4 text-left transition-all hover:bg-[#f7f7f7] hover:border-[#d3d3d3] group"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#5c5c5c]">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e]">
                          Keep in USD Balance
                        </p>
                        <p className="text-xs text-[#8a8a8a] mt-0.5">
                          Hold these funds securely here to protect against
                          inflation
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#8a8a8a] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {/* Tertiary: Advanced */}
                    <div className="text-center pt-2">
                      <button className="text-xs text-[#8a8a8a] hover:text-[#5c5c5c] transition-colors underline underline-offset-2">
                        Advanced: Send to an external crypto address
                      </button>
                    </div>
                  </div>

                  {/* Expiry */}
                  {expiresAt && (
                    <div className="px-6 pb-4">
                      <p className="text-center text-[11px] text-[#8a8a8a]">
                        This payment link expires {expiresAt}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ────── Claiming ────── */}
            {step === "claiming" && (
              <motion.div
                key="claiming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] p-10 text-center"
              >
                <div className="w-10 h-10 border-2 border-[#7086f2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#1a1a2e] font-medium mb-1">
                  Processing your payment…
                </p>
                <p className="text-[#8a8a8a] text-sm">
                  This will only take a moment.
                </p>
              </motion.div>
            )}

            {/* ────── Success ────── */}
            {step === "success" && payout && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#34c759]/10 border border-[#34c759]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check className="h-8 w-8 text-[#34c759]" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
                  Payment claimed!
                </h2>
                <p className="text-[#8a8a8a] text-sm mb-6">
                  {formatUSD(payout.amount)} is now in your balance. You can
                  cash out anytime.
                </p>
                <button
                  onClick={() => setShowCashOut(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#34c759]"
                >
                  <Building2 className="h-4 w-4" />
                  Cash Out Now
                </button>
              </motion.div>
            )}

            {/* ────── Already claimed ────── */}
            {step === "already-claimed" && payout && (
              <motion.div
                key="already-claimed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#7086f2]/10 border border-[#7086f2]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check className="h-8 w-8 text-[#34c759]" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
                  Already Claimed
                </h2>
                <p className="text-[#8a8a8a] text-sm">
                  This payment of {formatUSD(payout.amount)} has already been
                  claimed
                  {payout.claimedAt &&
                    ` on ${new Date(payout.claimedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}`}
                  .
                </p>
              </motion.div>
            )}

            {/* ────── Expired ────── */}
            {step === "expired" && (
              <motion.div
                key="expired"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#d29500]/10 border border-[#d29500]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg
                    className="w-8 h-8 text-[#d29500]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
                  Payment Expired
                </h2>
                <p className="text-[#8a8a8a] text-sm">
                  This payment link has expired. Please contact{" "}
                  {payout?.senderName || "the sender"} to request a new one.
                </p>
              </motion.div>
            )}

            {/* ────── Error ────── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#d3d3d3] p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#e74c3c]/10 border border-[#e74c3c]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <X className="h-8 w-8 text-[#e74c3c]" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
                  Something went wrong
                </h2>
                <p className="text-[#8a8a8a] text-sm mb-4">{errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#34c759] hover:text-[#7086f2] text-sm font-semibold transition"
                >
                  Try again →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-4 border-t border-[#d3d3d3] bg-white">
        <p className="text-xs text-[#8a8a8a] flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Powered by{" "}
          <a
            href="https://offbankpay.com"
            className="font-medium text-[#8a8a8a] hover:text-[#212121] transition-colors"
          >
            Offbank
          </a>
          .&nbsp;Secure, non-custodial infrastructure.
        </p>
      </footer>

      {/* ══════════════════════════════════════════
          CASH OUT MODAL
         ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showCashOut && payout && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCashOut(false)}
              className="fixed inset-0 z-40 bg-[#FFFFFF]/40 backdrop-blur-sm"
            />

            {/* Modal - bottom sheet on mobile, centered on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md"
            >
              <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-[#d3d3d3] max-h-[85vh] overflow-y-auto">
                {/* Modal header */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 border-b border-[#d3d3d3] rounded-t-2xl">
                  <div>
                    <h2 className="text-base font-semibold text-[#1a1a2e]">
                      Cash Out Options
                      {region.country !== "your country" && (
                        <span className="text-[#8a8a8a] font-normal">
                          {" "}
                          ({region.country})
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-[#8a8a8a] mt-0.5">
                      How do you want to receive your{" "}
                      {region.rate !== 1
                        ? `~${formatLocal(
                            localAmount,
                            region.currencySymbol,
                          )} ${region.currencyCode}`
                        : formatUSD(payout.amount)}
                      ?
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCashOut(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-[#8a8a8a] hover:bg-[#f2f2f2] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Options list */}
                <div className="p-4 space-y-3">
                  {region.options.map((opt) => (
                    <button
                      key={opt.name}
                      className="w-full flex items-center gap-4 rounded-xl border border-[#d3d3d3] bg-white p-4 text-left transition-all hover:bg-[#f7f7f7] hover:border-[#d3d3d3] hover:shadow-sm group"
                    >
                      <OptionIcon type={opt.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-[#1a1a2e]">
                            {opt.name}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${speedColor(
                              opt.speed,
                            )}`}
                          >
                            {opt.speed}
                          </span>
                        </div>
                        <p className="text-xs text-[#8a8a8a] leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#8a8a8a] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>

                {/* Modal footer */}
                <div className="px-5 py-4 border-t border-[#d3d3d3] bg-[#f7f7f7]/50">
                  <p className="text-[11px] text-[#8a8a8a] text-center leading-relaxed">
                    Cash-out is provided by regulated local partners. Exchange
                    rates and fees vary. Offbank does not hold your funds at any
                    point during this process.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
