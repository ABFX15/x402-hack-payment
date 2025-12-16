# Settlr

**Instant settlement for crypto payments**

Settlr is a Stripe-like payment platform built on Solana, enabling merchants to accept USDC payments with zero gas fees for customers. The platform features gasless transactions via Octane, instant settlement, and seamless fiat offramps through Sphere.

## Features

### For Merchants

- **Payment Links**: Generate QR codes and payment links in seconds
- **Instant Settlement**: Payments confirm in under a second on Solana
- **Low Fees**: Platform fee of 1% with minimum payment threshold
- **Non-Custodial**: Funds go directly to merchant wallets
- **Transaction History**: Track all payments and refunds
- **Easy Refunds**: One-click refund processing

### For Customers

- **Zero Gas Fees**: Pay with USDC without needing SOL for gas (powered by Octane)
- **Quick Checkout**: Scan QR code or click payment link
- **Solana Pay Compatible**: Works with any Solana Pay enabled wallet
- **Fiat Offramp**: Convert USDC to fiat via Sphere integration

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

- **Octane**: Gasless transaction relay for zero SOL gas fees
- **Sphere**: Compliant fiat offramp infrastructure

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
│   ├── frontend/
│   │   └── src/
│   │       ├── app/                # Next.js pages
│   │       ├── components/         # React components
│   │       ├── lib/                # Utilities (Octane SDK)
│   │       └── providers/          # Wallet provider
│   └── src/
│       └── sdk/                    # Original Octane SDK
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

5. **Initialize platform config**

```bash
# Update the platform config PDA with your settings
node migrations/deploy.ts
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

# Sphere Application ID (for offramp)
NEXT_PUBLIC_SPHERE_APP_ID=your_sphere_app_id

# Optional: Custom Octane endpoint
NEXT_PUBLIC_OCTANE_ENDPOINT=https://octane-devnet.breakroom.show/api
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

## Roadmap

- [ ] Multi-currency support (USDT, SOL)
- [ ] Subscription payments
- [ ] Merchant analytics dashboard
- [ ] Mobile app
- [ ] Mainnet deployment

## Security Considerations

- All funds flow directly to merchant wallets (non-custodial)
- Platform treasury only receives small platform fees
- Refunds can only be initiated by the merchant who received the payment
- Amount checks prevent overflow/underflow
- PDA-based authentication for merchants

## License

ISC

## Contact

Built by [@ABFX15](https://github.com/ABFX15)

## Acknowledgments

- Solana Foundation
- Octane for gasless transactions
- Sphere for fiat offramp infrastructure
- Anchor framework team
