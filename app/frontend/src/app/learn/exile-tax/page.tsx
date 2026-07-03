import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title:
    "The Exile Tax, Why Stablecoins Are the Only Solution for the Debanked",
  description:
    "A technical and legal analysis of the $4.7 billion annual tax imposed on cannabis businesses by financial exclusion, and why non-custodial USDC settlement on Solana is the only infrastructure-grade solution.",
  openGraph: {
    title:
      "The Exile Tax, Why Stablecoins Are the Only Solution for the Debanked",
    description:
      "Cannabis operators pay 5-12% in fees because banks won't serve them. This whitepaper explains why stablecoins are the structural fix.",
    type: "article",
    url: "https://offbankpay.com/learn/exile-tax",
  },
};

/* ──── Design tokens ──── */
const p = {
  bg: "#FFFFFF",
  navy: "#212121",
  slate: "#5c5c5c",
  muted: "#8a8a8a",
  border: "#d3d3d3",
  card: "#f2f2f2",
  green: "#34c759",
  greenBg: "rgba(27,107,74,0.06)",
};

export default function ExileTaxWhitepaper() {
  return (
    <>
      {/* Structured data, Article */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline:
              "The Exile Tax: Why Stablecoins Are the Only Solution for the Debanked",
            description:
              "A technical and legal analysis of the $4.7 billion annual cost of financial exclusion in cannabis, and why non-custodial stablecoin settlement is the only infrastructure-grade solution.",
            author: {
              "@type": "Organization",
              name: "Offbank",
              url: "https://offbankpay.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Offbank",
              url: "https://offbankpay.com",
              logo: "https://offbankpay.com/icon.svg",
            },
            datePublished: "2026-02-27",
            dateModified: "2026-02-27",
            url: "https://offbankpay.com/learn/exile-tax",
            mainEntityOfPage: "https://offbankpay.com/learn/exile-tax",
            about: [
              "Cannabis banking",
              "Stablecoin settlement",
              "High-risk merchant processing",
              "Financial exclusion",
              "GENIUS Act 2025",
              "USDC on Solana",
            ],
            keywords:
              "exile tax, cannabis payments, debanked, stablecoin settlement, USDC, Solana, high-risk merchant, GENIUS Act, non-custodial",
          }),
        }}
      />
      {/* FAQPage for AEO */}
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
                name: "What is the Exile Tax?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The Exile Tax is the 5-12% premium that cannabis and other legal-but-debanked businesses pay because traditional banks and payment processors refuse to serve them. It manifests as high-risk processing fees, armored cash transport, insurance surcharges, and lost working capital from extended net terms.",
                },
              },
              {
                "@type": "Question",
                name: "How much does the Exile Tax cost the cannabis industry?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Approximately $4.7 billion per year. U.S. cannabis revenue exceeded $30 billion in 2025, and operators surrender an estimated 8-15% of gross revenue to the combined costs of cash handling, high-risk processing fees, and compliance overhead.",
                },
              },
              {
                "@type": "Question",
                name: "Why can't cannabis businesses use normal banks?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Cannabis remains a Schedule I substance under federal law (the Controlled Substances Act of 1970). The SAFE Banking Act has failed to pass since 2019. Banks face prosecution under federal money laundering statutes (18 U.S.C. §1956) if they service cannabis businesses, regardless of state legality.",
                },
              },
              {
                "@type": "Question",
                name: "How do stablecoins solve the cannabis banking problem?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stablecoins like USDC are non-custodial, no bank sits between buyer and seller. Settlement is peer-to-peer on Solana in under 5 seconds, at 1% flat vs. 8-12% charged by high-risk processors. The GENIUS Act of 2025 provides a federal regulatory framework for stablecoin issuers, making USDC a regulated, compliant payment rail that doesn't depend on traditional banking relationships.",
                },
              },
              {
                "@type": "Question",
                name: "Is USDC settlement legal for cannabis businesses?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "USDC is issued by Circle under the GENIUS Act of 2025 framework. Non-custodial stablecoin settlement does not constitute money transmission because the platform never takes custody of funds. BSA/AML compliance (KYB, OFAC screening, transaction monitoring) is maintained by the settlement infrastructure provider, not by a depository bank.",
                },
              },
            ],
          }),
        }}
      />

      <div
        className="min-h-screen"
        style={{ background: p.bg, color: p.slate }}
      >
        <Navbar />

        {/* ═══════════════════════════════════════ */}
        {/*  HERO / TITLE BLOCK                    */}
        {/* ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-48">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 opacity-20"
              style={{
                width: "900px",
                height: "900px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${p.green} 0%, transparent 70%)`,
              }}
            />
          </div>
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={{ borderColor: p.border, color: p.muted }}
            >
              <span style={{ color: p.green }}>●</span> Offbank Whitepaper
              &mdash; February 2026
            </div>
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              style={{ color: p.navy }}
            >
              The Exile Tax
            </h1>
            <p className="mt-4 text-xl sm:text-2xl" style={{ color: p.slate }}>
              Why Stablecoins Are the Only Solution for the Debanked
            </p>
            <p
              className="mt-6 text-base leading-relaxed sm:text-lg"
              style={{ color: p.muted }}
            >
              A technical and legal analysis of the $4.7&nbsp;billion annual
              cost of financial exclusion in cannabis &mdash; and why
              non-custodial USDC settlement on Solana is the only
              infrastructure-grade answer.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/*  TABLE OF CONTENTS                     */}
        {/* ═══════════════════════════════════════ */}
        <div className="mx-auto max-w-3xl px-6 pb-16">
          <nav
            className="rounded-xl border p-6"
            style={{ borderColor: p.border, background: p.card }}
          >
            <p
              className="mb-4 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: p.muted }}
            >
              Contents
            </p>
            <ol
              className="space-y-2 text-sm font-medium"
              style={{ color: p.slate }}
            >
              {[
                [
                  "#s1",
                  "1. The Problem: Legally Compliant, Financially Exiled",
                ],
                ["#s2", "2. Anatomy of the Exile Tax"],
                ["#s3", "3. Why Existing Solutions Fail"],
                ["#s4", "4. The Stablecoin Fix: USDC on Solana"],
                ["#s5", "5. Legal & Regulatory Framework"],
                ["#s6", "Conclusion"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="hover:underline"
                    style={{ color: p.green }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/*  EXECUTIVE SUMMARY                     */}
        {/* ═══════════════════════════════════════ */}
        <article className="mx-auto max-w-3xl px-6 pb-32">
          <div
            className="rounded-xl border p-6 mb-16"
            style={{ borderColor: p.green, background: p.greenBg }}
          >
            <h2 className="text-lg font-bold mb-3" style={{ color: p.green }}>
              Executive Summary
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: p.slate }}>
              Cannabis is a <strong>$30&nbsp;billion legal industry</strong> in
              the United States that operates under de facto financial
              sanctions. Because federal Schedule&nbsp;I classification prevents
              mainstream banks from providing services, cannabis businesses pay
              an estimated <strong>8&ndash;15% of gross revenue</strong> in
              additional costs for cash handling, high-risk processing, and
              compliance overhead. We call this the{" "}
              <strong>&ldquo;Exile Tax.&rdquo;</strong>
            </p>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: p.slate }}
            >
              This paper argues that non-custodial stablecoin settlement &mdash;
              specifically USDC on Solana &mdash; is the{" "}
              <strong>only structural solution</strong> because it eliminates
              the banking dependency entirely. It is not a workaround. It is a
              new rail.
            </p>
          </div>

          {/* ──── SECTION 1 ──── */}
          <section id="s1" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6" style={{ color: p.navy }}>
              1. The Problem: Legally Compliant, Financially Exiled
            </h2>

            <p className="mb-4 leading-relaxed">
              As of February 2026, cannabis is legal for adult use in{" "}
              <strong>24 states</strong> and for medical use in{" "}
              <strong>38 states</strong>. Licensed cannabis businesses pay state
              and federal taxes, maintain seed-to-sale tracking through METRC
              and BioTrack, undergo regular compliance audits, and operate under
              some of the most tightly regulated conditions in American
              commerce.
            </p>
            <p className="mb-4 leading-relaxed">
              None of that matters to the banking system.
            </p>
            <p className="mb-4 leading-relaxed">
              Cannabis remains a Schedule&nbsp;I controlled substance under the{" "}
              <strong>Controlled Substances Act of 1970</strong>. The{" "}
              <strong>SAFE Banking Act</strong> &mdash; which would have
              shielded banks from federal prosecution for servicing cannabis
              businesses &mdash; has been introduced and failed in every
              Congressional session since 2019. Financial institutions that
              process cannabis transactions face potential charges under{" "}
              <strong>18 U.S.C. &sect;1956</strong> (money laundering) and{" "}
              <strong>18 U.S.C. &sect;1957</strong> (transactions from unlawful
              activity), regardless of state-level legality.
            </p>
            <p className="mb-4 leading-relaxed">
              The result: an industry that generates more revenue than the NFL,
              forced to operate with the payment infrastructure of a bodega.
            </p>

            <div
              className="rounded-lg border p-5 my-8"
              style={{ background: p.card, borderColor: p.border }}
            >
              <p className="text-sm font-bold mb-3" style={{ color: p.navy }}>
                By the numbers
              </p>
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                {[
                  ["$31.8B", "2025 U.S. cannabis revenue"],
                  ["~500", "Banks willing to serve cannabis (of 4,500+)"],
                  ["70%+", "Transactions still settled in cash"],
                  ["$4.7B", "Estimated annual Exile Tax"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-xl font-bold" style={{ color: p.green }}>
                      {v}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: p.muted }}>
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ──── SECTION 2 ──── */}
          <section id="s2" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6" style={{ color: p.navy }}>
              2. Anatomy of the Exile Tax
            </h2>
            <p className="mb-4 leading-relaxed">
              The Exile Tax is not a single fee. It is a compounding set of
              costs extracted from every layer of the business because the
              standard financial infrastructure refuses participation.
            </p>

            {/* Table */}
            <div
              className="overflow-hidden rounded-lg border my-6"
              style={{ borderColor: p.border }}
            >
              <table className="w-full text-left text-sm">
                <thead style={{ background: p.card }}>
                  <tr>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Component
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Cost
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      How It Works
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: p.border }}>
                  {[
                    [
                      "High-risk processing fees",
                      "5-12% per tx",
                      'Specialist processors (so-called "cannabis-friendly") charge 5-12× standard card rates, plus rolling reserves that freeze 10-15% of revenue for 6 months',
                    ],
                    [
                      "Armored cash transport",
                      "$1,200-$3,000/mo per location",
                      "Operators that can't find any processor pay Brink's or Loomis for weekly cash pickups. Every cash touchpoint is a robbery risk and a compliance liability",
                    ],
                    [
                      "Cash insurance premiums",
                      "2-5× standard rates",
                      "Insurers price cash-heavy businesses as high-risk. Dispensaries pay significantly more for property and casualty coverage",
                    ],
                    [
                      "Tax penalty (IRS §280E)",
                      "~70% effective rate",
                      "Federal tax code prohibits deductions for businesses trafficking in Schedule I substances. Cannabis companies cannot deduct COGS, rent, or payroll, only cost of goods sold",
                    ],
                    [
                      "Working capital lockup",
                      "Net-30/60 terms standard",
                      "B2B cannabis transactions use purchase order terms (Net-30, Net-60) because instant payment infrastructure doesn't exist. This ties up millions in receivables",
                    ],
                    [
                      "Compliance overhead",
                      "$50K-$200K/year",
                      "Enhanced monitoring, SAR filing, legal counsel for banking relationships that can be revoked at any time. Many operators employ full-time compliance staff solely to maintain bank access",
                    ],
                  ].map(([comp, cost, how]) => (
                    <tr key={comp}>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: p.navy }}
                      >
                        {comp}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap font-mono text-xs"
                        style={{ color: p.green }}
                      >
                        {cost}
                      </td>
                      <td
                        className="px-4 py-3 text-xs leading-relaxed"
                        style={{ color: p.muted }}
                      >
                        {how}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mb-4 leading-relaxed">
              For a mid-size cannabis distributor doing{" "}
              <strong>$5M in annual revenue</strong>, the Exile Tax
              conservatively amounts to{" "}
              <strong>$400K&ndash;$750K per year</strong>. That&rsquo;s not
              profit margin &mdash; it&rsquo;s the cost of being legally
              compliant but financially excluded.
            </p>

            <div
              className="rounded-lg border-l-4 p-4 my-6"
              style={{ borderColor: p.green, background: p.greenBg }}
            >
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: p.slate }}
              >
                &ldquo;We pay more to move money than we pay in rent. And the
                processors can pull our account any Tuesday with 30 days&rsquo;
                notice. It&rsquo;s not a partnership &mdash; it&rsquo;s a
                protection racket.&rdquo;
              </p>
              <p className="mt-2 text-xs" style={{ color: p.muted }}>
                &mdash; Cannabis distributor, Colorado (anonymized)
              </p>
            </div>
          </section>

          {/* ──── SECTION 3 ──── */}
          <section id="s3" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6" style={{ color: p.navy }}>
              3. Why Existing Solutions Fail
            </h2>

            <p className="mb-4 leading-relaxed">
              The cannabis industry has tried every available option. Each fails
              for structural reasons &mdash; they all depend, ultimately, on a
              banking relationship that can be revoked.
            </p>

            <div className="space-y-6 mt-6">
              {/* Credit Unions */}
              <div
                className="rounded-lg border p-5"
                style={{ borderColor: p.border, background: p.card }}
              >
                <h3 className="font-bold mb-2" style={{ color: p.navy }}>
                  3.1 Cannabis-Friendly Credit Unions
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: p.slate }}
                >
                  A handful of credit unions (Safe Harbor Financial, Partner
                  Colorado) have built compliance programs to serve cannabis.
                  They charge <strong>$2,000&ndash;$5,000/month</strong> in
                  account fees, require extensive documentation (often 40+ pages
                  monthly), and can close accounts with 30&nbsp;days&rsquo;
                  notice if their federal examiner raises concerns. They serve
                  fewer than 10% of licensed operators nationally. This is a
                  band-aid, not infrastructure.
                </p>
              </div>

              {/* High-risk processors */}
              <div
                className="rounded-lg border p-5"
                style={{ borderColor: p.border, background: p.card }}
              >
                <h3 className="font-bold mb-2" style={{ color: p.navy }}>
                  3.2 High-Risk Merchant Processors
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: p.slate }}
                >
                  Companies like PayKickstart, Square (via workarounds), and
                  various offshore processors serve cannabis at{" "}
                  <strong>5&ndash;12% per transaction</strong> plus monthly
                  minimums. They impose rolling reserves (10&ndash;15% withheld
                  for 6 months), volume caps, and opaque risk scoring. Accounts
                  are frequently terminated mid-cycle. The processing
                  relationship is adversarial by design &mdash; the processor
                  profits from the operator&rsquo;s lack of alternatives.
                </p>
              </div>

              {/* Cashless ATMs */}
              <div
                className="rounded-lg border p-5"
                style={{ borderColor: p.border, background: p.card }}
              >
                <h3 className="font-bold mb-2" style={{ color: p.navy }}>
                  3.3 Cashless ATMs &amp; PIN Debit Workarounds
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: p.slate }}
                >
                  &ldquo;Cashless ATM&rdquo; POS terminals disguise cannabis
                  transactions as ATM withdrawals. Visa and Mastercard have
                  issued explicit cease-and-desist letters to these providers.
                  In 2024, Visa terminated multiple acquirers for facilitating
                  cannabis transactions through this method. It is a compliance
                  time bomb &mdash; operators using these systems face
                  retroactive chargebacks and potential legal exposure for wire
                  fraud (18 U.S.C. &sect;1343).
                </p>
              </div>

              {/* ACH */}
              <div
                className="rounded-lg border p-5"
                style={{ borderColor: p.border, background: p.card }}
              >
                <h3 className="font-bold mb-2" style={{ color: p.navy }}>
                  3.4 ACH &amp; Wire Transfers
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: p.slate }}
                >
                  For B2B wholesale transactions (distributor → retailer), ACH
                  and wire transfers require both parties to have bank accounts
                  that permit cannabis-related activity. In practice, this means
                  both sides need a cannabis-friendly credit union &mdash; a
                  vanishingly small overlap. Wires take 3&ndash;5 business days,
                  don&rsquo;t provide real-time finality, and each transfer is a
                  manual reconciliation event.
                </p>
              </div>
            </div>

            <div
              className="rounded-lg border-l-4 p-4 my-8"
              style={{ borderColor: p.green, background: p.greenBg }}
            >
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: p.navy }}
              >
                The common failure mode: every solution above depends on a
                traditional banking relationship. If the bank exits, the
                solution collapses. This is not a feature gap &mdash; it is an
                architectural dependency that cannot be patched.
              </p>
            </div>
          </section>

          {/* ──── SECTION 4 ──── */}
          <section id="s4" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6" style={{ color: p.navy }}>
              4. The Stablecoin Fix: USDC on Solana
            </h2>

            <p className="mb-4 leading-relaxed">
              A stablecoin is a digital asset pegged 1:1 to a fiat currency.
              USDC, issued by Circle, is backed by U.S. Treasury securities and
              cash held at regulated financial institutions (BlackRock, BNY
              Mellon). As of February 2026, USDC has a market cap exceeding{" "}
              <strong>$55&nbsp;billion</strong> and processes more daily
              transaction volume than PayPal.
            </p>

            <p className="mb-4 leading-relaxed">
              The critical property:{" "}
              <strong>
                USDC settlement does not require a bank account for either
                party.
              </strong>{" "}
              A seller creates a wallet (a cryptographic keypair), a buyer sends
              USDC to that wallet, and the transaction is confirmed on the
              Solana blockchain in under 400 milliseconds. No correspondent
              bank, no ACH clearing house, no card network, no acquiring bank.
            </p>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              4.1 Why Solana
            </h3>
            <p className="mb-4 leading-relaxed">
              Not all blockchains are suitable for commercial settlement:
            </p>

            <div
              className="overflow-hidden rounded-lg border my-6"
              style={{ borderColor: p.border }}
            >
              <table className="w-full text-left text-sm">
                <thead style={{ background: p.card }}>
                  <tr>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Property
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Solana
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Ethereum
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Tron
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: p.border }}>
                  {[
                    ["Median fee", "$0.001", "$0.80", "$0.15"],
                    ["Finality", "~400ms", "~3 min", "~3 sec"],
                    ["Real TPS", "2,400+", "29", "89"],
                    [
                      "USDC native",
                      "Yes (Circle)",
                      "Yes (Circle)",
                      "No (USDT only)",
                    ],
                    [
                      "Regulatory posture",
                      "U.S.-aligned, Visa/PayPal partnerships",
                      "Decentralized, limited institutional adoption",
                      "SEC scrutiny, offshore focus",
                    ],
                  ].map(([prop, sol, eth, tron]) => (
                    <tr key={prop}>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: p.navy }}
                      >
                        {prop}
                      </td>
                      <td className="px-4 py-3" style={{ color: p.green }}>
                        {sol}
                      </td>
                      <td className="px-4 py-3" style={{ color: p.muted }}>
                        {eth}
                      </td>
                      <td className="px-4 py-3" style={{ color: p.muted }}>
                        {tron}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mb-4 leading-relaxed">
              Solana&rsquo;s sub-second finality means a $50,000 B2B purchase
              order settles faster than a credit card tap at Starbucks &mdash;
              at a fraction of a penny in network fees.
            </p>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              4.2 Non-Custodial Architecture
            </h3>
            <p className="mb-4 leading-relaxed">
              The word &ldquo;non-custodial&rdquo; is the structural
              breakthrough. In a non-custodial settlement system:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
              <li>
                <strong>The platform never holds user funds.</strong> Funds move
                directly from buyer wallet to seller wallet via a Solana smart
                contract.
              </li>
              <li>
                <strong>There is no bank in the transaction path.</strong> No
                acquiring bank, no issuing bank, no correspondent bank.
              </li>
              <li>
                <strong>The platform cannot be &ldquo;debanked.&rdquo;</strong>{" "}
                Because it never custodies funds, there is no banking
                relationship for a regulator to pressure.
              </li>
              <li>
                <strong>Settlement is atomic.</strong> Either the full amount
                transfers, or nothing does. No partial payments, no rolling
                reserves, no chargebacks.
              </li>
            </ul>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              4.3 Multisig Governance (Squads Protocol)
            </h3>
            <p className="mb-4 leading-relaxed">
              A wallet alone is insufficient for enterprise treasury management.
              Cannabis businesses need the same governance controls as any
              regulated business: multi-signature authorization, spending
              limits, and audit trails.
            </p>
            <p className="mb-4 leading-relaxed">
              <strong>Squads Protocol</strong> (v4) provides programmable
              multisig accounts on Solana. Every Offbank merchant gets a Squads
              Smart Account with configurable signing thresholds:
            </p>

            <div
              className="overflow-hidden rounded-lg border my-6"
              style={{ borderColor: p.border }}
            >
              <table className="w-full text-left text-sm">
                <thead style={{ background: p.card }}>
                  <tr>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Feature
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Standard Wallet
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Offbank + Squads
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: p.border }}>
                  {[
                    [
                      "Governance",
                      "One person can drain the account",
                      "Require 2-of-3 signatures for payouts > $1K",
                    ],
                    [
                      "Recovery",
                      "Lost seed phrase = lost funds",
                      "Social recovery + backup signers",
                    ],
                    [
                      "Spending limits",
                      "All or nothing",
                      "Daily/per-tx limits enforced on-chain",
                    ],
                    [
                      "Audit trail",
                      "Wallet address visible, no identity",
                      "Full on-chain log of who signed, when, and what for",
                    ],
                    [
                      "Compliance",
                      "Hard to prove authorization",
                      "Immutable proof of board-approved disbursements",
                    ],
                  ].map(([feat, std, sq]) => (
                    <tr key={feat}>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: p.navy }}
                      >
                        {feat}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: p.muted }}
                      >
                        {std}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: p.green }}
                      >
                        {sq}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mb-4 leading-relaxed">
              The onboarding flow is progressive: merchants start with a 1-of-1
              signer (feels like a normal app), and upgrade to multi-party
              governance as their volume grows. At $5K+ in deposits, Offbank
              prompts the operator to add a second signer (CFO, partner) for
              2-of-2 protection.
            </p>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              4.4 The Exile Tax &rarr; Eliminated
            </h3>
            <div
              className="overflow-hidden rounded-lg border my-6"
              style={{ borderColor: p.border }}
            >
              <table className="w-full text-left text-sm">
                <thead style={{ background: p.card }}>
                  <tr>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Cost Component
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      Before (Exile Tax)
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      style={{ color: p.navy }}
                    >
                      After (Offbank)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: p.border }}>
                  {[
                    ["Processing fees", "5-12% per tx", "1% flat"],
                    [
                      "Cash transport",
                      "$1,200-$3,000/mo",
                      "$0 (digital settlement)",
                    ],
                    [
                      "Rolling reserves",
                      "10-15% frozen 6 months",
                      "None (atomic settlement)",
                    ],
                    ["Settlement time", "3-5 business days", "<5 seconds"],
                    [
                      "Working capital lockup",
                      "Net-30/60 terms",
                      "Instant (T+0)",
                    ],
                    [
                      "Account termination risk",
                      "30-day notice, any time",
                      "Non-custodial, no account to close",
                    ],
                  ].map(([comp, before, after]) => (
                    <tr key={comp}>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: p.navy }}
                      >
                        {comp}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#e74c3c" }}
                      >
                        {before}
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-medium"
                        style={{ color: p.green }}
                      >
                        {after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ──── SECTION 5 ──── */}
          <section id="s5" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6" style={{ color: p.navy }}>
              5. Legal &amp; Regulatory Framework
            </h2>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              5.1 The GENIUS Act of 2025
            </h3>
            <p className="mb-4 leading-relaxed">
              The{" "}
              <strong>
                Guiding and Establishing National Innovation for U.S.
                Stablecoins Act
              </strong>{" "}
              (GENIUS Act), signed into law in 2025, creates a federal
              regulatory framework for payment stablecoin issuers. Key
              provisions relevant to cannabis settlement:
            </p>
            <ul className="list-disc pl-6 space-y-3 mb-4 text-sm leading-relaxed">
              <li>
                <strong>&sect;3&ndash;4: Federal licensing.</strong> Issuers of
                &gt;$10B in outstanding stablecoins (Circle qualifies) are
                subject to Federal Reserve oversight, 1:1 reserve requirements
                backed by short-term U.S. Treasuries, and monthly attestation.
              </li>
              <li>
                <strong>&sect;6: Consumer protection.</strong> Stablecoin
                holders have priority in insolvency. USDC is not an unregulated
                token &mdash; it is a federally supervised payment instrument.
              </li>
              <li>
                <strong>&sect;8: Anti&ndash;money laundering.</strong> Issuers
                must maintain BSA/AML programs. This means the underlying
                currency (USDC) already has regulatory compliance built in at
                the issuance layer.
              </li>
              <li>
                <strong>&sect;9: Preemption.</strong> The Act preempts
                inconsistent state laws, creating a uniform national framework.
                Cannabis businesses in Colorado and California use the same
                compliant payment rail.
              </li>
            </ul>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              5.2 Money Transmitter Analysis
            </h3>
            <p className="mb-4 leading-relaxed">
              A non-custodial settlement platform does not constitute a money
              transmitter under FinCEN guidance because:
            </p>
            <ol className="list-decimal pl-6 space-y-3 mb-4 text-sm leading-relaxed">
              <li>
                <strong>No custody.</strong> The platform never controls, holds,
                or has signing authority over user funds. Funds flow
                peer-to-peer via a Solana smart contract.
              </li>
              <li>
                <strong>No acceptance and transmission.</strong> Under 31 CFR
                &sect;1010.100(ff)(5)(i)(A), money transmission requires
                acceptance from one person and transmission to another. A
                non-custodial protocol facilitates but does not accept or
                transmit.
              </li>
              <li>
                <strong>FinCEN 2019 guidance (FIN-2019-G001).</strong> FinCEN
                explicitly states that software providers acting as
                intermediaries or facilitators &mdash; without taking custody
                &mdash; are not money transmitters. The relevant test is
                custody, not facilitation.
              </li>
            </ol>

            <h3
              className="text-xl font-bold mt-8 mb-4"
              style={{ color: p.navy }}
            >
              5.3 BSA/AML Compliance Maintained
            </h3>
            <p className="mb-4 leading-relaxed">
              Non-custodial does not mean non-compliant. Offbank maintains a full
              BSA/AML program:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm leading-relaxed">
              <li>
                <strong>KYB (Know Your Business):</strong> State cannabis
                license verification, METRC/BioTrack license cross-reference,
                beneficial ownership identification, OFAC SDN screening.
              </li>
              <li>
                <strong>Transaction monitoring:</strong> Rule-based and
                ML-assisted screening for structuring, velocity anomalies, and
                typology matching.
              </li>
              <li>
                <strong>SAR filing:</strong> Suspicious Activity Reports filed
                with FinCEN when monitoring triggers are met.
              </li>
              <li>
                <strong>On-chain audit trail:</strong> Every USDC settlement is
                an immutable Solana transaction with a public signature. This
                provides a stronger audit trail than any paper-based or
                ACH-based system.
              </li>
            </ul>

            <div
              className="rounded-lg border-l-4 p-4 my-8"
              style={{ borderColor: p.green, background: p.greenBg }}
            >
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: p.navy }}
              >
                The compliance position is stronger, not weaker, than
                traditional banking. Every transaction has a permanent,
                cryptographically verifiable receipt on Solana. No bank
                statement, wire confirmation, or ACH trace provides equivalent
                proof.
              </p>
            </div>
          </section>

          {/* ──── CONCLUSION ──── */}
          <section id="s6" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6" style={{ color: p.navy }}>
              Conclusion
            </h2>
            <p className="mb-4 leading-relaxed">
              The Exile Tax is not a market inefficiency that competition will
              solve. It is a structural consequence of federal drug policy
              meeting an inflexible banking system. Every solution that depends
              on a bank account &mdash; credit unions, high-risk processors,
              cashless ATMs, ACH workarounds &mdash; inherits the same single
              point of failure: the bank can leave.
            </p>
            <p className="mb-4 leading-relaxed">
              Non-custodial stablecoin settlement eliminates that dependency
              entirely. USDC on Solana provides sub-second finality at $0.001
              per transaction, backed by a{" "}
              <strong>$55&nbsp;billion reserve pool</strong> of U.S. Treasuries,
              under the{" "}
              <strong>GENIUS Act&rsquo;s federal oversight framework</strong>,
              with <strong>Squads&nbsp;Protocol multisig governance</strong> for
              enterprise treasury controls.
            </p>
            <p className="mb-4 leading-relaxed">
              The only way to payment-infrastructure a debanked industry is to
              build a rail that doesn&rsquo;t need a bank.
            </p>
            <p className="font-semibold" style={{ color: p.green }}>
              Offbank is that rail.
            </p>
          </section>

          {/* ──── FOOTER CTA ──── */}
          <div
            className="rounded-xl border p-8 text-center"
            style={{ background: p.navy, borderColor: p.navy }}
          >
            <h3 className="text-xl font-bold text-white mb-3">
              Stop paying the Exile Tax
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Non-custodial USDC settlement. 1% flat. No bank dependency.
            </p>
            <a
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: p.green }}
            >
              Apply for Early Access &rarr;
            </a>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
