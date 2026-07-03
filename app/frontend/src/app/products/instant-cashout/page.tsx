import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Mail, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Instant Cashout - Pay Players & Winners in Seconds | Offbank",
  description:
    "Pay out winnings in USDC in under a second, by email or wallet, any amount, anywhere. Make instant cashouts your retention weapon. Non-custodial, no chargebacks.",
  alternates: { canonical: "/products/instant-cashout" },
  openGraph: {
    title: "Instant Cashout - Pay Players & Winners in Seconds",
    description:
      "USDC withdrawals in under a second, by email or wallet. The retention weapon for iGaming.",
    url: "https://offbankpay.com/products/instant-cashout",
  },
};

const features = [
  {
    icon: Zap,
    title: "Paid in under a second",
    desc: "One API call sends a player their winnings in USDC. No batch windows, no “pending 3-5 business days.” The thing players judge you on - solved.",
  },
  {
    icon: Mail,
    title: "Even without a wallet",
    desc: "No crypto wallet? The player gets a claim link by email and Offbank provisions one on first claim. The crypto layer is invisible to a first-time winner.",
  },
  {
    icon: ShieldCheck,
    title: "Non-custodial, no chargebacks",
    desc: "Funds never pool in a third-party hot wallet that can be frozen or hacked. On-chain finality means no clawbacks and no friendly fraud.",
  },
  {
    icon: Globe,
    title: "Global, any amount",
    desc: "Pay a $20 winner or a $50k jackpot, in Manila or Lisbon, at the same speed and cost. Cards choke on large or cross-border payouts - USDC doesn’t.",
  },
];

export default function InstantCashoutPage() {
  return (
    <main className="bg-white text-[#101828]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0b0f0c] pt-36 pb-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(52,199,89,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[900px] px-6 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#34c759]/30 bg-[#34c759]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#34c759]">
            Instant Cashout
          </p>
          <h1 className="text-[40px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[56px]">
            Pay winners in seconds. Make it your edge.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.6] text-white/75">
            Players judge a book by how fast it pays. Settle withdrawals in USDC
            in under a second - by email or wallet, any amount, anywhere - and
            turn “instant cashouts” into the feature that wins and keeps players.
            Non-custodial, no chargebacks, no processor to freeze you.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/developers"
              className="inline-flex items-center gap-2 rounded-full bg-[#34c759] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
            >
              See the payout API
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/industries/igaming"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.06]"
            >
              For iGaming
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#eaecf0] bg-[#fafafa] p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34c759]/10">
                  <Icon className="h-5 w-5 text-[#34c759]" />
                </div>
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5c5c5c]">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One API call */}
      <section className="bg-[#f7f7f7] py-20">
        <div className="mx-auto max-w-[820px] px-6">
          <h2 className="text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            One call to pay a winner.
          </h2>
          <div className="mt-8">
            <CodeBlock
              filename="cashout.ts"
              code={`// npm install @offbank/sdk
import { Offbank } from "@offbank/sdk";

const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });

// Player cashes out - settles in USDC, instantly
await offbank.payouts.create({
  email: "player@example.com",
  amount: 250.0,
  memo: "Withdrawal #48210",
});`}
            />
          </div>
          <p className="mt-4 text-center text-[13px] text-[#5c5c5c]">
            The player gets a claim link, picks any wallet (or one we provision),
            and the USDC lands on-chain in seconds. Your webhook fires when it
            settles.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[820px] px-6 text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            Stop losing players at the cashier.
          </h2>
          <p className="mt-3 text-[15px] text-[#5c5c5c]">
            Instant withdrawals, instant affiliate payouts, non-custodial. Built
            for iGaming and high-risk operators banks won&apos;t serve.
          </p>
          <Link
            href="/onboarding"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#34c759] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
