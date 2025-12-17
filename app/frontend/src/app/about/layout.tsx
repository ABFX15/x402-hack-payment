import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Settlr is revolutionizing crypto payments with gasless USDC transactions on Solana. Built for modern merchants who want instant, secure, and simple payments.",
  keywords: [
    "about settlr",
    "crypto payment company",
    "solana payments team",
    "USDC payment startup",
  ],
  openGraph: {
    title: "About Settlr - Revolutionizing Crypto Payments",
    description:
      "Learn how Settlr is revolutionizing crypto payments with gasless USDC transactions on Solana.",
    url: "https://settlr.xyz/about",
  },
  twitter: {
    title: "About Settlr - Revolutionizing Crypto Payments",
    description:
      "Learn how Settlr is revolutionizing crypto payments with gasless USDC transactions on Solana.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
