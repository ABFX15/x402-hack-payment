"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CodeBlock } from "@/components/CodeBlock";
import {
  Code2,
  Webhook,
  Plug,
  Github,
  ArrowRight,
  Rocket,
  Send,
  Package,
} from "lucide-react";

/**
 * /developers, developer-facing landing page.
 *
 * Separates the developer persona from the operator persona (/docs).
 * Operators don't need to see REST endpoints; developers don't need to
 * see "how to send an invoice from the dashboard".
 *
 * The actual API + Webhooks reference content still lives in /docs under
 * the `?tab=api` and `?tab=webhooks` deep links, this page links into
 * those tabs so we don't maintain two copies.
 */
export default function DevelopersPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-[#212121] pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Hero */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#34c759] uppercase tracking-[0.15em] mb-3">
              For developers
            </p>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Build on Offbank
            </h1>
            <p className="text-xl text-[#5c5c5c] leading-relaxed">
              Take USDC, invoice, and pay anyone - from one npm package. Install{" "}
              <code className="rounded bg-[#f2f2f2] px-1.5 py-0.5 font-mono text-[15px] text-[#212121]">
                @offbank/sdk
              </code>{" "}
              and you&apos;re live in minutes. If you&apos;re an operator who just
              wants to send invoices from the dashboard,{" "}
              <Link
                href="/docs"
                className="text-[#34c759] font-medium hover:underline"
              >
                start here instead
              </Link>
              .
            </p>
          </div>

          {/* Primary: SDK reference */}
          <Link
            href="/docs?tab=sdk"
            className="group mb-4 flex items-start gap-4 rounded-2xl border-2 border-[#34c759]/30 bg-[#34c759]/[0.05] p-6 transition-colors hover:border-[#34c759] hover:bg-[#34c759]/10"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#34c759]/15">
              <Package className="h-6 w-6 text-[#34c759]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                SDK Reference
                <ArrowRight className="h-4 w-4 text-[#34c759] group-hover:translate-x-0.5 transition-transform" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                The complete <code className="font-mono text-[12px]">@offbank/sdk</code>{" "}
                guide - install, initialize, and every method (checkout,
                invoices, payouts, webhook verification) with parameters,
                runnable examples, and response shapes.
              </p>
            </div>
          </Link>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            <Link
              href="/docs?tab=api"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Code2 className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                REST API
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Every SDK call over plain HTTP - checkout sessions, invoices,
                payouts. Request + response examples, API-key auth.
              </p>
            </Link>

            <Link
              href="/docs?tab=webhooks"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Webhook className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Webhooks
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Subscribe to settlement events. HMAC-signed deliveries,
                automatic retries, idempotency keys.
              </p>
            </Link>

            <Link
              href="/docs?tab=integrations"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Plug className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Integrations
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                LeafLink, Solana wallets, x402 protocol, Squads multisig.
              </p>
            </Link>

            <Link
              href="/products/instant-cashout"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Send className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Payouts &amp; Cashouts
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Pay anyone in USDC by email or wallet - affiliate commissions,
                player cashouts, supplier runs. Single or batch, instant.
              </p>
            </Link>

            <a
              href="https://github.com/ABFX15/x402-hack-payment"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Github className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                GitHub
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Source for the on-chain program, SDK, and reference frontend.
              </p>
            </a>
          </div>

          {/* Quickstart strip */}
          <div>
            <div className="flex items-center gap-2 text-sm text-[#34c759] mb-3">
              <Rocket className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider">
                30-second quickstart
              </span>
            </div>
            <CodeBlock
              filename="create-invoice.sh"
              code={`curl https://offbankpay.com/api/invoices \\
  -H "x-api-key: $OFFBANK_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "buyerName": "Acme Wholesale",
    "buyerEmail": "ap@acme.com",
    "lineItems": [
      { "description": "Wholesale order #4421", "quantity": 1, "unitPrice": 47500 }
    ],
    "dueDate": "2026-08-01",
    "memo": "Net 30"
  }'`}
            />
            <p className="mt-4 text-sm text-[#5c5c5c]">
              Returns a hosted invoice link your buyer pays with any Solana
              wallet. A signed settlement webhook fires once the on-chain payment
              confirms. Prefer types? <code className="rounded bg-[#f2f2f2] px-1 py-0.5 font-mono text-[12px]">npm install @offbank/sdk</code>.
            </p>
          </div>

          {/* Payouts quickstart */}
          <div className="mt-8">
            <div className="flex items-center gap-2 text-sm text-[#34c759] mb-3">
              <Send className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider">
                Pay out in one call
              </span>
            </div>
            <CodeBlock
              filename="payouts.ts"
              code={`// npm install @offbank/sdk
import { Offbank } from "@offbank/sdk";

const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });

// Affiliate commission, player cashout, supplier payment - same call
await offbank.payouts.create({
  email: "alice@example.com",
  amount: 250.0,
  memo: "March affiliate commission",
});

// Pay a whole run at once
await Promise.all([
  offbank.payouts.create({ email: "alice@example.com", amount: 250.0 }),
  offbank.payouts.create({ email: "bob@example.com",   amount: 180.0 }),
]);`}
            />
            <p className="mt-4 text-sm text-[#5c5c5c]">
              Each recipient gets a claim link (and email) and claims with any
              Solana wallet - or one we provision on first claim. Your webhook
              fires when it settles. No minimum amounts, no batch windows.
            </p>
          </div>

          {/* Footer link */}
          <div className="mt-10 text-sm text-[#8a8a8a]">
            Need an API key? Generate one in{" "}
            <Link
              href="/dashboard/settings"
              className="text-[#34c759] font-medium hover:underline"
            >
              Settings → API keys
            </Link>{" "}
            once your merchant account is set up. Prefer no code? Use{" "}
            <Link
              href="/dashboard/affiliates"
              className="text-[#34c759] font-medium hover:underline"
            >
              Affiliate Payouts
            </Link>{" "}
            in the dashboard.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
