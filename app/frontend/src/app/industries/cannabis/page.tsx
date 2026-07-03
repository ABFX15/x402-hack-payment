"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Ban,
  DollarSign,
  Shield,
  Zap,
  Lock,
  Globe,
  AlertTriangle,
  Leaf,
  Building2,
  Truck,
  FileText,
  Scale,
  BadgeCheck,
  Banknote,
  HandCoins,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

/* ─── Reveal ─── */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, ...spring }}
    >
      {children}
    </motion.div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#d3d3d3] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 font-medium text-[#212121]">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#8a8a8a] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#8a8a8a]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── DATA ─── */

const features = [
  {
    icon: Ban,
    title: "Can\u2019t Be Debanked",
    description:
      "Non-custodial USDC settlements need no bank account. No processor, no merchant account, nothing to freeze.",
    stat: "0",
    statLabel: "bank dependency",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Pay cultivators, processors, and distributors in seconds. No more waiting days for ACH or wires to clear.",
    stat: "<1s",
    statLabel: "settlement",
  },
  {
    icon: DollarSign,
    title: "1% Flat \u2014 No Surprises",
    description:
      "Stop paying 5\u20138% to cannabis-friendly processors. One flat fee, no hidden charges, no rolling reserves.",
    stat: "1%",
    statLabel: "flat fee",
  },
  {
    icon: Shield,
    title: "Compliance Built In",
    description:
      "Every wallet screened against OFAC sanctions. Full audit trail on-chain. Give regulators what they need.",
    stat: "OFAC",
    statLabel: "screening",
  },
  {
    icon: Lock,
    title: "Private Transactions",
    description:
      "Competitor intel is real. TEE-private receipts hide supplier volumes and pricing from on-chain observers.",
    stat: "TEE",
    statLabel: "privacy",
  },
  {
    icon: Globe,
    title: "Multi-State, No Hassle",
    description:
      "Operating in multiple states? One payment rail works everywhere. No state-by-state banking headaches.",
    stat: "50",
    statLabel: "states",
  },
];

const painPoints = [
  {
    icon: Ban,
    problem: "Debanked \u2014 Again",
    detail: "Average cannabis business loses banking 3x in first 2 years",
  },
  {
    icon: Banknote,
    problem: "Cash-Heavy Operations",
    detail: "Armed transport, vault storage, cash counting = $1000s/month",
  },
  {
    icon: DollarSign,
    problem: "Predatory Fees",
    detail: "5\u20138% processing from the few willing processors",
  },
  {
    icon: AlertTriangle,
    problem: "Compliance Risk",
    detail: "Inadequate audit trails invite regulatory scrutiny",
  },
  {
    icon: Clock,
    problem: "Slow Supplier Payments",
    detail: "Multi-day ACH delays strain vendor relationships",
  },
];

const stats = [
  { value: "$34B+", label: "US Legal Cannabis Market" },
  { value: "70%+", label: "Still Cash-Dependent" },
  { value: "$0", label: "Debanking Risk with Offbank" },
  { value: "1%", label: "Flat Processing Fee" },
];

const useCases = [
  {
    name: "Cultivators",
    icon: Leaf,
    detail: "Pay trim crews, suppliers, and equipment vendors",
  },
  {
    name: "Processors",
    icon: Building2,
    detail: "Settle with growers and packaging suppliers",
  },
  {
    name: "Distributors",
    icon: Truck,
    detail: "Pay cultivators and manage multi-state logistics",
  },
  {
    name: "Dispensaries",
    icon: HandCoins,
    detail: "Pay distributors and manage vendor invoices",
  },
];

const comparisonRows = [
  {
    feature: "Bank account required?",
    traditional: "Yes (and it gets closed)",
    offbank: "No bank needed",
  },
  { feature: "Processing fee", traditional: "5\u20138%", offbank: "1% flat" },
  {
    feature: "Settlement time",
    traditional: "3\u20135 business days",
    offbank: "Under 5 seconds",
  },
  {
    feature: "Cash handling costs",
    traditional: "$1,000\u20135,000/mo",
    offbank: "$0",
  },
  {
    feature: "Compliance audit trail",
    traditional: "Paper receipts",
    offbank: "On-chain + exportable",
  },
  {
    feature: "Multi-state support",
    traditional: "Re-apply per state",
    offbank: "Works everywhere",
  },
  {
    feature: "Weekend/holiday",
    traditional: "No processing",
    offbank: "24/7/365",
  },
  {
    feature: "Account closure risk",
    traditional: "High \u2014 at bank\u2019s discretion",
    offbank: "Zero \u2014 non-custodial",
  },
];

const faqItems = [
  {
    q: "Is this legal? How does this comply with cannabis regulations?",
    a: "Offbank processes settlements in USDC (a regulated US dollar stablecoin issued by Circle, a licensed money transmitter). Because Offbank is non-custodial \u2014 we never hold or touch your funds \u2014 we operate as a software tool, not a money services business. Your state cannabis license and existing compliance remain in effect. Every transaction has a full on-chain audit trail that regulators can verify independently.",
  },
  {
    q: "What happens when the SAFE Banking Act passes?",
    a: "When federal banking reform comes, you\u2019ll have options. Until then, you need to operate today. Offbank gives you reliable, instant B2B settlements right now \u2014 and if banks open up, you can still keep using us for the speed, fee savings, and privacy benefits. Most clients find Offbank is better than traditional banking even without the debanking problem.",
  },
  {
    q: "How do my suppliers receive payments? Do they need crypto knowledge?",
    a: "Your suppliers receive USDC to a wallet. They can set up in under 2 minutes using just an email address \u2014 no crypto expertise required. From there they can hold USDC (it\u2019s always worth $1), convert to cash via integrated offramp partners, or transfer to any other wallet. We handle all the blockchain complexity so they don\u2019t have to.",
  },
  {
    q: "How does this compare to paying with cash?",
    a: "Cash costs more than people realize: armored transport ($500\u20132,000/mo), vault/safe costs, cash counting labor, theft/loss risk, and the compliance headache of documenting everything manually. With Offbank, every settlement is instant, trackable, and creates an automatic audit trail. No security vans, no counting rooms, no shrinkage.",
  },
  {
    q: "Can competitors see our payment activity on-chain?",
    a: "Not with privacy mode enabled. Offbank uses TEE-based private transactions (MagicBlock Private Ephemeral Rollups) that hide settlement amounts from on-chain observers while transactions are being processed. Your supplier relationships and pricing remain confidential.",
  },
  {
    q: "What about IRS 280E tax requirements?",
    a: "Every Offbank transaction is recorded on-chain with timestamps and amounts, giving you a clean, immutable record for tax purposes. You can export transaction history for your accountant. This is actually better than cash for 280E documentation since every settlement is independently verifiable.",
  },
];

/* ═══════════════ PAGE ═══════════════ */

export default function CannabisPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Offbank Cannabis B2B Settlements",
            description:
              "Non-custodial USDC settlement infrastructure for cannabis businesses. Pay cultivators, processors, and distributors instantly without bank accounts.",
            provider: {
              "@type": "Organization",
              name: "Offbank",
              url: "https://offbankpay.com",
            },
            serviceType: "Cannabis Payment Processing",
            areaServed: "US",
            url: "https://offbankpay.com/industries/cannabis",
          }),
        }}
      />

      <Navbar />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(27,107,74,0.10),transparent)]" />
        </div>
        <div className="absolute right-[15%] top-[20%] h-72 w-72 rounded-full bg-[#34c759]/[0.06] blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#34c759]/20 bg-[#34c759]/[0.06] px-4 py-2">
                <Leaf className="h-4 w-4 text-[#2ba048]" />
                <span className="text-sm font-medium text-[#2ba048]">
                  Cannabis &amp; Wholesalers
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1
                className="mb-6 text-5xl font-bold leading-[1.08] text-[#212121] md:text-7xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Stop getting <span className="text-[#34c759]">debanked.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[#8a8a8a]">
                Pay cultivators, processors, and distributors instantly in USDC.
                No bank account required. No account to freeze. No cash vans.
                Just fast, compliant B2B settlements that actually work for
                cannabis.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  }}
                >
                  Get started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d3d3d3] bg-white px-7 py-3.5 font-semibold text-[#212121] transition-all hover:bg-[#f2f2f2]"
                >
                  See the Demo
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#8a8a8a]">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-[#2ba048]" />
                  GENIUS Act Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#2ba048]" />
                  Non-Custodial
                </span>
                <span className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-[#2ba048]" />
                  Full Audit Trail
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───── Stats ───── */}
      <section className="border-y border-[#d3d3d3] bg-white px-4 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05}>
              <div className="text-center">
                <div
                  className="mb-1 text-3xl font-bold text-[#212121] md:text-4xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[#8a8a8a]">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───── Pain Points ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-4 text-3xl font-bold text-[#212121] md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The cannabis banking{" "}
              <span className="text-[#B91C1C]">crisis is real</span>
            </h2>
            <p className="mb-12 max-w-2xl text-[#8a8a8a]">
              Your business is legal. Your licenses are current. Yet banks keep
              closing your accounts, and the processors who&apos;ll work with
              you charge extortionate fees.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {painPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <Reveal key={point.problem} delay={i * 0.05}>
                  <div className="rounded-xl border border-[#B91C1C]/15 bg-[#FEF2F2] p-5">
                    <Icon className="mb-3 h-6 w-6 text-[#B91C1C]" />
                    <h3 className="mb-1 text-sm font-semibold text-[#212121]">
                      {point.problem}
                    </h3>
                    <p className="text-xs text-[#8a8a8a]">{point.detail}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-4 text-3xl font-bold text-[#212121] md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Payments that can&apos;t be shut down.
            </h2>
            <p className="mb-12 max-w-2xl text-[#8a8a8a]">
              Non-custodial means no bank, no processor, and no single point of
              failure can freeze your settlement rail.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.05}>
                  <div className="rounded-2xl border border-[#d3d3d3] bg-white p-6 transition-colors hover:bg-[#f2f2f2]">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-[#34c759]/[0.08] p-2.5">
                        <Icon className="h-5 w-5 text-[#2ba048]" />
                      </div>
                      <div className="text-right">
                        <span
                          className="text-2xl font-bold text-[#212121]"
                          style={{
                            fontFamily: "var(--font-heading)",
                          }}
                        >
                          {f.stat}
                        </span>
                        <span className="ml-1.5 text-xs text-[#8a8a8a]">
                          {f.statLabel}
                        </span>
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold text-[#212121]">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#8a8a8a]">{f.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="border-y border-[#d3d3d3] bg-white px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-4 text-3xl font-bold text-[#212121] md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How cannabis B2B settlements work
            </h2>
            <p className="mb-12 max-w-2xl text-[#8a8a8a]">
              No bank relationship needed. No merchant account application. Set
              up in minutes.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Create Invoice",
                desc: "Enter amount, add your supplier\u2019s email. That\u2019s it.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Supplier Gets Link",
                desc: "They receive a settlement link. Pay with USDC \u2014 no wallet needed.",
                icon: Globe,
              },
              {
                step: "03",
                title: "Instant Settlement",
                desc: "Settlement finalizes in under 5 seconds on Solana. Both parties see confirmation.",
                icon: Zap,
              },
              {
                step: "04",
                title: "Audit Trail Ready",
                desc: "Every settlement timestamped on-chain. Export for compliance, taxes, regulators.",
                icon: Scale,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.step} delay={i * 0.08}>
                  <div className="rounded-2xl border border-[#d3d3d3] bg-[#f2f2f2] p-6">
                    <div
                      className="mb-4 text-4xl font-bold text-[#34c759]/20"
                      style={{
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {item.step}
                    </div>
                    <div className="mb-3 inline-flex rounded-lg bg-[#34c759]/[0.08] p-2.5">
                      <Icon className="h-5 w-5 text-[#2ba048]" />
                    </div>
                    <h3 className="mb-2 font-semibold text-[#212121]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#8a8a8a]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Use Cases ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-10 text-center text-3xl font-bold text-[#212121]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Built for every part of the supply chain
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <Reveal key={uc.name} delay={i * 0.05}>
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#d3d3d3] bg-white p-6 text-center transition-colors hover:border-[#34c759]/30">
                    <div className="rounded-lg bg-[#34c759]/[0.08] p-3">
                      <Icon className="h-6 w-6 text-[#2ba048]" />
                    </div>
                    <span className="font-semibold text-[#212121]">
                      {uc.name}
                    </span>
                    <span className="text-xs text-[#8a8a8a]">{uc.detail}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Comparison Table ───── */}
      <section className="border-y border-[#d3d3d3] bg-white px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2
              className="mb-10 text-center text-3xl font-bold text-[#212121] md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Traditional Banking vs.{" "}
              <span className="text-[#34c759]">Offbank</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-[#d3d3d3]">
              <div className="grid grid-cols-3 border-b border-[#d3d3d3] bg-[#f2f2f2]">
                <div className="p-4 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Feature
                </div>
                <div className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-[#B91C1C]">
                  Traditional
                </div>
                <div className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-[#2ba048]">
                  Offbank
                </div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${
                    i !== comparisonRows.length - 1
                      ? "border-b border-[#d3d3d3]"
                      : ""
                  }`}
                >
                  <div className="p-4 text-sm text-[#212121]">
                    {row.feature}
                  </div>
                  <div className="p-4 text-center text-sm text-[#8a8a8a]">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-center text-sm font-medium text-[#2ba048]">
                    {row.offbank}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2
              className="mb-4 text-center text-3xl font-bold text-[#212121] md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="mb-10 text-center text-[#8a8a8a]">
              We know the cannabis industry has unique concerns. Here are the
              questions we hear most.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[#d3d3d3] bg-white px-6">
              {faqItems.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-[#212121]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(27,107,74,0.15),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h2
            className="mb-6 text-3xl font-bold text-white md:text-4xl"
            style={{
              fontFamily: "var(--font-heading)",
              color: "#FFFFFF",
            }}
          >
            Your business is legal.{" "}
            <span className="text-[#34c759]">Your payments should be too.</span>
          </h2>
          <p className="mb-8 text-lg text-[#8a8a8a]">
            Join cannabis operators moving from cash and unreliable banks to
            instant, compliant USDC settlements. Set up in minutes, not months.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
              }}
            >
              Get started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Read the Docs
            </Link>
          </div>
          <p className="mt-6 text-xs text-[#8a8a8a]/60">
            Non-custodial \u00b7 GENIUS Act compliant \u00b7 Full audit trail
            \u00b7 No bank account needed
          </p>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
