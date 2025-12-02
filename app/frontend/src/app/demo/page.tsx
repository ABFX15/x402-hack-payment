"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to payment page with demo data
    router.push(
      "/pay?amount=5.00&merchant=Demo%20Coffee%20Shop&memo=Latte%20%26%20Pastry"
    );
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading demo...</p>
    </main>
  );
}
