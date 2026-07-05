"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { explorerUrl } from "@/lib/constants";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useWalletSession } from "@/hooks/useWalletSession";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  LogIn,
  ChevronRight,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownToLine,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";

/* ─── Types ─── */
interface TreasuryBalance {
  balance: {
    available: number;
    pending: number;
    reserved: number;
    total: number;
  };
  lifetime: {
    totalDeposited: number;
    totalPayouts: number;
    totalFees: number;
    totalWithdrawn: number;
  };
}

interface InvoiceStats {
  total: number;
  paid: number;
  outstanding: number;
  overdue: number;
  totalRevenue: number;
  outstandingAmount: number;
}

interface PaymentRecord {
  id: string;
  merchantName: string;
  merchantWallet: string;
  customerWallet: string;
  amount: number;
  currency: string;
  description?: string;
  txSignature: string;
  status: string;
  completedAt: number;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "-";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function timeAgo(epoch: number): string {
  const diff = Date.now() - epoch;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function DashboardPage() {
  const { setVisible: openWalletModal } = useWalletModal();
  // Unified connection - true for both extension wallets AND Privy email logins.
  const { publicKey, connected } = useActiveWallet();
  const onboarding = useOnboardingStatus();
  const { status: sessionStatus } = useWalletSession();

  const [treasury, setTreasury] = useState<TreasuryBalance | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchData = useCallback(async () => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    // Wait for the wallet sign-in flow (nonce → signMessage → verify)
    // to complete before hitting authenticated endpoints. Otherwise the
    // very first call races the session cookie and 401s, flipping the UI
    // to the "session expired" screen even though the user just signed in.
    if (sessionStatus !== "ready") {
      return;
    }
    try {
      const [treasuryRes, statsRes, paymentsRes] = await Promise.all([
        fetch(`/api/treasury/balance?wallet=${publicKey}`),
        fetch("/api/invoices?stats=true", {
          headers: { "x-merchant-wallet": publicKey },
        }),
        fetch(`/api/payments?wallet=${publicKey}`),
      ]);

      // Detect session expiry on any 401 - surfaces silent auth drops.
      if (
        treasuryRes.status === 401 ||
        statsRes.status === 401 ||
        paymentsRes.status === 401
      ) {
        setSessionExpired(true);
        setLoading(false);
        return;
      }
      // Clear any previous expiry banner once we get a clean response.
      setSessionExpired(false);

      const failures: string[] = [];
      if (treasuryRes.ok) setTreasury(await treasuryRes.json());
      else failures.push("treasury");
      if (statsRes.ok) setInvoiceStats(await statsRes.json());
      else failures.push("invoices");
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      } else {
        failures.push("payments");
      }

      if (failures.length > 0) {
        setFetchError(
          `Couldn’t refresh ${failures.join(", ")} - retrying in 30s.`,
        );
      } else {
        setFetchError(null);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setFetchError("Couldn’t reach Offbank - retrying in 30s.");
    } finally {
      setLoading(false);
    }
  }, [publicKey, sessionStatus]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Compute 7-day volume bars from payment data
  const volumeBars = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const dailyTotals: Record<number, number> = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      dailyTotals[d.getDay()] = 0;
    }

    payments
      .filter((p) => p.completedAt >= sevenDaysAgo && p.status === "completed")
      .forEach((p) => {
        const day = new Date(p.completedAt).getDay();
        dailyTotals[day] = (dailyTotals[day] || 0) + p.amount;
      });

    const maxVal = Math.max(...Object.values(dailyTotals), 1);
    const today = new Date(now);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      const dayIndex = d.getDay();
      const value = dailyTotals[dayIndex] || 0;
      const isToday = d.toDateString() === today.toDateString();
      return {
        day: isToday ? `${DAY_LABELS[dayIndex]} (TODAY)` : DAY_LABELS[dayIndex],
        value,
        height: maxVal > 0 ? Math.max((value / maxVal) * 100, 4) : 4,
        peak: value === maxVal && value > 0,
      };
    });
  }, [payments]);

  const recentPayments = payments.slice(0, 5);

  const balance = treasury?.balance;
  const lifetime = treasury?.lifetime;

  if (!connected) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3]">
            <Wallet className="h-6 w-6 text-[#5c5c5c]" />
          </div>
          <h2 className="text-xl font-semibold text-[#212121] mb-2">
            Welcome to Offbank
          </h2>
          <p className="text-[#8a8a8a] mb-6 max-w-sm text-sm">
            Connect your wallet to access your merchant dashboard.
          </p>
          <button
            onClick={() => openWalletModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Connect Wallet
          </button>
          <p className="mt-6 text-xs text-[#8a8a8a]">
            New to Offbank?{" "}
            <Link
              href="/onboarding"
              className="text-[#34c759] font-medium hover:underline"
            >
              Get started
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // Wallet connected but not yet onboarded - don't show empty dashboard,
  // route them to finish setup. This is the "easier route for clients":
  // a wallet that hits /dashboard without an account gets a clear CTA
  // instead of an unexplained empty state.
  if (onboarding.status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-[#34c759] animate-spin" />
      </div>
    );
  }

  if (onboarding.status === "needs-onboarding") {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20">
            <Plus className="h-6 w-6 text-[#34c759]" />
          </div>
          <h2 className="text-xl font-semibold text-[#212121] mb-2">
            Finish setting up your account
          </h2>
          <p className="text-[#8a8a8a] mb-6 text-sm">
            Your wallet is connected, but you haven&apos;t completed onboarding yet.
            It takes about 60 seconds - KYB only happens at first settlement.
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
            >
              Start onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => openWalletModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-white px-5 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors"
            >
              Switch wallet
            </button>
          </div>
          <p className="mt-4 text-xs text-[#8a8a8a]">
            Want to see how it works first?{" "}
            <Link
              href="/demo"
              className="text-[#34c759] font-medium hover:underline"
            >
              Try the 60-second demo
            </Link>{" "}
            - no signup, no wallet required.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-[#34c759]" />
        <span className="ml-2 text-sm text-[#5c5c5c]">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff5f0] border border-[#ffd6c2]">
            <AlertTriangle className="h-6 w-6 text-[#e74c3c]" />
          </div>
          <h2 className="text-xl font-semibold text-[#212121] mb-2">
            Your session expired
          </h2>
          <p className="text-[#8a8a8a] mb-6 text-sm">
            For security we logged you out after a period of inactivity. Sign
            back in to continue.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2ba048] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign back in
          </Link>
        </motion.div>
      </div>
    );
  }

  const hasInvoices = (invoiceStats?.total ?? 0) > 0;
  const isFreshAccount = !hasInvoices && payments.length === 0;

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#ffd6c2] bg-[#fff5f0] px-4 py-3 text-sm text-[#a04b1f]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFetchError(null)}
            aria-label="Dismiss notification"
            className="text-[#a04b1f] hover:text-[#212121]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight">
            Vault Overview
          </h1>
          <p className="text-sm text-[#5c5c5c] mt-1 uppercase tracking-wider">
            Settlement Portal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/invoices/create"
            className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create invoice
          </Link>
          <Link
            href="/dashboard/offramp"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-white px-4 py-2.5 text-sm font-semibold text-[#212121] hover:bg-[#f2f2f2] transition-colors"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Cash Out
          </Link>
          <button
            onClick={fetchData}
            aria-label="Refresh dashboard data"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d3d3d3] px-4 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {isFreshAccount && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border-2 border-[#34c759]/30 bg-gradient-to-br from-[#34c759]/[0.08] via-[#34c759]/[0.04] to-transparent p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#34c759] text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#212121]">
                  You’re set up. Send your first invoice.
                </h2>
                <p className="mt-1 text-sm text-[#5c5c5c]">
                  Paste a buyer’s email and an amount - we’ll send a payment
                  link, settle USDC to your vault, and let you cash out to USD
                  when you’re ready.
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Link
                href="/dashboard/invoices/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2ba048] transition-colors"
              >
                Create your first invoice
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-white px-5 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors"
              >
                See it first
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Balance + Pending Invoices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#5c5c5c] uppercase tracking-[0.15em] font-semibold">
              Treasury Balance
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#34c759]/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#34c759]" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-[#212121] tracking-tight">
              {formatUSD(balance?.total ?? 0)}
            </span>
            <span className="text-lg font-semibold text-[#34c759]">USDC</span>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#d3d3d3]">
            <div>
              <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">
                Available
              </span>
              <span className="text-lg font-semibold text-[#212121]">
                {formatUSD(balance?.available ?? 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">
                Pending
              </span>
              <span className="text-lg font-semibold text-[#212121]">
                {formatUSD(balance?.pending ?? 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">
                Total Deposited
              </span>
              <span className="text-lg font-semibold text-[#34c759]">
                {formatUSD(lifetime?.totalDeposited ?? 0)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Invoice Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6 flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] text-[#5c5c5c] uppercase tracking-[0.15em] font-semibold">
              Invoices
            </span>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5c5c5c]">Outstanding</span>
                <span className="text-2xl font-bold text-[#212121]">
                  {invoiceStats?.outstanding ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5c5c5c]">Paid</span>
                <span className="text-sm font-semibold text-[#34c759]">
                  {invoiceStats?.paid ?? 0}
                </span>
              </div>
              {(invoiceStats?.overdue ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e74c3c]">Overdue</span>
                  <span className="text-sm font-semibold text-[#e74c3c]">
                    {invoiceStats?.overdue}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[#d3d3d3] pt-3">
                <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider">
                  Revenue
                </span>
                <span className="text-sm font-bold text-[#34c759]">
                  ${formatUSD(invoiceStats?.totalRevenue ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/invoices"
            className="mt-6 flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors group"
          >
            <span className="uppercase tracking-wider text-[12px]">
              View Invoices
            </span>
            <ArrowRight className="h-4 w-4 text-[#5c5c5c] group-hover:text-[#34c759] transition-colors" />
          </Link>
        </motion.div>
      </div>

      {/* Payment Volume (7D) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] text-[#5c5c5c] uppercase tracking-[0.15em] font-semibold">
            Payment Volume (7D)
          </span>
          <span className="text-xs text-[#8a8a8a]">
            {payments.filter((p) => p.status === "completed").length} total
            payments
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-[#8a8a8a] text-sm">
            No payment data yet
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {volumeBars.map((bar) => (
              <div
                key={bar.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                {bar.peak && bar.value > 0 && (
                  <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded px-2 py-1 text-[10px] text-[#34c759] font-mono mb-1">
                    ${formatUSD(bar.value)}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-md transition-all ${
                    bar.peak ? "bg-[#34c759]" : "bg-[#2a2a2a]"
                  }`}
                  style={{ height: `${bar.height}%` }}
                />
                <span
                  className={`text-[10px] font-semibold tracking-wider ${
                    bar.peak ? "text-[#34c759]" : "text-[#8a8a8a]"
                  }`}
                >
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl bg-[#ffffff] border border-[#d3d3d3]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d3d3d3]">
          <span className="text-[11px] text-[#5c5c5c] uppercase tracking-[0.15em] font-semibold">
            Recent Payments
          </span>
          <Link
            href="/dashboard/settlements"
            className="text-[11px] text-[#34c759] uppercase tracking-wider font-semibold hover:text-[#2ba048] transition-colors flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="mx-auto mb-4 h-10 w-10 text-[#5c5c5c]" />
            <h3 className="mb-1 font-semibold text-[#212121] text-sm">
              No payments yet
            </h3>
            <p className="text-xs text-[#5c5c5c]">
              Payments will appear here as they are received.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#d3d3d3]">
            {recentPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#f2f2f2] transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-[#34c759]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#212121]">
                    {p.description || "Payment"}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] font-mono">
                    From {shortenAddress(p.customerWallet)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#212121]">
                    {formatUSD(p.amount)} {p.currency}
                  </div>
                </div>
                <div className="w-24 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                      p.status === "completed"
                        ? "text-[#34c759] bg-[#34c759]/5 border-[#34c759]/20"
                        : "text-[#d29500] bg-[#ffc107]/5 border-[#ffc107]/20"
                    }`}
                  >
                    {p.status === "completed" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {p.status === "completed" ? "Settled" : "Pending"}
                  </span>
                </div>
                <div className="text-[11px] text-[#8a8a8a] w-20 text-right">
                  {timeAgo(p.completedAt)}
                </div>
                <a
                  href={explorerUrl(p.txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View transaction on Solana Explorer"
                  className="text-[#34c759] hover:text-[#2ba048] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
