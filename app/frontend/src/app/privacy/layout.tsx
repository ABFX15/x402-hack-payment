import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Offbank privacy policy. How we collect, use, store, and protect your data when you use our settlement platform.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com/privacy",
    siteName: "Offbank",
    title: "Privacy Policy",
    description:
      "Read the Offbank privacy policy. How we collect, use, store, and protect your data when you use our settlement platform.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank - Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offbank Privacy Policy",
    description:
      "How Offbank collects, uses, and protects your data when using our settlement infrastructure.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
