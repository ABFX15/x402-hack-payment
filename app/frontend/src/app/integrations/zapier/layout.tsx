import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zapier Integration - Automate Settlements",
  description:
    "Trigger Offbank USDC settlements from any Zapier workflow. Connect 5,000+ apps to non-custodial B2B settlement.",
  alternates: { canonical: "/integrations/zapier" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/integrations/zapier",
    siteName: "Offbank",
    title: "Zapier Integration - Automate Settlements",
    description:
      "Trigger Offbank settlements from any Zapier workflow. Connect 5,000+ apps.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank + Zapier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zapier Integration - Automate Settlements",
    description:
      "Trigger Offbank settlements from any Zapier workflow. Connect 5,000+ apps.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
