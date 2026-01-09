"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import { TokenInfo, SOLANA_TOKENS, USDC_MINT } from "@/lib/jupiter";
import Image from "next/image";

interface TokenSelectorProps {
  selectedToken: TokenInfo;
  availableTokens: TokenInfo[];
  onSelectToken: (token: TokenInfo) => void;
  balance?: number;
  requiredAmount?: string;
  isLoadingQuote?: boolean;
  disabled?: boolean;
  showBalance?: boolean;
}

export function TokenSelector({
  selectedToken,
  availableTokens,
  onSelectToken,
  balance = 0,
  requiredAmount,
  isLoadingQuote = false,
  disabled = false,
  showBalance = true,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasEnoughBalance =
    !requiredAmount || balance >= parseFloat(requiredAmount);
  const isUsdc = selectedToken.mint === USDC_MINT;

  return (
    <div className="relative">
      {/* Selected Token Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
                    w-full flex items-center justify-between gap-3 
                    px-4 py-3 rounded-xl border transition-all
                    ${
                      disabled
                        ? "bg-zinc-900/50 border-zinc-800 cursor-not-allowed opacity-60"
                        : "bg-zinc-900 border-zinc-700 hover:border-purple-500/50 cursor-pointer"
                    }
                `}
      >
        <div className="flex items-center gap-3">
          {/* Token Logo */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
            {selectedToken.logoURI ? (
              <Image
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                {selectedToken.symbol.slice(0, 2)}
              </div>
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {selectedToken.symbol}
              </span>
              {isLoadingQuote && (
                <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
              )}
            </div>
            {showBalance && (
              <div className="text-xs text-zinc-500">
                Balance:{" "}
                {balance.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}{" "}
                {selectedToken.symbol}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Required Amount Display */}
          {requiredAmount && !isUsdc && (
            <div
              className={`text-right ${
                hasEnoughBalance ? "text-green-400" : "text-red-400"
              }`}
            >
              <div className="text-sm font-medium">
                {parseFloat(requiredAmount).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}
              </div>
              <div className="text-xs opacity-60">needed</div>
            </div>
          )}

          <ChevronDown
            className={`w-5 h-5 text-zinc-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Insufficient Balance Warning */}
      {requiredAmount && !hasEnoughBalance && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>
            Insufficient {selectedToken.symbol}. Need {requiredAmount}, have{" "}
            {balance.toFixed(4)}
          </span>
        </motion.div>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="py-2 max-h-64 overflow-y-auto">
                {availableTokens.map((token) => {
                  const isSelected = token.mint === selectedToken.mint;

                  return (
                    <button
                      key={token.mint}
                      type="button"
                      onClick={() => {
                        onSelectToken(token);
                        setIsOpen(false);
                      }}
                      className={`
                                                w-full flex items-center justify-between gap-3 px-4 py-3
                                                transition-colors
                                                ${
                                                  isSelected
                                                    ? "bg-purple-500/20 text-purple-300"
                                                    : "hover:bg-zinc-800 text-white"
                                                }
                                            `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Token Logo */}
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                          {token.logoURI ? (
                            <Image
                              src={token.logoURI}
                              alt={token.symbol}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                              {token.symbol.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <div className="text-left">
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-zinc-500">
                            {token.name}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500 text-center">
                Swap powered by Jupiter
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for inline use
export function TokenBadge({ token }: { token: TokenInfo }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-full text-sm">
      <div className="w-4 h-4 rounded-full overflow-hidden bg-zinc-700">
        {token.logoURI && (
          <Image
            src={token.logoURI}
            alt={token.symbol}
            width={16}
            height={16}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <span className="font-medium text-white">{token.symbol}</span>
    </div>
  );
}

export default TokenSelector;
