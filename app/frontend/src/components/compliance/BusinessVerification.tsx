"use client";

/**
 * BusinessVerification - the merchant's own KYB step.
 *
 * Mounts the Sumsub WebSDK so a merchant can verify their business (license +
 * beneficial-owner ID). Verification runs under the merchant's WALLET as the
 * Sumsub externalUserId, which is exactly what the compliance dossier reads
 * (`isUserVerified(wallet)`), so a pass flips the dossier KYB badge to Verified.
 *
 * The WebSDK is loaded from Sumsub's CDN on demand (no npm dependency). Status
 * is read back from /api/kyc/status and refreshed when Sumsub reports a change.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ShieldCheck,
  Loader2,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";

const SUMSUB_SDK_SRC =
  "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";

type KybStatus = "loading" | "verified" | "pending" | "rejected" | "unknown";

// The Sumsub global the CDN script attaches to window.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snsWebSdk?: any;
  }
}

function loadSumsubScript(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined")
      return reject(new Error("not in browser"));
    if (window.snsWebSdk) return resolve(window.snsWebSdk);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SUMSUB_SDK_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.snsWebSdk));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load verification SDK")),
      );
      return;
    }
    const s = document.createElement("script");
    s.src = SUMSUB_SDK_SRC;
    s.async = true;
    s.onload = () => resolve(window.snsWebSdk);
    s.onerror = () => reject(new Error("Failed to load verification SDK"));
    document.body.appendChild(s);
  });
}

export function BusinessVerification() {
  const { publicKey, connected } = useActiveWallet();
  const [status, setStatus] = useState<KybStatus>("loading");
  const [launching, setLaunching] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const launchedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(
        `/api/kyc/status?userId=${encodeURIComponent(publicKey)}`,
      );
      if (!res.ok) {
        setStatus("unknown");
        return;
      }
      const data = await res.json();
      setStatus(
        data.status === "verified"
          ? "verified"
          : data.status === "pending"
            ? "pending"
            : data.status === "rejected"
              ? "rejected"
              : "unknown",
      );
    } catch {
      setStatus("unknown");
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) fetchStatus();
  }, [connected, publicKey, fetchStatus]);

  const getToken = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/kyc/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: publicKey, kyb: true }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        body.details || body.error || "Could not start verification",
      );
    }
    return (await res.json()).token as string;
  }, [publicKey]);

  const startVerification = useCallback(async () => {
    if (!publicKey || launchedRef.current) return;
    setError(null);
    setLaunching(true);
    setOpen(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snsWebSdk = (await loadSumsubScript()) as any;
      const token = await getToken();
      const sdk = snsWebSdk
        .init(token, async () => await getToken())
        .withConf({ lang: "en" })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on("idCheck.onApplicantStatusChanged", () => {
          fetchStatus();
        })
        .build();
      sdk.launch("#sumsub-kyb-container");
      launchedRef.current = true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Verification failed to start",
      );
      setOpen(false);
    } finally {
      setLaunching(false);
    }
  }, [publicKey, getToken, fetchStatus]);

  if (!connected) return null;

  const StatusBadge = () => {
    if (status === "verified")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-sm font-semibold text-[#166534]">
          <ShieldCheck className="h-4 w-4" /> Verified
        </span>
      );
    if (status === "pending")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef9c3] px-3 py-1 text-sm font-semibold text-[#854d0e]">
          <Clock className="h-4 w-4" /> Under review
        </span>
      );
    if (status === "rejected")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1 text-sm font-semibold text-[#991b1b]">
          <XCircle className="h-4 w-4" /> Rejected
        </span>
      );
    if (status === "loading")
      return <Loader2 className="h-4 w-4 animate-spin text-[#8a8a8a]" />;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-sm font-semibold text-[#64748b]">
        Not started
      </span>
    );
  };

  return (
    <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#34c759]" />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#212121]">
                Verify your business
              </p>
              <StatusBadge />
            </div>
            <p className="mt-0.5 text-sm text-[#8a8a8a]">
              Upload your business license and owner ID. This is the KYB step
              banks and settlement partners require - and it&rsquo;s what flips
              your compliance dossier to{" "}
              <span className="font-medium text-[#212121]">Verified</span>.
            </p>
          </div>
        </div>
        {status !== "verified" && (
          <button
            onClick={startVerification}
            disabled={launching}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048] disabled:opacity-50"
          >
            {launching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {status === "pending" || status === "rejected"
              ? "Continue verification"
              : "Start verification"}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-[#fee2e2] px-3 py-2 text-sm text-[#991b1b]">
          {error}
        </p>
      )}

      {/* Sumsub WebSDK mounts here once verification starts. */}
      {open && (
        <div
          id="sumsub-kyb-container"
          className="mt-4 min-h-[480px] rounded-lg border border-[#E2E8F0]"
        />
      )}
    </div>
  );
}
