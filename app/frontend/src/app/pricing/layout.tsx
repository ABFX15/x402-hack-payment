import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Settlr crypto payments. Start free with 2% fees, or go Pro at $29/month with 0.5% fees. No hidden costs.",
  keywords: [
    "settlr pricing",
    "crypto payment fees",
    "USDC payment pricing",
    "merchant crypto fees",
    "payment gateway pricing",
  ],
  openGraph: {
    title: "Settlr Pricing - Simple & Transparent",
    description:
      "Start free with 2% fees, or go Pro at $29/month with 0.5% fees. No hidden costs, no surprises.",
    url: "https://settlr.dev/pricing",
  },
  twitter: {
    title: "Settlr Pricing - Simple & Transparent",
    description:
      "Start free with 2% fees, or go Pro at $29/month with 0.5% fees. No hidden costs.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
