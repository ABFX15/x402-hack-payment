"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamic import PrivyProvider to avoid SSR issues with pino/thread-stream
const PrivyProvider = dynamic(
  () => import("@/providers/PrivyProvider").then((mod) => mod.PrivyProvider),
  { ssr: false }
);

const WalletProvider = dynamic(
  () => import("@/providers/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <WalletProvider>
        <main>{children}</main>
      </WalletProvider>
    </PrivyProvider>
  );
}
