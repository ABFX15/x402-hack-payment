"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
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
} from "lucide-react";
import Link from "next/link";

export default function MerchantPage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  // Prefer external wallets (Phantom/Solflare) over Privy embedded wallet
  const solanaWallet =
    wallets?.find((w) => w.walletClientType !== "privy") || wallets?.[0];
  const publicKey = solanaWallet?.address;
  const connected = authenticated && !!publicKey;

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a12]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-[#f472b6]/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-[#f472b6]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Become a Merchant
          </h2>
          <p className="text-zinc-400 mb-6">
            Sign in to get your merchant wallet address and start accepting USDC
            payments.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white font-semibold rounded-xl"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 pt-32 bg-[#0a0a12]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f472b6] to-[#67e8f9] flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Merchant Setup</h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Start accepting USDC payments in minutes. No KYC, no monthly fees.
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
            <code className="text-[#67e8f9] font-mono text-sm flex-1 break-all">
              {publicKey}
            </code>
            <button
              onClick={() => copyToClipboard(publicKey!, "wallet")}
              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              {copied === "wallet" ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-zinc-400" />
              )}
            </button>
          </div>
          <p className="text-zinc-500 text-sm mt-3">
            Use this wallet address in your payment links to receive USDC.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/create">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-900 border border-zinc-800 hover:border-[#f472b6]/50 rounded-2xl p-6 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f472b6]/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#f472b6]" />
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
              className="bg-zinc-900 border border-zinc-800 hover:border-[#67e8f9]/50 rounded-2xl p-6 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#67e8f9]/20 flex items-center justify-center">
                  <Code className="w-6 h-6 text-[#67e8f9]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Integration Docs</h3>
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
            What You Get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-medium mb-1">
                Instant Settlement
              </h3>
              <p className="text-zinc-500 text-sm">
                USDC lands directly in your wallet
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Gasless for Users</h3>
              <p className="text-zinc-500 text-sm">
                Your customers pay zero gas fees
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Global Payments</h3>
              <p className="text-zinc-500 text-sm">
                Accept from anywhere, instantly
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
            <span className="text-[#f472b6] font-semibold">
              1% transaction fee
            </span>{" "}
            · No monthly fees · No setup costs
          </p>
          <Link
            href="/pricing"
            className="text-[#67e8f9] hover:underline text-sm mt-2 inline-block"
          >
            View full pricing →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
