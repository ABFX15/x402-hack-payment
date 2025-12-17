import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description:
    "Get early access to Settlr - the future of crypto payments. Be the first to accept gasless USDC payments on Solana with instant settlement.",
  keywords: [
    "settlr waitlist",
    "crypto payment early access",
    "USDC payments beta",
    "solana payment gateway",
  ],
  openGraph: {
    title: "Join the Settlr Waitlist",
    description:
      "Get early access to the future of crypto payments. Gasless USDC on Solana with instant settlement.",
    url: "https://settlr.xyz/waitlist",
  },
  twitter: {
    title: "Join the Settlr Waitlist",
    description:
      "Get early access to the future of crypto payments. Gasless USDC on Solana.",
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
