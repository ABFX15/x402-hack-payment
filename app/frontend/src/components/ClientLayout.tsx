"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const WalletProvider = dynamic(
  () => import("@/providers/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

const Header = dynamic(() => import("@/components/Header"), { ssr: false });

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Pages that have their own header/layout
  const noGlobalHeader = ["/", "/waitlist", "/pricing"];
  const showHeader = !noGlobalHeader.includes(pathname);

  return (
    <WalletProvider>
      {showHeader && (
        <>
          <div className="gradient-bg" />
          <Header />
        </>
      )}
      <main className={showHeader ? "pt-16" : ""}>{children}</main>
    </WalletProvider>
  );
}
