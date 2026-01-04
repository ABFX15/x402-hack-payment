"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  RefreshCw,
  Plus,
  Copy,
  Check,
  Trash2,
  Edit2,
  ArrowLeft,
  Zap,
  Calendar,
  DollarSign,
  Users,
  LogIn,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: "daily" | "weekly" | "monthly" | "yearly";
  intervalCount: number;
  trialDays?: number;
  features: string[];
  active: boolean;
  subscriberCount?: number;
  createdAt: string;
}

const INTERVAL_LABELS: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

export default function SubscriptionsPage() {
  const { authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // New plan form
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    amount: "",
    interval: "monthly" as const,
    intervalCount: 1,
    trialDays: 0,
    features: [""],
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fetchPlans = useCallback(async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(
        `/api/subscriptions/plans?merchantId=${publicKey}`
      );
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchPlans();
    } else {
      setLoading(false);
    }
  }, [connected, publicKey, fetchPlans]);

  const createPlan = async () => {
    if (!publicKey || !newPlan.name || !newPlan.amount) return;

    setCreating(true);
    try {
      const response = await fetch("/api/subscriptions/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: publicKey,
          ...newPlan,
          amount: parseFloat(newPlan.amount),
          features: newPlan.features.filter((f) => f.trim() !== ""),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlans((prev) => [...prev, data.plan]);
        setShowCreateModal(false);
        setNewPlan({
          name: "",
          description: "",
          amount: "",
          interval: "monthly",
          intervalCount: 1,
          trialDays: 0,
          features: [""],
        });
      }
    } catch (error) {
      console.error("Error creating plan:", error);
    } finally {
      setCreating(false);
    }
  };

  const togglePlanActive = async (planId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/subscriptions/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (response.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, active: !active } : p))
        );
      }
    } catch (error) {
      console.error("Error toggling plan:", error);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/plans/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const addFeature = () => {
    setNewPlan((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const updateFeature = (index: number, value: string) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const removeFeature = (index: number) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const getCheckoutLink = (plan: SubscriptionPlan) => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://settlr.dev";
    return `${baseUrl}/checkout?plan=${plan.id}&merchant=${publicKey}&subscription=true`;
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
              <RefreshCw className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Subscription Plans
            </h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Connect your wallet to create and manage recurring payment plans.
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
              <h1 className="text-2xl font-bold text-white">
                Subscription Plans
              </h1>
              <p className="text-slate-400 text-sm">
                Create recurring payment plans for your customers
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <RefreshCw className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-slate-400 text-sm">Active Plans</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {plans.filter((p) => p.active).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-400 text-sm">Total Subscribers</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {plans.reduce((sum, p) => sum + (p.subscriberCount || 0), 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-slate-400 text-sm">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-white">$0.00</p>
          </motion.div>
        </div>

        {/* Plans List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No subscription plans yet
            </h3>
            <p className="text-slate-400 mb-6">
              Create your first subscription plan to start accepting recurring
              payments.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Plan
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-slate-900/50 border rounded-2xl p-6 ${
                  plan.active
                    ? "border-slate-800"
                    : "border-slate-800/50 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-sm text-slate-400 mt-1">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => togglePlanActive(plan.id, plan.active)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {plan.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">
                    ${plan.amount}
                  </span>
                  <span className="text-slate-400 ml-1">
                    /{plan.intervalCount > 1 ? `${plan.intervalCount} ` : ""}
                    {INTERVAL_LABELS[plan.interval]}
                    {plan.intervalCount > 1 ? "s" : ""}
                  </span>
                </div>

                {plan.trialDays && plan.trialDays > 0 && (
                  <div className="flex items-center gap-2 text-sm text-indigo-400 mb-4">
                    <Clock className="w-4 h-4" />
                    {plan.trialDays} day free trial
                  </div>
                )}

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <Star className="w-3 h-3 text-indigo-400" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-slate-500">
                        +{plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Users className="w-3 h-3" />
                  {plan.subscriberCount || 0} subscribers
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(getCheckoutLink(plan), plan.id)
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                  >
                    {copied === plan.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
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
                Create Subscription Plan
              </h2>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, name: e.target.value })
                    }
                    placeholder="e.g., Pro Monthly"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, description: e.target.value })
                    }
                    placeholder="Describe what's included..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Price & Interval */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Price (USDC)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.amount}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, amount: e.target.value })
                      }
                      placeholder="9.99"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Billing Interval
                    </label>
                    <select
                      value={newPlan.interval}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          interval: e.target.value as typeof newPlan.interval,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Trial Days */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Free Trial (days)
                  </label>
                  <input
                    type="number"
                    value={newPlan.trialDays}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        trialDays: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {newPlan.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="e.g., Unlimited access"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {newPlan.features.length > 1 && (
                          <button
                            onClick={() => removeFeature(index)}
                            className="p-2 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addFeature}
                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    + Add feature
                  </button>
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
                  onClick={createPlan}
                  disabled={creating || !newPlan.name || !newPlan.amount}
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
                      Create Plan
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
