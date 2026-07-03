"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Check,
  MousePointerClick,
  Zap,
  Shield,
  Globe,
  Puzzle,
  Paintbrush,
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

export default function BubblePage() {
  const color = "#3B82F6";

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
            name: "Offbank Bubble.io Plugin",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://offbankpay.com/integrations/bubble",
            description:
              "Add USDC settlement to any Bubble.io app. Drag-and-drop stablecoin checkout and settlement for no-code builders.",
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
              <Layers className="h-3.5 w-3.5" />
              Bubble.io Plugin
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Stablecoin payments for the{" "}
              <span style={{ color }}>no-code economy</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5c5c5c]">
              3M+ apps run on Bubble.io. Zero of them have native stablecoin
              payment infrastructure. The Offbank plugin gives every no-code
              builder drag-and-drop USDC checkout and settlement - no blockchain
              knowledge required.
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

      {/* Why no-code + stablecoins */}
      <section className="border-y border-[#d3d3d3]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color }}
            >
              Zero competition
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              The no-code market has no stablecoin solution
            </h2>
            <p className="mt-4 max-w-xl text-[#8a8a8a] leading-relaxed">
              Bubble builders accept Stripe. That&apos;s it. No stablecoin
              checkout, no USDC settlement, no stablecoin rails. Offbank is the
              first plugin to bring programmable stablecoin infrastructure to
              the no-code ecosystem.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {[
              {
                icon: MousePointerClick,
                title: "Drag-and-drop setup",
                text: "Drop the Offbank checkout element onto any page. Configure amount, recipient, and style - all visually.",
              },
              {
                icon: Zap,
                title: "Instant settlement",
                text: "Payments settle in seconds, not days. Build marketplaces, SaaS apps, and platforms with real-time money flow.",
              },
              {
                icon: Shield,
                title: "No chargebacks",
                text: "Stablecoin payments are final. Build with confidence - no disputes, no fraud reversals eating your margins.",
              },
              {
                icon: Globe,
                title: "Global from day one",
                text: "Accept USDC from users in any country. No merchant account applications, no country restrictions.",
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

      {/* Use cases */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color }}
          >
            Use cases
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            What no-code builders are building
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "B2B invoicing",
              text: "Build a B2B invoicing app on Bubble. Vendors receive instant USDC settlement. No escrow middleman.",
            },
            {
              title: "SaaS subscription billing",
              text: "Accept USDC for monthly plans. Automated recurring payments, usage-based billing, and instant revenue recognition.",
            },
            {
              title: "High-risk platforms",
              text: "Launch platforms for debanked verticals with stablecoin settlement. No card-network content restrictions.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="rounded-2xl border border-[#d3d3d3] bg-white/[0.02] p-6">
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

      {/* How it works */}
      <section className="border-y border-[#d3d3d3]/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
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
              Live in 3 steps
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Install from Bubble plugins",
                text: "Search 'Offbank' in the Bubble plugin marketplace. One click to add it to your app.",
              },
              {
                step: "02",
                title: "Drop the checkout element",
                text: "Drag the Offbank Checkout element onto your page. Configure amount, wallet, and styling in the visual editor.",
              },
              {
                step: "03",
                title: "Wire up workflows",
                text: "Use Bubble workflows to trigger actions on payment success - update database, send emails, unlock access.",
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
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Plugin capabilities
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {[
            "Visual checkout element - drag and drop",
            "USDC payments with gasless UX for buyers",
            "Workflow triggers on payment events",
            "Settlement actions - send USDC from workflows",
            "Works with Bubble's user authentication",
            "Customizable styles to match your app",
            "Webhook events for external integrations",
            "Zero blockchain knowledge required",
          ].map((feature, i) => (
            <Reveal key={feature} delay={i * 0.04}>
              <div className="flex items-center gap-3 rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-4">
                <Check className="h-4 w-4 flex-shrink-0" style={{ color }} />
                <span className="text-sm text-[#5c5c5c]">{feature}</span>
              </div>
            </Reveal>
          ))}
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
              Add <span style={{ color }}>stablecoin payments</span> to your
              Bubble app
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#8a8a8a]">
              Drag-and-drop USDC checkout for the 3M+ apps on Bubble.io. No
              code, no blockchain knowledge, no competition.
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
