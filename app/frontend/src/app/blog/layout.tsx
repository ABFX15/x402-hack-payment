import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Settlement, Stablecoins & Compliance",
  description:
    "Guides and insights on non-custodial B2B settlement, stablecoin compliance, high-risk payment processing, and building settlement infrastructure for the debanked.",
  keywords: [
    "non-custodial settlement guides",
    "stablecoin settlement blog",
    "high-risk payment processing insights",
    "USDC settlement infrastructure",
    "cannabis payment processing blog",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Offbank Blog - Settlement Guides & Insights",
    description:
      "Guides on non-custodial settlement infrastructure, stablecoin compliance, and high-risk B2B payments.",
    url: "https://offbankpay.com/blog",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offbank Blog - Settlement Guides & Insights",
    description:
      "Insights on non-custodial settlement, stablecoin compliance, and high-risk B2B infrastructure.",
    images: ["/twitter-image?v=3"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
