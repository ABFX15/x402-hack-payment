"use client";

/**
 * Public self-serve affiliate onboarding.
 *
 * An operator shares /join/<merchant_wallet>?org=<name>. The affiliate fills in
 * their own name, email, and (optionally) a Solana wallet. No login, no crypto
 * knowledge required. They then appear in the operator's Affiliate Payouts list
 * automatically — the operator types nothing.
 */

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck, Zap, Wallet } from "lucide-react";

export default function JoinAffiliatePage() {
  const params = useParams<{ wallet: string }>();
  const search = useSearchParams();
  const merchantWallet = params?.wallet ?? "";
  const org = search.get("org")?.trim() || "this business";

  const [form, setForm] = useState({ name: "", email: "", payoutWallet: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Please enter a valid email.");
    setStatus("saving");
    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantWallet,
          name: form.name.trim(),
          email: form.email.trim(),
          payoutWallet: form.payoutWallet.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("done");
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f7f8fa] px-6 py-16">
      <div className="w-full max-w-[440px]">
        {status === "done" ? (
          <div className="rounded-2xl border border-[#eaecf0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#34c759]/12">
              <CheckCircle2 className="h-7 w-7 text-[#34c759]" />
            </div>
            <h1 className="mt-5 text-[22px] font-bold tracking-tight text-[#0d0d0f]">
              You&apos;re all set
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#667085]">
              {org} can now pay you in USDC. When your first payout lands,
              you&apos;ll get an email with a link to claim it — no wallet or
              crypto knowledge needed.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#eaecf0] bg-white p-8 shadow-sm">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#34c759]">
              Get paid in USDC
            </p>
            <h1 className="mt-2 text-[24px] font-bold leading-tight tracking-tight text-[#0d0d0f]">
              Set up how {org} pays you
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#667085]">
              Enter your details once. Future commissions arrive instantly, at
              no cost to you, with no minimum threshold.
            </p>

            <div className="mt-6 space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name or company"
                className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
              />
              <div>
                <input
                  value={form.payoutWallet}
                  onChange={(e) => setForm({ ...form, payoutWallet: e.target.value })}
                  placeholder="Solana wallet address (optional)"
                  className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
                />
                <p className="mt-1.5 text-[12px] text-[#98a2b3]">
                  No wallet? Leave this blank — you can claim by email later.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-[13px] font-medium text-[#d92d20]">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={status === "saving"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#34c759] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048] disabled:opacity-60"
            >
              {status === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save my payout details
            </button>

            <div className="mt-6 flex items-center justify-center gap-5 text-[12px] text-[#98a2b3]">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#34c759]" /> Instant
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#34c759]" /> Non-custodial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-[#34c759]" /> No fees to you
              </span>
            </div>
          </div>
        )}

        <p className="mt-5 text-center text-[12px] text-[#98a2b3]">
          Powered by Offbank · payouts settle in USDC on Solana
        </p>
      </div>
    </div>
  );
}
