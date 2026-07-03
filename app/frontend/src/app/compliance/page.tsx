"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  ArrowRight,
  Shield,
  Scale,
  FileCheck,
  Fingerprint,
  Building2,
  Eye,
  Lock,
  CheckCircle2,
  BookOpen,
  Globe,
  AlertTriangle,
  Stamp,
  ChevronDown,
} from "lucide-react";

/* ─── palette ─── */
const palette = {
  cream: "#FFFFFF",
  navy: "#212121",
  slate: "#5c5c5c",
  muted: "#8a8a8a",
  green: "#2ba048",
  gold: "#d29500",
  cardBorder: "#d3d3d3",
  red: "#B91C1C",
};

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

/* ─── Reveal wrapper ─── */
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
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section anchor component ─── */
function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-32" />;
}

/* ─── Compliance badge ─── */
function ComplianceBadge({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#34c759]/20 bg-[#34c759]/[0.08] px-3 py-1">
      <Icon className="h-3.5 w-3.5 text-[#2ba048]" />
      <span
        className="text-[11px] font-semibold uppercase tracking-wider text-[#2ba048]"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Timeline item ─── */
function TimelineItem({
  step,
  title,
  description,
  children,
  last = false,
}: {
  step: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative pl-10">
      {/* connector line */}
      {!last && (
        <div
          className="absolute left-[15px] top-10 h-[calc(100%_-_8px)] w-px"
          style={{ backgroundColor: palette.cardBorder }}
        />
      )}
      {/* dot */}
      <div
        className="absolute left-2 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: palette.green }}
      >
        {step}
      </div>
      <h4
        className="text-base font-semibold leading-snug"
        style={{
          color: palette.navy,
          fontFamily: "var(--font-heading)",
        }}
      >
        {title}
      </h4>
      <p
        className="mt-1 text-sm leading-relaxed"
        style={{ color: palette.slate }}
      >
        {description}
      </p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPLIANCE WHITEPAPER PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function CompliancePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.cream }}>
      {/* FAQPage schema for compliance FAQ */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is Offbank a money transmitter?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Offbank is a non-custodial technology provider. Under FinCEN guidance FIN-2019-G001, non-custodial software that facilitates peer-to-peer transfers is not classified as a money transmitter.",
                },
              },
              {
                "@type": "Question",
                name: "How does Offbank screen wallets against OFAC sanctions?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Every wallet address is screened against OFAC SDN, Consolidated, and Non-SDN lists in real-time before any transaction is processed. Fuzzy matching at 90%+ confidence triggers manual review.",
                },
              },
              {
                "@type": "Question",
                name: "What happens if suspicious activity is detected on Offbank?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The transaction is held pending investigation. If confirmed, a SAR is filed with FinCEN within 30 calendar days. The merchant account may be restricted or terminated.",
                },
              },
              {
                "@type": "Question",
                name: "What KYB documentation do cannabis businesses need for Offbank?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Cannabis businesses must provide Articles of Incorporation, EIN/Tax ID, state business and cannabis licenses, beneficial owner IDs, proof of address, bank verification, and Metrc/BioTrack license number.",
                },
              },
              {
                "@type": "Question",
                name: "Is USDC safe to use for regulated businesses?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. USDC is issued by Circle, registered with FinCEN, GENIUS Act 2025 compliant, with reserves held in U.S. Treasury obligations and cash, attested monthly by a Big Four accounting firm.",
                },
              },
            ],
          }),
        }}
      />
      {/* Article schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Offbank Compliance Documentation - AML Program, KYB, Transaction Monitoring & SAR Process",
            description:
              "Complete compliance documentation for Offbank: AML program structure, KYB verification, OFAC screening, transaction monitoring typologies, SAR filing procedures, and record retention policy.",
            author: {
              "@type": "Organization",
              name: "Offbank",
              url: "https://offbankpay.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Offbank",
              url: "https://offbankpay.com",
            },
            datePublished: "2025-12-01",
            dateModified: "2026-02-27",
          }),
        }}
      />
      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://offbankpay.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Compliance",
                item: "https://offbankpay.com/compliance",
              },
            ],
          }),
        }}
      />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-20 pt-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="mb-6 flex items-center justify-center gap-3">
              <ComplianceBadge label="2026 Whitepaper" icon={BookOpen} />
              <ComplianceBadge label="v2.1" icon={FileCheck} />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1
              className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              Compliance Without
              <br />
              <span style={{ color: palette.green }}>Compromise</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
              style={{ color: palette.slate }}
            >
              How Offbank achieves full regulatory compliance for
              restricted-commerce B2B settlements - without custody, without
              banks, and without compromising on speed or privacy.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-4">
              {[
                { href: "#genius-act", label: "GENIUS Act" },
                { href: "#bsa-aml", label: "BSA/AML" },
                { href: "#aml-program", label: "AML Program" },
                { href: "#kyb", label: "KYB Process" },
                { href: "#transaction-monitoring", label: "Monitoring" },
                { href: "#sar-process", label: "SAR Filing" },
                { href: "#record-retention", label: "Records" },
                { href: "#architecture", label: "Architecture" },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-white/60"
                  style={{
                    borderColor: palette.cardBorder,
                    color: palette.navy,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── EXECUTIVE SUMMARY ── */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl border p-8 sm:p-10"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5" style={{ color: palette.green }} />
                <h2
                  className="text-xl font-bold"
                  style={{
                    color: palette.navy,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Executive Summary
                </h2>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: palette.slate }}
              >
                Offbank is a <strong>non-custodial</strong> settlement protocol -
                a software layer, not a money services business. We never hold,
                pool, or have unilateral control over user funds. Payments move
                directly between counterparties via on-chain smart contracts on
                Solana.
              </p>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: palette.slate }}
              >
                This architecture means Offbank is{" "}
                <strong>not a money transmitter</strong> under federal FinCEN
                guidance (FIN-2019-G001) or the majority of state money
                transmission statutes. We are a technology provider that
                facilitates peer-to-peer stablecoin transfers with embedded
                compliance tooling.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Non-Custodial", icon: Lock },
                  { label: "No MTL Required", icon: Building2 },
                  { label: "USDC: GENIUS Act Compliant", icon: Shield },
                  { label: "Full Audit Trail", icon: Eye },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center"
                    style={{ borderColor: palette.cardBorder }}
                  >
                    <item.icon
                      className="h-4 w-4"
                      style={{ color: palette.green }}
                    />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: palette.navy }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INFRASTRUCTURE PARTNERS ── */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl border p-8 sm:p-10"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: palette.cream,
              }}
            >
              <p
                className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: palette.muted }}
              >
                Settlement infrastructure
              </p>
              <div className="flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-16">
                {/* Circle USDC */}
                <a
                  href="https://www.circle.com/usdc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <img
                    src="/usdc-logo.png"
                    alt="Circle USDC logo"
                    className="h-10 w-auto object-contain sm:h-12"
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: palette.navy }}
                  >
                    Powered by Circle USDC
                  </span>
                  <span
                    className="max-w-[200px] text-center text-[11px] leading-snug"
                    style={{ color: palette.muted }}
                  >
                    Fully-reserved, GENIUS Act compliant stablecoin backed by
                    U.S. Treasuries
                  </span>
                </a>

                <div
                  className="hidden h-20 w-px sm:block"
                  style={{ background: palette.cardBorder }}
                />

                {/* Solana */}
                <a
                  href="https://solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <img
                    src="/solana-logo.png"
                    alt="Solana logo"
                    className="h-10 w-auto object-contain sm:h-12"
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: palette.navy }}
                  >
                    Built on Solana
                  </span>
                  <span
                    className="max-w-[200px] text-center text-[11px] leading-snug"
                    style={{ color: palette.muted }}
                  >
                    Sub-second finality with immutable, auditable transaction
                    records
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 1 - GENIUS ACT
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="genius-act" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 1
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              GENIUS Act of 2025
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              The{" "}
              <strong>
                Guiding and Establishing National Innovation for U.S.
                Stablecoins (GENIUS) Act
              </strong>
              , signed into law in 2025, established the first comprehensive
              federal framework for payment stablecoins in the United States.
              Here is how Offbank aligns with every major provision.
            </p>
          </Reveal>

          <div className="mt-12 space-y-8">
            {[
              {
                title: "Permitted Payment Stablecoins Only",
                description:
                  "Offbank exclusively uses USDC issued by Circle - a fully reserved, audited, and GENIUS Act-compliant payment stablecoin. We do not support algorithmic, offshore, or unregistered stablecoins. Every dollar that flows through Offbank is backed 1:1 by U.S. Treasury obligations and cash equivalents.",
                badge: "§3 - Definitions",
              },
              {
                title: "Issuer Compliance Requirements",
                description:
                  "Circle, as the USDC issuer, maintains registration with FinCEN, state-level licenses, and undergoes monthly reserve attestations by a Big Four accounting firm. Offbank verifies that all stablecoins routed through our protocol originate from compliant issuers - a check embedded at the smart contract level.",
                badge: "§4 - Registration",
              },
              {
                title: "Redemption Guarantees",
                description:
                  "USDC provides 1:1 redemption to U.S. dollars on demand. Because Offbank is non-custodial, recipients can redeem their USDC directly through Circle or any compliant on-ramp/off-ramp. We never create a redemption bottleneck - there is no pooling, no lock-up, and no withdrawal queue.",
                badge: "§5 - Redemption",
              },
              {
                title: "Reserve & Transparency Requirements",
                description:
                  "Circle publishes monthly reserve reports and undergoes annual audits under the GENIUS Act's transparency mandate. Offbank surfaces this information in our compliance dashboard, giving operators direct visibility into the backing of every dollar settled on our rails.",
                badge: "§6 - Reserves",
              },
              {
                title: "Consumer & Business Protection",
                description:
                  "By operating non-custodially on public blockchain infrastructure (Solana), every Offbank transaction produces an immutable, timestamped receipt. Both counterparties can independently verify settlement status, amount, and timing - no reliance on Offbank's systems for proof of payment.",
                badge: "§8 - Protection",
              },
              {
                title: "Interoperability & Open Standards",
                description:
                  "Offbank is built on Solana's public, permissionless infrastructure using open-source smart contracts. Our protocol is interoperable with any wallet, exchange, or DeFi protocol that supports SPL tokens. No vendor lock-in, no proprietary rails, no walled gardens.",
                badge: "§10 - Interoperability",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3
                      className="text-lg font-bold"
                      style={{
                        color: palette.navy,
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        borderColor: palette.green + "33",
                        color: palette.green,
                        fontFamily: "var(--font-jetbrains), monospace",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 - BSA/AML
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="bsa-aml" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Eye className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 2
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              BSA/AML Framework
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              While Offbank is not a money transmitter, we proactively implement
              Bank Secrecy Act and Anti-Money Laundering controls as a matter of
              principles - and because our customers in restricted industries
              need this protection to operate confidently.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Fingerprint,
                title: "OFAC Screening",
                description:
                  "Every wallet address is screened against the OFAC SDN (Specially Designated Nationals) list before a transaction is processed. Blocked wallets cannot initiate or receive payments through Offbank. Screening runs in real-time, not in batch.",
              },
              {
                icon: AlertTriangle,
                title: "Transaction Monitoring",
                description:
                  "Offbank monitors settlement patterns for anomalous activity - unusual volumes, rapid-fire transactions, structuring patterns, and sanctioned-jurisdiction exposure. Flagged transactions are held for manual review before settlement.",
              },
              {
                icon: FileCheck,
                title: "Suspicious Activity Reporting",
                description:
                  "When transaction monitoring surfaces activity consistent with money laundering, structuring, or sanctions evasion, Offbank files Suspicious Activity Reports (SARs) with FinCEN. Our compliance team maintains direct filing capability.",
              },
              {
                icon: Globe,
                title: "Jurisdiction Controls",
                description:
                  "Offbank enforces geographic restrictions at the protocol level. IP geolocation and wallet provenance checks block transactions originating from OFAC-sanctioned jurisdictions (Cuba, Iran, North Korea, Syria, Crimea, et al.).",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <item.icon
                    className="mb-3 h-5 w-5"
                    style={{ color: palette.green }}
                  />
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: palette.navy,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* AML compliance timeline */}
          <Reveal delay={0.1}>
            <div
              className="mt-10 rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <h3
                className="mb-6 text-lg font-bold"
                style={{
                  color: palette.navy,
                  fontFamily: "var(--font-heading)",
                }}
              >
                Transaction Lifecycle - AML Controls
              </h3>
              <div className="space-y-6">
                <TimelineItem
                  step="1"
                  title="Pre-Transaction Screening"
                  description="Both sender and receiver wallets are screened against OFAC SDN, UN sanctions lists, and known high-risk addresses. Blocked wallets are rejected before any on-chain activity occurs."
                />
                <TimelineItem
                  step="2"
                  title="Real-Time Risk Scoring"
                  description="Each transaction receives a risk score based on amount, counterparty history, geographic signals, and pattern analysis. Scores above threshold trigger enhanced review."
                />
                <TimelineItem
                  step="3"
                  title="Settlement Execution"
                  description="Approved transactions are routed through on-chain smart contracts. The settlement instruction, compliance metadata, and timestamps are embedded in the transaction - immutable and auditable."
                />
                <TimelineItem
                  step="4"
                  title="Post-Settlement Audit"
                  description="Completed settlements are logged with full compliance stamps (KYB status, OFAC screening result, risk score, timestamp). This data is available via API and dashboard for auditor access."
                  last
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2B - AML COMPLIANCE PROGRAM
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="aml-program" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Scale className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                AML Program
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              AML Compliance Program
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Offbank maintains a written Anti-Money Laundering Compliance
              Program modeled on FinCEN&apos;s five-pillar framework. Even
              though our non-custodial architecture likely exempts us from MSB
              registration, we hold ourselves to MSB-grade standards because our
              customers - cannabis operators and other restricted businesses -
              need a payment provider they can hand to an auditor without
              hesitation.
            </p>
          </Reveal>

          <div className="mt-10 space-y-6">
            {[
              {
                title: "Pillar 1 - Designated Compliance Officer",
                description:
                  "Offbank designates a qualified Compliance Officer responsible for the day-to-day administration of the AML program, including policy updates, staff training, and regulatory reporting. The Compliance Officer reports directly to the CEO and has authority to halt transactions pending investigation. Current CO credentials and contact are available to regulators and KYB-verified merchants upon request.",
              },
              {
                title: "Pillar 2 - Internal Policies, Procedures & Controls",
                description:
                  "Our AML program includes documented procedures for: (a) customer onboarding and KYB verification, (b) ongoing transaction monitoring and risk scoring, (c) OFAC and sanctions list screening, (d) SAR identification, investigation, and filing, (e) record retention and document management, (f) escalation protocols for high-risk transactions, and (g) periodic policy review and update (minimum annually). All procedures are version-controlled and audit-logged.",
              },
              {
                title: "Pillar 3 - Training Program",
                description:
                  "All Offbank employees with access to customer data or transaction systems complete AML/BSA training at onboarding and annually thereafter. Training covers: identifying red flags for money laundering and terrorist financing, SAR filing obligations, OFAC compliance requirements, cannabis-industry-specific AML considerations, and proper escalation procedures. Training completion is documented and retained for 5 years.",
              },
              {
                title: "Pillar 4 - Independent Testing",
                description:
                  "Offbank engages independent third-party auditors to test AML program effectiveness at least annually. Testing scope includes: review of KYB procedures, sample testing of OFAC screening results, evaluation of transaction monitoring thresholds and alert resolution, SAR filing timeliness and completeness, and staff training adequacy. Audit findings are tracked to remediation.",
              },
              {
                title: "Pillar 5 - Risk-Based Customer Due Diligence",
                description:
                  "Every Offbank merchant receives a risk rating at onboarding (Standard, Elevated, or High) based on: industry classification, geographic exposure, expected transaction volume and velocity, beneficial ownership complexity, and adverse media screening results. High-risk merchants receive Enhanced Due Diligence (EDD) including quarterly re-verification, lower transaction monitoring thresholds, and manual review of transactions above $10,000.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: palette.navy,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Risk classification table */}
          <Reveal delay={0.15}>
            <div
              className="mt-10 overflow-hidden rounded-2xl border"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <div
                className="border-b p-4 sm:p-6"
                style={{ borderColor: palette.cardBorder }}
              >
                <h3
                  className="text-base font-bold"
                  style={{
                    color: palette.navy,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Merchant Risk Classification Matrix
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      {["Factor", "Standard", "Elevated", "High"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                          style={{ color: palette.muted }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        factor: "KYB Re-verification",
                        standard: "Annually",
                        elevated: "Semi-annually",
                        high: "Quarterly",
                      },
                      {
                        factor: "Transaction Review Threshold",
                        standard: "$50,000/day",
                        elevated: "$25,000/day",
                        high: "$10,000/day",
                      },
                      {
                        factor: "Manual Review Trigger",
                        standard: "Score ≥ 80",
                        elevated: "Score ≥ 60",
                        high: "Score ≥ 40",
                      },
                      {
                        factor: "OFAC Screening Frequency",
                        standard: "Per-transaction",
                        elevated: "Per-transaction",
                        high: "Per-transaction + daily batch",
                      },
                      {
                        factor: "Adverse Media Monitoring",
                        standard: "Monthly",
                        elevated: "Weekly",
                        high: "Daily",
                      },
                      {
                        factor: "Beneficial Ownership Refresh",
                        standard: "Annually",
                        elevated: "Semi-annually",
                        high: "Quarterly + event-driven",
                      },
                    ].map((row) => (
                      <tr
                        key={row.factor}
                        className="border-t"
                        style={{ borderColor: palette.cardBorder }}
                      >
                        <td
                          className="px-4 py-3 font-medium sm:px-6"
                          style={{ color: palette.navy }}
                        >
                          {row.factor}
                        </td>
                        <td
                          className="px-4 py-3 sm:px-6"
                          style={{ color: palette.slate }}
                        >
                          {row.standard}
                        </td>
                        <td
                          className="px-4 py-3 sm:px-6"
                          style={{ color: palette.slate }}
                        >
                          {row.elevated}
                        </td>
                        <td
                          className="px-4 py-3 sm:px-6"
                          style={{ color: palette.slate }}
                        >
                          {row.high}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 - KYB PROCESS
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="kyb" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 3
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              KYB Verification Process
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Every business on Offbank goes through Know Your Business
              verification before their first settlement. This is non-negotiable
              - even for industries that banks refuse to serve.
            </p>
          </Reveal>

          <div className="mt-12 space-y-6">
            {[
              {
                step: "1",
                title: "Business Entity Verification",
                description:
                  "We verify the legal existence and good standing of the business entity - articles of incorporation, state registrations, EIN confirmation, and operating licenses. For cannabis operators, this includes state cannabis license verification.",
              },
              {
                step: "2",
                title: "Beneficial Ownership Identification",
                description:
                  "All individuals with 25%+ ownership or significant management control are identified and verified. We collect government-issued ID, proof of address, and run identity verification checks against public records and watchlists.",
              },
              {
                step: "3",
                title: "Industry-Specific Compliance",
                description:
                  "For cannabis businesses: state license verification, Metrc/BioTrack integration capability, and confirmation of operation within legal state boundaries.",
              },
              {
                step: "4",
                title: "Bank & Financial Verification",
                description:
                  "We verify that the business has a legitimate banking relationship (or is actively seeking one - many of our customers are underbanked by design of the traditional system). Off-ramp and on-ramp pathways are established during onboarding.",
              },
              {
                step: "5",
                title: "Ongoing Monitoring",
                description:
                  "KYB is not a one-time check. Offbank performs periodic re-verification (quarterly for restricted industries), monitors for adverse media, regulatory actions, and changes in ownership structure. License expirations trigger automatic review.",
                last: true,
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <TimelineItem
                  step={item.step}
                  title={item.title}
                  description={item.description}
                  last={item.last || false}
                />
              </Reveal>
            ))}
          </div>

          {/* KYB data table */}
          <Reveal delay={0.15}>
            <div
              className="mt-10 overflow-hidden rounded-2xl border"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <div
                className="border-b p-4 sm:p-6"
                style={{ borderColor: palette.cardBorder }}
              >
                <h3
                  className="text-base font-bold"
                  style={{
                    color: palette.navy,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Required KYB Documentation
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      <th
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                        style={{ color: palette.muted }}
                      >
                        Document
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                        style={{ color: palette.muted }}
                      >
                        Standard
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                        style={{ color: palette.muted }}
                      >
                        Cannabis
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        doc: "Articles of Incorporation",
                        standard: true,
                        cannabis: true,
                      },
                      { doc: "EIN / Tax ID", standard: true, cannabis: true },
                      {
                        doc: "State Business License",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Cannabis License (State)",
                        standard: false,
                        cannabis: true,
                      },
                      {
                        doc: "Beneficial Owner IDs",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Proof of Address",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Bank Account Verification",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Metrc/BioTrack License #",
                        standard: false,
                        cannabis: true,
                      },
                    ].map((row, i) => (
                      <tr
                        key={row.doc}
                        className="border-t"
                        style={{ borderColor: palette.cardBorder }}
                      >
                        <td
                          className="px-4 py-3 font-medium sm:px-6"
                          style={{ color: palette.navy }}
                        >
                          {row.doc}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          {row.standard ? (
                            <CheckCircle2
                              className="h-4 w-4"
                              style={{ color: palette.green }}
                            />
                          ) : (
                            <span style={{ color: palette.muted }}>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          {row.cannabis ? (
                            <CheckCircle2
                              className="h-4 w-4"
                              style={{ color: palette.green }}
                            />
                          ) : (
                            <span style={{ color: palette.muted }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRANSACTION MONITORING - DEEP DIVE
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="transaction-monitoring" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle
                className="h-5 w-5"
                style={{ color: palette.green }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Transaction Monitoring
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              What We Monitor &amp; How
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Offbank runs real-time and batch-level transaction monitoring
              across every settlement. Below are the specific typologies,
              thresholds, and actions we take - not vague promises, but the
              actual rules engine that processes every dollar on the platform.
            </p>
          </Reveal>

          {/* Monitoring typologies */}
          <div className="mt-10 space-y-6">
            {[
              {
                title: "Structuring Detection",
                description:
                  "Transactions are analyzed for patterns consistent with structuring - the intentional breaking of large amounts into smaller transactions to avoid reporting thresholds. We flag: (a) multiple transactions from the same sender within 24 hours that aggregate above $10,000, (b) transactions consistently just below round-number thresholds, (c) rapid sequential transfers between related wallets.",
                threshold: "Aggregate > $10,000/24h or pattern match",
                action: "Auto-hold + manual review within 4 hours",
              },
              {
                title: "Velocity Anomalies",
                description:
                  "Each merchant has an expected transaction velocity profile established during onboarding. We flag deviations: (a) daily volume exceeding 3× the 30-day rolling average, (b) transaction frequency exceeding 5× normal rate, (c) sudden activation of dormant accounts (no activity for 30+ days followed by high-volume transactions).",
                threshold: "3× daily average or 5× frequency baseline",
                action: "Alert + enhanced monitoring for 72 hours",
              },
              {
                title: "Sanctions & Watchlist Hits",
                description:
                  "Every wallet address involved in a Offbank transaction (sender, receiver, and intermediate wallets) is screened against: OFAC SDN and Consolidated Lists, UN Security Council Sanctions Lists, EU Consolidated Financial Sanctions, known ransomware and darknet-linked addresses (via Chainalysis integration). Screening occurs pre-transaction in real-time.",
                threshold: "Any match (fuzzy matching at 90%+ confidence)",
                action: "Immediate block + SAR filing if warranted",
              },
              {
                title: "Geographic Risk Signals",
                description:
                  "IP geolocation, wallet provenance analysis, and counterparty jurisdiction are evaluated against: OFAC-sanctioned countries (Cuba, Iran, North Korea, Syria, Crimea region), FATF grey-list and black-list jurisdictions, jurisdictions with known deficiencies in cannabis regulation. VPN detection is active - transactions from known VPN exit nodes associated with sanctioned regions trigger enhanced review.",
                threshold: "Any sanctioned jurisdiction indicator",
                action: "Block or enhanced review depending on signal strength",
              },
              {
                title: "Round-Trip Transaction Detection",
                description:
                  "We monitor for layering activity where funds cycle through multiple wallets and return to the originator or a closely associated wallet. On-chain graph analysis identifies patterns where: (a) funds return to the originator within 72 hours through 2+ intermediary wallets, (b) wallets with no commercial activity serve as pass-through entities, (c) multiple unrelated merchants send to the same consolidation wallet.",
                threshold: "Pattern match across 72-hour window",
                action: "Hold pending investigation + SAR evaluation",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: palette.navy,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: "#f2f2f2" }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: palette.muted }}
                      >
                        Threshold
                      </p>
                      <p
                        className="mt-1 text-xs font-medium"
                        style={{ color: palette.navy }}
                      >
                        {item.threshold}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: "#f2f2f2" }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: palette.muted }}
                      >
                        Action Taken
                      </p>
                      <p
                        className="mt-1 text-xs font-medium"
                        style={{ color: palette.navy }}
                      >
                        {item.action}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SAR FILING PROCESS
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="sar-process" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <FileCheck className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                SAR Process
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              Suspicious Activity Reporting
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              When transaction monitoring or manual review surfaces activity
              consistent with money laundering, structuring, terrorist
              financing, or sanctions evasion, Offbank follows a documented SAR
              identification, investigation, and filing process.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div
              className="mt-10 rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <h3
                className="mb-6 text-lg font-bold"
                style={{
                  color: palette.navy,
                  fontFamily: "var(--font-heading)",
                }}
              >
                SAR Lifecycle
              </h3>
              <div className="space-y-6">
                <TimelineItem
                  step="1"
                  title="Alert Generation"
                  description="Transaction monitoring rules or manual review generate an alert. Alerts are triaged by severity: Critical (immediate freeze - sanctions hits, confirmed structuring), High (review within 4 hours - threshold breaches, velocity anomalies), Medium (review within 24 hours - geographic risk signals, unusual patterns), Low (batch review - minor deviations, informational)."
                />
                <TimelineItem
                  step="2"
                  title="Investigation"
                  description="The Compliance Officer or designated analyst investigates the alert. Investigation includes: full transaction history review for the merchant and counterparties, wallet provenance analysis (on-chain graph tracing), KYB re-verification if warranted, and customer outreach for legitimate business explanation. Investigation must be completed within 5 business days of alert generation."
                />
                <TimelineItem
                  step="3"
                  title="SAR Decision"
                  description="If investigation confirms suspicious activity, a SAR is prepared. The decision is documented with: specific facts supporting the filing, applicable law or regulation violated, transaction details (dates, amounts, wallet addresses, counterparties), and narrative description of the suspicious activity pattern. If the investigation clears the activity, the alert is closed with documented rationale."
                />
                <TimelineItem
                  step="4"
                  title="Filing with FinCEN"
                  description="SARs are filed electronically with FinCEN via BSA E-Filing within 30 calendar days of the initial alert (15 days if the subject is not identifiable and additional time is needed). Offbank maintains direct BSA E-Filing access - we do not rely on third-party intermediaries for SAR submission."
                />
                <TimelineItem
                  step="5"
                  title="Post-Filing Actions"
                  description="After filing: the merchant account may be suspended, restricted, or terminated depending on severity. Ongoing monitoring is enhanced for 90 days minimum. SAR information is never disclosed to the subject (per 31 USC §5318(g)(2)). All SAR documentation is retained for 5 years from the date of filing. Law enforcement inquiries (314(a) requests) related to filed SARs are handled within 2 business days."
                  last
                />
              </div>
            </div>
          </Reveal>

          {/* SAR statistics callout */}
          <Reveal delay={0.1}>
            <div
              className="mt-8 rounded-2xl border p-6"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: palette.navy }}
              >
                Transparency Note
              </p>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: palette.slate }}
              >
                Offbank cannot disclose whether a SAR has been filed on a
                specific transaction or individual (per federal &ldquo;tipping
                off&rdquo; prohibitions). However, we publish aggregate
                compliance statistics quarterly: total alerts generated,
                percentage resolved within SLA, and general compliance program
                metrics. These statistics are available to KYB-verified
                merchants in their compliance dashboard.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          RECORD RETENTION
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="record-retention" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Record Retention
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              Record Retention Policy
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Offbank retains all compliance-relevant records in accordance with
              BSA requirements and cannabis-industry best practices. On-chain
              transaction data is immutable and permanently accessible;
              off-chain records follow the retention schedule below.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div
              className="mt-10 overflow-hidden rounded-2xl border"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      {["Record Type", "Retention Period", "Storage"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                            style={{ color: palette.muted }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        record: "KYB verification files",
                        period: "5 years after account closure",
                        storage: "Encrypted off-chain + document hash on-chain",
                      },
                      {
                        record: "Transaction records",
                        period:
                          "Permanent (on-chain) + 5 years (off-chain enrichment)",
                        storage: "Solana blockchain + encrypted database",
                      },
                      {
                        record: "OFAC screening results",
                        period: "5 years from screening date",
                        storage: "Encrypted database with audit log",
                      },
                      {
                        record: "SAR filings & supporting docs",
                        period: "5 years from filing date",
                        storage: "Encrypted, access-restricted database",
                      },
                      {
                        record: "Transaction monitoring alerts",
                        period: "5 years from alert resolution",
                        storage: "Encrypted database with case notes",
                      },
                      {
                        record: "Training records",
                        period: "5 years from completion",
                        storage: "HR system with compliance integration",
                      },
                      {
                        record: "Compliance audit reports",
                        period: "5 years from audit date",
                        storage: "Document management system",
                      },
                      {
                        record: "314(a) / law enforcement requests",
                        period: "5 years from response date",
                        storage: "Encrypted, access-restricted database",
                      },
                    ].map((row) => (
                      <tr
                        key={row.record}
                        className="border-t"
                        style={{ borderColor: palette.cardBorder }}
                      >
                        <td
                          className="px-4 py-3 font-medium sm:px-6"
                          style={{ color: palette.navy }}
                        >
                          {row.record}
                        </td>
                        <td
                          className="px-4 py-3 sm:px-6"
                          style={{ color: palette.slate }}
                        >
                          {row.period}
                        </td>
                        <td
                          className="px-4 py-3 sm:px-6"
                          style={{ color: palette.slate }}
                        >
                          {row.storage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 - ARCHITECTURE
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="architecture" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 4
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              Compliance Architecture
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Compliance is not a feature bolted on after the fact - it is
              embedded in every layer of the Offbank protocol. Here is how it
              works end-to-end.
            </p>
          </Reveal>

          {/* Architecture diagram (text-based) */}
          <Reveal delay={0.05}>
            <div
              className="mt-10 overflow-x-auto rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <pre
                className="text-[11px] leading-relaxed sm:text-xs"
                style={{
                  color: palette.slate,
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                {`┌─────────────────────────────────────────────────────┐
│                  OFFBANK PROTOCOL                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐   │
│  │  SENDER  │──▶│ OFFBANK  │──▶│   RECEIVER   │   │
│  │  WALLET  │   │  SMART   │   │   WALLET     │   │
│  └──────────┘   │ CONTRACT │   └──────────────┘   │
│       │         └──────────┘          │            │
│       │              │                │            │
│       ▼              ▼                ▼            │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │   OFAC   │  │ COMPLIANCE│  │   ON-CHAIN   │   │
│  │ SCREENING│  │  STAMPS   │  │   RECEIPT    │   │
│  └──────────┘  │  ├─ KYB   │  │  ├─ Amount   │   │
│                │  ├─ AML   │  │  ├─ Time     │   │
│                │  ├─ OFAC  │  │  ├─ Parties  │   │
│                │  └─ GENIUS│  │  └─ TX Hash  │   │
│                └───────────┘  └──────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              AUDIT TRAIL (IMMUTABLE)         │   │
│  │  Every transaction → on-chain + off-chain    │   │
│  │  Exportable via API for regulatory review    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </Reveal>

          {/* Key architectural decisions */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Non-Custodial by Design",
                description:
                  "Offbank smart contracts are escrow programs - funds move atomically from sender to receiver in a single transaction. At no point does Offbank (or any Offbank-controlled wallet) have unilateral control over user funds.",
              },
              {
                title: "On-Chain Compliance Stamps",
                description:
                  "Every settlement embeds compliance metadata directly in the transaction: KYB verification status and OFAC screening result. This data is immutable and auditable by any third party.",
              },
              {
                title: "Gasless via Kora Fee Payer",
                description:
                  "Users don't need SOL for gas. Offbank's Kora integration covers transaction fees, removing friction while maintaining full self-custody. The fee payer is a signing service, not a custodian.",
              },
              {
                title: "Privacy via TEE (MagicBlock PER)",
                description:
                  "Sensitive transaction details (pricing, counterparty identities) can be encrypted using Trusted Execution Environments via MagicBlock PER. This protects trade secrets while maintaining the compliance audit trail.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: palette.navy,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGULATORY LANDSCAPE ── */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <h3
                className="mb-6 text-xl font-bold"
                style={{
                  color: palette.navy,
                  fontFamily: "var(--font-heading)",
                }}
              >
                Regulatory Landscape - 2026
              </h3>
              <div className="space-y-4">
                {[
                  {
                    regulation: "GENIUS Act (2025)",
                    status: "Enacted",
                    impact:
                      "Federal stablecoin framework. Offbank uses only compliant payment stablecoins (USDC). Non-custodial providers are software providers, not regulated entities.",
                    color: palette.green,
                  },
                  {
                    regulation: "FinCEN MSB Guidance (2019)",
                    status: "Active",
                    impact:
                      'FIN-2019-G001 clarifies that non-custodial software providers are not money transmitters. Offbank\'s architecture aligns with the "non-custodial wallet" classification.',
                    color: palette.green,
                  },
                  {
                    regulation: "Bank Secrecy Act (BSA)",
                    status: "Active",
                    impact:
                      "Offbank voluntarily implements BSA-grade controls (OFAC screening, transaction monitoring, SAR filing) as a best practice for operating in restricted industries.",
                    color: palette.green,
                  },
                  {
                    regulation: "MiCA (EU, 2024)",
                    status: "Active",
                    impact:
                      "Markets in Crypto-Assets regulation governs EU operations. USDC (Circle) is MiCA-compliant. Offbank's European operations leverage this established framework.",
                    color: palette.green,
                  },
                  {
                    regulation: "State Cannabis Regulations",
                    status: "Varies by State",
                    impact:
                      "Each state has unique cannabis compliance requirements. Offbank's KYB process verifies state-specific licenses and integrates with track-and-trace systems (Metrc, BioTrack).",
                    color: palette.gold,
                  },
                ].map((item, i) => (
                  <div
                    key={item.regulation}
                    className="flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-start sm:gap-4"
                    style={{ borderColor: palette.cardBorder }}
                  >
                    <div className="flex shrink-0 items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: item.color,
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <h4
                        className="text-sm font-bold"
                        style={{ color: palette.navy }}
                      >
                        {item.regulation}
                      </h4>
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: palette.slate }}
                      >
                        {item.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPLIANCE FAQ
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="faq" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Scale className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                FAQ
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-heading)",
              }}
            >
              Compliance Questions
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Questions we hear from CFOs, compliance teams, and regulators
              during due diligence. If your question isn&apos;t covered here,
              contact{" "}
              <a
                href="mailto:compliance@settlr.dev"
                className="font-semibold underline"
                style={{ color: palette.green }}
              >
                compliance@settlr.dev
              </a>
              .
            </p>
          </Reveal>

          <div className="mt-10 space-y-4">
            {[
              {
                q: "Is Offbank a money transmitter?",
                a: "No. Offbank is a non-custodial technology provider. We never hold, pool, or have unilateral control over user funds. Under FinCEN guidance FIN-2019-G001, non-custodial software that facilitates peer-to-peer transfers is not classified as a money transmitter. Our smart contracts execute atomic settlements - funds move directly from sender to receiver in a single on-chain transaction with no Offbank-controlled intermediary wallet.",
              },
              {
                q: "Why do you implement BSA/AML controls if you're not an MSB?",
                a: "Because our customers need it. Cannabis operators and other restricted businesses have been burned by payment providers that lacked compliance infrastructure and got shut down. By voluntarily maintaining MSB-grade AML controls - OFAC screening, transaction monitoring, SAR filing, KYB verification - we give our merchants a compliance layer they can present to auditors, banking partners, and regulators. It also protects us from regulatory risk as the stablecoin landscape evolves.",
              },
              {
                q: "How do you screen wallets against OFAC sanctions?",
                a: "Every wallet address (sender and receiver) is screened against OFAC SDN, Consolidated, and Non-SDN lists in real-time before any transaction is processed. We also screen against known ransomware addresses and darknet-linked wallets via blockchain analytics integration. Screening runs pre-transaction (not in batch), meaning a sanctioned wallet cannot complete a settlement through Offbank. Fuzzy matching at 90%+ confidence triggers manual review.",
              },
              {
                q: "What happens if suspicious activity is detected?",
                a: "The transaction is held pending investigation. Our Compliance Officer reviews the alert within 4 hours (Critical/High severity) or 24 hours (Medium). If the investigation confirms suspicious activity, a SAR is filed with FinCEN within 30 calendar days. The merchant account may be restricted or terminated. We cannot disclose whether a specific SAR has been filed (per federal tipping-off prohibitions), but merchants can see general compliance status in their dashboard.",
              },
              {
                q: "What KYB documentation do cannabis businesses need to provide?",
                a: "Cannabis businesses must provide: Articles of Incorporation, EIN/Tax ID, state business license, state cannabis license, government-issued ID for all beneficial owners with 25%+ ownership, proof of address, bank account verification (or documentation of underbanked status), and Metrc/BioTrack license number. All cannabis merchants are classified as 'High' risk by default and receive quarterly re-verification, lower monitoring thresholds, and enhanced due diligence.",
              },
              {
                q: "How long do you retain compliance records?",
                a: "All compliance records - KYB files, OFAC screening results, SAR documentation, transaction monitoring alerts, and audit reports - are retained for 5 years from the relevant date (account closure, screening date, filing date, or resolution date, respectively). On-chain transaction records are permanently accessible on the Solana blockchain. Off-chain enrichment data (compliance metadata, risk scores, case notes) is retained for 5 years in encrypted storage.",
              },
              {
                q: "Can my auditor access Offbank's compliance data?",
                a: "Yes. KYB-verified merchants can export their full compliance history via the dashboard or API: transaction records with compliance stamps, KYB verification status and documentation, OFAC screening results for all counterparties, risk scores and monitoring alert history, and aggregate compliance statistics. We also provide direct auditor read-access upon merchant authorization - your auditor can independently verify compliance data without going through your team.",
              },
              {
                q: "Is USDC actually safe to use for regulated businesses?",
                a: "USDC is issued by Circle, which is registered with FinCEN, holds state money transmitter licenses, and complies with the GENIUS Act of 2025 - the first comprehensive federal stablecoin framework. USDC reserves are held in U.S. Treasury obligations and cash at regulated financial institutions, with monthly reserve attestations by a Big Four accounting firm. USDC is also MiCA-compliant in the EU. It is the most regulated stablecoin in the United States.",
              },
            ].map((item, i) => (
              <Reveal key={item.q} delay={i * 0.03}>
                <details
                  className="group rounded-2xl border"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <summary
                    className="flex cursor-pointer items-center justify-between p-5 text-sm font-semibold sm:p-6"
                    style={{ color: palette.navy }}
                  >
                    {item.q}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                      style={{ color: palette.muted }}
                    />
                  </summary>
                  <div
                    className="border-t px-5 py-4 text-sm leading-relaxed sm:px-6"
                    style={{
                      borderColor: palette.cardBorder,
                      color: palette.slate,
                    }}
                  >
                    {item.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-32">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl p-10 text-center sm:p-14"
              style={{ backgroundColor: palette.navy }}
            >
              <Stamp className="mx-auto mb-4 h-8 w-8 text-white/60" />
              <h2
                className="text-2xl font-bold text-white sm:text-3xl"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "#FFFFFF",
                }}
              >
                Compliance Should Not Be a Competitive Disadvantage
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/70">
                Your industry was abandoned by banks - not by regulators. Offbank
                gives you the compliance infrastructure that traditional finance
                refused to build for you.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  }}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
                >
                  See the Demo
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
