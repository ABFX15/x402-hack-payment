"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useWalletSession } from "@/hooks/useWalletSession";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Key,
  LogIn,
  RefreshCw,
  Loader2,
  X,
  ChevronRight,
  Download,
  Activity,
  BarChart3,
  ArrowDownToLine,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Transaction, PublicKey } from "@solana/web3.js";
import {
  buildVaultTransactionApprove,
  buildVaultTransactionExecute,
} from "@/lib/squads";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TreasuryData {
  treasuryBalance: number;
  treasuryBalanceRaw: string;
  platformConfig: {
    authority: string;
    feeBps: number;
    isActive: boolean;
    totalVolume: string;
    totalFees: string;
    usdcMint: string;
  } | null;
  treasuryPDA: string;
  configPDA: string;
  programId: string;
  cluster: string;
}

interface PipelineHealthData {
  status: "healthy" | "degraded" | "down";
  pendingEvents: number;
  oldestPendingAge: number | null;
  eventsProcessedLast24h: number;
  storage: "supabase" | "memory";
}

interface PlatformStatsData {
  totals?: {
    paymentsVolume?: number;
    feesCollected?: number;
    invoicesCreated?: number;
    invoicesPaid?: number;
    newMerchants?: number;
  };
}

interface MultisigMember {
  key: string;
  permissions: number;
}
interface MultisigPendingProposal {
  transactionIndex: string;
  status: string;
  approvers: string[];
  rejectors: string[];
}
interface MultisigInfo {
  enabled: boolean;
  multisigPda?: string;
  vaultPda?: string;
  threshold?: number;
  members?: MultisigMember[];
  transactionIndex?: string;
  onChainAuthority?: string;
  authorityMatches?: boolean;
  pendingProposals?: MultisigPendingProposal[];
  error?: string;
}

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

function formatLamports(lamports: string): string {
  const n = parseInt(lamports, 10);
  if (isNaN(n)) return "$0.00";
  return formatUSD(n / 1_000_000); // USDC has 6 decimals
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Component - Completely standalone. Uses admin secret + direct Phantom.
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { connection } = useConnection();
  const {
    publicKey: connectedPublicKey,
    connected: walletConnected,
    signTransaction,
    disconnect,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const publicKey = connectedPublicKey?.toBase58() ?? null;

  // Wallet-session sign-in (sets settlr_session cookie). Once ready, all
  // /api/admin/* requests are auto-authed by cookie.
  const { status: sessionStatus, error: sessionError } = useWalletSession();

  // Admin gate: ask the server whether this signed-in wallet is on the
  // ADMIN_WALLETS env list. We only render the dashboard if so.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [data, setData] = useState<TreasuryData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimTxSig, setClaimTxSig] = useState<string | null>(null);

  // Platform multisig state (Squads-gated treasury)
  const [multisigInfo, setMultisigInfo] = useState<MultisigInfo | null>(null);
  const [multisigLoading, setMultisigLoading] = useState(false);
  const [approvingIdx, setApprovingIdx] = useState<string | null>(null);
  const [executingIdx, setExecutingIdx] = useState<string | null>(null);

  // Waitlist management state
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantWallet, setGrantWallet] = useState("");
  const [grantStatus, setGrantStatus] = useState<"invited" | "active">(
    "invited",
  );
  const [granting, setGranting] = useState(false);
  const [waitlistSearch, setWaitlistSearch] = useState("");

  const [opsHealth, setOpsHealth] = useState<PipelineHealthData | null>(null);
  const [opsStats, setOpsStats] = useState<PlatformStatsData | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);

  // ── Admin gate (wallet-based) ─────────────────────────────────────────
  // After the wallet session is ready we ask the server whether this wallet
  // is on the ADMIN_WALLETS list. The dashboard only renders if so.
  useEffect(() => {
    if (sessionStatus !== "ready") {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (cancelled) return;
        if (!res.ok) {
          setAdminCheckError(`Admin check failed (${res.status})`);
          setIsAdmin(false);
          return;
        }
        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
        setAdminCheckError(null);
      } catch (err) {
        if (cancelled) return;
        setAdminCheckError(
          err instanceof Error ? err.message : "Admin check failed",
        );
        setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, publicKey]);

  // Force-unselect any previously-chosen wallet so wallet-adapter's
  // autoConnect won't immediately reconnect to it (e.g. Phantom) when the
  // picker opens. wallet-adapter caches the chosen wallet name in
  // localStorage AND in an in-memory React state - calling select(null)
  // alone leaves stale state behind, so the cleanest "switch wallet" is
  // to wipe storage and hard-reload the page with ?pick=1 so the modal
  // re-opens automatically with no wallet pre-selected.
  const hardResetAndPickWallet = () => {
    try {
      localStorage.removeItem("walletName");
      sessionStorage.removeItem("walletName");
    } catch {}
    // Also tell the wallet extension itself to disconnect so it doesn't
    // silently re-grant the next page load.
    disconnect().catch(() => undefined);
    // Use replace so back-button doesn't loop.
    window.location.replace("/admin?pick=1");
  };

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/wallet/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    hardResetAndPickWallet();
  };

  // ── Wallet adapter connect/disconnect (lets user choose wallet) ──────
  const connectWallet = () => {
    setError(null);
    hardResetAndPickWallet();
  };

  // Sign out current admin session AND open the wallet picker so the user
  // can sign in with a different wallet (e.g. Phantom → Solflare).
  const switchWallet = async () => {
    try {
      await fetch("/api/auth/wallet/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    hardResetAndPickWallet();
  };

  // After a hard-reset reload (?pick=1) we land here with no wallet
  // selected. Auto-open the picker.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("pick") === "1" && !walletConnected) {
      setVisible(true);
      // Strip the query param so a manual refresh doesn't keep nagging.
      const url = new URL(window.location.href);
      url.searchParams.delete("pick");
      window.history.replaceState({}, "", url.toString());
    }
  }, [walletConnected, setVisible]);

  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch {}
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Fetch on-chain data ──────────────────────────────────────────────
  const fetchTreasuryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/treasury");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json: TreasuryData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to fetch treasury data:", err);
      setError(err.message || "Failed to load platform data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTreasuryData();
  }, [fetchTreasuryData]);

  // ── Multisig info ────────────────────────────────────────────────────
  const fetchMultisigInfo = useCallback(async () => {
    setMultisigLoading(true);
    try {
      const res = await fetch("/api/admin/multisig/info", {
        credentials: "include",
      });
      if (!res.ok) {
        // 401/403 just means we're not yet admin - silently ignore
        setMultisigInfo(null);
        return;
      }
      const json: MultisigInfo = await res.json();
      setMultisigInfo(json);
    } catch (err) {
      console.error("Failed to fetch multisig info:", err);
      setMultisigInfo(null);
    } finally {
      setMultisigLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchMultisigInfo();
  }, [isAdmin, fetchMultisigInfo]);

  // Approve a pending vault-tx proposal (member casts their vote)
  const handleApproveProposal = async (transactionIndex: string) => {
    if (!connectedPublicKey || !signTransaction || !multisigInfo?.multisigPda) {
      setError("Connect a wallet first");
      return;
    }
    setApprovingIdx(transactionIndex);
    setError(null);
    setSuccess(null);
    try {
      const tx = await buildVaultTransactionApprove({
        connection,
        multisigPda: new PublicKey(multisigInfo.multisigPda),
        member: connectedPublicKey,
        transactionIndex: BigInt(transactionIndex),
      });
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction(sig, "confirmed");
      setSuccess(`Approved proposal #${transactionIndex}`);
      fetchMultisigInfo();
    } catch (err: any) {
      console.error("Approve error:", err);
      setError(err.message || "Failed to approve proposal");
    } finally {
      setApprovingIdx(null);
    }
  };

  // Execute an approved vault-tx proposal (anyone can call once threshold met)
  const handleExecuteProposal = async (transactionIndex: string) => {
    if (!connectedPublicKey || !signTransaction || !multisigInfo?.multisigPda) {
      setError("Connect a wallet first");
      return;
    }
    setExecutingIdx(transactionIndex);
    setError(null);
    setSuccess(null);
    try {
      const tx = await buildVaultTransactionExecute({
        connection,
        multisigPda: new PublicKey(multisigInfo.multisigPda),
        executor: connectedPublicKey,
        transactionIndex: BigInt(transactionIndex),
      });
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction(sig, "confirmed");
      setSuccess(
        `Executed proposal #${transactionIndex} - funds transferred to vault USDC ATA`,
      );
      fetchTreasuryData();
      fetchMultisigInfo();
    } catch (err: any) {
      console.error("Execute error:", err);
      setError(err.message || "Failed to execute proposal");
    } finally {
      setExecutingIdx(null);
    }
  };

  const fetchOperationalData = useCallback(async () => {
    setOpsLoading(true);
    try {
      const [healthRes, statsRes] = await Promise.all([
        fetch("/api/pipeline/health"),
        fetch("/api/pipeline/stats?scope=platform&days=7"),
      ]);

      if (healthRes.ok) {
        const health = await healthRes.json();
        setOpsHealth(health);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setOpsStats(stats);
      }
    } catch {
      // Non-blocking: admin page should still render treasury + waitlist.
    } finally {
      setOpsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperationalData();
  }, [fetchOperationalData]);

  // ── Waitlist management ──────────────────────────────────────────────
  // All admin requests rely on the settlr_session cookie set by
  // useWalletSession + the server's requireAdmin() check.
  const fetchWaitlist = useCallback(async () => {
    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/admin/waitlist", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized or failed");
      const json = await res.json();
      setWaitlistEntries(json.entries || []);
    } catch (err: any) {
      console.error("Failed to fetch waitlist:", err);
      setError("Failed to load waitlist.");
    } finally {
      setWaitlistLoading(false);
    }
  }, []);

  // Auto-load waitlist once authed as admin
  useEffect(() => {
    if (isAdmin) {
      fetchWaitlist();
    }
  }, [isAdmin, fetchWaitlist]);

  const handleApprove = async (email: string) => {
    setApprovingEmail(email);
    setError(null);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, status: "invited" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to approve");
      }
      const result = await res.json();
      if (result.emailSent === false) {
        setError(
          `Approved ${email} but email failed to send. Check RESEND_API_KEY on Vercel.`,
        );
      } else {
        setSuccess(`Approved ${email} - invite email sent!`);
      }
      fetchWaitlist();
    } catch (err: any) {
      setError(err.message || "Failed to approve entry");
    } finally {
      setApprovingEmail(null);
    }
  };

  const handleGrantAccess = async () => {
    const email = grantEmail.trim().toLowerCase();
    const walletAddress = grantWallet.trim();

    if (!email) {
      setError("Email is required to grant access");
      return;
    }

    setGranting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          status: grantStatus,
          walletAddress: walletAddress || undefined,
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to grant access");
      }

      setSuccess(`Granted ${grantStatus} access for ${email}`);
      setGrantEmail("");
      setGrantWallet("");
      fetchWaitlist();
    } catch (err: any) {
      setError(err.message || "Failed to grant access");
    } finally {
      setGranting(false);
    }
  };

  // ── Claim fees ───────────────────────────────────────────────────────
  const handleClaimFees = async () => {
    if (!publicKey || !walletConnected || !signTransaction) {
      setError("Connect a wallet first");
      return;
    }

    setClaiming(true);
    setError(null);
    setSuccess(null);
    setClaimTxSig(null);

    try {
      // 1. Ask server to build the unsigned transaction
      const res = await fetch("/api/admin/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authority: publicKey }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to build claim tx");

      // 2. Deserialize the transaction
      const txBuffer = Buffer.from(body.transaction, "base64");
      const tx = Transaction.from(txBuffer);

      // 3. Sign with selected wallet via wallet-adapter
      const signedTx = await signTransaction(tx);

      // 4. Send the signed transaction
      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      // 5. Confirm
      await connection.confirmTransaction(sig, "confirmed");

      setClaimTxSig(sig);
      setSuccess(
        body.mode === "multisig"
          ? `Claim proposal #${body.transactionIndex} created - needs ${body.threshold}/${body.memberCount} approvals before it can execute. Funds will land in the multisig vault USDC ATA.`
          : `Claimed ${formatUSD(
              body.amount,
            )} USDC! Funds sent to your wallet.`,
      );

      // Refresh data
      fetchTreasuryData();
      if (body.mode === "multisig") fetchMultisigInfo();
    } catch (err: any) {
      console.error("Claim error:", err);
      if (err.message?.includes("User rejected")) {
        setError("Transaction cancelled by user");
      } else if (err.message?.includes("Unauthorized")) {
        setError("Your wallet is not the platform authority");
      } else {
        setError(err.message || "Failed to claim fees");
      }
    } finally {
      setClaiming(false);
    }
  };

  const isMultisigMode = Boolean(
    multisigInfo?.enabled && multisigInfo?.authorityMatches,
  );
  const isMultisigMember = Boolean(
    isMultisigMode &&
      publicKey &&
      multisigInfo?.members?.some((m) => m.key === publicKey),
  );
  const isAuthority =
    publicKey &&
    (data?.platformConfig?.authority === publicKey || isMultisigMember);

  const explorerBase =
    data?.cluster === "mainnet-beta"
      ? "https://explorer.solana.com"
      : "https://explorer.solana.com";
  const clusterParam =
    data?.cluster === "mainnet-beta"
      ? ""
      : `?cluster=${data?.cluster || "devnet"}`;

  // ── Loading / not ready ───────────────────────────────────────────────
  // Three gates, in order:
  //   1. Wallet not connected → prompt connect
  //   2. Wallet connected but session not yet established → spinner
  //   3. Session ready but wallet is not on ADMIN_WALLETS → forbidden
  // Only after all three pass do we render the dashboard.
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-[#FFFFFF]">
        <div className="max-w-md mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#34c759]/10 flex items-center justify-center border border-[#34c759]/20">
              <Key className="w-10 h-10 text-[#34c759]" />
            </div>
            <h1 className="text-3xl font-bold text-[#212121] mb-4">
              Platform Admin
            </h1>
            <p className="text-[#8a8a8a] mb-8">
              Connect an admin wallet to access the dashboard.
            </p>
            <button
              onClick={connectWallet}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#34c759] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#155a3e] transition-all"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (sessionStatus !== "ready" || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-[#34c759] animate-spin" />
          <p className="text-[#5c5c5c] text-sm">
            {sessionStatus === "signing"
              ? "Sign the message in your wallet to authenticate…"
              : "Verifying admin access…"}
          </p>
          {sessionError && (
            <p className="text-[#e74c3c] text-sm mt-3">{sessionError}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FFFFFF]">
        <div className="max-w-md mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#e74c3c]/10 flex items-center justify-center border border-[#e74c3c]/20">
              <ShieldAlert className="w-10 h-10 text-[#e74c3c]" />
            </div>
            <h1 className="text-3xl font-bold text-[#212121] mb-3">
              Not authorized
            </h1>
            <p className="text-[#8a8a8a] mb-2 font-mono text-sm">
              {publicKey ? shortenAddress(publicKey) : ""}
            </p>
            <p className="text-[#8a8a8a] mb-8">
              This wallet is not on the platform admin list. Add it to the{" "}
              <code className="px-1.5 py-0.5 rounded bg-[#f2f2f2] text-[#212121]">
                ADMIN_WALLETS
              </code>{" "}
              env var, or sign in with a different wallet.
            </p>
            {adminCheckError && (
              <p className="text-[#e74c3c] text-sm mb-4">{adminCheckError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={switchWallet}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#212121] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#000] transition-all"
              >
                <Wallet className="w-4 h-4" />
                Switch wallet
              </button>
              <button
                onClick={handleAdminLogout}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f2f2f2] text-[#212121] px-6 py-3 rounded-xl font-medium hover:bg-[#e5e5e5] transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
            <Link
              href="/dashboard"
              className="mt-3 inline-flex items-center justify-center gap-2 text-[#8a8a8a] hover:text-[#212121] text-sm transition-colors"
            >
              ← Merchant dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <header className="border-b border-[#d3d3d3] bg-[#FFFFFF]/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#34c759] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#212121]" />
              </div>
              <span className="text-xl font-bold text-[#34c759]">
                Offbank Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                fetchTreasuryData();
                fetchOperationalData();
                fetchWaitlist();
              }}
              disabled={loading}
              className="p-2 rounded-lg bg-[#f2f2f2] hover:bg-[#f2f2f2] border border-[#d3d3d3] transition-all"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 text-[#8a8a8a] ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
            {publicKey ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f2f2f2] border border-[#d3d3d3]">
                <Wallet className="w-4 h-4 text-[#34c759]" />
                <span className="text-sm text-[#5c5c5c]">
                  {shortenAddress(publicKey)}
                </span>
                {isAuthority && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#34c759]/15 text-[#34c759] text-xs font-medium">
                    Authority
                  </span>
                )}
                <button
                  onClick={disconnectWallet}
                  className="ml-1 p-1 rounded hover:bg-[#d3d3d3] transition-colors"
                  title="Disconnect wallet"
                >
                  <X className="w-3.5 h-3.5 text-[#8a8a8a]" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#34c759] text-white text-sm font-medium hover:bg-[#155a3e] transition-all"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
            <button
              onClick={handleAdminLogout}
              className="p-2 rounded-lg hover:bg-[#f2f2f2] border border-[#d3d3d3] transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-[#8a8a8a]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-[#e74c3c]/10 border border-[#e74c3c]/20 flex items-center gap-3"
            >
              <X className="w-5 h-5 text-[#e74c3c] shrink-0" />
              <span className="text-[#e74c3c]/70 flex-1">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4 text-[#e74c3c]" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-[#34c759]/10 border border-[#34c759]/20"
            >
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#34c759] shrink-0" />
                <span className="text-[#34c759] flex-1">{success}</span>
                <button onClick={() => setSuccess(null)} className="ml-auto">
                  <X className="w-4 h-4 text-[#34c759]" />
                </button>
              </div>
              {claimTxSig && (
                <a
                  href={`${explorerBase}/tx/${claimTxSig}${clusterParam}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 ml-8 text-sm text-[#34c759] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on Explorer
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authority Warning */}
        {data?.platformConfig && !isAuthority && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-[#d29500]/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d29500]/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-[#d29500]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#212121] mb-1">
                  Read-Only Mode
                </h2>
                <p className="text-sm text-[#8a8a8a] mb-2">
                  Your wallet is not the platform authority. You can view
                  treasury data but cannot claim fees.
                </p>
                <p className="text-xs text-[#8a8a8a]">
                  Authority:{" "}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded">
                    {data.platformConfig.authority}
                  </code>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Treasury Balance + Claim */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-[#34c759]/[0.06] border border-[#8e24aa]/20 p-6 md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#34c759]/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-[#34c759]/15 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#34c759]" />
                </div>
                <div>
                  <p className="text-sm text-[#8a8a8a]">Treasury Balance</p>
                  {loading ? (
                    <div className="h-8 w-32 bg-white/10 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-[#212121]">
                      {formatUSD(data?.treasuryBalance ?? 0)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#8a8a8a] mb-5 ml-15">
                USDC accumulated from platform fees
              </p>

              <button
                onClick={handleClaimFees}
                disabled={
                  claiming ||
                  loading ||
                  !isAuthority ||
                  (data?.treasuryBalance ?? 0) === 0
                }
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isAuthority && (data?.treasuryBalance ?? 0) > 0
                    ? "bg-[#34c759] text-[#212121] hover:bg-[#9371e8] cursor-pointer"
                    : "bg-[#f2f2f2] text-[#8a8a8a] cursor-not-allowed"
                }`}
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isMultisigMode ? "Proposing..." : "Claiming..."}
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    {!isAuthority
                      ? isMultisigMode
                        ? "Connect a Multisig Member Wallet"
                        : "Connect Authority Wallet to Claim"
                      : isMultisigMode
                      ? `Propose Claim of ${formatUSD(
                          data?.treasuryBalance ?? 0,
                        )}`
                      : `Claim ${formatUSD(
                          data?.treasuryBalance ?? 0,
                        )} to Wallet`}
                  </>
                )}
              </button>
              {isAuthority && (data?.treasuryBalance ?? 0) > 0 && (
                <p className="text-xs text-[#8a8a8a] mt-2 text-center">
                  {isMultisigMode
                    ? `Creates a Squads proposal - needs ${multisigInfo?.threshold}/${multisigInfo?.members?.length} approvals before funds move to the vault USDC ATA`
                    : "Signs a transaction to transfer USDC from treasury PDA to your wallet"}
                </p>
              )}
            </div>
          </motion.div>

          {/* Platform Multisig (only when configured) */}
          {multisigInfo?.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6 md:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#8a8a8a]">Platform Multisig</p>
                  <p className="text-xl font-bold text-[#212121]">
                    {multisigInfo.threshold ?? "?"}-of-
                    {multisigInfo.members?.length ?? "?"} Squads vault
                  </p>
                </div>
                {!multisigInfo.authorityMatches && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                    Authority drift - vault PDA does not match on-chain
                    authority. Run setup script.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-[#8a8a8a] mb-1">
                    Vault PDA (USDC recipient)
                  </p>
                  <code className="text-xs text-[#212121] break-all">
                    {multisigInfo.vaultPda}
                  </code>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] mb-1">Multisig PDA</p>
                  <code className="text-xs text-[#212121] break-all">
                    {multisigInfo.multisigPda}
                  </code>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs text-[#8a8a8a] mb-2">Members</p>
                <div className="space-y-1.5">
                  {multisigInfo.members?.map((m) => (
                    <div
                      key={m.key}
                      className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 text-xs"
                    >
                      <code className="text-[#212121] break-all">{m.key}</code>
                      {publicKey === m.key && (
                        <span className="ml-2 text-purple-600 font-semibold whitespace-nowrap">
                          you
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending proposals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#212121]">
                    Pending proposals
                  </p>
                  <button
                    onClick={fetchMultisigInfo}
                    disabled={multisigLoading}
                    className="text-xs text-[#8a8a8a] hover:text-[#212121] flex items-center gap-1"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${
                        multisigLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
                {(!multisigInfo.pendingProposals ||
                  multisigInfo.pendingProposals.length === 0) && (
                  <p className="text-xs text-[#8a8a8a] py-3">
                    No pending proposals
                  </p>
                )}
                {multisigInfo.pendingProposals?.map((p) => {
                  const callerHasApproved = publicKey
                    ? p.approvers.includes(publicKey)
                    : false;
                  const isApproved = p.status === "approved";
                  const threshold = multisigInfo.threshold ?? 0;
                  return (
                    <div
                      key={p.transactionIndex}
                      className="bg-white/60 rounded-lg p-3 mb-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-[#212121]">
                            Proposal #{p.transactionIndex}
                          </p>
                          <p className="text-xs text-[#8a8a8a]">
                            {p.approvers.length}/{threshold} approvals · status:{" "}
                            <span
                              className={
                                isApproved
                                  ? "text-green-700 font-semibold"
                                  : "text-amber-700"
                              }
                            >
                              {p.status}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!isApproved &&
                            isMultisigMember &&
                            !callerHasApproved && (
                              <button
                                onClick={() =>
                                  handleApproveProposal(p.transactionIndex)
                                }
                                disabled={approvingIdx === p.transactionIndex}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1"
                              >
                                {approvingIdx === p.transactionIndex ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                            )}
                          {!isApproved && callerHasApproved && (
                            <span className="px-3 py-1.5 rounded-lg text-xs text-purple-600 bg-purple-100">
                              You approved
                            </span>
                          )}
                          {isApproved && isMultisigMember && (
                            <button
                              onClick={() =>
                                handleExecuteProposal(p.transactionIndex)
                              }
                              disabled={executingIdx === p.transactionIndex}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#34c759] text-[#212121] hover:bg-[#2ba948] disabled:opacity-50 flex items-center gap-1"
                            >
                              {executingIdx === p.transactionIndex ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ArrowDownToLine className="w-3 h-3" />
                              )}
                              Execute
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Platform Fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-[#8a8a8a]">Platform Fee</p>
                {loading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-[#212121]">
                    {data?.platformConfig
                      ? `${(data.platformConfig.feeBps / 100).toFixed(1)}%`
                      : "-"}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-[#8a8a8a]">
              Fee collected from each payment
            </p>
          </motion.div>

          {/* Platform Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  data?.platformConfig?.isActive
                    ? "bg-[#34c759]/15"
                    : "bg-[#e74c3c]/20"
                }`}
              >
                <Activity
                  className={`w-6 h-6 ${
                    data?.platformConfig?.isActive
                      ? "text-[#34c759]"
                      : "text-[#e74c3c]"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-[#8a8a8a]">Status</p>
                {loading ? (
                  <div className="h-8 w-20 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-[#212121]">
                    {data?.platformConfig?.isActive ? "Active" : "Inactive"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  data?.platformConfig?.isActive
                    ? "bg-[#34c759]"
                    : "bg-[#e74c3c]/80"
                } animate-pulse`}
              />
              <span className="text-sm text-[#8a8a8a]">
                {data?.platformConfig?.isActive
                  ? "Processing payments"
                  : "Payments paused"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Lifetime Stats */}
        {data?.platformConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <div className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-[#34c759]" />
                <span className="text-sm text-[#8a8a8a]">
                  Lifetime Volume (on-chain)
                </span>
              </div>
              <p className="text-2xl font-bold text-[#212121]">
                {formatLamports(data.platformConfig.totalVolume)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-[#8a8a8a]">
                  Lifetime Fees Collected (on-chain)
                </span>
              </div>
              <p className="text-2xl font-bold text-[#212121]">
                {formatLamports(data.platformConfig.totalFees)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Ops Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6">
            <p className="text-sm text-[#8a8a8a] mb-2">Pipeline Health</p>
            <p className="text-2xl font-bold text-[#212121]">
              {opsLoading ? "…" : opsHealth?.status || "unknown"}
            </p>
            <p className="text-xs text-[#8a8a8a] mt-2">
              Storage: {opsHealth?.storage || "-"}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6">
            <p className="text-sm text-[#8a8a8a] mb-2">Pending Events</p>
            <p className="text-2xl font-bold text-[#212121]">
              {opsLoading
                ? "…"
                : (opsHealth?.pendingEvents ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-[#8a8a8a] mt-2">
              Last 24h processed:{" "}
              {(opsHealth?.eventsProcessedLast24h ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6">
            <p className="text-sm text-[#8a8a8a] mb-2">7d Platform Fees</p>
            <p className="text-2xl font-bold text-[#212121]">
              {formatUSD(opsStats?.totals?.feesCollected || 0)}
            </p>
            <p className="text-xs text-[#8a8a8a] mt-2">
              7d volume: {formatUSD(opsStats?.totals?.paymentsVolume || 0)}
            </p>
          </div>
        </motion.div>

        {/* On-Chain Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-[#212121] mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#34c759]" />
            On-Chain Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Platform Authority",
                value: data?.platformConfig?.authority || "Loading...",
                id: "authority",
              },
              {
                label: "Treasury PDA",
                value: data?.treasuryPDA || "Loading...",
                id: "treasury",
              },
              {
                label: "USDC Mint",
                value: data?.platformConfig?.usdcMint || "Loading...",
                id: "mint",
              },
              {
                label: "Program ID",
                value: data?.programId || "Loading...",
                id: "program",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#FFFFFF]/30 border border-[#d3d3d3]"
              >
                <span className="text-sm text-[#8a8a8a] block mb-2">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-[#212121] font-mono flex-1 truncate">
                    {item.value}
                  </code>
                  <button
                    onClick={() => copyToClipboard(item.value, item.id)}
                    className="p-2 rounded-lg hover:bg-[#f2f2f2] transition-colors shrink-0"
                    title="Copy"
                  >
                    {copied === item.id ? (
                      <Check className="w-4 h-4 text-[#34c759]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#8a8a8a]" />
                    )}
                  </button>
                  <a
                    href={`${explorerBase}/address/${item.value}${clusterParam}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-[#f2f2f2] transition-colors shrink-0"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#8a8a8a]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/dashboard"
            className="p-4 rounded-xl bg-[#f2f2f2] border border-[#d3d3d3] hover:bg-[#f2f2f2] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-[#8a8a8a]" />
              <span className="text-[#212121]">Merchant Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a8a8a] group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/docs"
            className="p-4 rounded-xl bg-[#f2f2f2] border border-[#d3d3d3] hover:bg-[#f2f2f2] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-[#8a8a8a]" />
              <span className="text-[#212121]">API Documentation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a8a8a] group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={`${explorerBase}/address/${
              data?.programId || ""
            }${clusterParam}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-[#f2f2f2] border border-[#d3d3d3] hover:bg-[#f2f2f2] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-[#8a8a8a]" />
              <span className="text-[#212121]">Program on Explorer</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a8a8a] group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* ── Waitlist Management ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 rounded-2xl bg-[#f2f2f2] border border-[#d3d3d3] p-6"
        >
          <h2 className="text-xl font-bold text-[#212121] mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#34c759]" />
            Waitlist Management
          </h2>

          <div className="mb-6 rounded-xl bg-[#FFFFFF] border border-[#d3d3d3] p-4">
            <p className="text-sm font-semibold text-[#212121] mb-3">
              Grant Access
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="customer@company.com"
                className="px-3 py-2 rounded-lg border border-[#d3d3d3] bg-white text-[#212121]"
              />
              <input
                type="text"
                value={grantWallet}
                onChange={(e) => setGrantWallet(e.target.value)}
                placeholder="Optional wallet (base58)"
                className="px-3 py-2 rounded-lg border border-[#d3d3d3] bg-white text-[#212121]"
              />
              <select
                value={grantStatus}
                onChange={(e) =>
                  setGrantStatus(e.target.value as "invited" | "active")
                }
                className="px-3 py-2 rounded-lg border border-[#d3d3d3] bg-white text-[#212121]"
              >
                <option value="invited">Invited</option>
                <option value="active">Active</option>
              </select>
              <button
                onClick={handleGrantAccess}
                disabled={granting || !grantEmail.trim()}
                className="px-4 py-2 rounded-lg bg-[#34c759] text-white font-medium disabled:opacity-50"
              >
                {granting ? "Granting..." : "Grant Access"}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={waitlistSearch}
              onChange={(e) => setWaitlistSearch(e.target.value)}
              placeholder="Filter by email, name, company, or wallet"
              className="w-full md:w-[420px] px-3 py-2 rounded-lg border border-[#d3d3d3] bg-white text-[#212121]"
            />
          </div>

          {/* Auth for waitlist admin - already authenticated */}
          {waitlistEntries.length === 0 && !waitlistLoading && (
            <div className="text-center py-4">
              <button
                onClick={fetchWaitlist}
                className="px-5 py-2.5 rounded-xl bg-[#34c759] text-white text-sm font-semibold hover:bg-[#155a3e] transition-all"
              >
                Load Waitlist
              </button>
            </div>
          )}

          {waitlistLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#34c759]" />
            </div>
          )}

          {waitlistEntries.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#8a8a8a]">
                  {waitlistEntries.length}{" "}
                  {waitlistEntries.length === 1 ? "entry" : "entries"}
                </p>
                <button
                  onClick={fetchWaitlist}
                  className="text-sm text-[#34c759] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              <div className="space-y-3">
                {waitlistEntries
                  .filter((entry: any) => {
                    const q = waitlistSearch.trim().toLowerCase();
                    if (!q) return true;
                    return [
                      entry.email,
                      entry.name,
                      entry.company,
                      entry.walletAddress,
                    ]
                      .filter(Boolean)
                      .some((v) => String(v).toLowerCase().includes(q));
                  })
                  .map((entry: any) => (
                    <div
                      key={entry.id || entry.email}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#FFFFFF] border border-[#d3d3d3]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#212121] truncate">
                            {entry.name || entry.email}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              entry.status === "invited" ||
                              entry.status === "active"
                                ? "bg-[#34c759]/15 text-[#34c759]"
                                : "bg-[#d29500]/20 text-[#d29500]"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#8a8a8a] truncate">
                          {entry.email}
                          {entry.company ? ` · ${entry.company}` : ""}
                        </p>
                        {entry.walletAddress && (
                          <p className="text-xs text-[#8a8a8a] mt-1 truncate">
                            Wallet: {entry.walletAddress}
                          </p>
                        )}
                        {entry.useCase && (
                          <p className="text-xs text-[#8a8a8a] mt-1 truncate">
                            {entry.useCase}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 shrink-0">
                        {entry.status === "pending" ? (
                          <button
                            onClick={() => handleApprove(entry.email)}
                            disabled={approvingEmail === entry.email}
                            className="px-4 py-2 rounded-lg bg-[#34c759] text-white text-sm font-medium hover:bg-[#155a3e] transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {approvingEmail === entry.email ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                        ) : (
                          <span className="text-xs text-[#34c759] font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
