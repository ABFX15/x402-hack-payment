"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, XCircle, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CheckoutSession {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantWallet: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  status: "pending" | "completed" | "expired" | "cancelled";
  expiresAt: number;
  paymentSignature?: string;
}

export default function CheckoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "error" | "expired" | "completed" | "redirecting"
  >("loading");

  // Load checkout session
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`/api/checkout/sessions?id=${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Checkout session not found");
          } else {
            setError("Failed to load checkout session");
          }
          setStatus("error");
          return;
        }

        const data: CheckoutSession = await response.json();
        setSession(data);

        if (data.status === "expired") {
          setStatus("expired");
        } else if (data.status === "completed") {
          setStatus("completed");
        } else {
          // Redirect to main checkout with session params
          setStatus("redirecting");
          const checkoutUrl = new URL("/checkout", window.location.origin);
          checkoutUrl.searchParams.set("amount", data.amount.toString());
          checkoutUrl.searchParams.set("merchant", data.merchantName);
          checkoutUrl.searchParams.set("to", data.merchantWallet);
          if (data.description) {
            checkoutUrl.searchParams.set("memo", data.description);
          }
          checkoutUrl.searchParams.set("session", data.id);
          checkoutUrl.searchParams.set("successUrl", data.successUrl);
          checkoutUrl.searchParams.set("cancelUrl", data.cancelUrl);

          router.push(checkoutUrl.toString());
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError("Failed to load checkout session");
        setStatus("error");
      }
    }

    loadSession();
  }, [sessionId, router]);

  // Loading state
  if (status === "loading" || status === "redirecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[#f472b6] animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">
            {status === "redirecting"
              ? "Redirecting to checkout..."
              : "Loading checkout..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Checkout Error</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Expired state
  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Session Expired
          </h1>
          <p className="text-zinc-400 mb-6">
            This checkout session has expired. Please request a new payment
            link.
          </p>
          {session?.cancelUrl ? (
            <a
              href={session.cancelUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </a>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  // Completed state
  if (status === "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Complete!
          </h1>
          <p className="text-zinc-400 mb-4">
            Your payment of ${session?.amount.toFixed(2)} USDC has been
            confirmed.
          </p>

          {session?.paymentSignature && (
            <a
              href={`https://explorer.solana.com/tx/${session.paymentSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f472b6] text-sm hover:underline font-semibold mb-6 inline-block"
            >
              View on Explorer →
            </a>
          )}

          {session?.successUrl && (
            <div className="mt-6">
              <a
                href={session.successUrl}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white font-semibold rounded-xl"
              >
                Continue
              </a>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
}
