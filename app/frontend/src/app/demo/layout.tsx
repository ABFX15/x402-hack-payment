import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo - B2B Settlement Rail for Restricted Commerce",
  description:
    "See how Offbank settles B2B invoices in under 5 seconds. Non-custodial, 1% flat, with a cryptographic audit trail. Try payment links and invoice settlement live.",
  keywords: [
    "cannabis B2B settlement demo",
    "stablecoin invoice settlement",
    "non-custodial payment demo",
    "USDC B2B payment link",
    "restricted commerce settlement",
  ],
  alternates: { canonical: "/demo" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Offbank Demo - B2B Settlement Rail in Action",
    description:
      "Create a payment link or settle a B2B invoice. Non-custodial, instant, with an on-chain audit trail.",
    url: "https://offbankpay.com/demo",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank Live Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offbank Demo - B2B Settlement Rail",
    description:
      "Non-custodial B2B settlement in under 5 seconds. Try payment links and invoice settlement live.",
    images: ["/twitter-image?v=3"],
  },
};

import AuthLayout from "@/components/AuthLayout";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
