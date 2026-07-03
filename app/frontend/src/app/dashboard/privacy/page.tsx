"use client";

/**
 * Merchant privacy dashboard.
 *
 * Two responsibilities:
 *   1. Publish (or rotate) the merchant's long-lived X25519
 *      receipt-encryption pubkey by signing a deterministic message
 *      with the connected wallet. The secret key never leaves the
 *      browser; the public key is published to /api/merchants/receipt-key.
 *   2. List encrypted receipts received by this merchant and decrypt
 *      them in-browser using the same derived secret key.
 *
 * Security model:
 *   - The X25519 secret key is derived from a wallet signature over a
 *     fixed, versioned message (RECEIPT_KEY_DERIVATION_MESSAGE). It is
 *     held only in component state and dropped on page unload.
 *   - Decryption is purely client-side. The server never sees plaintext.
 *   - Tamper detection is automatic via NaCl box authentication.
 *   - Losing the wallet = losing the receipts. This is the price of
 *     self-custody and is documented to the merchant.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { solscanUrl } from "@/lib/constants";
import {
  RECEIPT_KEY_DERIVATION_MESSAGE,
  deriveReceiptKeypair,
  decryptReceipt,
  type ReceiptKeypair,
  type EncryptedReceipt,
  type ReceiptPlaintext,
} from "@/lib/receipt-encryption";
import {
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  AlertTriangle,
  Loader2,
  LogIn,
} from "lucide-react";

interface RawReceiptRow {
  payment_id: string;
  customer_wallet: string;
  merchant_wallet: string;
  session_hash: string;
  session_status: string;
  is_delegated: boolean;
  created_at: string;
  status: string;
  ciphertext: string | null;
  encryption_nonce: string | null;
  ephemeral_pubkey: string | null;
  recipient_pubkey: string | null;
  payload_hash: string | null;
  tx_signature: string | null;
  encryption_scheme: number | null;
  encryption_method: string | null;
  payment_timestamp: string | null;
}

interface DecryptedReceipt {
  raw: RawReceiptRow;
  plaintext: ReceiptPlaintext | null;
  decryptError: string | null;
}

export default function PrivacyDashboardPage() {
  const { connected, signMessage, publicKey } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [keypair, setKeypair] = useState<ReceiptKeypair | null>(null);
  const [publishedPubkey, setPublishedPubkey] = useState<string | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<DecryptedReceipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  // ─── Fetch merchant's currently-published pubkey ──────────────
  const refreshPublishedPubkey = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(
        `/api/merchants/receipt-key?wallet=${encodeURIComponent(publicKey)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPublishedPubkey(data.receiptPubkey || null);
      } else if (res.status === 404) {
        setPublishedPubkey(null);
      }
    } catch (err) {
      console.warn("Failed to fetch published pubkey:", err);
    }
  }, [publicKey]);

  useEffect(() => {
    refreshPublishedPubkey();
  }, [refreshPublishedPubkey]);

  // ─── Derive keypair from a wallet signature ───────────────────
  const handleDerive = useCallback(async () => {
    if (!signMessage || !publicKey) {
      setError("Wallet not connected or doesn't support signMessage");
      return;
    }
    setError(null);
    setDeriving(true);
    try {
      const message = new TextEncoder().encode(RECEIPT_KEY_DERIVATION_MESSAGE);
      const signature = await signMessage(message);
      const kp = deriveReceiptKeypair(signature);
      setKeypair(kp);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to derive key - wallet rejected the signature",
      );
    } finally {
      setDeriving(false);
    }
  }, [signMessage, publicKey]);

  // ─── Publish derived pubkey to merchant record ────────────────
  const handlePublish = useCallback(async () => {
    if (!keypair) return;
    setError(null);
    setPublishing(true);
    try {
      const res = await fetch("/api/merchants/receipt-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptPubkey: keypair.publicKey }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Publish failed (${res.status})`);
      }
      await refreshPublishedPubkey();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }, [keypair, refreshPublishedPubkey]);

  // ─── Fetch encrypted receipts and decrypt ─────────────────────
  const refreshReceipts = useCallback(async () => {
    if (!publicKey) return;
    setLoadingReceipts(true);
    try {
      const res = await fetch(
        `/api/privacy/receipt?wallet=${encodeURIComponent(publicKey)}`,
      );
      if (!res.ok) {
        setReceipts([]);
        return;
      }
      const data = await res.json();
      const rows: RawReceiptRow[] = data.receipts || [];

      const decoded: DecryptedReceipt[] = rows.map((raw) => {
        // Only attempt decryption if we have the keypair AND the row
        // is encrypted to our pubkey
        if (
          !keypair ||
          !raw.ciphertext ||
          !raw.encryption_nonce ||
          !raw.ephemeral_pubkey ||
          !raw.recipient_pubkey
        ) {
          return { raw, plaintext: null, decryptError: null };
        }
        if (raw.recipient_pubkey !== keypair.publicKey) {
          return {
            raw,
            plaintext: null,
            decryptError:
              "Receipt was encrypted to a different key (rotated key or wrong wallet).",
          };
        }
        try {
          const encrypted: EncryptedReceipt = {
            ciphertext: raw.ciphertext,
            nonce: raw.encryption_nonce,
            ephemeralPublicKey: raw.ephemeral_pubkey,
            recipientPublicKey: raw.recipient_pubkey,
            version: 1,
          };
          const plaintext = decryptReceipt(encrypted, keypair.secretKey);
          return { raw, plaintext, decryptError: null };
        } catch (err) {
          return {
            raw,
            plaintext: null,
            decryptError:
              err instanceof Error ? err.message : "Decryption failed",
          };
        }
      });
      setReceipts(decoded);
    } finally {
      setLoadingReceipts(false);
    }
  }, [publicKey, keypair]);

  useEffect(() => {
    refreshReceipts();
  }, [refreshReceipts]);

  // ─── Status badges ─────────────────────────────────────────────
  const status = useMemo(() => {
    if (!publicKey) return "disconnected" as const;
    if (!publishedPubkey) return "no_key_published" as const;
    if (!keypair) return "key_published_no_unlock" as const;
    if (keypair.publicKey === publishedPubkey) return "unlocked" as const;
    return "key_mismatch" as const;
  }, [publicKey, publishedPubkey, keypair]);

  // ─── Render ────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center">
          <Lock className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#212121] mb-2">
            Connect wallet
          </h2>
          <p className="text-[#5c5c5c] mb-6">
            Sign in with the merchant wallet to manage receipt encryption.
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
          <ShieldCheck className="w-7 h-7 text-[#34c759]" />
          Private receipts
        </h1>
        <p className="text-[#5c5c5c] text-sm">
          Receipt metadata (memo, line items, customer email) is encrypted to
          your wallet. Only this wallet can decrypt.
        </p>
      </div>

      {/* Key management card */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#212121] flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Encryption key
            </h2>
            <p className="text-[#8a8a8a] text-xs mt-1">
              Derived deterministically from a wallet signature. Same wallet
              always produces the same key.
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Key info rows */}
        <div className="space-y-3 mb-5">
          <KeyRow label="Published pubkey" value={publishedPubkey} />
          {keypair && (
            <KeyRow
              label="Derived pubkey (this session)"
              value={keypair.publicKey}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDerive}
            disabled={deriving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#212121] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {deriving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            {keypair ? "Re-derive key" : "Unlock receipts (sign message)"}
          </button>

          {keypair && keypair.publicKey !== publishedPubkey && (
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
              {publishedPubkey ? "Rotate published key" : "Publish key"}
            </button>
          )}

          <button
            onClick={refreshReceipts}
            disabled={loadingReceipts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] text-[#212121] text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loadingReceipts && <Loader2 className="w-4 h-4 animate-spin" />}
            Refresh receipts
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[#ffefef] border border-[#ffcccc] rounded-lg text-sm text-[#b91c1c] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {status === "key_mismatch" && (
          <div className="mt-4 p-3 bg-[#fff7ed] border border-[#ffd698] rounded-lg text-sm text-[#92400e] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Derived key does not match the currently-published key. Receipts
            from before any rotation may not decrypt with this key. Publish this
            key to rotate, or re-derive with the original wallet.
          </div>
        )}
      </div>

      {/* Receipts list */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#212121] mb-4">
          Encrypted receipts ({receipts.length})
        </h2>

        {loadingReceipts ? (
          <div className="text-[#8a8a8a] text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-[#8a8a8a] text-sm">
            No receipts yet. They appear here as customers pay you in privacy
            mode.
          </div>
        ) : (
          <div className="divide-y divide-[#f0f0f0]">
            {receipts.map((r) => (
              <ReceiptRow
                key={r.raw.payment_id}
                item={r}
                unlocked={!!keypair}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function StatusBadge({
  status,
}: {
  status:
    | "disconnected"
    | "no_key_published"
    | "key_published_no_unlock"
    | "unlocked"
    | "key_mismatch";
}) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    disconnected: { bg: "#f2f2f2", text: "#8a8a8a", label: "Disconnected" },
    no_key_published: {
      bg: "#fff7ed",
      text: "#92400e",
      label: "No key published",
    },
    key_published_no_unlock: {
      bg: "#eff6ff",
      text: "#1e40af",
      label: "Locked - sign to unlock",
    },
    unlocked: { bg: "#ecfdf5", text: "#065f46", label: "Unlocked" },
    key_mismatch: { bg: "#fef2f2", text: "#991b1b", label: "Key mismatch" },
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

function KeyRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-[#8a8a8a] uppercase tracking-wide">{label}</span>
      <code className="font-mono text-[#212121] truncate max-w-[60%]">
        {value || "-"}
      </code>
    </div>
  );
}

function ReceiptRow({
  item,
  unlocked,
}: {
  item: DecryptedReceipt;
  unlocked: boolean;
}) {
  const { raw, plaintext, decryptError } = item;
  const created = new Date(raw.created_at).toLocaleString();
  const isEncrypted = !!raw.ciphertext;

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isEncrypted ? (
              plaintext ? (
                <Unlock className="w-4 h-4 text-[#34c759]" />
              ) : (
                <Lock className="w-4 h-4 text-[#8a8a8a]" />
              )
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#8a8a8a]" />
            )}
            <span className="text-sm font-medium text-[#212121]">
              {plaintext
                ? `$${plaintext.amount.toFixed(2)} ${plaintext.currency}`
                : isEncrypted
                ? "Encrypted receipt"
                : "Unencrypted (legacy)"}
            </span>
            {plaintext?.memo && (
              <span className="text-xs text-[#5c5c5c]">· {plaintext.memo}</span>
            )}
          </div>
          <div className="text-xs text-[#8a8a8a] flex items-center gap-3 flex-wrap">
            <span>{created}</span>
            <span className="font-mono truncate">
              {raw.payment_id.slice(0, 16)}…
            </span>
            {raw.tx_signature && (
              <a
                href={solscanUrl(raw.tx_signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1e40af] hover:underline"
              >
                Solscan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {plaintext?.customerWallet && (
            <div className="text-xs text-[#5c5c5c] mt-1 font-mono truncate">
              From: {plaintext.customerWallet}
            </div>
          )}
          {decryptError && (
            <div className="text-xs text-[#b91c1c] mt-1">{decryptError}</div>
          )}
          {isEncrypted && !plaintext && !decryptError && !unlocked && (
            <div className="text-xs text-[#8a8a8a] mt-1">
              Sign to unlock and decrypt.
            </div>
          )}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full bg-[#f2f2f2] text-[#5c5c5c] flex-shrink-0"
          title={raw.encryption_method || ""}
        >
          {raw.encryption_method === "nacl_box_v1"
            ? "encrypted"
            : raw.encryption_method || "n/a"}
        </span>
      </div>
    </div>
  );
}
