"use client";

import { Zap, Shield, Banknote, Globe } from "lucide-react";
import {
  IndustryTemplate,
  type IndustryConfig,
} from "@/components/industry/IndustryTemplate";

const config: IndustryConfig = {
  slug: "cbd-hemp",
  eyebrow: "CBD, Hemp & Botanical",
  title: "Payments that don't get frozen mid-launch.",
  subhead:
    "CBD, hemp-derived cannabinoids, kratom, kava, and adjacent botanicals are technically legal, but processors keep treating you like you aren't. Settle in USDC instead. 1% flat. Cash out to USD on your schedule.",
  heroStats: [
    { value: "1%", label: "Flat fee, vs 4-9% high-risk" },
    { value: "<5s", label: "Settlement finality" },
    { value: "0", label: "Custody / freeze risk" },
  ],
  problems: [
    {
      title: "Stripe and Square shut you down",
      desc: "One TRO from compliance, one back-end policy update, and your processor disappears. Funds held 90+ days while you scramble for a backup.",
    },
    {
      title: "High-risk processors charge 4-9%",
      desc: "Even if you find one that'll keep you, the fee stack, discount rate, monthly, chargeback reserve, eats most of your margin.",
    },
    {
      title: "Banks deboard with no notice",
      desc: "30 days to find new banking. Try opening a new business account when 'CBD' is in your filings.",
    },
    {
      title: "B2B wholesale is still cheques and ACH",
      desc: "Distributor pays you 60+ days late. You float inventory while their AR team 'looks into it'.",
    },
  ],
  solutions: [
    {
      title: "1% flat, every transaction",
      desc: "No tiered pricing. No reserves. No monthly. One percent, on the invoice, on the wholesale order, on the affiliate payout.",
      icon: Banknote,
    },
    {
      title: "Non-custodial, no one can freeze you",
      desc: "Funds settle peer-to-peer in USDC on Solana. Offbank never holds them. There is no account to close.",
      icon: Shield,
    },
    {
      title: "Cash out to USD via Sphere",
      desc: "ACH, wire, or SEPA on demand. Move USDC → USD into your operating bank in 1-2 business days.",
      icon: Globe,
    },
    {
      title: "Built for compliance scrutiny",
      desc: "KYB, OFAC screening, BSA/AML monitoring, and on-chain receipts. Auditable trail for every settlement.",
      icon: Zap,
    },
  ],
  useCases: [
    "DTC CBD brands paying out affiliate and influencer commissions",
    "Hemp-derived THC (Δ8/Δ9/HHC) wholesalers settling distributor invoices",
    "Kratom and kava brands cut off by Stripe / Shopify Payments",
    "Smoke-shop and head-shop B2B suppliers replacing cheques",
    "Botanical and nootropic brands serving subscribers post-deboarding",
    "Cross-border hemp suppliers paid in USDC instead of wire",
  ],
  complianceBullets: [
    "KYB verification on every business, operator + counterparty",
    "OFAC and PEP screening before any settlement leaves",
    "BSA/AML transaction monitoring with thresholds and alerts",
    "On-chain audit trail, every settlement timestamped and signed",
    "GENIUS Act 2025 stablecoin framework alignment",
    "Non-custodial, Offbank holds no merchant funds at any point",
  ],
  faqs: [
    {
      q: "Is CBD/hemp settlement on Offbank legal?",
      a: "Yes. Hemp-derived CBD and cannabinoids under 0.3% Δ9-THC are federally legal under the 2018 Farm Bill. Offbank doesn't custody funds or transmit money, settlement is peer-to-peer in USDC on Solana. We KYB every business, screen counterparties, and monitor for BSA/AML compliance.",
    },
    {
      q: "Do my customers need a wallet?",
      a: "No. Counterparties claim invoices via email link, verify, and receive USDC. They can cash out to USD via Sphere whenever they want. The crypto layer is invisible to the buyer.",
    },
    {
      q: "What about Δ8 / Δ9 / HHC and other hemp-derived cannabinoids?",
      a: "Same answer: federally legal under the Farm Bill, but processors hate it. That's exactly the friction Offbank is built to remove. We onboard hemp-derived cannabinoid brands every week.",
    },
    {
      q: "How fast can I cash out USDC to USD?",
      a: "Sphere off-ramp via ACH typically 1-2 business days. Wire same-day for higher amounts. SEPA for EU. You control when, there's no hold, no reserve.",
    },
  ],
};

export default function CbdHempClient() {
  return <IndustryTemplate config={config} />;
}
