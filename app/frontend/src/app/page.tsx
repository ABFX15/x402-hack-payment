"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Shield,
  ArrowRight,
  Code,
  Clock,
  DollarSign,
  ChevronDown,
  Gamepad2,
  Trophy,
  CreditCard,
  Check,
  Users,
  Globe,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0a0a12] to-[#0a1a1a]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(103, 232, 249, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(103, 232, 249, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f472b6]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#67e8f9]/20 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-8 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
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
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Docs
              </Link>
              <Link
                href="/dashboard"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </Link>
            </nav>
            <Link
              href="/demo"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Try Demo
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Gamepad2 className="w-4 h-4 text-[#67e8f9]" />
              <span className="text-sm text-white/70">
                Built for Crypto Gaming
              </span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              The Payment Processor
              <br />
              <span className="bg-gradient-to-r from-[#f472b6] via-[#c084fc] to-[#67e8f9] bg-clip-text text-transparent">
                Built for Crypto Gaming
              </span>
            </h1>

            {/* Value proposition */}
            <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Accept deposits at{" "}
              <span className="text-[#34d399] font-semibold">
                lower cost than Stripe
              </span>
              . Pay winners instantly. Stay compliant.
            </p>

            {/* Key stats inline */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>2% flat vs 2.9% + 30¢</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>Instant payouts</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>No chargebacks</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>Global reach</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/demo/store"
                className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-white">
                  See Live Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/docs"
                className="px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Code className="w-5 h-5" />
                View API Docs
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-white/30 animate-bounce" />
        </motion.div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] to-[#12121a]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Traditional Payments Are Killing Your Margins
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Gaming platforms lose millions to payment fees, chargebacks, and
              slow settlements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20"
            >
              <h3 className="text-xl font-semibold text-red-400 mb-6 flex items-center gap-2">
                <span className="text-2xl">❌</span> The Old Way (Stripe,
                PayPal)
              </h3>
              <ul className="space-y-4">
                {[
                  "2.9% + 30¢ per transaction",
                  "2-7 day settlement times",
                  "High chargeback risk (2-5% in gaming)",
                  "Complex compliance requirements",
                  "Geographic restrictions",
                  "Account freezes & holds",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60">
                    <span className="text-red-400 mt-1">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-[#34d399]/5 border border-[#34d399]/20"
            >
              <h3 className="text-xl font-semibold text-[#34d399] mb-6 flex items-center gap-2">
                <span className="text-2xl">✓</span> The Settlr Way
              </h3>
              <ul className="space-y-4">
                {[
                  "2% flat fee - no hidden costs",
                  "Instant settlement (<1 second)",
                  "Zero chargebacks (blockchain finality)",
                  "Built-in compliance tools",
                  "Accept payments from 190+ countries",
                  "Non-custodial - funds go to you",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60">
                    <Check className="w-5 h-5 text-[#34d399] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-[#12121a]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                value: "2%",
                label: "Transaction Fee",
                sublabel: "Simple & transparent",
              },
              {
                value: "<1s",
                label: "Settlement Time",
                sublabel: "Instant finality",
              },
              { value: "$0", label: "Gas for Users", sublabel: "We cover it" },
              {
                value: "0%",
                label: "Chargebacks",
                sublabel: "Blockchain finality",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-[#f472b6] to-[#67e8f9] bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-white font-medium">{stat.label}</p>
                <p className="text-sm text-white/40">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#12121a] to-[#0a0a12]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Built for Gaming Platforms
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Everything you need to accept deposits and pay out winnings
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Instant Deposits",
                description:
                  "Players fund their accounts in seconds. USDC deposits confirmed in under 1 second on Solana.",
                icon: Zap,
                color: "#f472b6",
              },
              {
                title: "Instant Payouts",
                description:
                  "Pay winners immediately. No waiting for bank transfers or payment processor holds.",
                icon: Trophy,
                color: "#67e8f9",
              },
              {
                title: "Gasless UX",
                description:
                  "Users pay zero gas fees. We handle blockchain complexity so players just see USDC.",
                icon: CreditCard,
                color: "#34d399",
              },
              {
                title: "Global Reach",
                description:
                  "Accept payments from players worldwide. No geographic restrictions or currency conversion.",
                icon: Globe,
                color: "#a78bfa",
              },
              {
                title: "Non-Custodial",
                description:
                  "Funds go directly to your wallet. We never hold or control your money.",
                icon: Shield,
                color: "#fbbf24",
              },
              {
                title: "Developer First",
                description:
                  "Clean REST API, React SDK, webhooks. Integrate in hours, not weeks.",
                icon: Code,
                color: "#f472b6",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at center, ${feature.color}, transparent 70%)`,
                  }}
                />
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    backgroundColor: `${feature.color}20`,
                    border: `1px solid ${feature.color}40`,
                  }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-[#0a0a12]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Perfect For
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: "🎮",
                title: "Esports Platforms",
                desc: "Tournament prizes & entry fees",
              },
              { icon: "🎰", title: "iGaming", desc: "Deposits & withdrawals" },
              {
                icon: "🃏",
                title: "Skill Gaming",
                desc: "Poker, fantasy sports",
              },
              {
                icon: "🎲",
                title: "Prediction Markets",
                desc: "Wagers & payouts",
              },
            ].map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#67e8f9]/50 transition-all"
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-white/50">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] to-[#12121a]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ship in an Afternoon
            </h2>
            <p className="text-white/50 text-lg">
              Clean API. Comprehensive SDK. Production-ready in hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-[#f472b6]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#34d399]" />
                <span className="ml-4 text-sm text-white/40">deposit.ts</span>
              </div>
              <pre className="p-6 overflow-x-auto text-sm md:text-base">
                <code className="text-white/80">
                  <span className="text-[#c084fc]">import</span> {"{"} Settlr{" "}
                  {"}"} <span className="text-[#c084fc]">from</span>{" "}
                  <span className="text-[#34d399]">
                    &apos;@settlr/sdk&apos;
                  </span>
                  ;<br />
                  <br />
                  <span className="text-white/40">
                    // Create a deposit for a player
                  </span>
                  <br />
                  <span className="text-[#c084fc]">const</span>{" "}
                  <span className="text-[#67e8f9]">deposit</span> ={" "}
                  <span className="text-[#c084fc]">await</span> Settlr.
                  <span className="text-[#fbbf24]">createPayment</span>({"{"}
                  <br />
                  {"  "}
                  <span className="text-white/50">amount:</span>{" "}
                  <span className="text-[#f472b6]">100.00</span>,<br />
                  {"  "}
                  <span className="text-white/50">currency:</span>{" "}
                  <span className="text-[#34d399]">&apos;USDC&apos;</span>,
                  <br />
                  {"  "}
                  <span className="text-white/50">metadata:</span> {"{"}{" "}
                  <span className="text-white/50">playerId:</span>{" "}
                  <span className="text-[#34d399]">&apos;usr_123&apos;</span>{" "}
                  {"}"}
                  <br />
                  {"}"});
                  <br />
                  <br />
                  <span className="text-white/40">
                    // Redirect player to checkout
                  </span>
                  <br />
                  window.<span className="text-[#fbbf24]">location</span> =
                  deposit.<span className="text-[#67e8f9]">checkoutUrl</span>;
                </code>
              </pre>
            </div>
          </motion.div>

          <div className="mt-8 text-center">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-[#67e8f9] hover:text-white transition-colors"
            >
              <span>Read the full documentation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-[#12121a]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-white/50 text-lg">
              No monthly fees. No hidden costs. Pay only for what you use.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f472b6]/10 to-[#67e8f9]/10 rounded-3xl" />
            <div className="relative z-10 text-center">
              <div className="text-6xl md:text-7xl font-bold text-white mb-2">
                2<span className="text-3xl">%</span>
              </div>
              <p className="text-xl text-white/70 mb-8">per transaction</p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  "No monthly fees",
                  "No setup costs",
                  "No minimums",
                  "Volume discounts available",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-white/60"
                  >
                    <Check className="w-4 h-4 text-[#34d399]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Cost Comparison on $10,000 in Transactions
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-white/60 mb-1">Stripe</p>
                <p className="text-2xl font-bold text-red-400">$320</p>
                <p className="text-xs text-white/40">2.9% + 30¢</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-white/60 mb-1">PayPal</p>
                <p className="text-2xl font-bold text-red-400">$349</p>
                <p className="text-xs text-white/40">3.49%</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#34d399]/10 border border-[#34d399]/30">
                <p className="text-white/60 mb-1">Settlr</p>
                <p className="text-2xl font-bold text-[#34d399]">$200</p>
                <p className="text-xs text-white/40">2%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#12121a] to-[#0a0a12]" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Cut Your Payment Costs?
            </h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Join gaming platforms saving thousands on payment processing.
              Start accepting USDC today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo/store"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Try Live Demo
              </Link>
              <Link
                href="mailto:hello@settlr.io"
                className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={80}
              height={22}
              quality={100}
              className="object-contain opacity-60"
            />
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link href="/demo" className="hover:text-white transition-colors">
              Demo
            </Link>
            <Link
              href="mailto:hello@settlr.io"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-sm text-white/30">
            © 2024 Settlr. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
