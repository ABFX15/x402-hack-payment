"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Shield,
  Zap,
  ArrowDownToLine,
  ExternalLink,
  Wallet,
} from "lucide-react";
import Link from "next/link";

// Sphere's direct sell/offramp page - merchants use their own Sphere account
const SPHERE_SELL_URL = "https://spherepay.co/sell";

function OfframpContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Parse URL params for pre-filling
  const amount = searchParams.get("amount");
  const walletAddress = searchParams.get("wallet");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build Sphere URL with optional params
  const buildSphereUrl = () => {
    const params = new URLSearchParams();
    if (amount) params.set("amount", amount);
    if (walletAddress) params.set("walletAddress", walletAddress);
    params.set("asset", "USDC");
    params.set("network", "solana");

    const queryString = params.toString();
    return queryString ? `${SPHERE_SELL_URL}?${queryString}` : SPHERE_SELL_URL;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 pt-24 md:pt-28 bg-[#0a0a12]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mt-16"
      >
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] mb-4"
          >
            <ArrowDownToLine className="w-4 h-4 text-[var(--secondary)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              Cash Out
            </span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Convert to Cash
          </h1>
          <p className="text-[var(--text-muted)]">
            Convert your USDC to fiat and withdraw to your bank
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 text-center"
          >
            <Zap className="w-6 h-6 text-[var(--secondary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Instant</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 text-center"
          >
            <Banknote className="w-6 h-6 text-[var(--success)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Low Fees</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 text-center"
          >
            <Shield className="w-6 h-6 text-[var(--primary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Secure</p>
          </motion.div>
        </div>

        {/* Sphere Ramp - Link to external page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mb-4">
              <Banknote className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Ready to Cash Out?
            </h3>
            <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto">
              Sign in to your Sphere account to convert USDC to fiat and
              withdraw directly to your bank account.
            </p>
          </div>

          <a
            href={buildSphereUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Open Sphere
            <ExternalLink className="w-4 h-4" />
          </a>

          <p className="text-[var(--text-muted)] text-xs mt-4">
            Don&apos;t have a Sphere account?{" "}
            <a
              href="https://spherepay.co/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              Sign up free →
            </a>
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <p className="text-[var(--text-muted)]">Supported</p>
              <p className="font-medium text-[var(--text-primary)]">
                40+ Countries
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <p className="text-[var(--text-muted)]">Settlement</p>
              <p className="font-medium text-[var(--text-primary)]">1-2 Days</p>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[var(--text-muted)]">
            Powered by{" "}
            <a
              href="https://spherepay.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              Sphere
            </a>{" "}
            • Compliant off-ramp infrastructure
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function OfframpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OfframpContent />
    </Suspense>
  );
}
