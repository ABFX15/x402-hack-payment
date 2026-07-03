"use client";

import { Globe, Banknote, Zap, Shield } from "lucide-react";
import {
  IndustryTemplate,
  type IndustryConfig,
} from "@/components/industry/IndustryTemplate";

const config: IndustryConfig = {
  slug: "international-wholesale",
  eyebrow: "International B2B Wholesale",
  title: "Settle cross-border in seconds. Without SWIFT.",
  subhead:
    "International B2B wholesale runs on wire, NET-30/60, and FX spreads that quietly bleed 2-4% per transaction. Offbank settles cross-border in USDC at 1% flat, same workflow whether your counterparty is in Houston, Hamburg, or Hanoi.",
  heroStats: [
    { value: "1%", label: "Flat fee, vs 2-4% wire + FX stack" },
    { value: "<5s", label: "Cross-border finality" },
    { value: "190+", label: "Countries reachable" },
  ],
  problems: [
    {
      title: "SWIFT wires take 2-5 business days",
      desc: "Friday wire? See you Wednesday. Weekend? Forget it. Counterparty timezone holiday? Add another day. Cashflow planning becomes guesswork.",
    },
    {
      title: "Correspondent banks skim every hop",
      desc: "Originating bank → correspondent → intermediary → beneficiary. Each takes a fee. $25-80 in fees per wire, plus FX spread of 1-3%.",
    },
    {
      title: "Letters of credit are slow and expensive",
      desc: "Bank-issued LCs cost 0.75-2% per quarter, take days to amend, and tie up working capital. Trade finance hasn't materially evolved in 50 years.",
    },
    {
      title: "Emerging-market banking is patchy",
      desc: "Some corridors (Africa, parts of LATAM, SEA) lack reliable correspondent banking. Suppliers wait weeks for funds, or accept stablecoin OTC at a haircut.",
    },
  ],
  solutions: [
    {
      title: "USDC settles in seconds, anywhere",
      desc: "USDC on Solana costs fractions of a cent and finalises in <5s. Same-day settlement to any wallet on Earth. Skip the wire stack entirely.",
      icon: Zap,
    },
    {
      title: "1% flat, no FX spread games",
      desc: "USDC is dollar-pegged. No mid-market vs. retail FX spread. Counterparty receives the dollar amount you sent, minus 1%, that's it.",
      icon: Banknote,
    },
    {
      title: "Cash out locally on either side",
      desc: "Sphere off-ramps to USD/EUR (ACH, wire, SEPA). Regional partners cover LATAM, SEA, MENA. Your counterparty cashes out in their own currency on their own schedule.",
      icon: Globe,
    },
    {
      title: "On-chain audit trail = compliant by default",
      desc: "Every settlement timestamped, signed, and immutable. KYB on both sides. OFAC screening pre-settlement. Cleaner audit trail than SWIFT MT103s.",
      icon: Shield,
    },
  ],
  useCases: [
    "US/EU brands paying overseas manufacturers (apparel, electronics, components)",
    "LATAM exporters invoicing North American distributors",
    "African suppliers paid in USDC instead of unreliable correspondent wires",
    "SEA contract manufacturers replacing 60-day LC terms with instant settlement",
    "Cross-border SaaS and services billing, invoice in USDC, no FX surprises",
    "Commodity and raw-material brokers settling deal-by-deal",
  ],
  complianceBullets: [
    "KYB on every counterparty, both sides of the corridor",
    "OFAC, EU, UK, and UN sanctions screening pre-settlement",
    "BSA/AML monitoring with country-risk and amount thresholds",
    "Travel Rule compliant for VASP-to-VASP cross-border flows",
    "On-chain receipts, auditor and customs friendly",
    "Non-custodial, no money transmission license required for settlement",
  ],
  faqs: [
    {
      q: "Is cross-border USDC settlement legal in my counterparty's country?",
      a: "USDC is widely held and traded in 190+ countries. Local on/off-ramp regulation varies, your counterparty handles their own cash-out compliance, just as they would with any inbound payment. Offbank screens for OFAC/sanctioned jurisdictions and respects Travel Rule requirements.",
    },
    {
      q: "What about FX risk?",
      a: "There's no FX risk during settlement, USDC is 1:1 with USD. FX risk only enters when your counterparty cashes out to local currency on their end, at the time of their choosing. They lock in their rate when they want.",
    },
    {
      q: "How does this compare to Wise / Airwallex / Revolut Business?",
      a: "Those are still bank-rail-based, they pool inbound, then ACH or wire out locally. Limits, freezes, and KYC reviews still apply. Offbank is non-custodial: USDC moves directly wallet-to-wallet, no intermediary holds your funds.",
    },
    {
      q: "What happens if my counterparty doesn't have a wallet?",
      a: "They claim via email link, Offbank generates a managed wallet for them on first claim. They can move to self-custody anytime. Cash-out via Sphere or regional partner. The crypto layer is invisible to first-time users.",
    },
  ],
};

export default function InternationalWholesaleClient() {
  return <IndustryTemplate config={config} />;
}
