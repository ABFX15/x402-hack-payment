"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { t, fadeUpScale } from "./shared";
import { SectionHeader } from "./SectionHeader";

const features = [
  "Instant USDC settlement",
  "Create invoices & payment links",
  "Email-based claiming",
  "Full compliance tools",
  "Explorer & transaction history",
  "Priority support",
];

export function Pricing() {
  return (
    <section className="py-[120px]" style={{ background: t.bgOff }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple and transparent pricing"
          subtitle="One flat rate. No monthly fees, no hidden charges, no minimums."
        />

        <motion.div
          className="mt-14 mx-auto max-w-md"
          variants={fadeUpScale}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div
            className="flex flex-col rounded-3xl p-8 text-white shadow-xl"
            style={{ background: t.green }}
          >
            <p className="text-lg font-bold">Pay as you go</p>
            <p className="mt-1 text-xs text-white/70">
              No setup fees. No monthly commitment.
            </p>
            <p className="mt-5">
              <span className="text-5xl font-bold">1%</span>
              <span className="text-sm text-white/70"> per transaction</span>
            </p>
            <div className="mt-6 flex-1 space-y-2.5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white/80" />
                  <span className="text-sm text-white/90">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/onboarding"
              className="mt-8 block rounded-full bg-white py-3 text-center text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ color: t.green }}
            >
              Get started
            </Link>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: t.muted }}>
            Doing more than $1M/month?{" "}
            <Link
              href="mailto:adam@settlr.dev?subject=Volume%20pricing%20enquiry"
              className="underline"
              style={{ color: t.green }}
            >
              Talk to us
            </Link>{" "}
            about volume pricing (down to 0.5%) and a dedicated success manager.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
