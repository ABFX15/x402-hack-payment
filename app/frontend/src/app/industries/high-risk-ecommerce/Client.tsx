"use client";

import { CreditCard, ShieldCheck, Globe, RefreshCw } from "lucide-react";
import {
  IndustryTemplate,
  type IndustryConfig,
} from "@/components/industry/IndustryTemplate";

const config: IndustryConfig = {
  slug: "high-risk-ecommerce",
  eyebrow: "High-Risk E-Commerce",
  title: "The checkout Stripe won't give you.",
  subhead:
    "Vape hardware, smoke-shop gear, kratom, nutra, adult, replica, 2A accessories — you sell a legal product worldwide, and payment processors still drop you, hold your money, and eat your margin with chargebacks. Offbank is a drop-in USDC checkout you paste into any store: customers pay in stablecoin, it settles to your wallet in under a second, 1% flat, and there's no processor left to freeze you.",
  heroStats: [
    { value: "<1s", label: "Settlement to your wallet" },
    { value: "1%", label: "Flat, vs 5–15% high-risk stacks" },
    { value: "0", label: "Chargebacks — payments are final" },
  ],
  problems: [
    {
      title: "Stripe, PayPal & Shopify Payments ban your category",
      desc: "Vape, smoke accessories, kratom, nutra, CBD-adjacent, adult and 2A gear get flagged as prohibited. Accounts get shut off mid-season with your balance held for 90–180 days.",
    },
    {
      title: "High-risk processors bleed your margin",
      desc: "The processors that will take you charge 5–15%, hold rolling reserves, and add per-transaction penalties. On thin-margin hardware that's the difference between profit and loss.",
    },
    {
      title: "Chargebacks and 'friendly fraud' pile up",
      desc: "Card customers dispute weeks later — 'didn't recognize the charge.' You eat the product, the refund, and a fee, and your dispute ratio gets you deboarded.",
    },
    {
      title: "Cross-border customers don't convert",
      desc: "Your customers are global; card acceptance and FX aren't. International cards decline constantly, and the ones that clear cost you 3–4% in cross-border fees.",
    },
  ],
  solutions: [
    {
      title: "A checkout you paste into any store",
      desc: "One <script> tag adds an Offbank 'Pay with USDC' button to Shopify, WooCommerce, or a custom store — cart total in, wallet or QR out. No plugin approval, no category review, no processor onboarding.",
      icon: CreditCard,
    },
    {
      title: "No chargebacks, ever",
      desc: "On-chain payments are final on confirmation. A paid order can't be clawed back weeks later, so friendly fraud disappears and your dispute ratios stop being a liability.",
      icon: ShieldCheck,
    },
    {
      title: "Sell to anyone, anywhere",
      desc: "USDC clears from a customer in Berlin exactly like one in Denver — same speed, same 1% cost. No declined international cards, no FX spread eating the sale.",
      icon: Globe,
    },
    {
      title: "Cash out to USD on your schedule",
      desc: "Settle to your own wallet and off-ramp to your bank when you're ready — you hold the funds the whole time, not a processor sitting on a 90-day reserve.",
      icon: RefreshCw,
    },
  ],
  useCases: [
    "Vaporizer & dry-herb hardware brands (DTC and wholesale)",
    "Smoke shops, headshops & accessory retailers online",
    "Kratom, kava & botanical stores",
    "Nutraceuticals, peptides & supplements flagged as high-risk",
    "Adult products and content storefronts",
    "Firearms accessories, optics & 2A gear (non-FFL items)",
  ],
  complianceBullets: [
    "Optional buyer KYC for regulated SKUs (Sumsub) — age / ID checks",
    "OFAC / sanctions wallet screening on incoming payments (Range)",
    "Full on-chain receipt for every order — timestamped and signed",
    "Non-custodial: funds settle to your wallet, never pooled with ours",
    "Merchant KYB so your bank and off-ramp partner stay comfortable",
    "Exportable audit trail for chargeback-free reconciliation",
  ],
  faqs: [
    {
      q: "Do my customers need a crypto wallet to check out?",
      a: "No. They can pay from any wallet they already have (Phantom, Solflare, MetaMask, or a mobile wallet via QR). First-timers can be walked into a managed wallet — the crypto layer stays invisible at checkout.",
    },
    {
      q: "How do I add it to my Shopify / WooCommerce store?",
      a: "Drop in one script tag and call OffbankCheckout.open() with the cart total on your 'Pay' button — or use a payment link if you don't want to touch code. It renders an embedded checkout over your store; the order is confirmed on-chain before you fulfill.",
    },
    {
      q: "What stops someone from tampering with the price?",
      a: "For store checkouts you create a server-side checkout session (amount fixed on our server), and we verify the on-chain payment against it before firing your 'order paid' webhook. The buyer can't change what they owe.",
    },
    {
      q: "Is Offbank a payment processor or money transmitter?",
      a: "No. Offbank is non-custodial infrastructure — USDC moves wallet-to-wallet and we never hold it. You keep responsibility for your product's legality in each market; we give you the checkout, screening, and audit trail.",
    },
  ],
};

export default function HighRiskEcommerceClient() {
  return <IndustryTemplate config={config} />;
}
