"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ArrowLeft,
  Info,
  Download,
  FileCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { BusinessVerification } from "@/components/compliance/BusinessVerification";

interface ComplianceDossier {
  business: { name: string; licenseNumber: string | null; wallet: string };
  kyb: { verified: boolean };
  aml: { riskLevel: string; riskScore: number; flagged: boolean };
  activity: { completedPayments: number; totalVolumeUSDC: number };
  offramp: { settledCount: number; settledTotalUSD: number; pendingCount: number };
  generatedAt: string;
}

interface MerchantSettings {
  kycEnabled: boolean;
  kycLevel: "basic-kyc-level" | "gaming-kyc-level" | "enhanced-kyc-level";
}

const KYC_LEVELS = [
  {
    id: "basic-kyc-level",
    name: "Basic",
    description: "ID verification + selfie. For general merchants.",
    recommended: false,
  },
  {
    id: "gaming-kyc-level",
    name: "Gaming",
    description:
      "ID + selfie + age verification. Required for licensed cannabis operators.",
    recommended: true,
  },
  {
    id: "enhanced-kyc-level",
    name: "Enhanced",
    description: "ID + selfie + proof of address. For high-value transactions.",
    recommended: false,
  },
];

export default function ComplianceSettingsPage() {
  const { setVisible: openWalletModal } = useWalletModal();
  const ready = true;
  const { publicKey, connected } = useActiveWallet();

  const [settings, setSettings] = useState<MerchantSettings>({
    kycEnabled: false,
    kycLevel: "basic-kyc-level",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dossier, setDossier] = useState<ComplianceDossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  const loadDossier = async () => {
    if (!publicKey) return;
    setLoadingDossier(true);
    try {
      const res = await fetch(`/api/compliance/report?wallet=${publicKey}`);
      if (res.ok) setDossier((await res.json()).report);
    } finally {
      setLoadingDossier(false);
    }
  };

  // Raw machine-readable export (for a compliance officer's own systems).
  const downloadJson = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offbank-compliance-${dossier.business.wallet.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open a clean, branded, print-ready report and trigger the browser's
  // print dialog (→ "Save as PDF"). This is the presentable artifact you
  // hand a bank / credit-union compliance officer - not raw JSON.
  const downloadDossier = () => {
    if (!dossier) return;
    const d = dossier;
    const usd = (n: number) =>
      n.toLocaleString("en-US", { style: "currency", currency: "USD" });
    const risk = d.aml.flagged ? "Flagged" : d.aml.riskLevel || "Unknown";
    const riskColor = d.aml.flagged
      ? "#dc2626"
      : /low/i.test(d.aml.riskLevel)
        ? "#16a34a"
        : "#d97706";
    const generated = new Date(d.generatedAt || Date.now()).toLocaleString(
      "en-US",
      { dateStyle: "long", timeStyle: "short" },
    );
    const badge = (ok: boolean, label: string) =>
      `<span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;color:${
        ok ? "#166534" : "#9a3412"
      };background:${ok ? "#dcfce7" : "#ffedd5"}">${label}</span>`;
    const row = (label: string, value: string) =>
      `<tr><td style="padding:10px 0;color:#64748b;font-size:14px">${label}</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;font-size:14px">${value}</td></tr>`;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Offbank Compliance Dossier</title>
<style>
  @page { margin: 40px; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#0f172a; margin:0; padding:48px; max-width:760px; }
  .brand { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #34c759; padding-bottom:16px; margin-bottom:8px; }
  .brand h1 { font-size:22px; margin:0; letter-spacing:-0.02em; }
  .brand .sub { color:#34c759; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.08em; }
  h2 { font-size:13px; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; margin:32px 0 8px; }
  table { width:100%; border-collapse:collapse; }
  tr + tr td { border-top:1px solid #f1f5f9; }
  .mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size:12px; word-break:break-all; }
  .statement { margin-top:32px; padding:16px; background:#f8fafc; border-left:3px solid #34c759; font-size:13px; color:#475569; line-height:1.6; }
  .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; display:flex; justify-content:space-between; }
</style></head>
<body>
  <div class="brand">
    <div><h1>Offbank</h1></div>
    <div class="sub">Compliance Dossier</div>
  </div>
  <p style="color:#64748b;font-size:13px;margin:4px 0 0">Generated ${generated}</p>

  <h2>Business</h2>
  <table>
    ${row("Legal name", d.business.name || "-")}
    ${row("License number", d.business.licenseNumber || "-")}
    <tr><td style="padding:10px 0;color:#64748b;font-size:14px">Settlement wallet</td><td style="padding:10px 0;text-align:right" class="mono">${d.business.wallet}</td></tr>
  </table>

  <h2>Verification &amp; Screening</h2>
  <table>
    <tr><td style="padding:10px 0;color:#64748b;font-size:14px">Identity / KYB (Sumsub)</td><td style="padding:10px 0;text-align:right">${badge(d.kyb.verified, d.kyb.verified ? "Verified" : "Pending")}</td></tr>
    <tr><td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#64748b;font-size:14px">AML wallet screening (Range)</td><td style="padding:10px 0;border-top:1px solid #f1f5f9;text-align:right"><span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;color:#fff;background:${riskColor}">${risk}</span></td></tr>
    ${row("Risk score", String(d.aml.riskScore))}
  </table>

  <h2>Transaction Activity</h2>
  <table>
    ${row("Completed payments", String(d.activity.completedPayments))}
    ${row("Total volume", usd(d.activity.totalVolumeUSDC) + " USDC")}
  </table>

  <h2>Off-ramp Settlement</h2>
  <table>
    ${row("Settled to USD", `${d.offramp.settledCount} payouts · ${usd(d.offramp.settledTotalUSD)}`)}
    ${row("Pending", String(d.offramp.pendingCount))}
  </table>

  <div class="statement">
    This report aggregates identity verification (KYB via Sumsub), wallet-level
    AML and sanctions screening (via Range), and on-chain transaction activity
    recorded by Offbank for the business named above. It is generated directly
    from platform records to support the merchant's banking and compliance review.
  </div>

  <div class="footer"><span>Offbank · offbankpay.com</span><span>Generated ${generated}</span></div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) {
      // Pop-up blocked - fall back to the JSON export so the click still does something.
      downloadJson();
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // Load merchant settings
  useEffect(() => {
    async function loadSettings() {
      if (!publicKey) return;

      try {
        const res = await fetch(`/api/merchants/settings?wallet=${publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setSettings({
            kycEnabled: data.kycEnabled || false,
            kycLevel: data.kycLevel || "basic-kyc-level",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    if (connected) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [publicKey, connected]);

  // Save settings
  const saveSettings = async () => {
    if (!publicKey) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/merchants/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey,
          kycEnabled: settings.kycEnabled,
          kycLevel: settings.kycLevel,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Not authenticated
  if (ready && !connected) {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-2xl border border-[#d3d3d3] bg-[#f2f2f2] p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#34c759]/10">
            <Shield className="h-8 w-8 text-[#34c759]" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-[#212121]">
            Compliance Settings
          </h2>
          <p className="mb-6 text-[#8a8a8a]">
            Sign in to manage KYC/AML settings for your merchant account.
          </p>
          <button
            onClick={() => openWalletModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFFFFF] px-6 py-3 font-semibold text-[#212121]"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#34c759]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#8a8a8a] hover:text-[#212121]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#34c759]/10">
              <Shield className="h-6 w-6 text-[#34c759]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#212121]">
                Compliance Settings
              </h1>
              <p className="text-sm text-[#8a8a8a]">
                Configure KYC verification for your customers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Merchant KYB - verifying the business itself; feeds the dossier */}
        <BusinessVerification />

        {/* Compliance dossier - the bank/OTC-ready proof of clean funds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#34c759]" />
              <div>
                <p className="font-semibold text-[#212121]">Compliance dossier</p>
                <p className="mt-0.5 text-sm text-[#8a8a8a]">
                  One report proving your funds are clean - identity, KYB, AML
                  screening, on-chain volume, and settlement history. Send it to a
                  bank or settlement partner.
                </p>
              </div>
            </div>
            <button
              onClick={dossier ? downloadDossier : loadDossier}
              disabled={loadingDossier}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50 transition-colors"
            >
              {loadingDossier ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : dossier ? (
                <Download className="h-4 w-4" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              {dossier ? "Download PDF" : "Generate"}
            </button>
          </div>

          {dossier && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#F1F5F9] pt-4 sm:grid-cols-4">
                <DossierStat
                  label="KYB"
                  value={dossier.kyb.verified ? "Verified" : "Pending"}
                  ok={dossier.kyb.verified}
                />
                <DossierStat
                  label="AML risk"
                  value={dossier.aml.flagged ? "Flagged" : dossier.aml.riskLevel}
                  ok={!dossier.aml.flagged}
                />
                <DossierStat
                  label="Volume"
                  value={dossier.activity.totalVolumeUSDC.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                />
                <DossierStat
                  label="Payments"
                  value={String(dossier.activity.completedPayments)}
                />
              </div>
              <p className="mt-3 text-xs text-[#8a8a8a]">
                &ldquo;Download PDF&rdquo; opens a print-ready report - choose
                &ldquo;Save as PDF&rdquo;.{" "}
                <button
                  onClick={downloadJson}
                  className="underline hover:text-[#212121]"
                >
                  Export raw data (JSON)
                </button>
              </p>
            </>
          )}
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-start gap-3 rounded-xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 p-4"
        >
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#34c759]" />
          <div className="text-sm text-[#34c759]">
            <p className="font-medium">Why enable KYC?</p>
            <p className="mt-1 text-[#34c759]/80">
              KYC (Know Your Customer) verification is required for licensed
              cannabis operators and helps prevent fraud. Customers complete a
              quick ID verification before their first payment.
            </p>
          </div>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#d3d3d3] bg-[#f2f2f2] p-6"
        >
          {/* KYC Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#212121]">
                Enable Customer Verification
              </h3>
              <p className="text-sm text-[#8a8a8a]">
                Require customers to verify identity before payment
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, kycEnabled: !s.kycEnabled }))
              }
              className={`relative h-7 w-12 rounded-full transition-colors ${
                settings.kycEnabled ? "bg-[#34c759]" : "bg-[#f2f2f2]"
              }`}
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-[#FFFFFF] transition-transform ${
                  settings.kycEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* KYC Level Selection */}
          {settings.kycEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-[#d3d3d3] pt-6"
            >
              <h3 className="mb-4 font-semibold text-[#212121]">
                Verification Level
              </h3>
              <div className="space-y-3">
                {KYC_LEVELS.map((level) => (
                  <label
                    key={level.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                      settings.kycLevel === level.id
                        ? "border-[#8e24aa] bg-[#34c759]/10"
                        : "border-[#d3d3d3] hover:border-[#d3d3d3]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kycLevel"
                      value={level.id}
                      checked={settings.kycLevel === level.id}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          kycLevel: e.target.value as any,
                        }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#212121]">
                          {level.name}
                        </span>
                        {level.recommended && (
                          <span className="rounded bg-[#34c759]/15 px-2 py-0.5 text-xs text-[#34c759]">
                            Recommended for cannabis
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#8a8a8a]">
                        {level.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#e74c3c]/10 p-3 text-sm text-[#e74c3c]">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex items-center justify-end gap-4">
            {saved && (
              <span className="flex items-center gap-2 text-sm text-[#34c759]">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved
              </span>
            )}
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFFFFF] px-6 py-3 font-semibold text-[#212121] transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </motion.div>

        {/* Pricing Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-sm text-[#8a8a8a]"
        >
          KYC verification is billed per successful verification.{" "}
          <Link href="/onboarding" className="text-[#34c759] hover:underline">
            Contact us for pricing
          </Link>
        </motion.p>
      </div>
    </div>
  );
}

function DossierStat({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-[#94A3B8]">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#212121]">
        {ok === true && <CheckCircle2 className="h-3.5 w-3.5 text-[#34c759]" />}
        {ok === false && <XCircle className="h-3.5 w-3.5 text-[#e74c3c]" />}
        {value}
      </div>
    </div>
  );
}
