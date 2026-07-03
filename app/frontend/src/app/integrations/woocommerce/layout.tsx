import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WooCommerce Settlement - Non-Custodial USDC for WordPress",
  description:
    "Add non-custodial USDC settlement to WooCommerce. 1% flat fee, instant finality, no bank interference.",
  alternates: { canonical: "/integrations/woocommerce" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/integrations/woocommerce",
    siteName: "Offbank",
    title: "WooCommerce Settlement - Non-Custodial USDC for WordPress",
    description:
      "Non-custodial USDC settlement for WooCommerce. 1% flat, instant finality.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank + WooCommerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WooCommerce Settlement - Non-Custodial USDC for WordPress",
    description:
      "Non-custodial USDC settlement for WooCommerce. 1% flat, instant finality.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
