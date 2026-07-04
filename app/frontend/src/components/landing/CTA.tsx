"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { t, spring } from "./shared";

export function CTA() {
  return (
    <section className="px-6 py-[120px]" style={{ background: t.bg }}>
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl px-6 py-24 text-center" style={{ background: t.green }}>
        {/* dotted pattern overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.35) 1.4px, transparent 1.4px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse 90% 90% at 50% 50%, #000 30%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 90% at 50% 50%, #000 30%, transparent 85%)",
          }}
        />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={spring}
        >
          <h2
            className="mx-auto max-w-[760px] text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-[56px]"
            style={{ fontFamily: t.sans }}
          >
            The rail they can&apos;t freeze.
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-[1.55] text-white/90">
            Accept, invoice, and pay out in USDC at 1%. Instant finality, cash
            out to USD whenever. Built for the businesses banks won&apos;t serve.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: t.greenHover }}
            >
              Get started
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-xl border border-white/50 px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
