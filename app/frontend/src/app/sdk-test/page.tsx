"use client";

import { useState } from "react";
import { Settlr } from "@settlr/sdk";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Copy, ExternalLink, Key } from "lucide-react";

export default function SDKTestPage() {
  const [apiKey, setApiKey] = useState("sk_test_demo123456789");
  const [amount, setAmount] = useState("9.99");
  const [memo, setMemo] = useState("Test payment");
  const [result, setResult] = useState<{
    checkoutUrl: string;
    paymentId: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const testSDK = async () => {
    setLoading(true);
    try {
      const settlr = new Settlr({
        apiKey, // API key required!
        merchant: {
          name: "SDK Test Store",
          walletAddress: "DemoWa11etAddressForTestingPurposes111111111",
        },
        network: "devnet",
      });

      const payment = await settlr.createPayment({
        amount: parseFloat(amount),
        memo,
      });

      setResult({
        checkoutUrl: payment.checkoutUrl,
        paymentId: payment.id,
      });
    } catch (error) {
      console.error("SDK Error:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    if (result?.checkoutUrl) {
      navigator.clipboard.writeText(result.checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          SDK Test Page
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          Test the @settlr/sdk before publishing to npm
        </p>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Create Payment Link
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] font-mono text-sm"
                placeholder="sk_live_xxxxxxxxxxxx"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Use sk_test_* keys for testing (no validation required)
              </p>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                placeholder="9.99"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                Memo
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                placeholder="Order description"
              />
            </div>

            <button
              onClick={testSDK}
              disabled={loading || !apiKey}
              className="w-full btn-primary py-3"
            >
              {loading ? "Creating..." : "Test createPayment()"}
            </button>
          </div>
        </div>

        {result && (
          <div className="glass-card p-6 border-[var(--success)]">
            <div className="flex items-center gap-2 text-[var(--success)] mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Payment Created!</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">
                  Payment ID
                </label>
                <code className="block p-3 bg-[var(--background)] rounded-lg text-sm text-[var(--text-secondary)] break-all">
                  {result.paymentId}
                </code>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">
                  Checkout URL
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-[var(--background)] rounded-lg text-sm text-[var(--text-secondary)] break-all">
                    {result.checkoutUrl}
                  </code>
                  <button
                    onClick={copyUrl}
                    className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                    ) : (
                      <Copy className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </button>
                </div>
              </div>

              <a
                href={result.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-secondary"
              >
                Open Checkout
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 glass-card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Code Used
          </h2>
          <pre className="p-4 bg-[var(--background)] rounded-lg overflow-x-auto text-sm">
            <code className="text-[var(--text-secondary)]">
              {`import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  apiKey: "${apiKey.slice(0, 12)}...",
  merchant: {
    name: "SDK Test Store",
    walletAddress: "YOUR_WALLET",
  },
  network: "devnet",
});

const payment = await settlr.createPayment({
  amount: ${amount},
  memo: "${memo}",
});

console.log(payment.checkoutUrl);`}
            </code>
          </pre>
        </div>
      </div>
    </main>
  );
}
