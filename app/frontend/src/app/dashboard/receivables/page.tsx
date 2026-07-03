"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
  Calendar,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Users,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Wallet,
} from "lucide-react";

/* ─── Types ─── */
interface Summary {
  totalOutstanding: number;
  totalOutstandingAmount: number;
  dueToday: number;
  dueTodayAmount: number;
  overdueCount: number;
  overdueAmount: number;
  avgDaysToPayment: number;
  collectedThisWeek: number;
  collectedThisWeekCount: number;
  cashUnlocked: number;
  totalInvoices: number;
  totalPaid: number;
}

interface AgingBucket {
  count: number;
  amount: number;
}

interface Counterparty {
  name: string;
  company?: string;
  email: string;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  overdueCount: number;
  totalCount: number;
  avgDaysToPay: number | null;
  riskScore: number;
}

interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerCompany?: string;
  total: number;
  status: string;
  dueDate: string;
  daysOverdue: number;
  viewToken: string;
}

interface ReceivablesData {
  summary: Summary;
  agingBuckets: Record<string, AgingBucket>;
  counterparties: Counterparty[];
  outstandingInvoices: OutstandingInvoice[];
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${fmt(n)}`;
}

/* ─── Risk badge ─── */
function RiskBadge({ score }: { score: number }) {
  if (score >= 50) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e74c3c]/10 border border-[#e74c3c]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e74c3c]">
        <ShieldAlert className="h-3 w-3" /> High
      </span>
    );
  }
  if (score >= 20) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#d29500]/10 border border-[#d29500]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d29500]">
        <Shield className="h-3 w-3" /> Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#34c759]/10 border border-[#34c759]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#34c759]">
      <ShieldCheck className="h-3 w-3" /> Low
    </span>
  );
}

/* ─── Aging bar ─── */
function AgingBar({ buckets }: { buckets: Record<string, AgingBucket> }) {
  const labels: { key: string; label: string; color: string }[] = [
    { key: "current", label: "Current", color: "bg-[#34c759]" },
    { key: "1-30", label: "1-30 days", color: "bg-[#ffc107]" },
    { key: "31-60", label: "31-60 days", color: "bg-[#d29500]" },
    { key: "61-90", label: "61-90 days", color: "bg-[#e74c3c]/80" },
    { key: "90+", label: "90+ days", color: "bg-[#e74c3c]" },
  ];

  const totalAmount = Object.values(buckets).reduce((s, b) => s + b.amount, 0);
  if (totalAmount === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#8a8a8a] text-sm">No outstanding receivables</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-6 w-full overflow-hidden rounded-lg">
        {labels.map(({ key, color }) => {
          const pct =
            totalAmount > 0
              ? ((buckets[key]?.amount || 0) / totalAmount) * 100
              : 0;
          if (pct < 0.5) return null;
          return (
            <div
              key={key}
              className={`${color} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${key}: $${fmt(buckets[key]?.amount || 0)}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {labels.map(({ key, label, color }) => {
          const b = buckets[key] || { count: 0, amount: 0 };
          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="text-[10px] text-[#5c5c5c] font-semibold uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <div className="text-sm font-mono text-[#212121]">
                ${fmt(b.amount)}
              </div>
              <div className="text-[11px] text-[#8a8a8a]">
                {b.count} invoice{b.count !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ReceivablesPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible } = useWalletModal();
  const [data, setData] = useState<ReceivablesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!publicKey) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await fetch("/api/receivables", {
          headers: { "x-merchant-wallet": publicKey },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [publicKey],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!publicKey) return;
    const t = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(t);
  }, [publicKey, fetchData]);

  /* ─── Auth gate ─── */
  if (!connected || !publicKey) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Wallet className="h-10 w-10 text-[#5c5c5c]" />
        <p className="text-sm text-[#5c5c5c]">
          Connect your wallet to view receivables
        </p>
        <button
          onClick={() => setVisible(true)}
          className="rounded-lg bg-[#34c759] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#34c759]" />
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold">
            Accounts Receivable
          </span>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight mt-1">
            Receivables
          </h1>
          <p className="text-sm text-[#8a8a8a] mt-1">
            {s?.totalOutstanding || 0} outstanding · {s?.overdueCount || 0}{" "}
            overdue
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-[#d3d3d3] px-4 py-2.5 text-sm text-[#8a8a8a] hover:text-[#212121] hover:border-[#8a8a8a] transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Outstanding */}
        <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d29500]/10">
              <DollarSign className="h-4 w-4 text-[#d29500]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#212121] font-mono">
            ${fmt(s?.totalOutstandingAmount || 0)}
          </div>
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
            Outstanding
          </div>
          <div className="text-[11px] text-[#5c5c5c] mt-0.5">
            {s?.totalOutstanding || 0} invoices
          </div>
        </div>

        {/* Due Today */}
        <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7086f2]/10">
              <Calendar className="h-4 w-4 text-[#7086f2]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#212121] font-mono">
            ${fmt(s?.dueTodayAmount || 0)}
          </div>
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
            Due Today
          </div>
          <div className="text-[11px] text-[#5c5c5c] mt-0.5">
            {s?.dueToday || 0} invoices
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-xl bg-[#ffffff] border border-[#e74c3c]/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e74c3c]/10">
              <AlertTriangle className="h-4 w-4 text-[#e74c3c]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#e74c3c] font-mono">
            ${fmt(s?.overdueAmount || 0)}
          </div>
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
            Overdue
          </div>
          <div className="text-[11px] text-[#e74c3c]/60 mt-0.5">
            {s?.overdueCount || 0} invoices
          </div>
        </div>

        {/* Avg Days to Payment */}
        <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#212121] font-mono">
            {s?.avgDaysToPayment || 0}
            <span className="text-sm text-[#5c5c5c] ml-1">days</span>
          </div>
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
            Avg Time to Pay
          </div>
          <div className="text-[11px] text-[#5c5c5c] mt-0.5">
            across {s?.totalPaid || 0} paid
          </div>
        </div>

        {/* Collected This Week */}
        <div className="rounded-xl bg-[#ffffff] border border-[#34c759]/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34c759]/10">
              <TrendingUp className="h-4 w-4 text-[#34c759]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#34c759] font-mono">
            ${fmt(s?.collectedThisWeek || 0)}
          </div>
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
            Collected This Week
          </div>
          <div className="text-[11px] text-[#5c5c5c] mt-0.5">
            {s?.collectedThisWeekCount || 0} payments
          </div>
        </div>

        {/* Cash Unlocked */}
        <div className="rounded-xl bg-[#ffffff] border border-[#34c759]/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34c759]/10">
              <Zap className="h-4 w-4 text-[#34c759]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#34c759] font-mono">
            {fmtCompact(s?.cashUnlocked || 0)}
          </div>
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
            Cash Unlocked
          </div>
          <div className="text-[11px] text-[#5c5c5c] mt-0.5">
            vs Net-30 baseline
          </div>
        </div>
      </div>

      {/* ── Aging Breakdown ── */}
      <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a] mb-5">
          Aging Breakdown
        </h3>
        {data && <AgingBar buckets={data.agingBuckets} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Outstanding Invoices ── */}
        <div className="lg:col-span-3 rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
              Outstanding Invoices
            </h3>
            <Link
              href="/dashboard/invoices"
              className="text-[11px] text-[#34c759] hover:text-[#2ba048] transition-colors flex items-center gap-1"
            >
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {!data?.outstandingInvoices.length ? (
            <div className="text-center py-10">
              <DollarSign className="h-8 w-8 text-[#5c5c5c] mx-auto mb-3" />
              <p className="text-sm text-[#8a8a8a]">
                All caught up - no outstanding invoices
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d3d3d3] text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                    <th className="pb-3 text-left font-semibold">Invoice</th>
                    <th className="pb-3 text-left font-semibold">Buyer</th>
                    <th className="pb-3 text-right font-semibold">Amount</th>
                    <th className="pb-3 text-center font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3d3d3]">
                  {data.outstandingInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="group hover:bg-[#f2f2f2] transition-colors"
                    >
                      <td className="py-3">
                        <span className="font-mono text-[#212121] text-xs">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="text-[#212121] text-xs">
                          {inv.buyerName}
                        </div>
                        {inv.buyerCompany && (
                          <div className="text-[11px] text-[#8a8a8a]">
                            {inv.buyerCompany}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono text-[#212121]">
                        ${fmt(inv.total)}
                      </td>
                      <td className="py-3 text-center">
                        {inv.daysOverdue > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e74c3c]/10 border border-[#e74c3c]/20 px-2 py-0.5 text-[10px] font-bold text-[#e74c3c]">
                            {inv.daysOverdue}d overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#7086f2]/10 border border-[#7086f2]/20 px-2 py-0.5 text-[10px] font-bold text-[#7086f2]">
                            {inv.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right text-xs text-[#5c5c5c]">
                        {new Date(inv.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Counterparties by Risk ── */}
        <div className="lg:col-span-2 rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="h-4 w-4 text-[#34c759]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
              Counterparties by Risk
            </h3>
          </div>

          {!data?.counterparties.length ? (
            <div className="text-center py-10">
              <Users className="h-8 w-8 text-[#5c5c5c] mx-auto mb-3" />
              <p className="text-sm text-[#8a8a8a]">No counterparty data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.counterparties.slice(0, 8).map((cp, i) => (
                <div
                  key={cp.email}
                  className="flex items-center justify-between rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] p-3 hover:border-[#d3d3d3] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#212121] truncate">
                        {cp.company || cp.name}
                      </span>
                      <RiskBadge score={cp.riskScore} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#8a8a8a]">
                      <span>{cp.totalCount} invoices</span>
                      {cp.avgDaysToPay !== null && (
                        <span>avg {cp.avgDaysToPay}d to pay</span>
                      )}
                      {cp.overdueCount > 0 && (
                        <span className="text-[#e74c3c]">
                          {cp.overdueCount} overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-mono text-[#212121]">
                      ${fmt(cp.outstanding)}
                    </div>
                    <div className="text-[10px] text-[#8a8a8a]">outstanding</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cash Flow Insight ── */}
      {s && s.cashUnlocked > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-[#34c759]/5 to-transparent border border-[#34c759]/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34c759]/10 flex-shrink-0">
              <Zap className="h-5 w-5 text-[#34c759]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#212121]">
                Instant Settlement Impact
              </h3>
              <p className="text-sm text-[#8a8a8a] mt-1 leading-relaxed">
                You&apos;ve collected{" "}
                <span className="font-mono font-bold text-[#34c759]">
                  ${fmt(s.cashUnlocked)}
                </span>{" "}
                that would still be outstanding under traditional Net-30 terms.
                Your average time to payment is{" "}
                <span className="font-mono font-semibold text-[#212121]">
                  {s.avgDaysToPayment} days
                </span>{" "}
                - that&apos;s cash back in your business faster.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
