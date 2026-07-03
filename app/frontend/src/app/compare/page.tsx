"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  Minus,
  Clock,
  DollarSign,
  FileText,
  BarChart3,
  Bell,
  RefreshCw,
  Zap,
  Building2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* --- Reveal helper --- */
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

/* --- Comparison data --- */
const providers = [
  { name: "Offbank", highlight: true },
  { name: "LeafLink + ACH" },
  { name: "High-risk processor" },
  { name: "Generic crypto gateway" },
];

const features: {
  category: string;
  rows: {
    label: string;
    values: (string | boolean | null)[];
    note?: string;
  }[];
}[] = [
  {
    category: "Workflow",
    rows: [
      {
        label: "Built for cannabis wholesale",
        values: [true, "Partially", false, false],
        note: "Offbank is purpose-built for cannabis B2B. LeafLink is a marketplace with payment add-ons. High-risk processors and crypto gateways are industry-agnostic.",
      },
      {
        label: "Order-to-cash workflow",
        values: ["Full", "Partial", false, false],
        note: "Offbank covers PO creation, invoice generation, payment collection, reminders, reconciliation, and settlement in one workflow.",
      },
      {
        label: "Invoice creation",
        values: [true, "Limited", false, false],
      },
      {
        label: "Automated collection reminders",
        values: [true, false, false, false],
      },
      {
        label: "Receivables visibility",
        values: [true, "Limited", false, false],
        note: "AR aging, outstanding balances, and payment status across all buyers, in one dashboard.",
      },
      {
        label: "Reconciliation",
        values: [true, "Partial", "Manual", "Manual"],
      },
    ],
  },
  {
    category: "Settlement & Cost",
    rows: [
      {
        label: "Time to cash",
        values: ["Seconds", "Days to weeks", "3-7 business days", "Seconds"],
        note: "Offbank settles on Solana in under 2 seconds. ACH takes 2-5 business days. High-risk processors hold funds 3-7 days plus rolling reserves.",
      },
      {
        label: "Processing fees",
        values: ["1% flat", "Varies", "5-9%+", "0.5-2%"],
        note: "High-risk merchant accounts for cannabis typically charge 5-9% with rolling reserves of 10-20% held for up to 6 months.",
      },
      {
        label: "Rolling reserves",
        values: [false, false, "10-20%", false],
      },
      {
        label: "Monthly fees",
        values: ["$0", "Varies", "$50-$500+", "From $0"],
      },
      {
        label: "Weekend & holiday settlement",
        values: [true, false, false, true],
      },
      {
        label: "Cost on $500K/month",
        values: ["$5,000", "Varies", "$25K-$45K", "$2.5K-$10K"],
        note: "A cannabis distributor processing $500K/month pays $5,000 on Offbank vs. $25,000-$45,000 on a typical high-risk processor.",
      },
    ],
  },
  {
    category: "Risk & Reliability",
    rows: [
      {
        label: "Bank dependency",
        values: ["Lower", "High", "High", "Lower"],
        note: "Offbank uses non-custodial stablecoin settlement. Funds move wallet-to-wallet without requiring bank intermediaries for the transaction itself.",
      },
      {
        label: "Account freeze risk",
        values: ["None", "Moderate", "High", "Low"],
        note: "62% of cannabis businesses have had at least one bank account closed. Non-custodial settlement eliminates this risk for the payment itself.",
      },
      {
        label: "Chargeback exposure",
        values: [false, "ACH returns possible", true, false],
      },
      {
        label: "Early-pay incentives",
        values: [true, false, false, false],
        note: "Offer buyers discount terms for faster payment, reduces time-to-cash and improves working capital.",
      },
    ],
  },
];

function CellValue({ value }: { value: string | boolean | null }) {
  if (value === true)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#34c759]/15">
        <Check className="h-3.5 w-3.5 text-[#34c759]" />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e74c3c]/10">
        <X className="h-3.5 w-3.5 text-[#e74c3c]/60" />
      </span>
    );
  if (value === null) return <Minus className="h-4 w-4 text-[#8a8a8a]/60" />;
  return <span className="text-sm text-[#5c5c5c]">{value}</span>;
}

/* ====== PAGE ====== */
export default function ComparePage() {
  return (
    <main
      className="relative min-h-screen bg-[#FFFFFF] text-[#5c5c5c] antialiased"
      style={{
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "How Offbank Compares, Cannabis Wholesale Payment Workflows",
            description:
              "Compare Offbank to LeafLink + ACH, high-risk processors, and generic crypto gateways for cannabis wholesale order-to-cash workflows.",
            url: "https://offbankpay.com/compare",
            mainEntity: {
              "@type": "Table",
              about:
                "Comparison of cannabis wholesale payment workflows: Offbank, LeafLink + ACH, high-risk processors, and generic crypto gateways",
            },
          }),
        }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#34c759]/[0.04] blur-[150px]" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#34c759]">
              Cannabis wholesale payments
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight text-[#212121] md:text-5xl lg:text-6xl">
              How Offbank compares to{" "}
              <span className="text-[#34c759]">legacy payment workflows</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#8a8a8a]">
              Cannabis wholesalers don&apos;t need another generic payment
              gateway. They need a faster way to invoice, collect, reconcile, and
              turn orders into cash.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "Get paid in seconds, not days",
              text: "Instant settlement instead of waiting on ACH, wires, or processor delays.",
              color: "#34c759",
            },
            {
              icon: DollarSign,
              title: "Lower the cost of getting paid",
              text: "1% flat instead of high-risk processing fees that can reach 5-9%+.",
              color: "#34c759",
            },
            {
              icon: FileText,
              title: "Turn invoices into cash faster",
              text: "Built for collections, reminders, reconciliation, and receivables visibility.",
              color: "#3B82F6",
            },
            {
              icon: Building2,
              title: "Reduce dependency on fragile rails",
              text: "Less reliance on slow banking workflows and manual follow-up.",
              color: "#3B82F6",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div
                className="rounded-xl border-l-2 bg-[#f2f2f2] p-5"
                style={{ borderColor: item.color }}
              >
                <item.icon
                  className="mb-2 h-5 w-5"
                  style={{ color: item.color }}
                />
                <p className="text-sm font-semibold text-[#212121]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#8a8a8a]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Intro copy */}
      <section className="mx-auto max-w-3xl px-6 pb-12">
        <Reveal>
          <p className="text-center text-[15px] leading-relaxed text-[#8a8a8a]">
            Most cannabis wholesalers are stitching together marketplaces, ACH,
            processors, spreadsheets, and manual follow-up just to get paid.
            Offbank brings invoicing, collections, reconciliation, and instant
            settlement into one workflow.
          </p>
        </Reveal>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {features.map((section, si) => (
          <Reveal key={section.category} delay={si * 0.05}>
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-[#212121]">
                {section.category}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d3d3d3]">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#d3d3d3] bg-[#f2f2f2]">
                      <th className="py-3 pl-5 pr-3 text-left text-xs font-medium uppercase tracking-wider text-[#8a8a8a]">
                        Feature
                      </th>
                      {providers.map((p) => (
                        <th
                          key={p.name}
                          className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                            p.highlight ? "text-[#34c759]" : "text-[#8a8a8a]"
                          }`}
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={row.label}
                        className={`border-b border-[#d3d3d3] ${
                          ri % 2 === 0 ? "" : "bg-[#f2f2f2]"
                        }`}
                      >
                        <td className="py-3.5 pl-5 pr-3">
                          <span className="text-sm text-[#5c5c5c]">
                            {row.label}
                          </span>
                          {row.note && (
                            <p className="mt-0.5 text-[10px] leading-tight text-[#8a8a8a]/60">
                              {row.note}
                            </p>
                          )}
                        </td>
                        {row.values.map((val, vi) => (
                          <td
                            key={vi}
                            className={`px-3 py-3.5 text-center ${
                              vi === 0 ? "bg-[#34c759]/[0.03]" : ""
                            }`}
                          >
                            <CellValue value={val} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Supporting copy */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Reveal>
          <div className="rounded-2xl border border-[#d3d3d3] bg-[#f2f2f2] p-8 sm:p-10">
            <p className="text-[15px] leading-relaxed text-[#5c5c5c]">
              Offbank is not just another way to move money. It is built to help
              cannabis wholesalers get paid faster. Instead of relying on a
              patchwork of ACH, processors, manual invoice chasing, and
              disconnected reconciliation, Offbank gives operators one
              order-to-cash workflow: create the invoice, collect the payment,
              track receivables, automate follow-up, reconcile transactions, and
              settle instantly when speed matters.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Why wholesalers switch */}
      <section className="border-t border-[#d3d3d3] bg-[#f2f2f2]">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight text-[#212121] md:text-4xl">
              Why wholesalers switch
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-4 max-w-xl text-center text-[#8a8a8a]">
              Wholesalers don&apos;t change payment workflows because the
              technology is interesting. They change when the current process is
              too slow, too expensive, or too painful to manage.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-12 max-w-lg space-y-5">
              {[
                {
                  icon: Clock,
                  text: "Reduce time-to-cash from days to seconds",
                },
                {
                  icon: Bell,
                  text: "Stop chasing invoices manually",
                },
                {
                  icon: DollarSign,
                  text: "Lower high-risk processing costs from 5-9% to 1%",
                },
                {
                  icon: BarChart3,
                  text: "Gain visibility into outstanding receivables",
                },
                {
                  icon: RefreshCw,
                  text: "Offer faster payment options when cashflow matters",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm"
                  style={{ border: "1px solid #d3d3d3" }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#34c759]/10">
                    <item.icon className="h-5 w-5 text-[#34c759]" />
                  </div>
                  <p className="text-sm font-medium text-[#212121] leading-relaxed pt-2">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#d3d3d3] bg-gradient-to-b from-white to-[#f2f2f2]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-[#212121] md:text-4xl">
              Get paid faster on wholesale orders
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-4 max-w-lg text-[#8a8a8a]">
              See how Offbank shortens time-to-cash for cannabis wholesalers. One
              workflow for invoicing, collections, reconciliation, and instant
              settlement.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#34c759]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                }}
              >
                See Offbank in action
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d3d3d3] px-7 py-3.5 text-[15px] font-medium text-[#5c5c5c] transition-colors hover:bg-[#f2f2f2] hover:text-[#212121]"
              >
                Book a demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
