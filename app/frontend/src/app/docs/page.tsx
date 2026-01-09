"use client";

import { useState } from "react";
import Link from "next/link";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<
    "quickstart" | "react" | "api" | "webhooks"
  >("quickstart");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-purple-400">
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
            Everything you need to accept USDC payments with Settlr.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/10">
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
                  ? "text-purple-400 border-b-2 border-purple-400"
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
          Accept USDC payments on your website with just a few lines of code.
        </p>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">
              Create Your Merchant Account
            </h3>
          </div>
          <p className="text-gray-400 mb-4">
            Sign up to get your API key. Quick setup with your wallet address.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Account →
          </a>
          <div className="mt-4 bg-gray-900 rounded-lg p-4">
            <p className="text-gray-500 text-sm mb-2">You&apos;ll receive:</p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>
                • <span className="text-purple-400 font-mono">API Key</span> -
                Your secret key for SDK initialization
              </li>
              <li>
                • <span className="text-purple-400 font-mono">Merchant ID</span>{" "}
                - Your unique merchant identifier
              </li>
            </ul>
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">Install the SDK</h3>
          </div>
          <CodeBlock language="bash">{`npm install @settlr/sdk`}</CodeBlock>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">
              Initialize with Your API Key
            </h3>
          </div>
          <p className="text-gray-400 mb-4">
            Use the API key from onboarding to initialize the SDK.
          </p>
          <CodeBlock language="tsx">
            {`import { Settlr } from '@settlr/sdk';

// Initialize with your credentials
const settlr = new Settlr({
  apiKey: 'sk_live_your_api_key',  // From onboarding
  merchant: {
    name: 'Your Store Name',
  },
});`}
          </CodeBlock>
        </div>

        {/* Step 4 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-xl font-semibold">Add a Payment Button</h3>
          </div>
          <CodeBlock language="tsx">
            {`import { SettlrPayButton } from '@settlr/sdk';

function CheckoutPage() {
  return (
    <SettlrPayButton
      amount={10.00}
      currency="USDC"
      onSuccess={(tx) => console.log('Paid!', tx)}
      onError={(err) => console.error(err)}
    />
  );
}`}
          </CodeBlock>
          <p className="text-gray-500 text-sm mt-3">
            💡 No need to specify recipient - payments go to the wallet you
            registered during onboarding.
          </p>
        </div>

        {/* Step 5 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              5
            </div>
            <h3 className="text-xl font-semibold">That&apos;s It!</h3>
          </div>
          <p className="text-gray-400">
            Your users can now pay with their wallet or email. Payments settle
            instantly to your registered wallet with a 2% fee.
          </p>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-purple-400 font-medium mb-1">
                Solana Payments
              </p>
              <p className="text-gray-500 text-sm">
                Instant, gasless transfers directly to your wallet
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-cyan-400 font-medium mb-1">Cross-chain USDC</p>
              <p className="text-gray-500 text-sm">
                Customers pay with USDC from ETH/Base/Arbitrum - you receive on
                Solana
              </p>
            </div>
          </div>
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

        {/* Prerequisites */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            Prerequisites
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            Before using the SDK, you need to:
          </p>
          <ol className="text-gray-400 text-sm space-y-2">
            <li>
              1.{" "}
              <a href="/onboarding" className="text-purple-400 hover:underline">
                Create a merchant account
              </a>{" "}
              to get your API key
            </li>
            <li>
              2. Install the SDK:{" "}
              <code className="text-cyan-400 bg-gray-800 px-2 py-0.5 rounded">
                npm install @settlr/sdk
              </code>
            </li>
          </ol>
        </div>

        {/* Payment Modal - NEW */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">
            ✨ New: Embedded Payment Modal
          </h3>
          <p className="text-gray-400 text-sm">
            Accept payments without redirecting users away from your site!
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-4">
          1. Payment Modal (Recommended)
        </h3>
        <p className="text-gray-400 mb-4">
          Keep users on your site with an embedded payment modal. Perfect for
          iGaming, e-commerce, and subscriptions.
        </p>
        <CodeBlock language="tsx">
          {`import { usePaymentModal, Settlr } from '@settlr/sdk';

// Initialize with your API key from onboarding
const settlr = new Settlr({
  apiKey: 'sk_live_your_api_key',
  merchant: { name: 'Arena GG' },
});

function TournamentPage() {
  const { openPayment, PaymentModalComponent } = usePaymentModal();

  const handleEnterTournament = () => {
    openPayment({
      amount: 25.00,
      memo: "Tournament Entry Fee",
      onSuccess: (result) => {
        console.log("Paid!", result.signature);
        unlockTournament();
      },
    });
  };

  return (
    <>
      <button onClick={handleEnterTournament}>
        Enter Tournament - $25.00
      </button>
      <PaymentModalComponent />
    </>
  );
}`}
        </CodeBlock>

        {/* Direct Modal Component */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          2. Direct Modal Component
        </h3>
        <p className="text-gray-400 mb-4">
          For more control, use the PaymentModal component directly.
        </p>
        <CodeBlock language="tsx">
          {`import { PaymentModal } from '@settlr/sdk';
import { useState } from 'react';

function ProductPage() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Buy Now - $49.99
      </button>

      {showPayment && (
        <PaymentModal
          amount={49.99}
          merchantName="My Store"
          merchantWallet="YOUR_WALLET_ADDRESS"
          memo="Premium Bundle"
          onSuccess={(result) => {
            console.log("Payment complete!", result.signature);
            setShowPayment(false);
            deliverProduct();
          }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}`}
        </CodeBlock>

        {/* Redirect Flow */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          3. Redirect Flow (Alternative)
        </h3>
        <p className="text-gray-400 mb-4">
          For simpler integrations, redirect users to Settlr checkout.
        </p>
        <CodeBlock language="tsx">
          {`import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({
  apiKey: "sk_test_xxx",
  merchant: {
    name: "My Store",
    walletAddress: "YOUR_WALLET_ADDRESS",
  },
});

// Redirect to Settlr checkout
const url = settlr.getCheckoutUrl({
  amount: 29.99,
  memo: "Order #1234",
  successUrl: "https://mystore.com/success",
});

window.location.href = url;`}
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
        className="bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 rounded-lg"
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
                <td className="px-4 py-3 font-mono text-purple-400">
                  recipient
                </td>
                <td className="px-4 py-3 text-gray-400">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Wallet address to receive payment
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">amount</td>
                <td className="px-4 py-3 text-gray-400">number</td>
                <td className="px-4 py-3 text-gray-400">
                  Payment amount in the specified currency
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">
                  currency
                </td>
                <td className="px-4 py-3 text-gray-400">'USDC' | 'SOL'</td>
                <td className="px-4 py-3 text-gray-400">
                  Token to accept (default: USDC)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">
                  onSuccess
                </td>
                <td className="px-4 py-3 text-gray-400">(tx) =&gt; void</td>
                <td className="px-4 py-3 text-gray-400">
                  Called when payment succeeds
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">onError</td>
                <td className="px-4 py-3 text-gray-400">(err) =&gt; void</td>
                <td className="px-4 py-3 text-gray-400">
                  Called when payment fails
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">label</td>
                <td className="px-4 py-3 text-gray-400">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Button text (default: "Pay with USDC")
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">memo</td>
                <td className="px-4 py-3 text-gray-400">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Optional memo attached to transaction
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">gasless</td>
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
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-gray-500 text-sm mb-1">Base URL</p>
          <code className="text-purple-400">https://api.settlr.io/v1</code>
        </div>

        {/* Authentication */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            🔐 Authentication
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            All API requests require your API key from{" "}
            <a href="/onboarding" className="text-purple-400 hover:underline">
              merchant onboarding
            </a>
            .
          </p>
          <CodeBlock language="bash">
            {`curl https://api.settlr.io/v1/payments \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json"`}
          </CodeBlock>
        </div>

        {/* Create Payment */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-white">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-gray-400 mb-4">
              Create a new payment request. The recipient is automatically set
              to your registered payout wallet.
            </p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
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
  "paymentUrl": "https://pay.settlr.io/pay_abc123",
  "expiresAt": "2024-01-15T12:00:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        {/* Get Payment */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
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
        <div className="border border-white/10 rounded-lg overflow-hidden">
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
                    <td className="px-4 py-2 font-mono text-purple-400">
                      status
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      pending | completed | expired
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-purple-400">
                      limit
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      Number of results (default: 20, max: 100)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-purple-400">
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
                <td className="px-4 py-3 font-mono text-purple-400">
                  payment.completed
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Payment was successful and confirmed
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">
                  payment.expired
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Payment link expired before completion
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-400">
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

  // Simple syntax highlighting
  const highlightCode = (code: string, lang: string) => {
    if (lang === "bash") {
      return code.split("\n").map((line, i) => (
        <div key={i}>
          {line.startsWith("#") ? (
            <span className="text-gray-500">{line}</span>
          ) : (
            <>
              <span className="text-gray-500">$ </span>
              <span className="text-purple-400">{line}</span>
            </>
          )}
        </div>
      ));
    }

    if (lang === "json") {
      return code.split("\n").map((line, i) => {
        // Highlight JSON
        const highlighted = line
          .replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
          .replace(
            /: "([^"]+)"/g,
            ': <span class="text-purple-400">"$1"</span>'
          )
          .replace(/: (\d+)/g, ': <span class="text-orange-400">$1</span>')
          .replace(
            /: (true|false|null)/g,
            ': <span class="text-blue-400">$1</span>'
          );
        return (
          <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
        );
      });
    }

    // TypeScript/TSX highlighting
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
      // Handle comments
      if (line.trim().startsWith("//")) {
        return (
          <div key={lineIndex} className="text-gray-500">
            {line}
          </div>
        );
      }

      // Process the line character by character for proper highlighting
      const lineChars = line;

      // Simple tokenizer
      const tokens: { type: string; value: string }[] = [];
      let i = 0;
      while (i < lineChars.length) {
        // String (double quotes)
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

        // Comment
        if (lineChars[i] === "/" && lineChars[i + 1] === "/") {
          tokens.push({ type: "comment", value: lineChars.slice(i) });
          break;
        }

        // Word (identifier or keyword)
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

        // Number
        if (/[0-9]/.test(lineChars[i])) {
          let num = "";
          while (i < lineChars.length && /[0-9._]/.test(lineChars[i])) {
            num += lineChars[i++];
          }
          tokens.push({ type: "number", value: num });
          continue;
        }

        // JSX tags
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

        // Operators and punctuation
        tokens.push({ type: "punctuation", value: lineChars[i++] });
      }

      // Render tokens
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
                  <span key={tokenIndex} className="text-purple-400">
                    {token.value}
                  </span>
                );
              case "comment":
                return (
                  <span key={tokenIndex} className="text-gray-500">
                    {token.value}
                  </span>
                );
              case "number":
                return (
                  <span key={tokenIndex} className="text-orange-400">
                    {token.value}
                  </span>
                );
              case "builtin":
                return (
                  <span key={tokenIndex} className="text-cyan-400">
                    {token.value}
                  </span>
                );
              case "react":
                return (
                  <span key={tokenIndex} className="text-purple-400">
                    {token.value}
                  </span>
                );
              case "class":
                return (
                  <span key={tokenIndex} className="text-yellow-300">
                    {token.value}
                  </span>
                );
              case "tag":
                return (
                  <span key={tokenIndex} className="text-blue-400">
                    {token.value}
                  </span>
                );
              default:
                return (
                  <span key={tokenIndex} className="text-gray-300">
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
    <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/70 border-b border-gray-700">
        <span className="text-xs text-gray-400 uppercase font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
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
    <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
