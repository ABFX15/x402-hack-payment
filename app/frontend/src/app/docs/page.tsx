"use client";

import { useState, useEffect, Suspense, type ReactNode } from "react";
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
  Package,
} from "lucide-react";

const docsTabs = [
  { id: "quickstart", label: "Getting Started", icon: Rocket },
  { id: "sdk", label: "SDK Reference", icon: Package },
  { id: "invoices", label: "Invoices & Payments", icon: Book },
  { id: "dashboard", label: "Dashboard", icon: Vault },
  { id: "api", label: "REST API", icon: Code2 },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
];

type TabId =
  | "quickstart"
  | "sdk"
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
                <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                <p className="text-xl text-[#5c5c5c]">
                  Accept USDC, send instant payouts, and invoice — from a
                  one-line widget, the SDK, or the dashboard. Pick a section to
                  get going.
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
                {activeTab === "sdk" && <SdkContent />}
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
        <h2 className="text-2xl font-bold mb-4">Get started</h2>
        <p className="text-[#8a8a8a] mb-6">
          Offbank is self-custodial USDC payment infrastructure for merchants
          processors won&apos;t touch — high-risk e-commerce and iGaming. Accept
          payments, send instant payouts, and invoice in USDC. Funds settle
          straight to a wallet you control, in under a second, 1% flat.
        </p>

        {/* Three ways to integrate */}
        <h3 className="text-xl font-semibold mb-4">Three ways to integrate</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl border border-[#d3d3d3] p-5">
            <span className="text-2xl">🛒</span>
            <h4 className="font-semibold mt-3 mb-1">Checkout widget</h4>
            <p className="text-sm text-[#8a8a8a]">
              One <code className="font-mono text-[12px]">&lt;script&gt;</code>{" "}
              tag adds a “Pay with USDC” button to any store. Best for
              e-commerce checkout.
            </p>
          </div>
          <div className="rounded-xl border border-[#d3d3d3] p-5">
            <span className="text-2xl">⚡</span>
            <h4 className="font-semibold mt-3 mb-1">SDK / REST API</h4>
            <p className="text-sm text-[#8a8a8a]">
              <code className="font-mono text-[12px]">@offbank/sdk</code> for
              invoices, checkout sessions, and instant payouts. Best for iGaming
              &amp; backends.
            </p>
          </div>
          <div className="rounded-xl border border-[#d3d3d3] p-5">
            <span className="text-2xl">🧾</span>
            <h4 className="font-semibold mt-3 mb-1">Dashboard</h4>
            <p className="text-sm text-[#8a8a8a]">
              Create invoices and payment links by hand — no code. Best for
              wholesale billing and one-offs.
            </p>
          </div>
        </div>

        {/* Get an API key */}
        <div className="rounded-xl border border-[#34c759]/20 bg-[#34c759]/[0.05] p-5 mb-10">
          <h3 className="text-lg font-semibold text-[#212121] mb-1">
            1. Get your API key
          </h3>
          <p className="text-sm text-[#8a8a8a]">
            Sign in, then go to{" "}
            <strong className="text-[#5c5c5c]">Settings → API keys</strong> and
            create a key (<code className="font-mono text-[12px]">sk_live_…</code>
            ). Grab your{" "}
            <strong className="text-[#5c5c5c]">Webhook signing secret</strong>{" "}
            from the same page. Keep both server-side — they can move money.
          </p>
        </div>

        {/* SDK quickstart */}
        <h3 className="text-xl font-semibold mb-3">2. Install the SDK</h3>
        <CodeBlock language="bash">{`npm install @offbank/sdk`}</CodeBlock>
        <p className="text-[#8a8a8a] text-sm mt-4 mb-3">
          Create a checkout session — the amount is fixed server-side, so it
          can&apos;t be tampered with:
        </p>
        <CodeBlock language="typescript">
          {`import { Offbank } from "@offbank/sdk";

const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });

const session = await offbank.checkout.sessions.create({
  merchantWallet: "DjLFeMQ3...rSQV",
  merchantName: "My Store",
  amount: 74.0,                      // whole USDC
  successUrl: "https://store.com/thanks",
  cancelUrl: "https://store.com/cart",
  webhookUrl: "https://store.com/api/offbank-webhook",
});

// Redirect the buyer to session.url — or hand session.id to the widget.
console.log(session.url);`}
        </CodeBlock>

        {/* Widget quickstart */}
        <h3 className="text-xl font-semibold mb-3 mt-10">
          Or drop in the checkout widget
        </h3>
        <p className="text-[#8a8a8a] text-sm mb-3">
          No build step — add one script and open the checkout with the live
          cart total. Confirmation is verified on-chain server-side before your
          webhook fires.
        </p>
        <CodeBlock language="html">
          {`<script src="https://offbankpay.com/embed.js"></script>

<button onclick="OffbankCheckout.open({
  merchant: 'DjLFeMQ3...rSQV',   // your Solana wallet
  amount: 74.00,
  evm: '0x8335...2913',          // optional: also accept USDC on Base/Ethereum
  onSuccess: (d) => console.log('paid', d.signature)
})">Pay with USDC</button>`}
        </CodeBlock>

        {/* Instant payout */}
        <h3 className="text-xl font-semibold mb-3 mt-10">
          3. Pay anyone (iGaming cashouts, affiliates, suppliers)
        </h3>
        <CodeBlock language="typescript">
          {`await offbank.payouts.create({
  email: "player@example.com",
  amount: 250.0,
  memo: "Withdrawal #48210",
});
// Recipient gets a claim link and picks any wallet — settles in seconds.`}
        </CodeBlock>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="⚡"
            title="Instant settlement"
            description="USDC settles in under 1 second on Solana. No net terms, no reserves."
          />
          <FeatureCard
            icon="🛡️"
            title="Can't be frozen"
            description="Self-custodial — funds land in a wallet only you control."
          />
          <FeatureCard
            icon="🚫"
            title="No chargebacks"
            description="On-chain payments are final. Friendly fraud disappears."
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SDK REFERENCE
   ═══════════════════════════════════════════════════════════ */

function SdkParam({
  name,
  type,
  required,
  children,
}: {
  name: string;
  type: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-[#f2f2f2] last:border-0">
      <div className="flex items-baseline gap-2 sm:w-52 flex-shrink-0">
        <code className="font-mono text-[13px] text-[#212121]">{name}</code>
        {required ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#d92d20]">
            required
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wide text-[#8a8a8a]">
            optional
          </span>
        )}
      </div>
      <div className="text-[13px] leading-relaxed text-[#8a8a8a]">
        <code className="font-mono text-[#027a48]">{type}</code>
        <span className="mx-1.5">—</span>
        {children}
      </div>
    </div>
  );
}

function SdkMethod({
  signature,
  lead,
  children,
}: {
  signature: string;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-12 scroll-mt-24">
      <div className="mb-3 inline-block rounded-lg bg-[#0d1117] px-3 py-1.5 font-mono text-[13px] text-[#e6edf3]">
        {signature}
      </div>
      <p className="text-[#5c5c5c] text-[15px] leading-relaxed mb-4">{lead}</p>
      {children}
    </div>
  );
}

function SdkContent() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-3">SDK reference</h2>
        <p className="text-[#8a8a8a] mb-6 leading-relaxed">
          <code className="font-mono text-[13px] text-[#5c5c5c]">
            @offbank/sdk
          </code>{" "}
          is a small, typed, dependency-free client for your backend. One class,{" "}
          <code className="font-mono text-[13px] text-[#5c5c5c]">Offbank</code>,
          with four things on it:{" "}
          <code className="font-mono text-[13px]">checkout</code>,{" "}
          <code className="font-mono text-[13px]">invoices</code>,{" "}
          <code className="font-mono text-[13px]">payouts</code>, and{" "}
          <code className="font-mono text-[13px]">webhooks</code>. Server-side
          only — your API key can move money.
        </p>

        {/* Install */}
        <h3 className="text-xl font-semibold mb-3 mt-8">Install</h3>
        <CodeBlock language="bash">{`npm install @offbank/sdk`}</CodeBlock>
        <p className="text-[13px] text-[#8a8a8a] mt-2">
          Requires Node 18+ (uses the built-in <code className="font-mono">fetch</code>).
        </p>

        {/* Initialize */}
        <h3 className="text-xl font-semibold mb-3 mt-8">Initialize</h3>
        <CodeBlock language="typescript">
          {`import { Offbank } from "@offbank/sdk";

const offbank = new Offbank({
  apiKey: process.env.OFFBANK_API_KEY!,   // from Settings → API keys
});`}
        </CodeBlock>
        <div className="mt-4 rounded-lg border border-[#d3d3d3] p-4">
          <SdkParam name="apiKey" type="string" required>
            Your secret key (<code className="font-mono">sk_live_…</code> /{" "}
            <code className="font-mono">sk_test_…</code>). Never ship it to a
            browser.
          </SdkParam>
          <SdkParam name="baseUrl" type="string">
            API base URL. Defaults to{" "}
            <code className="font-mono">https://offbankpay.com</code>.
          </SdkParam>
          <SdkParam name="fetchImpl" type="typeof fetch">
            Custom fetch, for tests or older runtimes. Defaults to global{" "}
            <code className="font-mono">fetch</code>.
          </SdkParam>
        </div>

        {/* Full example */}
        <h3 className="text-xl font-semibold mb-3 mt-10">
          A complete checkout, end to end
        </h3>
        <p className="text-[#8a8a8a] text-sm mb-3 leading-relaxed">
          Two files: one creates the payment, one handles the confirmation. This
          is the whole flow.
        </p>
        <CodeBlock language="typescript">
          {`// 1. checkout.ts — create a session and send the buyer to it
import { Offbank } from "@offbank/sdk";
const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });

export async function startCheckout(cartTotal: number, orderId: string) {
  const session = await offbank.checkout.sessions.create({
    merchantWallet: process.env.MY_WALLET!,
    merchantName: "My Store",
    amount: cartTotal,                       // e.g. 74.00
    successUrl: "https://store.com/thanks",
    cancelUrl: "https://store.com/cart",
    webhookUrl: "https://store.com/api/offbank-webhook",
    metadata: { orderId },
  });
  return session.url;   // redirect the buyer here (or pass session.id to the widget)
}`}
        </CodeBlock>
        <CodeBlock language="typescript">
          {`// 2. app/api/offbank-webhook/route.ts — fulfil when Offbank confirms it
import { Offbank } from "@offbank/sdk";
const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });

export async function POST(req: Request) {
  const body = await req.text(); // RAW body — needed to verify the signature

  const ok = offbank.webhooks.verify(
    body,
    req.headers.get("X-Offbank-Signature"),
    process.env.OFFBANK_WEBHOOK_SECRET!,   // Settings → Webhook signing secret
    300,                                   // reject events older than 5 min
  );
  if (!ok) return new Response("bad signature", { status: 400 });

  const event = JSON.parse(body);
  if (event.event === "payment.completed") {
    // Offbank already verified this on-chain — safe to ship the order.
    await fulfilOrder(event.data.metadata.orderId, event.data.paymentSignature);
  }
  return Response.json({ received: true });
}`}
        </CodeBlock>

        {/* ── Method reference ── */}
        <div className="mt-14 mb-2 border-t border-[#d3d3d3] pt-8">
          <h3 className="text-xl font-bold">Methods</h3>
        </div>

        {/* checkout.sessions.create */}
        <SdkMethod
          signature="offbank.checkout.sessions.create(params)"
          lead="Create a checkout session. The amount is fixed on our server, so the buyer can't change what they owe. Returns a hosted checkout URL and an id you can hand to the embed widget."
        >
          <p className="text-[13px] font-semibold text-[#5c5c5c] mb-2">
            Parameters
          </p>
          <div className="rounded-lg border border-[#d3d3d3] p-4 mb-4">
            <SdkParam name="merchantWallet" type="string" required>
              Your Solana wallet — where USDC settles.
            </SdkParam>
            <SdkParam name="merchantName" type="string" required>
              Shown to the buyer on the checkout.
            </SdkParam>
            <SdkParam name="amount" type="number" required>
              Amount in whole USDC (e.g. <code className="font-mono">74.0</code>).
            </SdkParam>
            <SdkParam name="successUrl / cancelUrl" type="string" required>
              Where to send the buyer after paying / cancelling.
            </SdkParam>
            <SdkParam name="webhookUrl" type="string">
              Your endpoint for the <code className="font-mono">payment.completed</code>{" "}
              webhook.
            </SdkParam>
            <SdkParam name="metadata" type="object">
              Anything you want echoed back on the webhook (e.g. an order id).
            </SdkParam>
          </div>
          <p className="text-[13px] font-semibold text-[#5c5c5c] mb-2">
            Example &amp; response
          </p>
          <CodeBlock language="typescript">
            {`const session = await offbank.checkout.sessions.create({
  merchantWallet: "DjLFeMQ3...rSQV",
  merchantName: "My Store",
  amount: 74.0,
  successUrl: "https://store.com/thanks",
  cancelUrl: "https://store.com/cart",
});

// → {
//     id: "cs_9hwbf9...",
//     url: "https://offbankpay.com/checkout/cs_9hwbf9...",
//     expiresAt: 1752160200000,
//     status: "pending"
//   }`}
          </CodeBlock>
        </SdkMethod>

        {/* invoices.create */}
        <SdkMethod
          signature="offbank.invoices.create(params)"
          lead="Create an invoice and (by default) email the buyer a hosted USDC pay link. Great for wholesale and net-terms billing."
        >
          <p className="text-[13px] font-semibold text-[#5c5c5c] mb-2">
            Parameters
          </p>
          <div className="rounded-lg border border-[#d3d3d3] p-4 mb-4">
            <SdkParam name="buyerName" type="string" required>
              Who the invoice is for.
            </SdkParam>
            <SdkParam name="buyerEmail" type="string" required>
              Where the pay link is sent.
            </SdkParam>
            <SdkParam name="lineItems" type="LineItem[]" required>
              Each: <code className="font-mono">{`{ description, quantity, unitPrice }`}</code>.
              Line + invoice totals are computed for you.
            </SdkParam>
            <SdkParam name="dueDate" type="string | Date" required>
              ISO date or a <code className="font-mono">Date</code>.
            </SdkParam>
            <SdkParam name="memo / terms / invoiceNumber" type="string">
              Optional notes, terms, and a custom number.
            </SdkParam>
            <SdkParam name="sendEmail" type="boolean">
              Email the buyer immediately. Defaults to{" "}
              <code className="font-mono">true</code>.
            </SdkParam>
          </div>
          <CodeBlock language="typescript">
            {`const invoice = await offbank.invoices.create({
  buyerName: "Acme Wholesale",
  buyerEmail: "ap@acme.com",
  lineItems: [
    { description: "VonG (case of 24)", quantity: 10, unitPrice: 1200 },
  ],
  dueDate: "2026-08-01",
  memo: "Net 30",
});

console.log(invoice.invoiceUrl);   // hosted USDC pay page
// → { id, invoiceNumber: "INV-202608-7792", status: "sent",
//     total: 12000, invoiceUrl, createdAt }`}
          </CodeBlock>
        </SdkMethod>

        {/* invoices.list / get */}
        <SdkMethod
          signature="offbank.invoices.list(params)   ·   offbank.invoices.get(id)"
          lead="List your invoices (optionally filtered by status) or fetch one by id."
        >
          <CodeBlock language="typescript">
            {`const { invoices, count } = await offbank.invoices.list({
  status: "sent",   // draft | sent | viewed | paid | overdue | cancelled
  limit: 20,
});

const one = await offbank.invoices.get("inv_9hwbf9...");`}
          </CodeBlock>
        </SdkMethod>

        {/* payouts.create */}
        <SdkMethod
          signature="offbank.payouts.create(params)"
          lead="Send USDC to anyone by email — iGaming cashouts, affiliate commissions, supplier runs. They claim with any wallet (or one we provision) and it settles in seconds."
        >
          <div className="rounded-lg border border-[#d3d3d3] p-4 mb-4">
            <SdkParam name="email" type="string" required>
              Recipient — they get a claim link.
            </SdkParam>
            <SdkParam name="amount" type="number" required>
              Amount in whole USDC.
            </SdkParam>
            <SdkParam name="memo / metadata" type="string / object">
              Optional reference shown on the claim + returned to you.
            </SdkParam>
          </div>
          <CodeBlock language="typescript">
            {`await offbank.payouts.create({
  email: "player@example.com",
  amount: 250.0,
  memo: "Withdrawal #48210",
});

// Pay a whole run in parallel:
await Promise.all(
  winners.map((w) => offbank.payouts.create({ email: w.email, amount: w.amount })),
);`}
          </CodeBlock>
        </SdkMethod>

        {/* webhooks.verify */}
        <SdkMethod
          signature="offbank.webhooks.verify(rawBody, signatureHeader, secret, toleranceSeconds?)"
          lead="Verify a webhook is genuinely from Offbank before you trust it. Returns true only if the HMAC-SHA256 signature matches (constant-time) and — if you pass a tolerance — the timestamp is fresh. Always pass the RAW request body, not a re-serialized object."
        >
          <div className="rounded-lg border border-[#d3d3d3] p-4 mb-4">
            <SdkParam name="rawBody" type="string" required>
              The exact request body, unparsed.
            </SdkParam>
            <SdkParam name="signatureHeader" type="string | null" required>
              The <code className="font-mono">X-Offbank-Signature</code> header.
            </SdkParam>
            <SdkParam name="secret" type="string" required>
              Your webhook signing secret (Settings → Webhook signing secret).
            </SdkParam>
            <SdkParam name="toleranceSeconds" type="number">
              Reject events older than this many seconds. Recommended:{" "}
              <code className="font-mono">300</code>.
            </SdkParam>
          </div>
          <p className="text-[13px] text-[#8a8a8a] mb-3">
            See the full handler in “A complete checkout” above, or the Webhooks
            tab for the payload shape.
          </p>
        </SdkMethod>

        {/* Errors */}
        <div className="mt-14 border-t border-[#d3d3d3] pt-8">
          <h3 className="text-xl font-bold mb-3">Error handling</h3>
          <p className="text-[#8a8a8a] text-sm mb-3 leading-relaxed">
            Any failed request throws an{" "}
            <code className="font-mono text-[13px] text-[#5c5c5c]">
              OffbankError
            </code>{" "}
            with a numeric <code className="font-mono">.status</code> and a
            machine-readable <code className="font-mono">.code</code>.
          </p>
          <CodeBlock language="typescript">
            {`import { Offbank, OffbankError } from "@offbank/sdk";

try {
  await offbank.payouts.create({ email: "x@y.com", amount: 250 });
} catch (err) {
  if (err instanceof OffbankError) {
    console.error(err.status, err.code, err.message); // e.g. 401 "Invalid API key"
  } else {
    throw err;
  }
}`}
          </CodeBlock>
          <p className="text-[13px] text-[#8a8a8a] mt-3">
            Fully typed — every method&apos;s params and return value are
            inferred, and you can import types like{" "}
            <code className="font-mono">Invoice</code> or{" "}
            <code className="font-mono">CheckoutSession</code> from the package.
          </p>
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
          Create USDC invoices for any B2B transaction — wholesale orders,
          services, net-terms billing. Buyers pay via a one-click payment link
          and funds settle to your wallet instantly.
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

function Endpoint({
  method,
  path,
  children,
}: {
  method: "GET" | "POST" | "DELETE";
  path: string;
  children: ReactNode;
}) {
  const color =
    method === "POST"
      ? "text-[#34c759] bg-[#34c759]/15"
      : method === "DELETE"
        ? "text-[#d92d20] bg-[#d92d20]/10"
        : "text-[#2970ff] bg-[#2970ff]/10";
  return (
    <div className="border border-[#d3d3d3] rounded-lg overflow-hidden mb-6">
      <div className="bg-[#f2f2f2] px-4 py-3 flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-sm font-mono ${color}`}>
          {method}
        </span>
        <code className="text-[#212121]">{path}</code>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function APIContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">REST API reference</h2>
        <p className="text-[#8a8a8a] mb-6">
          Everything the SDK does, over plain HTTP. Use it from any language.
          The{" "}
          <code className="font-mono text-[13px] text-[#5c5c5c]">
            @offbank/sdk
          </code>{" "}
          package wraps these endpoints with types.
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
          <p className="text-[#8a8a8a] text-sm mb-3">
            Server-to-server calls authenticate with your{" "}
            <strong className="text-[#5c5c5c]">API key</strong> — send it as an{" "}
            <code className="font-mono text-[12px]">x-api-key</code> header (or{" "}
            <code className="font-mono text-[12px]">
              Authorization: Bearer
            </code>
            ). Create keys in{" "}
            <strong className="text-[#5c5c5c]">Settings → API keys</strong>.
            Never expose a key in a browser.
          </p>
          <CodeBlock language="bash">
            {`curl https://offbankpay.com/api/invoices \\
  -H "x-api-key: $OFFBANK_API_KEY"`}
          </CodeBlock>
        </div>

        {/* Checkout sessions */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mt-10 mb-4">
          Checkout sessions
        </h3>
        <Endpoint method="POST" path="/checkout/sessions">
          <p className="text-[#8a8a8a] text-sm">
            Create a checkout session with a server-fixed amount (untamperable).
            Returns a hosted checkout <code className="font-mono">url</code> and
            an <code className="font-mono">id</code> for the embed widget.
          </p>
          <CodeBlock language="json">
            {`// request
{
  "merchantWallet": "DjLFeMQ3...rSQV",
  "merchantName": "My Store",
  "amount": 74.00,
  "successUrl": "https://store.com/thanks",
  "cancelUrl": "https://store.com/cart",
  "webhookUrl": "https://store.com/api/offbank-webhook"
}`}
          </CodeBlock>
          <CodeBlock language="json">
            {`// response
{ "id": "cs_9hwbf9...", "url": "https://offbankpay.com/checkout/cs_9hwbf9...", "expiresAt": 1752160200000, "status": "pending" }`}
          </CodeBlock>
        </Endpoint>

        {/* Invoices */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mt-10 mb-4">
          Invoices
        </h3>
        <Endpoint method="POST" path="/invoices">
          <p className="text-[#8a8a8a] text-sm">
            Create an invoice and (by default) email the buyer a hosted USDC pay
            link. Requires an API key.
          </p>
          <CodeBlock language="json">
            {`// request
{
  "buyerName": "Acme Wholesale",
  "buyerEmail": "ap@acme.com",
  "lineItems": [
    { "description": "Order #4421", "quantity": 1, "unitPrice": 47500 }
  ],
  "dueDate": "2026-08-01",
  "memo": "Net 30",
  "sendEmail": true
}`}
          </CodeBlock>
          <CodeBlock language="json">
            {`// response
{ "id": "inv_9hwbf9...", "invoiceNumber": "INV-202608-7792", "status": "sent", "total": 47500, "invoiceUrl": "https://offbankpay.com/invoice/ykh2w8...", "createdAt": "2026-07-03T10:00:00Z" }`}
          </CodeBlock>
        </Endpoint>
        <Endpoint method="GET" path="/invoices?status=&limit=&offset=">
          <p className="text-[#8a8a8a] text-sm">
            List your invoices. Optional{" "}
            <code className="font-mono">status</code> filter (draft, sent,
            viewed, paid, overdue, cancelled). Add{" "}
            <code className="font-mono">?stats=true</code> for totals.
          </p>
        </Endpoint>

        {/* Payouts */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mt-10 mb-4">
          Payouts
        </h3>
        <Endpoint method="POST" path="/payouts">
          <p className="text-[#8a8a8a] text-sm">
            Send USDC to anyone by email — iGaming cashouts, affiliate
            commissions, supplier runs. They claim with any wallet (or one we
            provision) and it settles in seconds. Requires an API key.
          </p>
          <CodeBlock language="json">
            {`// request
{ "email": "player@example.com", "amount": 250.00, "memo": "Withdrawal #48210" }`}
          </CodeBlock>
        </Endpoint>

        <p className="text-[13px] text-[#8a8a8a] mt-4">
          On success, Offbank verifies every payment on-chain and fires a signed{" "}
          <code className="font-mono">payment.completed</code> webhook — see the
          Webhooks tab.
        </p>
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
        <h2 className="text-2xl font-bold mb-4">Integrations</h2>
        <p className="text-[#8a8a8a] mb-6">
          Add Offbank to the stores and platforms you already run. The checkout
          widget drops into any storefront; the SDK/REST API covers everything
          else.
        </p>

        {/* E-commerce / storefronts */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mb-4">
          Online stores
        </h3>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border-2 border-[#34c759]/30 bg-[#34c759]/[0.05] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#34c759]/15 text-[#34c759] px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <h3 className="font-semibold mb-1">Checkout widget</h3>
            <p className="text-sm text-[#8a8a8a]">
              One <code className="font-mono text-[12px]">&lt;script&gt;</code>{" "}
              tag on any site — Shopify, WooCommerce, or custom. See Getting
              Started for the snippet.
            </p>
          </div>
          <div className="rounded-lg border-2 border-[#34c759]/30 bg-[#34c759]/[0.05] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#34c759]/15 text-[#34c759] px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <h3 className="font-semibold mb-1">SDK / REST API</h3>
            <p className="text-sm text-[#8a8a8a]">
              <code className="font-mono text-[12px]">@offbank/sdk</code> for
              checkout sessions, invoices, and instant payouts. See the REST API
              tab.
            </p>
          </div>
          <div className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2]/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎮</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#8a8a8a]/10 text-[#8a8a8a] px-2 py-0.5 rounded-full">
                iGaming
              </span>
            </div>
            <h3 className="font-semibold mb-1">Deposits &amp; payouts</h3>
            <p className="text-sm text-[#8a8a8a]">
              Checkout sessions for deposits, the payouts API for instant player
              cashouts. Webhook-driven balance crediting.
            </p>
          </div>
        </div>

        {/* Wholesale / POS */}
        <h3 className="text-lg font-semibold text-[#5c5c5c] mb-4">
          Wholesale &amp; POS
        </h3>
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
              orders and syncs settlement status back. Settings → LeafLink.
            </p>
          </div>
          <div className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2]/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#8a8a8a]/10 text-[#8a8a8a] px-2 py-0.5 rounded-full">
                Planned
              </span>
            </div>
            <h3 className="font-semibold mb-1">Dutchie / Flowhub</h3>
            <p className="text-sm text-[#8a8a8a]">
              Dispensary POS. On the roadmap for cannabis operators.
            </p>
          </div>
        </div>

        <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#212121] mb-2">
            Need a platform we don&apos;t list?
          </h4>
          <p className="text-[#8a8a8a] text-sm">
            The SDK and REST API cover almost any flow. Tell us what you use at{" "}
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
