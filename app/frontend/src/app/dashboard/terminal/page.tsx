"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { QRCodeSVG } from "qrcode.react";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  Loader2,
  Check,
  Wallet,
  QrCode,
  RotateCcw,
  Smartphone,
} from "lucide-react";

type Status = "idle" | "awaiting" | "paid";

const PRESETS = [25, 50, 100, 250];

// Soft elevation - the single biggest "slick" upgrade over flat 1px borders.
const CARD =
  "rounded-3xl bg-white ring-1 ring-black/[0.04] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.18)]";

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function TerminalPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [solanaUrl, setSolanaUrl] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const referenceRef = useRef<PublicKey | null>(null);

  const startSale = () => {
    const value = parseFloat(amount);
    if (!publicKey || !value || value <= 0) return;

    // A unique reference key lets us watch the chain for THIS exact payment
    // (standard Solana Pay pattern).
    const reference = Keypair.generate().publicKey;
    referenceRef.current = reference;

    const params = new URLSearchParams({
      amount: value.toString(),
      "spl-token": USDC_MINT_ADDRESS,
      reference: reference.toBase58(),
      label: "Offbank",
      message: `Payment of ${fmtUSD(value)}`,
    });
    setSolanaUrl(`solana:${publicKey}?${params.toString()}`);
    setPaidAmount(value);
    setStatus("awaiting");
  };

  const reset = () => {
    referenceRef.current = null;
    setSolanaUrl("");
    setAmount("");
    setStatus("idle");
  };

  // Watch the chain for the payment carrying this sale's reference.
  useEffect(() => {
    if (status !== "awaiting" || !referenceRef.current) return;
    const reference = referenceRef.current;
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    let cancelled = false;

    const id = setInterval(async () => {
      try {
        const sigs = await connection.getSignaturesForAddress(reference, {
          limit: 1,
        });
        if (cancelled || sigs.length === 0) return;
        const sig = sigs[0];
        if (sig.err) return;
        if (
          sig.confirmationStatus === "confirmed" ||
          sig.confirmationStatus === "finalized"
        ) {
          cancelled = true;
          clearInterval(id);
          setStatus("paid");
        }
      } catch {
        /* transient RPC error - keep polling */
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status]);

  if (!connected || !publicKey) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34c759]/10">
          <QrCode className="h-7 w-7 text-[#34c759]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#101828]">
          Terminal
        </h1>
        <p className="mt-1.5 text-[15px] text-[#667085]">
          Connect your wallet to take payments.
        </p>
        <button
          onClick={() => openWalletModal(true)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-100 ease-out hover:bg-[#2ba048] active:scale-[0.98]"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#101828]">
          Terminal
        </h1>
        <p className="mt-1 text-[15px] text-[#667085]">
          Customer scans, pays in seconds, settles instantly.
        </p>
      </div>

      {/* ── PAID ─────────────────────────────────────── */}
      {status === "paid" ? (
        <div className={`${CARD} p-12 text-center`}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#34c759] shadow-[0_8px_24px_-6px_rgba(52,199,89,0.5)]"
          >
            <Check className="h-10 w-10 text-white" strokeWidth={2.5} />
          </motion.div>
          <p className="mt-5 text-sm font-medium text-[#2ba048]">
            Payment received
          </p>
          <p className="mt-1 text-5xl font-bold tracking-tight tabular-nums text-[#101828]">
            {fmtUSD(paidAmount)}
          </p>
          <p className="mt-2 text-sm text-[#667085]">
            Settled instantly · no chargebacks
          </p>
          <button
            onClick={reset}
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#101828] px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-100 ease-out hover:bg-[#1d2939] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            New sale
          </button>
        </div>
      ) : status === "awaiting" ? (
        /* ── AWAITING ──────────────────────────────── */
        <div className={`${CARD} p-9 text-center`}>
          <p className="text-[13px] font-medium uppercase tracking-wide text-[#98A2B3]">
            Amount due
          </p>
          <p className="mt-1 text-5xl font-bold tracking-tight tabular-nums text-[#101828]">
            {fmtUSD(paidAmount)}
          </p>
          <div className="mx-auto mt-7 w-fit rounded-2xl bg-white p-5 ring-1 ring-black/[0.05] shadow-[0_2px_8px_rgba(16,24,40,0.06)]">
            <QRCodeSVG value={solanaUrl} size={216} level="M" />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#475467]">
            <Smartphone className="h-4 w-4" />
            Scan with any Solana wallet
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-2 text-sm text-[#98A2B3]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Waiting for payment…
          </div>
          <button
            onClick={reset}
            className="mt-7 text-sm font-medium text-[#98A2B3] transition-colors duration-100 hover:text-[#475467]"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* ── IDLE (enter amount) ───────────────────── */
        <div className={`${CARD} p-8`}>
          <label className="text-[13px] font-medium uppercase tracking-wide text-[#98A2B3]">
            Amount
          </label>
          <div className="mt-2.5 flex items-baseline rounded-2xl bg-[#F9FAFB] px-5 py-4 ring-1 ring-black/[0.05] focus-within:ring-2 focus-within:ring-[#34c759]/40 transition-shadow duration-100">
            <span className="text-3xl font-semibold text-[#98A2B3]">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full bg-transparent pl-2 text-4xl font-bold tracking-tight tabular-nums text-[#101828] outline-none placeholder:text-[#D0D5DD]"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`rounded-xl py-2.5 text-sm font-semibold tabular-nums transition-[transform,background-color,box-shadow] duration-100 ease-out active:scale-[0.97] ${
                  amount === String(p)
                    ? "bg-[#34c759]/10 text-[#2ba048] ring-1 ring-[#34c759]/30"
                    : "bg-[#F9FAFB] text-[#344054] ring-1 ring-black/[0.04] hover:bg-[#F2F4F7]"
                }`}
              >
                ${p}
              </button>
            ))}
          </div>
          <button
            onClick={startSale}
            disabled={!amount || parseFloat(amount) <= 0}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#34c759] py-4 text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(52,199,89,0.55)] transition-[transform,background-color,opacity] duration-100 ease-out hover:bg-[#2ba048] active:scale-[0.99] disabled:opacity-40 disabled:shadow-none"
          >
            <QrCode className="h-4 w-4" />
            Charge{amount && parseFloat(amount) > 0 ? ` ${fmtUSD(parseFloat(amount))}` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
