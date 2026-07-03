"use client";

import { useState, useEffect, useCallback } from "react";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Shield,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Check,
  AlertCircle,
  Landmark,
  ArrowDownToLine,
  DollarSign,
  Leaf,
  Copy,
  ExternalLink,
  KeyRound,
  Plus,
  Trash2,
} from "lucide-react";

/* ─── Types ─── */
interface OfframpSettings {
  enabled: boolean;
  provider: "sphere" | "moonpay" | "manual";
  method: string;
  currency: string;
  accountLabel: string;
  minAmount: number;
  batchMode: boolean;
  batchThreshold: number;
}

interface LeafLinkSettings {
  enabled: boolean;
  apiKey: string;
  companyId: number | null;
  autoCreateInvoice: boolean;
  autoSendLink: boolean;
  metrcSync: boolean;
  webhookSecret: string;
  connected: boolean;
  lastSyncAt: string | null;
}

interface MerchantSettings {
  businessName: string;
  wallet: string;
  evmAddress: string;
  autoOfframp: OfframpSettings;
  leaflink: LeafLinkSettings;
  notifications: {
    emailOnPayment: boolean;
    emailOnOfframp: boolean;
  };
}

const DEFAULT_SETTINGS: MerchantSettings = {
  businessName: "",
  wallet: "",
  evmAddress: "",
  autoOfframp: {
    enabled: false,
    provider: "sphere",
    method: "ach",
    currency: "USD",
    accountLabel: "",
    minAmount: 100,
    batchMode: false,
    batchThreshold: 5000,
  },
  leaflink: {
    enabled: false,
    apiKey: "",
    companyId: null,
    autoCreateInvoice: true,
    autoSendLink: true,
    metrcSync: true,
    webhookSecret: "",
    connected: false,
    lastSyncAt: null,
  },
  notifications: {
    emailOnPayment: true,
    emailOnOfframp: true,
  },
};

const OFFRAMP_METHODS = [
  {
    value: "ach",
    label: "ACH Transfer",
    region: "US",
    time: "1-2 business days",
  },
  { value: "wire", label: "Wire Transfer", region: "US", time: "Same day" },
  {
    value: "faster_payments",
    label: "Faster Payments",
    region: "UK",
    time: "Instant",
  },
  {
    value: "sepa",
    label: "SEPA Transfer",
    region: "EU",
    time: "1 business day",
  },
  { value: "pix", label: "Pix", region: "BR", time: "Instant" },
  { value: "gcash", label: "GCash", region: "PH", time: "Instant" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "BRL", label: "Brazilian Real (BRL)" },
  { value: "PHP", label: "Philippine Peso (PHP)" },
  { value: "MXN", label: "Mexican Peso (MXN)" },
];

export default function SettingsPage() {
  // useActiveWallet returns a base58 string and works for Privy email logins.
  const { publicKey } = useActiveWallet();
  const wallet = publicKey || "";

  const [settings, setSettings] = useState<MerchantSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings
  useEffect(() => {
    if (!wallet) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/merchant/settings?wallet=${wallet}`);
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data, wallet }));
        } else {
          setSettings((prev) => ({ ...prev, wallet }));
        }
      } catch {
        setSettings((prev) => ({ ...prev, wallet }));
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet]);

  const handleSave = useCallback(async () => {
    if (!wallet) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/merchant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[settings] save error:", err);
    } finally {
      setSaving(false);
    }
  }, [wallet, settings]);

  const updateOfframp = (patch: Partial<OfframpSettings>) =>
    setSettings((prev) => ({
      ...prev,
      autoOfframp: { ...prev.autoOfframp, ...patch },
    }));

  const updateLeaflink = (patch: Partial<LeafLinkSettings>) =>
    setSettings((prev) => ({
      ...prev,
      leaflink: { ...prev.leaflink, ...patch },
    }));

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/integrations/leaflink/webhook`
      : "";

  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const copyWebhook = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    });
  };

  /* ─── API keys (SDK) ─── */
  interface KeyInfo {
    id: string;
    keyPrefix: string;
    name: string;
    active: boolean;
    createdAt: string;
    lastUsedAt: string | null;
    requestCount: number;
  }
  const [apiKeys, setApiKeys] = useState<KeyInfo[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Webhook signing secret (for verifying webhooks with @offbank/sdk).
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [revealSecret, setRevealSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const loadKeys = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`/api/keys?wallet=${wallet}`);
      if (res.ok) setApiKeys((await res.json()).keys || []);
    } catch {
      /* ignore */
    }
  }, [wallet]);

  const loadWebhookSecret = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/webhook-secret");
      if (res.ok) setWebhookSecret((await res.json()).secret || null);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadKeys();
    loadWebhookSecret();
  }, [loadKeys, loadWebhookSecret]);

  const createKey = async () => {
    if (!wallet) return;
    setCreatingKey(true);
    setKeyError(null);
    setFreshKey(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, name: newKeyName.trim() || "API key" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create key");
      setFreshKey(data.key);
      setNewKeyName("");
      loadKeys();
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : "Could not create key");
    } finally {
      setCreatingKey(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!wallet) return;
    await fetch(`/api/keys/${id}?wallet=${wallet}`, { method: "DELETE" });
    loadKeys();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#34c759]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#212121]">Settings</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          Configure your business profile, payment settlement, and
          notifications.
        </p>
      </div>

      {/* ─── Business Profile ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              Business Profile
            </h2>
            <p className="text-xs text-[#8a8a8a]">Your public business info</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  businessName: e.target.value,
                }))
              }
              placeholder="Acme Cannabis Co."
              className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
              Settlement Wallet
            </label>
            <div className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm font-mono text-[#8a8a8a]">
              {wallet || "Connect wallet to configure"}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Off-Ramp ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-[#34c759]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#212121]">
                Cash Out (Off-Ramp)
              </h2>
              <p className="text-xs text-[#8a8a8a]">
                Convert USDC to USD via Sphere — ACH, Wire, or SEPA
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#34c759]/10 px-3 py-1 text-xs font-semibold text-[#34c759]">
            Live
          </span>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#d3d3d3] bg-[#f7f7f7] p-4">
            <p className="text-sm font-medium text-[#212121] mb-1">
              Manual cash-out via Sphere
            </p>
            <p className="text-xs text-[#8a8a8a] mb-3">
              Sphere is a licensed money transmitter that converts your USDC to
              fiat in your bank account. We pre-fill your wallet address and
              amount — you complete the cash-out on Sphere&apos;s platform.
            </p>
            <a
              href={`/offramp${wallet ? `?wallet=${wallet}` : ""}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#34c759] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2ba048] transition-colors"
            >
              Open Cash-Out Page
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#212121]">
                Auto cash-out after each settlement
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Beta — converts above your minimum threshold automatically
              </p>
            </div>
            <button
              onClick={() =>
                updateOfframp({ enabled: !settings.autoOfframp.enabled })
              }
              className={
                settings.autoOfframp.enabled
                  ? "text-[#34c759]"
                  : "text-[#d3d3d3]"
              }
            >
              {settings.autoOfframp.enabled ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>
          {settings.autoOfframp.enabled && (
            <div className="grid gap-3 sm:grid-cols-2 rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] p-4">
              <div>
                <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                  Minimum amount (USDC)
                </label>
                <input
                  type="number"
                  value={settings.autoOfframp.minAmount}
                  onChange={(e) =>
                    updateOfframp({
                      minAmount: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2 text-sm focus:border-[#34c759] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                  Bank account label
                </label>
                <input
                  type="text"
                  value={settings.autoOfframp.accountLabel}
                  onChange={(e) =>
                    updateOfframp({ accountLabel: e.target.value })
                  }
                  placeholder="Operating account"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2 text-sm focus:border-[#34c759] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── LeafLink Integration ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-[#34c759]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#212121]">
                LeafLink Integration
              </h2>
              <p className="text-xs text-[#8a8a8a]">
                Auto-create USDC invoices from LeafLink purchase orders
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              settings.leaflink.enabled
                ? "bg-[#34c759]/10 text-[#34c759]"
                : "bg-[#8a8a8a]/10 text-[#8a8a8a]"
            }`}
          >
            {settings.leaflink.enabled
              ? settings.leaflink.connected
                ? "Connected"
                : "Pending verification"
              : "Disabled"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#212121]">
                Enable LeafLink sync
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Receive webhooks when buyers create or accept POs
              </p>
            </div>
            <button
              onClick={() =>
                updateLeaflink({ enabled: !settings.leaflink.enabled })
              }
              className={
                settings.leaflink.enabled ? "text-[#34c759]" : "text-[#d3d3d3]"
              }
            >
              {settings.leaflink.enabled ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>

          {settings.leaflink.enabled && (
            <div className="space-y-4 rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                    LeafLink API Key
                  </label>
                  <input
                    type="password"
                    value={settings.leaflink.apiKey}
                    onChange={(e) => updateLeaflink({ apiKey: e.target.value })}
                    placeholder="Paste your LeafLink API key"
                    className="w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2 text-sm font-mono focus:border-[#34c759] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#8a8a8a]">
                    LeafLink → Settings → Integrations → API
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                    LeafLink Company ID
                  </label>
                  <input
                    type="number"
                    value={settings.leaflink.companyId ?? ""}
                    onChange={(e) =>
                      updateLeaflink({
                        companyId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="e.g. 12345"
                    className="w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2 text-sm focus:border-[#34c759] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-[#d3d3d3] bg-white px-3 py-2 text-xs font-mono text-[#5c5c5c]">
                    {webhookUrl || "—"}
                  </code>
                  <button
                    onClick={copyWebhook}
                    aria-label={
                      copiedWebhook ? "Webhook URL copied" : "Copy webhook URL"
                    }
                    className="shrink-0 rounded-lg border border-[#d3d3d3] bg-white p-2 text-[#8a8a8a] hover:text-[#212121]"
                  >
                    {copiedWebhook ? (
                      <Check className="h-4 w-4 text-[#34c759]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-[#8a8a8a]">
                  Paste into LeafLink → Settings → Integrations → Webhooks
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                  Webhook signing secret (optional)
                </label>
                <input
                  type="password"
                  value={settings.leaflink.webhookSecret}
                  onChange={(e) =>
                    updateLeaflink({ webhookSecret: e.target.value })
                  }
                  placeholder="HMAC-SHA256 secret from LeafLink"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2 text-sm font-mono focus:border-[#34c759] focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#d3d3d3]">
                <ToggleRow
                  label="Auto-create Offbank invoice on order.created"
                  desc="Generates a USDC invoice the moment a buyer submits a PO"
                  checked={settings.leaflink.autoCreateInvoice}
                  onChange={(v) => updateLeaflink({ autoCreateInvoice: v })}
                />
                <ToggleRow
                  label="Auto-email payment link to buyer"
                  desc="Buyer receives a Offbank payment link via email"
                  checked={settings.leaflink.autoSendLink}
                  onChange={(v) => updateLeaflink({ autoSendLink: v })}
                />
                <ToggleRow
                  label="Embed METRC tags in settlement memo"
                  desc="Package tags from LeafLink line items get written on-chain"
                  checked={settings.leaflink.metrcSync}
                  onChange={(v) => updateLeaflink({ metrcSync: v })}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Notifications ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              Notifications
            </h2>
            <p className="text-xs text-[#8a8a8a]">
              Email alerts for payments and off-ramps
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#212121]">
                Payment received
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Get notified when someone pays you
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailOnPayment: !prev.notifications.emailOnPayment,
                  },
                }))
              }
              className={
                settings.notifications.emailOnPayment
                  ? "text-[#34c759]"
                  : "text-[#d3d3d3]"
              }
            >
              {settings.notifications.emailOnPayment ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#212121]">
                Off-ramp completed
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Get notified when USDC converts to fiat
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailOnOfframp: !prev.notifications.emailOnOfframp,
                  },
                }))
              }
              className={
                settings.notifications.emailOnOfframp
                  ? "text-[#34c759]"
                  : "text-[#d3d3d3]"
              }
            >
              {settings.notifications.emailOnOfframp ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Multichain: accept Ethereum payments ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#34c759]/10">
            <CreditCard className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              Accept Ethereum payments
            </h2>
            <p className="text-sm text-[#8a8a8a]">
              Add an EVM address to let buyers pay USDC from an Ethereum wallet
              (MetaMask etc.) on Base, Ethereum, Polygon, Arbitrum, or Optimism —
              alongside Solana. Funds land directly in this wallet.
            </p>
          </div>
        </div>
        <label className="mb-1.5 block text-sm font-medium text-[#344054]">
          EVM receiving address{" "}
          <span className="text-[#98a2b3]">(optional)</span>
        </label>
        <input
          value={settings.evmAddress}
          onChange={(e) =>
            setSettings((s) => ({ ...s, evmAddress: e.target.value.trim() }))
          }
          placeholder="0x…"
          className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm outline-none ${
            settings.evmAddress &&
            !/^0x[a-fA-F0-9]{40}$/.test(settings.evmAddress)
              ? "border-[#e74c3c] focus:border-[#e74c3c]"
              : "border-[#d0d5dd] focus:border-[#34c759]"
          }`}
        />
        {settings.evmAddress &&
          !/^0x[a-fA-F0-9]{40}$/.test(settings.evmAddress) && (
            <p className="mt-1.5 text-[12px] text-[#e74c3c]">
              That doesn&rsquo;t look like a valid 0x… address.
            </p>
          )}
      </section>

      {/* ─── Developer / API keys ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#34c759]/10">
            <KeyRound className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              API keys
            </h2>
            <p className="text-sm text-[#8a8a8a]">
              Authenticate the Offbank SDK & API (payouts, checkout). Keep keys
              secret — treat them like passwords.
            </p>
          </div>
        </div>

        {/* Freshly created key — shown once */}
        {freshKey && (
          <div className="mb-4 rounded-xl border border-[#34c759]/40 bg-[#34c759]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[#027a48]">
              Your new key — copy it now, it won&rsquo;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg bg-[#0d1117] px-3 py-2 font-mono text-[12px] text-[#e6edf3]">
                {freshKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(freshKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 1500);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#34c759] px-3 py-2 text-sm font-medium text-white hover:bg-[#2ba048]"
              >
                {copiedKey ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedKey ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Create */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production, iGaming sandbox)"
            className="flex-1 rounded-xl border border-[#d3d3d3] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
          />
          <button
            onClick={createKey}
            disabled={creatingKey || !wallet}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34c759] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50"
          >
            {creatingKey ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create key
          </button>
        </div>
        {keyError && (
          <p className="mb-3 text-sm text-[#d92d20]">{keyError}</p>
        )}

        {/* List */}
        {apiKeys.length === 0 ? (
          <p className="text-sm text-[#8a8a8a]">No API keys yet.</p>
        ) : (
          <div className="divide-y divide-[#f2f2f2] rounded-xl border border-[#eaecf0]">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#212121]">
                    {k.name}{" "}
                    {!k.active && (
                      <span className="ml-1 rounded bg-[#f2f2f2] px-1.5 py-0.5 text-[11px] text-[#8a8a8a]">
                        revoked
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[12px] text-[#8a8a8a]">
                    {k.keyPrefix}…··· · {k.requestCount} reqs
                    {k.lastUsedAt
                      ? ` · last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                      : " · never used"}
                  </p>
                </div>
                {k.active && (
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#d3d3d3] px-3 py-1.5 text-sm font-medium text-[#d92d20] hover:bg-[#fef2f2]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Webhook signing secret ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#34c759]/10">
            <KeyRound className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              Webhook signing secret
            </h2>
            <p className="text-sm text-[#8a8a8a]">
              Offbank signs every webhook with this secret. Verify it in your
              backend with{" "}
              <code className="rounded bg-[#f2f2f2] px-1 py-0.5 font-mono text-[12px]">
                offbank.webhooks.verify()
              </code>{" "}
              so you only fulfil real, verified payments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-[#0d1117] px-3 py-2 font-mono text-[12px] text-[#e6edf3]">
            {webhookSecret
              ? revealSecret
                ? webhookSecret
                : `whsec_${"•".repeat(24)}`
              : "Loading…"}
          </code>
          <button
            onClick={() => setRevealSecret((v) => !v)}
            disabled={!webhookSecret}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d3d3d3] px-3 py-2 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] disabled:opacity-50"
          >
            {revealSecret ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={() => {
              if (!webhookSecret) return;
              navigator.clipboard.writeText(webhookSecret);
              setCopiedSecret(true);
              setTimeout(() => setCopiedSecret(false), 1500);
            }}
            disabled={!webhookSecret}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#34c759] px-3 py-2 text-sm font-medium text-white hover:bg-[#2ba048] disabled:opacity-50"
          >
            {copiedSecret ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedSecret ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-[13px] text-[#8a8a8a]">
          Sent as the{" "}
          <code className="rounded bg-[#f2f2f2] px-1 py-0.5 font-mono text-[12px]">
            X-Offbank-Signature
          </code>{" "}
          header (HMAC-SHA256). Keep it secret — anyone with it can forge
          webhooks.
        </p>
      </section>

      {/* ─── Save ─── */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[#34c759]">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !wallet}
          className="rounded-xl bg-[#34c759] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </span>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Toggle row helper ─── */
function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#212121]">{label}</p>
        <p className="text-xs text-[#8a8a8a]">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={
          checked ? "text-[#34c759] shrink-0" : "text-[#d3d3d3] shrink-0"
        }
      >
        {checked ? (
          <ToggleRight className="h-7 w-7" />
        ) : (
          <ToggleLeft className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
