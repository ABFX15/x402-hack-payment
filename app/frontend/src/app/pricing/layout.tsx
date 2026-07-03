import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - 1% Flat Settlement Fee",
  description:
    "1% flat per settlement. No setup fees, no monthly fees, no FX markup. Non-custodial USDC on Solana with instant finality.",
  keywords: [
    "settlement pricing",
    "1% settlement fee",
    "USDC settlement cost",
    "high-risk payment processor fees",
    "cannabis payment processing fees",
    "non-custodial settlement pricing",
  ],
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Offbank Pricing - 1% Flat Settlement Fee",
    description:
      "1% flat per settlement. No setup fees, no FX markup. Non-custodial USDC, instant finality.",
    url: "https://offbankpay.com/pricing",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offbank Pricing - 1% Flat Settlement Fee",
    description:
      "1% flat per settlement. No bank interference, no hidden charges. Built for the debanked.",
    images: ["/twitter-image?v=3"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
