"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Webhook,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "success" | "failed";
  createdAt: string;
}

const WEBHOOK_EVENTS = [
  {
    id: "payment.completed",
    label: "Payment Completed",
    description: "Triggered when a payment is confirmed on-chain",
  },
  {
    id: "payment.failed",
    label: "Payment Failed",
    description: "Triggered when a payment fails",
  },
  {
    id: "payment.expired",
    label: "Payment Expired",
    description: "Triggered when a payment link expires",
  },
  {
    id: "payment.refunded",
    label: "Payment Refunded",
    description: "Triggered when a payment is refunded",
  },
  {
    id: "subscription.created",
    label: "Subscription Created",
    description: "Triggered when a new subscription starts",
  },
  {
    id: "subscription.renewed",
    label: "Subscription Renewed",
    description: "Triggered when a subscription renews",
  },
  {
    id: "subscription.cancelled",
    label: "Subscription Cancelled",
    description: "Triggered when a subscription is cancelled",
  },
];

export default function WebhooksPage() {
  const { authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // New webhook form
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "payment.completed",
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fetchWebhooks = useCallback(async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(`/api/webhooks?merchantId=${publicKey}`);
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchWebhooks();
    } else {
      setLoading(false);
    }
  }, [connected, publicKey, fetchWebhooks]);

  const createWebhook = async () => {
    if (!publicKey || !newUrl) return;

    setCreating(true);
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: publicKey,
          url: newUrl,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks((prev) => [...prev, data.webhook]);
        setShowCreateModal(false);
        setNewUrl("");
        setSelectedEvents(["payment.completed"]);
        // Show the secret immediately after creation
        setShowSecret(data.webhook.id);
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
    }
  };

  const testWebhook = async (id: string) => {
    setTesting(id);
    try {
      const response = await fetch(`/api/webhooks/${id}/test`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh to get updated delivery status
        await fetchWebhooks();
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  // Not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
              <Webhook className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Webhook Configuration
            </h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Connect your wallet to configure webhooks for payment
              notifications.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
            >
              <LogIn className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Webhooks</h1>
              <p className="text-slate-400 text-sm">
                Receive real-time payment notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </button>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">
                Secure Webhook Delivery
              </h3>
              <p className="text-slate-400 text-sm">
                All webhook payloads are signed with HMAC-SHA256. Verify the{" "}
                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">
                  X-Settlr-Signature
                </code>{" "}
                header to ensure authenticity. See our{" "}
                <Link
                  href="/docs#webhooks"
                  className="text-indigo-400 hover:underline"
                >
                  webhook documentation
                </Link>{" "}
                for implementation details.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Webhooks List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : webhooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
              <Webhook className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No webhooks configured
            </h3>
            <p className="text-slate-400 mb-6">
              Add a webhook endpoint to receive payment notifications in
              real-time.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Webhook
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook, index) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          webhook.active ? "bg-emerald-400" : "bg-slate-500"
                        }`}
                      />
                      <code className="text-white font-mono text-sm bg-slate-800 px-3 py-1 rounded-lg">
                        {webhook.url}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{webhook.events.length} events</span>
                      {webhook.lastDeliveryAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {webhook.lastDeliveryStatus === "success" ? (
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            Last delivery:{" "}
                            {new Date(webhook.lastDeliveryAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testing === webhook.id}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                      title="Send test event"
                    >
                      {testing === webhook.id ? (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Secret */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Signing Secret
                      </p>
                      <code className="text-sm text-slate-300 font-mono">
                        {showSecret === webhook.id
                          ? webhook.secret
                          : "whsec_••••••••••••••••"}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setShowSecret(
                            showSecret === webhook.id ? null : webhook.id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {showSecret === webhook.id ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            webhook.secret,
                            `secret-${webhook.id}`
                          )
                        }
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {copied === `secret-${webhook.id}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events */}
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-lg"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                Add Webhook Endpoint
              </h2>

              <div className="space-y-6">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://your-site.com/webhooks/settlr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Must be a valid HTTPS URL that can receive POST requests
                  </p>
                </div>

                {/* Event Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">
                    Events to Subscribe
                  </label>
                  <div className="space-y-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <label
                        key={event.id}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          selectedEvents.includes(event.id)
                            ? "bg-indigo-500/10 border border-indigo-500/30"
                            : "bg-slate-800/50 border border-transparent hover:bg-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => toggleEvent(event.id)}
                          className="mt-1 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {event.label}
                          </p>
                          <p className="text-xs text-slate-400">
                            {event.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createWebhook}
                  disabled={creating || !newUrl || selectedEvents.length === 0}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Webhook
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
