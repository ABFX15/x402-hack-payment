# @settlr/sdk

> Solana USDC payments in 7 lines of code

## Installation

```bash
npm install @settlr/sdk
# or
yarn add @settlr/sdk
# or
pnpm add @settlr/sdk
```

## Quick Start

### Create a Payment Link (7 lines)

```typescript
import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  merchant: {
    name: "My Store",
    walletAddress: "YOUR_SOLANA_WALLET_ADDRESS",
  },
});

const payment = await settlr.createPayment({
  amount: 29.99,
  memo: "Premium subscription",
});

// Redirect customer to checkout
window.location.href = payment.checkoutUrl;
```

### Direct Payment (with wallet adapter)

```typescript
import { Settlr } from "@settlr/sdk";
import { useWallet } from "@solana/wallet-adapter-react";

const settlr = new Settlr({
  merchant: {
    name: "My Store",
    walletAddress: "YOUR_WALLET",
  },
});

// In your component
const wallet = useWallet();

const result = await settlr.pay({
  wallet: {
    publicKey: wallet.publicKey!,
    signTransaction: wallet.signTransaction!,
  },
  amount: 29.99,
  memo: "Order #1234",
});

if (result.success) {
  console.log("Payment successful!", result.signature);
}
```

### React Hook

```tsx
import { SettlrProvider, useSettlr } from "@settlr/sdk";

// Wrap your app
function App() {
  return (
    <WalletProvider wallets={wallets}>
      <ConnectionProvider endpoint={endpoint}>
        <SettlrProvider
          config={{
            merchant: {
              name: "My Store",
              walletAddress: "YOUR_WALLET",
            },
          }}
        >
          <YourApp />
        </SettlrProvider>
      </ConnectionProvider>
    </WalletProvider>
  );
}

// In your component
function CheckoutButton() {
  const { pay, connected } = useSettlr();

  return (
    <button onClick={() => pay({ amount: 29.99 })} disabled={!connected}>
      Pay $29.99
    </button>
  );
}
```

## API Reference

### `Settlr`

Main client class.

#### Constructor Options

```typescript
interface SettlrConfig {
  merchant: {
    name: string;
    walletAddress: string;
    logoUrl?: string;
    webhookUrl?: string;
  };
  network?: "devnet" | "mainnet-beta"; // default: 'devnet'
  rpcEndpoint?: string;
  testMode?: boolean;
}
```

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
  checkoutUrl: 'https://settlr.dev/pay?...',
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
  url: 'https://settlr.dev/checkout/cs_abc123...',
  expiresAt: 1702659600000, // 30 min expiry
}
```

## Webhooks

When a payment completes, Settlr sends a POST request to your `webhookUrl`:

```typescript
// Your webhook handler (e.g., /api/webhooks/settlr)
export async function POST(request: Request) {
  const signature = request.headers.get("X-Settlr-Signature");
  const body = await request.json();

  // Verify signature (recommended in production)
  // ...

  if (body.event === "checkout.completed") {
    const { sessionId, amount, customerWallet, paymentSignature, metadata } =
      body.data;

    // Fulfill the order
    await fulfillOrder(metadata.orderId);
  }

  return new Response("OK", { status: 200 });
}
```

### Webhook Payload

```json
{
  "event": "checkout.completed",
  "data": {
    "sessionId": "cs_abc123...",
    "merchantId": "my-store",
    "amount": 29.99,
    "currency": "USDC",
    "customerWallet": "7xKX...3mPq",
    "paymentSignature": "5KtP...",
    "description": "Premium Plan",
    "metadata": { "orderId": "order_123" },
    "completedAt": 1702659600000
  },
  "timestamp": 1702659600000
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

| Network | USDC Mint                                      |
| ------- | ---------------------------------------------- |
| Devnet  | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| Mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |

## License

MIT
