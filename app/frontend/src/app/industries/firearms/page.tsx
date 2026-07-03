import type { Metadata } from "next";
import FirearmsClient from "./Client";

export const metadata: Metadata = {
  title: "Firearms & Ammunition Payments, USDC Settlement | Offbank",
  description:
    "Stablecoin settlement for FFL holders, ammunition manufacturers, and firearms accessories brands. No more PayPal bans or Stripe deboards. 1% flat USDC settlement.",
  alternates: { canonical: "/industries/firearms" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Firearms & Ammunition Payments, USDC Settlement",
    description:
      "Settlement for FFLs, ammo manufacturers, and accessories, without account freezes, viewpoint deboarding, or 4-8% high-risk fees.",
    url: "https://offbankpay.com/industries/firearms",
  },
};

export default function FirearmsPage() {
  return <FirearmsClient />;
}
