"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { t, spring, springFast } from "./shared";
import { SectionHeader } from "./SectionHeader";

const faqs = [
  {
    q: "What is Offbank?",
    a: "Non-custodial USDC invoicing for cannabis distributors, brands, and the wholesalers banks won't reliably serve. Send an invoice, your buyer pays it, you get USDC in seconds, and cash out to USD via ACH whenever you want. 1% flat. We never hold your funds.",
  },
  {
    q: "Do recipients need a crypto wallet?",
    a: "No. Recipients get an email with a claim link. They click it and receive their payment. No wallet, no app download, no crypto knowledge required.",
  },
  {
    q: "Is this legal?",
    a: "Yes. Offbank uses USDC (a fully-reserved, audited stablecoin issued by Circle) and performs KYB/KYC verification at first settlement. All transactions are recorded on-chain for full auditability.",
  },
  {
    q: "What if cannabis becomes federally legal?",
    a: "Cannabis is one of several verticals we serve. Our value proposition (1% flat, instant settlement, non-custodial) holds across CBD and hemp, firearms, and international wholesale regardless of any single vertical's regulatory status.",
  },
  {
    q: "How is this different from ACH or wire transfers?",
    a: "Instant settlement vs 3-5 days. 1% flat vs 5-9% high-risk processing fees. Non-custodial means no one can freeze your funds mid-transfer.",
  },
  {
    q: "Who controls the funds?",
    a: "You do. Offbank is non-custodial. Funds move peer-to-peer between multisig vaults that you and your counterparty control.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ ...spring, delay: index * 0.05 }}
      className="rounded-2xl border bg-white transition-colors"
      style={{ borderColor: open ? t.green : t.hair }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span
          className="text-[16px] font-semibold leading-snug"
          style={{ color: t.ink, fontFamily: t.sans }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 135 : 0 }}
          transition={springFast}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
          style={{
            background: open ? t.green : "#fff",
            borderColor: open ? t.green : t.hair,
          }}
        >
          <Plus className="h-4 w-4" style={{ color: open ? "#fff" : t.bodyLight }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.15 } }}
          >
            <p
              className="px-6 pb-5 pr-14 text-[15px] leading-relaxed"
              style={{ color: t.bodyLight }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="bg-white py-[120px]">
      <div className="mx-auto max-w-[820px] px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Answers to the common questions about how Offbank settles, stays compliant, and keeps you in control of your funds."
        />
        <div className="mt-14 space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
