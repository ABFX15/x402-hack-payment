"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet, X, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { createContext, useContext } from "react";

const NAVY = "#212121";
const MUTED = "#8a8a8a";
const GREEN = "#34c759";
const BORDER = "#d3d3d3";

interface WalletModalContextState {
  visible: boolean;
  setVisible: (open: boolean) => void;
}

const WalletModalContext = createContext<WalletModalContextState>({
  visible: false,
  setVisible: () => {},
});

export const useWalletModal = () => useContext(WalletModalContext);

export const WalletModalProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <WalletModalContext.Provider value={{ visible, setVisible }}>
      {children}
      <WalletModal visible={visible} onClose={() => setVisible(false)} />
    </WalletModalContext.Provider>
  );
};

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
}

const WalletModal: FC<WalletModalProps> = ({ visible, onClose }) => {
  const { wallets, select, connect, wallet, connecting, connected } =
    useWallet();

  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (connected && visible) {
      const t = setTimeout(onClose, 250);
      return () => clearTimeout(t);
    }
  }, [connected, visible, onClose]);

  useEffect(() => {
    if (visible) {
      setSelectedWallet(null);
      setConnectError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  // After `select(name)` completes, the wallet-adapter swaps `wallet` to
  // the chosen adapter on the next render. With autoConnect disabled
  // (e.g. on /login) we have to explicitly call connect() - otherwise
  // the wallet popup never fires. Trigger it once the selected adapter
  // has actually been wired up.
  useEffect(() => {
    if (!selectedWallet) return;
    if (!wallet || wallet.adapter.name !== selectedWallet) return;
    if (connected || connecting) return;
    connect().catch((err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setConnectError(msg);
      setSelectedWallet(null);
    });
  }, [selectedWallet, wallet, connect, connected, connecting]);

  const handleSelect = useCallback(
    (walletName: WalletName) => {
      setConnectError(null);
      setSelectedWallet(walletName);
      select(walletName);
    },
    [select],
  );

  const sorted = [...wallets].sort((a, b) => {
    const order = (state: WalletReadyState) => {
      if (state === WalletReadyState.Installed) return 0;
      if (state === WalletReadyState.Loadable) return 1;
      return 2;
    };
    return order(a.readyState) - order(b.readyState);
  });

  const installed = sorted.filter(
    (w) => w.readyState === WalletReadyState.Installed,
  );
  const available = sorted.filter(
    (w) =>
      w.readyState === WalletReadyState.Loadable ||
      w.readyState === WalletReadyState.NotDetected,
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: "rgba(12, 24, 41, 0.4)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-xl"
            style={{ borderColor: BORDER }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: NAVY, fontFamily: "var(--font-heading)" }}
                >
                  Connect Wallet
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
                  Choose a wallet to continue
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f2f2f2]"
                aria-label="Close"
              >
                <X className="h-4 w-4" style={{ color: MUTED }} />
              </button>
            </div>

            <div className="px-4 pb-2 pt-3">
              {installed.length > 0 && (
                <div className="mb-3">
                  <p
                    className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: MUTED }}
                  >
                    Detected
                  </p>
                  <div className="space-y-1">
                    {installed.map((w) => (
                      <WalletRow
                        key={w.adapter.name}
                        name={w.adapter.name}
                        icon={w.adapter.icon}
                        readyState={w.readyState}
                        connecting={
                          connecting && selectedWallet === w.adapter.name
                        }
                        onClick={() => handleSelect(w.adapter.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {available.length > 0 && (
                <div className="mb-2">
                  {installed.length > 0 && (
                    <p
                      className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: MUTED }}
                    >
                      More wallets
                    </p>
                  )}
                  <div className="space-y-1">
                    {available.map((w) => (
                      <WalletRow
                        key={w.adapter.name}
                        name={w.adapter.name}
                        icon={w.adapter.icon}
                        readyState={w.readyState}
                        connecting={
                          connecting && selectedWallet === w.adapter.name
                        }
                        onClick={() => {
                          if (w.readyState === WalletReadyState.NotDetected) {
                            window.open(w.adapter.url, "_blank", "noopener");
                          } else {
                            handleSelect(w.adapter.name);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {connectError && (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {connectError}
                </p>
              )}

              {wallets.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: "rgba(27,107,74,0.06)" }}
                  >
                    <AlertCircle className="h-6 w-6" style={{ color: MUTED }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: NAVY }}>
                      No wallets found
                    </p>
                    <p className="mt-1 text-xs" style={{ color: MUTED }}>
                      Install{" "}
                      <a
                        href="https://phantom.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: GREEN }}
                      >
                        Phantom
                      </a>{" "}
                      or{" "}
                      <a
                        href="https://solflare.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: GREEN }}
                      >
                        Solflare
                      </a>{" "}
                      to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="border-t px-6 py-3 text-center"
              style={{ borderColor: BORDER }}
            >
              <p className="text-[10px]" style={{ color: MUTED }}>
                Powered by{" "}
                <span
                  style={{ color: GREEN, fontFamily: "var(--font-heading)" }}
                >
                  offbank
                </span>{" "}
                · Non-custodial
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface WalletRowProps {
  name: string;
  icon: string;
  readyState: WalletReadyState;
  connecting: boolean;
  onClick: () => void;
}

const WalletRow: FC<WalletRowProps> = ({
  name,
  icon,
  readyState,
  connecting,
  onClick,
}) => {
  const isInstalled = readyState === WalletReadyState.Installed;
  const isNotDetected = readyState === WalletReadyState.NotDetected;

  return (
    <button
      onClick={onClick}
      disabled={connecting}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-[#f7f7f7] active:scale-[0.98] disabled:opacity-60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f7f7f7] p-1.5">
        {icon.startsWith("data:") || icon.startsWith("http") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt={name} className="h-full w-full object-contain" />
        ) : (
          <Wallet className="h-5 w-5" style={{ color: MUTED }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: NAVY }}>
          {name}
        </p>
        {isInstalled && (
          <p className="text-[10px] font-medium" style={{ color: GREEN }}>
            Detected
          </p>
        )}
        {isNotDetected && (
          <p className="text-[10px]" style={{ color: MUTED }}>
            Install →
          </p>
        )}
      </div>

      {connecting ? (
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: GREEN }} />
      ) : (
        <ChevronRight className="h-4 w-4" style={{ color: MUTED }} />
      )}
    </button>
  );
};
