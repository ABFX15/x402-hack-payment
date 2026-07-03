import type { Metadata } from "next";
import CbdHempClient from "./Client";

export const metadata: Metadata = {
  title: "CBD & Hemp Payments, USDC Settlement | Offbank",
  description:
    "Stablecoin settlement for CBD, hemp, and adjacent botanical brands. Skip 4-9% high-risk processors and frozen Stripe accounts. 1% flat, instant USDC, cash out to USD.",
  alternates: { canonical: "/industries/cbd-hemp" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "CBD & Hemp Payments, USDC Settlement",
    description:
      "Skip frozen Stripe accounts and 4-9% high-risk processors. Settle in USDC at 1%, cash out to USD.",
    url: "https://offbankpay.com/industries/cbd-hemp",
  },
};

export default function CbdHempPage() {
  return <CbdHempClient />;
}
