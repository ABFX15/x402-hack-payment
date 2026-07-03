import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations - Connect Offbank to Your Stack",
  description:
    "Integrate Offbank non-custodial USDC settlement with Shopify, WooCommerce, Zapier, Slack, Bubble, and more. Add B2B settlement to any platform.",
  alternates: { canonical: "/integrations" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/integrations",
    siteName: "Offbank",
    title: "Integrations - Connect Offbank to Your Stack",
    description:
      "Connect Offbank non-custodial settlement with Shopify, WooCommerce, Zapier, Slack, Bubble, and more.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank - Integrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrations - Connect Offbank to Your Stack",
    description:
      "Connect Offbank non-custodial settlement with Shopify, WooCommerce, Zapier, Slack, Bubble, and more.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
