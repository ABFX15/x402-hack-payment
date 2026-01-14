"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Link as LinkIcon,
  DollarSign,
  Store,
  Share2,
  Download,
  Smartphone,
  LogIn,
  Wallet,
} from "lucide-react";

export default function CreatePaymentPage() {
  const { ready, authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [amount, setAmount] = useState<string>("");
  const [merchantName, setMerchantName] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [solanaPayUrl, setSolanaPayUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Generate payment link when amount is entered
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && publicKey) {
      const params = new URLSearchParams({
        amount,
        to: publicKey,
        ...(merchantName && { merchant: merchantName }),
        ...(memo && { memo }),
      });
      // In production, this would be your actual domain
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      // Use embedded wallet checkout for payments
      setPaymentLink(`${baseUrl}/checkout?${params.toString()}`);

      // Generate Solana Pay URL for mobile wallets
      // Format: solana:<recipient>?amount=<amount>&spl-token=<mint>&label=<label>&message=<message>
      const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
      const solanaParams = new URLSearchParams({
        amount: amount,
        "spl-token": USDC_MINT,
        label: merchantName || "Settlr",
        message: memo || `Payment of $${amount} USDC`,
      });
      setSolanaPayUrl(`solana:${publicKey}?${solanaParams.toString()}`);
    } else {
      setPaymentLink(null);
      setSolanaPayUrl(null);
    }
  }, [amount, merchantName, memo, publicKey]);

  const copyToClipboard = async () => {
    if (paymentLink) {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (paymentLink && navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${merchantName || "Merchant"} $${amount} USDC`,
          text: memo || `Payment request for $${amount} USDC`,
          url: paymentLink,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  // Quick amount presets
  const presetAmounts = ["5", "10", "25", "50", "100"];

  // Show login prompt if not connected
  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!authenticated || !connected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Create Payment Links
          </h1>
          <p className="text-zinc-400 mb-8">
            Sign in to create payment links that send USDC directly to your
            wallet.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={login}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In to Continue
          </motion.button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mb-4">
            <LinkIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Create Payment Link
          </h1>
          <p className="text-[var(--text-muted)]">
            Payments go directly to:{" "}
            <span className="font-mono text-purple-400">
              {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
            </span>
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Amount (USDC) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input text-2xl font-bold"
              placeholder="$0.00"
              step="0.01"
              min="0"
            />
            {/* Quick amounts */}
            <div className="flex gap-2 mt-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    amount === preset
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant Name (Optional) */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
              <Store className="w-4 h-4 inline mr-1" />
              Business Name (optional)
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="input"
              placeholder="e.g., Coffee Shop"
            />
          </div>

          {/* Memo (Optional) */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
              Memo (optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="input"
              placeholder="e.g., Order #123"
            />
          </div>

          {/* Generated Link */}
          {paymentLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pt-4 border-t border-[var(--border)] space-y-4"
            >
              {/* QR Code Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(false)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    !showQR
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card)] text-[var(--text-secondary)]"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Link
                </button>
                <button
                  onClick={() => setShowQR(true)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    showQR
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card)] text-[var(--text-secondary)]"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
              </div>

              {showQR ? (
                /* QR Code Display */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-white p-4 rounded-2xl">
                    <QRCodeSVG
                      value={solanaPayUrl || paymentLink}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Scan with Solana Pay compatible wallet
                  </p>
                  <div className="flex gap-3 mt-4 w-full">
                    <button
                      onClick={() => {
                        // Download QR as image
                        const svg = document.querySelector(".bg-white svg");
                        if (svg) {
                          const svgData = new XMLSerializer().serializeToString(
                            svg
                          );
                          const canvas = document.createElement("canvas");
                          const ctx = canvas.getContext("2d");
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = 400;
                            canvas.height = 400;
                            ctx!.fillStyle = "white";
                            ctx!.fillRect(0, 0, 400, 400);
                            ctx!.drawImage(img, 0, 0, 400, 400);
                            const pngFile = canvas.toDataURL("image/png");
                            const downloadLink = document.createElement("a");
                            downloadLink.download = `payment-qr-${amount}usdc.png`;
                            downloadLink.href = pngFile;
                            downloadLink.click();
                          };
                          img.src =
                            "data:image/svg+xml;base64," + btoa(svgData);
                        }
                      }}
                      className="btn-ghost flex-1 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Link Display */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Payment Link
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[var(--card)] rounded-xl p-3 font-mono text-sm text-[var(--text-muted)] overflow-hidden">
                      <span className="truncate block">{paymentLink}</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="btn-ghost px-4 flex items-center gap-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  href={paymentLink.replace(window?.location?.origin || "", "")}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  Open Payment Page
                </Link>
                <button
                  onClick={shareLink}
                  className="btn-ghost px-4 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Info */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Anyone with this link can pay you the specified amount in USDC
        </p>
      </motion.div>
    </main>
  );
}
