import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubble Plugin - No-Code USDC Settlement",
  description:
    "Add instant USDC settlement to your Bubble app. No code required - drag-and-drop non-custodial payment infrastructure.",
  alternates: { canonical: "/integrations/bubble" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/integrations/bubble",
    siteName: "Offbank",
    title: "Bubble Plugin - No-Code USDC Settlement",
    description:
      "Add instant USDC settlement to your Bubble app. No code required.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank + Bubble",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bubble Plugin - No-Code USDC Settlement",
    description:
      "Add instant USDC settlement to your Bubble app. No code required.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
