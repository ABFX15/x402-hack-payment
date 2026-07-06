"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  CheckCircle2,
  Zap,
  Shield,
  DollarSign,
  Clock,
  Download,
  Send,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ── Design tokens (matches homepage) ──────────────────── */
const p = {
  bg: "#FFFFFF",
  bgSubtle: "#f2f2f2",
  bgMuted: "#f2f2f2",
  navy: "#212121",
  slate: "#5c5c5c",
  muted: "#8a8a8a",
  green: "#34c759",
  greenDark: "#2ba048",
  border: "#d3d3d3",
  red: "#e74c3c",
  amber: "#d29500",
  white: "#FFFFFF",
};

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function R({
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
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const card =
  "rounded-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1";
const cardStatic =
  "rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md";
const cardBorder = `1px solid ${p.border}`;

export default function InvoicesPage() {
  return (
    <div className="min-h-screen" style={{ background: p.bg, color: p.slate }}>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden pb-32 pt-40 sm:pb-48 sm:pt-56">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(27,107,74,0.2), transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <R>
              <div
                className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm"
                style={{
                  background: p.white,
                  border: cardBorder,
                  color: p.navy,
                }}
              >
                <FileText className="h-3.5 w-3.5" style={{ color: p.green }} />
                Product
              </div>
            </R>

            <R delay={0.06}>
              <h1
                className="mt-8 text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[72px]"
                style={{ color: p.navy }}
              >
                B2B invoices that{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  settle on-chain
                </span>
              </h1>
            </R>

            <R delay={0.12}>
              <p
                className="mx-auto mt-8 max-w-lg text-lg leading-relaxed sm:text-xl"
                style={{ color: p.slate }}
              >
                Create an invoice, send it to your supplier or buyer, and get
                paid in USDC. Immutable receipt. No intermediary.
              </p>
            </R>

            <R
              delay={0.18}
              className="mt-14 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/onboarding"
                className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  boxShadow: "0 4px 24px rgba(27,107,74,0.25)",
                }}
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold transition-all duration-200 hover:bg-gray-50"
                style={{ border: cardBorder, color: p.navy }}
              >
                See Demo
              </Link>
            </R>
          </div>

          {/* Product mockup, invoice */}
          <R delay={0.24}>
            <div
              className="mx-auto mt-24 max-w-3xl overflow-hidden rounded-3xl"
              style={{
                boxShadow:
                  "0 25px 80px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{
                  background: p.bgSubtle,
                  borderBottom: `1px solid ${p.border}`,
                }}
              >
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#e74c3c]/80/80" />
                  <div className="h-3 w-3 rounded-full bg-[#ffc107]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#34c759]/80" />
                </div>
                <div
                  className="flex-1 text-center text-xs font-medium"
                  style={{ color: p.muted }}
                >
                  offbankpay.com/dashboard/invoices
                </div>
              </div>
              {/* Invoice content */}
              <div className="p-8" style={{ background: p.bg }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: p.muted }}
                    >
                      Invoice
                    </p>
                    <p
                      className="mt-1 text-2xl font-bold"
                      style={{ color: p.navy }}
                    >
                      #INV-1082
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{
                      background: "rgba(27,107,74,0.08)",
                      color: p.greenDark,
                    }}
                  >
                    Paid
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: p.muted }}
                    >
                      From
                    </p>
                    <p
                      className="mt-1 text-sm font-bold"
                      style={{ color: p.navy }}
                    >
                      GreenLeaf Farms
                    </p>
                    <p className="text-[11px]" style={{ color: p.muted }}>
                      CO License #402881
                    </p>
                  </div>
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: p.muted }}
                    >
                      To
                    </p>
                    <p
                      className="mt-1 text-sm font-bold"
                      style={{ color: p.navy }}
                    >
                      Pacific Distributors
                    </p>
                    <p className="text-[11px]" style={{ color: p.muted }}>
                      OR License #190422
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5"
                  style={{ borderTop: `1px solid ${p.border}` }}
                >
                  <div className="mt-4 space-y-2">
                    {[
                      {
                        item: "Flower, OG Kush (50 lbs)",
                        qty: "50",
                        price: "$800",
                        total: "$40,000",
                      },
                      {
                        item: "Concentrate, Live Rosin (5 lbs)",
                        qty: "5",
                        price: "$1,500",
                        total: "$7,500",
                      },
                    ].map((row) => (
                      <div
                        key={row.item}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex-1" style={{ color: p.navy }}>
                          {row.item}
                        </span>
                        <span
                          className="w-12 text-right"
                          style={{ color: p.muted }}
                        >
                          {row.qty}
                        </span>
                        <span
                          className="w-16 text-right"
                          style={{ color: p.muted }}
                        >
                          {row.price}
                        </span>
                        <span
                          className="w-20 text-right font-semibold"
                          style={{ color: p.navy }}
                        >
                          {row.total}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-4 flex justify-end border-t pt-3"
                    style={{ borderColor: p.border }}
                  >
                    <div className="text-right">
                      <p className="text-xs" style={{ color: p.muted }}>
                        Total
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: p.navy }}
                      >
                        $47,500.00
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    background: p.bgSubtle,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5"
                    style={{ color: p.green }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: p.navy }}
                  >
                    Settled in 3.2s ·{" "}
                    <span style={{ color: p.muted }}>
                      Tx 5Kj8...mQ2r · Fee $475 (1%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══════ DARK STATS BAR ═══════ */}
      <section style={{ background: p.navy }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <R>
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
              {[
                { value: "<5s", label: "Settlement time" },
                { value: "$0", label: "Monthly fee" },
                { value: "1%", label: "Per transaction" },
                { value: "On-chain", label: "Audit trail" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {stat.value}
                  </p>
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ═══════ INVOICE LIFECYCLE, steps with mockups ═══════ */}
      <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
        <div className="mx-auto max-w-6xl px-6">
          <R className="mx-auto max-w-2xl text-center">
            <p
              className="mb-5 text-sm font-semibold uppercase tracking-widest"
              style={{ color: p.muted }}
            >
              Invoice Lifecycle
            </p>
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              From draft to settled in seconds
            </h2>
          </R>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create invoice",
                desc: "Add line items, set payment terms, assign to a verified counterparty.",
                mockup: (
                  <div
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div className="space-y-2">
                      {[
                        "Line items added",
                        "Counterparty assigned",
                        "Terms set (Net 0)",
                      ].map((s) => (
                        <div
                          key={s}
                          className="flex items-center gap-2.5 text-[11px]"
                        >
                          <CheckCircle2
                            className="h-3 w-3"
                            style={{ color: p.green }}
                          />
                          <span style={{ color: p.navy }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-3 rounded-lg py-2 text-center text-[10px] font-semibold"
                      style={{
                        background: "rgba(27,107,74,0.08)",
                        color: p.greenDark,
                      }}
                    >
                      Ready to Send
                    </div>
                  </div>
                ),
              },
              {
                step: "02",
                title: "Send & notify",
                desc: "Your counterparty gets an email with a one-click pay button. No account needed.",
                mockup: (
                  <div
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: p.white,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <Send className="h-4 w-4" style={{ color: p.green }} />
                      <div>
                        <p
                          className="text-[11px] font-bold"
                          style={{ color: p.navy }}
                        >
                          Invoice #1082 sent
                        </p>
                        <p className="text-[10px]" style={{ color: p.muted }}>
                          pacific-dist@email.com
                        </p>
                      </div>
                    </div>
                    <div
                      className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        background: p.white,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <Clock className="h-3 w-3" style={{ color: p.amber }} />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: p.slate }}
                      >
                        Awaiting payment...
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                step: "03",
                title: "Settle & receipt",
                desc: "Payment lands in your vault. Both parties get an immutable on-chain receipt.",
                mockup: (
                  <div
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: p.green }}
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: p.navy }}
                      >
                        Settled
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {[
                        ["Total", "$47,500.00"],
                        ["Fee (1%)", "$475.00"],
                        ["Net received", "$47,025.00"],
                        ["Time to finality", "3.2s"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between text-[11px]"
                        >
                          <span style={{ color: p.muted }}>{label}</span>
                          <span
                            className="font-semibold"
                            style={{ color: p.navy }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((item, i) => (
              <R key={item.step} delay={i * 0.08}>
                <div
                  className={`${card} flex h-full flex-col`}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "2.5rem",
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: p.navy }}>
                    {item.step}
                  </span>
                  <h3
                    className="mt-4 text-xl font-bold"
                    style={{ color: p.navy }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    {item.desc}
                  </p>
                  {item.mockup}
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BENTO FEATURES ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-6xl px-6">
          <R className="mx-auto max-w-2xl text-center">
            <p
              className="mb-5 text-sm font-semibold uppercase tracking-widest"
              style={{ color: p.muted }}
            >
              Built For B2B
            </p>
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Invoicing that actually works for high-risk
            </h2>
          </R>

          <div className="mt-20 grid gap-5 md:grid-cols-3 md:grid-rows-2">
            {/* Large, 2 cols */}
            <R className="md:col-span-2">
              <div
                className={`${cardStatic} h-full`}
                style={{
                  background: p.white,
                  border: cardBorder,
                  padding: "2.5rem",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: p.bgMuted }}
                  >
                    <Shield className="h-5 w-5" style={{ color: p.slate }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: p.navy }}>
                      Cryptographic proof of payment
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      Every settled invoice generates an immutable on-chain
                      receipt. Amount, timestamp, sender, recipient -
                      tamper-proof and verifiable by any auditor.
                    </p>
                  </div>
                </div>
                {/* Receipt mockup */}
                <div
                  className="mt-6 rounded-xl p-4"
                  style={{
                    background: p.bgSubtle,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    {[
                      ["Tx Hash", "5Kj8...mQ2r"],
                      ["Block", "284,291,003"],
                      ["Amount", "$47,500 USDC"],
                      ["Fee", "$475 (1%)"],
                      ["From", "GreenLeaf Farms"],
                      ["To", "Pacific Distributors"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p
                          className="font-semibold uppercase tracking-wider"
                          style={{ color: p.muted, fontSize: 9 }}
                        >
                          {label}
                        </p>
                        <p
                          className="mt-0.5 font-medium"
                          style={{ color: p.navy }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </R>

            {/* Dark card */}
            <R delay={0.06}>
              <div
                className={`${cardStatic} flex h-full flex-col items-center justify-center text-center`}
                style={{
                  background: p.navy,
                  padding: "2.5rem",
                  minHeight: 200,
                }}
              >
                <Download
                  className="h-7 w-7"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                />
                <h3 className="mt-4 text-lg font-bold text-white">
                  Export Anywhere
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Download PDF, CSV, or pull via API. Integrates with your
                  existing accounting.
                </p>
              </div>
            </R>

            {/* Small */}
            <R delay={0.1}>
              <div
                className={`${cardStatic} h-full`}
                style={{
                  background: p.white,
                  border: cardBorder,
                  padding: "2.5rem",
                }}
              >
                <Users className="h-6 w-6" style={{ color: p.slate }} />
                <h3
                  className="mt-4 text-lg font-bold"
                  style={{ color: p.navy }}
                >
                  KYB-verified counterparties
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: p.slate }}
                >
                  Only verified businesses can settle. State licences and
                  beneficial owners checked upfront.
                </p>
              </div>
            </R>

            {/* Wide, 2 cols, comparison */}
            <R delay={0.14} className="md:col-span-2">
              <div
                className={`${cardStatic} h-full`}
                style={{
                  background: p.white,
                  border: cardBorder,
                  padding: "2.5rem",
                }}
              >
                <p
                  className="mb-4 text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: p.muted }}
                >
                  Offbank Invoices vs Traditional
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Settlement",
                      us: "< 5 seconds",
                      them: "3-5 business days",
                    },
                    { label: "Fees", us: "1% flat", them: "5-9% + hidden" },
                    {
                      label: "Custody risk",
                      us: "Non-custodial",
                      them: "Processor holds funds",
                    },
                    {
                      label: "Audit trail",
                      us: "On-chain, immutable",
                      them: "Fragmented, manual",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl px-4 py-3"
                      style={{
                        background: p.bgSubtle,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: p.muted }}
                      >
                        {row.label}
                      </p>
                      <p
                        className="mt-1 text-xs font-bold"
                        style={{ color: p.green }}
                      >
                        {row.us}
                      </p>
                      <p
                        className="text-[10px] line-through"
                        style={{ color: p.red }}
                      >
                        {row.them}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          </div>
        </div>
      </section>

      {/* ═══════ RELATED READING ═══════ */}
      <section className="border-t border-[#ececef] bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <R>
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#34c759]">
              Related reading
            </p>
            <Link
              href="/blog/stablecoin-payments-igaming-affiliates-invoicing"
              className="group inline-flex items-center gap-2 text-[17px] font-semibold text-[#0d0d0f] hover:text-[#2ba048]"
            >
              Stablecoin Payments in iGaming: Affiliates &amp; Invoicing
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </R>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-5xl px-6">
          <R>
            <div
              className="relative overflow-hidden rounded-[2rem] px-8 py-20 text-center sm:px-16 sm:py-28"
              style={{ background: p.navy }}
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(27,107,74,0.4), transparent 70%)",
                  }}
                />
              </div>
              <div className="relative z-10">
                <h2
                  className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
                  style={{ color: "#FFFFFF" }}
                >
                  Send your first{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #34c759, #2D9D6E)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    on-chain invoice
                  </span>
                </h2>
                <p
                  className="mx-auto mt-6 max-w-md text-lg"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Join the first B2B operators settling invoices in seconds, not
                  days.
                </p>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/onboarding"
                    className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                      boxShadow: "0 4px 24px rgba(27,107,74,0.3)",
                    }}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Watch Demo
                  </Link>
                </div>
              </div>
            </div>
          </R>
        </div>
      </section>

      <Footer />
    </div>
  );
}
