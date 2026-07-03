import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Offbank - USDC payments for businesses banks won't serve",
    template: "%s | Offbank",
  },
  description:
    "Offbank is USDC payment infrastructure for cannabis, iGaming, high-risk and cross-border businesses. Accept payments, send instant payouts, and invoice - 1% flat, instant finality, non-custodial. No bank to freeze you.",
  alternates: { canonical: "/" },
  authors: [{ name: "Offbank" }],
  icons: {
    icon: [
      { url: "/new-logo-no-bg.png", sizes: "any" },
      { url: "/new-logo-no-bg.png", type: "image/png" },
    ],
    apple: "/new-logo-no-bg.png",
  },
  manifest: "/manifest.webmanifest",
  creator: "Offbank",
  publisher: "Offbank",
  metadataBase: new URL("https://offbankpay.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offbankpay.com",
    siteName: "Offbank",
    title: "Offbank - USDC payments for businesses banks won't serve",
    description:
      "Accept payments, send instant payouts, and invoice in USDC - for cannabis, iGaming, high-risk and cross-border businesses. 1% flat, instant, non-custodial. No bank to freeze you.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank - USDC payments for businesses banks won't serve",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@offbankpay",
    title: "Offbank - USDC payments for businesses banks won't serve",
    description:
      "Accept payments, send instant payouts, and invoice in USDC - for cannabis, iGaming, high-risk and cross-border businesses. 1% flat, instant, non-custodial.",
    images: ["/twitter-image?v=3"],
    creator: "@offbankpay",
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
    <html lang="en" style={{ background: "#FFFFFF" }}>
      <head>
        {/* Preconnect to external domains loaded at runtime */}
        <link
          rel="preconnect"
          href="https://explorer-api.walletconnect.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Favicons & app icons */}
        <link rel="icon" href="/new-logo-no-bg.png" sizes="any" />
        <link rel="icon" href="/new-logo-no-bg.png" type="image/png" />
        <link rel="apple-touch-icon" href="/new-logo-no-bg.png" />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Mobile viewport with safe area support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#f7f7f7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Google Ads Tag (gtag.js) - lazyOnload to avoid competing for bandwidth */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17871897491"
          strategy="lazyOnload"
        />
        <Script id="google-ads" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17871897491');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} noise-global antialiased`}
        style={{ background: "#FFFFFF" }}
      >
        <ClientLayout>{children}</ClientLayout>
        {/* SSR-rendered navigation for search engine crawlers (visually hidden) */}
        <nav aria-label="Site navigation" className="sr-only">
          <a href="/">Home</a>
          <a href="/products/payment-links">Payment Links</a>
          <a href="/products/invoices">Invoices</a>
          <a href="/pricing">Pricing</a>
          <a href="/compare">Compare</a>
          <a href="/compare/offbank-vs-cash-armored-cars">
            Offbank vs Cash &amp; Armored Cars
          </a>
          <a href="/compare/offbank-vs-high-risk-merchant-accounts">
            Offbank vs High-Risk Merchant Accounts
          </a>
          <a href="/demo">Demo</a>
          <a href="/learn">Knowledge Hub</a>
          <a href="/docs">Documentation</a>
          <a href="/integrations">Integrations</a>
          <a href="/integrations/shopify">Shopify</a>
          <a href="/integrations/woocommerce">WooCommerce</a>
          <a href="/integrations/zapier">Zapier</a>
          <a href="/integrations/slack">Slack</a>
          <a href="/integrations/bubble">Bubble</a>
          <a href="/industries/cannabis">Cannabis B2B Payments</a>
          <a href="/industries/cannabis-b2b-payments">
            Cannabis B2B Supply Chain Payments
          </a>
          <a href="/blog">Blog</a>
          <a href="/help">Help Center</a>
          <a href="/onboarding">Apply for the Private Rail</a>
          <a href="/onboarding">Get started</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </body>
    </html>
  );
}
