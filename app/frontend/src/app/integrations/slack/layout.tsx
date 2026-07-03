import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slack Notifications - Settlement Alerts in Slack",
  description:
    "Get real-time Offbank settlement notifications in Slack. Know instantly when payments are sent, confirmed, and settled.",
  alternates: { canonical: "/integrations/slack" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/integrations/slack",
    siteName: "Offbank",
    title: "Slack Notifications - Settlement Alerts in Slack",
    description:
      "Get real-time settlement notifications in Slack. Know when payments settle.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank + Slack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Slack Notifications - Settlement Alerts in Slack",
    description:
      "Real-time settlement notifications in Slack. Know when payments settle.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
