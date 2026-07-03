"use client";

import { Shield, Banknote, Lock, Zap } from "lucide-react";
import {
  IndustryTemplate,
  type IndustryConfig,
} from "@/components/industry/IndustryTemplate";

const config: IndustryConfig = {
  slug: "firearms",
  eyebrow: "Firearms, Ammunition & 2A",
  title: "A payment rail that won't deboard you for being lawful.",
  subhead:
    "FFLs, ammunition manufacturers, optics, suppressors, and 2A retail keep getting cut off by Stripe, PayPal, and Square, for selling fully legal products. Offbank settles in USDC, peer-to-peer, at 1%. No reputational risk reviews. No surprise reserves.",
  heroStats: [
    { value: "1%", label: "Flat fee, vs 4-8% high-risk" },
    { value: "0", label: "Account freezes possible" },
    { value: "<5s", label: "Settlement finality" },
  ],
  problems: [
    {
      title: "Mainstream processors deboard 2A",
      desc: "PayPal, Stripe, Square, and Shopify Payments all explicitly prohibit firearms, ammunition, and even adjacent gear. One audit and you're frozen.",
    },
    {
      title: "Banks pull operating accounts",
      desc: "Operation Choke Point lives on. Even with full ATF compliance, your bank can drop you with 30 days notice, and good luck reapplying.",
    },
    {
      title: "High-risk processors gouge",
      desc: "The few processors that accept firearms charge 4-8% plus reserve withholding. Margin disappears.",
    },
    {
      title: "B2B wholesale is paper cheques",
      desc: "Distributors pay manufacturers on net-60. Manufacturers float inventory and payroll until cheques arrive. Settlement should be instant.",
    },
  ],
  solutions: [
    {
      title: "Non-custodial settlement",
      desc: "Offbank doesn't hold your money. There's no account for a processor to close. Peer-to-peer USDC on Solana, period.",
      icon: Shield,
    },
    {
      title: "1% flat, no reserve, no rolling hold",
      desc: "One percent on every settlement. No PCI fees, no monthly, no chargeback reserve, chargebacks don't exist on USDC rails.",
      icon: Banknote,
    },
    {
      title: "FFL-aware compliance",
      desc: "KYB checks confirm business legitimacy. We don't do viewpoint reviews, only legal/regulatory ones. Lawful commerce settles.",
      icon: Lock,
    },
    {
      title: "Cash out to USD on your schedule",
      desc: "Sphere off-ramp pushes USDC to your bank via ACH or wire. 1-2 business days. You control timing.",
      icon: Zap,
    },
  ],
  useCases: [
    "FFL retailers settling B2B wholesale orders with manufacturers",
    "Ammunition manufacturers replacing distributor cheques",
    "Optics, accessories, and apparel brands deboarded by Stripe / PayPal",
    "Suppressor and Class-3 dealers needing reliable payment rails",
    "Range and training operators taking corporate / municipal bookings",
    "International parts and components suppliers paid in USDC",
  ],
  complianceBullets: [
    "KYB verification, confirm FFL status and business legitimacy",
    "OFAC and PEP screening on every counterparty",
    "BSA/AML monitoring with thresholds and SAR-ready audit logs",
    "On-chain receipts, immutable record of every settlement",
    "ITAR-aware: cross-border transfers flagged for review",
    "Non-custodial, no money transmission, no custody risk",
  ],
  faqs: [
    {
      q: "Are firearms payments on Offbank legal?",
      a: "Yes, for fully legal commerce between licensed parties. Offbank settles peer-to-peer in USDC; we don't custody funds or transmit money. KYB verifies counterparties (including FFL status where relevant) and screens for sanctions before settlement.",
    },
    {
      q: "Do you support consumer-facing FFL transfers?",
      a: "Offbank is built for B2B settlement (wholesale, distributor, and manufacturer flows). For consumer DTC, you can issue payment links to verified buyers, but most operators use it for B2B where margins matter most.",
    },
    {
      q: "What if a processor 'reviews' me later?",
      a: "There's nothing to review. Offbank doesn't hold your funds, they settle directly to your wallet. There's no account to close, no reserve to seize, no rolling hold. That's the whole point of non-custodial settlement.",
    },
    {
      q: "How does cash-out to USD work?",
      a: "Sphere off-ramp converts USDC → USD and pushes via ACH (1-2 days), wire (same day), or SEPA (EU). You initiate when ready. No mandatory holds.",
    },
  ],
};

export default function FirearmsClient() {
  return <IndustryTemplate config={config} />;
}
