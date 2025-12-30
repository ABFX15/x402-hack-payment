"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Shield,
  Zap,
  Building2,
  LogIn,
} from "lucide-react";
import Link from "next/link";

interface ApiKeyRecord {
  id: string;
  keyPrefix: string;
  name: string;
  tier: "free" | "pro" | "enterprise";
  rateLimit: number;
  requestCount: number;
  lastUsedAt?: string;
  createdAt: string;
  active: boolean;
}

export default function ApiKeysPage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  // Prefer external wallets (Phantom/Solflare) over Privy embedded wallet
  const solanaWallet =
    wallets?.find((w) => w.walletClientType !== "privy") || wallets?.[0];
  const publicKey = solanaWallet?.address;
  const connected = authenticated && !!publicKey;
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTier, setNewKeyTier] = useState<"free" | "pro" | "enterprise">(
    "free"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Fetch API keys
  useEffect(() => {
    async function fetchKeys() {
      if (!publicKey) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/sdk/keys?merchantId=${publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setKeys(data.keys || []);
        }
      } catch (err) {
        console.error("Failed to fetch API keys:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchKeys();
  }, [publicKey]);

  const createKey = async () => {
    if (!publicKey || !newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/sdk/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: publicKey,
          name: newKeyName.trim(),
          tier: newKeyTier,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.key);

        // Refresh keys list
        const keysRes = await fetch(`/api/sdk/keys?merchantId=${publicKey}`);
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          setKeys(keysData.keys || []);
        }
      }
    } catch (err) {
      console.error("Failed to create API key:", err);
      alert("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this API key? This cannot be undone."
      )
    ) {
      return;
    }

    setRevoking(keyId);
    try {
      const res = await fetch("/api/sdk/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });

      if (res.ok) {
        setKeys(keys.filter((k) => k.id !== keyId));
      }
    } catch (err) {
      console.error("Failed to revoke API key:", err);
    } finally {
      setRevoking(null);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "pro":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "enterprise":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "pro":
        return Zap;
      case "enterprise":
        return Building2;
      default:
        return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white p-8 pt-28">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">API Keys</h1>
              <p className="text-zinc-400">
                Manage your SDK API keys for authentication
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                console.log("Create API Key clicked");
                setShowCreateModal(true);
                setNewKeyName("");
                setNewKeyTier("free");
                setNewlyCreatedKey(null);
              }}
              disabled={!connected}
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {connected ? "Create API Key" : "Connect Wallet First"}
            </motion.button>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-200 font-medium">
              Keep your API keys secure
            </p>
            <p className="text-blue-300/70 text-sm">
              API keys grant access to your Settlr account. Never share them
              publicly or commit them to version control.
            </p>
          </div>
        </motion.div>

        {/* Keys List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : !connected ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <Key className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">
                Connect your wallet to manage API keys
              </p>
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <Key className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">No API keys yet</p>
              <p className="text-zinc-500 text-sm">
                Create your first API key to start using the SDK
              </p>
            </div>
          ) : (
            keys.map((key, i) => {
              const TierIcon = getTierIcon(key.tier);
              return (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 rounded-2xl border transition-all ${
                    key.active
                      ? "bg-zinc-900/50 border-zinc-800"
                      : "bg-zinc-900/20 border-zinc-800/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-800 rounded-xl">
                        <Key className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{key.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs border ${getTierColor(
                              key.tier
                            )}`}
                          >
                            <TierIcon className="w-3 h-3 inline mr-1" />
                            {key.tier}
                          </span>
                          {!key.active && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                              Revoked
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-sm font-mono">
                          {key.keyPrefix}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">
                          {key.requestCount.toLocaleString()} requests
                        </p>
                        <p className="text-xs text-zinc-500">
                          {key.rateLimit}/min limit
                        </p>
                      </div>

                      {key.active && (
                        <button
                          onClick={() => revokeKey(key.id)}
                          disabled={revoking === key.id}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          {revoking === key.id ? (
                            <div className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {key.lastUsedAt && (
                    <p className="text-xs text-zinc-600 mt-3">
                      Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Rate Limits Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800"
        >
          <h3 className="font-semibold mb-4">Rate Limits by Tier</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { tier: "Free", limit: "60/min", fee: "2%", icon: Shield },
              { tier: "Pro", limit: "300/min", fee: "1.5%", icon: Zap },
              {
                tier: "Enterprise",
                limit: "1000/min",
                fee: "1%",
                icon: Building2,
              },
            ].map((t) => (
              <div key={t.tier} className="p-4 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <t.icon className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium">{t.tier}</span>
                </div>
                <p className="text-sm text-zinc-400">{t.limit}</p>
                <p className="text-xs text-zinc-500">{t.fee} platform fee</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md"
          >
            {newlyCreatedKey ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold">API Key Created!</h2>
                  <p className="text-zinc-400 text-sm mt-2">
                    Copy this key now. You won&apos;t be able to see it again.
                  </p>
                </div>

                <div className="p-4 bg-zinc-800 rounded-xl font-mono text-sm break-all mb-4">
                  {newlyCreatedKey}
                </div>

                <button
                  onClick={() => copyKey(newlyCreatedKey)}
                  className="w-full py-3 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 mb-3"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Create API Key</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production, Development"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Tier
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["free", "pro", "enterprise"] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setNewKeyTier(tier)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            newKeyTier === tier
                              ? "bg-white text-black border-white"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                          }`}
                        >
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 bg-zinc-800 text-white font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createKey}
                      disabled={creating || !newKeyName.trim()}
                      className="flex-1 py-3 bg-white text-black font-semibold rounded-xl disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create Key"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
