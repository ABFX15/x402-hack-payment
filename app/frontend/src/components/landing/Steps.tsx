"use client";

import { motion } from "framer-motion";
import { FileCheck, Send, Zap } from "lucide-react";
import { t, spring } from "./shared";
import { SectionHeader } from "./SectionHeader";

const steps = [
  {
    num: 1,
    title: "Connect your business",
    desc: "Complete KYB verification in minutes. No bank account required.",
    icon: FileCheck,
  },
  {
    num: 2,
    title: "Create an invoice or payment link",
    desc: "Send to any supplier or buyer by email. Set the amount, add a note, hit send.",
    icon: Send,
  },
  {
    num: 3,
    title: "Settlement in seconds",
    desc: "Recipient clicks the link, claims USDC via email. No wallet needed. Done.",
    icon: Zap,
  },
];

const cardVariant = (i: number) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...spring, delay: 0.15 + i * 0.15 },
  },
});

export function Steps() {
  return (
    <section className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow="How it works"
          title="From invoice to settled in seconds"
          subtitle="Connect, send, and settle. No bank account, no wallet for your recipient, no waiting."
        />

        {/* steps row */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* animated dashed connector line (desktop only), draws on scroll */}
          <motion.div
            className="pointer-events-none absolute top-[52px] left-[16.66%] right-[16.66%] hidden h-px md:block origin-left"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, #dfe3e8 0, #dfe3e8 8px, transparent 8px, transparent 16px)",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />

          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              variants={cardVariant(i)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="relative flex flex-col items-center text-center"
            >
              {/* numbered circle with pulse ring */}
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
              >
                {/* pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: t.green }}
                  animate={{
                    scale: [1, 1.6],
                    opacity: [0.3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: i * 0.5,
                  }}
                />
                <div
                  className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full text-[20px] font-bold text-white shadow-md"
                  style={{ background: t.green }}
                >
                  {s.num}
                </div>
              </motion.div>

              {/* icon */}
              <motion.div
                className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: t.greenWash }}
                whileHover={{
                  rotate: 8,
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <s.icon className="h-6 w-6" style={{ color: t.green }} />
              </motion.div>

              {/* text */}
              <h3
                className="mt-5 text-[18px] font-bold leading-snug"
                style={{ color: t.ink, fontFamily: t.sans }}
              >
                {s.title}
              </h3>
              <p
                className="mt-2 max-w-[280px] text-[14px] leading-relaxed"
                style={{ color: "#5c5c5c" }}
              >
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
