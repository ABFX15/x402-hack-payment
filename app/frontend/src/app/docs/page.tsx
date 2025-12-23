"use client";

import Link from "next/link";
import {
  Code,
  Gamepad2,
  CreditCard,
  Zap,
  Shield,
  Webhook,
  Copy,
  ExternalLink,
} from "lucide-react";

// Note: metadata moved to layout.tsx or removed for client component

function CodeBlock({
  code,
  language = "html",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative group">
      <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto text-sm">
        <code className="text-zinc-300">{code}</code>
      </pre>
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute top-3 right-3 p-2 bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700"
      >
        <Copy className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
}

export default function DocsPage() {
  const widgetCode = `<!-- Add this script to your page -->
<script src="https://settlr.app/widget.js"></script>

<!-- Create a payment button -->
<button onclick="handlePayment()">
  Buy 100 Gems - $9.99
</button>

<script>
function handlePayment() {
  Settlr.checkout({
    merchantWallet: 'YOUR_SOLANA_WALLET_ADDRESS',
    amount: 9.99,
    memo: '100 Gems Pack',
    merchantName: 'My Game',
    onSuccess: function(data) {
      console.log('Payment confirmed!', data.signature);
      // Grant the gems to player
      grantGemsToPlayer(100);
    },
    onCancel: function() {
      console.log('User cancelled');
    },
    onError: function(error) {
      console.error('Payment failed:', error.message);
    }
  });
}
</script>`;

  const dataAttributeCode = `<!-- Or use data attributes (no JavaScript needed) -->
<button
  data-settlr-checkout
  data-merchant-wallet="YOUR_SOLANA_WALLET_ADDRESS"
  data-amount="9.99"
  data-memo="100 Gems Pack"
  data-merchant-name="My Game"
>
  Buy 100 Gems
</button>

<script src="https://settlr.app/widget.js"></script>`;

  const serverCode = `// Your game server webhook handler
// POST /api/webhooks/settlr

import { verifyWebhookSignature } from '@settlr/sdk';

export async function POST(request) {
  const signature = request.headers.get('x-settlr-signature');
  const body = await request.text();
  
  // Verify the webhook is from Settlr
  if (!verifyWebhookSignature(body, signature, process.env.WEBHOOK_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  if (event.type === 'payment.completed') {
    const { orderId, amount, customerWallet } = event.data;
    
    // Grant items to the player
    await grantItemsToPlayer(customerWallet, orderId);
    
    // Update your database
    await db.orders.update({
      where: { id: orderId },
      data: { status: 'paid', paidAt: new Date() }
    });
  }
  
  return new Response('OK');
}`;

  const reactCode = `// React/Next.js integration
import { CheckoutButton } from '@settlr/sdk/react';

function BuyGemsButton() {
  return (
    <CheckoutButton
      merchantWallet="YOUR_SOLANA_WALLET_ADDRESS"
      amount={9.99}
      memo="100 Gems Pack"
      merchantName="My Game"
      onSuccess={(data) => {
        console.log('Paid!', data.signature);
        // Grant items
      }}
    >
      Buy 100 Gems
    </CheckoutButton>
  );
}`;

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Settlr<span className="text-pink-400">.</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/demo"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link href="/docs" className="text-pink-400 font-medium">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm mb-6">
            <Gamepad2 className="w-4 h-4" />
            Built for Gaming
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Accept Crypto Payments
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              In Your Game
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Integrate Settlr in under 5 minutes. No wallet required from your
            players. Instant USDC settlements on Solana.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-6 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Wallet Required
            </h3>
            <p className="text-zinc-400 text-sm">
              Players sign in with email. We create an embedded wallet
              automatically.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Instant Settlement
            </h3>
            <p className="text-zinc-400 text-sm">
              Payments settle in ~400ms on Solana. No 3-day holds like credit
              cards.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <Webhook className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Webhooks</h3>
            <p className="text-zinc-400 text-sm">
              Get instant notifications when payments complete. Grant items
              automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Steps */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Integration Guide
          </h2>

          {/* Step 1 */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-xl font-semibold text-white">
                Add the Widget Script
              </h3>
            </div>
            <p className="text-zinc-400 mb-4">
              Add our lightweight script to your game's web page. It's only 8KB
              and has no dependencies.
            </p>
            <CodeBlock code={widgetCode} language="html" />
          </div>

          {/* Step 2 */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-xl font-semibold text-white">
                Or Use Data Attributes
              </h3>
            </div>
            <p className="text-zinc-400 mb-4">
              For simple use cases, you can use HTML data attributes instead of
              JavaScript.
            </p>
            <CodeBlock code={dataAttributeCode} language="html" />
          </div>

          {/* Step 3 */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-xl font-semibold text-white">
                Handle Webhooks (Server-Side)
              </h3>
            </div>
            <p className="text-zinc-400 mb-4">
              Set up a webhook endpoint to receive payment confirmations and
              grant items securely.
            </p>
            <CodeBlock code={serverCode} language="javascript" />
          </div>

          {/* React/Next.js */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                React/Next.js Component
              </h3>
            </div>
            <p className="text-zinc-400 mb-4">
              If you're using React or Next.js, use our SDK for a smoother
              integration.
            </p>
            <CodeBlock code={reactCode} language="jsx" />
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="py-16 px-6 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            API Reference
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <code className="text-pink-400">Settlr.checkout(config)</code>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500">
                    <th className="pb-3">Parameter</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">
                      merchantWallet
                    </td>
                    <td className="py-3 text-zinc-500">string</td>
                    <td className="py-3">
                      Your Solana wallet address (required)
                    </td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">amount</td>
                    <td className="py-3 text-zinc-500">number</td>
                    <td className="py-3">Payment amount in USDC (required)</td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">memo</td>
                    <td className="py-3 text-zinc-500">string</td>
                    <td className="py-3">
                      Item description (e.g., "100 Gems")
                    </td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">
                      merchantName
                    </td>
                    <td className="py-3 text-zinc-500">string</td>
                    <td className="py-3">Your game/company name</td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">onSuccess</td>
                    <td className="py-3 text-zinc-500">function</td>
                    <td className="py-3">
                      Called with {`{ signature }`} on success
                    </td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">onCancel</td>
                    <td className="py-3 text-zinc-500">function</td>
                    <td className="py-3">Called when user closes modal</td>
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-cyan-400">onError</td>
                    <td className="py-3 text-zinc-500">function</td>
                    <td className="py-3">Called with Error on failure</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-zinc-400 mb-8">
            Try our demo checkout and see how easy it is for your players.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Demo
            </Link>
            <a
              href="https://github.com/settlr/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
