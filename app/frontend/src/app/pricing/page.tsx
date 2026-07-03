"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Building2, Rocket, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Reveal helper ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const plans = [
  {
    name: "Starter",
    description: "Single-location operators and pilots",
    price: "1%",
    priceSubtext: "per settled invoice",
    icon: Zap,
    features: [
      "Unlimited invoices & payment links",
      "USDC settlement to your vault",
      "Buyer pays by email - no wallet required",
      "BSA/AML transaction monitoring",
      "USD off-ramp to your bank",
      "Email support",
    ],
    cta: "Get started",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Growth",
    description: "Multi-location distributors and wholesalers",
    price: "0.75%",
    priceSubtext: "per settled invoice",
    icon: Rocket,
    features: [
      "Everything in Starter",
      "Priority settlement support",
      "Webhooks & accounting exports",
      "Collections automation (pre-due + overdue)",
      "Custom branded invoices",
      "API access",
      "Team / multi-signer accounts",
    ],
    cta: "Talk to sales",
    href: "mailto:adam@settlr.dev?subject=Growth%20plan%20enquiry",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "High-volume B2B settlement programs",
    price: "Custom",
    priceSubtext: "volume-based pricing",
    icon: Building2,
    features: [
      "Everything in Growth",
      "Dedicated compliance support",
      "Custom KYB and SAR workflows",
      "SLA guarantees",
      "Squads multisig with custom approval rules",
      "White-label payment links",
      "Audit-ready on-chain reporting",
    ],
    cta: "Talk to sales",
    href: "mailto:adam@settlr.dev?subject=Enterprise%20enquiry",
    popular: false,
  },
];

const faqs = [
  {
    q: "Are there any monthly fees?",
    a: "No. You only pay per settled invoice. No setup fees, no monthly minimums, no hidden charges.",
  },
  {
    q: "Does my buyer need a crypto wallet?",
    a: "No. Buyers pay by email. We provision a managed wallet on the buyer's behalf, on-ramp USDC if needed, and settle to your vault. They never see a seed phrase.",
  },
  {
    q: "How fast are settlements?",
    a: "Funds land in your Squads vault in seconds. USD off-ramp to your bank account typically settles same-day or next business day depending on your tier.",
  },
  {
    q: "Can I try before committing?",
    a: "Yes - the live demo runs the full settlement flow with test funds. No card, no signup, no wallet required.",
  },
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-[#FFFFFF] text-[#212121] antialiased">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#34c759]/[0.06] blur-[128px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-1.5 text-[13px] text-[#5c5c5c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
              No hidden fees
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Simple, transparent{" "}
              <span className="text-[#34c759]">pricing</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[#8a8a8a]">
              No monthly charges. Just pay per transaction. Start accepting
              stablecoin payments today.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <Reveal key={plan.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-colors ${
                    plan.popular
                      ? "border-[#3B82F6]/30 bg-[#34c759]/[0.04]"
                      : "border-[#d3d3d3] bg-white/[0.02] hover:border-[#d3d3d3]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#34c759] px-4 py-1 text-xs font-semibold text-[#212121]">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="mb-4 inline-flex rounded-xl bg-white/[0.05] p-2.5">
                      <Icon className="h-5 w-5 text-[#5c5c5c]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#212121]">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#8a8a8a]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-[#212121]">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-sm text-[#8a8a8a]">
                      {plan.priceSubtext}
                    </span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-[#8a8a8a]"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-[#34c759]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-all ${
                      plan.popular
                        ? "bg-white text-[#212121] hover:bg-[#f2f2f2]"
                        : "border border-[#d3d3d3] text-[#5c5c5c] hover:bg-[#f2f2f2] hover:text-[#212121]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-y border-[#d3d3d3]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-3xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#34c759]">
              FAQ
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.06}>
                <div className="rounded-2xl border border-[#d3d3d3] bg-white/[0.02] p-6">
                  <h4 className="text-[15px] font-semibold text-[#212121]">
                    {faq.q}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#8a8a8a]">
                    {faq.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Ready to start accepting
              <br />
              <span className="text-[#34c759]">stablecoin payments?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#8a8a8a]">
              Join merchants already using Offbank for instant USDC payments.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-8 py-4 text-[15px] font-semibold text-[#212121] shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d3d3d3] px-8 py-4 text-[15px] font-medium text-[#5c5c5c] transition-colors hover:bg-[#f2f2f2] hover:text-[#212121]"
              >
                Try demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
