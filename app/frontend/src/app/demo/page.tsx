"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  Stamp,
  Building2,
  FileText,
  Zap,
  Receipt,
  Loader2,
  Wallet,
  Link2,
  MessageSquare,
  Smartphone,
  Share2,
  QrCode,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { solscanUrl } from "@/lib/constants";
import { useRouter } from "next/navigation";

/* --- spring config --- */
const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

/* --- Steps --- */
const STEPS = [
  { id: 1, label: "Your Business", icon: Building2 },
  { id: 2, label: "Invoice", icon: FileText },
  { id: 3, label: "Settlement", icon: Zap },
  { id: 4, label: "Receipt", icon: Receipt },
  { id: 5, label: "Blinks", icon: Link2 },
] as const;

/* --- Offbank Verified Seal --- */
function VerifiedSeal({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#34c759]/20 bg-[#34c759]/[0.08] px-3 py-1 ${className}`}
    >
      <Stamp className="h-3.5 w-3.5 text-[#2ba048]" />
      <span
        className="text-[11px] font-semibold uppercase tracking-wider text-[#2ba048]"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        Offbank Verified
      </span>
    </div>
  );
}

/* --- Settlement progress animation --- */
function SettlementProgress({ onSettled }: { onSettled?: () => void }) {
  const [settled, setSettled] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(true);
      onSettled?.();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onSettled]);

  useEffect(() => {
    if (settled) return;
    const interval = setInterval(() => {
      setElapsed((e) => {
        if (e >= 4.0) return 4.0;
        return Math.round((e + 0.1) * 10) / 10;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [settled]);

  useEffect(() => {
    if (settled) setElapsed(4.0);
  }, [settled]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Traditional Rail */}
      <div className="rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#d29500]" />
          <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
            Traditional Wire
          </span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f2f2f2]">
            <motion.div
              className="h-full rounded-full bg-[#d29500]/40"
              initial={{ width: "0%" }}
              animate={{ width: "12%" }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium text-[#d29500]"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            PENDING
          </span>
          <span className="text-xs text-[#8a8a8a]">Est. 3-5 business days</span>
        </div>
        <div className="mt-4 rounded-lg bg-[#FFFBEB] p-3">
          <p className="text-xs text-[#92400E]">
            <strong>{"\u26A0"} Notice:</strong> Subject to manual bank review.
            High-risk MCC codes may trigger additional holds or account freeze.
          </p>
        </div>
      </div>

      {/* Offbank Rail */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-500"
        style={{
          borderColor: settled ? "#34c759" : "#d3d3d3",
          background: settled
            ? "linear-gradient(135deg, rgba(27,107,74,0.04), rgba(27,107,74,0.01))"
            : "white",
        }}
      >
        <AnimatePresence>
          {settled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.4, 1.8] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl border-2 border-[#34c759]"
            />
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#2ba048]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Offbank Private Rail
            </span>
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#34c759]/10">
              <motion.div
                className="h-full rounded-full bg-[#34c759]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {settled ? (
                <motion.div
                  key="settled"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={spring}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#2ba048]" />
                  <span
                    className="text-sm font-bold text-[#2ba048]"
                    style={{ fontFamily: "var(--font-jetbrains), monospace" }}
                  >
                    SETTLED
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="confirming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-[#2ba048]"
                  style={{ fontFamily: "var(--font-jetbrains), monospace" }}
                >
                  CONFIRMING...
                </motion.span>
              )}
            </AnimatePresence>
            <span
              className="text-xs text-[#8a8a8a]"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            >
              T+{elapsed.toFixed(1)}s
            </span>
          </div>

          <AnimatePresence>
            {settled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3, ...spring }}
                className="mt-4 rounded-lg bg-[#34c759]/[0.08] p-3"
              >
                <p className="text-xs text-[#2ba048]">
                  <strong>{"\u2713"} Final.</strong> Non-custodial settlement
                  complete. Funds cannot be frozen, reversed, or clawed back.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* --- Stepper indicator --- */
function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.id === current;
        const isDone = step.id < current;

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  background: isDone
                    ? "#34c759"
                    : isActive
                    ? "#212121"
                    : "#f2f2f2",
                  borderColor: isDone || isActive ? "transparent" : "#d3d3d3",
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border"
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-white" : "text-[#8a8a8a]"
                    }`}
                  />
                )}
              </motion.div>
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-wider sm:block ${
                  isActive
                    ? "text-[#212121]"
                    : isDone
                    ? "text-[#2ba048]"
                    : "text-[#8a8a8a]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="mb-5 hidden h-px w-8 sm:block md:w-16"
                style={{
                  background: step.id < current ? "#34c759" : "#d3d3d3",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --- Form field helper --- */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a8a8a]">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2.5 text-sm text-[#212121] placeholder:text-[#8a8a8a]/50 transition-colors focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]/20 ${
            prefix ? "pl-7" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* --- Select helper --- */
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#d3d3d3] bg-white px-3 py-2.5 text-sm text-[#212121] transition-colors focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* --- Type for form state --- */
interface DemoForm {
  businessName: string;
  licenseNumber: string;
  state: string;
  recipientName: string;
  recipientLicense: string;
  recipientState: string;
  amount: string;
  description: string;
}

const STATE_OPTIONS = [
  { value: "OR", label: "Oregon" },
  { value: "CO", label: "Colorado" },
  { value: "CA", label: "California" },
  { value: "WA", label: "Washington" },
  { value: "MI", label: "Michigan" },
  { value: "IL", label: "Illinois" },
  { value: "MA", label: "Massachusetts" },
  { value: "NV", label: "Nevada" },
  { value: "AZ", label: "Arizona" },
  { value: "NY", label: "New York" },
];

/* =================================================================
   STEP 1 - Business Details
   ================================================================= */
function StepBusiness({
  form,
  setForm,
}: {
  form: DemoForm;
  setForm: React.Dispatch<React.SetStateAction<DemoForm>>;
}) {
  const update = useCallback(
    (key: keyof DemoForm) => (v: string) =>
      setForm((f) => ({ ...f, [key]: v })),
    [setForm],
  );

  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={spring}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759] text-sm font-bold text-white">
          1
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
          Your Business
        </span>
      </div>

      <h1
        className="mb-2 text-3xl font-bold text-[#212121] md:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Enter Your Details
      </h1>
      <p className="mb-8 max-w-xl text-[#8a8a8a]">
        Fill in your business details to generate a compliant,
        cryptographically-secured invoice. This is a demo {"\u2014"} no real
        data is stored.
      </p>

      <div
        className="rounded-2xl border border-[#d3d3d3] bg-white p-6 md:p-8"
        style={{
          boxShadow:
            "0 4px 24px rgba(10,15,30,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Sender */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#2ba048]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2ba048]">
              Your Company (Sender)
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Business Name"
              value={form.businessName}
              onChange={update("businessName")}
              placeholder="Pacific Growers Collective"
            />
            <Field
              label="License Number"
              value={form.licenseNumber}
              onChange={update("licenseNumber")}
              placeholder="C12-0004782-LIC"
            />
            <SelectField
              label="State"
              value={form.state}
              onChange={update("state")}
              options={STATE_OPTIONS}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 border-t border-[#d3d3d3]" />

        {/* Recipient */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#8a8a8a]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">
              Recipient
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Business Name"
              value={form.recipientName}
              onChange={update("recipientName")}
              placeholder="Emerald Distribution Partners"
            />
            <Field
              label="License Number"
              value={form.recipientLicense}
              onChange={update("recipientLicense")}
              placeholder="D09-0011294-LIC"
            />
            <SelectField
              label="State"
              value={form.recipientState}
              onChange={update("recipientState")}
              options={STATE_OPTIONS}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 border-t border-[#d3d3d3]" />

        {/* Invoice details */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#8a8a8a]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">
              Invoice Details
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Settlement Amount"
              value={form.amount}
              onChange={update("amount")}
              placeholder="45000"
              type="number"
              prefix="$"
            />
            <Field
              label="Description"
              value={form.description}
              onChange={update("description")}
              placeholder="Bulk Flower - Indoor Premium"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =================================================================
   STEP 2 - Generated Invoice
   ================================================================= */
function StepInvoice({ form }: { form: DemoForm }) {
  const amount = parseFloat(form.amount) || 45000;
  const fee = amount * 0.01;
  const invId = useMemo(
    () =>
      `INV-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 9000 + 1000),
      )}`,
    [],
  );

  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={spring}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759] text-sm font-bold text-white">
          2
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
          The Clean Invoice
        </span>
      </div>

      <h2
        className="mb-2 text-3xl font-bold text-[#212121] md:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Cryptographically-Secured. Bank-Free.
      </h2>
      <p className="mb-8 max-w-xl text-[#8a8a8a]">
        Your invoice is ready. No bank routing numbers to leak, no wire
        instructions to mistype. Review and proceed to settlement.
      </p>

      {/* Glassmorphism invoice card */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #212121 0px, #212121 1px, transparent 1px, transparent 32px)",
          }}
        />

        <div
          className="relative rounded-2xl border border-white/60 p-6 shadow-xl backdrop-blur-sm md:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.88))",
            boxShadow:
              "0 8px 32px rgba(10,15,30,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h3
                  className="text-lg font-bold text-[#212121]"
                  style={{
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Invoice #{invId}
                </h3>
                <VerifiedSeal />
              </div>
              <p className="text-sm text-[#8a8a8a]">
                Issued{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                {"\u00B7"} Due on receipt
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#34c759]/20 bg-[#34c759]/[0.06] px-3 py-1.5">
              <Shield className="h-3.5 w-3.5 text-[#2ba048]" />
              <span className="text-xs font-medium text-[#2ba048]">
                KYB · AML · BSA reporting
              </span>
            </div>
          </div>

          {/* Parties */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
                From
              </p>
              <p className="font-semibold text-[#212121]">
                {form.businessName || "Pacific Growers Collective, LLC"}
              </p>
              <p className="text-sm text-[#8a8a8a]">
                License #{form.licenseNumber || "C12-0004782-LIC"} {"\u00B7"}{" "}
                {STATE_OPTIONS.find((s) => s.value === form.state)?.label ||
                  "Oregon"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
                To
              </p>
              <p className="font-semibold text-[#212121]">
                {form.recipientName || "Emerald Distribution Partners"}
              </p>
              <p className="text-sm text-[#8a8a8a]">
                License #{form.recipientLicense || "D09-0011294-LIC"} {"\u00B7"}{" "}
                {STATE_OPTIONS.find((s) => s.value === form.recipientState)
                  ?.label || "Colorado"}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="mb-6 overflow-hidden rounded-xl border border-[#d3d3d3]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d3d3d3] bg-[#f2f2f2]/60">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d3d3d3]">
                <tr>
                  <td className="px-4 py-3 text-sm text-[#212121]">
                    {form.description ||
                      "Bulk Flower - Indoor Premium (Hybrid)"}
                  </td>
                  <td
                    className="px-4 py-3 text-right text-sm font-medium text-[#212121]"
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                    }}
                  >
                    $
                    {amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & fee */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-[#8a8a8a]">
                Platform fee: $
                {fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                (1.00%)
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Payment accepted in USDC or PYUSD
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
                Total Due
              </p>
              <p
                className="text-3xl font-bold text-[#212121] md:text-4xl"
                style={{
                  fontFamily: "var(--font-heading)",
                }}
              >
                ${Math.floor(amount).toLocaleString("en-US")}
                <span className="text-xl text-[#8a8a8a]">
                  .{String(((amount % 1) * 100).toFixed(0)).padStart(2, "0")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =================================================================
   STEP 3 - Live Settlement
   ================================================================= */
function StepSettlement({ onSettled }: { onSettled: () => void }) {
  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={spring}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759] text-sm font-bold text-white">
          3
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
          T+0 Settlement
        </span>
      </div>

      <h2
        className="mb-2 text-3xl font-bold text-[#212121] md:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Settled. Not Pending.
      </h2>
      <p className="mb-8 max-w-xl text-[#8a8a8a]">
        In cannabis, &ldquo;settled&rdquo; means the money is safe {"\u2014"} it
        can&apos;t be frozen, reversed, or clawed back. Watch your settlement
        finalize in real time.
      </p>

      <SettlementProgress onSettled={onSettled} />
    </motion.div>
  );
}

/* =================================================================
   STEP 4 - Receipt
   ================================================================= */
function StepReceipt({
  form,
  realSignature,
}: {
  form: DemoForm;
  realSignature?: string | null;
}) {
  const amount = parseFloat(form.amount) || 45000;
  const fee = amount * 0.01;
  const [copied, setCopied] = useState(false);

  const isReal = !!realSignature;
  const fullTxId =
    realSignature ||
    "5KQrVxH9Bc3nGfKpM2wLj7dR4sTv6YhN8aE1uXqW0cFbJmA3iDpZoUy9tXgT8mZ";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTxId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      key="step-4"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={spring}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759] text-sm font-bold text-white">
          4
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
          The Audit Trail
        </span>
      </div>

      <h2
        className="mb-2 text-3xl font-bold text-[#212121] md:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        The Receipt Your CFO Actually Wants
      </h2>
      <p className="mb-8 max-w-xl text-[#8a8a8a]">
        Instant reconciliation. Every dollar traced to a verified source on an
        immutable ledger your auditors will love.
      </p>

      <div
        className="relative rounded-2xl border border-white/60 p-6 shadow-xl backdrop-blur-sm md:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.88))",
          boxShadow:
            "0 8px 32px rgba(10,15,30,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Receipt header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Settlement Receipt
            </p>
            <h3
              className="text-lg font-bold text-[#212121]"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              #INV-2026-0891
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <VerifiedSeal />
            {isReal ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2ba048]/20 bg-[#2ba048]/[0.08] px-3 py-1">
                <Fingerprint className="h-3 w-3 text-[#2ba048]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2ba048]">
                  Signed with real wallet
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#8a8a8a]/20 bg-[#8a8a8a]/[0.06] px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Simulated
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#d3d3d3] bg-[#f2f2f2] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Amount
            </p>
            <p
              className="text-xl font-bold text-[#212121]"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              $
              {amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="mt-0.5 text-xs text-[#8a8a8a]">
              {amount.toLocaleString("en-US", {
                minimumFractionDigits: 6,
              })}{" "}
              USDC
            </p>
          </div>

          <div className="rounded-xl border border-[#d3d3d3] bg-[#f2f2f2] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Time to Finality
            </p>
            <p
              className="text-xl font-bold text-[#2ba048]"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              4.0s
            </p>
            <p className="mt-0.5 text-xs text-[#8a8a8a]">
              vs. 3-5 days traditional
            </p>
          </div>

          <div className="rounded-xl border border-[#d3d3d3] bg-[#f2f2f2] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Platform Fee
            </p>
            <p
              className="text-xl font-bold text-[#212121]"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              $
              {fee.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="mt-0.5 text-xs text-[#8a8a8a]">
              1.00% flat {"\u00B7"} No hidden fees
            </p>
          </div>
        </div>

        {/* On-chain details */}
        <div className="space-y-4 rounded-xl border border-[#d3d3d3] bg-[#f2f2f2] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              On-Chain Transaction
            </span>
            <a
              href={isReal ? solscanUrl(fullTxId) : "#"}
              target={isReal ? "_blank" : undefined}
              rel={isReal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2ba048] hover:underline"
            >
              {isReal ? "View on Solscan (Devnet)" : "View on Solscan"}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <code
              className="flex-1 truncate rounded-md bg-[#212121]/[0.04] px-3 py-2 text-xs text-[#5c5c5c]"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              {fullTxId}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md border border-[#d3d3d3] bg-white p-2 text-[#8a8a8a] transition-colors hover:text-[#212121]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#2ba048]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#8a8a8a]">Block</p>
              <p
                className="text-sm font-medium text-[#212121]"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                #298,412,067
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8a8a8a]">Timestamp</p>
              <p
                className="text-sm font-medium text-[#212121]"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8a8a8a]">Network Fee</p>
              <p
                className="text-sm font-medium text-[#212121]"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                0.000005 SOL
              </p>
            </div>
          </div>
        </div>

        {/* Compliance stamps */}
        <div className="mt-6 flex flex-wrap gap-2">
          {["KYB Verified", "AML Screened", "BSA Reporting Ready"].map(
            (stamp) => (
              <div
                key={stamp}
                className="flex items-center gap-1.5 rounded-full border border-[#34c759]/15 bg-[#34c759]/[0.05] px-3 py-1.5"
              >
                <Check className="h-3 w-3 text-[#2ba048]" />
                <span className="text-xs font-medium text-[#2ba048]">
                  {stamp}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* =================================================================
   STEP 5 - Blinks (Shareable Pay Links)
   ================================================================= */
function StepBlinks({ form }: { form: DemoForm }) {
  const amount = parseFloat(form.amount) || 45000;
  const [copied, setCopied] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const demoBlinkUrl = `https://offbankpay.com/api/actions/pay?invoice=demo_${
    form.businessName?.replace(/\s+/g, "_").toLowerCase() || "pacific_growers"
  }`;

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(demoBlinkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      key="step-5"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={spring}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759] text-sm font-bold text-white">
          5
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#8a8a8a]">
          Solana Blinks
        </span>
      </div>

      <h2
        className="mb-2 text-3xl font-bold text-[#212121] md:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Share a Link. Get Paid.
      </h2>
      <p className="mb-8 max-w-xl text-[#8a8a8a]">
        Every Offbank invoice generates a{" "}
        <strong className="text-[#212121]">Solana Blink</strong> {"\u2014"} a
        shareable pay link that renders a native payment card in any compatible
        wallet. No app download. No login. Just tap &amp; pay.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Blink Preview Card */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
            Blink Preview
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, ...spring }}
            className="overflow-hidden rounded-2xl border border-[#d3d3d3] bg-white shadow-lg"
          >
            {/* Card header - simulates wallet rendering */}
            <div className="relative h-40 bg-gradient-to-br from-[#212121] to-[#1a2940] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759]">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Offbank
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-white/60">offbankpay.com</p>
                </div>
                <div className="rounded-md bg-white/10 px-2 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    Solana Action
                  </span>
                </div>
              </div>
              <p className="absolute bottom-5 left-5 text-lg font-bold text-white">
                Pay Invoice {"\u2014"} $
                {amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Card body */}
            <div className="p-5">
              <p className="mb-4 text-sm text-[#8a8a8a]">
                {form.businessName || "Pacific Growers Collective"} is
                requesting{" "}
                <span
                  className="font-semibold text-[#212121]"
                  style={{ fontFamily: "var(--font-jetbrains), monospace" }}
                >
                  {amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  USDC
                </span>{" "}
                for {form.description || "Bulk Flower - Indoor Premium"}.
              </p>

              <AnimatePresence>
                {showAnimation ? (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, ...spring }}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                    }}
                  >
                    Pay $
                    {amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    USDC
                  </motion.button>
                ) : (
                  <div className="h-11 w-full animate-pulse rounded-xl bg-[#d3d3d3]" />
                )}
              </AnimatePresence>

              <p className="mt-3 text-center text-[10px] text-[#8a8a8a]">
                Powered by Solana Actions {"\u00B7"} Non-custodial settlement
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right: How it works */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
            How Blinks Work
          </p>

          <div className="space-y-4">
            {[
              {
                icon: FileText,
                title: "Invoice creates a Blink",
                desc: "Every Offbank invoice auto-generates a Blink URL using the Solana Actions spec. No extra setup needed.",
              },
              {
                icon: Share2,
                title: "Share anywhere",
                desc: "Send the link via text, email, Slack, or embed in your ERP. Any Blinks-compatible client renders it.",
              },
              {
                icon: Smartphone,
                title: "Buyer taps & pays",
                desc: "Phantom, Backpack, or any Solana wallet renders the payment card. One tap to sign.",
              },
              {
                icon: Zap,
                title: "Instant settlement",
                desc: "USDC transfers atomically. No intermediary holds funds. T+0 finality.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * (i + 1), ...spring }}
                className="flex gap-4 rounded-xl border border-[#d3d3d3] bg-white p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#34c759]/[0.08]">
                  <item.icon className="h-5 w-5 text-[#2ba048]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#212121]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#8a8a8a]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Blink URL */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, ...spring }}
            className="mt-5 rounded-xl border border-[#d3d3d3] bg-[#f2f2f2] p-4"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Blink URL
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 truncate rounded-md bg-[#212121]/[0.04] px-3 py-2 text-xs text-[#5c5c5c]"
                style={{ fontFamily: "var(--font-jetbrains), monospace" }}
              >
                {demoBlinkUrl}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-md border border-[#d3d3d3] bg-white p-2 text-[#8a8a8a] transition-colors hover:text-[#212121]"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#2ba048]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Compatible wallets */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, ...spring }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {["Phantom", "Backpack", "Dialect", "Solflare"].map((wallet) => (
              <div
                key={wallet}
                className="flex items-center gap-1.5 rounded-full border border-[#d3d3d3] bg-white px-3 py-1.5"
              >
                <CheckCircle2 className="h-3 w-3 text-[#2ba048]" />
                <span className="text-xs font-medium text-[#5c5c5c]">
                  {wallet}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* =================================================================
   MAIN PAGE
   ================================================================= */
export default function DemoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [settlementDone, setSettlementDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [realSignature] = useState<string | null>(null);

  /* ── Wallet hooks ── */
  const { connected: authenticated, publicKey: walletPubkey } = useWallet();
  const { setVisible } = useWalletModal();

  const activeWallet = useMemo(() => {
    if (!walletPubkey) return undefined;
    return { address: walletPubkey.toBase58() };
  }, [walletPubkey]);

  const [form, setForm] = useState<DemoForm>({
    businessName: "",
    licenseNumber: "",
    state: "OR",
    recipientName: "",
    recipientLicense: "",
    recipientState: "CO",
    amount: "45000",
    description: "",
  });

  const canAdvance = useMemo(() => {
    if (step === 3) return settlementDone;
    return true;
  }, [step, settlementDone]);

  /* ── Route settlement into real checkout (fee-bearing transfer path) ── */
  const handleNext = useCallback(async () => {
    if (step >= 5) return;

    if (step === 2) {
      setIsProcessing(true);
      const merchantWallet = "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV";
      const settlementAmount = Number(form.amount || "0");
      const safeAmount =
        Number.isFinite(settlementAmount) && settlementAmount > 0
          ? settlementAmount
          : 45000;
      const memo = `Settlement: ${form.businessName || "Demo Business"}`;

      router.push(
        `/checkout?amount=${safeAmount.toFixed(
          2,
        )}&merchant=Offbank&to=${merchantWallet}&memo=${encodeURIComponent(
          memo,
        )}`,
      );
      return;
    }

    setStep((s) => s + 1);
  }, [step, form.businessName, form.amount, router]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    if (step === 3) {
      setSettlementDone(false);
    }
    setStep((s) => s - 1);
  }, [step]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFFFF]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-8 pt-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(27,107,74,0.10),transparent)]" />
          </div>
          <div className="absolute right-[15%] top-[20%] h-72 w-72 rounded-full bg-[#34c759]/[0.06] blur-[120px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2"
            >
              <Fingerprint className="h-4 w-4 text-[#2ba048]" />
              <span className="text-sm font-medium text-[#5c5c5c]">
                Interactive Demo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-4xl font-bold leading-[1.08] text-[#212121] md:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Try a Settlement
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#8a8a8a]"
            >
              Walk through a real B2B cannabis settlement in 5 steps. Enter your
              details, generate an invoice, watch it settle, get your receipt,
              and share a Blink.
            </motion.p>

            {/* Stepper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Stepper current={step} />
            </motion.div>
          </div>
        </section>

        {/* Step content */}
        <section className="relative px-4 pb-28 pt-8">
          <div className="mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              {step === 1 && <StepBusiness form={form} setForm={setForm} />}
              {step === 2 && (
                <>
                  <StepInvoice form={form} />

                  {/* Signing-mode indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, ...spring }}
                    className="mt-5 rounded-xl border border-[#d3d3d3] bg-white/80 p-4"
                  >
                    {authenticated && activeWallet ? (
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 shrink-0 text-[#2ba048]" />
                        <div>
                          <p className="text-sm font-semibold text-[#212121]">
                            Ready For Real Checkout
                          </p>
                          <p className="text-xs text-[#8a8a8a]">
                            Continue to run a real USDC transfer with automatic
                            platform fee split (
                            {activeWallet.address.slice(0, 4)}...
                            {activeWallet.address.slice(-4)})
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="h-5 w-5 shrink-0 text-[#8a8a8a]" />
                          <div>
                            <p className="text-sm font-semibold text-[#212121]">
                              Wallet Required
                            </p>
                            <p className="text-xs text-[#8a8a8a]">
                              Connect a wallet to continue to real checkout.
                              This path no longer simulates settlement.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setVisible(true)}
                          className="rounded-lg border border-[#34c759]/20 bg-[#34c759]/[0.06] px-4 py-2 text-xs font-semibold text-[#2ba048] transition-colors hover:bg-[#34c759]/[0.12]"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
              {step === 3 && (
                <StepSettlement onSettled={() => setSettlementDone(true)} />
              )}
              {step === 4 && (
                <StepReceipt form={form} realSignature={realSignature} />
              )}
              {step === 5 && <StepBlinks form={form} />}
            </AnimatePresence>
          </div>
        </section>

        {/* Navigation buttons */}
        <section className="sticky bottom-0 z-20 border-t border-[#d3d3d3] bg-[#FFFFFF]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <button
              onClick={handleBack}
              disabled={step <= 1}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-[#8a8a8a] transition-colors hover:text-[#212121] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    s.id === step
                      ? "w-6 bg-[#34c759]"
                      : s.id < step
                      ? "w-1.5 bg-[#34c759]/40"
                      : "w-1.5 bg-[#d3d3d3]"
                  }`}
                />
              ))}
            </div>

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canAdvance || isProcessing}
                className="group flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    canAdvance && !isProcessing
                      ? "linear-gradient(135deg, #34c759 0%, #2ba048 100%)"
                      : "#8a8a8a",
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Checkout...
                  </>
                ) : step === 2 ? (
                  <>
                    Continue To Real Checkout
                    <Zap className="h-4 w-4" />
                  </>
                ) : step === 3 && !settlementDone ? (
                  <>
                    Settling...
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : step === 4 ? (
                  <>
                    See Blink
                    <Link2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/onboarding"
                  className="group flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  }}
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <button
                  onClick={() => {
                    setStep(1);
                    setSettlementDone(false);
                  }}
                  className="rounded-lg border border-[#d3d3d3] px-5 py-2.5 text-sm font-semibold text-[#8a8a8a] transition-colors hover:text-[#212121]"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
