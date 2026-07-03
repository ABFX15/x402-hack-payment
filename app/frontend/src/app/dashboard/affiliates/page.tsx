"use client";

/**
 * Affiliate Payouts - pay affiliates/partners instantly in USDC, any amount,
 * no minimum threshold. The flow iGaming operators can't get anywhere else.
 * Affiliates are remembered locally; payouts go out via the shared payout rails
 * (each recipient gets a claim link + email and claims with any wallet).
 */

import { useCallback, useEffect, useState } from "react";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  Users,
  Plus,
  Send,
  Trash2,
  Loader2,
  Wallet,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface Affiliate {
  name: string;
  email: string;
  commission: string; // pending amount, USDC
}

interface PayResult {
  email: string;
  amount: number;
  ok: boolean;
  claimUrl?: string;
  error?: string;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function AffiliatesPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [form, setForm] = useState({ name: "", email: "", commission: "" });
  const [payingAll, setPayingAll] = useState(false);
  const [payingOne, setPayingOne] = useState<string | null>(null);
  const [results, setResults] = useState<PayResult[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const storageKey = publicKey ? `offbank:affiliates:${publicKey}` : "";

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAffiliates(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const persist = useCallback(
    (list: Affiliate[]) => {
      setAffiliates(list);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(list));
    },
    [storageKey],
  );

  const addAffiliate = () => {
    if (!form.name.trim() || !form.email.includes("@")) return;
    persist([
      ...affiliates,
      {
        name: form.name.trim(),
        email: form.email.trim(),
        commission: form.commission || "",
      },
    ]);
    setForm({ name: "", email: "", commission: "" });
  };

  const removeAffiliate = (email: string) =>
    persist(affiliates.filter((a) => a.email !== email));

  const updateCommission = (email: string, value: string) =>
    persist(
      affiliates.map((a) =>
        a.email === email ? { ...a, commission: value } : a,
      ),
    );

  const pay = useCallback(
    async (list: Affiliate[], single?: string) => {
      if (!publicKey) return;
      const payouts = list
        .map((a) => ({
          email: a.email,
          amount: parseFloat(a.commission || ""),
          memo: "Affiliate commission",
        }))
        .filter((p) => p.amount > 0);
      if (payouts.length === 0) {
        setFlash("Set a commission amount first.");
        setTimeout(() => setFlash(null), 2500);
        return;
      }
      if (single) setPayingOne(single);
      else setPayingAll(true);
      try {
        const res = await fetch("/api/affiliates/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: publicKey, type: "affiliate", payouts }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Payout failed");
        setResults(data.results || []);
        // Clear commissions that were paid.
        const paidEmails = new Set(
          (data.results || []).filter((r: PayResult) => r.ok).map((r: PayResult) => r.email),
        );
        persist(
          affiliates.map((a) =>
            paidEmails.has(a.email) ? { ...a, commission: "" } : a,
          ),
        );
        setFlash(`Paid ${data.paid} affiliate(s) · ${fmtUSD(data.total)}`);
      } catch (e) {
        setFlash(e instanceof Error ? e.message : "Payout failed");
      } finally {
        setPayingOne(null);
        setPayingAll(false);
        setTimeout(() => setFlash(null), 4000);
      }
    },
    [publicKey, affiliates, persist],
  );

  if (!connected || !publicKey) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34c759]/10">
          <Users className="h-7 w-7 text-[#34c759]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#101828]">
          Affiliate Payouts
        </h1>
        <p className="mt-1.5 text-[15px] text-[#667085]">
          Connect your wallet to pay affiliates in USDC.
        </p>
        <button
          onClick={() => openWalletModal(true)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2ba048]"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </button>
      </div>
    );
  }

  const totalPending = affiliates.reduce(
    (s, a) => s + (parseFloat(a.commission || "") || 0),
    0,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#101828]">
            Affiliate Payouts
          </h1>
          <p className="mt-1 text-[15px] text-[#667085]">
            Pay affiliates instantly in USDC - any amount, no minimum, anywhere.
          </p>
        </div>
        {affiliates.length > 0 && (
          <button
            onClick={() => pay(affiliates)}
            disabled={payingAll || totalPending <= 0}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-[#34c759] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50"
          >
            {payingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Pay all ({fmtUSD(totalPending)})
          </button>
        )}
      </div>

      {flash && (
        <div className="mb-4 rounded-xl border border-[#34c759]/30 bg-[#34c759]/5 px-4 py-2.5 text-sm text-[#027a48]">
          {flash}
        </div>
      )}

      {/* Add affiliate */}
      <div className="mb-6 rounded-2xl border border-[#eaecf0] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Affiliate name"
            className="rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="affiliate@email.com"
            className="rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
          />
          <button
            onClick={addAffiliate}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d0d5dd] px-4 py-2.5 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Affiliate list */}
      {affiliates.length === 0 ? (
        <p className="text-sm text-[#8a8a8a]">
          No affiliates yet. Add one above to pay them in seconds.
        </p>
      ) : (
        <div className="divide-y divide-[#f2f4f7] rounded-2xl border border-[#eaecf0] bg-white">
          {affiliates.map((a) => {
            const result = results.find((r) => r.email === a.email);
            return (
              <div
                key={a.email}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#101828]">{a.name}</p>
                  <p className="truncate text-[12px] text-[#98a2b3]">
                    {a.email}
                  </p>
                  {result?.ok && result.claimUrl && (
                    <a
                      href={result.claimUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium text-[#34c759] hover:underline"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Paid · claim link
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {result && !result.ok && (
                    <p className="mt-0.5 text-[12px] text-[#d92d20]">
                      {result.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#98a2b3]">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={a.commission}
                    onChange={(e) => updateCommission(a.email, e.target.value)}
                    placeholder="0.00"
                    className="w-24 rounded-lg border border-[#d0d5dd] px-2.5 py-1.5 text-sm outline-none focus:border-[#34c759]"
                  />
                </div>
                <button
                  onClick={() => pay([a], a.email)}
                  disabled={payingOne === a.email}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#34c759] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50"
                >
                  {payingOne === a.email ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Pay
                </button>
                <button
                  onClick={() => removeAffiliate(a.email)}
                  aria-label="Remove"
                  className="rounded-lg p-1.5 text-[#98a2b3] hover:bg-[#f2f4f7] hover:text-[#d92d20]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-[13px] text-[#98a2b3]">
        Recipients claim with any Solana wallet - or by email if they don&rsquo;t
        have one yet. Same rails power the{" "}
        <a href="/products/instant-cashout" className="text-[#34c759] hover:underline">
          instant cashout
        </a>{" "}
        for your players. Payouts settle from your treasury balance.
      </p>
    </div>
  );
}
