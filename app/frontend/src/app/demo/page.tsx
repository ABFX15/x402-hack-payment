"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  PrivacyComparison,
  ExplorerPreview,
} from "@/components/ui/PrivacyBadge";
import {
  Play,
  Zap,
  Link as LinkIcon,
  Code2,
  ArrowRight,
  Shield,
  Eye,
} from "lucide-react";
import { useState } from "react";

export default function DemoPage() {
  const demoWallet = "Ac52MMouwRypY7WPxMnUGwi6ZDRuBDgbmt9aXKSp43By";
  const [showPrivateExplorer, setShowPrivateExplorer] = useState(true);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Try Settlr{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                Live
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Experience gasless USDC payments in action. No wallet required, no
              gas fees. See how easy it is for your customers.
            </p>
          </div>

          {/* Demo Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {/* Interactive Store Demo */}
            <Link
              href="/demo/store"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Gaming Tournament Store
                </h2>
                <p className="text-white/50 mb-4">
                  Full e-commerce experience with tournament entries, deposits,
                  and instant USDC checkout.
                </p>
                <div className="flex items-center gap-2 text-purple-400 font-medium">
                  <span>Try Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Quick Deposit */}
            <Link
              href={`/checkout?amount=10.00&merchant=Arena%20GG&to=${demoWallet}&memo=Tournament%20Deposit`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] p-6 transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  Quick Checkout
                </h2>
                <p className="text-white/50 mb-4">
                  Skip straight to the checkout flow. See a $10 USDC payment in
                  action.
                </p>
                <div className="flex items-center gap-2 text-cyan-400 font-medium">
                  <span>Try Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Create Payment Link */}
            <Link
              href="/create"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] p-6 transition-all hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                  Create Payment Link
                </h2>
                <p className="text-white/50 mb-4">
                  Generate a shareable payment link with custom amount and
                  description.
                </p>
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <span>Create Link</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* SDK Integration */}
            <Link
              href="/docs"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  SDK Documentation
                </h2>
                <p className="text-white/50 mb-4">
                  Integrate Settlr into your app with our React, Next.js, or Vue
                  SDK.
                </p>
                <div className="flex items-center gap-2 text-orange-400 font-medium">
                  <span>View Docs</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Privacy Demo Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-4">
                <Shield className="w-4 h-4" />
                Inco Lightning FHE Encryption
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                See the Privacy Difference
              </h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Compare how a regular payment vs. a private receipt appears on
                Solana Explorer. With FHE encryption, the amount is never
                visible on-chain.
              </p>
            </div>

            {/* Privacy Comparison */}
            <div className="mb-6">
              <PrivacyComparison
                publicAmount="5,000,000 (5.00 USDC)"
                privateHandle="340282366920938463463374607431768211456"
                decryptedAmount="5.00 USDC"
              />
            </div>

            {/* Explorer Toggle Preview */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#12121a]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  What you&apos;ll see on Solscan
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivateExplorer(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                      !showPrivateExplorer
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Public
                  </button>
                  <button
                    onClick={() => setShowPrivateExplorer(true)}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                      showPrivateExplorer
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Private (FHE)
                  </button>
                </div>
              </div>
              <ExplorerPreview
                isPrivate={showPrivateExplorer}
                amount="5000000"
                encryptedHandle="0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c"
              />
              {showPrivateExplorer && (
                <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm">
                  <p className="text-purple-300">
                    <strong>✓ Privacy protected:</strong> The actual amount is
                    encrypted using Inco Lightning&apos;s Fully Homomorphic
                    Encryption. Only the customer and merchant can decrypt it by
                    authenticating with Inco&apos;s covalidators.
                  </p>
                </div>
              )}
              {!showPrivateExplorer && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                  <p className="text-yellow-300">
                    <strong>⚠️ Public visibility:</strong> Anyone viewing this
                    transaction on Solana Explorer or Solscan can see the exact
                    payment amount. This may not be ideal for business privacy.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Powered by Kora Gasless
                </h3>
                <p className="text-white/60">
                  Your customers pay only USDC — no SOL needed for transaction
                  fees. We cover the gas so checkout is seamless.
                </p>
              </div>
              <Link
                href="/docs?tab=quickstart"
                className="rounded-lg border border-purple-500/50 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
