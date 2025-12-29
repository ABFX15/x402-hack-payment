"use client";

import { useState } from "react";
import Link from "next/link";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<
    "quickstart" | "react" | "api" | "webhooks"
  >("quickstart");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-400">
            Settlr
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/demo"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Demo
            </Link>
            <a
              href="https://github.com/your-org/settlr"
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-gray-400">
            Everything you need to accept crypto payments with Settlr.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-800">
          {[
            { id: "quickstart", label: "Quick Start" },
            { id: "react", label: "React SDK" },
            { id: "api", label: "API Reference" },
            { id: "webhooks", label: "Webhooks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {activeTab === "quickstart" && <QuickStartContent />}
          {activeTab === "react" && <ReactSDKContent />}
          {activeTab === "api" && <APIContent />}
          {activeTab === "webhooks" && <WebhooksContent />}
        </div>
      </div>
    </div>
  );
}

function QuickStartContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Get Started in 5 Minutes</h2>
        <p className="text-gray-400 mb-6">
          Accept crypto payments on your website with just a few lines of code.
        </p>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Install the SDK</h3>
          </div>
          <CodeBlock language="bash">{`npm install @settlr/sdk`}</CodeBlock>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">Create a Payment Button</h3>
          </div>
          <CodeBlock language="tsx">
            {`import { SettlrPayButton } from '@settlr/sdk';

function CheckoutPage() {
  return (
    <SettlrPayButton
      recipient="YOUR_WALLET_ADDRESS"
      amount={10.00}
      currency="USDC"
      onSuccess={(tx) => console.log('Paid!', tx)}
      onError={(err) => console.error(err)}
    />
  );
}`}
          </CodeBlock>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">That's It!</h3>
          </div>
          <p className="text-gray-400">
            Your users can now pay with their Solana wallet. Payments settle
            instantly and you receive the full amount minus a 2% fee.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="⚡"
            title="Instant Settlement"
            description="Funds land in your wallet within seconds."
          />
          <FeatureCard
            icon="🔒"
            title="Non-Custodial"
            description="You control your funds. We never hold your money."
          />
          <FeatureCard
            icon="💰"
            title="Gasless Payments"
            description="Users don't need SOL for gas. We cover it."
          />
        </div>
      </section>
    </div>
  );
}

function ReactSDKContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">React SDK</h2>
        <p className="text-gray-400 mb-6">
          Full control over the payment flow with React hooks and components.
        </p>

        {/* Provider Setup */}
        <h3 className="text-xl font-semibold mb-4">1. Setup the Provider</h3>
        <p className="text-gray-400 mb-4">
          Wrap your app with the SettlrProvider to enable payments.
        </p>
        <CodeBlock language="tsx">
          {`import { SettlrProvider } from '@settlr/sdk';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

function App() {
  return (
    <SettlrProvider 
      network={WalletAdapterNetwork.Devnet}
      // Optional: Add your API key for analytics
      apiKey="your-api-key"
    >
      <YourApp />
    </SettlrProvider>
  );
}`}
        </CodeBlock>

        {/* Pay Button */}
        <h3 className="text-xl font-semibold mb-4 mt-8">2. Add a Pay Button</h3>
        <p className="text-gray-400 mb-4">
          The simplest way to accept payments.
        </p>
        <CodeBlock language="tsx">
          {`import { SettlrPayButton } from '@settlr/sdk';

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>\${product.price}</p>
      
      <SettlrPayButton
        recipient="MERCHANT_WALLET"
        amount={product.price}
        currency="USDC"
        label="Buy Now"
        onSuccess={(tx) => {
          // Payment complete! Fulfill the order
          fulfillOrder(product.id, tx.signature);
        }}
        onError={(error) => {
          toast.error('Payment failed');
        }}
      />
    </div>
  );
}`}
        </CodeBlock>

        {/* useSettlr Hook */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          3. Custom UI with useSettlr Hook
        </h3>
        <p className="text-gray-400 mb-4">
          Build your own payment UI with full control.
        </p>
        <CodeBlock language="tsx">
          {`import { useSettlr } from '@settlr/sdk';

function CustomCheckout() {
  const { pay, status, error } = useSettlr();
  
  const handlePayment = async () => {
    const result = await pay({
      recipient: 'MERCHANT_WALLET',
      amount: 25.00,
      currency: 'USDC',
      memo: 'Order #12345',
    });
    
    if (result.success) {
      router.push('/thank-you?tx=' + result.signature);
    }
  };
  
  return (
    <div>
      <button 
        onClick={handlePayment}
        disabled={status === 'processing'}
        className="bg-emerald-500 px-6 py-3 rounded-lg"
      >
        {status === 'processing' ? 'Processing...' : 'Pay $25.00'}
      </button>
      
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
}`}
        </CodeBlock>

        {/* Props Reference */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Props Reference</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Prop</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  recipient
                </td>
                <td className="px-4 py-3 text-gray-400">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Wallet address to receive payment
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">amount</td>
                <td className="px-4 py-3 text-gray-400">number</td>
                <td className="px-4 py-3 text-gray-400">
                  Payment amount in the specified currency
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  currency
                </td>
                <td className="px-4 py-3 text-gray-400">'USDC' | 'SOL'</td>
                <td className="px-4 py-3 text-gray-400">
                  Token to accept (default: USDC)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  onSuccess
                </td>
                <td className="px-4 py-3 text-gray-400">(tx) =&gt; void</td>
                <td className="px-4 py-3 text-gray-400">
                  Called when payment succeeds
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  onError
                </td>
                <td className="px-4 py-3 text-gray-400">(err) =&gt; void</td>
                <td className="px-4 py-3 text-gray-400">
                  Called when payment fails
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">label</td>
                <td className="px-4 py-3 text-gray-400">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Button text (default: "Pay with Crypto")
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">memo</td>
                <td className="px-4 py-3 text-gray-400">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Optional memo attached to transaction
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  gasless
                </td>
                <td className="px-4 py-3 text-gray-400">boolean</td>
                <td className="px-4 py-3 text-gray-400">
                  Enable gasless transactions (default: true)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function APIContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        <p className="text-gray-400 mb-6">
          Use our REST API for server-side integrations.
        </p>

        {/* Base URL */}
        <div className="bg-gray-900 rounded-lg p-4 mb-8">
          <p className="text-gray-500 text-sm mb-1">Base URL</p>
          <code className="text-emerald-400">https://api.settlr.io/v1</code>
        </div>

        {/* Create Payment */}
        <div className="border border-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-white">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-gray-400 mb-4">Create a new payment request.</p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
  "recipient": "YOUR_WALLET_ADDRESS",
  "amount": 10.00,
  "currency": "USDC",
  "memo": "Order #12345",
  "metadata": {
    "orderId": "12345",
    "customerId": "user_abc"
  }
}`}
            </CodeBlock>
            <h4 className="font-medium mb-2 mt-4">Response</h4>
            <CodeBlock language="json">
              {`{
  "id": "pay_abc123",
  "status": "pending",
  "amount": 10.00,
  "currency": "USDC",
  "recipient": "YOUR_WALLET_ADDRESS",
  "paymentUrl": "https://pay.settlr.io/pay_abc123",
  "expiresAt": "2024-01-15T12:00:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        {/* Get Payment */}
        <div className="border border-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-white">/payments/:id</code>
          </div>
          <div className="p-4">
            <p className="text-gray-400 mb-4">Retrieve a payment by ID.</p>
            <h4 className="font-medium mb-2">Response</h4>
            <CodeBlock language="json">
              {`{
  "id": "pay_abc123",
  "status": "completed",
  "amount": 10.00,
  "currency": "USDC",
  "recipient": "YOUR_WALLET_ADDRESS",
  "signature": "5xKj...abc",
  "paidAt": "2024-01-15T11:30:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        {/* List Payments */}
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-white">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-gray-400 mb-4">
              List all payments with optional filters.
            </p>
            <h4 className="font-medium mb-2">Query Parameters</h4>
            <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-4 py-2 font-mono text-emerald-400">
                      status
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      pending | completed | expired
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-emerald-400">
                      limit
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      Number of results (default: 20, max: 100)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-emerald-400">
                      cursor
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      Pagination cursor
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WebhooksContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
        <p className="text-gray-400 mb-6">
          Get notified when payments are completed.
        </p>

        {/* Setup */}
        <h3 className="text-xl font-semibold mb-4">Setting Up Webhooks</h3>
        <p className="text-gray-400 mb-4">
          Configure your webhook endpoint in the Settlr dashboard. We'll send a
          POST request whenever a payment is completed.
        </p>

        {/* Payload */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Webhook Payload</h3>
        <CodeBlock language="json">
          {`{
  "event": "payment.completed",
  "data": {
    "id": "pay_abc123",
    "status": "completed",
    "amount": 10.00,
    "currency": "USDC",
    "recipient": "YOUR_WALLET_ADDRESS",
    "signature": "5xKj...abc",
    "paidAt": "2024-01-15T11:30:00Z",
    "metadata": {
      "orderId": "12345"
    }
  },
  "timestamp": "2024-01-15T11:30:01Z"
}`}
        </CodeBlock>

        {/* Handler Example */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Example Handler (Next.js)
        </h3>
        <CodeBlock language="typescript">
          {`// app/api/webhooks/settlr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-settlr-signature');
  
  // Verify the webhook signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.SETTLR_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  if (event.event === 'payment.completed') {
    const { id, amount, metadata } = event.data;
    
    // Fulfill the order
    await fulfillOrder(metadata.orderId, id);
  }
  
  return NextResponse.json({ received: true });
}`}
        </CodeBlock>

        {/* Events */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Event Types</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  payment.completed
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Payment was successful and confirmed
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  payment.expired
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Payment link expired before completion
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  payment.failed
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Payment failed due to an error
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-yellow-400 mb-2">⚠️ Security Note</h4>
          <p className="text-gray-400">
            Always verify the webhook signature before processing events. Never
            trust the payload without verification.
          </p>
        </div>
      </section>
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

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
        <span className="text-xs text-gray-500 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300">{children}</code>
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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
