"use client";

import { Zap, Banknote, ShieldCheck, Globe } from "lucide-react";
import {
  IndustryTemplate,
  type IndustryConfig,
} from "@/components/industry/IndustryTemplate";

const config: IndustryConfig = {
  slug: "igaming",
  eyebrow: "iGaming & Online Gaming",
  title: "Instant USDC payouts. No processor to freeze you.",
  subhead:
    "iGaming is permanently high-risk: card processors decline, hold rolling reserves, and freeze accounts without warning - and players churn the moment a withdrawal takes days. Offbank takes crypto deposits at checkout and pays winnings out in USDC in under a second, 1% flat, to players anywhere. No bank that can cut you off.",
  heroStats: [
    { value: "<1s", label: "Player withdrawal finality" },
    { value: "1%", label: "Flat fee, vs high-risk card stacks" },
    { value: "190+", label: "Countries you can pay into" },
  ],
  problems: [
    {
      title: "Processors treat you as high-risk - and act like it",
      desc: "5-15% rolling reserves, punishing MDR, sudden account freezes, and MID churn. Your payments stack is a liability you don't control.",
    },
    {
      title: "Slow withdrawals kill retention",
      desc: "Players judge a book by how fast it pays. Card and bank withdrawals take 1-5 days and fail often. Every delayed cashout is a player testing a competitor.",
    },
    {
      title: "Chargebacks and friendly fraud bleed you",
      desc: "Card deposits invite disputes weeks later - 'I didn't authorize this.' You eat the loss plus a chargeback fee, and your ratios get you flagged.",
    },
    {
      title: "Cross-border players are a banking nightmare",
      desc: "Your players are global; your bank rails aren't. Paying a winner in another country means wires, FX spreads, and corridors that simply don't work.",
    },
  ],
  solutions: [
    {
      title: "Instant withdrawals in one API call",
      desc: "Pay a player their winnings in USDC by email or wallet - settles in under a second. Batch thousands at once. Fast payouts become your competitive edge, not your bottleneck.",
      icon: Zap,
    },
    {
      title: "Crypto deposits at checkout",
      desc: "Drop in the Offbank checkout - players fund their balance in USDC from any wallet. No card processor, no decline, no reserve held against you.",
      icon: Banknote,
    },
    {
      title: "No chargebacks, ever",
      desc: "On-chain payments are final. A confirmed deposit can't be clawed back weeks later. Friendly fraud disappears and your dispute ratios stop being a problem.",
      icon: ShieldCheck,
    },
    {
      title: "Global by default",
      desc: "USDC reaches a wallet anywhere on Earth at the same cost and speed. Pay a winner in Manila or Lisbon exactly like one down the street.",
      icon: Globe,
    },
  ],
  useCases: [
    "Online casinos settling player deposits and instant cashouts",
    "Sportsbooks paying winning bets the moment they settle",
    "Poker and skill-gaming platforms with global player pools",
    "Daily fantasy / DFS prize payouts at scale (batch by email)",
    "Esports betting and tournament prize disbursement",
    "Sweepstakes and social-casino redemptions",
  ],
  complianceBullets: [
    "Player KYC at first deposit (Sumsub) - ID + age verification",
    "AML and OFAC/sanctions wallet screening pre-payout (Range)",
    "Per-player and per-jurisdiction limits and thresholds",
    "Full on-chain audit trail - every deposit and payout timestamped and signed",
    "Non-custodial: funds never pool in an account a regulator can seize",
    "Compliance dossier export for your banking and licensing reviews",
  ],
  faqs: [
    {
      q: "How fast can a player actually withdraw?",
      a: "Under a second of on-chain finality once you approve the payout. One API call sends USDC to the player's wallet, or emails them a claim link if they don't have one yet. No batch windows, no 'pending 3-5 business days.'",
    },
    {
      q: "What if a player doesn't have a crypto wallet?",
      a: "They claim winnings via an email link, and Offbank provisions a managed wallet on first claim. They can move to self-custody whenever they want. The crypto layer is invisible to a first-time player.",
    },
    {
      q: "Does this remove chargeback risk?",
      a: "Yes. USDC deposits are final on confirmation - there's no card network to initiate a clawback weeks later. That eliminates friendly fraud and the dispute ratios that get high-risk merchants frozen.",
    },
    {
      q: "Is Offbank a gambling license or a money transmitter?",
      a: "No. Offbank is non-custodial payment infrastructure - funds move wallet-to-wallet, we never hold them. You remain responsible for your gaming licenses and jurisdictional rules; we give you the rails, KYC/AML screening, and the audit trail to satisfy your bank and regulator.",
    },
  ],
  relatedReading: [
    {
      href: "/blog/stablecoin-payments-igaming-affiliates-invoicing",
      label: "Stablecoin Payments in iGaming: Affiliates & Invoicing",
    },
  ],
};

export default function IGamingClient() {
  return <IndustryTemplate config={config} />;
}
