import type { Metadata } from "next";
import Link from "next/link";
import { QrCode, Zap, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "POS Terminal - Take USDC Payments In Person | Offbank",
  description:
    "Turn any screen into a crypto point of sale. Show a QR, the customer scans and pays USDC, you see it settle live in under a second. Non-custodial, 1% flat.",
  alternates: { canonical: "/products/terminal" },
  openGraph: {
    title: "Offbank POS Terminal - Take USDC Payments In Person",
    description:
      "Show a QR, customer scans, USDC settles to your wallet live. Non-custodial, 1% flat.",
    url: "https://offbankpay.com/products/terminal",
  },
};

const features = [
  {
    icon: QrCode,
    title: "Any screen is a register",
    desc: "Enter an amount, show the QR. The customer scans with any Solana wallet and pays. No card reader, no hardware, no app to install.",
  },
  {
    icon: Zap,
    title: "Settles live, in under a second",
    desc: "The terminal watches the chain for that exact sale and flips to “Paid” the instant it confirms - no waiting, no batch settlement.",
  },
  {
    icon: Wallet,
    title: "Straight to your wallet",
    desc: "USDC lands in your own wallet. Offbank never holds it - non-custodial by design, so there’s no account to freeze and nothing to withdraw.",
  },
  {
    icon: ShieldCheck,
    title: "1% flat, no chargebacks",
    desc: "On-chain payments are final. No card fees, no rolling reserve, no friendly fraud. One flat 1% and you keep the rest.",
  },
];

const steps = [
  { n: "1", t: "Enter the amount", d: "Type the sale total on your phone, tablet, or POS screen." },
  { n: "2", t: "Customer scans", d: "They scan the Solana Pay QR with any wallet and approve." },
  { n: "3", t: "Paid, instantly", d: "The terminal confirms on-chain and shows “Paid” - done." },
];

export default function TerminalProductPage() {
  return (
    <main className="bg-white text-[#101828]">
      <Navbar />

      {/* Hero */}
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
            POS Terminal
          </p>
          <h1 className="text-[40px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[56px]">
            Take USDC in person. Settle in seconds.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.6] text-white/75">
            Turn any phone, tablet, or screen into a crypto point of sale. Show a
            QR, the customer scans and pays, and you watch it settle live to your
            own wallet. No hardware, no card processor, no chargebacks.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/terminal"
              className="inline-flex items-center gap-2 rounded-full bg-[#34c759] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Open the terminal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sandbox"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.06]"
            >
              Try the checkout
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
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

      {/* How it works */}
      <section className="bg-[#f7f7f7] py-20">
        <div className="mx-auto max-w-[1000px] px-6">
          <h2 className="text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            Three taps to paid.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759] text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5c5c5c]">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-[820px] px-6 text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            Ready to ring up your first USDC sale?
          </h2>
          <p className="mt-3 text-[15px] text-[#5c5c5c]">
            Non-custodial, 1% flat, settles to your own wallet. No hardware to buy.
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
