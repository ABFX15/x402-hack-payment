import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started - Deploy Non-Custodial Settlement in 30 Minutes",
  description:
    "Set up your Offbank account and start settling B2B transactions with non-custodial USDC on Solana. Deploy to production in under 30 minutes.",
  keywords: [
    "settlement API setup",
    "USDC settlement onboarding",
    "non-custodial settlement integration",
    "stablecoin settlement quickstart",
  ],
  alternates: { canonical: "/onboarding" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Get started with Offbank - Non-Custodial Settlement in 30 Minutes",
    description:
      "Deploy non-custodial USDC settlement for high-risk B2B supply chains. Live in minutes.",
    url: "https://offbankpay.com/onboarding",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Get started with Offbank",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get started with Offbank - Non-Custodial Settlement in 30 Minutes",
    description:
      "Deploy non-custodial USDC settlement for your B2B supply chain. No bank interference.",
    images: ["/twitter-image?v=3"],
  },
};

import AuthLayout from "@/components/AuthLayout";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
