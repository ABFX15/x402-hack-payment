"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Check,
  Globe,
  Clock,
  DollarSign,
  Mail,
  Users,
  RefreshCw,
  Shield,
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

export default function ZapierPage() {
  const color = "#FF4A00";

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
            name: "Offbank Zapier Connector",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://offbankpay.com/integrations/zapier",
            description:
              "Connect stablecoin payments to 8,000+ apps via Zapier. Trigger USDC settlements from any workflow - no code required.",
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
              <Zap className="h-3.5 w-3.5" />
              Zapier Integration
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Connect stablecoin payments to{" "}
              <span style={{ color }}>8,000+ apps</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5c5c5c]">
              Trigger USDC settlements from any Zapier workflow. New Airtable
              row → pay a contractor. Typeform submission → send a bounty. CRM
              deal closed → pay affiliate commission. No code, no custom API
              work.
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

      {/* How it works */}
      <section className="border-y border-[#d3d3d3]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color }}
            >
              How it works
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Any trigger → stablecoin settlement
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick your trigger",
                text: "New row in Google Sheets, form submission, CRM event, Slack message - any of 8,000+ Zapier triggers.",
              },
              {
                step: "02",
                title: "Map the fields",
                text: 'Connect the recipient email and amount to Offbank\'s "Send USDC" action. Set currency, memo, and metadata.',
              },
              {
                step: "03",
                title: "Settlement sent automatically",
                text: "Recipient gets an email with their USDC. Settled in under a second. Zapier logs the transaction hash for your records.",
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

      {/* Example Zaps */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color }}
          >
            Popular workflows
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Example Zaps
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {[
            {
              trigger: "Google Sheets",
              action: "New row with email + amount → send USDC settlement",
            },
            {
              trigger: "Typeform",
              action: "Form submission → pay bounty to respondent",
            },
            {
              trigger: "HubSpot",
              action: "Deal closed → pay affiliate commission in USDC",
            },
            {
              trigger: "Airtable",
              action: "Status changed to 'Approved' → pay contractor",
            },
            {
              trigger: "Slack",
              action: "Emoji reaction on message → trigger tip/reward",
            },
            {
              trigger: "Stripe",
              action: "Payment received → split revenue via USDC settlement",
            },
          ].map((zap, i) => (
            <Reveal key={zap.trigger} delay={i * 0.04}>
              <div className="flex items-start gap-3 rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-4">
                <Check
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  style={{ color }}
                />
                <div>
                  <span className="text-sm font-medium text-[#212121]">
                    {zap.trigger}
                  </span>
                  <p className="text-xs text-[#8a8a8a]">{zap.action}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-[#d3d3d3]/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Why Zapier + Offbank
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "8,000+ apps",
                text: "Connect settlements to any tool in the Zapier ecosystem.",
              },
              {
                icon: Clock,
                title: "Zero development time",
                text: "No API integration needed. Set up in minutes, not weeks.",
              },
              {
                icon: DollarSign,
                title: "From 1% per transaction",
                text: "Same low fees as the API. No extra cost for Zapier.",
              },
              {
                icon: Mail,
                title: "Wallet-based settlements",
                text: "Recipients don't need bank accounts. Just a wallet address.",
              },
              {
                icon: Users,
                title: "Multi-step Zaps",
                text: "Chain settlements with approvals, notifications, and logging.",
              },
              {
                icon: Shield,
                title: "Non-custodial",
                text: "Funds flow on-chain. We never touch your money.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-[#d3d3d3] bg-white/[0.02] p-6">
                  <div
                    className="mb-4 inline-flex rounded-xl p-2.5"
                    style={{ background: `${color}15` }}
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

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t via-transparent to-transparent"
          style={{
            background: `linear-gradient(to top, ${color}0A, transparent)`,
          }}
        />
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Automate your{" "}
              <span style={{ color }}>stablecoin settlements</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#8a8a8a]">
              The first stablecoin settlement connector on Zapier. Connect to
              8,000+ apps in minutes.
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
