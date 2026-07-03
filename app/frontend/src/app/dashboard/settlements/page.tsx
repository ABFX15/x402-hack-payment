"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { explorerUrl as buildExplorerUrl } from "@/lib/constants";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Shield,
  Clock,
  Wallet,
  LogIn,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";

/* ─── Types ─── */
interface PaymentRecord {
  id: string;
  sessionId?: string;
  merchantId: string;
  merchantName: string;
  merchantWallet: string;
  customerWallet: string;
  amount: number;
  currency: string;
  description?: string;
  txSignature: string;
  status: string;
  completedAt: number;
  isPrivate?: boolean;
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "-";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(epoch: number): string {
  return new Date(epoch).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatFullDate(epoch: number): string {
  return (
    new Date(epoch).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " at " +
    formatTime(epoch) +
    " UTC"
  );
}

function explorerUrl(sig: string): string {
  return buildExplorerUrl(sig);
}

export default function SettlementsPage() {
  const { setVisible: openWalletModal } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);
  const [copiedSig, setCopiedSig] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/payments?wallet=${publicKey}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch settlements:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const copySig = (sig: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2000);
  };

  const filtered = payments.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.txSignature.toLowerCase().includes(q) ||
      p.customerWallet.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      p.merchantName.toLowerCase().includes(q)
    );
  });

  const totalSettled = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  // Not connected
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
            Connect Wallet
          </h2>
          <p className="text-[#8a8a8a] mb-6 max-w-sm text-sm">
            Connect your wallet to view settlement history.
          </p>
          <button
            onClick={() => openWalletModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  // Detail panel
  if (selected) {
    const p = selected;
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-sm text-[#5c5c5c] hover:text-[#212121] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settlements
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold">
              {p.status === "completed"
                ? "Transaction Verified"
                : "Pending Settlement"}
            </span>
            <h1 className="text-3xl font-bold text-[#212121] tracking-tight mt-1">
              Settlement Detail
            </h1>
            <p className="text-sm text-[#5c5c5c] mt-1">
              {p.completedAt
                ? `Completed on ${formatFullDate(p.completedAt)}`
                : "Awaiting confirmation"}{" "}
              on Solana Devnet.
            </p>
          </div>
          <div className="rounded-xl bg-[#34c759] px-6 py-4 text-center shrink-0">
            <div className="text-[10px] text-black/60 uppercase tracking-wider font-semibold mb-1">
              Settled Amount
            </div>
            <div className="text-2xl font-bold text-black">
              {p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              {p.currency}
            </div>
          </div>
        </div>

        {/* Confirmation + Signature */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6"
          >
            <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider font-semibold">
              Status
            </span>
            <div className="flex items-center gap-3 mt-4 mb-6">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  p.status === "completed"
                    ? "bg-[#34c759]/10"
                    : "bg-[#ffc107]/10"
                }`}
              >
                {p.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-[#34c759]" />
                ) : (
                  <Clock className="h-5 w-5 text-[#d29500]" />
                )}
              </div>
              <div>
                <span
                  className={`text-xl font-bold ${
                    p.status === "completed"
                      ? "text-[#34c759]"
                      : "text-[#d29500]"
                  }`}
                >
                  {p.status === "completed" ? "Confirmed" : "Pending"}
                </span>
                <div className="text-xs text-[#5c5c5c]">Solana Devnet</div>
              </div>
            </div>
            <div className="space-y-3 border-t border-[#d3d3d3] pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-[#5c5c5c]">Network</span>
                <span className="text-sm text-[#212121]">Solana Devnet</span>
              </div>
              {p.description && (
                <div className="flex justify-between">
                  <span className="text-sm text-[#5c5c5c]">Description</span>
                  <span className="text-sm text-[#212121]">
                    {p.description}
                  </span>
                </div>
              )}
              {p.isPrivate && (
                <div className="flex justify-between">
                  <span className="text-sm text-[#5c5c5c]">Privacy</span>
                  <span className="text-sm text-[#34c759] flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Private Transaction
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6"
          >
            <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider font-semibold">
              Transaction Signature
            </span>
            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider">
                  Tx Signature
                </span>
                <div className="flex items-center gap-2 mt-1.5 rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] px-3 py-2">
                  <code className="flex-1 truncate text-xs text-[#5c5c5c] font-mono">
                    {p.txSignature}
                  </code>
                  <button
                    onClick={() => copySig(p.txSignature)}
                    className="shrink-0 text-[#5c5c5c] hover:text-[#34c759] transition-colors"
                  >
                    {copiedSig ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider">
                    From (Payer)
                  </span>
                  <div className="text-xs text-[#5c5c5c] font-mono mt-1">
                    {shortenAddress(p.customerWallet)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider">
                    To (Merchant)
                  </span>
                  <div className="text-sm font-medium text-[#212121] mt-1">
                    {p.merchantName}
                  </div>
                  <div className="text-xs text-[#5c5c5c] font-mono">
                    {shortenAddress(p.merchantWallet)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={explorerUrl(p.txSignature)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#34c759] p-4 flex items-center justify-center gap-2 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View on Solana Explorer
          </a>
          <button
            onClick={() => copySig(p.txSignature)}
            className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-4 flex items-center justify-center gap-2 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors"
          >
            <Copy className="h-4 w-4" />
            {copiedSig ? "Copied!" : "Copy Signature"}
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Settlements</h1>
          <p className="mt-0.5 text-sm text-[#5c5c5c]">
            All on-chain payments received by your wallet
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d3d3d3] px-4 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Settled",
            value: `$${totalSettled.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}`,
            color: "#34c759",
          },
          {
            label: "Transactions",
            value: payments.length.toString(),
            color: "#34c759",
          },
          {
            label: "Completed",
            value: payments
              .filter((p) => p.status === "completed")
              .length.toString(),
            color: "#34c759",
          },
          {
            label: "Pending",
            value: payments
              .filter((p) => p.status === "pending")
              .length.toString(),
            color: payments.some((p) => p.status === "pending")
              ? "#f59e0b"
              : "#8a8a8a",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-4"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
              {stat.label}
            </span>
            <p className="mt-1 text-xl font-bold text-[#212121]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" />
          <input
            type="text"
            placeholder="Search by signature, wallet, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] py-2.5 pl-10 pr-4 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#5c5c5c]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] py-2.5 pl-3 pr-8 text-sm text-[#212121] outline-none appearance-none cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-[#ffffff] border border-[#d3d3d3]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-[#5c5c5c]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading settlements...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-[#5c5c5c]" />
            <h3 className="mb-2 font-semibold text-[#212121]">
              {payments.length === 0
                ? "No settlements yet"
                : "No matching settlements"}
            </h3>
            <p className="text-sm text-[#5c5c5c]">
              {payments.length === 0
                ? "Settlements will appear here when payments are received on-chain."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d3d3d3] bg-[#f7f7f7]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Tx
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelected(p)}
                    className="group cursor-pointer transition-colors hover:bg-[#f2f2f2] border-b border-[#d3d3d3] last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-[#212121]">
                        {formatDate(p.completedAt)}
                      </div>
                      <div className="text-[11px] text-[#8a8a8a]">
                        {formatTime(p.completedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-mono text-[#5c5c5c]">
                        {shortenAddress(p.customerWallet)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#212121]">
                        {p.description || "Payment"}
                      </span>
                      {p.isPrivate && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#34c759]/10 border border-[#34c759]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#34c759] uppercase">
                          <Shield className="h-2.5 w-2.5" />
                          Private
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono font-semibold text-[#212121]">
                        $
                        {p.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <div className="text-[11px] text-[#8a8a8a]">
                        {p.currency}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
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
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={explorerUrl(p.txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View transaction on Solana Explorer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#34c759] hover:text-[#2ba048] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-[#8a8a8a] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
