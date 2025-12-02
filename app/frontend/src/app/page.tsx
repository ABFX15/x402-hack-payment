"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
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
              Built for x402 Hackathon
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
              href="/create"
              className="btn-primary flex items-center gap-2 text-lg"
            >
              <QrCode className="w-5 h-5" />
              Create Payment Link
              <ArrowRight className="w-5 h-5" />
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
              Why x402 Pay?
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
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--text-primary)]">
              x402 Pay
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Built with ❤️ for the x402 Hackathon
          </p>
        </div>
      </footer>
    </main>
  );
}
