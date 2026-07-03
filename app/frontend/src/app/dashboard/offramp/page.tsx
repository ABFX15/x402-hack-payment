"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ChevronRight,
  ArrowDownToLine,
  Building2,
  Smartphone,
  Globe,
  Wallet,
  DollarSign,
  Clock,
  Check,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Zap,
  Shield,
  ArrowRight,
  Banknote,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OffRampOption {
  name: string;
  type: "bank" | "e-wallet" | "mobile-money";
  speed: string;
  description: string;
}

interface RegionOffRamps {
  country: string;
  currencyCode: string;
  currencySymbol: string;
  rate: number;
  options: OffRampOption[];
}

interface OfframpRequest {
  id: string;
  method: string;
  amount: number;
  localAmount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  accountInfo: string;
}

// ---------------------------------------------------------------------------
// Off-ramp region data
// ---------------------------------------------------------------------------

const OFFRAMP_DATA: Record<string, RegionOffRamps> = {
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
        speed: "Same day",
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
  EU: {
    country: "Europe (SEPA)",
    currencyCode: "EUR",
    currencySymbol: "€",
    rate: 0.92,
    options: [
      {
        name: "SEPA Transfer",
        type: "bank",
        speed: "1 business day",
        description: "Any EU/EEA bank account via IBAN",
      },
      {
        name: "SEPA Instant",
        type: "bank",
        speed: "Seconds",
        description: "Instant transfer to supported banks",
      },
    ],
  },
};

const REGION_LIST = Object.entries(OFFRAMP_DATA).map(([code, data]) => ({
  code,
  label: data.country,
  currency: data.currencyCode,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function getMethodIcon(type: string) {
  switch (type) {
    case "bank":
      return Building2;
    case "e-wallet":
      return Smartphone;
    case "mobile-money":
      return Smartphone;
    default:
      return Globe;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "completed":
      return "text-[#34c759] bg-[#34c759]/10";
    case "processing":
      return "text-[#d29500] bg-[#d29500]/10";
    case "pending":
      return "text-[#8a8a8a] bg-[#f2f2f2]";
    case "failed":
      return "text-[#e74c3c] bg-[#e74c3c]/10";
    default:
      return "text-[#8a8a8a] bg-[#f2f2f2]";
  }
}

const fadeInProps = {
  initial: { opacity: 0, y: 10 } as const,
  animate: { opacity: 1, y: 0 } as const,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OfframpPage() {
  const { publicKey, connected } = useActiveWallet();

  // State
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [selectedMethod, setSelectedMethod] = useState<OffRampOption | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [accountInfo, setAccountInfo] = useState("");
  const [regionOpen, setRegionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [requests, setRequests] = useState<OfframpRequest[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const region = OFFRAMP_DATA[selectedRegion];
  const localAmount = parseFloat(amount || "0") * region.rate;

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/treasury/balance?wallet=${publicKey}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance?.available || 0);
      }
    } catch {
      // Silent
    }
  }, [publicKey]);

  // Fetch offramp history
  const fetchHistory = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/offramp?wallet=${publicKey}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // Silent
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
      fetchHistory();
    }
  }, [publicKey, fetchBalance, fetchHistory]);

  // Auto-select first method when region changes
  useEffect(() => {
    if (region?.options?.length) {
      setSelectedMethod(region.options[0]);
    }
  }, [selectedRegion]);

  const handleSubmit = async () => {
    if (!publicKey || !selectedMethod || !amount || !accountInfo) return;
    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > balance) {
      setError(numAmount > balance ? "Insufficient balance" : "Invalid amount");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/offramp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey,
          amount: numAmount,
          method: selectedMethod.name,
          region: selectedRegion,
          currency: region.currencyCode,
          localAmount,
          accountInfo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit offramp request");
      }

      const data = await res.json();
      setSuccess(
        `Off-ramp request submitted! ${formatUSD(numAmount)} → ${formatLocal(
          localAmount,
          region.currencySymbol,
        )} via ${selectedMethod.name}`,
      );
      setAmount("");
      setAccountInfo("");
      setStep(1);
      // Add to local state immediately
      if (data.request) {
        setRequests((prev) => [data.request, ...prev]);
      }
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  // Not authenticated
  if (!connected) {
    return (
      <div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#5c5c5c] transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Dashboard
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#5c5c5c]">Off-Ramp</span>
            </Link>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Off-Ramp
          </h1>
          <p className="text-[#8a8a8a] mb-8">
            Convert USDC to local currency and withdraw to your bank.
          </p>

          <motion.div
            {...fadeInProps}
            className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-12 text-center"
          >
            <ArrowDownToLine className="mx-auto h-8 w-8 text-[#8a8a8a]/60 mb-4" />
            <p className="text-sm text-[#8a8a8a] mb-4">
              Connect your wallet to access off-ramp
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#5c5c5c] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#5c5c5c]">Off-Ramp</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34c759]/15">
              <ArrowDownToLine className="h-5 w-5 text-[#34c759]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#212121]">
                Off-Ramp
              </h1>
              <p className="text-sm text-[#8a8a8a]">
                Convert USDC to local currency
              </p>
            </div>
          </div>
        </div>

        {/* Balance card */}
        <motion.div
          {...fadeInProps}
          className="mb-8 rounded-xl border border-[#d3d3d3] bg-gradient-to-br from-[#34c759]/5 to-transparent p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a8a] mb-1">
                Available Balance
              </p>
              <p className="text-3xl font-semibold text-[#212121] tabular-nums">
                {formatUSD(balance)}
              </p>
              <p className="text-xs text-[#8a8a8a] mt-1">
                USDC • Solana{" "}
                {process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet"}
              </p>
            </div>
            <button
              onClick={fetchBalance}
              className="rounded-lg border border-[#d3d3d3] p-2.5 text-[#8a8a8a] hover:text-[#5c5c5c] hover:bg-[#f2f2f2] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border border-[#34c759]/30 bg-[#34c759]/10 p-4 flex items-center gap-3"
            >
              <Check className="h-5 w-5 text-[#34c759] shrink-0" />
              <p className="text-sm text-[#34c759]">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto text-[#34c759]/60 hover:text-[#34c759] text-xs"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: Off-ramp form */}
          <div className="lg:col-span-3">
            <motion.div
              {...fadeInProps}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] overflow-hidden"
            >
              {/* Step indicators */}
              <div className="border-b border-[#d3d3d3] px-6 py-4">
                <div className="flex items-center gap-4">
                  {[
                    { num: 1, label: "Select Region" },
                    { num: 2, label: "Enter Amount" },
                    { num: 3, label: "Confirm" },
                  ].map((s, i) => (
                    <button
                      key={s.num}
                      onClick={() => {
                        if (s.num === 1) setStep(1);
                        if (s.num === 2 && selectedMethod) setStep(2);
                        if (s.num === 3 && amount && accountInfo) setStep(3);
                      }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                          step >= s.num
                            ? "bg-[#34c759] text-[#212121]"
                            : "bg-[#f2f2f2] text-[#8a8a8a]"
                        }`}
                      >
                        {step > s.num ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          s.num
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:inline ${
                          step >= s.num ? "text-[#212121]" : "text-[#8a8a8a]"
                        }`}
                      >
                        {s.label}
                      </span>
                      {i < 2 && (
                        <ArrowRight className="h-3 w-3 text-[#d3d3d3] mx-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Region + Method */}
                {step === 1 && (
                  <motion.div {...fadeInProps} className="space-y-5">
                    {/* Region selector */}
                    <div>
                      <label className="block text-xs font-medium text-[#8a8a8a] uppercase tracking-wider mb-2">
                        Your Region
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => setRegionOpen(!regionOpen)}
                          className="w-full flex items-center justify-between rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-3 text-sm text-[#212121] hover:border-[#5c5c5c]/30 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#8a8a8a]" />
                            {region.country} ({region.currencyCode})
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-[#8a8a8a] transition-transform ${
                              regionOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {regionOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute z-20 mt-1 w-full rounded-lg border border-[#d3d3d3] bg-[#FFFFFF] shadow-lg max-h-60 overflow-y-auto"
                            >
                              {REGION_LIST.map((r) => (
                                <button
                                  key={r.code}
                                  onClick={() => {
                                    setSelectedRegion(r.code);
                                    setRegionOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f2f2f2] transition-colors flex items-center justify-between ${
                                    r.code === selectedRegion
                                      ? "text-[#34c759] font-medium bg-[#34c759]/5"
                                      : "text-[#5c5c5c]"
                                  }`}
                                >
                                  <span>{r.label}</span>
                                  <span className="text-xs text-[#8a8a8a]">
                                    {r.currency}
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Method selector */}
                    <div>
                      <label className="block text-xs font-medium text-[#8a8a8a] uppercase tracking-wider mb-2">
                        Withdrawal Method
                      </label>
                      <div className="space-y-2">
                        {region.options.map((option) => {
                          const Icon = getMethodIcon(option.type);
                          const isSelected =
                            selectedMethod?.name === option.name;
                          return (
                            <button
                              key={option.name}
                              onClick={() => setSelectedMethod(option)}
                              className={`w-full flex items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all ${
                                isSelected
                                  ? "border-[#34c759]/40 bg-[#34c759]/5 ring-1 ring-[#34c759]/20"
                                  : "border-[#d3d3d3] bg-white/[0.02] hover:border-[#5c5c5c]/30"
                              }`}
                            >
                              <div
                                className={`rounded-lg p-2.5 ${
                                  isSelected
                                    ? "bg-[#34c759]/15"
                                    : "bg-[#f2f2f2]"
                                }`}
                              >
                                <Icon
                                  className={`h-4 w-4 ${
                                    isSelected
                                      ? "text-[#34c759]"
                                      : "text-[#8a8a8a]"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      isSelected
                                        ? "text-[#34c759]"
                                        : "text-[#212121]"
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-[#8a8a8a]">
                                    <Clock className="h-3 w-3" />
                                    {option.speed}
                                  </span>
                                </div>
                                <p className="text-xs text-[#8a8a8a] mt-0.5">
                                  {option.description}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-[#34c759] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => selectedMethod && setStep(2)}
                      disabled={!selectedMethod}
                      className="w-full rounded-lg bg-[#34c759] px-4 py-3 text-sm font-semibold text-[#212121] hover:bg-[#34c759]/90 disabled:opacity-40 transition-colors"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Amount + Account */}
                {step === 2 && selectedMethod && (
                  <motion.div {...fadeInProps} className="space-y-5">
                    {/* Selected method summary */}
                    <div className="flex items-center gap-3 rounded-lg bg-[#f2f2f2] px-4 py-3">
                      {(() => {
                        const Icon = getMethodIcon(selectedMethod.type);
                        return <Icon className="h-4 w-4 text-[#34c759]" />;
                      })()}
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#212121]">
                          {selectedMethod.name}
                        </span>
                        <span className="text-xs text-[#8a8a8a] ml-2">
                          {region.country} • {selectedMethod.speed}
                        </span>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs text-[#34c759] hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-medium text-[#8a8a8a] uppercase tracking-wider mb-2">
                        Amount (USDC)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="1"
                          max={balance}
                          step="0.01"
                          className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] pl-9 pr-4 py-3 text-sm text-[#212121] placeholder-[#8a8a8a] focus:border-[#34c759]/50 focus:outline-none focus:ring-1 focus:ring-[#34c759]/20"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[#8a8a8a]">
                          Available: {formatUSD(balance)}
                        </p>
                        {amount && parseFloat(amount) > 0 && (
                          <p className="text-xs text-[#34c759] font-medium">
                            ≈ {formatLocal(localAmount, region.currencySymbol)}{" "}
                            {region.currencyCode}
                          </p>
                        )}
                      </div>
                      {/* Quick amounts */}
                      <div className="flex gap-2 mt-3">
                        {[25, 50, 100, 500].map((q) => (
                          <button
                            key={q}
                            onClick={() =>
                              setAmount(Math.min(q, balance).toString())
                            }
                            disabled={balance < q}
                            className="flex-1 rounded-lg border border-[#d3d3d3] px-3 py-1.5 text-xs font-medium text-[#5c5c5c] hover:bg-[#f2f2f2] hover:border-[#5c5c5c]/30 disabled:opacity-30 transition-colors"
                          >
                            ${q}
                          </button>
                        ))}
                        <button
                          onClick={() => setAmount(balance.toString())}
                          disabled={balance <= 0}
                          className="flex-1 rounded-lg border border-[#34c759]/30 px-3 py-1.5 text-xs font-medium text-[#34c759] hover:bg-[#34c759]/5 disabled:opacity-30 transition-colors"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    {/* Account info */}
                    <div>
                      <label className="block text-xs font-medium text-[#8a8a8a] uppercase tracking-wider mb-2">
                        {selectedMethod.type === "bank"
                          ? "Account Number / IBAN"
                          : selectedMethod.type === "mobile-money"
                          ? "Phone Number"
                          : "Account ID / Email"}
                      </label>
                      <input
                        type="text"
                        value={accountInfo}
                        onChange={(e) => setAccountInfo(e.target.value)}
                        placeholder={
                          selectedMethod.type === "bank"
                            ? "Enter your account number"
                            : selectedMethod.type === "mobile-money"
                            ? "+254 7XX XXX XXX"
                            : "your@email.com or account ID"
                        }
                        className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-3 text-sm text-[#212121] placeholder-[#8a8a8a] focus:border-[#34c759]/50 focus:outline-none focus:ring-1 focus:ring-[#34c759]/20"
                      />
                    </div>

                    {/* Exchange rate */}
                    <div className="rounded-lg border border-[#d3d3d3] bg-[#FFFFFF] p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8a8a8a]">Exchange Rate</span>
                        <span className="text-[#5c5c5c] font-medium">
                          1 USDC = {region.currencySymbol}
                          {region.rate.toLocaleString()} {region.currencyCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-[#8a8a8a]">Network Fee</span>
                        <span className="text-[#5c5c5c] font-medium">
                          ~$0.01
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-[#8a8a8a]">Off-ramp Fee</span>
                        <span className="text-[#34c759] font-medium">Free</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="rounded-lg border border-[#d3d3d3] px-4 py-3 text-sm font-medium text-[#5c5c5c] hover:bg-[#f2f2f2] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (amount && accountInfo) setStep(3);
                        }}
                        disabled={
                          !amount ||
                          !accountInfo ||
                          parseFloat(amount) <= 0 ||
                          parseFloat(amount) > balance
                        }
                        className="flex-1 rounded-lg bg-[#34c759] px-4 py-3 text-sm font-semibold text-[#212121] hover:bg-[#34c759]/90 disabled:opacity-40 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && selectedMethod && (
                  <motion.div {...fadeInProps} className="space-y-5">
                    <div className="text-center py-2">
                      <p className="text-xs text-[#8a8a8a] uppercase tracking-wider mb-2">
                        You&apos;re converting
                      </p>
                      <p className="text-3xl font-semibold text-[#212121] tabular-nums">
                        {formatUSD(parseFloat(amount || "0"))}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <ArrowDownToLine className="h-4 w-4 text-[#34c759]" />
                        <p className="text-lg font-medium text-[#34c759]">
                          {formatLocal(localAmount, region.currencySymbol)}{" "}
                          {region.currencyCode}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#d3d3d3] divide-y divide-[#d3d3d3]">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-[#8a8a8a]">Method</span>
                        <span className="text-sm font-medium text-[#212121]">
                          {selectedMethod.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-[#8a8a8a]">
                          Destination
                        </span>
                        <span className="text-sm font-medium text-[#212121]">
                          {accountInfo.length > 20
                            ? accountInfo.slice(0, 8) +
                              "..." +
                              accountInfo.slice(-4)
                            : accountInfo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-[#8a8a8a]">Speed</span>
                        <span className="text-sm font-medium text-[#212121] flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-[#34c759]" />
                          {selectedMethod.speed}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-[#8a8a8a]">Rate</span>
                        <span className="text-sm font-medium text-[#212121]">
                          1 USDC = {region.currencySymbol}
                          {region.rate.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-[#e74c3c]">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="rounded-lg border border-[#d3d3d3] px-4 py-3 text-sm font-medium text-[#5c5c5c] hover:bg-[#f2f2f2] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-[#34c759] px-4 py-3 text-sm font-semibold text-[#212121] hover:bg-[#34c759]/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="h-4 w-4" />
                            Confirm Off-Ramp
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Info + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info card */}
            <motion.div
              {...fadeInProps}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-6"
            >
              <h3 className="text-sm font-medium text-[#212121] mb-4">
                How It Works
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: Globe,
                    title: "Select your region",
                    desc: "Choose your region with localized withdrawal options",
                  },
                  {
                    icon: DollarSign,
                    title: "Enter amount",
                    desc: "Specify how much USDC to convert at live exchange rates",
                  },
                  {
                    icon: Banknote,
                    title: "Receive funds",
                    desc: "Money arrives via your chosen method - often instantly",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#34c759]/10 p-2 mt-0.5">
                      <item.icon className="h-3.5 w-3.5 text-[#34c759]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#212121]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#8a8a8a] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              {...fadeInProps}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-6"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[#212121] mb-3">
                <Shield className="h-4 w-4 text-[#34c759]" />
                Security & Compliance
              </div>
              <div className="space-y-2">
                {[
                  "Regulated off-ramp partners",
                  "KYC/AML compliant transfers",
                  "No hidden fees on conversion",
                  "Encrypted account details",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-xs text-[#8a8a8a]"
                  >
                    <Check className="h-3 w-3 text-[#34c759] shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent requests */}
            {requests.length > 0 && (
              <motion.div
                {...fadeInProps}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-[#d3d3d3] bg-white/[0.02] overflow-hidden"
              >
                <div className="border-b border-[#d3d3d3] px-6 py-4">
                  <h3 className="text-sm font-medium text-[#212121]">
                    Recent Requests
                  </h3>
                </div>
                <div className="divide-y divide-[#d3d3d3]">
                  {requests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 px-6 py-3.5"
                    >
                      <ArrowDownToLine className="h-4 w-4 text-[#8a8a8a] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#212121]">
                            {formatUSD(req.amount)}
                          </span>
                          <span className="text-xs text-[#8a8a8a]">
                            via {req.method}
                          </span>
                        </div>
                        <p className="text-xs text-[#8a8a8a] mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(
                          req.status,
                        )}`}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
