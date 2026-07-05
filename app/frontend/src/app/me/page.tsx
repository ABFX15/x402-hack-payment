"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { explorerUrl } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecipientProfile {
  id: string;
  email: string;
  walletAddress: string;
  displayName?: string;
  notificationsEnabled: boolean;
  autoWithdraw: boolean;
  totalReceived: number;
  totalPayouts: number;
  createdAt: string;
  lastPayoutAt?: string;
}

interface PayoutRecord {
  id: string;
  amount: number;
  currency: string;
  memo?: string;
  status: string;
  txSignature?: string;
  createdAt: string;
  claimedAt?: string;
}

interface BalanceInfo {
  currency: string;
  amount: number;
}

type DashboardStep =
  | "email"
  | "check-email"
  | "loading"
  | "dashboard"
  | "error";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function RecipientDashboard() {
  const [step, setStep] = useState<DashboardStep>("email");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<RecipientProfile | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingWallet, setEditingWallet] = useState(false);
  const [newWallet, setNewWallet] = useState("");
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Check for magic link token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      validateToken(token);
    }
  }, []);

  async function validateToken(token: string) {
    setStep("loading");
    try {
      const res = await fetch(`/api/recipients/auth?token=${token}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Invalid or expired link");
        setStep("error");
        return;
      }
      // Store email for subsequent requests
      setEmail(data.email);
      sessionStorage.setItem("offbank_recipient_email", data.email);
      // Clean URL
      window.history.replaceState({}, "", "/me");
      await loadDashboard(data.email);
    } catch {
      setErrorMessage("Failed to validate link");
      setStep("error");
    }
  }

  async function requestMagicLink() {
    if (!email || !email.includes("@")) return;
    try {
      const res = await fetch("/api/recipients/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep("check-email");
      }
    } catch {
      setErrorMessage("Failed to send sign-in link");
      setStep("error");
    }
  }

  const loadDashboard = useCallback(async (recipientEmail: string) => {
    setStep("loading");
    try {
      const res = await fetch("/api/recipients/me", {
        headers: { "x-recipient-email": recipientEmail },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to load dashboard");
        setStep("error");
        return;
      }
      setProfile(data.profile);
      setPayouts(data.payouts || []);
      setBalance(data.balance || null);
      setStep("dashboard");
    } catch {
      setErrorMessage("Failed to load dashboard");
      setStep("error");
    }
  }, []);

  // Check for stored session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("offbank_recipient_email");
    if (stored && step === "email") {
      setEmail(stored);
      loadDashboard(stored);
    }
  }, [step, loadDashboard]);

  async function updatePreferences(updates: Record<string, unknown>) {
    if (!email) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipients/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-recipient-email": email,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, ...data } : prev));
        setEditingWallet(false);
      }
    } catch {
      // Silently fail preference update
    } finally {
      setSaving(false);
    }
  }

  async function handleWithdraw() {
    if (!email || !balance || balance.amount <= 0) return;
    setWithdrawing(true);
    try {
      const res = await fetch("/api/recipients/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-recipient-email": email,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setBalance({ currency: "USDC", amount: data.remainingBalance });
        // Refresh dashboard
        await loadDashboard(email);
      }
    } catch {
      // Silently fail
    } finally {
      setWithdrawing(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem("offbank_recipient_email");
    setStep("email");
    setProfile(null);
    setPayouts([]);
    setBalance(null);
    setEmail("");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#212121] flex items-start justify-center pt-12 px-4 pb-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#34c759]/15 flex items-center justify-center">
              <span className="text-[#34c759] font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-semibold">Offbank</h1>
          </div>
          {step === "dashboard" && (
            <button
              onClick={signOut}
              className="text-sm text-[#8a8a8a] hover:text-[#8a8a8a] transition"
            >
              Sign out
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Email input step ── */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Recipient Dashboard</h2>
              <p className="text-[#8a8a8a] mb-8">
                Sign in with the email you received settlements on.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && requestMagicLink()}
                  placeholder="you@example.com"
                  className="flex-1 bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg px-4 py-3 text-[#212121] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#34c759]/50"
                />
                <button
                  onClick={requestMagicLink}
                  disabled={!email.includes("@")}
                  className="bg-[#34c759] hover:bg-[#34c759] disabled:opacity-40 text-white font-medium px-6 py-3 rounded-lg transition"
                >
                  Sign in
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Check email step ── */}
          {step === "check-email" && (
            <motion.div
              key="check-email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#34c759]/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-[#8a8a8a] mb-4">
                We sent a sign-in link to{" "}
                <strong className="text-[#212121]">{email}</strong>
              </p>
              <p className="text-[#8a8a8a] text-sm">
                The link expires in 15 minutes. Check your spam folder if you
                don&apos;t see it.
              </p>
              <button
                onClick={() => setStep("email")}
                className="mt-6 text-sm text-[#34c759] hover:text-[#7086f2] transition"
              >
                ← Use a different email
              </button>
            </motion.div>
          )}

          {/* ── Loading step ── */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-8 h-8 border-2 border-[#7086f2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#8a8a8a]">Loading your dashboard…</p>
            </motion.div>
          )}

          {/* ── Error step ── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#e74c3c]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-[#8a8a8a] mb-6">{errorMessage}</p>
              <button
                onClick={() => setStep("email")}
                className="text-[#34c759] hover:text-[#7086f2] transition text-sm"
              >
                ← Try again
              </button>
            </motion.div>
          )}

          {/* ── Dashboard ── */}
          {step === "dashboard" && profile && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-xl p-4">
                  <p className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-1">
                    Total received
                  </p>
                  <p className="text-2xl font-bold">
                    ${profile.totalReceived.toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-xl p-4">
                  <p className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-1">
                    Settlements
                  </p>
                  <p className="text-2xl font-bold">{profile.totalPayouts}</p>
                </div>
                <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-xl p-4">
                  <p className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-1">
                    Balance
                  </p>
                  <p className="text-2xl font-bold">
                    ${balance?.amount.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Balance card + withdraw */}
              {balance && balance.amount > 0 && (
                <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-[#34c759]/20 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#8a8a8a] text-sm">
                        Available balance
                      </p>
                      <p className="text-3xl font-bold">
                        ${balance.amount.toFixed(2)}{" "}
                        <span className="text-base font-normal text-[#8a8a8a]">
                          USDC
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="bg-[#34c759] hover:bg-[#2ba048] disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition"
                    >
                      {withdrawing ? "Withdrawing…" : "Withdraw all"}
                    </button>
                  </div>
                </div>
              )}

              {/* Settings card */}
              <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-lg">Settings</h3>

                {/* Wallet */}
                <div>
                  <label className="text-[#8a8a8a] text-sm block mb-1">
                    Wallet address
                  </label>
                  {editingWallet ? (
                    <div className="flex gap-2">
                      <input
                        value={newWallet}
                        onChange={(e) => setNewWallet(e.target.value)}
                        placeholder="Solana wallet address"
                        className="flex-1 bg-[#f2f2f2] border border-[#d3d3d3] rounded-lg px-3 py-2 text-sm text-[#212121] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#34c759]/50"
                      />
                      <button
                        onClick={() =>
                          updatePreferences({ walletAddress: newWallet })
                        }
                        disabled={saving || newWallet.length < 32}
                        className="bg-[#34c759] hover:bg-[#34c759] disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                      >
                        {saving ? "…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingWallet(false)}
                        className="text-[#8a8a8a] hover:text-[#8a8a8a] text-sm px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-[#8a8a8a] bg-[#f2f2f2] px-3 py-1.5 rounded-lg">
                        {profile.walletAddress
                          ? `${profile.walletAddress.slice(
                              0,
                              6,
                            )}...${profile.walletAddress.slice(-4)}`
                          : "Not set"}
                      </code>
                      <button
                        onClick={() => {
                          setNewWallet(profile.walletAddress || "");
                          setEditingWallet(true);
                        }}
                        className="text-[#34c759] hover:text-[#7086f2] text-sm transition"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Instant delivery</p>
                    <p className="text-xs text-[#8a8a8a]">
                      Auto-send settlements to your saved wallet
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePreferences({ autoWithdraw: !profile.autoWithdraw })
                    }
                    className={`w-11 h-6 rounded-full transition ${
                      profile.autoWithdraw ? "bg-[#34c759]" : "bg-white/10"
                    } relative`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                        profile.autoWithdraw ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email notifications</p>
                    <p className="text-xs text-[#8a8a8a]">
                      Get notified when you receive settlements
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePreferences({
                        notificationsEnabled: !profile.notificationsEnabled,
                      })
                    }
                    className={`w-11 h-6 rounded-full transition ${
                      profile.notificationsEnabled
                        ? "bg-[#34c759]"
                        : "bg-white/10"
                    } relative`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                        profile.notificationsEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Settlement history */}
              <div className="bg-[#f2f2f2] border border-[#d3d3d3] rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4">
                  Settlement History
                </h3>
                {payouts.length === 0 ? (
                  <p className="text-[#8a8a8a] text-sm text-center py-6">
                    No settlements yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {payouts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2 border-b border-[#d3d3d3] last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            ${p.amount.toFixed(2)}{" "}
                            <span className="text-sm text-[#8a8a8a]">
                              {p.currency}
                            </span>
                          </p>
                          {p.memo && (
                            <p className="text-xs text-[#8a8a8a]">{p.memo}</p>
                          )}
                          <p className="text-xs text-[#5c5c5c]">
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "claimed"
                                ? "bg-[#34c759]/20 text-[#34c759]"
                                : p.status === "sent"
                                ? "bg-[#d29500]/20 text-[#d29500]"
                                : p.status === "expired"
                                ? "bg-[#e74c3c]/20 text-[#e74c3c]"
                                : "bg-white/10 text-[#8a8a8a]"
                            }`}
                          >
                            {p.status}
                          </span>
                          {p.txSignature &&
                            !p.txSignature.startsWith("demo") && (
                              <a
                                href={explorerUrl(p.txSignature)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-[#34c759] hover:text-[#7086f2] mt-1"
                              >
                                View tx ↗
                              </a>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <p className="text-center text-[#5c5c5c] text-xs">
                Powered by{" "}
                <a
                  href="https://offbankpay.com"
                  className="text-[#34c759] hover:text-[#7086f2] transition"
                >
                  Offbank
                </a>{" "}
                - non-custodial settlement infrastructure
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
