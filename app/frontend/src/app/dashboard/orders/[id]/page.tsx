"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  FileText,
  CreditCard,
  BookOpen,
  Check,
  CircleDot,
  Circle,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  Send,
  BadgeCheck,
  XCircle,
} from "lucide-react";

interface OrderLineItem {
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface LinkedInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  viewToken: string;
  paymentSignature?: string;
  paidAt?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  buyerWallet?: string;
  lineItems: OrderLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  expectedDate?: string;
  status: string;
  invoiceId?: string;
  paymentId?: string;
  txSignature?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  invoice?: LinkedInvoice | null;
}

type WorkflowStep = "order" | "invoice" | "payment" | "settled";

function getWorkflowSteps(
  order: OrderDetail,
): {
  step: WorkflowStep;
  label: string;
  sub: string;
  done: boolean;
  active: boolean;
}[] {
  const s = order.status;
  const hasInvoice = !!order.invoiceId;
  const isPaid =
    s === "paid" || !!order.paidAt || order.invoice?.status === "paid";
  const isCancelled = s === "cancelled";

  return [
    {
      step: "order",
      label: "Purchase Order",
      sub: isCancelled
        ? "Cancelled"
        : s === "draft"
        ? "Draft"
        : s === "submitted"
        ? "Submitted"
        : "Accepted",
      done:
        !isCancelled &&
        ["submitted", "accepted", "invoiced", "paid"].includes(s),
      active:
        !isCancelled &&
        ["draft", "submitted", "accepted"].includes(s) &&
        !hasInvoice,
    },
    {
      step: "invoice",
      label: "Invoice Sent",
      sub: hasInvoice
        ? `${order.invoice?.invoiceNumber || "Created"}`
        : "Pending",
      done: hasInvoice,
      active: hasInvoice && !isPaid,
    },
    {
      step: "payment",
      label: "Payment Received",
      sub: isPaid ? "USDC confirmed" : "Awaiting",
      done: isPaid,
      active: false,
    },
    {
      step: "settled",
      label: "Settled",
      sub: isPaid ? "On-chain ✓" : "-",
      done: isPaid,
      active: false,
    },
  ];
}

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  draft: { bg: "bg-[#5c5c5c]/30", text: "text-[#8a8a8a]", border: "border-[#d3d3d3]" },
  submitted: {
    bg: "bg-[#7086f2]/10",
    text: "text-[#7086f2]",
    border: "border-[#7086f2]/20",
  },
  accepted: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  invoiced: {
    bg: "bg-[#d29500]/10",
    text: "text-[#d29500]",
    border: "border-[#d29500]/20",
  },
  paid: {
    bg: "bg-[#34c759]/10",
    text: "text-[#34c759]",
    border: "border-[#34c759]/20",
  },
  cancelled: {
    bg: "bg-[#e74c3c]/10",
    text: "text-[#e74c3c]",
    border: "border-[#e74c3c]/20",
  },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { publicKey } = useActiveWallet();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!publicKey || !id) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { "x-merchant-wallet": publicKey },
      });
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setOrder(data);
    } catch {
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  }, [publicKey, id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const doAction = async (
    action: string,
    body: Record<string, string> = {},
  ) => {
    if (!publicKey || !order) return;
    setActionLoading(action);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-wallet": publicKey,
        },
        body: JSON.stringify({ action, ...body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Action failed");
      }
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#34c759]" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-lg text-center py-20">
        <AlertCircle className="h-10 w-10 text-[#e74c3c] mx-auto mb-4" />
        <p className="text-[#8a8a8a] mb-6">{error}</p>
        <Link
          href="/dashboard/orders"
          className="text-sm text-[#34c759] hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const steps = getWorkflowSteps(order);
  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.draft;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm text-[#5c5c5c] hover:text-[#212121] transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#212121] tracking-tight">
              {order.orderNumber}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} ${sc.border}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm text-[#5c5c5c] mt-1">
            {order.buyerCompany || order.buyerName} · {order.buyerEmail}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {order.status === "draft" && (
            <button
              onClick={() => doAction("update_status", { status: "submitted" })}
              disabled={!!actionLoading}
              className="flex items-center gap-2 rounded-lg bg-[#7086f2]/10 border border-[#7086f2]/20 px-4 py-2.5 text-sm font-semibold text-[#7086f2] hover:bg-[#7086f2]/20 transition-colors disabled:opacity-50"
            >
              {actionLoading === "update_status" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Order
            </button>
          )}
          {order.status === "submitted" && (
            <button
              onClick={() => doAction("update_status", { status: "accepted" })}
              disabled={!!actionLoading}
              className="flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 text-sm font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              {actionLoading === "update_status" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              Accept Order
            </button>
          )}
          {(order.status === "accepted" || order.status === "submitted") &&
            !order.invoiceId && (
              <button
                onClick={() => doAction("convert_to_invoice")}
                disabled={!!actionLoading}
                className="flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors disabled:opacity-50"
              >
                {actionLoading === "convert_to_invoice" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Convert to Invoice
              </button>
            )}
          {!isCancelled &&
            !order.paidAt &&
            order.status !== "invoiced" &&
            order.status !== "paid" && (
              <button
                onClick={() =>
                  doAction("update_status", { status: "cancelled" })
                }
                disabled={!!actionLoading}
                className="flex items-center gap-2 rounded-lg border border-[#d3d3d3] px-4 py-2.5 text-sm font-medium text-[#5c5c5c] hover:text-[#e74c3c] hover:border-[#e74c3c]/30 transition-colors disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-[#e74c3c]/10 border border-[#e74c3c]/20 p-4 text-sm text-[#e74c3c]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Workflow Timeline */}
      <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a] mb-6">
          Order → Invoice → Payment → Settled
        </h3>
        <div className="flex items-start gap-0">
          {steps.map((s, i) => {
            const Icon =
              s.step === "order"
                ? Package
                : s.step === "invoice"
                ? FileText
                : s.step === "payment"
                ? CreditCard
                : BookOpen;
            return (
              <div key={s.step} className="flex items-start flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      s.done
                        ? "border-[#34c759] bg-[#34c759]/10"
                        : s.active
                        ? "border-[#34c759] bg-transparent animate-pulse"
                        : "border-[#d3d3d3] bg-[#f2f2f2]"
                    }`}
                  >
                    {s.done ? (
                      <Check className="h-4 w-4 text-[#34c759]" />
                    ) : s.active ? (
                      <CircleDot className="h-4 w-4 text-[#34c759]" />
                    ) : (
                      <Icon
                        className={`h-4 w-4 ${
                          isCancelled ? "text-[#e74c3c]" : "text-[#8a8a8a]"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[12px] font-semibold ${
                      s.done || s.active ? "text-[#212121]" : "text-[#8a8a8a]"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`text-[11px] ${
                      s.done ? "text-[#34c759]" : "text-[#8a8a8a]"
                    }`}
                  >
                    {s.sub}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="mt-4 flex-shrink-0 w-12 mx-1">
                    <div
                      className={`h-0.5 w-full ${
                        s.done ? "bg-[#34c759]/40" : "bg-[#5c5c5c]"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Items */}
        <div className="lg:col-span-2 rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a] mb-4">
            Order Items
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d3d3d3] text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                <th className="pb-3 text-left font-semibold">Item</th>
                <th className="pb-3 text-left font-semibold">SKU</th>
                <th className="pb-3 text-center font-semibold">Qty</th>
                <th className="pb-3 text-right font-semibold">Unit Price</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d3d3d3]">
              {order.lineItems.map((li, i) => (
                <tr key={i}>
                  <td className="py-3 text-[#212121]">{li.description}</td>
                  <td className="py-3 font-mono text-[#5c5c5c] text-xs">
                    {li.sku || "-"}
                  </td>
                  <td className="py-3 text-center text-[#8a8a8a]">
                    {li.quantity}
                  </td>
                  <td className="py-3 text-right font-mono text-[#8a8a8a]">
                    $
                    {li.unitPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 text-right font-mono text-[#212121]">
                    $
                    {(li.quantity * li.unitPrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#d3d3d3]">
                <td
                  colSpan={4}
                  className="pt-3 text-right text-[#5c5c5c] text-xs uppercase"
                >
                  Subtotal
                </td>
                <td className="pt-3 text-right font-mono text-[#212121]">
                  $
                  {order.subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
              {order.taxRate > 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="pt-1 text-right text-[#5c5c5c] text-xs uppercase"
                  >
                    Tax ({order.taxRate}%)
                  </td>
                  <td className="pt-1 text-right font-mono text-[#212121]">
                    $
                    {order.taxAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )}
              <tr>
                <td
                  colSpan={4}
                  className="pt-2 text-right text-[11px] font-bold uppercase text-[#8a8a8a]"
                >
                  Total
                </td>
                <td className="pt-2 text-right text-lg font-bold text-[#34c759]">
                  $
                  {order.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                  <span className="ml-1 text-xs font-normal text-[#5c5c5c]">
                    USDC
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Details + Linked Invoice */}
        <div className="space-y-4">
          {/* Details Card */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a] mb-4">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#5c5c5c]">Created</dt>
                <dd className="text-[#212121]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </dd>
              </div>
              {order.terms && (
                <div className="flex justify-between">
                  <dt className="text-[#5c5c5c]">Terms</dt>
                  <dd className="text-[#212121]">{order.terms}</dd>
                </div>
              )}
              {order.expectedDate && (
                <div className="flex justify-between">
                  <dt className="text-[#5c5c5c]">Expected</dt>
                  <dd className="text-[#212121]">
                    {new Date(order.expectedDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {order.notes && (
                <div className="pt-2 border-t border-[#d3d3d3]">
                  <dt className="text-[#5c5c5c] text-[10px] uppercase mb-1">
                    Notes
                  </dt>
                  <dd className="text-[#5c5c5c] text-xs leading-relaxed">
                    {order.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Linked Invoice */}
          {order.invoice && (
            <div className="rounded-xl bg-[#ffffff] border border-[#34c759]/10 p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#34c759] mb-4 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Linked Invoice
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#5c5c5c]">Invoice #</dt>
                  <dd className="text-[#212121] font-mono">
                    {order.invoice.invoiceNumber}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5c5c5c]">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.invoice.status === "paid"
                          ? "bg-[#34c759]/10 text-[#34c759]"
                          : "bg-[#d29500]/10 text-[#d29500]"
                      }`}
                    >
                      {order.invoice.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5c5c5c]">Amount</dt>
                  <dd className="text-[#34c759] font-mono font-bold">
                    $
                    {order.invoice.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </dd>
                </div>
                {order.invoice.paidAt && (
                  <div className="flex justify-between">
                    <dt className="text-[#5c5c5c]">Paid</dt>
                    <dd className="text-[#212121]">
                      {new Date(order.invoice.paidAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>

              {order.invoice.paymentSignature && (
                <div className="mt-4 rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] p-3">
                  <span className="text-[10px] text-[#8a8a8a] uppercase block mb-1">
                    Tx Signature
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8a8a8a] truncate">
                      {order.invoice.paymentSignature.slice(0, 20)}...
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(order.invoice!.paymentSignature!)
                      }
                      className="text-[#8a8a8a] hover:text-[#212121] transition-colors"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-[#34c759]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <a
                      href={`https://explorer.solana.com/tx/${order.invoice.paymentSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8a8a8a] hover:text-[#34c759] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <Link
                href={`/dashboard/invoices`}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#d3d3d3] py-2 text-xs font-medium text-[#8a8a8a] hover:text-[#212121] hover:border-[#8a8a8a] transition-colors"
              >
                View Invoice Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Buyer Card */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a] mb-4">
              Buyer
            </h3>
            <dl className="space-y-2 text-sm">
              <dd className="text-[#212121] font-medium">{order.buyerName}</dd>
              {order.buyerCompany && (
                <dd className="text-[#8a8a8a]">{order.buyerCompany}</dd>
              )}
              <dd className="text-[#5c5c5c]">{order.buyerEmail}</dd>
              {order.buyerWallet && (
                <dd className="font-mono text-xs text-[#8a8a8a] truncate">
                  {order.buyerWallet}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
