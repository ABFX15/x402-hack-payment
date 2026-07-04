"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { t, spring, easeOutQuart } from "./shared";

/* ── animated counter ──────────────────────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setVal(Math.round(easeOutQuart(progress) * end));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

const stats = [
  { end: 100, suffix: "+", prefix: "", label: "Testnet transactions" },
  { end: 1, suffix: "s", prefix: "<", label: "Average settlement" },
  { end: 0, suffix: "%", prefix: "", label: "Bank dependency" },
  { end: 1, suffix: "%", prefix: "", label: "Flat fee" },
];

export function SocialProof() {
  return (
    <section className="w-full" style={{ background: "#f7f7f7" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-[120px]">
        {/* headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
          className="mx-auto max-w-2xl text-center"
        >
          <p
            className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: t.green }}
          >
            By the numbers
          </p>
          <h2
            className="text-[32px] leading-[1.08] tracking-[-0.03em] font-extrabold sm:text-[46px]"
            style={{ fontFamily: t.sans, color: t.ink }}
          >
            Built for the businesses banks won&apos;t serve
          </h2>
        </motion.div>

        {/* stats row */}
        <div className="mt-16 grid grid-cols-2 gap-y-12 gap-x-8 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.1 + i * 0.08 }}
            >
              <div
                className="text-[48px] font-extrabold leading-none tracking-tight text-[#212121] sm:text-[60px]"
                style={{ fontFamily: t.sans }}
              >
                {s.prefix}
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <p className="mt-3 text-sm" style={{ color: "#8a8a8a" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA link */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.4 }}
        >
          <Link
            href="#how-it-works"
            className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:brightness-125"
            style={{ color: t.green }}
          >
            See how it works
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
