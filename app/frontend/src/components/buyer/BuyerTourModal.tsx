"use client";

/**
 * BuyerTourModal - 3-step intro for first-time invoice/checkout buyers.
 * Renders once per browser (gated by localStorage) so repeat buyers don't
 * see it again. Dismissible at any time.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ShieldCheck, Undo2, ArrowRight } from "lucide-react";

const STORAGE_KEY = "offbank_buyer_tour_seen_v1";

const STEPS = [
  {
    icon: Mail,
    title: "You're paying in USDC",
    body: "USDC is a US-dollar stablecoin. 1 USDC = 1 USD. Funds settle to the merchant in seconds and they can cash out to USD whenever they're ready.",
  },
  {
    icon: ShieldCheck,
    title: "We can manage the wallet for you",
    body: "Click 'Pay with email' and we'll provision a secure wallet on your behalf. No seed phrase, no app to install. Already have Phantom or Solflare? Connect those instead.",
  },
  {
    icon: Undo2,
    title: "Refunds are merchant-initiated",
    body: "Need a refund or have a dispute? Reply to the merchant who sent the invoice - they can issue a refund directly from their dashboard. Offbank is the rails, not the seller.",
  },
];

export function BuyerTourModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        // Defer slightly so the page paints before the modal appears.
        const t = window.setTimeout(() => setOpen(true), 600);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* localStorage blocked - skip the tour */
    }
  }, []);

  const close = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="buyer-tour-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <button
              onClick={close}
              aria-label="Skip tour"
              className="absolute right-4 top-4 rounded-md p-1 text-[#8a8a8a] hover:bg-[#f2f2f2] hover:text-[#212121]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#34c759]/10">
              <Icon className="h-6 w-6 text-[#34c759]" />
            </div>

            <h2
              id="buyer-tour-title"
              className="text-xl font-semibold text-[#212121]"
            >
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c5c5c]">
              {current.body}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? "w-6 bg-[#34c759]" : "w-1.5 bg-[#d3d3d3]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {!isLast && (
                  <button
                    type="button"
                    onClick={close}
                    className="text-xs font-medium text-[#8a8a8a] hover:text-[#212121]"
                  >
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ba048]"
                >
                  {isLast ? "Got it" : "Next"}
                  {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
