"use client";

import { useState, useEffect, useCallback } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "@/lib/constants";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  Send,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Wallet,
  Building2,
  X,
} from "lucide-react";

interface Payee {
  id: string;
  name: string;
  walletAddress: string;
  licenseNumber?: string;
  note?: string;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const shorten = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

export default function SuppliersPage() {
  const { publicKey, connected, signTransaction } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [payees, setPayees] = useState<Payee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", walletAddress: "", licenseNumber: "" });
  const [adding, setAdding] = useState(false);
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});
  const [payingId, setPayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const flash = (kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchPayees = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payees?wallet=${publicKey}`);
      if (res.ok) setPayees((await res.json()).payees || []);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchPayees();
  }, [fetchPayees]);

  const addPayee = async () => {
    if (!publicKey || !form.name.trim() || !form.walletAddress.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/payees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save supplier");
      setForm({ name: "", walletAddress: "", licenseNumber: "" });
      setShowAdd(false);
      flash("ok", `Saved ${data.payee.name}`);
      fetchPayees();
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to save");
    } finally {
      setAdding(false);
    }
  };

  const removePayee = async (id: string) => {
    if (!publicKey) return;
    await fetch(`/api/payees/${id}?wallet=${publicKey}`, { method: "DELETE" });
    fetchPayees();
  };

  const paySupplier = async (payee: Payee) => {
    if (!publicKey || !signTransaction) return;
    const amount = parseFloat(payAmounts[payee.id] || "");
    if (!amount || amount <= 0) {
      flash("err", "Enter an amount to send");
      return;
    }
    setPayingId(payee.id);
    try {
      const res = await fetch("/api/payments/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey, payeeId: payee.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error === "sponsorship_unavailable"
        ? "Gas sponsorship isn't configured yet."
        : data.message || data.error || "Payment failed");

      // Non-custodial: the merchant signs from their own wallet.
      const bytes = Uint8Array.from(atob(data.transaction), (c) => c.charCodeAt(0));
      const tx = Transaction.from(bytes);
      const signed = await signTransaction(tx);

      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      // skipPreflight + retries avoids blockhash-expiry failures from the
      // signing round-trip (esp. Privy email wallets), matching vault creation.
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 5,
      });
      const conf = await connection.confirmTransaction(
        {
          signature: sig,
          blockhash: data.blockhash,
          lastValidBlockHeight: data.lastValidBlockHeight,
        },
        "confirmed",
      );
      if (conf.value.err) {
        throw new Error(
          "Payment didn't settle on-chain - check you hold enough USDC.",
        );
      }

      setPayAmounts((p) => ({ ...p, [payee.id]: "" }));
      flash("ok", `Sent ${fmtUSD(amount)} to ${payee.name}`);
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  if (!connected || !publicKey) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Building2 className="mx-auto h-10 w-10 text-[#94A3B8]" />
        <h1 className="mt-4 text-xl font-bold text-[#212121]">Pay Suppliers</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Connect your wallet to pay suppliers in USD.
        </p>
        <button
          onClick={() => openWalletModal(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Pay Suppliers</h1>
          <p className="mt-0.5 text-sm text-[#94A3B8]">
            Pay distributors and suppliers in USD - instant, no bank, no fees on the rail.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add supplier
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-[#64748B]">Supplier name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Green Valley Distribution"
                className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:border-[#34c759]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B]">Wallet address</label>
              <input
                value={form.walletAddress}
                onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                placeholder="Solana address"
                className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:border-[#34c759]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B]">License # (optional)</label>
              <input
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="C11-0000000-LIC"
                className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus-visible:border-[#34c759]"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={addPayee}
              disabled={adding || !form.name.trim() || !form.walletAddress.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#212121] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save supplier
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:text-[#212121]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[#F1F5F9]" />
          ))}
        </div>
      ) : payees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center">
          <Send className="mx-auto h-8 w-8 text-[#94A3B8]" />
          <p className="mt-3 text-sm font-medium text-[#212121]">No suppliers yet</p>
          <p className="mt-1 text-sm text-[#64748B]">
            Add a distributor or supplier to pay them in USD in two clicks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payees.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-semibold text-[#212121]">{p.name}</div>
                <div className="text-xs text-[#94A3B8]">
                  {shorten(p.walletAddress)}
                  {p.licenseNumber ? ` · ${p.licenseNumber}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8]">$</span>
                  <input
                    type="number"
                    min="0"
                    value={payAmounts[p.id] || ""}
                    onChange={(e) => setPayAmounts((s) => ({ ...s, [p.id]: e.target.value }))}
                    placeholder="0.00"
                    className="w-32 rounded-lg border border-[#E2E8F0] py-2 pl-6 pr-3 text-sm focus-visible:border-[#34c759]"
                  />
                </div>
                <button
                  onClick={() => paySupplier(p)}
                  disabled={payingId === p.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50 transition-colors"
                >
                  {payingId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Pay
                </button>
                <button
                  onClick={() => removePayee(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="rounded-lg p-2 text-[#94A3B8] hover:text-[#e74c3c] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.kind === "ok" ? "bg-[#34c759]" : "bg-[#e74c3c]"
          }`}
        >
          {toast.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
