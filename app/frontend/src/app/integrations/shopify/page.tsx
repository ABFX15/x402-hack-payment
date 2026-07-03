"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Check,
  Globe,
  Zap,
  DollarSign,
  Shield,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

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

export default function ShopifyPage() {
  const color = "#95BF47";

  return (
    <main
      className="relative min-h-screen bg-[#FFFFFF] text-[#212121] antialiased"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Offbank Shopify App",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://offbankpay.com/integrations/shopify",
            description:
              "Accept USDC payments on any Shopify store. Stablecoin checkout that fills the gap Shopify's native Solana integration doesn't cover.",
            provider: { "@id": "https://offbankpay.com/#organization" },
            about: { "@id": "https://offbankpay.com/#defined-term" },
          }),
        }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full blur-[120px]"
          style={{ background: `${color}08` }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium"
              style={{
                borderColor: `${color}50`,
                background: `${color}15`,
                color,
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Shopify App
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Stablecoin payments for{" "}
              <span style={{ color }}>every Shopify store</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5c5c5c]">
              Shopify added Solana Pay, but it doesn&apos;t cover stablecoin
              settlement, gasless checkout, or non-custodial infrastructure.
              Offbank fills the gap. Accept USDC with zero gas fees for customers
              and instant settlement for merchants.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-[#212121] shadow-lg transition-transform hover:scale-[1.02]"
                style={{
                  background: color,
                  boxShadow: `0 10px 25px ${color}40`,
                }}
              >
                View on GitHub
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d3d3d3] px-7 py-3.5 text-[15px] font-medium text-[#5c5c5c] hover:bg-[#f2f2f2]"
              >
                Setup docs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why fill the gap */}
      <section className="border-y border-[#d3d3d3]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color }}
            >
              The gap
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              What Shopify&apos;s native Solana Pay misses
            </h2>
            <p className="mt-4 max-w-xl text-[#8a8a8a] leading-relaxed">
              Shopify blockchain integrations handle basic token payments. But
              merchants need programmable settlement, gasless UX, and real
              settlement infrastructure. Offbank adds what&apos;s missing.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {[
              {
                icon: CreditCard,
                title: "Gasless checkout",
                text: "Customers pay USDC without seeing a gas fee. Offbank sponsors network fees invisibly, just like swiping a card.",
              },
              {
                icon: DollarSign,
                title: "Non-custodial settlement",
                text: "Funds settle directly to your wallet. No custodian holds your money - you control the keys.",
              },
              {
                icon: Shield,
                title: "Zero chargebacks",
                text: "Stablecoin payments are final on-chain. No disputes, no fraud reversals, no chargeback penalties.",
              },
              {
                icon: Globe,
                title: "Global customer base",
                text: "Anyone with USDC can buy. No declined international cards, no FX fees, no country restrictions.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="group relative overflow-hidden rounded-2xl bg-[#212121] p-6 transition-all duration-300 hover:bg-[#2a2a2a]">
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                    style={{ background: color }}
                  />
                  <div
                    className="mb-4 inline-flex rounded-xl p-2.5"
                    style={{ background: `${color}12` }}
                  >
                    <item.icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#212121]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8a8a8a]">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color }}
          >
            Setup
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Live in 5 minutes
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Install from the App Store",
              text: "Find Offbank in the Shopify App Store. One-click install from your Shopify admin.",
            },
            {
              step: "02",
              title: "Connect your wallet",
              text: "Paste your USDC wallet address. Link your Offbank dashboard for analytics and webhook events.",
            },
            {
              step: "03",
              title: "Accept USDC at checkout",
              text: "USDC appears as a payment option alongside cards. Orders update automatically on confirmed payment.",
            },
          ].map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08}>
              <div className="rounded-2xl border border-[#d3d3d3] bg-white/[0.02] p-6">
                <span
                  className="mb-4 block text-xs font-bold"
                  style={{ color: `${color}90` }}
                >
                  STEP {item.step}
                </span>
                <h3 className="text-[15px] font-semibold text-[#212121]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8a8a8a]">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#d3d3d3]/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Built for Shopify merchants
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {[
              "USDC payment method via Shopify Payments API",
              "Automatic order fulfillment on confirmed payment",
              "Gasless UX - buyers never touch network fees",
              "Subscription billing for recurring products",
              "Works alongside Shopify Payments, PayPal, etc.",
              "Real-time webhook events for payment status",
              "On-chain receipt generation per order",
              "Multi-currency: USDC + USDT support",
            ].map((feature, i) => (
              <Reveal key={feature} delay={i * 0.04}>
                <div className="flex items-center gap-3 rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-4">
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color }} />
                  <span className="text-sm text-[#5c5c5c]">{feature}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(to top, ${color}0A, transparent)`,
          }}
        />
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Add <span style={{ color }}>USDC checkout</span> to your Shopify
              store
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#8a8a8a]">
              One app install. Stablecoin payments alongside your existing
              checkout. Live in 5 minutes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold text-[#212121] hover:scale-[1.02]"
                style={{
                  background: color,
                  boxShadow: `0 10px 25px ${color}40`,
                }}
              >
                View on GitHub
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d3d3d3] px-8 py-4 text-[15px] font-medium text-[#5c5c5c] hover:bg-[#f2f2f2]"
              >
                Get API key
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
