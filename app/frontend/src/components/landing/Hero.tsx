"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { t, spring } from "./shared";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const dashY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden"
      style={{ backgroundColor: t.heroBase }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: reduceMotion ? 0 : bgY }}
      >
        <Image
          src="/hero-bg.png"
          alt="Dark atmospheric hero background with green lighting"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/50" />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 0% 50%, rgba(52,199,89,0.25) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 50% at 100% 50%, rgba(52,199,89,0.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 80% 30% at 50% 100%, rgba(52,199,89,0.22) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-[1400px] px-6 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
            <motion.div style={{ y: reduceMotion ? 0 : contentY }}>
              <h1
                className="text-[44px] leading-[1.08] tracking-tight drop-shadow-lg sm:text-[56px] lg:text-[64px]"
                style={{
                  fontFamily: t.sans,
                  fontWeight: 900,
                  color: t.onDark,
                  textShadow: "0 2px 30px rgba(0,0,0,0.7)",
                }}
              >
                The payment rail nobody can shut off.
              </h1>

              <p
                className="mt-7 max-w-lg text-[19px] font-normal leading-[1.65]"
                style={{
                  color: t.onDarkBody,
                  textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                }}
              >
                You hold the keys. Accept, invoice, and pay out in USDC at 1%,
                settled in under a second, on a rail no one can freeze.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
                  style={{ background: t.green }}
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/[0.06]"
                >
                  Watch demo
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: reduceMotion ? 0 : dashY }}
              initial={{ opacity: 0, x: 50, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...spring, delay: 0.35 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                <Image
                  src="/dashboard-mock.png"
                  alt="Offbank settlement dashboard showing volumes, transactions, and real-time settlement data"
                  width={960}
                  height={640}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="block w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <p className="sr-only">
        Offbank is USDC payment infrastructure for businesses banks won&apos;t
        reliably serve: high-risk e-commerce, iGaming, cross-border, and
        cannabis merchants. Accept payments via a drop-in checkout, invoicing,
        or a POS terminal, send instant payouts to anyone by email, and cash out
        to USD, all through one API and dashboard. When traditional processors
        freeze accounts, Offbank keeps settling: under a second, 1% flat,
        non-custodial, built on Solana.
      </p>
    </section>
  );
}
