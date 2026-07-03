"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  MessageCircle,
  Zap,
  Shield,
  RefreshCw,
  Code2,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Mail,
  Twitter,
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
const springFast = { type: "spring" as const, stiffness: 260, damping: 24 };

/* ── Scroll-triggered reveal ───────────────────────────── */
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

const cardStatic =
  "rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md";
const cardBorder = `1px solid ${p.border}`;

/* ── Data ──────────────────────────────────────────────── */
const categories = [
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "payments", label: "Payments", icon: RefreshCw },
  { id: "security", label: "Security", icon: Shield },
  { id: "refunds", label: "Refunds", icon: RefreshCw },
  { id: "integration", label: "Integration", icon: Code2 },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  "getting-started": [
    {
      q: "How do I get started with Offbank?",
      a: "Sign up, complete KYB verification, and you're settling USDC the same day. Buyers pay by email - we provision a managed wallet on their behalf, settle to your Squads vault, and you cash out to USD when you're ready.",
    },
    {
      q: "Do I need any crypto knowledge?",
      a: "Not at all! Offbank abstracts away all blockchain complexity. You integrate with simple REST APIs, and your customers see a familiar payment experience, no wallets or crypto knowledge required.",
    },
    {
      q: "What currencies do you support?",
      a: "We currently support USDC on Solana. We're working on adding more stablecoins and chains based on merchant demand.",
    },
  ],
  payments: [
    {
      q: "How fast are payments settled?",
      a: "Payments are settled instantly! As soon as a customer completes a payment, the USDC arrives in your wallet, typically within 2 seconds.",
    },
    {
      q: "Who pays for transaction fees?",
      a: "We cover all gas fees for your customers. They only pay the transaction amount. No SOL required.",
    },
    {
      q: "Is there a minimum payment amount?",
      a: "No minimum. Accept invoices of any size. We absorb network fees so the buyer never sees a SOL prompt.",
    },
  ],
  security: [
    {
      q: "How secure is Offbank?",
      a: "Security is our top priority. We use MPC wallets, never store private keys, and all transactions are verified on-chain. Funds go directly to your wallet, we never custody your money.",
    },
    {
      q: "Is Offbank compliant?",
      a: "Yes, we maintain SOC 2 compliance and work with regulated partners. All merchants complete KYB verification to ensure a safe ecosystem.",
    },
    {
      q: "What happens if something goes wrong?",
      a: "All transactions are recorded on the Solana blockchain, providing an immutable audit trail. Our support team is available 24/7 to help with any issues.",
    },
  ],
  refunds: [
    {
      q: "How do refunds work?",
      a: "Refunds are initiated through the dashboard or API. USDC is returned to the buyer's original payment method - their managed Offbank wallet or the wallet they connected.",
    },
    {
      q: "How long do refunds take?",
      a: "Refunds are processed instantly on-chain. The customer receives their USDC within seconds of you initiating the refund.",
    },
    {
      q: "Are there fees for refunds?",
      a: "We don't charge additional fees for refunds. However, the original transaction fee is non-refundable.",
    },
  ],
  integration: [
    {
      q: "How hard is it to integrate?",
      a: "Our REST API makes integration a breeze. Most developers are up and running in under an hour. We also offer payment links for no-code solutions.",
    },
    {
      q: "Do you support webhooks?",
      a: "Yes! We support webhooks for payment confirmations, refunds, and other events. Real-time notifications keep your systems in sync.",
    },
    {
      q: "Can I customize the payment UI?",
      a: "Absolutely! Our components are fully customizable. Match your brand colors, add custom fields, or build entirely custom experiences with our headless APIs.",
    },
  ],
};

const quickLinks = [
  {
    title: "Documentation",
    description: "Comprehensive API docs and integration guides",
    icon: Book,
    href: "/docs",
    external: false,
  },
  {
    title: "Contact Support",
    description: "Get help from our team directly",
    icon: Mail,
    href: "mailto:support@settlr.dev",
    external: true,
  },
  {
    title: "Twitter / X",
    description: "Follow for updates and announcements",
    icon: Twitter,
    href: "https://x.com/offbankpay",
    external: true,
  },
];

/* ── FAQ accordion ─────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: p.white,
        boxShadow: isOpen
          ? "0 4px 24px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        border: `1px solid ${isOpen ? "rgba(27,107,74,0.25)" : p.border}`,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-8 py-6 text-left"
      >
        <span
          className="pr-4 text-base font-semibold"
          style={{ color: p.navy }}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springFast}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4" style={{ color: p.muted }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6">
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: p.slate }}
              >
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
/*  PAGE                                                   */
/* ════════════════════════════════════════════════════════ */
export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");

  return (
    <main className="min-h-screen" style={{ background: p.bg, color: p.slate }}>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-56">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(27,107,74,0.2), transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <R>
            <div
              className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm"
              style={{
                background: p.white,
                border: cardBorder,
                color: p.navy,
              }}
            >
              <MessageCircle
                className="h-3.5 w-3.5"
                style={{ color: p.green }}
              />
              We&apos;re here to help
            </div>
          </R>

          <R delay={0.06}>
            <h1
              className="mt-8 text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl"
              style={{ color: p.navy }}
            >
              Help &amp;{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                support
              </span>
            </h1>
          </R>

          <R delay={0.12}>
            <p
              className="mx-auto mt-6 max-w-md text-lg leading-relaxed"
              style={{ color: p.slate }}
            >
              Find answers to common questions or reach out to our team.
            </p>
          </R>
        </div>
      </section>

      {/* ═══════ QUICK LINKS, bento style ═══════ */}
      <section className="pb-32 sm:pb-48">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              const Tag = link.external ? "a" : Link;
              const extraProps = link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {};
              return (
                <R key={link.title} delay={i * 0.06}>
                  <Tag
                    href={link.href}
                    {...(extraProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                    className={`group block h-full ${cardStatic}`}
                    style={{
                      background: p.white,
                      border: cardBorder,
                      padding: "2rem",
                    }}
                  >
                    <div
                      className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: p.bgMuted }}
                    >
                      <Icon className="h-5 w-5" style={{ color: p.slate }} />
                    </div>
                    <h3
                      className="flex items-center gap-2 text-base font-bold"
                      style={{ color: p.navy }}
                    >
                      {link.title}
                      {link.external && (
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          style={{ color: p.muted }}
                        />
                      )}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      {link.description}
                    </p>
                  </Tag>
                </R>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
        <div className="mx-auto max-w-4xl px-6">
          <R className="text-center">
            <p
              className="mb-5 text-sm font-semibold uppercase tracking-widest"
              style={{ color: p.muted }}
            >
              FAQ
            </p>
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Frequently asked questions
            </h2>
            <p className="mt-5 text-lg" style={{ color: p.slate }}>
              Browse by category to find what you need.
            </p>
          </R>

          {/* Category tabs */}
          <R delay={0.06}>
            <div className="mt-14 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{
                      background: active ? p.navy : p.white,
                      color: active ? p.white : p.slate,
                      border: `1px solid ${active ? p.navy : p.border}`,
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{
                        color: active ? "rgba(255,255,255,0.6)" : p.muted,
                      }}
                    />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </R>

          {/* FAQ items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mt-10 space-y-4"
            >
              {faqs[activeCategory]?.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════ DARK STATS BAR ═══════ */}
      <section style={{ background: p.navy }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <R>
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
              {[
                { value: "<24h", label: "Response time" },
                { value: "24/7", label: "Support available" },
                { value: "99.9%", label: "Uptime SLA" },
                { value: "5 min", label: "Avg. integration" },
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
                  Still have{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #34c759, #2D9D6E)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    questions?
                  </span>
                </h2>
                <p
                  className="mx-auto mt-6 max-w-md text-lg"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Our team is here to help. Reach out and we&apos;ll get back to
                  you within 24 hours.
                </p>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="mailto:support@settlr.dev"
                    className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                      boxShadow: "0 4px 24px rgba(27,107,74,0.3)",
                    }}
                  >
                    Contact Support
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Try Demo
                  </Link>
                </div>
              </div>
            </div>
          </R>
        </div>
      </section>

      <Footer />
    </main>
  );
}
