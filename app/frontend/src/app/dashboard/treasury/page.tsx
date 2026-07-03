"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { explorerUrl } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  RefreshCw,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Home,
  ChevronRight,
  ExternalLink,
  LogIn,
} from "lucide-react";

interface Balance {
  available: number;
  pending: number;
  reserved: number;
  total: number;
}

interface Lifetime {
  totalDeposited: number;
  totalPayouts: number;
  totalFees: number;
  totalWithdrawn: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  payoutId?: string;
  txSignature?: string;
  description?: string;
  balanceAfter: number;
  createdAt: string;
}

interface DepositInfo {
  depositAddress: string;
  usdcMint: string;
  network: string;
  cluster: string;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const TX_TYPE_LABELS: Record<
  string,
  { label: string; color: string; icon: typeof ArrowUpRight }
> = {
  deposit: {
    label: "Deposit",
    color: "text-[#34c759]",
    icon: ArrowDownRight,
  },
  payout_reserved: { label: "Reserved", color: "text-[#d29500]", icon: Clock },
  payout_released: {
    label: "Settlement Sent",
    color: "text-[#34c759]",
    icon: ArrowUpRight,
  },
  payout_refund: {
    label: "Refund",
    color: "text-[#34c759]",
    icon: ArrowDownRight,
  },
  fee_deducted: {
    label: "Platform Fee",
    color: "text-[#e74c3c]",
    icon: DollarSign,
  },
  withdrawal: {
    label: "Withdrawal",
    color: "text-[#d29500]",
    icon: ArrowUpRight,
  },
};

export default function TreasuryPage() {
  const { setVisible: openWalletModal } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [fiatView, setFiatView] = useState<{
    availableUSD: number;
    pendingSettlements: number;
    pendingSettlementCount: number;
    settledToBankLifetime: number;
  } | null>(null);
  const [lifetime, setLifetime] = useState<Lifetime | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTx, setDepositTx] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState("");

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/treasury/balance?wallet=${publicKey}&history=true&limit=50`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch balance");
      }
      const data = await res.json();
      setBalance(data.balance);
      setLifetime(data.lifetime);
      setTransactions(data.transactions || []);

      // Virtual ledger: plain-USD framing incl. withdrawals clearing to bank.
      try {
        const fv = await fetch(`/api/treasury/fiat-view?wallet=${publicKey}`);
        if (fv.ok) setFiatView(await fv.json());
      } catch {
        /* non-fatal - the balance cards still render */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const fetchDepositInfo = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch("/api/treasury/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setDepositInfo(data);
    } catch {
      // Silent fail for deposit info
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
      fetchDepositInfo();
    }
  }, [publicKey, fetchBalance, fetchDepositInfo]);

  const handleDeposit = async () => {
    if (!depositTx || !depositAmount || !publicKey) return;
    setDepositing(true);
    setDepositSuccess("");
    setError("");
    try {
      const res = await fetch("/api/treasury/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey,
          amount: parseFloat(depositAmount),
          txSignature: depositTx,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record deposit");
      setDepositSuccess(
        `Deposit of ${formatUSD(data.amount)} credited successfully`,
      );
      setDepositAmount("");
      setDepositTx("");
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setDepositing(false);
    }
  };

  const copyAddress = async () => {
    if (!depositInfo?.depositAddress) return;
    await navigator.clipboard.writeText(depositInfo.depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Not authenticated - show login prompt
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
              <span className="text-[#5c5c5c]">Treasury</span>
            </Link>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Treasury
          </h1>
          <p className="text-[#8a8a8a] mb-8">
            Fund your settlement balance and track deposits.
          </p>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC]">
              <Wallet className="h-6 w-6 text-[#94A3B8]" />
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              Connect your wallet to view your treasury balance.
            </p>
            <button
              onClick={() => openWalletModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#212121] px-5 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#1a2d47] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wallet not connected yet (still loading)
  if (!connected || !publicKey || !balance) {
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
              <span className="text-[#5c5c5c]">Treasury</span>
            </Link>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Treasury
          </h1>
          <p className="text-[#8a8a8a] mb-8">
            Fund your settlement balance and track deposits.
          </p>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
            {loading ? (
              <>
                <RefreshCw className="mx-auto h-8 w-8 text-[#94A3B8] mb-4 animate-spin" />
                <p className="text-sm text-[#64748B]">Loading treasury...</p>
              </>
            ) : (
              <>
                <Wallet className="mx-auto h-8 w-8 text-[#94A3B8] mb-4" />
                <p className="text-sm text-[#64748B]">
                  Waiting for wallet connection...
                </p>
              </>
            )}
            {error && (
              <p className="mt-4 text-sm text-[#e74c3c] flex items-center justify-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#5c5c5c] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#5c5c5c]">Treasury</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Treasury</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">
              Manage your settlement balance
            </p>
          </div>
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:text-[#212121] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Virtual ledger - plain-USD summary. The blockchain is invisible:
            the operator just sees USD available and what's clearing to bank. */}
        {fiatView && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:grid-cols-3"
          >
            <div>
              <div className="text-[13px] text-[#94A3B8]">Available to withdraw</div>
              <div className="mt-1 text-3xl font-bold text-[#212121]">
                {formatUSD(fiatView.availableUSD)}
              </div>
              <div className="mt-1 text-xs text-[#94A3B8]">USD · ready now</div>
            </div>
            <div className="sm:border-l sm:border-[#E2E8F0] sm:pl-6">
              <div className="text-[13px] text-[#94A3B8]">Pending settlements</div>
              <div className="mt-1 text-3xl font-bold text-[#212121]">
                {formatUSD(fiatView.pendingSettlements)}
              </div>
              <div className="mt-1 text-xs text-[#94A3B8]">
                {fiatView.pendingSettlementCount === 0
                  ? "No withdrawals in progress"
                  : `${fiatView.pendingSettlementCount} clearing to your bank`}
              </div>
            </div>
            <div className="sm:border-l sm:border-[#E2E8F0] sm:pl-6">
              <div className="text-[13px] text-[#94A3B8]">Settled to bank</div>
              <div className="mt-1 text-3xl font-bold text-[#212121]">
                {formatUSD(fiatView.settledToBankLifetime)}
              </div>
              <div className="mt-1 text-xs text-[#94A3B8]">Lifetime payouts</div>
            </div>
          </motion.div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] mb-2">
              <Wallet className="h-4 w-4" />
              Available
            </div>
            <div className="text-2xl font-semibold text-[#212121]">
              {formatUSD(balance.available)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">
              Ready for settlements
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] mb-2">
              <Clock className="h-4 w-4" />
              Reserved
            </div>
            <div className="text-2xl font-semibold text-[#212121]">
              {formatUSD(balance.reserved)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">
              In-flight settlements
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] mb-2">
              <TrendingUp className="h-4 w-4" />
              Total Deposited
            </div>
            <div className="text-2xl font-semibold text-[#212121]">
              {formatUSD(lifetime?.totalDeposited || 0)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">Lifetime deposits</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] mb-2">
              <DollarSign className="h-4 w-4" />
              Total Fees
            </div>
            <div className="text-2xl font-semibold text-[#212121]">
              {formatUSD(lifetime?.totalFees || 0)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">1% platform fee</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Deposit + Fund */}
          <div className="lg:col-span-1 space-y-6">
            {/* Deposit Address */}
            {depositInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#E2E8F0] bg-white p-6"
              >
                <h3 className="text-sm font-semibold text-[#212121] mb-4">
                  Fund Your Balance
                </h3>
                <p className="text-xs text-[#94A3B8] mb-3">
                  Send USDC to this address on Solana {depositInfo.cluster}:
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                  <code className="flex-1 text-xs text-[#212121] break-all font-mono">
                    {depositInfo.depositAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    aria-label={
                      copied ? "Address copied" : "Copy deposit address"
                    }
                    className="shrink-0 text-[#94A3B8] hover:text-[#212121] transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-[#34c759]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-xs text-[#94A3B8]">
                  Network: Solana • Token: USDC
                </div>
              </motion.div>
            )}

            {/* Record Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6"
            >
              <h3 className="text-sm font-semibold text-[#212121] mb-4">
                Confirm Deposit
              </h3>
              <p className="text-xs text-[#94A3B8] mb-4">
                After sending USDC, enter the transaction signature to credit
                your balance.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#212121] placeholder-[#94A3B8] focus:border-[#212121] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">
                    Transaction Signature
                  </label>
                  <input
                    type="text"
                    value={depositTx}
                    onChange={(e) => setDepositTx(e.target.value)}
                    placeholder="5Uh8..."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#212121] placeholder-[#94A3B8] focus:border-[#212121] focus:outline-none font-mono"
                  />
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount || !depositTx}
                  className="w-full rounded-lg bg-[#212121] px-4 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#1a2d47] disabled:opacity-40 transition-colors"
                >
                  {depositing ? "Verifying..." : "Confirm Deposit"}
                </button>
                {depositSuccess && (
                  <p className="text-xs text-[#34c759] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    {depositSuccess}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-[#e74c3c] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Transaction History */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[#E2E8F0] bg-white"
            >
              <div className="border-b border-[#F1F5F9] px-6 py-4">
                <h3 className="text-sm font-semibold text-[#212121]">
                  Transaction History
                </h3>
              </div>

              {transactions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Wallet className="mx-auto h-8 w-8 text-[#CBD5E1] mb-3" />
                  <p className="text-sm text-[#64748B]">No transactions yet</p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Fund your balance to start sending settlements
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {transactions.map((tx) => {
                    const meta = TX_TYPE_LABELS[tx.type] || {
                      label: tx.type,
                      color: "text-[#5c5c5c]",
                      icon: DollarSign,
                    };
                    const Icon = meta.icon;
                    const isCredit = ["deposit", "payout_refund"].includes(
                      tx.type,
                    );

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div
                          className={`rounded-lg p-2 ${
                            isCredit ? "bg-[#34c759]/10" : "bg-[#F8FAFC]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${meta.color}`}
                            >
                              {meta.label}
                            </span>
                            {tx.payoutId && (
                              <span className="text-xs text-[#94A3B8] truncate">
                                {tx.payoutId}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#94A3B8] mt-0.5">
                            {tx.description || tx.type}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={`text-sm font-medium ${
                              isCredit ? "text-[#34c759]" : "text-[#212121]"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatUSD(tx.amount)}
                          </div>
                          <div className="text-xs text-[#94A3B8]">
                            {new Date(tx.createdAt).toLocaleDateString()}{" "}
                            {new Date(tx.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        {tx.txSignature && (
                          <a
                            href={explorerUrl(tx.txSignature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#CBD5E1] hover:text-[#64748B] transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
