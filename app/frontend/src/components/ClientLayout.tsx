"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Dynamic import PrivyProvider to avoid SSR issues with pino/thread-stream
const PrivyProvider = dynamic(
  () => import("@/providers/PrivyProvider").then((mod) => mod.PrivyProvider),
  { ssr: false }
);

const WalletProvider = dynamic(
  () => import("@/providers/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

const Header = dynamic(() => import("@/components/Header"), { ssr: false });

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Pages that have their own header/layout
  const noGlobalHeader = ["/", "/waitlist", "/pricing", "/checkout"];
  const showHeader = !noGlobalHeader.includes(pathname);

  return (
    <PrivyProvider>
      <WalletProvider>
        {showHeader && (
          <>
            <div className="gradient-bg" />
            <Header />
          </>
        )}
        <main className={showHeader ? "pt-16" : ""}>{children}</main>
      </WalletProvider>
    </PrivyProvider>
  );
}
