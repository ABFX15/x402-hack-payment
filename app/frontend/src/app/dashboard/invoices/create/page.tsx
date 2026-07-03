"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Save,
  Loader2,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  Mail,
  AlertCircle,
  Check,
  Copy,
  Link2,
  ExternalLink,
  Eye,
  QrCode,
  ChevronDown,
} from "lucide-react";

/* ─── Types ─── */
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const TERMS_OPTIONS = [
  "Due on Receipt",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
  "Net 90",
  "Custom",
];

const ASSET_OPTIONS = ["USDC (Solana)"];

function getDueDateFromTerms(terms: string): Date {
  const now = new Date();
  switch (terms) {
    case "Due on Receipt":
      return now;
    case "Net 7":
      return new Date(now.getTime() + 7 * 86400000);
    case "Net 15":
      return new Date(now.getTime() + 15 * 86400000);
    case "Net 30":
      return new Date(now.getTime() + 30 * 86400000);
    case "Net 60":
      return new Date(now.getTime() + 60 * 86400000);
    case "Net 90":
      return new Date(now.getTime() + 90 * 86400000);
    default:
      return new Date(now.getTime() + 30 * 86400000);
  }
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { publicKey, connected } = useActiveWallet();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state
  const [createdInvoice, setCreatedInvoice] = useState<{
    invoiceNumber: string;
    total: number;
    invoiceUrl: string;
    blinkUrl: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Buyer info
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerWallet, setBuyerWallet] = useState("");

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Invoice details
  const [terms, setTerms] = useState("Due on Receipt");
  const [requestedAsset, setRequestedAsset] = useState("USDC (Solana)");
  const [customDueDate, setCustomDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [memo, setMemo] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Calculations
  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0,
  );
  const tax = taxRate ? subtotal * (parseFloat(taxRate) / 100) : 0;
  // Solana tx fee ~$0.00025, Offbank platform fee is 1% (deducted at settlement, not added)
  const networkFee = subtotal > 0 ? 0.001 : 0;
  const total = subtotal + tax;

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((li, i) => {
        if (i !== index) return li;
        return { ...li, [field]: value };
      }),
    );
  };

  const handleSubmit = async (sendEmail: boolean) => {
    setError(null);

    if (!publicKey) {
      setError("Connect your wallet to create invoices.");
      return;
    }
    if (!buyerName.trim()) {
      setError("Client name is required");
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setError("Valid email is required");
      return;
    }
    if (lineItems.some((li) => !li.description.trim())) {
      setError("All line items need a description");
      return;
    }
    if (lineItems.some((li) => li.unitPrice <= 0)) {
      setError("All line items need a price > $0");
      return;
    }

    setSaving(true);

    try {
      const dueDate =
        terms === "Custom" && customDueDate
          ? new Date(customDueDate)
          : getDueDateFromTerms(terms);

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-wallet": publicKey || "",
        },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerCompany: "",
          buyerWallet: buyerWallet.trim() || undefined,
          lineItems: lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            amount: li.quantity * li.unitPrice,
          })),
          taxRate: taxRate ? parseFloat(taxRate) : undefined,
          memo: memo.trim() || undefined,
          terms,
          dueDate: dueDate.toISOString(),
          invoiceNumber: invoiceNumber.trim() || undefined,
          sendEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create invoice");
      }

      const data = await res.json();
      setCreatedInvoice({
        invoiceNumber: data.invoiceNumber,
        total: data.total,
        invoiceUrl: data.invoiceUrl,
        blinkUrl: data.blinkUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /* ─── Success screen ─── */
  if (createdInvoice) {
    const dialtoUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(
      createdInvoice.blinkUrl,
    )}`;
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34c759]/10">
          <Check className="h-8 w-8 text-[#34c759]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Invoice Sent</h1>
          <p className="mt-2 text-sm text-[#8a8a8a]">
            <span className="font-mono font-medium text-[#212121]">
              {createdInvoice.invoiceNumber}
            </span>{" "}
            for{" "}
            <span className="font-mono font-semibold text-[#34c759]">
              $
              {createdInvoice.total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              USDC
            </span>
          </p>
        </div>

        {/* Blink URL */}
        <div className="rounded-xl border border-[#d3d3d3] bg-[#ffffff] p-6 text-left">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[#34c759]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5c5c5c]">
              Pay Link (Blink)
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] p-3">
            <code className="flex-1 truncate text-xs text-[#5c5c5c]">
              {createdInvoice.blinkUrl}
            </code>
            <button
              onClick={() => copyToClipboard(createdInvoice.blinkUrl, "blink")}
              aria-label={
                copiedField === "blink" ? "Blink URL copied" : "Copy Blink URL"
              }
              className="shrink-0 rounded-lg p-2 text-[#34c759] hover:bg-[#34c759]/10 transition-colors"
            >
              {copiedField === "blink" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-[#5c5c5c]">
              For Twitter / X unfurl:
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] p-3">
              <code className="flex-1 truncate text-xs text-[#5c5c5c]">
                {dialtoUrl}
              </code>
              <button
                onClick={() => copyToClipboard(dialtoUrl, "dialto")}
                aria-label={
                  copiedField === "dialto"
                    ? "Dialto URL copied"
                    : "Copy Dialto URL"
                }
                className="shrink-0 rounded-lg p-2 text-[#34c759] hover:bg-[#34c759]/10 transition-colors"
              >
                {copiedField === "dialto" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Link */}
        <div className="rounded-xl border border-[#d3d3d3] bg-[#ffffff] p-6 text-left">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#34c759]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5c5c5c]">
              Invoice Link
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] p-3">
            <code className="flex-1 truncate text-xs text-[#5c5c5c]">
              {createdInvoice.invoiceUrl}
            </code>
            <button
              onClick={() =>
                copyToClipboard(createdInvoice.invoiceUrl, "invoice")
              }
              aria-label={
                copiedField === "invoice"
                  ? "Invoice link copied"
                  : "Copy invoice link"
              }
              className="shrink-0 rounded-lg p-2 text-[#34c759] hover:bg-[#34c759]/10 transition-colors"
            >
              {copiedField === "invoice" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <a
              href={createdInvoice.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open invoice in new tab"
              className="shrink-0 rounded-lg p-2 text-[#34c759] hover:bg-[#34c759]/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard/invoices"
            className="rounded-lg border border-[#d3d3d3] px-5 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors"
          >
            View All Invoices
          </Link>
          <button
            onClick={() => {
              setCreatedInvoice(null);
              setBuyerName("");
              setBuyerEmail("");
              setBuyerWallet("");
              setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);
              setTerms("Due on Receipt");
              setCustomDueDate("");
              setTaxRate("");
              setMemo("");
              setInvoiceNumber("");
            }}
            className="rounded-lg bg-[#34c759] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold">
            New Transaction
          </span>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight mt-1">
            Create Invoice
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#5c5c5c] uppercase tracking-wider block">
            Draft Status
          </span>
          <span className="text-sm text-[#5c5c5c]">Unsaved Progress</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-[#e74c3c]/10 border border-[#e74c3c]/20 p-4 text-sm text-[#e74c3c]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient Information */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-[#34c759]" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
                Recipient Information
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Client Name / Business
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Ether Distribution Ltd"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none transition-colors focus:border-[#34c759]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="billing@retailer.io"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none transition-colors focus:border-[#34c759]/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Recipient Wallet Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buyerWallet}
                    onChange={(e) => setBuyerWallet(e.target.value)}
                    placeholder="So1ana..."
                    className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 pr-10 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none transition-colors focus:border-[#34c759]/50 font-mono"
                  />
                  <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#34c759]" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
                  Product Details
                </h2>
              </div>
              <button
                onClick={addLineItem}
                className="text-[11px] font-semibold text-[#34c759] hover:text-[#2ba048] transition-colors flex items-center gap-1"
              >
                + Add Item
              </button>
            </div>

            {/* Table header */}
            <div className="hidden grid-cols-12 gap-3 text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a] mb-3 sm:grid">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-center">Unit Price (USD)</div>
              <div className="col-span-2" />
            </div>

            <div className="space-y-3">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="text"
                      value={li.description}
                      onChange={(e) =>
                        updateLineItem(i, "description", e.target.value)
                      }
                      placeholder="Product or service description"
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      value={li.quantity || ""}
                      onChange={(e) =>
                        updateLineItem(
                          i,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min={1}
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-center text-sm text-[#212121] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <input
                      type="number"
                      value={li.unitPrice || ""}
                      onChange={(e) =>
                        updateLineItem(
                          i,
                          "unitPrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-center text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end">
                    <button
                      onClick={() => removeLineItem(i)}
                      disabled={lineItems.length === 1}
                      className="rounded-lg p-2 text-[#8a8a8a] hover:text-[#e74c3c] hover:bg-[#e74c3c]/80/10 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Options */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <div className="mb-5 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#34c759]" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
                Settlement Options
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Requested Asset
                </label>
                <select
                  value={requestedAsset}
                  onChange={(e) => setRequestedAsset(e.target.value)}
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] outline-none appearance-none cursor-pointer focus:border-[#34c759]/50"
                >
                  {ASSET_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Payment Terms
                </label>
                <select
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] outline-none appearance-none cursor-pointer focus:border-[#34c759]/50"
                >
                  {TERMS_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Sales Tax / VAT (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] outline-none focus:border-[#34c759]/50"
                />
                <div className="mt-1 text-[10px] text-[#8a8a8a]">
                  Optional. Applied to subtotal. Tracked for reporting.
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Memo / Notes
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Internal reference, PO number, etc."
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] outline-none focus:border-[#34c759]/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Summary */}
        <div className="space-y-4">
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6 sticky top-20">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5c5c5c] mb-5">
              Invoice Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8a8a8a]">Subtotal</span>
                <span className="text-[#212121] font-mono">
                  $
                  {subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8a8a8a]">Solana Network Fee</span>
                <span className="text-[#34c759] font-mono">
                  {subtotal > 0 ? "~$0.001" : "$0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8a8a8a]">Offbank Fee (1%)</span>
                <span className="text-[#8a8a8a] font-mono">
                  $
                  {(subtotal * 0.01).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                  <span className="text-xs ml-1">(deducted at settlement)</span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8a8a8a]">Tax ({taxRate || "0"}%)</span>
                <span className="text-[#212121] font-mono">
                  ${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-[#d3d3d3] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#5c5c5c] uppercase tracking-wider">
                    Total Due
                  </span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-3xl font-bold text-[#34c759]">
                    $
                    {total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <div className="text-[11px] text-[#5c5c5c] mt-0.5">
                    ~
                    {total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    USDC
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#34c759] px-5 py-3 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Generate & Send
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#d3d3d3] px-5 py-3 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                Preview PDF
              </button>
              <button className="w-full text-center text-[11px] text-[#5c5c5c] uppercase tracking-wider hover:text-[#8a8a8a] transition-colors py-2">
                Save as Template
              </button>
            </div>

            {/* Trust note */}
            <div className="mt-4 rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] p-3">
              <p className="text-[11px] text-[#8a8a8a] italic leading-relaxed">
                Invoices generated by Offbank are cryptographically signed.
                Payments are settled directly via smart contract to ensure
                atomic swaps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wholesale Tip */}
      <div className="rounded-xl bg-[#34c759]/5 border border-[#34c759]/10 p-5">
        <div className="flex items-start gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#34c759] uppercase tracking-wider">
              Wholesale Tip
            </span>
            <p className="text-sm text-[#8a8a8a] mt-1 leading-relaxed">
              Keep invoice settlement standardized on Solana USDC to simplify
              treasury reconciliation, reduce support overhead, and keep every
              payment flow consistent for buyers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
