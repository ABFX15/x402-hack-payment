"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { t, spring } from "./shared";
import { DashboardMock } from "./DashboardMock";

const proof = [
  "1% flat fee",
  "Settles in under a second",
  "Non-custodial, you hold the keys",
];

const headline = "The payment rail nobody can shut off.";

/* Scrolling proof band under the hero (Optimus-style marquee). */
const marqueeStats = [
  { value: "<1s", label: "settlement finality" },
  { value: "1%", label: "flat fee, all-in" },
  { value: "190+", label: "countries you can pay" },
  { value: "0", label: "chargebacks, ever" },
  { value: "$0", label: "frozen by a bank" },
  { value: "24/7", label: "instant USDC payouts" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const mockRef = useRef<HTMLDivElement>(null);

  // As the dashboard scrolls up into view, straighten it from a slight
  // back-tilt to flat and lift it up. Gives the shot real dimension.
  const { scrollYProgress } = useScroll({
    target: mockRef,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { ...spring, delay },
        };

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: t.bg }}>
      {/* colored gradient wash: white at top → soft blue → mint green lower */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #ffffff 16%, #e7f2ff 50%, #e4f8ef 100%)",
        }}
      />
      {/* soft green + teal + blue aurora blobs for life */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -left-32 top-20 h-[460px] w-[460px] rounded-full blur-[110px]"
          style={{ background: "radial-gradient(closest-side, rgba(52,199,89,0.36), transparent 70%)" }}
        />
        <div
          className="absolute right-[-6rem] top-8 h-[460px] w-[460px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(closest-side, rgba(0,213,184,0.34), transparent 70%)" }}
        />
        <div
          className="absolute left-1/2 top-[36%] h-[400px] w-[760px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: "radial-gradient(closest-side, rgba(96,165,250,0.28), transparent 70%)" }}
        />
      </div>

      {/* faint grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f0f0f2 1px, transparent 1px), linear-gradient(to bottom, #f0f0f2 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 55% at 50% 20%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 55% at 50% 20%, #000 40%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 pt-24 text-center sm:pt-28">
        <motion.div {...rise(0)} className="mb-7 flex justify-center">
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors"
            style={{ fontFamily: "var(--font-jetbrains), monospace", color: t.bodyLight }}
          >
            <span className="h-px w-8" style={{ background: t.border }} />
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span
                className="absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-70"
                style={{ background: t.green }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: t.green }} />
            </span>
            <span className="transition-colors group-hover:text-[#0d0d0f]">
              Live on Solana · instant USDC settlement
            </span>
          </Link>
        </motion.div>

        <h1
          className="mx-auto max-w-[960px] text-[clamp(2.75rem,8.4vw,92px)] font-extrabold leading-[0.98] tracking-[-0.035em]"
          style={{ fontFamily: t.sans, color: t.ink }}
        >
          {reduceMotion
            ? headline
            : headline.split(/(\s+)/).map((tok, wi) =>
                /^\s+$/.test(tok) ? (
                  tok
                ) : (
                  <span
                    key={wi}
                    className="char-blur-in inline-block"
                    style={{ animationDelay: `${0.12 + (wi / 2) * 0.07}s` }}
                  >
                    {tok}
                  </span>
                ),
              )}
        </h1>

        <motion.p
          {...rise(0.12)}
          className="mx-auto mt-6 max-w-[560px] text-[18px] leading-[1.6] sm:text-[19px]"
          style={{ color: t.bodyLight }}
        >
          Accept, invoice, and pay out in USDC at 1%. You hold the keys, so no
          bank, processor, or partner can freeze you.
        </motion.p>

        <motion.div
          {...rise(0.18)}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: t.green }}
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-xl border px-7 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:bg-[#f7f7f8]"
            style={{ borderColor: t.hair, color: t.ink }}
          >
            Watch demo
          </Link>
        </motion.div>

        <motion.div
          {...rise(0.24)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2"
        >
          {proof.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium"
              style={{ color: t.bodyLight }}
            >
              <Check className="h-4 w-4" style={{ color: t.green }} strokeWidth={2.5} />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* dashboard mock — glow + 3D tilt + browser chrome */}
      <div
        ref={mockRef}
        className="relative z-10 mx-auto mt-20 max-w-[1120px] px-6"
        style={{ perspective: 1600 }}
      >
        {/* green aurora glow behind the frame */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-6 bottom-0 z-0"
          style={{ opacity: reduceMotion ? 1 : glowOpacity }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(52,199,89,0.55), rgba(52,199,89,0) 70%)",
            }}
          />
          <div
            className="absolute left-[22%] top-[35%] h-[360px] w-[360px] -translate-x-1/2 rounded-full blur-[80px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(0,213,184,0.45), rgba(0,213,184,0) 70%)",
            }}
          />
          <div
            className="absolute left-[80%] top-[30%] h-[320px] w-[320px] -translate-x-1/2 rounded-full blur-[80px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(124,240,168,0.5), rgba(124,240,168,0) 70%)",
            }}
          />
          <div
            className="absolute left-[70%] top-[55%] h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-[85px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(96,165,250,0.45), rgba(96,165,250,0) 70%)",
            }}
          />
        </motion.div>

        <motion.div
          className="relative z-10 origin-top"
          style={
            reduceMotion
              ? undefined
              : { rotateX, scale, transformStyle: "preserve-3d" }
          }
        >
          {/* gradient ring wrapper */}
          <div
            className="rounded-[20px] p-[1.5px] shadow-[0_50px_120px_-30px_rgba(52,199,89,0.45),0_30px_60px_-24px_rgba(13,13,15,0.35)]"
            style={{
              background:
                "linear-gradient(160deg, rgba(52,199,89,0.75), rgba(96,165,250,0.45) 50%, rgba(0,213,184,0.55))",
            }}
          >
            <div className="overflow-hidden rounded-[19px] bg-white">
              {/* browser chrome bar */}
              <div className="flex h-10 items-center gap-2 border-b bg-[#fafafb] px-4" style={{ borderColor: t.hair }}>
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] font-medium text-[#8a8a8a] ring-1 ring-[#ececef]">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2}>
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  app.offbankpay.com/dashboard
                </div>
              </div>
              <DashboardMock />
            </div>
          </div>

          {/* soft reflection fading below */}
          <div
            aria-hidden
            className="pointer-events-none mx-auto mt-1 h-24 w-[92%] rounded-b-[40px] opacity-40 blur-md"
            style={{
              background:
                "linear-gradient(to bottom, rgba(52,199,89,0.18), transparent)",
            }}
          />
        </motion.div>
      </div>

      {/* scrolling proof band — Optimus-style marquee of key metrics */}
      <div
        className="relative z-10 mt-20 overflow-hidden border-y"
        style={{ borderColor: t.hair }}
      >
        {/* edge fades so the strip melts into the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
          style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
          style={{ background: "linear-gradient(to left, #ffffff, transparent)" }}
        />
        <div className={`flex w-max${reduceMotion ? "" : " marquee-track"}`}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
              {marqueeStats.map((s) => (
                <div
                  key={`${dup}-${s.label}`}
                  className="flex items-baseline gap-2.5 whitespace-nowrap px-8 py-5"
                >
                  <span
                    className="text-[26px] font-extrabold tracking-[-0.02em]"
                    style={{ color: t.ink }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="text-[12px] uppercase tracking-[0.12em]"
                    style={{ fontFamily: "var(--font-jetbrains), monospace", color: t.bodyLight }}
                  >
                    {s.label}
                  </span>
                  <span className="ml-4 h-1 w-1 rounded-full" style={{ background: t.green }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only">
        Offbank is USDC payment infrastructure for businesses banks won&apos;t
        reliably serve: high-risk e-commerce, iGaming, cross-border, and cannabis
        merchants. Accept payments via a drop-in checkout, invoicing, or a POS
        terminal, send instant payouts to anyone by email, and cash out to USD,
        all through one API and dashboard. When traditional processors freeze
        accounts, Offbank keeps settling: under a second, 1% flat, non-custodial,
        built on Solana.
      </p>
    </section>
  );
}
