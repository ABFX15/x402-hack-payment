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
    default: "Settlr | Seamless iGaming Payments on Solana",
    template: "%s | Settlr",
  },
  description:
    "Seamless payments for iGaming. No wallet required, gasless on Solana, multichain support. Accept USDC from any chain with 2% fees.",
  keywords: [
    "crypto payments",
    "USDC payments",
    "Solana payments",
    "stablecoin payments",
    "crypto payment gateway",
    "accept crypto payments",
    "USDC payment processor",
    "Solana payment gateway",
    "gasless transactions",
    "instant crypto payments",
    "merchant crypto payments",
    "blockchain payments",
    "web3 payments",
    "DeFi payments",
    "cryptocurrency payment solution",
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
    title: "Settlr | Seamless iGaming Payments on Solana",
    description:
      "No wallet required. Gasless on Solana. Accept USDC from any chain in minutes.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr - Seamless iGaming Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr | Seamless iGaming Payments on Solana",
    description: "No wallet required. Gasless on Solana. 2% fees.",
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
