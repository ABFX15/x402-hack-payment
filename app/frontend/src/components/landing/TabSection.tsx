"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { t, spring, springFast } from "./shared";

type Tab = "problem" | "solution" | "how";

const tabs: { key: Tab; label: string }[] = [
  { key: "problem", label: "The Problem" },
  { key: "solution", label: "The Solution" },
  { key: "how", label: "How It Works" },
];

export function TabSection() {
  const [active, setActive] = useState<Tab>("problem");

  return (
    <section className="py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: t.green }}
          >
            One rail, not five
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={spring}
            className="text-[32px] leading-[1.08] tracking-[-0.03em] font-extrabold sm:text-[46px]"
            style={{ color: t.ink, fontFamily: t.sans }}
          >
            Replace your entire payment stack
          </motion.h2>
          <p
            className="mx-auto mt-4 max-w-lg text-[17px] leading-[1.6]"
            style={{ color: t.bodyLight }}
          >
            No banks, no holds, no middlemen. One USDC rail for accepting,
            invoicing, and paying out.
          </p>
        </div>

        {/* pill tabs */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <div
            className="relative inline-flex rounded-full border bg-white p-1"
            style={{ borderColor: t.border }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className="relative rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-200"
                style={{ color: active === tab.key ? "#fff" : t.slate }}
              >
                {active === tab.key && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{ background: t.green }}
                    transition={springFast}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* tab content */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            {active === "problem" && <ProblemTab key="problem" />}
            {active === "solution" && <SolutionTab key="solution" />}
            {active === "how" && <HowTab key="how" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const tabMotion = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.98 },
  transition: { ...spring, duration: 0.3 },
};

function ProblemTab() {
  return (
    <motion.div {...tabMotion}>
      <div
        className="grid gap-8 rounded-3xl border bg-white p-8 shadow-sm sm:grid-cols-2 sm:p-10"
        style={{ borderColor: t.border }}
      >
        <div>
          <h3
            className="text-2xl font-extrabold"
            style={{ color: t.navy, fontFamily: t.sans }}
          >
            Your business is legal. Banking isn&apos;t.
          </h3>
          <p
            className="mt-3 text-[15px] font-normal leading-relaxed"
            style={{ color: t.bodyLight }}
          >
            High-risk operators (online stores Stripe drops, iGaming, CBD and
            hemp, firearms, cross-border wholesale, cannabis) still can&apos;t
            access basic financial infrastructure.
          </p>
          <div className="mt-5 space-y-2.5">
            {[
              "Banks freeze accounts without warning",
              "High-risk processors charge 5-9%",
              "Moving physical cash is dangerous",
              "No recourse when funds are frozen",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.15 + i * 0.06 }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8a8a8a]" />
                <span className="text-sm" style={{ color: t.slate }}>
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { stat: "5-9%", label: "Processing fees" },
            { stat: "72hrs", label: "Avg. freeze time" },
            { stat: "$0", label: "Recourse" },
            { stat: "100%", label: "Cash dependent" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-2xl border p-4 shadow-sm"
              style={{ borderColor: t.border }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.1 + i * 0.06 }}
            >
              <p className="text-2xl font-bold text-[#212121]">{s.stat}</p>
              <p className="mt-1 text-xs" style={{ color: "#5c5c5c" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SolutionTab() {
  return (
    <motion.div {...tabMotion}>
      <div
        className="grid gap-8 rounded-3xl border bg-white p-8 shadow-sm sm:grid-cols-2 sm:p-10"
        style={{ borderColor: t.border }}
      >
        <div>
          <h3
            className="text-2xl font-extrabold"
            style={{ color: t.navy, fontFamily: t.sans }}
          >
            USDC rails that don&apos;t need permission.
          </h3>
          <p
            className="mt-3 text-[15px] font-normal leading-relaxed"
            style={{ color: t.bodyLight }}
          >
            Non-custodial settlement on Solana. No intermediary, no custody, no
            freeze risk.
          </p>
          <div className="mt-5 space-y-2.5">
            {[
              "Open accounts in USDC, instantly",
              "Non-custodial peer-to-peer settlement",
              "No bank intermediary or approval",
              "GENIUS Act 2025 compliant",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.15 + i * 0.06 }}
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  style={{ color: t.green }}
                />
                <span className="text-sm" style={{ color: t.slate }}>
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { stat: "1%", label: "Flat fee" },
            { stat: "<5s", label: "Settlement" },
            { stat: "0", label: "Custody" },
            { stat: "24/7", label: "Uptime" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-2xl border p-4 shadow-sm"
              style={{ borderColor: t.border }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.1 + i * 0.06 }}
            >
              <p className="text-2xl font-bold" style={{ color: t.green }}>
                {s.stat}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#5c5c5c" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HowTab() {
  return (
    <motion.div {...tabMotion}>
      <div
        className="grid gap-8 rounded-3xl border bg-white p-8 shadow-sm sm:grid-cols-2 sm:p-10"
        style={{ borderColor: t.border }}
      >
        <div>
          <h3
            className="text-2xl font-extrabold"
            style={{ color: t.navy, fontFamily: t.sans }}
          >
            Three steps. No crypto required.
          </h3>
          <p
            className="mt-3 text-[15px] font-normal leading-relaxed"
            style={{ color: t.bodyLight }}
          >
            Connect, send, settle. Your counterparty claims via email.
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                n: "1",
                title: "Connect your business",
                desc: "KYB verification, licences, permits.",
              },
              {
                n: "2",
                title: "Send an invoice",
                desc: "Counterparty gets an email link.",
              },
              {
                n: "3",
                title: "Recipient claims",
                desc: "Click, verify, receive USDC. Done.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                className="flex gap-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.15 + i * 0.08 }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                  style={{ background: t.green }}
                >
                  {s.n}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: t.navy }}>
                    {s.title}
                  </p>
                  <p className="text-xs" style={{ color: t.slate }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          className="flex items-center justify-center rounded-2xl"
          style={{ background: t.greenLight }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.2 }}
        >
          <div className="py-10 text-center">
            <Send
              className="mx-auto h-12 w-12"
              style={{ color: t.green, opacity: 0.5 }}
            />
            <p className="mt-3 text-sm font-medium" style={{ color: t.green }}>
              Interactive demo
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
