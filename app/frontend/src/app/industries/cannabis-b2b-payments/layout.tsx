import type { Metadata } from "next";

// Noindex this older landing variant - primary canonical is /industries/cannabis.
// Kept reachable so existing inbound links don't break, but excluded from
// search to avoid Google flagging duplicate cannabis content.
export const metadata: Metadata = {
  alternates: { canonical: "/industries/cannabis" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
