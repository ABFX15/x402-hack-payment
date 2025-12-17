"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Shield,
  RefreshCw,
  ArrowRight,
  QrCode,
  Smartphone,
  Globe,
  DollarSign,
  Store,
  Users,
  ArrowDownToLine,
  Check,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Settlr"
              width={90}
              height={24}
              quality={100}
              className="object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/create" className="btn-primary text-sm">
              Create Payment
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden pt-20">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)] rounded-full blur-[128px] opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              Now Live on Solana
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
            Payments on Solana,{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              simplified
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
            Accept USDC payments instantly. No gas fees for your customers.
            Generate payment links in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="btn-primary flex items-center gap-2 text-lg"
            >
              <Store className="w-5 h-5" />
              Merchant Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/create"
              className="btn-secondary flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Create Payment
            </Link>
            <Link href="/demo" className="btn-ghost flex items-center gap-2">
              Try Demo
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Why Settlr?
            </h2>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              Everything you need to accept crypto payments, without the
              complexity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Settlement",
                description:
                  "Payments confirm in under a second. No waiting for block confirmations.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: DollarSign,
                title: "Gasless for Customers",
                description:
                  "Your customers pay zero gas fees. We handle the transaction costs.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Non-Custodial",
                description:
                  "Funds go directly to your wallet. We never hold your money.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: QrCode,
                title: "Solana Pay Compatible",
                description:
                  "Works with any Solana Pay enabled wallet. Scan and pay.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: RefreshCw,
                title: "Easy Refunds",
                description:
                  "Issue refunds with one click. Built into the smart contract.",
                gradient: "from-red-500 to-rose-500",
              },
              {
                icon: Globe,
                title: "Global Payments",
                description:
                  "Accept payments from anywhere in the world. No borders.",
                gradient: "from-indigo-500 to-violet-500",
              },
            ].map(({ icon: Icon, title, description, gradient }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-[var(--border-hover)] transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-[var(--text-muted)]">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplicity Stats */}
      <section className="py-16 px-4 md:px-8 border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "7", label: "Lines of code to integrate" },
              { value: "<1s", label: "Transaction confirmation" },
              { value: "0", label: "SOL needed by customers" },
              { value: "2%", label: "Simple flat fee" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 md:px-8 bg-[var(--card)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              How it Works
            </h2>
            <p className="text-[var(--text-muted)] text-lg">
              Three simple steps to start accepting payments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" />

            {[
              {
                step: "1",
                icon: Store,
                title: "Create Payment",
                description:
                  "Enter the amount and generate a unique payment link or QR code",
              },
              {
                step: "2",
                icon: Smartphone,
                title: "Customer Pays",
                description:
                  "Customer scans QR or clicks link to pay with their Solana wallet",
              },
              {
                step: "3",
                icon: Users,
                title: "Receive Funds",
                description:
                  "USDC lands directly in your wallet. Instant and secure.",
              },
            ].map(({ step, icon: Icon, title, description }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg relative z-10">
                  {step}
                </div>
                <div className="glass-card p-6">
                  <Icon className="w-8 h-8 text-[var(--primary)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {title}
                  </h3>
                  <p className="text-[var(--text-muted)]">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Easy Integration Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Developer Friendly
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                Integrate in minutes,
                <br />
                not days
              </h2>
              <p className="text-[var(--text-muted)] text-lg mb-6">
                Our SDK is designed for simplicity. Accept payments with just 7
                lines of code. No complex configurations, no blockchain
                expertise required.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "One npm install to get started",
                  "TypeScript support out of the box",
                  "React hooks for seamless integration",
                  "Works with any Solana wallet adapter",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[var(--text-secondary)]"
                  >
                    <Check className="w-5 h-5 text-[var(--success)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <Link
                  href="/create"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://github.com/ABFX15/x402-hack-payment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  View on GitHub
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-2xl blur-xl" />
              <div className="relative glass-card p-6 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-sm text-[var(--text-muted)]">
                    index.ts
                  </span>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-[var(--text-secondary)]">
                    {`import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  merchant: {
    name: "My Store",
    walletAddress: "YOUR_WALLET",
  },
});

// Create a payment link
const payment = await settlr.createPayment({
  amount: 29.99,
  memo: "Premium subscription",
});

// Redirect to checkout
window.location.href = payment.checkoutUrl;`}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Simple Pricing
            </h2>
            <p className="text-[var(--text-muted)] text-lg">
              Start free, pay only when you grow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "2% fee",
                features: ["Unlimited links", "QR codes", "Gasless payments"],
              },
              {
                name: "Pro",
                price: "$29/mo",
                desc: "1.5% fee",
                features: ["Custom branding", "API access", "Priority support"],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "1% fee",
                features: ["White-label", "Dedicated support", "SLA"],
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl text-center ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[var(--primary)]/20 to-[var(--card)] border-2 border-[var(--primary)]"
                    : "glass-card"
                }`}
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                  {plan.price}
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  {plan.desc}
                </p>
                <ul className="space-y-2 text-left">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <Check className="w-4 h-4 text-[var(--success)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              View full pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Ready to accept crypto payments?
            </h2>
            <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Start accepting USDC payments in minutes. No sign-up required.
            </p>
            <Link
              href="/create"
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Image
            src="/logo.png"
            alt="Settlr"
            width={90}
            height={24}
            quality={100}
            className="object-contain"
            style={{ imageRendering: "auto" }}
          />
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Create Payment
            </Link>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © 2025 Settlr. Powering seamless payments.
          </p>
        </div>
      </footer>
    </main>
  );
}
