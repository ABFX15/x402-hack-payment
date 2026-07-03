"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

/**
 * Invisible component that auto-redirects authenticated users:
 *  - Wallet connected but not onboarded → /onboarding
 *
 * Self-serve: any wallet that signs in can complete onboarding (KYB happens
 * at first settlement, not at signup). The waitlist still exists for
 * pre-launch interest collection but does NOT gate access.
 *
 * Only redirects from protected merchant pages (dashboard, create).
 * Customer-facing pages (checkout, invoice, demo, etc.) never redirect.
 */

// Pages that require merchant onboarding - redirect fires here
const PROTECTED_PATHS = ["/dashboard", "/create"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export function PostLoginRouter() {
  const { status } = useOnboardingStatus();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (status === "loading") return;

    if (status === "needs-onboarding" && isProtectedPath(pathname)) {
      hasRedirected.current = true;
      router.replace("/onboarding");
    }
  }, [status, pathname, router]);

  // Block direct access to protected pages (same logic, no hasRedirected guard)
  useEffect(() => {
    if (status === "needs-onboarding" && isProtectedPath(pathname)) {
      router.replace("/onboarding");
    }
  }, [status, pathname, router]);

  return null;
}
