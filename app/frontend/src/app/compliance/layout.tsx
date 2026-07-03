import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance Whitepaper - GENIUS Act, BSA/AML & KYB Framework",
  description:
    "How Offbank achieves full regulatory compliance for restricted-commerce B2B settlements. GENIUS Act 2025 stablecoin framework, BSA/AML screening, KYB verification, and on-chain audit trail.",
  keywords: [
    "GENIUS Act 2025",
    "stablecoin compliance",
    "BSA AML framework",
    "KYB verification",
    "cannabis payment compliance",
    "restricted commerce regulation",
    "on-chain audit trail",
  ],
  alternates: { canonical: "/compliance" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Offbank Compliance Whitepaper - GENIUS Act & BSA/AML",
    description:
      "Full regulatory framework for non-custodial B2B stablecoin settlements in restricted commerce.",
    url: "https://offbankpay.com/compliance",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank Compliance Whitepaper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offbank Compliance Whitepaper",
    description:
      "GENIUS Act, BSA/AML, KYB - how Offbank keeps restricted commerce compliant on-chain.",
    images: ["/twitter-image?v=3"],
  },
};

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
