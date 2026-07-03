"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useWalletSession } from "@/hooks/useWalletSession";
import {
  Loader2,
  Download,
  Banknote,
  CheckCircle2,
  Layers,
  ShieldAlert,
  Wallet,
} from "lucide-react";

interface OfframpReq {
  id: string;
  merchantId: string;
  wallet: string;
  amount: number;
  currency: string;
  method: string;
  licenseNumber?: string | null;
  riskScore?: number;
  status: string;
  createdAt: string;
}
interface Batch {
  id: string;
  requestIds: string[];
  totalAmount: number;
  currency: string;
  status: "open" | "settled";
  wireRef?: string;
  createdAt: string;
}
interface Queue {
  pending: OfframpReq[];
  processing: OfframpReq[];
  batches: Batch[];
  pendingTotal: number;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const shorten = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

export default function OfframpConsolePage() {
  const { connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { status: sessionStatus } = useWalletSession();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Admin gate (mirrors /admin).
  useEffect(() => {
    if (sessionStatus !== "ready") {
      setIsAdmin(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        setIsAdmin(res.ok ? Boolean((await res.json()).isAdmin) : false);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [sessionStatus]);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offramp", { credentials: "include" });
      if (res.ok) setQueue(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadQueue();
  }, [isAdmin, loadQueue]);

  const createBatch = async () => {
    setWorking(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/offramp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // all pending
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create batch");

      // Download the compliance CSV the OTC desk needs to clear the funds.
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offramp-batch-${data.batch.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setMsg(
        `Batch ${data.batch.id} created - ${data.batch.requestIds.length} payouts, ${fmtUSD(
          data.batch.totalAmount,
        )}. Compliance CSV downloaded.`,
      );
      loadQueue();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  };

  const settleBatch = async (batch: Batch) => {
    const wireRef = window.prompt(
      `Wire/ACH reference for batch ${batch.id} (${fmtUSD(batch.totalAmount)})?`,
    );
    if (!wireRef) return;
    setWorking(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/offramp/settle", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: batch.id, wireRef }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Settle failed");
      setMsg(`Batch settled - ${data.settled} payouts marked complete.`);
      loadQueue();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  };

  /* ── gates ── */
  if (!connected) {
    return (
      <Centered>
        <ShieldAlert className="mx-auto h-10 w-10 text-[#94A3B8]" />
        <h1 className="mt-4 text-xl font-bold text-[#212121]">Off-ramp console</h1>
        <p className="mt-1 text-sm text-[#64748B]">Admin only. Connect your wallet.</p>
        <button
          onClick={() => openWalletModal(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048]"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </button>
      </Centered>
    );
  }
  if (sessionStatus !== "ready" || isAdmin === null) {
    return (
      <Centered>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#34c759]" />
        <p className="mt-3 text-sm text-[#64748B]">Verifying admin access…</p>
      </Centered>
    );
  }
  if (!isAdmin) {
    return (
      <Centered>
        <ShieldAlert className="mx-auto h-10 w-10 text-[#e74c3c]" />
        <p className="mt-3 text-sm font-medium text-[#212121]">Not authorized</p>
        <p className="mt-1 text-sm text-[#64748B]">This wallet is not a platform admin.</p>
      </Centered>
    );
  }

  const pending = queue?.pending ?? [];
  const processing = queue?.processing ?? [];
  const openBatches = (queue?.batches ?? []).filter((b) => b.status === "open");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Off-ramp console</h1>
          <p className="mt-0.5 text-sm text-[#94A3B8]">
            Batch pending payouts, export the compliance file for the OTC desk, and
            settle once the wire lands.
          </p>
        </div>
        <button
          onClick={createBatch}
          disabled={working || pending.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50"
        >
          {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
          Batch {pending.length} pending → export
        </button>
      </div>

      {msg && (
        <div className="mb-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#212121]">
          {msg}
        </div>
      )}

      {loading ? (
        <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-[#34c759]" />
      ) : (
        <div className="space-y-8">
          <Section
            title={`Pending - ${fmtUSD(queue?.pendingTotal ?? 0)}`}
            empty="No pending payouts."
            rows={pending}
          />
          <Section title="Processing (handed to desk)" empty="None in flight." rows={processing} />

          <div>
            <h2 className="mb-3 text-sm font-semibold text-[#212121]">Open batches</h2>
            {openBatches.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No open batches.</p>
            ) : (
              <div className="space-y-2">
                {openBatches.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-4"
                  >
                    <div>
                      <div className="font-semibold text-[#212121]">
                        {fmtUSD(b.totalAmount)} · {b.requestIds.length} payouts
                      </div>
                      <div className="text-xs text-[#94A3B8]">{b.id}</div>
                    </div>
                    <button
                      onClick={() => settleBatch(b)}
                      disabled={working}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#34c759] px-3 py-1.5 text-sm font-semibold text-[#2ba048] hover:bg-[#34c759]/5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Settle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: OfframpReq[];
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#212121]">
        <Banknote className="h-4 w-4 text-[#94A3B8]" />
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">{empty}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-left text-xs text-[#64748B]">
              <tr>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">License #</th>
                <th className="px-4 py-2">Wallet</th>
                <th className="px-4 py-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#212121]">{fmtUSD(r.amount)}</td>
                  <td className="px-4 py-2 text-[#64748B]">{r.method}</td>
                  <td className="px-4 py-2 text-[#64748B]">{r.licenseNumber || "-"}</td>
                  <td className="px-4 py-2 text-[#64748B]">{shorten(r.wallet)}</td>
                  <td className="px-4 py-2 text-[#64748B]">{r.riskScore ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md py-20 text-center">{children}</div>;
}
