"use client";

/**
 * Cloak - shielded payments dashboard.
 *
 * One page, two responsibilities (mirroring /dashboard/privacy):
 *
 *   1. KEY SETUP
 *      Derive the merchant's Cloak keys from a wallet signature, publish
 *      the viewing key (`nk`) to /api/merchants/cloak-key, and register
 *      it with the Cloak relay so payers can transact.
 *
 *   2. INBOX
 *      Scan the on-chain Cloak program for chain notes encrypted to this
 *      merchant's `nk` and render a decrypted, sorted history of incoming
 *      private payments. The scan is fully client-side - only the merchant
 *      ever sees plaintext amounts.
 *
 * The spend secret is derived on demand from `SETTLR_SIGN_IN_MESSAGE`
 * and never leaves the browser. Only the publishable `nk` is stored
 * server-side.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { solscanUrl, USDC_MINT } from "@/lib/constants";
import {
  deriveMerchantCloakKeys,
  nkFromHex,
  registerMerchantViewingKey,
  scanMerchantInbox,
  buildComplianceReport,
  buildComplianceCsv,
  getCloakConfig,
  getSettlrSignInMessage,
  payInvoicePrivately,
  type MerchantCloakKeys,
} from "@/lib/cloak";
import type { ScanResult } from "@cloak.dev/sdk";
import {
  EyeOff,
  Eye,
  KeyRound,
  Loader2,
  AlertTriangle,
  LogIn,
  Download,
  ExternalLink,
  RefreshCcw,
  CheckCircle2,
  Send,
  Trash2,
} from "lucide-react";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

type SetupStatus =
  | "disconnected"
  | "no_key_published"
  | "published_locked"
  | "unlocked";

export default function CloakDashboardPage() {
  // signMessage is unified (works for Privy email wallets too). The
  // experimental batch-send still uses the adapter's generic versioned-tx
  // signer; that path is extension-wallet only for now.
  const { connected, signTransaction } = useWallet();
  const { publicKey, signMessage } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [keys, setKeys] = useState<MerchantCloakKeys | null>(null);
  const [publishedNk, setPublishedNk] = useState<string | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Batch payout state
  const [batchCsv, setBatchCsv] = useState(
    "# recipient_wallet,amount_usdc\n# Example:\n# 7XyZ...abc,250.00\n",
  );
  const [batchSending, setBatchSending] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<
    Array<{
      recipient: string;
      amount: number;
      signature?: string;
      error?: string;
    }>
  >([]);

  // ─── Fetch published nk for status ────────────────────────────
  const refreshPublishedNk = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(
        `/api/merchants/cloak-key?wallet=${encodeURIComponent(publicKey)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPublishedNk(data.cloakViewingNk || null);
      } else if (res.status === 404) {
        setPublishedNk(null);
      }
    } catch (err) {
      console.warn("[cloak] published-nk fetch failed:", err);
    }
  }, [publicKey]);

  useEffect(() => {
    refreshPublishedNk();
  }, [refreshPublishedNk]);

  // ─── Derive ───────────────────────────────────────────────────
  const handleDerive = useCallback(async () => {
    if (!signMessage || !publicKey) {
      setError("Wallet not connected or doesn't support signMessage.");
      return;
    }
    setError(null);
    setDeriving(true);
    try {
      const sig = await signMessage(getSettlrSignInMessage());
      const derived = await deriveMerchantCloakKeys(sig);
      setKeys(derived);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to derive Cloak keys - wallet rejected the signature.",
      );
    } finally {
      setDeriving(false);
    }
  }, [signMessage, publicKey]);

  // ─── Publish ──────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!keys) return;
    setError(null);
    setPublishing(true);
    try {
      const res = await fetch("/api/merchants/cloak-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloakViewingNk: keys.nkHex }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Publish failed (${res.status})`);
      }
      await refreshPublishedNk();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }, [keys, refreshPublishedNk]);

  // ─── Register with Cloak relay ────────────────────────────────
  const handleRegister = useCallback(async () => {
    if (!keys || !publicKey || !signMessage) return;
    setError(null);
    setRegistering(true);
    try {
      const { PublicKey } = await import("@solana/web3.js");
      await registerMerchantViewingKey({
        walletPublicKey: new PublicKey(publicKey),
        nk: keys.nk,
        signMessage,
      });
      setRegistered(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Relay registration failed: ${err.message}`
          : "Relay registration failed",
      );
    } finally {
      setRegistering(false);
    }
  }, [keys, publicKey, signMessage]);

  // ─── Scan inbox ───────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    if (!publishedNk) {
      setError("Publish your viewing key before scanning.");
      return;
    }
    setError(null);
    setScanning(true);
    setScanProgress("Connecting…");
    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const result = await scanMerchantInbox({
        connection,
        merchantNk: nkFromHex(publishedNk),
        merchantWalletBase58: publicKey ?? undefined,
        limit: 1000,
        onProgress: (p, t) =>
          setScanProgress(`Scanned ${p}/${t} transactions…`),
      });
      setScan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
      setScanProgress(null);
    }
  }, [publishedNk, publicKey]);

  // ─── Compliance CSV download ──────────────────────────────────
  const handleDownloadCsv = useCallback(() => {
    if (!scan) return;
    const csv = buildComplianceCsv(buildComplianceReport(scan));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cloak-compliance-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scan]);

  const status = useMemo<SetupStatus>(() => {
    if (!publicKey) return "disconnected";
    if (!publishedNk) return "no_key_published";
    if (!keys) return "published_locked";
    return "unlocked";
  }, [publicKey, publishedNk, keys]);

  // ─── Private batch payout ─────────────────────────────────────
  // Parse a CSV-style textarea (one `wallet,amount` per line, # for
  // comments) and disburse each row through the Cloak shielded pool.
  // Each row is a fresh ephemeral deposit + immediate withdraw, so
  // the *full set* of recipients/amounts stays unlinkable on-chain
  // even though they all originate from the same merchant wallet.
  const handleBatchSend = useCallback(async () => {
    if (!publicKey || !signTransaction || !signMessage) {
      setError("Wallet not ready for signing.");
      return;
    }
    const rows: Array<{ recipient: string; amount: number }> = [];
    for (const rawLine of batchCsv.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const [walletStr, amountStr] = line.split(",").map((s) => s.trim());
      if (!walletStr || !amountStr) continue;
      const amount = Number(amountStr);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError(`Invalid amount on line: ${line}`);
        return;
      }
      try {
        const { PublicKey } = await import("@solana/web3.js");
        new PublicKey(walletStr); // validate
      } catch {
        setError(`Invalid wallet on line: ${line}`);
        return;
      }
      rows.push({ recipient: walletStr, amount });
    }
    if (rows.length === 0) {
      setError("No valid rows to send.");
      return;
    }
    setError(null);
    setBatchSending(true);
    setBatchResults([]);
    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const { PublicKey } = await import("@solana/web3.js");
      const out: typeof batchResults = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        setBatchProgress(
          `Sending ${i + 1} of ${rows.length} \u2014 $${r.amount.toFixed(
            2,
          )} \u2192 ${r.recipient.slice(0, 8)}\u2026`,
        );
        try {
          // Each recipient needs to have published a Cloak viewing key
          // (so the chain note encrypts to them). Look it up; fall back
          // to the merchant's *own* nk if the recipient hasn't \u2014 the
          // funds still land but only *we* can audit them.
          let recipientNkHex: string;
          try {
            const ckRes = await fetch(
              `/api/merchants/cloak-key?wallet=${encodeURIComponent(
                r.recipient,
              )}`,
            );
            if (ckRes.ok) {
              const ckBody = await ckRes.json();
              recipientNkHex = ckBody.cloakViewingNk || publishedNk!;
            } else {
              recipientNkHex = publishedNk!;
            }
          } catch {
            recipientNkHex = publishedNk!;
          }

          const result = await payInvoicePrivately({
            connection,
            payerPublicKey: publicKey
              ? new PublicKey(publicKey)
              : new PublicKey(""),
            signTransaction,
            signMessage,
            merchantRecipient: new PublicKey(r.recipient),
            merchantNkHex: recipientNkHex,
            mint: USDC_MINT,
            amountBaseUnits: BigInt(Math.round(r.amount * 1_000_000)),
            onProgress: (s) =>
              setBatchProgress(`(${i + 1}/${rows.length}) ${s}`),
          });
          out.push({
            recipient: r.recipient,
            amount: r.amount,
            signature: result.withdrawSignature,
          });
        } catch (err) {
          out.push({
            recipient: r.recipient,
            amount: r.amount,
            error: err instanceof Error ? err.message : "send failed",
          });
        }
        setBatchResults([...out]);
      }
      setBatchProgress(
        `Done. ${out.filter((r) => r.signature).length}/${
          rows.length
        } succeeded.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch send failed");
    } finally {
      setBatchSending(false);
    }
    // batchResults intentionally not in deps \u2014 we mutate via setBatchResults.
     
  }, [batchCsv, publicKey, signTransaction, signMessage, publishedNk]);

  const cfg = getCloakConfig();

  if (!connected) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center">
          <EyeOff className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#212121] mb-2">
            Connect wallet
          </h2>
          <p className="text-[#5c5c5c] mb-6">
            Sign in with the merchant wallet to enable shielded payments via
            Cloak.
          </p>
          <button
            onClick={() => openWalletModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#212121] text-white font-semibold rounded-xl hover:opacity-90"
          >
            <LogIn className="w-5 h-5" /> Connect wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#212121] mb-1 flex items-center gap-2">
          <EyeOff className="w-7 h-7 text-[#1e40af]" />
          Cloak - shielded payments
        </h1>
        <p className="text-[#5c5c5c] text-sm">
          Accept ZK-private USDC payments. Amounts and counterparties are hidden
          from the public ledger; only this wallet&apos;s viewing key reveals
          the audit trail.
        </p>
      </div>

      {/* Setup card */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#212121] flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Viewing key
            </h2>
            <p className="text-[#8a8a8a] text-xs mt-1">
              Derived deterministically from your wallet signature. The spend
              secret never leaves the browser.
            </p>
          </div>
          <SetupBadge status={status} />
        </div>

        <div className="space-y-3 mb-5">
          <KeyRow label="Published nk" value={publishedNk} />
          {keys && (
            <KeyRow label="Derived nk (this session)" value={keys.nkHex} />
          )}
          <KeyRow label="Cloak relay" value={cfg.relayUrl} mono={false} />
          <KeyRow label="Program" value={cfg.programId.toBase58()} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDerive}
            disabled={deriving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {deriving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {keys ? "Re-derive key" : "Unlock (sign message)"}
          </button>

          {keys && keys.nkHex !== publishedNk && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#34c759] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {publishedNk ? "Rotate published key" : "Publish key"}
            </button>
          )}

          {keys && (
            <button
              onClick={handleRegister}
              disabled={registering || registered}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {registering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : registered ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {registered ? "Registered with relay" : "Register with relay"}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[#ffefef] border border-[#ffcccc] rounded-lg text-sm text-[#b91c1c] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Inbox card */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#212121]">
              Private payment inbox
            </h2>
            <p className="text-[#8a8a8a] text-xs mt-1">
              Scans on-chain Cloak chain notes encrypted to your viewing key.
              Fully client-side - Offbank never sees plaintext.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleScan}
              disabled={!publishedNk || scanning}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] text-[#212121] text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {scanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              Scan
            </button>
            {scan && scan.transactions.length > 0 && (
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-medium rounded-lg hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Compliance CSV
              </button>
            )}
          </div>
        </div>

        {scanProgress && (
          <div className="mb-3 text-xs text-[#5c5c5c]">{scanProgress}</div>
        )}

        {scan && (
          <SummaryRow
            deposits={scan.summary.totalDeposits}
            withdrawals={scan.summary.totalWithdrawals}
            fees={scan.summary.totalFees}
            count={scan.summary.transactionCount}
          />
        )}

        {scan && scan.transactions.length === 0 && (
          <div className="text-[#8a8a8a] text-sm">
            No private payments found yet for this viewing key.
          </div>
        )}

        {scan && scan.transactions.length > 0 && (
          <div className="divide-y divide-[#f0f0f0] mt-4">
            {scan.transactions.map((t, i) => (
              <TxRow key={`${t.signature ?? i}`} tx={t} />
            ))}
          </div>
        )}

        {!scan && !scanning && (
          <div className="text-[#8a8a8a] text-sm">
            {publishedNk
              ? "Press Scan to fetch your private inbox."
              : "Publish a viewing key first to enable scanning."}
          </div>
        )}
      </div>

      {/* Private batch payout card */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#212121] flex items-center gap-2">
            <Send className="w-5 h-5" />
            Private batch payout
          </h2>
          <p className="text-[#8a8a8a] text-xs mt-1">
            Disburse USDC to many recipients via the Cloak shielded pool. Each
            row is a fresh ephemeral deposit + immediate withdraw, so individual
            payments stay unlinkable on-chain. One line per recipient:{" "}
            <code>wallet,amount</code>. Lines beginning with <code>#</code> are
            ignored.
          </p>
        </div>
        <textarea
          value={batchCsv}
          onChange={(e) => setBatchCsv(e.target.value)}
          spellCheck={false}
          rows={6}
          className="w-full font-mono text-xs p-3 rounded-lg border border-[#d3d3d3] bg-[#fafafa] outline-none focus:border-[#1e40af] mb-3"
          placeholder="wallet,amount"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleBatchSend}
            disabled={!publishedNk || batchSending || !signTransaction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {batchSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send batch privately
          </button>
          {batchResults.length > 0 && (
            <button
              onClick={() => setBatchResults([])}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs text-[#5c5c5c] hover:text-[#212121]"
            >
              <Trash2 className="w-3 h-3" /> Clear results
            </button>
          )}
          {batchProgress && (
            <span className="text-xs text-[#5c5c5c]">{batchProgress}</span>
          )}
        </div>
        {batchResults.length > 0 && (
          <div className="mt-4 divide-y divide-[#f0f0f0] border-t border-[#f0f0f0]">
            {batchResults.map((r, i) => (
              <div
                key={`${r.recipient}-${i}`}
                className="py-2 flex items-center justify-between text-xs gap-3"
              >
                <code className="font-mono text-[#212121] truncate">
                  {r.recipient.slice(0, 12)}…
                </code>
                <span className="text-[#5c5c5c]">${r.amount.toFixed(2)}</span>
                {r.signature ? (
                  <a
                    href={solscanUrl(r.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#065f46]"
                  >
                    sent <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[#b91c1c]">{r.error || "failed"}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function SetupBadge({ status }: { status: SetupStatus }) {
  const styles: Record<
    SetupStatus,
    { bg: string; text: string; label: string }
  > = {
    disconnected: { bg: "#f2f2f2", text: "#8a8a8a", label: "Disconnected" },
    no_key_published: {
      bg: "#fff7ed",
      text: "#92400e",
      label: "Not published",
    },
    published_locked: {
      bg: "#eff6ff",
      text: "#1e40af",
      label: "Locked - sign to unlock",
    },
    unlocked: { bg: "#ecfdf5", text: "#065f46", label: "Unlocked" },
  };
  const s = styles[status];
  return (
    <span
      className="text-xs font-medium px-3 py-1 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function KeyRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-[#8a8a8a] uppercase tracking-wide">{label}</span>
      <code
        className={`${
          mono ? "font-mono" : ""
        } text-[#212121] truncate max-w-[60%]`}
      >
        {value || "-"}
      </code>
    </div>
  );
}

function SummaryRow({
  deposits,
  withdrawals,
  fees,
  count,
}: {
  deposits: bigint;
  withdrawals: bigint;
  fees: bigint;
  count: number;
}) {
  // Cloak amounts are in lamports for SOL or token base units. We assume
  // USDC (6 decimals) for display since that's the Offbank default.
  const fmt = (b: bigint) => (Number(b) / 1_000_000).toFixed(2);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
      <Stat label="Deposits" value={`$${fmt(deposits)}`} />
      <Stat label="Withdrawals" value={`$${fmt(withdrawals)}`} />
      <Stat label="Fees paid" value={`$${fmt(fees)}`} />
      <Stat label="Transactions" value={String(count)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#fafafa] border border-[#eee] rounded-lg px-3 py-2">
      <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-semibold text-[#212121]">{value}</div>
    </div>
  );
}

function TxRow({ tx }: { tx: ScanResult["transactions"][number] }) {
  const ts = tx.timestamp
    ? new Date(Number(tx.timestamp) * 1000).toLocaleString()
    : "-";
  const amount = (Number(tx.amount) / 1_000_000).toFixed(2);
  return (
    <div className="py-3 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#212121]">
          {tx.txType} · ${amount}
        </div>
        <div className="text-xs text-[#8a8a8a] flex items-center gap-3 flex-wrap">
          <span>{ts}</span>
          {tx.signature && (
            <a
              href={solscanUrl(tx.signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1e40af] hover:underline"
            >
              Solscan <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
