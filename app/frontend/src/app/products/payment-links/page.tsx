"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  LinkIcon,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  DollarSign,
  Copy,
  QrCode,
  Share2,
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

export default function PaymentLinksPage() {
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
                <LinkIcon className="h-3.5 w-3.5" style={{ color: p.green }} />
                Product
              </div>
            </R>

            <R delay={0.06}>
              <h1
                className="mt-8 text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[72px]"
                style={{ color: p.navy }}
              >
                Payment links that{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  settle instantly
                </span>
              </h1>
            </R>

            <R delay={0.12}>
              <p
                className="mx-auto mt-8 max-w-lg text-lg leading-relaxed sm:text-xl"
                style={{ color: p.slate }}
              >
                Generate a link, share it with your buyer, get paid in USDC in
                under 5 seconds. No payment processor. No chargebacks.
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

          {/* Product mockup, payment link creation */}
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
                  offbankpay.com/pay/greenleaf-farms
                </div>
              </div>
              {/* Link preview content */}
              <div className="p-8" style={{ background: p.bg }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: p.muted }}
                    >
                      Payment Request
                    </p>
                    <p
                      className="mt-2 text-4xl font-bold tracking-tight"
                      style={{ color: p.navy }}
                    >
                      $47,500.00
                    </p>
                    <p className="mt-1 text-sm" style={{ color: p.muted }}>
                      GreenLeaf Farms · Invoice #1082
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: p.bgMuted }}
                    >
                      <Copy className="h-4 w-4" style={{ color: p.slate }} />
                    </div>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: p.bgMuted }}
                    >
                      <QrCode className="h-4 w-4" style={{ color: p.slate }} />
                    </div>
                  </div>
                </div>
                <div
                  className="mt-6 flex items-center gap-3 rounded-2xl px-5 py-4"
                  style={{
                    background: p.bgSubtle,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  <span
                    className="flex-1 truncate text-sm font-medium"
                    style={{ color: p.slate }}
                  >
                    https://offbankpay.com/pay/gl-farms-inv-1082
                  </span>
                  <Share2
                    className="h-4 w-4 shrink-0"
                    style={{ color: p.muted }}
                  />
                </div>
                <div
                  className="mt-4 w-full rounded-2xl py-4 text-center text-base font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  }}
                >
                  Pay with USDC
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
                { value: "<5s", label: "Time to get paid" },
                { value: "0%", label: "Chargebacks" },
                { value: "1%", label: "Flat fee" },
                { value: "∞", label: "Links per account" },
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

      {/* ═══════ HOW IT WORKS, mockups ═══════ */}
      <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
        <div className="mx-auto max-w-6xl px-6">
          <R className="mx-auto max-w-2xl text-center">
            <p
              className="mb-5 text-sm font-semibold uppercase tracking-widest"
              style={{ color: p.muted }}
            >
              How It Works
            </p>
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Three steps. Zero friction.
            </h2>
          </R>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create a link",
                desc: "Set the amount, add an optional memo, and generate a unique payment link.",
                mockup: (
                  <div
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div className="space-y-3">
                      <div
                        className="rounded-xl px-4 py-2.5"
                        style={{
                          background: p.white,
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <p className="text-[10px]" style={{ color: p.muted }}>
                          Amount
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: p.navy }}
                        >
                          $47,500.00
                        </p>
                      </div>
                      <div
                        className="rounded-xl px-4 py-2.5"
                        style={{
                          background: p.white,
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <p className="text-[10px]" style={{ color: p.muted }}>
                          Memo
                        </p>
                        <p className="text-sm" style={{ color: p.navy }}>
                          Q1 wholesale order #1082
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                step: "02",
                title: "Share it anywhere",
                desc: "Send via email, text, QR code, or embed it in your website. Works anywhere.",
                mockup: (
                  <div
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div
                      className="flex items-center gap-2 rounded-xl px-4 py-3"
                      style={{
                        background: p.white,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <LinkIcon
                        className="h-3.5 w-3.5"
                        style={{ color: p.green }}
                      />
                      <span
                        className="flex-1 truncate text-xs"
                        style={{ color: p.slate }}
                      >
                        offbankpay.com/pay/gl-1082
                      </span>
                      <Copy
                        className="h-3.5 w-3.5"
                        style={{ color: p.muted }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {["Email", "SMS", "QR Code"].map((ch) => (
                        <div
                          key={ch}
                          className="rounded-lg py-2 text-center text-[10px] font-semibold"
                          style={{
                            background: p.white,
                            border: `1px solid ${p.border}`,
                            color: p.navy,
                          }}
                        >
                          {ch}
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                step: "03",
                title: "Get settled",
                desc: "Buyer pays in USDC. Funds land in your vault in under 5 seconds. Receipt on-chain.",
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
                        ["Amount", "$47,500.00"],
                        ["Fee (1%)", "$475.00"],
                        ["Finality", "3.2 seconds"],
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

      {/* ═══════ FEATURES, bento grid ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-6xl px-6">
          <R className="mx-auto max-w-2xl text-center">
            <p
              className="mb-5 text-sm font-semibold uppercase tracking-widest"
              style={{ color: p.muted }}
            >
              Features
            </p>
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Everything a payment link should be
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
                      Non-custodial by default
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      When your buyer clicks &ldquo;Pay&rdquo;, USDC moves
                      directly from their wallet to your vault. Offbank never
                      touches the funds. Nothing to freeze, nothing to seize.
                    </p>
                  </div>
                </div>
                {/* Mini vault mockup */}
                <div className="mt-6 flex items-center gap-4">
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
                      Buyer
                    </p>
                    <p
                      className="mt-1 text-sm font-bold"
                      style={{ color: p.navy }}
                    >
                      -$47,500
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-px w-8" style={{ background: p.green }} />
                    <Zap className="h-3.5 w-3.5" style={{ color: p.green }} />
                    <div className="h-px w-8" style={{ background: p.green }} />
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
                      Your Vault
                    </p>
                    <p
                      className="mt-1 text-sm font-bold"
                      style={{ color: p.green }}
                    >
                      +$47,025
                    </p>
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
                <Globe
                  className="h-7 w-7"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                />
                <h3 className="mt-4 text-lg font-bold text-white">
                  Works Everywhere
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Email, SMS, Slack, embed on your site, or print a QR code.
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
                <DollarSign className="h-6 w-6" style={{ color: p.slate }} />
                <h3
                  className="mt-4 text-lg font-bold"
                  style={{ color: p.navy }}
                >
                  1% flat. Always.
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: p.slate }}
                >
                  No monthly fees, no hidden markups, no chargebacks. One
                  transparent number.
                </p>
              </div>
            </R>

            {/* Wide, 2 cols */}
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
                  Link Features
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Custom amounts or open-ended",
                    "Expiration dates",
                    "QR code generation",
                    "Webhook on settlement",
                    "On-chain receipt",
                    "Multi-use or single-use",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-3"
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
                        className="text-xs font-medium"
                        style={{ color: p.navy }}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          </div>
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
                  Start getting paid{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #34c759, #2D9D6E)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    in seconds
                  </span>
                </h2>
                <p
                  className="mx-auto mt-6 max-w-md text-lg"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Generate your first payment link today. No integration
                  required.
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
