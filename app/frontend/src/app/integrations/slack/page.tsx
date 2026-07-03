"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Check,
  Zap,
  Users,
  Bell,
  Shield,
  Hash,
  CheckCircle2,
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

export default function SlackPage() {
  const color = "#4A154B";
  const colorLight = "#7C3085";

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
            name: "Offbank Slack Bot",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://offbankpay.com/integrations/slack",
            description:
              "Trigger USDC settlements from Slack. Use slash commands to settle with vendors, get approval workflows, and thread receipts.",
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
          style={{ background: `${colorLight}08` }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium"
              style={{
                borderColor: `${colorLight}60`,
                background: `${colorLight}18`,
                color: colorLight,
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Slack Bot
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Send USDC payments{" "}
              <span style={{ color: colorLight }}>from Slack</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5c5c5c]">
              Type{" "}
              <code
                className="rounded bg-[#f2f2f2] px-2 py-0.5 text-sm font-mono"
                style={{ color: colorLight }}
              >
                /pay alice@email.com 250
              </code>{" "}
              and it&apos;s done. Send stablecoin payments to anyone from the
              channel where your team already works. Approval workflows, thread
              receipts, and settlement notifications - all inside Slack.
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
                  background: colorLight,
                  boxShadow: `0 10px 25px ${colorLight}40`,
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

      {/* Slash commands */}
      <section className="border-y border-[#d3d3d3]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color: colorLight }}
            >
              Commands
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Payments as simple as a message
            </h2>
          </Reveal>

          <div className="mt-16 space-y-4">
            {[
              {
                command: "/pay alice@email.com 250",
                description:
                  "Send $250 USDC to alice@email.com. She gets an email with a claim link - no wallet needed.",
              },
              {
                command: "/pay-batch payroll.csv",
                description:
                  "Upload a CSV and pay everyone at once. Batch settlements for payroll, bounties, or contest prizes.",
              },
              {
                command: "/pay-status tx_abc123",
                description:
                  "Check the status of any payment. See confirmation, on-chain receipt, and delivery status.",
              },
              {
                command: "/pay-balance",
                description:
                  "Check your connected wallet balance without leaving Slack.",
              },
            ].map((item, i) => (
              <Reveal key={item.command} delay={i * 0.06}>
                <div className="rounded-2xl border border-[#d3d3d3] bg-[#212121] p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                  <code
                    className="shrink-0 rounded-lg bg-[#f2f2f2] px-4 py-2 text-sm font-mono"
                    style={{ color: colorLight }}
                  >
                    {item.command}
                  </code>
                  <p className="text-sm text-[#8a8a8a]">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Slack */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: colorLight }}
          >
            Why Slack
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Pay where your team already works
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: Zap,
              title: "Instant settlements",
              text: "Type a command, payment sends in seconds. No login to a dashboard, no CSV upload to a bank portal.",
            },
            {
              icon: Users,
              title: "Approval workflows",
              text: "Payments above a threshold ping a manager for approval. They click Approve in the thread and it sends.",
            },
            {
              icon: Hash,
              title: "Channel receipts",
              text: "The bot posts a confirmation in the thread with amount, recipient, and on-chain receipt link.",
            },
            {
              icon: Bell,
              title: "Payment notifications",
              text: "Get notified when settlements complete, when recipients claim funds, or when approvals are needed.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl bg-[#212121] p-6 transition-all duration-300 hover:bg-[#2a2a2a]">
                <div
                  className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                  style={{ background: colorLight }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl p-2.5"
                  style={{ background: `${colorLight}15` }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: colorLight }}
                  />
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
      </section>

      {/* Use cases */}
      <section className="border-y border-[#d3d3d3]/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Who uses this
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Ops & finance teams",
                text: "Pay contractors and vendors from the #payments channel. Manager approves, bot sends. Full audit trail in threads.",
              },
              {
                title: "Developer teams",
                text: "Pay bug bounties and open-source contributors instantly. /pay contributor@github.com 500 - done.",
              },
              {
                title: "Sales teams",
                text: "Close a deal, trigger an instant commission settlement from Slack. The whole team sees the celebration.",
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
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Bot capabilities
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {[
            "/pay slash command - send USDC by email",
            "Batch settlements via CSV upload",
            "Manager approval workflows with thread buttons",
            "On-chain receipt links in every confirmation",
            "Balance and payment status checks",
            "Customizable notification channels",
            "Team spending limits and permissions",
            "Full audit log visible in Slack threads",
          ].map((feature, i) => (
            <Reveal key={feature} delay={i * 0.04}>
              <div className="flex items-center gap-3 rounded-xl border border-[#d3d3d3] bg-white/[0.02] p-4">
                <Check
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: colorLight }}
                />
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
            background: `linear-gradient(to top, ${colorLight}08, transparent)`,
          }}
        />
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Settle with anyone via{" "}
              <span style={{ color: colorLight }}>Slack command</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#8a8a8a]">
              /pay email amount. That&apos;s it. Stablecoin settlement from the
              channel where your team already works.
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
                  background: colorLight,
                  boxShadow: `0 10px 25px ${colorLight}40`,
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
