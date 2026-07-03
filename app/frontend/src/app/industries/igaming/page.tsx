import type { Metadata } from "next";
import IGamingClient from "./Client";

export const metadata: Metadata = {
  title: "iGaming Payments - Instant USDC Deposits & Payouts | Offbank",
  description:
    "USDC payment infrastructure for iGaming: crypto deposits at checkout and instant player withdrawals by email or wallet. 1% flat, no chargebacks, no processor to freeze you.",
  alternates: { canonical: "/industries/igaming" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "iGaming Payments - Instant USDC Deposits & Payouts",
    description:
      "Crypto deposits + instant USDC payouts for online gaming. 1% flat, no chargebacks, global by default.",
    url: "https://offbankpay.com/industries/igaming",
  },
};

export default function IGamingPage() {
  return <IGamingClient />;
}
