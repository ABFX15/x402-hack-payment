import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Offbank, Non-Custodial B2B Stablecoin Settlement",
  description:
    "Offbank is non-custodial stablecoin settlement infrastructure for cannabis and high-risk B2B industries. 1% flat fee, instant finality, built on Solana.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main
        className="mx-auto max-w-3xl px-6 py-24"
        style={{ background: "#FFFFFF" }}
      >
        <article>
          <h1 className="text-4xl font-bold tracking-tight text-[#212121] mb-6">
            About Offbank
          </h1>

          <section className="space-y-5 text-[#5c5c5c] text-base leading-relaxed">
            <p>
              Offbank is non-custodial stablecoin settlement infrastructure
              purpose-built for cannabis wholesalers and high-risk B2B supply
              chains. We replace cash drops and predatory 8-12% payment
              processors with instant, on-chain USDC settlement at a 1% flat
              fee.
            </p>

            <h2 className="text-2xl font-semibold text-[#212121] pt-4">
              The problem we solve
            </h2>
            <p>
              Cannabis operators move <strong>$34 billion annually</strong>{" "}
              through cash or high-risk merchant accounts. Banks close their
              accounts for being &ldquo;high-risk.&rdquo; Wire transfers take
              3-5 business days. Cash-heavy operations routinely fail compliance
              audits.
            </p>
            <p>
              Offbank eliminates all of that. Payments settle in under 5 seconds
              with an immutable on-chain audit trail, no bank can freeze your
              funds, no processor can hold your reserves.
            </p>

            <h2 className="text-2xl font-semibold text-[#212121] pt-4">
              How it works
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Non-custodial</strong>, Offbank never holds your funds.
                Payments move directly between buyer and seller wallets via
                Solana smart contracts.
              </li>
              <li>
                <strong>Instant settlement</strong>, T+0 finality. Every
                payment confirms on-chain in under 5 seconds.
              </li>
              <li>
                <strong>1% flat fee</strong>, No rolling reserves, no hidden
                charges, no monthly minimums.
              </li>
              <li>
                <strong>Compliance-ready</strong>, Every transaction produces
                an immutable receipt suitable for BSA/AML reporting, GENIUS Act
                compliance, and METRC integration.
              </li>
              <li>
                <strong>LeafLink integration</strong>, Plugs directly into
                cannabis wholesale purchase orders. Automatic invoicing,
                payment-link delivery, and proof sync-back.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#212121] pt-4">
              Built on Solana
            </h2>
            <p>
              Offbank&rsquo;s settlement program is deployed on Solana, the
              highest-throughput blockchain in production. Transactions cost
              fractions of a cent and finalize in 400ms. Our smart contract
              handles USDC transfers, platform fee collection, merchant
              registration, and refund processing entirely on-chain.
            </p>

            <h2 className="text-2xl font-semibold text-[#212121] pt-4">
              Contact
            </h2>
            <p>
              Reach us at{" "}
              <a
                href="mailto:adam@settlr.dev"
                className="text-[#34c759] underline"
              >
                adam@settlr.dev
              </a>{" "}
              or on{" "}
              <a
                href="https://x.com/offbankpay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#34c759] underline"
              >
                X / Twitter
              </a>
              .
            </p>
          </section>

          <div className="mt-12 flex gap-4">
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-[#34c759] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors"
            >
              View Pricing
            </Link>
            <Link
              href="/demo"
              className="inline-block rounded-lg border border-[#d3d3d3] px-6 py-3 text-sm font-semibold text-[#212121] hover:bg-[#f2f2f2] transition-colors"
            >
              Try the Demo
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
