"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Store,
  Check,
  Copy,
  Wallet,
  Zap,
  Shield,
  Globe,
  Code,
  LogIn,
  Loader2,
  Banknote,
  Key,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

// USDC on Devnet
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;
const RPC_ENDPOINT = "https://api.devnet.solana.com";

export default function MerchantPage() {
  const { authenticated, login } = usePrivy();
  const { solanaWallet, publicKey, connected } = useActiveWallet();

  const [copied, setCopied] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch USDC balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;

    setLoadingBalance(true);
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const walletPubkey = new PublicKey(publicKey);
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
    } finally {
      setLoadingBalance(false);
    }
  }, [publicKey]);

  // Fetch balance on load
  useEffect(() => {
    if (connected) {
      fetchBalance();
    }
  }, [connected, fetchBalance]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-[#a855f7]/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Become a Merchant
          </h2>
          <p className="text-zinc-400 mb-6">
            Sign in to get your non-custodial merchant wallet. Funds go directly
            to you — no middlemen.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a855f7] to-[#22d3ee] text-white font-semibold rounded-xl"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={100}
              height={28}
              quality={100}
              className="object-contain"
            />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Payment Links
            </Link>
            <Link
              href="/docs"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Docs
            </Link>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="min-h-screen py-12 px-4 pt-32 bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#22d3ee] flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Merchant Setup
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Non-custodial payments. Instant settlement. Full control of your
              funds.
            </p>
          </motion.div>

          {/* Wallet Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Your Merchant Wallet
            </h2>
            <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-4">
              <code className="text-[#22d3ee] font-mono text-sm flex-1 break-all">
                {publicKey}
              </code>
              <button
                onClick={() => copyToClipboard(publicKey!, "wallet")}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                {copied === "wallet" ? (
                  <Check className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Copy className="w-5 h-5 text-zinc-400" />
                )}
              </button>
            </div>
            <p className="text-zinc-500 text-sm mt-3">
              Use this wallet address in your payment links to receive USDC.
            </p>
          </motion.div>

          {/* Balance & Offramp Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Balance</h2>
              <button
                onClick={fetchBalance}
                disabled={loadingBalance}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {loadingBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </button>
            </div>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-white">
                {balance !== null ? balance.toFixed(2) : "—"}
              </span>
              <span className="text-xl text-zinc-400 mb-1">USDC</span>
            </div>

            <Link href={`/offramp?wallet=${publicKey}&amount=${balance || ""}`}>
              <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Banknote className="w-5 h-5" />
                Cash Out to Bank
              </button>
            </Link>

            <p className="text-zinc-500 text-xs mt-3 text-center">
              Sign in to your Sphere account to convert USDC → fiat
            </p>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/dashboard/api-keys">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-6 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Key className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Get API Key</h3>
                    <p className="text-zinc-400 text-sm">For SDK integration</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/create">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 border border-zinc-800 hover:border-[#a855f7]/50 rounded-2xl p-6 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#a855f7]/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#a855f7]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Create Payment Link
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Generate a payment QR code
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/docs">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 border border-zinc-800 hover:border-[#22d3ee]/50 rounded-2xl p-6 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#22d3ee]/20 flex items-center justify-center">
                    <Code className="w-6 h-6 text-[#22d3ee]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Integration Docs
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Add checkout to your app
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Why Settlr
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Non-Custodial</h3>
                <p className="text-zinc-500 text-sm">
                  Funds settle directly to your wallet
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-medium mb-1">
                  Embedded Wallets
                </h3>
                <p className="text-zinc-500 text-sm">
                  Customers pay with email, no extensions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-medium mb-1">
                  Instant & Global
                </h3>
                <p className="text-zinc-500 text-sm">
                  Accept from anywhere, settle instantly
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pricing Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-zinc-500">
              <span className="text-[#a855f7] font-semibold">
                Competitive volume-based pricing
              </span>{" "}
              · No monthly fees · No payment holds
            </p>
            <Link
              href="/waitlist"
              className="text-[#22d3ee] hover:underline text-sm mt-2 inline-block"
            >
              Contact us for pricing →
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
