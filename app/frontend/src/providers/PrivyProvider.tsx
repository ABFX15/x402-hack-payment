"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!appId) {
    console.warn(
      "[Settlr] Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable embedded wallets."
    );
    return <>{children}</>;
  }

  // Don't render on server
  if (!mounted) {
    return null;
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#f472b6",
          logo: "/logo-new.png",
          showWalletLoginFirst: true,
          walletChainType: "solana-only",
        },
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
