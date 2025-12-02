"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const WalletProvider = dynamic(
  () => import("@/providers/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

const Header = dynamic(() => import("@/components/Header"), { ssr: false });

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <div className="gradient-bg" />
      <Header />
      <main className="pt-16">{children}</main>
    </WalletProvider>
  );
}
