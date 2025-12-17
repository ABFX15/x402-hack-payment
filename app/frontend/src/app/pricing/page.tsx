"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Building2,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "forever",
    highlight: false,
    features: [
      { text: "Unlimited payment links", included: true },
      { text: "QR code generation", included: true },
      { text: "Direct wallet payments", included: true },
      { text: "2% platform fee", included: true },
      { text: "Gasless payments", included: true },
      { text: "Basic analytics", included: true },
      { text: "Email support", included: false },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
      { text: "Webhooks", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/create",
  },
  {
    name: "Pro",
    description: "For growing businesses",
    price: "$29",
    period: "/month",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Everything in Free", included: true },
      { text: "1.5% platform fee", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
      { text: "API access", included: true },
      { text: "Webhooks", included: true },
      { text: "Multiple wallets", included: true },
      { text: "Team members (3)", included: true },
      { text: "White-label checkout", included: false },
    ],
    cta: "Start Free Trial",
    ctaLink: "/create",
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    period: "",
    highlight: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "1% platform fee", included: true },
      { text: "White-label checkout", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA guarantee", included: true },
      { text: "On-premise option", included: true },
      { text: "Custom contracts", included: true },
      { text: "Volume discounts", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "mailto:hello@settlr.dev",
  },
];

const faqs = [
  {
    question: "What payment methods are supported?",
    answer:
      "Currently we support USDC on Solana. We're working on adding support for more tokens and chains.",
  },
  {
    question: "How does gasless payments work?",
    answer:
      "Your customers pay a small USDC fee (0.01 USDC) instead of needing SOL for gas. We cover the transaction costs.",
  },
  {
    question: "When do I receive my funds?",
    answer:
      "Instantly! Payments go directly to your Solana wallet. There's no holding period or withdrawal process.",
  },
  {
    question: "Is there a minimum transaction amount?",
    answer: "No minimum! You can accept payments as small as $0.01 USDC.",
  },
  {
    question: "Can I issue refunds?",
    answer:
      "Yes, refunds are built into our smart contract. You can issue full or partial refunds with one click.",
  },
  {
    question: "Do I need to KYC?",
    answer:
      "No KYC required to start. Payments go directly to your wallet. For enterprise features, we may require business verification.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={90}
              height={24}
              quality={100}
              className="object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-[var(--text-primary)] font-medium"
            >
              Pricing
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-[var(--text-muted)]">
            Start for free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[var(--primary)]/20 to-[var(--card)] border-2 border-[var(--primary)]"
                    : "glass-card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[var(--text-primary)]">
                      {plan.price}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-muted)]"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    plan.highlight
                      ? "bg-[var(--primary)] text-white hover:opacity-90"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              All plans include
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Instant Settlement", desc: "< 1 second" },
              {
                icon: Shield,
                title: "Non-Custodial",
                desc: "Your keys, your funds",
              },
              {
                icon: Users,
                title: "Unlimited Links",
                desc: "No restrictions",
              },
              {
                icon: Sparkles,
                title: "Gasless Option",
                desc: "Zero SOL needed",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-[var(--card)]/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex gap-4">
                  <HelpCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-[var(--text-muted)]">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Ready to get started?
            </h2>
            <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Create your first payment link in seconds. No credit card
              required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                View Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Image
            src="/logo-new.png"
            alt="Settlr"
            width={90}
            height={24}
            quality={100}
            className="object-contain opacity-80"
          />
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Home
            </Link>
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
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © 2025 Settlr. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
