import type { Metadata } from "next";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin pages are wallet/session-gated client pages - don't statically
// prerender them (the wallet + Privy hooks have no context at build time,
// and CI builds run without a Privy app id). Matches the dashboard layout.
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
