# Settlr

[![npm version](https://img.shields.io/npm/v/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Accept crypto payments without wallets.**

Customers pay with just their email. You get USDC instantly.  
No wallets. No gas fees. No blockchain complexity.

```bash
npm install @settlr/sdk
```

```tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

<SettlrProvider
  config={{
    apiKey: "sk_test_demo_xxxxxxxxxxxx", // Get yours at settlr.dev/onboarding
    merchant: { name: "My Store" },
  }}
>
  <BuyButton
    amount={25.0}
    memo="Order #123"
    onSuccess={(result) => console.log("Paid!", result.signature)}
  >
    Pay $25.00
  </BuyButton>
</SettlrProvider>;
```

That's it. One component. [Try the live demo →](https://settlr.dev)

---

## Why Settlr?

| Problem                         | Settlr Solution                      |
| ------------------------------- | ------------------------------------ |
| Wallet adapter setup is painful | Drop-in React components             |
| Users need SOL for gas          | Gasless via Kora (Solana Foundation) |
| Complex transaction building    | One function call                    |
| Users need a wallet             | Embedded wallets via Privy           |
| USDC is on multiple chains      | Cross-chain payments via Mayan       |

---

## Features

### For Merchants

- **Payment Links**: Generate QR codes and payment links in seconds
- **Instant Settlement**: Payments confirm in under a second on Solana
- **Low Fees**: 1-2% platform fee (tiered by volume)
- **Non-Custodial**: Funds go directly to merchant wallets
- **Hosted Checkout**: Stripe-like checkout pages
- **Webhooks**: Real-time payment notifications
- **Receipts**: PDF receipt generation
- **Transaction History**: Track all payments and refunds
- **Easy Refunds**: One-click refund processing

### For Customers

- **Zero Gas Fees**: Pay with USDC without needing SOL for gas (powered by Kora)
- **Pay from Any Chain**: USDC on Ethereum, Base, Arbitrum, Polygon, or Optimism (powered by Mayan)
- **Embedded Wallets**: Sign up with email/social, no crypto experience needed (Privy)
- **Quick Checkout**: Scan QR code or click payment link
- **Buy USDC**: Built-in fiat on-ramp to purchase USDC with card

### Multichain Support

Accept USDC from any major chain - funds are automatically bridged to your Solana wallet:

```
Customer pays USDC on Ethereum/Base/Arbitrum/Polygon/Optimism
                    ↓
              Mayan Protocol
                    ↓
        Merchant receives USDC on Solana
```

| Chain    | Bridge Time | Customer Gas   |
| -------- | ----------- | -------------- |
| Solana   | Instant     | Free (gasless) |
| Base     | ~1-2 min    | ~$0.01         |
| Arbitrum | ~1-2 min    | ~$0.01         |
| Optimism | ~1-2 min    | ~$0.01         |
| Polygon  | ~1-2 min    | ~$0.01         |
| Ethereum | ~1-3 min    | ~$1-5          |

## Tech Stack

### Blockchain

- **Solana**: High-speed, low-cost blockchain infrastructure
- **Anchor**: Solana program framework (v0.31.1)
- **SPL Token**: USDC token handling on Solana

### Frontend

- **Next.js 16**: React framework with App Router
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Solana Wallet Adapter**: Multi-wallet support

### Integrations

- **Kora**: Solana Foundation gasless transaction relay for zero SOL gas fees
- **Mayan**: Cross-chain swaps for EVM → Solana USDC payments
- **Privy**: Embedded wallets with email/social login and fiat on-ramp
- **Squads**: Multisig protection for platform treasury

## Project Structure

```
x402-hack-payment/
├── programs/
│   └── x402-hack-payment/
│       └── src/
│           ├── lib.rs              # Anchor program entry
│           ├── state/              # Program state (platform config, merchants)
│           ├── instructions/       # Payment, refund, merchant registration
│           └── errors.rs           # Custom error types
├── app/
│   └── frontend/
│       └── src/
│           ├── app/                # Next.js pages
│           ├── components/         # React components
│           ├── lib/                # Utilities
│           └── providers/          # Wallet provider
├── tests/                          # Anchor program tests
└── migrations/                     # Deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Rust and Solana CLI
- Anchor CLI
- Phantom or Solflare wallet

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ABFX15/x402-hack-payment.git
cd x402-hack-payment
```

2. **Install dependencies**

```bash
# Install Anchor dependencies
npm install

# Install frontend dependencies
cd app/frontend
npm install
```

3. **Build the Anchor program**

```bash
anchor build
```

4. **Deploy to devnet**

```bash
# Update Anchor.toml with your wallet path
anchor deploy --provider.cluster devnet
```

5. **Initialize platform config with Squads**

```bash
# Initialize platform and transfer authority to Squads multisig
npx ts-node scripts/init-with-squads.ts
```

6. **Start the frontend**

```bash
cd app/frontend
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Program Accounts

### Platform Config

- **Fee Percentage**: 2% (200 basis points)
- **Min Payment**: 10,000 USDC (0.01 USDC)
- **Treasury**: Collects platform fees
- **PDA Seed**: `["platform_config"]`

### Merchant Account

- **Owner**: Merchant wallet public key
- **Total Received**: Cumulative payment amount
- **Total Refunded**: Cumulative refund amount
- **Is Active**: Merchant status
- **PDA Seed**: `["merchant", merchant_pubkey]`

## Environment Variables

Create `.env.local` in `app/frontend/`:

```env
# Solana Network
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Program ID (from Anchor deployment)
NEXT_PUBLIC_PROGRAM_ID=your_program_id

# Kora Gasless RPC (Solana Foundation)
NEXT_PUBLIC_KORA_RPC_URL=http://localhost:8080

# Privy App ID (for embedded wallets)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## Key Contracts

### Payment Flow

```
1. Customer scans QR code or opens payment link
2. Customer connects wallet (Phantom, Solflare, etc.)
3. Payment transaction is built with/without gas fee (Octane toggle)
4. Transaction signed by customer
5. If gasless: Submitted to Octane relay
6. If standard: Sent directly to Solana
7. USDC transferred to merchant wallet
8. Platform fee sent to treasury
9. Merchant account updated
```

### Instruction: Process Payment

```rust
pub fn process_payment(
    ctx: Context<ProcessPayment>,
    amount: u64,
) -> Result<()>
```

**Accounts:**

- Platform config (PDA)
- Merchant account (PDA)
- Platform treasury (PDA)
- Payer, merchant, USDC mint, ATAs

### Instruction: Process Refund

```rust
pub fn process_refund(
    ctx: Context<ProcessRefund>,
    amount: u64,
) -> Result<()>
```

**Accounts:**

- Merchant account (PDA)
- Merchant wallet, customer wallet
- USDC mint, ATAs

## Deployment

### Vercel (Frontend)

Deploy from the `app/frontend` directory:

```bash
cd app/frontend
npx vercel --prod
```

Or connect your GitHub repo to Vercel with:

- **Root Directory**: `app/frontend`
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Solana Program

The program is deployed to Solana devnet at:

```
Program ID: 339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5
```

**Platform Config PDA:**

```
Ez8bpDapwsas7iiczFaUw5rmW8StEgHyoEL8A3V7HBoH
```

**Platform Treasury PDA:**

```
7tNF5gDmk6BKigofbyVi5WL7DbhnKmTA71MeuCMDx4k3
```

## Testing

Run Anchor program tests:

```bash
anchor test
```

Run frontend locally:

```bash
cd app/frontend
npm run dev
```

## SDK

### Quick Start

```bash
npm install @settlr/sdk
```

**Option 1: React Component (easiest)**

```tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

function App() {
  return (
    <SettlrProvider
      config={{
        merchant: { name: "My Store", walletAddress: "your-wallet-address" },
      }}
    >
      <BuyButton
        amount={25.0}
        memo="Order #123"
        onSuccess={(result) => {
          console.log("Payment successful!", result.signature);
        }}
      >
        Pay $25.00
      </BuyButton>
    </SettlrProvider>
  );
}
```

**Option 2: Client SDK (more control)**

```typescript
import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  merchant: {
    name: "My Store",
    walletAddress: "your-wallet-address",
  },
  network: "mainnet-beta", // or 'devnet'
});

// Create a payment
const payment = await settlr.createPayment({
  amount: 50.0,
  memo: "Order #123",
});

// Redirect to checkout
window.location.href = payment.checkoutUrl;
```

**Option 3: Webhooks**

```typescript
import { verifyWebhookSignature } from "@settlr/sdk";

// In your API route
const isValid = verifyWebhookSignature(body, signature, webhookSecret);
if (isValid) {
  // Process payment.completed, payment.failed, etc.
}
```

See [SDK Documentation](./packages/sdk/README.md) for full API reference.

## Admin Dashboard

Access the platform admin dashboard at `/admin` to:

- View treasury balance (accumulated platform fees)
- See on-chain details (PDAs, program ID)
- Link to Squads multisig for fee claims

### Claiming Platform Fees

1. Go to [Squads Dashboard](https://devnet.squads.so)
2. Connect as a multisig member
3. Create a new transaction calling `claim_platform_fees`
4. Get required signatures from other members
5. Execute the transaction

## Roadmap

- [x] Drop-in React components
- [x] Gasless transactions (Kora)
- [x] Embedded wallets (Privy)
- [x] USDC support
- [x] USDT support
- [x] Webhooks
- [x] Subscription types
- [x] Hosted checkout pages
- [x] Merchant dashboard
- [x] Receipts & analytics
- [ ] EVM chains (Ethereum, Base, Arbitrum)
- [ ] Fiat on/off-ramps
- [ ] Mobile SDK
- [ ] Mainnet deployment

## Security Considerations

- All funds flow directly to merchant wallets (non-custodial)
- Platform treasury only receives small platform fees (2%)
- **Squads Multisig**: Platform authority is protected by Squads multisig - fee claims require multiple signatures
- Refunds can only be initiated by the merchant who received the payment
- Amount checks prevent overflow/underflow
- PDA-based authentication for merchants

### Platform Authority

The platform is protected by a Squads multisig at:

```
Vault: DthkuDsPKR6MqqV28rVSBEqdgnuNtEU6QpLACZ7bCBpD
```

To claim platform fees, multisig members must create and approve a transaction via [Squads](https://devnet.squads.so).

## License

ISC

## Get in Touch

- Twitter: [@your_handle](https://twitter.com/SettlrP)
- GitHub: [@ABFX15](https://github.com/ABFX15)
- npm: [@settlr/sdk](https://www.npmjs.com/package/@settlr/sdk)

**Found this useful? Give it a ⭐ on GitHub!**

## Acknowledgments

- Solana Foundation
- Kora (Solana Foundation) for gasless transactions
- Privy for embedded wallets and authentication
- Anchor framework team
