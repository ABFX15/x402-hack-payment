"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { t, spring } from "./shared";
import { SectionHeader } from "./SectionHeader";

export function Testimonials() {
  return (
    <section className="py-[120px]" style={{ background: t.bg }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow="Proof"
          title="Proof, not promises"
          subtitle="Every settlement is verifiable on-chain. Here's what the first one looked like."
        />

        {/* Case study card */}
        <motion.div
          className="mx-auto mt-14 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <div
            className="overflow-hidden rounded-3xl border shadow-sm"
            style={{ borderColor: t.hair }}
          >
            {/* top accent bar */}
            <div className="h-1.5" style={{ background: t.green }} />

            <div className="p-8 sm:p-10">
              {/* headline stat */}
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[56px] font-extrabold leading-none tracking-tight sm:text-[72px]"
                  style={{ color: t.navy, fontFamily: t.sans }}
                >
                  &lt;5s
                </span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: t.green }}
                >
                  settlement time
                </span>
              </div>

              <p
                className="mt-4 max-w-xl text-[15px] leading-relaxed"
                style={{ color: "#5c5c5c" }}
              >
                Offbank moves USDC from buyer to supplier in under 5 seconds with
                zero chargebacks, zero holds, and an immutable audit trail on
                Solana. Currently live on devnet.
              </p>

              {/* metric pills */}
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  {
                    icon: Zap,
                    label: "Settlement time",
                    value: "<5 seconds",
                  },
                  {
                    icon: Shield,
                    label: "Chargebacks",
                    value: "0",
                  },
                  {
                    icon: TrendingUp,
                    label: "Fee paid",
                    value: "1% flat",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-2.5 rounded-full border px-4 py-2"
                    style={{ borderColor: t.hair }}
                  >
                    <m.icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: t.green }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#5c5c5c" }}
                    >
                      {m.label}:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: t.navy }}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:brightness-125"
                  style={{ color: t.green }}
                >
                  Read the full story
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
