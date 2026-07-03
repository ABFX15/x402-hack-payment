import type { Metadata } from "next";
import HighRiskEcommerceClient from "./Client";

export const metadata: Metadata = {
  title: "High-Risk E-Commerce Checkout — USDC Payments | Offbank",
  description:
    "A drop-in USDC checkout for stores Stripe won't serve: vape hardware, smoke-shop, kratom, nutra, adult and 2A gear. 1% flat, no chargebacks, settles worldwide in under a second.",
  alternates: { canonical: "/industries/high-risk-ecommerce" },
  openGraph: {
    title: "High-Risk E-Commerce Checkout — USDC Payments",
    description:
      "Paste-in USDC checkout for high-risk online stores. 1% flat, no chargebacks, global by default.",
    url: "https://offbankpay.com/industries/high-risk-ecommerce",
  },
};

export default function HighRiskEcommercePage() {
  return <HighRiskEcommerceClient />;
}
