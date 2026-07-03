"use client";

/**
 * /widget - showcase + docs for the embeddable checkout widget. Loads the same
 * /embed.js a merchant would, so the "Try it live" button is the real widget.
 */

import { useState } from "react";
import Script from "next/script";
import { CodeBlock } from "@/components/CodeBlock";

const DEMO_MERCHANT =
  (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").split(",")[0]?.trim() ||
  "DthkuDsPKR6MqqV28rVSBEqdgnuNtEU6QpLACZ7bCBpD";

const SNIPPET = `<script src="https://offbankpay.com/embed.js"></script>

<button
  data-offbank-checkout
  data-merchant="YOUR_SOLANA_ADDRESS"
  data-amount="49.99"
  data-name="Your Store"
  data-order="INV-1023"
  data-evm="YOUR_EVM_ADDRESS">
  Pay with USDC
</button>`;

const PROGRAMMATIC = `// Call this from your store's checkout button,
// with the LIVE cart total at that moment:
OffbankCheckout.open({
  merchant: "YOUR_SOLANA_ADDRESS",
  evm: "YOUR_EVM_ADDRESS",         // optional - accept Ethereum/Base too
  amount: cart.total,              // dynamic
  name: "Your Store",
  orderId: order.id,
  items: cart.items,               // [{ name, qty, price }]
  webhook: "https://yoursite.com/hooks/offbank",
  onSuccess: (d) => completeOrder(order.id, d.signature),
});`;

export default function WidgetPage() {
  const [copied, setCopied] = useState(false);
  const [lastPaid, setLastPaid] = useState<string | null>(null);

  const copy = () => {
    navigator.clipboard?.writeText(SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const tryItLive = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.OffbankCheckout) return;
    w.OffbankCheckout.open({
      merchant: DEMO_MERCHANT,
      amount: 1,
      name: "Offbank Demo Store",
      orderId: "DEMO-" + Date.now(),
      sandbox: true,
      onSuccess: (d: { signature: string }) => setLastPaid(d.signature),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <Script src="/embed.js" strategy="afterInteractive" />

      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#34c759]">
        Checkout widget
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#101828]">
        Accept USDC on your site in two lines.
      </h1>
      <p className="mt-4 text-lg text-[#475467]">
        Drop in one script and a button. Your buyer pays stablecoin straight to
        your wallet - settles instantly, no card processor, no chargebacks,
        works across borders.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={tryItLive}
          className="rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048]"
        >
          Try it live ($1 demo)
        </button>
        <button
          onClick={copy}
          className="rounded-xl border border-[#d0d5dd] px-5 py-3 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
        >
          {copied ? "Copied!" : "Copy snippet"}
        </button>
        <a
          href="/demo/store"
          className="rounded-xl px-5 py-3 text-sm font-semibold text-[#34c759] transition-colors hover:bg-[#34c759]/5"
        >
          See it in a live store →
        </a>
      </div>

      {lastPaid && (
        <div className="mt-4 rounded-lg border border-[#34c759]/30 bg-[#34c759]/5 px-4 py-3 text-sm text-[#027a48]">
          ✓ Demo payment received - signature{" "}
          <span className="font-mono">{lastPaid.slice(0, 16)}…</span>
        </div>
      )}

      {/* Snippet */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-[#101828]">
          1. Drop-in button
        </h2>
        <div className="mt-2">
          <CodeBlock code={SNIPPET} filename="index.html" />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-[#101828]">
          2. Online store checkout (dynamic cart total)
        </h2>
        <div className="mt-2">
          <CodeBlock code={PROGRAMMATIC} filename="checkout.js" />
        </div>
      </div>

      {/* How it works */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            t: "Buyer scans",
            d: "A Solana Pay QR opens in a modal. They pay from any wallet.",
          },
          {
            t: "Settles instantly",
            d: "USDC lands in your wallet on-chain - final in seconds.",
          },
          {
            t: "You're notified",
            d: "onSuccess fires in the browser and your webhook fires server-side.",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#eaecf0] bg-white p-4"
          >
            <p className="text-sm font-semibold text-[#101828]">{s.t}</p>
            <p className="mt-1 text-[13px] text-[#667085]">{s.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-[#98a2b3]">
        The widget is one piece of Offbank - invoicing, a POS terminal, supplier
        payouts, and compliance tooling come with it.
      </p>
    </div>
  );
}
