import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Payments - Non-Custodial USDC Settlement",
  description:
    "Settle with vendors and contractors using non-custodial USDC on Solana. 1% flat fee, instant finality, no bank interference.",
  alternates: { canonical: "/send-payments" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/send-payments",
    siteName: "Offbank",
    title: "Send Payments - Non-Custodial USDC Settlement",
    description:
      "Settle with vendors and contractors using non-custodial USDC. 1% flat, instant finality.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank - Non-Custodial Settlement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Send Payments - Non-Custodial USDC Settlement",
    description:
      "Non-custodial USDC settlement for high-risk B2B supply chains. 1% flat, instant finality.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
