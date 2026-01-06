"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  Users,
  Copy,
  Check,
  ExternalLink,
  Key,
  LogIn,
  RefreshCw,
  Loader2,
  X,
  ChevronRight,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Constants
const PROGRAM_ID = new PublicKey(
  "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5"
);
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Your Squads multisig vault address
const SQUADS_VAULT = new PublicKey(
  "DthkuDsPKR6MqqV28rVSBEqdgnuNtEU6QpLACZ7bCBpD"
);

// Authorized admin wallets (Squads members)
// Set via NEXT_PUBLIC_ADMIN_WALLETS env var (comma-separated)
// Example: NEXT_PUBLIC_ADMIN_WALLETS=wallet1,wallet2,wallet3
const AUTHORIZED_ADMINS = (
  process.env.NEXT_PUBLIC_ADMIN_WALLETS ||
  "DthkuDsPKR6MqqV28rVSBEqdgnuNtEU6QpLACZ7bCBpD"
)
  .split(",")
  .map((w) => w.trim())
  .filter(Boolean);

interface PlatformConfig {
  authority: string;
  treasury: string;
  feeBps: number;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const { ready, authenticated, login } = usePrivy();
  const { solanaWallet, publicKey, connected } = useActiveWallet();

  const [loading, setLoading] = useState(true);
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(
    null
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchPlatformData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");

      // Derive Platform Config PDA
      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
      );

      // Get treasury ATA
      const treasuryAta = await getAssociatedTokenAddress(
        USDC_MINT,
        platformConfigPDA,
        true
      );

      // Fetch treasury balance
      try {
        const balance = await connection.getTokenAccountBalance(treasuryAta);
        setTreasuryBalance(parseFloat(balance.value.uiAmountString || "0"));
      } catch {
        setTreasuryBalance(0);
      }

      // Check if platform is initialized with Squads
      const config: PlatformConfig = {
        authority: SQUADS_VAULT.toBase58(),
        treasury: treasuryAta.toBase58(),
        feeBps: 200, // 2%
        isActive: true,
      };
      setPlatformConfig(config);
    } catch (err) {
      console.error("Failed to fetch platform data:", err);
      setError("Failed to load platform data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connected) {
      fetchPlatformData();
    } else {
      setLoading(false);
    }
  }, [connected, fetchPlatformData]);

  // Not ready yet
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
              <Key className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Platform Admin Dashboard
            </h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Connect an authorized wallet to access the admin dashboard.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
            >
              <LogIn className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Check if wallet is authorized
  const isAuthorized = publicKey
    ? AUTHORIZED_ADMINS.includes(publicKey)
    : false;

  if (!isAuthorized || !publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Access Denied
            </h1>
            <p className="text-slate-400 mb-4 max-w-md mx-auto">
              This wallet is not authorized to access the admin dashboard.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              {publicKey
                ? `Connected: ${publicKey.slice(0, 8)}...${publicKey.slice(-6)}`
                : "No wallet connected"}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              Return Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                Settlr Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchPlatformData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <RefreshCw
                className={`w-5 h-5 text-slate-400 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-300">
                {shortenAddress(publicKey)}
              </span>
            </div>
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
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <X className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-green-300">{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="w-4 h-4 text-green-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Squads Multisig Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                Protected by Squads Multisig
                <Lock className="w-4 h-4 text-cyan-400" />
              </h2>
              <p className="text-sm text-slate-400 mb-3">
                Platform authority is controlled by a Squads multisig. Fee
                claims require multiple signatures.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`https://devnet.squads.so/squads/${SQUADS_VAULT.toBase58()}/home`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Squads Dashboard
                </a>
                <button
                  onClick={() =>
                    copyToClipboard(SQUADS_VAULT.toBase58(), "squads")
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors text-sm"
                >
                  {copied === "squads" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {shortenAddress(SQUADS_VAULT.toBase58())}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Treasury Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Treasury Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${treasuryBalance.toFixed(2)}
                  </p>
                </div>
              </div>
              <a
                href={`https://devnet.squads.so/squads/${SQUADS_VAULT.toBase58()}/transactions`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Claim via Squads
              </a>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Requires multisig approval
              </p>
            </div>
          </motion.div>

          {/* Platform Fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Platform Fee</p>
                <p className="text-2xl font-bold text-white">
                  {platformConfig?.feeBps ? platformConfig.feeBps / 100 : 2}%
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Fee taken from each payment processed through the platform
            </p>
          </motion.div>

          {/* Platform Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  platformConfig?.isActive ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <Shield
                  className={`w-6 h-6 ${
                    platformConfig?.isActive ? "text-green-400" : "text-red-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-slate-400">Platform Status</p>
                <p className="text-2xl font-bold text-white">
                  {platformConfig?.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  platformConfig?.isActive ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              />
              <span className="text-sm text-slate-500">
                {platformConfig?.isActive
                  ? "Processing payments"
                  : "Payments paused"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Treasury Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-400" />
            On-Chain Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <span className="text-sm text-slate-400 block mb-2">
                Squads Vault (Authority)
              </span>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white font-mono flex-1 truncate">
                  {SQUADS_VAULT.toBase58()}
                </code>
                <a
                  href={`https://explorer.solana.com/address/${SQUADS_VAULT.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <span className="text-sm text-slate-400 block mb-2">
                Treasury Token Account
              </span>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white font-mono flex-1 truncate">
                  {platformConfig?.treasury || "Loading..."}
                </code>
                <a
                  href={`https://explorer.solana.com/address/${platformConfig?.treasury}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <span className="text-sm text-slate-400 block mb-2">
                USDC Mint
              </span>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white font-mono flex-1 truncate">
                  {USDC_MINT.toBase58()}
                </code>
                <a
                  href={`https://explorer.solana.com/address/${USDC_MINT.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <span className="text-sm text-slate-400 block mb-2">
                Program ID
              </span>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white font-mono flex-1 truncate">
                  {PROGRAM_ID.toBase58()}
                </code>
                <a
                  href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How to Claim Fees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            How to Claim Fees
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">
                1
              </div>
              <div>
                <p className="text-white font-medium">Open Squads Dashboard</p>
                <p className="text-sm text-slate-400">
                  Go to{" "}
                  <a
                    href={`https://devnet.squads.so/squads/${SQUADS_VAULT.toBase58()}/home`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline"
                  >
                    devnet.squads.so
                  </a>{" "}
                  and connect your wallet
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">
                2
              </div>
              <div>
                <p className="text-white font-medium">Create a Transaction</p>
                <p className="text-sm text-slate-400">
                  Use &quot;Program Interaction&quot; to call{" "}
                  <code className="text-xs bg-white/10 px-1 rounded">
                    claim_platform_fees
                  </code>{" "}
                  on the Settlr program
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">
                3
              </div>
              <div>
                <p className="text-white font-medium">Get Signatures</p>
                <p className="text-sm text-slate-400">
                  Other multisig members approve the transaction
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">
                4
              </div>
              <div>
                <p className="text-white font-medium">Execute</p>
                <p className="text-sm text-slate-400">
                  Once threshold is met, execute the transaction to claim fees
                  to the vault
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/dashboard"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-slate-400" />
              <span className="text-white">Merchant Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/docs"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-400" />
              <span className="text-white">API Documentation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={`https://devnet.squads.so/squads/${SQUADS_VAULT.toBase58()}/home`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-white">Squads Multisig</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </main>
    </div>
  );
}
