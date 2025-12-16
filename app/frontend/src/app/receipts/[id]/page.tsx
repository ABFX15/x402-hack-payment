"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Receipt,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Wallet,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface ReceiptData {
  receiptId: string;
  paymentId: string;
  merchant: {
    id: string;
    name: string;
    wallet: string;
  };
  customer: {
    wallet: string;
  };
  amount: number;
  currency: string;
  description?: string;
  txSignature: string;
  explorerUrl: string;
  createdAt: string;
  completedAt: string;
  status: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const response = await fetch(`/api/receipts/${params.id}`);
        if (!response.ok) {
          throw new Error("Receipt not found");
        }
        const data = await response.json();
        setReceipt(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchReceipt();
    }
  }, [params.id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadPDF = () => {
    window.open(`/api/receipts/${params.id}?format=pdf`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Receipt className="w-12 h-12 text-[var(--primary)] animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading receipt...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pop-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Receipt Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "This receipt doesn't exist or has expired."}
          </p>
          <Link href="/" className="pop-button inline-flex">
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pop-card overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Payment Receipt</h1>
                  <p className="text-white/80 text-sm">{receipt.receiptId}</p>
                </div>
              </div>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="p-6 border-b-2 border-black text-center bg-gray-50">
            <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
            <p className="text-4xl font-bold text-gray-900">
              ${receipt.amount.toFixed(2)}
              <span className="text-lg text-gray-500 ml-2">
                {receipt.currency}
              </span>
            </p>
            {receipt.description && (
              <p className="text-gray-600 mt-2">{receipt.description}</p>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Merchant */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Building2 className="w-4 h-4" />
                Merchant
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">
                  {receipt.merchant.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm text-gray-600">
                    {receipt.merchant.wallet.slice(0, 8)}...
                    {receipt.merchant.wallet.slice(-8)}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(receipt.merchant.wallet, "merchant")
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copied === "merchant" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Wallet className="w-4 h-4" />
                Paid From
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-gray-600">
                    {receipt.customer.wallet.slice(0, 8)}...
                    {receipt.customer.wallet.slice(-8)}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(receipt.customer.wallet, "customer")
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copied === "customer" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <ExternalLink className="w-4 h-4" />
                Transaction
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-gray-600">
                    {receipt.txSignature.slice(0, 16)}...
                    {receipt.txSignature.slice(-8)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(receipt.txSignature, "tx")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copied === "tx" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={receipt.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline text-sm font-medium"
                    >
                      View on Explorer →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                Timestamps
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Initiated</span>
                  <span className="text-gray-900">
                    {new Date(receipt.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="text-gray-900">
                    {new Date(receipt.completedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600">
                {receipt.status.charAt(0).toUpperCase() +
                  receipt.status.slice(1)}
              </span>
            </div>
            <span className="text-sm text-[var(--primary)] font-semibold">
              Powered by Settlr
            </span>
          </div>
        </motion.div>

        {/* Print/Share buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => window.print()}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Print Receipt
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => {
              navigator.share?.({
                title: `Receipt ${receipt.receiptId}`,
                url: window.location.href,
              });
            }}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
