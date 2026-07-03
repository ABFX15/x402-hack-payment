import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopify Settlement - Non-Custodial USDC via Offbank",
  description:
    "Add non-custodial USDC settlement to your Shopify store. 1% flat fee, instant finality, no bank interference.",
  alternates: { canonical: "/integrations/shopify" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/integrations/shopify",
    siteName: "Offbank",
    title: "Shopify Settlement - Non-Custodial USDC via Offbank",
    description:
      "Non-custodial USDC settlement for Shopify. 1% flat, instant finality.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank + Shopify",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Settlement - Non-Custodial USDC via Offbank",
    description:
      "Non-custodial USDC settlement for Shopify. 1% flat, instant finality.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
