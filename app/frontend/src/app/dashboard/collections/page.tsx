"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  Wallet,
  Loader2,
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  ExternalLink,
  Zap,
  RefreshCw,
  ChevronRight,
  Mail,
  Timer,
  Ban,
} from "lucide-react";

/* ─── Types ─── */
interface CollectionStats {
  totalReminders: number;
  sent: number;
  scheduled: number;
  skipped: number;
  failed: number;
  overdueInvoices: number;
  overdueAmount: number;
  collectedAfterReminder: number;
  collectedAmount: number;
  avgDaysToCollect: number;
}

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string | null;
  total: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  status: string;
  viewCount: number;
  lastViewedAt: string | null;
  sentAt: string | null;
}

interface DueSoonInvoice {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string | null;
  total: number;
  currency: string;
  dueDate: string;
  daysUntilDue: number;
  status: string;
}

interface Reminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  buyerEmail: string;
  buyerName: string;
  type: string;
  status: string;
  scheduledFor: string;
  sentAt: string | null;
  failedReason: string | null;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const TYPE_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pre_due_nudge: {
    label: "Nudge",
    color: "text-[#7086f2]",
    bg: "bg-[#7086f2]/10",
  },
  due_today: {
    label: "Due Today",
    color: "text-[#d29500]",
    bg: "bg-[#d29500]/10",
  },
  overdue_gentle: {
    label: "Gentle",
    color: "text-[#d29500]",
    bg: "bg-[#d29500]/10",
  },
  overdue_firm: { label: "Firm", color: "text-[#e74c3c]", bg: "bg-[#e74c3c]/10" },
  overdue_final: { label: "Final", color: "text-[#e74c3c]", bg: "bg-[#e74c3c]/15" },
};

const STATUS_ICONS: Record<string, { icon: typeof Send; color: string }> = {
  scheduled: { icon: Clock, color: "text-[#8a8a8a]" },
  sent: { icon: CheckCircle2, color: "text-[#34c759]" },
  failed: { icon: XCircle, color: "text-[#e74c3c]" },
  skipped: { icon: Ban, color: "text-[#d3d3d3]" },
};

type Tab = "overview" | "overdue" | "reminders";

export default function CollectionsPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible } = useWalletModal();

  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState<string | null>(null);

  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [dueSoon, setDueSoon] = useState<DueSoonInvoice[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [sendResult, setSendResult] = useState<{
    sent: number;
    skipped: number;
    failed: number;
  } | null>(null);

  const headers: Record<string, string> = publicKey
    ? { "x-merchant-wallet": publicKey }
    : {};

  const fetchData = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/collections", { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setOverdueInvoices(data.overdueInvoices || []);
        setDueSoon(data.dueSoon || []);
        setReminders(data.reminders || []);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendReminders = async () => {
    if (!publicKey) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/collections/send", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setSendResult({
          sent: data.sent,
          skipped: data.skipped,
          failed: data.failed,
        });
        // Refresh data
        await fetchData();
      }
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async (invoiceId: string) => {
    if (!publicKey) return;
    setScheduling(invoiceId);
    try {
      const res = await fetch(
        `/api/collections/send?action=schedule&invoiceId=${invoiceId}`,
        { method: "POST", headers },
      );
      if (res.ok) {
        await fetchData();
      }
    } finally {
      setScheduling(null);
    }
  };

  /* Auth gate */
  if (!connected || !publicKey) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Wallet className="h-10 w-10 text-[#5c5c5c]" />
        <p className="text-sm text-[#5c5c5c]">
          Connect your wallet to manage collections
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

  const scheduledCount = reminders.filter(
    (r) => r.status === "scheduled",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold">
            Accounts Receivable
          </span>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight mt-1">
            Collections
          </h1>
          <p className="text-sm text-[#8a8a8a] mt-1">
            Automated reminders, overdue tracking, and collection performance
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#8a8a8a] hover:text-[#212121] hover:border-[#8a8a8a] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleSendReminders}
            disabled={sending || scheduledCount === 0}
            className="flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Due Reminders {scheduledCount > 0 && `(${scheduledCount})`}
          </button>
        </div>
      </div>

      {/* Send result toast */}
      {sendResult && (
        <div className="rounded-xl border border-[#34c759]/20 bg-[#34c759]/5 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#34c759]" />
            <span className="text-sm text-[#212121]">
              <strong>{sendResult.sent}</strong> reminder
              {sendResult.sent !== 1 ? "s" : ""} sent
              {sendResult.skipped > 0 && (
                <span className="text-[#8a8a8a]">
                  {" "}
                  · {sendResult.skipped} skipped
                </span>
              )}
              {sendResult.failed > 0 && (
                <span className="text-[#e74c3c]">
                  {" "}
                  · {sendResult.failed} failed
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => setSendResult(null)}
            className="text-[#8a8a8a] hover:text-[#212121]"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex rounded-lg bg-[#ffffff] border border-[#d3d3d3] p-1">
        {[
          { id: "overview" as Tab, label: "Overview", icon: TrendingUp },
          {
            id: "overdue" as Tab,
            label: `Overdue (${overdueInvoices.length})`,
            icon: AlertTriangle,
          },
          {
            id: "reminders" as Tab,
            label: `Reminders (${reminders.length})`,
            icon: BellRing,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t.id
                ? "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20"
                : "text-[#5c5c5c] hover:text-[#212121] border border-transparent"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#34c759]" />
        </div>
      ) : (
        <>
          {/* ════ OVERVIEW TAB ════ */}
          {tab === "overview" && stats && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-[#ffffff] border border-[#e74c3c]/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e74c3c]/10">
                      <AlertTriangle className="h-4 w-4 text-[#e74c3c]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#e74c3c] font-mono">
                    {stats.overdueInvoices}
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                    Overdue Invoices
                  </div>
                  <div className="text-sm text-[#5c5c5c] font-mono mt-0.5">
                    ${fmt(stats.overdueAmount)}
                  </div>
                </div>

                <div className="rounded-xl bg-[#ffffff] border border-[#34c759]/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34c759]/10">
                      <DollarSign className="h-4 w-4 text-[#34c759]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#34c759] font-mono">
                    ${fmt(stats.collectedAmount)}
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                    Collected After Reminders
                  </div>
                  <div className="text-sm text-[#5c5c5c] font-mono mt-0.5">
                    {stats.collectedAfterReminder} invoice
                    {stats.collectedAfterReminder !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7086f2]/10">
                      <Send className="h-4 w-4 text-[#7086f2]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#212121] font-mono">
                    {stats.sent}
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                    Reminders Sent
                  </div>
                  <div className="text-sm text-[#5c5c5c] font-mono mt-0.5">
                    {stats.scheduled} pending
                  </div>
                </div>

                <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                      <Timer className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#212121] font-mono">
                    {stats.avgDaysToCollect}
                    <span className="text-sm text-[#5c5c5c] ml-0.5">d</span>
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                    Avg Days to Collect
                  </div>
                  <div className="text-sm text-[#5c5c5c] font-mono mt-0.5">
                    after due date
                  </div>
                </div>
              </div>

              {/* Two columns: Due Soon + Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Due Soon */}
                <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3]">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#d3d3d3]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#d29500]" />
                      <span className="text-sm font-semibold text-[#212121]">
                        Due Soon
                      </span>
                      {dueSoon.length > 0 && (
                        <span className="rounded-full bg-[#d29500]/10 px-2 py-0.5 text-[10px] font-bold text-[#d29500]">
                          {dueSoon.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-[#d3d3d3]">
                    {dueSoon.length === 0 ? (
                      <div className="px-5 py-8 text-center text-[#8a8a8a] text-sm">
                        No invoices due in the next 3 days
                      </div>
                    ) : (
                      dueSoon.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between px-5 py-3 hover:bg-[#f2f2f2] transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-[#212121]">
                                {inv.invoiceNumber}
                              </span>
                              <span className="rounded-full bg-[#d29500]/10 border border-[#d29500]/20 px-2 py-0.5 text-[9px] font-bold text-[#d29500] uppercase">
                                {inv.daysUntilDue === 0
                                  ? "Due today"
                                  : `${inv.daysUntilDue}d left`}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8a8a8a] mt-0.5 truncate">
                              {inv.buyerCompany || inv.buyerName}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-[#212121]">
                              ${fmt(inv.total)}
                            </span>
                            <button
                              onClick={() => handleSchedule(inv.id)}
                              disabled={scheduling === inv.id}
                              className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-1.5 text-[10px] font-semibold text-[#8a8a8a] hover:text-[#34c759] hover:border-[#34c759]/30 transition-colors"
                            >
                              {scheduling === inv.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Schedule"
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reminder Pipeline */}
                <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3]">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#d3d3d3]">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#7086f2]" />
                      <span className="text-sm font-semibold text-[#212121]">
                        Reminder Pipeline
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      {
                        type: "pre_due_nudge",
                        label: "Pre-due Nudge",
                        desc: "3 days before due date",
                        color: "bg-[#7086f2]",
                      },
                      {
                        type: "due_today",
                        label: "Due Today",
                        desc: "On the due date",
                        color: "bg-[#d29500]",
                      },
                      {
                        type: "overdue_gentle",
                        label: "Gentle Reminder",
                        desc: "3 days past due",
                        color: "bg-[#d29500]",
                      },
                      {
                        type: "overdue_firm",
                        label: "Firm Follow-up",
                        desc: "7 days past due",
                        color: "bg-[#e74c3c]/80",
                      },
                      {
                        type: "overdue_final",
                        label: "Final Notice",
                        desc: "14 days past due",
                        color: "bg-[#e74c3c]",
                      },
                    ].map((step, i) => {
                      const count = reminders.filter(
                        (r) => r.type === step.type,
                      ).length;
                      const sentCount = reminders.filter(
                        (r) => r.type === step.type && r.status === "sent",
                      ).length;
                      return (
                        <div
                          key={step.type}
                          className="flex items-center gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-3 w-3 rounded-full ${step.color}`}
                            />
                            {i < 4 && <div className="w-px h-6 bg-[#5c5c5c]" />}
                          </div>
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold text-[#212121]">
                                {step.label}
                              </div>
                              <div className="text-[10px] text-[#8a8a8a]">
                                {step.desc}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono text-[#8a8a8a]">
                                {sentCount}/{count}
                              </span>
                              <div className="text-[9px] text-[#8a8a8a]">sent</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ OVERDUE TAB ════ */}
          {tab === "overdue" && (
            <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d3d3d3] text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                      <th className="px-4 py-3 text-left font-semibold">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Buyer
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Days Overdue
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Viewed
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d3d3d3]">
                    {overdueInvoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-[#8a8a8a]"
                        >
                          <CheckCircle2 className="h-8 w-8 mx-auto text-[#34c759] mb-2" />
                          No overdue invoices - all caught up!
                        </td>
                      </tr>
                    ) : (
                      overdueInvoices.map((inv) => {
                        const severity =
                          inv.daysOverdue >= 14
                            ? "text-[#e74c3c]"
                            : inv.daysOverdue >= 7
                            ? "text-[#e74c3c]"
                            : inv.daysOverdue >= 3
                            ? "text-[#d29500]"
                            : "text-[#d29500]";
                        return (
                          <tr
                            key={inv.id}
                            className="hover:bg-[#f2f2f2] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <Link
                                href={`/dashboard/invoices/${inv.id}`}
                                className="text-xs font-mono text-[#212121] hover:text-[#34c759] transition-colors"
                              >
                                {inv.invoiceNumber}
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-[#212121]">
                                {inv.buyerCompany || inv.buyerName}
                              </div>
                              <div className="text-[11px] text-[#8a8a8a]">
                                {inv.buyerEmail}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#212121]">
                              ${fmt(inv.total)}
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-[#5c5c5c]">
                              {inv.dueDate}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-sm font-bold font-mono ${severity}`}
                              >
                                {inv.daysOverdue}d
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {inv.viewCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#8a8a8a]">
                                  <Eye className="h-3 w-3" />
                                  {inv.viewCount}×
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#d3d3d3]">
                                  Not viewed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleSchedule(inv.id)}
                                disabled={scheduling === inv.id}
                                className="rounded-lg bg-[#34c759]/10 border border-[#34c759]/20 px-3 py-1.5 text-[10px] font-bold text-[#34c759] uppercase tracking-wider hover:bg-[#34c759]/20 transition-colors"
                              >
                                {scheduling === inv.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin inline" />
                                ) : (
                                  <>
                                    <Bell className="h-3 w-3 inline mr-1" />
                                    Schedule
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ REMINDERS TAB ════ */}
          {tab === "reminders" && (
            <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] divide-y divide-[#d3d3d3]">
              {reminders.length === 0 ? (
                <div className="px-5 py-12 text-center text-[#8a8a8a] text-sm">
                  <BellRing className="h-8 w-8 mx-auto text-[#5c5c5c] mb-2" />
                  No reminders yet. Schedule reminders from the Overdue tab.
                </div>
              ) : (
                reminders.map((r) => {
                  const typeInfo = TYPE_LABELS[r.type] || {
                    label: r.type,
                    color: "text-[#8a8a8a]",
                    bg: "bg-[#f2f2f2]",
                  };
                  const statusInfo = STATUS_ICONS[r.status] || {
                    icon: Clock,
                    color: "text-[#8a8a8a]",
                  };
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-[#f2f2f2] transition-colors"
                    >
                      <StatusIcon
                        className={`h-4 w-4 shrink-0 ${statusInfo.color}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#212121]">
                            {r.invoiceNumber}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${typeInfo.bg} ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                          <span
                            className={`text-[10px] uppercase ${
                              r.status === "sent"
                                ? "text-[#34c759]"
                                : r.status === "failed"
                                ? "text-[#e74c3c]"
                                : r.status === "skipped"
                                ? "text-[#d3d3d3]"
                                : "text-[#5c5c5c]"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8a8a8a] mt-0.5 truncate">
                          → {r.buyerName} ({r.buyerEmail})
                          {r.failedReason && (
                            <span className="text-[#e74c3c]/70 ml-2">
                              · {r.failedReason}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-[#5c5c5c]">
                          {r.sentAt
                            ? `Sent ${new Date(r.sentAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}`
                            : `Scheduled ${new Date(
                                r.scheduledFor,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}`}
                        </div>
                        <div className="text-[10px] text-[#8a8a8a]">
                          {new Date(
                            r.sentAt || r.scheduledFor,
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
