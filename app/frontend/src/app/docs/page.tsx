"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Search,
  Book,
  Code2,
  Webhook,
  HelpCircle,
  Rocket,
  ExternalLink,
  Vault,
  Plug,
} from "lucide-react";

const docsTabs = [
  { id: "quickstart", label: "Getting Started", icon: Rocket },
  { id: "invoices", label: "Invoices & Payments", icon: Book },
  { id: "dashboard", label: "Dashboard", icon: Vault },
  { id: "api", label: "REST API", icon: Code2 },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
];

type TabId =
  | "quickstart"
  | "invoices"
  | "dashboard"
  | "api"
  | "webhooks"
  | "integrations"
  | "troubleshooting";

export default function DocsPage() {
  return (
    <Suspense>
      <DocsPageInner />
    </Suspense>
  );
}

function DocsPageInner() {
  const searchParams = useSearchParams();
  const initialTab: TabId = (searchParams.get("tab") as TabId) || "quickstart";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && docsTabs.some((t) => t.id === tab)) {
      setActiveTab(tab as TabId);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF] text-[#212121] pt-16">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 border-r border-[#d3d3d3] bg-[#f2f2f2] overflow-y-auto">
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] py-2 pl-10 pr-4 text-sm text-[#212121] placeholder:text-[#8a8a8a] focus:border-[#3B82F6]/50 focus:outline-none"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {docsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#34c759]/10 text-[#34c759]"
                          : "text-[#5c5c5c] hover:bg-[#f2f2f2] hover:text-[#212121]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* External Links */}
              <div className="mt-8 border-t border-[#d3d3d3] pt-6">
                <p className="mb-3 text-xs font-semibold uppercase text-[#8a8a8a]">
                  Resources
                </p>
                <div className="space-y-1">
                  <a
                    href="https://github.com/ABFX15/x402-hack-payment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#5c5c5c] hover:bg-[#f2f2f2] hover:text-[#212121]"
                  >
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Hero */}
              <div className="mb-10">
                <h1 className="text-4xl font-bold mb-4">Operator Docs</h1>
                <p className="text-xl text-[#5c5c5c]">
                  How to send invoices, settle in USDC, and cash out to USD, no
                  code required.
                </p>
                <p className="mt-4 text-sm text-[#8a8a8a]">
                  Building an integration?{" "}
                  <Link
                    href="/developers"
                    className="text-[#34c759] font-medium hover:underline"
                  >
                    See the developer docs →
                  </Link>
                </p>
              </div>

              {/* Mobile Navigation Tabs */}
              <div className="flex gap-1 mb-8 border-b border-[#d3d3d3] overflow-x-auto lg:hidden">
                {docsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-[#34c759] border-b-2 border-[#34c759]"
                        : "text-[#8a8a8a] hover:text-[#212121]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none">
                {activeTab === "quickstart" && <QuickStartContent />}
                {activeTab === "invoices" && <InvoicesContent />}
                {activeTab === "dashboard" && <DashboardContent />}
                {activeTab === "api" && <APIContent />}
                {activeTab === "webhooks" && <WebhooksContent />}
                {activeTab === "integrations" && <IntegrationsContent />}
                {activeTab === "troubleshooting" && <TroubleshootingContent />}
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:ml-64">
        <Footer />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   GETTING STARTED
   ═══════════════════════════════════════════════════════════ */

function QuickStartContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Get Started in 5 Minutes</h2>
        <p className="text-[#8a8a8a] mb-6">
          Offbank automates B2B cannabis payments. Connect your POS system and
          invoices settle in USDC on Solana, no bank wires, no 30-day net
          terms, no chargebacks.
        </p>

        {/* Direct invoices intro */}
        <div className="mb-12">
          <div className="rounded-xl border border-[#34c759]/20 bg-[#34c759]/[0.05] p-5">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-[#34c759]/15 text-[#34c759] px-2 py-0.5 rounded-full mb-3">
              Direct
            </span>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">
              Create Payment Links
            </h3>
            <p className="text-sm text-[#8a8a8a] mb-3">
              Create USDC payment links directly from the dashboard. Works for
              any cannabis B2B transaction, no POS integration required.
            </p>
            <span className="text-sm text-[#34c759] font-medium">
              See Invoices tab →
            </span>
          </div>
        </div>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#34c759]/15 text-[#34c759] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Get Started</h3>
          </div>
          <p className="text-[#8a8a8a] mb-4">
            Offbank is currently invite-only. Submit a request on our waitlist
            and we&apos;ll review your application. Once approved, you&apos;ll
            receive an email with a link to sign in and complete onboarding.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#34c759] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started →
          </a>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#34c759]/15 text-[#34c759] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">Complete Onboarding</h3>
          </div>
          <p className="text-[#8a8a8a] mb-4">
            Sign in with your email, complete merchant onboarding (business
            details, license verification), and you&apos;re ready to invoice.
          </p>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#34c759]/15 text-[#34c759] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">Send a Payment Link</h3>
          </div>
          <p className="text-[#8a8a8a] mb-4">
            Create an invoice from the dashboard, share the payment link with
            your buyer, and the funds settle to your wallet instantly when they
            pay in USDC.
          </p>
          <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 font-mono text-sm text-[#5c5c5c]">
            <div className="space-y-1">
              <p>Create invoice INV-4821 in dashboard</p>
              <p>&nbsp;&nbsp;→ Share payment link with buyer</p>
              <p>&nbsp;&nbsp;→ Buyer pays in USDC (one click)</p>
              <p>&nbsp;&nbsp;→ Funds settle to your wallet instantly</p>
              <p>&nbsp;&nbsp;→ On-chain receipt available immediately</p>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="⚡"
            title="Instant Settlement"
            description="USDC settles in under 1 second on Solana. No 30-day net terms."
          />
          <FeatureCard
            icon="🔒"
            title="Compliance Ready"
            description="METRC tag tracking, license verification, full audit trail."
          />
          <FeatureCard
            icon="🧾"
            title="On-chain Receipts"
            description="Every payment generates a verifiable Solana transaction receipt."
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INVOICES & PAYMENTS
   ═══════════════════════════════════════════════════════════ */

function InvoicesContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Invoices &amp; Payments</h2>
        <p className="text-[#8a8a8a] mb-6">
          Create USDC invoices for any cannabis B2B transaction. Buyers pay via
          a one-click payment link and funds settle to your wallet instantly.
        </p>

        {/* How it works */}
        <div className="bg-[#34c759]/10 border border-[#34c759]/30 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#34c759] mb-2">
            Settlement Flow
          </h3>
          <ol className="text-[#8a8a8a] text-sm space-y-2">
            <li>1. Create an invoice from the dashboard</li>
            <li>2. Buyer gets an email with a payment link</li>
            <li>3. They click, connect a wallet, and pay in USDC</li>
            <li>4. Funds settle to your wallet instantly on Solana</li>
            <li>5. Both parties get a receipt with on-chain proof</li>
          </ol>
        </div>

        {/* Create Invoice */}
        <h3 className="text-xl font-semibold mb-4">Create an Invoice</h3>
        <p className="text-[#8a8a8a] mb-4">
          From your dashboard, go to{" "}
          <strong className="text-[#5c5c5c]">Invoices → Create Invoice</strong>.
          Enter the amount, memo, and buyer email. Offbank generates a unique
          payment link and sends it to the buyer automatically.
        </p>
        <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#8a8a8a]">
            <strong className="text-[#5c5c5c]">Invoice fields:</strong>
          </p>
          <ul className="text-sm text-[#8a8a8a] mt-2 space-y-1">
            <li>
              • <strong>Amount</strong>, Invoice total in USD (settled in USDC)
            </li>
            <li>
              • <strong>Memo</strong>, Description (e.g. &quot;PO #4821, 500
              units Purple Haze&quot;)
            </li>
            <li>
              • <strong>Buyer email</strong>, Payment link auto-sent to this
              address
            </li>
            <li>
              • <strong>Metadata</strong>, Optional: METRC tags, license
              numbers
            </li>
          </ul>
        </div>

        {/* Payment Links */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Payment Links</h3>
        <p className="text-[#8a8a8a] mb-4">
          Every invoice generates a unique payment link. Share it via email,
          text, or any channel, the buyer clicks, connects a wallet, and pays.
          No app download required.
        </p>
        <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#8a8a8a]">
            <strong className="text-[#5c5c5c]">Payment URL format:</strong>{" "}
            <code className="text-[#34c759]">
              https://offbankpay.com/invoice/&#123;token&#125;
            </code>
          </p>
          <p className="text-sm text-[#8a8a8a] mt-2">
            Links expire after 7 days by default. The buyer sees the amount,
            memo, and a one-click USDC payment button.
          </p>
        </div>

        {/* Payment Status */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Track Payment Status
        </h3>
        <p className="text-[#8a8a8a] mb-4">
          Monitor all invoices from{" "}
          <strong className="text-[#5c5c5c]">Dashboard → Invoices</strong>. Each
          invoice shows its current status:
        </p>
        <div className="bg-[#f2f2f2] rounded-lg overflow-hidden mb-6">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3d3d3]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#d29500]">pending</td>
                <td className="px-4 py-3 text-[#8a8a8a]">
                  Invoice created, awaiting payment
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#34c759]">
                  completed
                </td>
                <td className="px-4 py-3 text-[#8a8a8a]">
                  Payment received and confirmed on-chain
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#8a8a8a]">expired</td>
                <td className="px-4 py-3 text-[#8a8a8a]">
                  Payment link expired (7 days default)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Gasless */}
        <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#212121] mb-2">
            Gasless Transactions
          </h4>
          <p className="text-[#8a8a8a] text-sm">
            All Offbank payments are gasless by default. Buyers don&apos;t need
            SOL for transaction fees, the fee payer is handled by
            Offbank&apos;s infrastructure (powered by Kora).
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */

function DashboardContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Operator Dashboard</h2>
        <p className="text-[#8a8a8a] mb-6">
          Monitor your settlement volume, manage integrations, and track
          compliance from the dashboard.
        </p>

        {/* Overview */}
        <h3 className="text-xl font-semibold mb-4">Dashboard Features</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4">
            <h4 className="font-medium text-[#212121] mb-2">
              Settlement Volume
            </h4>
            <p className="text-sm text-[#8a8a8a]">
              Real-time view of total USDC settled, active invoices, and payment
              history across all channels.
            </p>
          </div>
          <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4">
            <h4 className="font-medium text-[#212121] mb-2">Invoices</h4>
            <p className="text-sm text-[#8a8a8a]">
              Create, track, and manage USDC invoices. View payment status,
              re-send links, and export records.
            </p>
          </div>
          <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4">
            <h4 className="font-medium text-[#212121] mb-2">Treasury</h4>
            <p className="text-sm text-[#8a8a8a]">
              On-chain treasury balance, accumulated platform fees, and
              one-click claim to your wallet.
            </p>
          </div>
          <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4">
            <h4 className="font-medium text-[#212121] mb-2">Compliance Logs</h4>
            <p className="text-sm text-[#8a8a8a]">
              METRC tags, license numbers, and on-chain signatures for every
              transaction. Export-ready audit trail.
            </p>
          </div>
        </div>

        {/* Treasury */}
        <h3 className="text-xl font-semibold mb-4">Treasury &amp; Fees</h3>
        <p className="text-[#8a8a8a] mb-4">
          Every payment processed through Offbank collects a configurable
          platform fee (default 2%) into a program-owned treasury PDA on Solana.
          Authorized signers can claim accumulated fees at any time.
        </p>
        <div className="bg-[#f2f2f2] rounded-lg p-6 border border-[#d3d3d3] mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-[#8a8a8a] mb-1">Fee Collection</p>
              <p className="text-lg font-semibold text-[#212121]">Automatic</p>
              <p className="text-xs text-[#8a8a8a]">On every payment</p>
            </div>
            <div>
              <p className="text-sm text-[#8a8a8a] mb-1">Claim Method</p>
              <p className="text-lg font-semibold text-[#212121]">
                Multisig / Wallet
              </p>
              <p className="text-xs text-[#8a8a8a]">Authority-gated</p>
            </div>
            <div>
              <p className="text-sm text-[#8a8a8a] mb-1">Settlement</p>
              <p className="text-lg font-semibold text-[#212121]">USDC</p>
              <p className="text-xs text-[#8a8a8a]">Direct to your wallet</p>
            </div>
          </div>
        </div>

        {/* Dashboard link */}
        <div className="bg-[#34c759]/10 border border-[#34c759]/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#34c759] mb-2">
            Access the Dashboard
          </h4>
          <p className="text-[#8a8a8a] text-sm">
            Visit{" "}
            <a href="/dashboard" className="text-[#34c759] hover:underline">
              /dashboard
            </a>{" "}
            to see the live dashboard with real-time on-chain data, treasury
            metrics, and integration status.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REST API
   ═══════════════════════════════════════════════════════════ */

function APIContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">REST API Reference</h2>
        <p className="text-[#8a8a8a] mb-6">
          Internal API endpoints for payments and treasury management. All
          authenticated routes require a valid wallet sign-in session.
        </p>

        {/* Base URL */}
        <div className="bg-[#f2f2f2] rounded-lg p-4 mb-6">
          <p className="text-[#8a8a8a] text-sm mb-1">Base URL</p>
          <code className="text-[#34c759]">https://offbankpay.com/api</code>
        </div>

        {/* Authentication */}
        <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#212121] mb-2">
            Authentication
          </h3>
          <p className="text-[#8a8a8a] text-sm">
            API requests are authenticated via your Solana wallet sign-in
            session. When calling from the dashboard, authentication is handled
            automatically. For server-to-server integrations, Offbank supports
            HMAC signature verification on incoming webhooks.
          </p>
        </div>

        {/* Payment Endpoints */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mt-10 mb-4">
          Payments &amp; Invoices
        </h3>

        <div className="border border-[#d3d3d3] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#34c759]/15 text-[#34c759] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#212121]">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-[#8a8a8a]">
              Create a USDC payment with a payment link.
            </p>
          </div>
        </div>

        <div className="border border-[#d3d3d3] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#34c759]/15 text-[#34c759] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#212121]">/payments/:id</code>
          </div>
          <div className="p-4">
            <p className="text-[#8a8a8a]">Retrieve a payment by ID.</p>
          </div>
        </div>

        <div className="border border-[#d3d3d3] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#34c759]/15 text-[#34c759] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#212121]">/invoices</code>
          </div>
          <div className="p-4">
            <p className="text-[#8a8a8a]">
              Create a new invoice. Returns a shareable payment link.
            </p>
          </div>
        </div>

        <div className="border border-[#d3d3d3] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#34c759]/15 text-[#34c759] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#212121]">/invoices</code>
          </div>
          <div className="p-4">
            <p className="text-[#8a8a8a]">
              List all invoices with optional status filter.
            </p>
          </div>
        </div>

        {/* Treasury Endpoints */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mt-10 mb-4">
          Treasury
        </h3>

        <div className="border border-[#d3d3d3] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#34c759]/15 text-[#34c759] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#212121]">/treasury</code>
          </div>
          <div className="p-4">
            <p className="text-[#8a8a8a] text-sm">
              Returns treasury balance, platform config (fee BPS, authority,
              total volume/fees), and PDA addresses.
            </p>
          </div>
        </div>

        <div className="border border-[#d3d3d3] rounded-lg overflow-hidden">
          <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#34c759]/15 text-[#34c759] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#212121]">/fees/claim</code>
          </div>
          <div className="p-4">
            <p className="text-[#8a8a8a] text-sm">
              Builds an unsigned claim_platform_fees transaction for the
              authorized signer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WEBHOOKS
   ═══════════════════════════════════════════════════════════ */

function WebhooksContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
        <p className="text-[#8a8a8a] mb-6">
          Get notified in real-time when payments settle or invoices change
          state.
        </p>

        {/* Setup */}
        <h3 className="text-xl font-semibold mb-4">Setting Up Webhooks</h3>
        <p className="text-[#8a8a8a] mb-4">
          Configure your webhook endpoint in the Offbank dashboard under{" "}
          <strong className="text-[#5c5c5c]">Settings → Webhooks</strong>.
          We&apos;ll send a POST request whenever a payment event occurs.
        </p>

        {/* Payload */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Webhook Payload</h3>
        <CodeBlock language="json">
          {`{
  "event": "payment.completed",
  "data": {
    "paymentId": "pay_abc123",
    "sessionId": "cs_9hwbf9pvk2d1",
    "amount": 12500.00,
    "currency": "USDC",
    "customerWallet": "DjLFeMQ3...rSQV",
    "paymentSignature": "5xKj...abc",
    "completedAt": 1752158400000,
    "receiptUrl": "https://offbankpay.com/receipts/pay_abc123",
    "metadata": {
      "buyer_license": "C10-0000002-LIC"
    }
  },
  "timestamp": 1752158401000
}`}
        </CodeBlock>

        {/* Handler Example */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Example Handler (Next.js)
        </h3>
        <CodeBlock language="typescript">
          {`// app/api/webhooks/offbank/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Offbank } from '@offbank/sdk';

const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body — required to verify the signature

  const ok = offbank.webhooks.verify(
    body,
    req.headers.get('X-Offbank-Signature'),
    process.env.OFFBANK_WEBHOOK_SECRET!, // Dashboard → Settings → Webhook signing secret
    300,                                 // reject events older than 5 minutes
  );
  if (!ok) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  if (event.event === 'payment.completed') {
    // Offbank already verified this payment on-chain — safe to fulfil.
    await markPaid(event.data.paymentId, event.data.paymentSignature);
  }

  return NextResponse.json({ received: true });
}`}
        </CodeBlock>

        {/* Events */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Event Types</h3>
        <div className="bg-[#f2f2f2] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3d3d3]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#34c759]">
                  payment.completed
                </td>
                <td className="px-4 py-3 text-[#8a8a8a]">
                  Invoice paid and confirmed on-chain
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#8a8a8a]">
                  payment.expired
                </td>
                <td className="px-4 py-3 text-[#8a8a8a]">
                  Payment link expired before completion{" "}
                  <span className="text-[#d29500]">(planned)</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#8a8a8a]">
                  payment.failed
                </td>
                <td className="px-4 py-3 text-[#8a8a8a]">
                  Payment failed due to an error{" "}
                  <span className="text-[#d29500]">(planned)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security */}
        <div className="bg-[#d29500]/10 border border-[#d29500]/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#d29500] mb-2">Security Note</h4>
          <p className="text-[#8a8a8a]">
            Always verify the webhook signature before processing events. Never
            trust the payload without verification. Offbank webhooks use
            HMAC-SHA256.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTEGRATIONS
   ═══════════════════════════════════════════════════════════ */

function IntegrationsContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">POS Integrations</h2>
        <p className="text-[#8a8a8a] mb-6">
          Offbank connects to the cannabis POS and ordering platforms your
          business already uses. LeafLink is live in beta, Dutchie and Flowhub
          are on the roadmap.
        </p>

        {/* Integration cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border-2 border-[#34c759]/30 bg-[#34c759]/[0.05] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌿</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#34c759]/15 text-[#34c759] px-2 py-0.5 rounded-full">
                Live · Beta
              </span>
            </div>
            <h3 className="font-semibold mb-1">LeafLink</h3>
            <p className="text-sm text-[#8a8a8a]">
              Wholesale B2B ordering. Auto-creates USDC invoices from purchase
              orders, syncs settlement status back to LeafLink. Configure in
              Settings → LeafLink Integration.
            </p>
          </div>
          <div className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2]/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#8a8a8a]/10 text-[#8a8a8a] px-2 py-0.5 rounded-full">
                Planned
              </span>
            </div>
            <h3 className="font-semibold mb-1">Dutchie</h3>
            <p className="text-sm text-[#8a8a8a]">
              Dispensary POS with METRC integration. Planned for Q3 2026.
            </p>
          </div>
          <div className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2]/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#8a8a8a]/10 text-[#8a8a8a] px-2 py-0.5 rounded-full">
                Planned
              </span>
            </div>
            <h3 className="font-semibold mb-1">Flowhub</h3>
            <p className="text-sm text-[#8a8a8a]">
              Dispensary compliance platform. Planned for Q4 2026.
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#212121] mb-2">
            Want a different POS integration?
          </h4>
          <p className="text-[#8a8a8a] text-sm">
            We&apos;re actively building out POS integrations for the cannabis
            industry. If you use a platform not listed here, let us know at{" "}
            <a
              href="mailto:support@settlr.dev"
              className="text-[#34c759] hover:underline"
            >
              support@settlr.dev
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TROUBLESHOOTING
   ═══════════════════════════════════════════════════════════ */

function TroubleshootingContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
        <p className="text-[#8a8a8a] mb-6">
          Common issues and how to fix them.
        </p>

        <div className="space-y-4">
          <TroubleshootingItem
            question="Payment stuck on 'Processing'"
            answer={`This usually means the transaction is waiting for confirmation. Solana transactions typically confirm in 1-2 seconds. If stuck longer:\n• Check your internet connection\n• The RPC endpoint may be congested, try refreshing\n• If using devnet, the network may be slower, wait 30 seconds`}
          />

          <TroubleshootingItem
            question="'Insufficient balance' error"
            answer={`The buyer's wallet doesn't have enough USDC to complete the payment. They can:\n• Transfer USDC from another wallet\n• Buy USDC using the built-in fiat on-ramp\n• Swap another token for USDC via Jupiter (built-in)`}
          />

          <TroubleshootingItem
            question="Webhook signature verification failing"
            answer={`Offbank webhooks use HMAC-SHA256:\n• Make sure the webhook secret in your config matches the value Offbank is signing with\n• The signature is computed over the raw request body, don't parse before verifying\n• Check for encoding issues, the body must be the exact bytes received`}
          />

          <TroubleshootingItem
            question="How do I test without real money?"
            answer={`Use Solana devnet for testing:\n• Get devnet SOL from faucet.solana.com\n• Get devnet USDC from the test faucet in our demo\n• All payment flows work identically on devnet\n• Visit /demo/store to try the full payment flow`}
          />

          <TroubleshootingItem
            question="How do I get support?"
            answer={`We're here to help:\n• GitHub Issues: github.com/ABFX15/x402-hack-payment\n• Email: support@settlr.dev`}
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function TroubleshootingItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#d3d3d3] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-[#f2f2f2] transition-colors"
      >
        <span className="font-medium">{question}</span>
        <span
          className={`text-[#34c759] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-[#8a8a8a] whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

function CodeBlock({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string, lang: string) => {
    if (lang === "bash") {
      return code.split("\n").map((line, i) => (
        <div key={i}>
          {line.startsWith("#") ? (
            <span className="text-[#8a8a8a]">{line}</span>
          ) : (
            <>
              <span className="text-[#8a8a8a]">$ </span>
              <span className="text-[#34c759]">{line}</span>
            </>
          )}
        </div>
      ));
    }

    if (lang === "json") {
      return code.split("\n").map((line, i) => {
        const highlighted = line
          .replace(/"([^"]+)":/g, '<span class="text-[#34c759]">"$1"</span>:')
          .replace(/: "([^"]+)"/g, ': <span class="text-[#34c759]">"$1"</span>')
          .replace(/: (\d+)/g, ': <span class="text-[#d29500]">$1</span>')
          .replace(
            /: (true|false|null)/g,
            ': <span class="text-[#34c759]">$1</span>',
          );
        return (
          <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
        );
      });
    }

    const keywords = [
      "import",
      "export",
      "from",
      "const",
      "let",
      "var",
      "function",
      "async",
      "await",
      "return",
      "if",
      "else",
      "try",
      "catch",
      "throw",
      "new",
      "class",
      "interface",
      "type",
      "extends",
      "implements",
      "default",
      "typeof",
    ];
    const builtins = [
      "console",
      "process",
      "window",
      "document",
      "Promise",
      "Error",
      "JSON",
      "Object",
      "Array",
      "String",
      "Number",
      "Boolean",
      "Date",
      "Math",
      "crypto",
    ];
    const reactKeywords = [
      "useState",
      "useEffect",
      "useCallback",
      "useMemo",
      "useRef",
      "useContext",
    ];

    return code.split("\n").map((line, lineIndex) => {
      if (line.trim().startsWith("//")) {
        return (
          <div key={lineIndex} className="text-[#8a8a8a]">
            {line}
          </div>
        );
      }

      const lineChars = line;
      const tokens: { type: string; value: string }[] = [];
      let i = 0;
      while (i < lineChars.length) {
        if (
          lineChars[i] === '"' ||
          lineChars[i] === "'" ||
          lineChars[i] === "`"
        ) {
          const quote = lineChars[i];
          let str = quote;
          i++;
          while (i < lineChars.length && lineChars[i] !== quote) {
            if (lineChars[i] === "\\" && i + 1 < lineChars.length) {
              str += lineChars[i] + lineChars[i + 1];
              i += 2;
            } else {
              str += lineChars[i];
              i++;
            }
          }
          if (i < lineChars.length) str += lineChars[i++];
          tokens.push({ type: "string", value: str });
          continue;
        }

        if (lineChars[i] === "/" && lineChars[i + 1] === "/") {
          tokens.push({ type: "comment", value: lineChars.slice(i) });
          break;
        }

        if (/[a-zA-Z_$]/.test(lineChars[i])) {
          let word = "";
          while (i < lineChars.length && /[a-zA-Z0-9_$]/.test(lineChars[i])) {
            word += lineChars[i++];
          }
          if (keywords.includes(word)) {
            tokens.push({ type: "keyword", value: word });
          } else if (builtins.includes(word)) {
            tokens.push({ type: "builtin", value: word });
          } else if (reactKeywords.includes(word)) {
            tokens.push({ type: "react", value: word });
          } else if (word[0] === word[0].toUpperCase() && /[a-z]/.test(word)) {
            tokens.push({ type: "class", value: word });
          } else {
            tokens.push({ type: "identifier", value: word });
          }
          continue;
        }

        if (/[0-9]/.test(lineChars[i])) {
          let num = "";
          while (i < lineChars.length && /[0-9._]/.test(lineChars[i])) {
            num += lineChars[i++];
          }
          tokens.push({ type: "number", value: num });
          continue;
        }

        if (lineChars[i] === "<" && /[A-Za-z\/]/.test(lineChars[i + 1] || "")) {
          let tag = "<";
          i++;
          while (
            i < lineChars.length &&
            lineChars[i] !== ">" &&
            lineChars[i] !== " "
          ) {
            tag += lineChars[i++];
          }
          tokens.push({ type: "tag", value: tag });
          continue;
        }

        tokens.push({ type: "punctuation", value: lineChars[i++] });
      }

      return (
        <div key={lineIndex}>
          {tokens.map((token, tokenIndex) => {
            switch (token.type) {
              case "keyword":
                return (
                  <span key={tokenIndex} className="text-pink-400">
                    {token.value}
                  </span>
                );
              case "string":
                return (
                  <span key={tokenIndex} className="text-[#34c759]">
                    {token.value}
                  </span>
                );
              case "comment":
                return (
                  <span key={tokenIndex} className="text-[#8a8a8a]">
                    {token.value}
                  </span>
                );
              case "number":
                return (
                  <span key={tokenIndex} className="text-[#d29500]">
                    {token.value}
                  </span>
                );
              case "builtin":
                return (
                  <span key={tokenIndex} className="text-[#34c759]">
                    {token.value}
                  </span>
                );
              case "react":
                return (
                  <span key={tokenIndex} className="text-[#34c759]">
                    {token.value}
                  </span>
                );
              case "class":
                return (
                  <span key={tokenIndex} className="text-[#ffc107]">
                    {token.value}
                  </span>
                );
              case "tag":
                return (
                  <span key={tokenIndex} className="text-[#34c759]">
                    {token.value}
                  </span>
                );
              default:
                return (
                  <span key={tokenIndex} className="text-[#5c5c5c]">
                    {token.value}
                  </span>
                );
            }
          })}
        </div>
      );
    });
  };

  return (
    <div className="relative bg-[#f2f2f2] rounded-lg overflow-hidden mb-4 border border-[#d3d3d3]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/70 border-b border-[#d3d3d3]">
        <span className="text-xs text-[#8a8a8a] uppercase font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-[#8a8a8a] hover:text-[#212121] transition-colors px-2 py-1 rounded hover:bg-[#E8E4Da]"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{highlightCode(children, language)}</code>
      </pre>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-[#8a8a8a] text-sm">{description}</p>
    </div>
  );
}
