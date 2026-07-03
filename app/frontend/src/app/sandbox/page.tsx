"use client";

/**
 * /sandbox - interactive checkout playground. Configure an amount + items and
 * launch the real Offbank widget in SANDBOX mode (it can be completed with a
 * "Simulate payment" button - no wallet or funds needed). Built for demos.
 */

import { useState } from "react";
import Script from "next/script";
import { CodeBlock } from "@/components/CodeBlock";

// A throwaway devnet wallet so the widget has a valid recipient to render.
const DEMO_MERCHANT = "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV";

interface Result {
  signature: string;
  amount?: number;
}

export default function SandboxPage() {
  const [name, setName] = useState("Acme Wholesale");
  const [amount, setAmount] = useState("198.00");
  const [item1, setItem1] = useState("Starter pack");
  const [item2, setItem2] = useState("Add-on");
  const [result, setResult] = useState<Result | null>(null);

  const launch = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setResult(null);
    const items = [item1, item2]
      .filter(Boolean)
      .map((n, i) => ({ name: n, qty: 1, price: i === 0 ? amt : 0 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.OffbankCheckout) return;
    w.OffbankCheckout.open({
      merchant: DEMO_MERCHANT,
      // Demo EVM receiving address - surfaces the "Pay with Ethereum" option.
      evm: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      amount: amt,
      name: name || "Demo Store",
      orderId: "SANDBOX-" + Date.now(),
      items,
      sandbox: true,
      onSuccess: (d: Result) => setResult({ signature: d.signature, amount: amt }),
    });
  };

  const snippet = `<script src="https://offbankpay.com/embed.js"></script>

<button
  data-offbank-checkout
  data-merchant="YOUR_WALLET_ADDRESS"
  data-amount="${amount}"
  data-name="${name}">
  Pay ${amount ? "$" + amount : ""} with USDC
</button>`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Script src="/embed.js" strategy="afterInteractive" />

      <div className="mb-2 inline-flex items-center gap-2">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#34c759]">
          Checkout sandbox
        </p>
        <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#92400e]">
          No real funds
        </span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-[#101828]">
        Try the{" "}
        <span className="bg-gradient-to-r from-[#34c759] via-[#06b6d4] to-[#8b5cf6] bg-clip-text text-transparent">
          Offbank checkout
        </span>
        .
      </h1>
      <p className="mt-3 text-lg text-[#475467]">
        Configure a checkout and launch the real widget. In sandbox mode you
        complete it with a single &ldquo;Simulate payment&rdquo; click - no
        wallet, no USDC, no setup.
      </p>

      {/* Config */}
      <div className="mt-8 rounded-2xl border border-[#eaecf0] bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Store name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Amount (USDC)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Line item 1
            </label>
            <input
              value={item1}
              onChange={(e) => setItem1(e.target.value)}
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Line item 2
            </label>
            <input
              value={item2}
              onChange={(e) => setItem2(e.target.value)}
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
        </div>

        <button
          onClick={launch}
          className="mt-5 w-full rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048]"
        >
          Launch checkout
        </button>
      </div>

      {result && (
        <div className="mt-4 rounded-xl border border-[#34c759]/30 bg-[#34c759]/5 px-4 py-3 text-sm text-[#027a48]">
          ✓ Payment received{result.amount ? ` - $${result.amount.toFixed(2)}` : ""}.
          Your <code>onSuccess</code> fired with signature{" "}
          <span className="font-mono">{result.signature.slice(0, 18)}…</span>
        </div>
      )}

      {/* Snippet */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-[#101828]">
          The snippet for this checkout
        </h2>
        <div className="mt-2">
          <CodeBlock code={snippet} filename="checkout.html" />
        </div>
      </div>

      <p className="mt-8 text-[13px] text-[#98a2b3]">
        Want a full storefront example?{" "}
        <a href="/demo/store" className="text-[#34c759] hover:underline">
          Open the demo store →
        </a>
      </p>
    </div>
  );
}
