# @settlr/sdk

[![npm version](https://img.shields.io/npm/v/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Accept crypto payments without wallets.** Customers pay with email. You get USDC instantly.

🌐 **Website:** [settlr.dev](https://settlr.dev)  
📖 **Docs:** [settlr.dev/docs](https://settlr.dev/docs)  
🎮 **Demo:** [settlr.dev/demo](https://settlr.dev/demo)

## Why Settlr?

- ✅ **No wallet required** - Customers pay with just an email
- ✅ **Zero gas fees** - No SOL needed, ever
- ✅ **Instant settlement** - USDC direct to your wallet
- ✅ **One component** - Drop-in React `<BuyButton>`
- ✅ **2% flat fee** - No hidden costs

## Installation

```bash
npm install @settlr/sdk
```

## Quick Start

### 1. Get Your API Key

Sign up at [settlr.dev/onboarding](https://settlr.dev/onboarding) to register your business and get an API key. Your wallet address is linked to your API key automatically.

### 2. Create a Payment Link

```typescript
import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  apiKey: "sk_live_xxxxxxxxxxxx", // Your API key from dashboard
  merchant: {
    name: "My Store",
    // walletAddress is optional - automatically fetched from your API key
  },
});

const payment = await settlr.createPayment({
  amount: 29.99,
  memo: "Premium subscription",
});

// Redirect customer to checkout
window.location.href = payment.checkoutUrl;
```

> **Note:** When you register at [settlr.dev/onboarding](https://settlr.dev/onboarding), your wallet address is linked to your API key. The SDK automatically fetches it - no need to include it in your code!

### 3. Drop-in Buy Button ⭐ NEW

The easiest way to accept payments - just drop in a button:

```tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

function App() {
  return (
    <SettlrProvider
      config={{
        apiKey: "sk_live_xxxxxxxxxxxx",
        merchant: { name: "GameStore" }, // Wallet fetched from API key
      }}
    >
      <BuyButton
        amount={49.99}
        memo="Premium Game Bundle"
        onSuccess={(result) => {
          console.log("Payment successful!", result.signature);
          unlockContent();
        }}
      >
        Buy Now - $49.99
      </BuyButton>
    </SettlrProvider>
  );
}
```

### 4. Checkout Widget ⭐ NEW

Full embeddable checkout with product info:

```tsx
import { CheckoutWidget } from "@settlr/sdk";

<CheckoutWidget
  amount={149.99}
  productName="Annual Subscription"
  productDescription="Full access to all premium features"
  productImage="/subscription.png"
  onSuccess={(result) => router.push("/success")}
  onError={(error) => console.error(error)}
/>;
```

### How It Works

Settlr checkout handles authentication via Privy:

- **Email login** → Creates embedded Solana wallet automatically
- **Wallet login** → Connects Phantom, Solflare, or Backpack

No wallet-adapter setup needed. Just redirect to checkout.

### React Hook

```tsx
import { SettlrProvider, useSettlr } from "@settlr/sdk";

function App() {
  return (
    <SettlrProvider
      config={{
        apiKey: "sk_live_xxxxxxxxxxxx",
        merchant: {
          name: "My Game",
          // walletAddress optional - linked to your API key
        },
      }}
    >
      <YourApp />
    </SettlrProvider>
  );
}

// In your component
function CheckoutButton() {
  const { getCheckoutUrl } = useSettlr();

  const handlePay = () => {
    const url = getCheckoutUrl({ amount: 29.99, memo: "Premium Pack" });
    window.location.href = url;
  };

  return <button onClick={handlePay}>Pay $29.99</button>;
}
```

### Payment Link Generator Hook

Generate shareable payment links programmatically:

```tsx
import { useSettlr } from "@settlr/sdk";

function InvoicePage() {
  const { getCheckoutUrl } = useSettlr();

  const link = getCheckoutUrl({
    amount: 500,
    memo: "Invoice #1234",
    orderId: "inv_1234",
  });
  // → https://settlr.app/checkout?amount=500&merchant=My+Game&...
}
```

## React Components

### `<BuyButton>`

Drop-in payment button component.

```tsx
<BuyButton
  amount={49.99} // Required: amount in USDC
  memo="Order description" // Optional
  orderId="order_123" // Optional: your order ID
  onSuccess={(result) => {}} // Called on successful payment
  onError={(error) => {}} // Called on payment failure
  onProcessing={() => {}} // Called when payment starts
  useRedirect={false} // Use redirect flow instead of direct payment
  successUrl="https://..." // Redirect URL (if useRedirect=true)
  cancelUrl="https://..." // Cancel URL (if useRedirect=true)
  variant="primary" // "primary" | "secondary" | "outline"
  size="md" // "sm" | "md" | "lg"
  disabled={false}
  className=""
  style={{}}
>
  Buy Now - $49.99
</BuyButton>
```

### `<CheckoutWidget>`

Full checkout UI component with product info.

```tsx
<CheckoutWidget
  amount={149.99} // Required
  productName="Annual Subscription" // Required
  productDescription="Description" // Optional
  productImage="/image.png" // Optional
  merchantName="My Store" // Optional (uses config)
  memo="Transaction memo" // Optional
  orderId="order_123" // Optional
  onSuccess={(result) => {}} // Called on success
  onError={(error) => {}} // Called on error
  onCancel={() => {}} // Called on cancel
  theme="dark" // "dark" | "light"
  showBranding={true} // Show "Powered by Settlr"
  className=""
  style={{}}
/>
```

## API Keys

### Types of Keys

| Key Type | Prefix     | Use Case                            |
| -------- | ---------- | ----------------------------------- |
| Live     | `sk_live_` | Production payments                 |
| Test     | `sk_test_` | Development/testing (no validation) |

### Rate Limits

| Tier       | Requests/min | Platform Fee |
| ---------- | ------------ | ------------ |
| Free       | 60           | 2%           |
| Pro        | 300          | 1.5%         |
| Enterprise | 1000         | 1%           |

### Get Your API Key

1. Go to [settlr.app/dashboard](https://settlr.app/dashboard)
2. Connect your wallet
3. Click "Create API Key"
4. Save the key securely (only shown once!)

## API Reference

### `Settlr`

Main client class.

#### Constructor Options

```typescript
interface SettlrConfig {
  apiKey: string; // Required: your API key from dashboard
  merchant: {
    name: string;
    walletAddress?: string; // Optional: auto-fetched from API key
    logoUrl?: string;
    webhookUrl?: string;
  };
  network?: "devnet" | "mainnet-beta"; // default: 'devnet'
  rpcEndpoint?: string;
  testMode?: boolean;
}
```

> **Tip:** When you register at [settlr.dev/onboarding](https://settlr.dev/onboarding), your wallet address is linked to your API key. You don't need to specify it in the config!

#### Methods

##### `createPayment(options)`

Create a payment link.

```typescript
const payment = await settlr.createPayment({
  amount: 29.99,           // Required: amount in USDC
  memo: 'Order #123',      // Optional: description
  orderId: 'order_123',    // Optional: your order ID
  successUrl: 'https://...',  // Optional: redirect after success
  cancelUrl: 'https://...',   // Optional: redirect on cancel
  expiresIn: 3600,         // Optional: expiry in seconds (default: 1 hour)
});

// Returns
{
  id: 'pay_abc123',
  amount: 29.99,
  status: 'pending',
  checkoutUrl: 'https://settlr.app/checkout?...',
  qrCode: 'data:image/svg+xml,...',
  createdAt: Date,
  expiresAt: Date,
}
```

##### `buildTransaction(options)`

Build a transaction for signing.

```typescript
const tx = await settlr.buildTransaction({
  payerPublicKey: wallet.publicKey,
  amount: 29.99,
  memo: "Order #123",
});

// Sign and send
const signature = await wallet.sendTransaction(tx, connection);
```

##### `pay(options)`

Execute a direct payment.

```typescript
const result = await settlr.pay({
  wallet: {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
  },
  amount: 29.99,
  memo: 'Order #123',
});

// Returns
{
  success: true,
  signature: '5KtP...',
  amount: 29.99,
  merchantAddress: '...',
}
```

##### `getPaymentStatus(signature)`

Check payment status.

```typescript
const status = await settlr.getPaymentStatus("5KtP...");
// Returns: 'pending' | 'completed' | 'failed'
```

##### `createCheckoutSession(options)` ⭐ NEW

Create a hosted checkout session (like Stripe Checkout).

```typescript
const session = await settlr.createCheckoutSession({
  amount: 29.99,
  description: 'Premium Plan',
  successUrl: 'https://mystore.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: 'https://mystore.com/cancel',
  webhookUrl: 'https://mystore.com/api/webhooks/settlr', // Optional
  metadata: { orderId: 'order_123' }, // Optional
});

// Redirect to hosted checkout
window.location.href = session.url;

// Returns
{
  id: 'cs_abc123...',
  url: 'https://settlr.app/checkout/cs_abc123...',
  expiresAt: 1702659600000, // 30 min expiry
}
```

## Webhooks ⭐ UPDATED

Get notified when payments complete to fulfill orders automatically.

### Quick Setup (Next.js)

```typescript
// app/api/webhooks/settlr/route.ts
import { createWebhookHandler } from "@settlr/sdk";

export const POST = createWebhookHandler({
  secret: process.env.SETTLR_WEBHOOK_SECRET!,
  handlers: {
    "payment.completed": async (event) => {
      console.log("Payment completed!", event.payment.id);
      await fulfillOrder(event.payment.orderId);
      await sendConfirmationEmail(event.payment);
    },
    "payment.failed": async (event) => {
      await notifyCustomer(event.payment.orderId);
    },
  },
});
```

### Express.js

```typescript
import express from "express";
import { createWebhookHandler } from "@settlr/sdk";

const app = express();

app.post(
  "/webhooks/settlr",
  express.raw({ type: "application/json" }),
  createWebhookHandler({
    secret: process.env.SETTLR_WEBHOOK_SECRET!,
    handlers: {
      "payment.completed": async (event) => {
        await fulfillOrder(event.payment.orderId);
      },
    },
  })
);
```

### Manual Verification

```typescript
import { verifyWebhookSignature, parseWebhookPayload } from "@settlr/sdk";

export async function POST(request: Request) {
  const signature = request.headers.get("x-settlr-signature")!;
  const body = await request.text();

  // Verify signature
  if (!verifyWebhookSignature(body, signature, process.env.WEBHOOK_SECRET!)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.type === "payment.completed") {
    await fulfillOrder(event.payment.orderId);
  }

  return new Response("OK", { status: 200 });
}
```

### Webhook Events

| Event                    | Description                |
| ------------------------ | -------------------------- |
| `payment.created`        | Payment link was created   |
| `payment.completed`      | Payment confirmed on-chain |
| `payment.failed`         | Payment failed             |
| `payment.expired`        | Payment link expired       |
| `payment.refunded`       | Payment was refunded       |
| `subscription.created`   | Subscription was created   |
| `subscription.renewed`   | Subscription was renewed   |
| `subscription.cancelled` | Subscription was cancelled |
| `subscription.expired`   | Subscription expired       |

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "payment.completed",
  "payment": {
    "id": "pay_xyz789",
    "amount": 29.99,
    "status": "completed",
    "orderId": "order_123",
    "memo": "Premium subscription",
    "txSignature": "5KtP...",
    "payerAddress": "7xKX...3mPq",
    "merchantAddress": "4dGo...7Ywd"
  },
  "timestamp": "2025-12-17T10:30:00.000Z",
  "signature": "hmac_sha256_signature"
}
```

##### `getMerchantBalance()`

Get merchant's USDC balance.

```typescript
const balance = await settlr.getMerchantBalance();
console.log(`Balance: $${balance} USDC`);
```

### Utilities

```typescript
import { formatUSDC, parseUSDC, shortenAddress } from "@settlr/sdk";

formatUSDC(29990000n); // "29.99"
parseUSDC(29.99); // 29990000n
shortenAddress("ABC...XYZ"); // "ABC...XYZ"
```

## Networks

| Network | USDC Mint                                      | USDT Mint                                      |
| ------- | ---------------------------------------------- | ---------------------------------------------- |
| Devnet  | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | `EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS` |
| Mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |

## Supported Tokens

```typescript
import { SUPPORTED_TOKENS, getTokenMint, getTokenDecimals } from "@settlr/sdk";

// Get token info
const usdcMint = getTokenMint("USDC", "mainnet-beta");
const usdtMint = getTokenMint("USDT", "mainnet-beta");
const decimals = getTokenDecimals("USDC"); // 6
```

## License

MIT
