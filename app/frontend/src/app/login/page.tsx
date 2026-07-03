"use client";

import { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivySession } from "@/hooks/usePrivySession";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, Wallet, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const c = {
  bg: "#FFFFFF",
  card: "#f2f2f2",
  navy: "#212121",
  slate: "#5c5c5c",
  muted: "#8a8a8a",
  border: "#d3d3d3",
  green: "#34c759",
  greenBg: "rgba(52,199,89,0.08)",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: c.bg }}
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: c.green }}
          />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const privyEnabled = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const { ready: privyReady, authenticated, login, logout } = usePrivy();
  const { status: sessionStatus } = usePrivySession();
  const { status: onboardingStatus } = useOnboardingStatus();
  const { connected: walletConnected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Once we have an `offbank_session` (either via Privy verify OR via
  // wallet sign-in flow), route based on whether the merchant is onboarded.
  const haveSession = sessionStatus === "ready" || walletConnected;
  useEffect(() => {
    if (!haveSession) return;
    if (onboardingStatus === "loading") return;
    const token = searchParams.get("token");
    if (onboardingStatus === "onboarded") {
      router.replace("/dashboard");
    } else if (onboardingStatus === "needs-onboarding") {
      router.replace(
        token
          ? `/onboarding?token=${encodeURIComponent(token)}`
          : "/onboarding",
      );
    }
  }, [haveSession, onboardingStatus, router, searchParams]);

  // Verifying / routing state
  if (
    haveSession &&
    (onboardingStatus === "loading" ||
      onboardingStatus === "onboarded" ||
      onboardingStatus === "needs-onboarding")
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: c.bg }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: c.green }}
          />
          <p style={{ color: c.muted }}>
            {sessionStatus === "verifying"
              ? "Verifying your sign-in…"
              : "Checking your account…"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: c.bg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-10 max-w-lg w-full"
        style={{ background: c.card, borderColor: c.border }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: c.greenBg }}
        >
          <ShieldCheck className="w-8 h-8" style={{ color: c.green }} />
        </div>
        <h1
          className="text-3xl font-bold mb-2 text-center"
          style={{ color: c.navy }}
        >
          Sign in to Offbank
        </h1>
        <p className="mb-8 text-sm text-center" style={{ color: c.muted }}>
          Use your email - we&apos;ll send a one-time code.
        </p>

        {/* Privy email login (recommended) */}
        {privyEnabled && (
          <button
            type="button"
            disabled={!privyReady}
            onClick={async () => {
              // If a stale Privy session exists but onboarding never
              // completed (e.g. earlier 503), logging out first lets the
              // user start the email flow cleanly instead of getting
              // stuck on a disabled button.
              if (authenticated) {
                try {
                  await logout();
                } catch {}
              }
              login();
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: c.green }}
          >
            {!privyReady ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                {authenticated ? "Sign in again" : "Continue with email"}
              </>
            )}
          </button>
        )}

        {!privyEnabled && (
          <div
            className="rounded-xl p-4 text-xs text-center"
            style={{ background: "#fef3c7", color: "#92400e" }}
          >
            Email sign-in is currently disabled. Use the wallet option below.
          </div>
        )}

        {/* OR / advanced wallet path */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1" style={{ background: c.border }} />
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: c.muted }}
          >
            or, advanced
          </span>
          <div className="h-px flex-1" style={{ background: c.border }} />
        </div>

        <button
          onClick={() => setVisible(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition hover:bg-white"
          style={{ borderColor: c.border, color: c.navy, background: "white" }}
        >
          <Wallet className="h-4 w-4" />
          Connect existing Solana wallet
        </button>

        <div
          className="flex items-center justify-center gap-4 mt-8 pt-6 border-t"
          style={{ borderColor: c.border }}
        >
          {[
            ["/circle-logo.svg", "USDC"],
            ["/solana-logo.svg", "Solana"],
          ].map(([src, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <Image
                src={src}
                alt={label}
                width={16}
                height={16}
                className="opacity-60"
              />
              <span className="text-[11px]" style={{ color: c.muted }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-center" style={{ color: c.muted }}>
          New to Offbank?{" "}
          <Link
            href="/onboarding"
            className="font-medium underline"
            style={{ color: c.green }}
          >
            Get started
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
