import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Settlr | Non-Custodial Crypto Payment Processor",
    template: "%s | Settlr",
  },
  description:
    "Accept USDC payments with instant settlement directly to your wallet. Non-custodial, no wallet extensions needed. Customers pay with email. From 1% fees. Built on Solana.",
  keywords: [
    "crypto payment processor",
    "crypto payment gateway",
    "accept crypto payments",
    "non-custodial payments",
    "USDC payment processor",
    "Solana payments",
    "stablecoin payments",
    "crypto checkout",
    "embedded wallets",
    "gasless transactions",
    "instant crypto payments",
    "BitPay alternative",
    "Coinbase Commerce alternative",
    "merchant crypto payments",
    "web3 payments",
    "crypto payment SDK",
    "accept USDC",
    "crypto payment API",
    "blockchain payment gateway",
    "no-code crypto payments",
  ],
  authors: [{ name: "Settlr" }],
  creator: "Settlr",
  publisher: "Settlr",
  metadataBase: new URL("https://settlr.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev",
    siteName: "Settlr",
    title: "Settlr | Non-Custodial Crypto Payment Processor",
    description:
      "Accept USDC payments with instant settlement to your wallet. No custody risk, no delays. Embedded wallets for seamless checkout. From 1% fees.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr - Non-Custodial Crypto Payment Processor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr | Non-Custodial Crypto Payments",
    description:
      "Instant settlement to your wallet. No custody risk. Embedded wallets. From 1% fees.",
    images: ["/opengraph-image"],
    creator: "@SettlrPay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#0a0a12" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a0a12" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
