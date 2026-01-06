"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, ExternalLink, Loader2 } from "lucide-react";

interface FiatOnRampProps {
  walletAddress: string;
  defaultAmount?: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

/**
 * Fiat On-Ramp Component
 * Allows users to buy USDC with credit/debit cards via Moonpay
 */
export function FiatOnRamp({
  walletAddress,
  defaultAmount = 50,
  onSuccess,
  onClose,
}: FiatOnRampProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(defaultAmount);
  const [isLoading, setIsLoading] = useState(false);

  // Moonpay widget URL with parameters
  // In production, you'd use signed URLs from your backend for security
  const getMoonpayUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "pk_test_key";
    const baseUrl = "https://buy-sandbox.moonpay.com"; // Use buy.moonpay.com for production

    const params = new URLSearchParams({
      apiKey,
      currencyCode: "usdc_sol", // USDC on Solana
      walletAddress,
      baseCurrencyAmount: amount.toString(),
      baseCurrencyCode: "usd",
      colorCode: "#a855f7", // Pink accent to match your theme
      theme: "dark",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsLoading(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const quickAmounts = [25, 50, 100, 250];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
      >
        <CreditCard className="w-5 h-5" />
        Buy USDC with Card
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Buy USDC
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Pay with card via Moonpay
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Amount Selection */}
              <div className="p-4 border-b border-zinc-800">
                <label className="block text-sm text-zinc-400 mb-2">
                  Amount (USD)
                </label>
                <div className="flex gap-2 mb-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        amount === amt
                          ? "bg-purple-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={10}
                  max={10000}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Moonpay Widget */}
              <div className="relative" style={{ height: "500px" }}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                      <p className="text-zinc-400">Loading payment...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={getMoonpayUrl()}
                  title="Moonpay Widget"
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; camera; gyroscope; payment"
                  onLoad={() => setIsLoading(false)}
                  className="border-0"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    Powered by{" "}
                    <a
                      href="https://moonpay.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white inline-flex items-center gap-1"
                    >
                      Moonpay <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                  <span className="text-zinc-500">
                    USDC will be sent to your wallet
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Simple button version for inline use
 */
export function BuyUSDCButton({
  walletAddress,
  className = "",
}: {
  walletAddress: string;
  className?: string;
}) {
  const [showOnRamp, setShowOnRamp] = useState(false);

  if (showOnRamp) {
    return (
      <FiatOnRamp
        walletAddress={walletAddress}
        onClose={() => setShowOnRamp(false)}
      />
    );
  }

  return (
    <button
      onClick={() => setShowOnRamp(true)}
      className={`flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all ${className}`}
    >
      <CreditCard className="w-4 h-4" />
      Buy USDC
    </button>
  );
}

export default FiatOnRamp;
