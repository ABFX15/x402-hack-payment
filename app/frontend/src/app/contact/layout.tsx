import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Settlr team. Have questions about crypto payments, enterprise pricing, or partnerships? We'd love to hear from you.",
  keywords: [
    "contact settlr",
    "crypto payment support",
    "enterprise crypto payments",
    "partnership inquiry",
  ],
  openGraph: {
    title: "Contact Settlr",
    description:
      "Get in touch with the Settlr team. Questions about crypto payments? We'd love to hear from you.",
    url: "https://settlr.dev/contact",
  },
  twitter: {
    title: "Contact Settlr",
    description:
      "Get in touch with the Settlr team. Questions about crypto payments? We'd love to hear from you.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
