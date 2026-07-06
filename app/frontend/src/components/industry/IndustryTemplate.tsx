"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Ban,
  Shield,
  Zap,
  Lock,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

export type IndustryStat = { value: string; label: string };
export type IndustryProblem = { title: string; desc: string };
export type IndustrySolution = {
  title: string;
  desc: string;
  icon?: LucideIcon;
};
export type IndustryFAQ = { q: string; a: string };

export type IndustryConfig = {
  /** URL slug for canonical/links (no leading slash) */
  slug: string;
  /** Page H1 */
  title: string;
  /** Single-sentence subhead */
  subhead: string;
  /** Eyebrow tag above the title (e.g. "International Wholesale") */
  eyebrow: string;
  /** Hero badge stats, three short metrics shown under CTAs */
  heroStats: IndustryStat[];
  /** "Why traditional rails fail" section, 4 problems */
  problems: IndustryProblem[];
  /** "How Offbank fixes it" section, 4 solutions */
  solutions: IndustrySolution[];
  /** Use-case scenarios, short bullet list */
  useCases: string[];
  /** Compliance bullets shown in the compliance band */
  complianceBullets: string[];
  /** FAQ entries specific to this industry */
  faqs: IndustryFAQ[];
  /** Optional "Related reading" links (e.g. relevant blog posts) */
  relatedReading?: { href: string; label: string }[];
};

export function IndustryTemplate({ config }: { config: IndustryConfig }) {
  const {
    title,
    subhead,
    eyebrow,
    heroStats,
    problems,
    solutions,
    useCases,
    complianceBullets,
    faqs,
    relatedReading,
  } = config;

  return (
    <main className="bg-white text-[#212121]">
      <Navbar />

      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0b0f0c] pt-32 pb-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 0% 30%, rgba(52,199,89,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 70%, rgba(52,199,89,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1100px] px-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#34c759]/30 bg-[#34c759]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#34c759]"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-[40px] leading-[1.08] font-extrabold tracking-tight text-white sm:text-[56px] lg:text-[64px]"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-white/75"
          >
            {subhead}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-full bg-[#34c759] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/[0.06]"
            >
              Watch Demo
            </Link>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 + i * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-3xl font-extrabold text-[#34c759]">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-white/70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEMS ────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <h2 className="text-center text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
            Why traditional rails fail you
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-[#5c5c5c]">
            Banks, processors, and money movers weren&apos;t built for the
            friction your category deals with daily.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {problems.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="rounded-2xl border border-[#eee] bg-[#fafafa] p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e74c3c]/10">
                    <Ban className="h-4 w-4 text-[#e74c3c]" />
                  </div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-[#5c5c5c]">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTIONS ───────────────────────────────────── */}
      <section className="bg-[#f7f7f7] py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <h2 className="text-center text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
            How Offbank fixes it
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-[#5c5c5c]">
            Non-custodial USDC settlement on Solana. 1% flat. Cash out to USD
            via Sphere whenever you need it.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {solutions.map((s, i) => {
              const Icon = s.icon ?? Zap;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ ...spring, delay: i * 0.05 }}
                  className="rounded-2xl border border-[#eee] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#34c759]/10">
                      <Icon className="h-4 w-4 text-[#34c759]" />
                    </div>
                    <h3 className="text-lg font-bold">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#5c5c5c]">
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── USE CASES ───────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
            Where operators use it
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {useCases.map((u, i) => (
              <motion.li
                key={u}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...spring, delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-xl border border-[#eee] bg-[#fafafa] p-4"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#34c759]" />
                <span className="text-[14px] leading-relaxed text-[#212121]">
                  {u}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── COMPLIANCE BAND ─────────────────────────────── */}
      <section className="border-y border-[#eee] bg-[#fafafa] py-16">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-6 lg:grid-cols-[1fr_2fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#34c759]/30 bg-[#34c759]/10 px-3 py-1 text-xs font-semibold text-[#34c759]">
              <Shield className="h-3.5 w-3.5" /> Compliance
            </div>
            <h3 className="mt-4 text-2xl font-extrabold leading-tight">
              Built for regulated, scrutinised commerce.
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#5c5c5c]">
              KYB, OFAC screening, BSA/AML monitoring, and on-chain auditability
              on every settlement and every counterparty.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {complianceBullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 rounded-xl border border-[#eee] bg-white p-4"
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#34c759]" />
                <span className="text-[13px] leading-relaxed text-[#5c5c5c]">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[820px] px-6">
          <h2 className="text-center text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
            Common questions
          </h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-[#eee] bg-[#fafafa] p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-semibold">
                  {f.q}
                  <Clock className="h-4 w-4 shrink-0 text-[#8a8a8a] transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-[#5c5c5c]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Related reading ─────────────────────────────── */}
      {relatedReading && relatedReading.length > 0 && (
        <section className="border-t border-[#ececef] bg-white py-16">
          <div className="mx-auto max-w-[820px] px-6">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#34c759]">
              Related reading
            </p>
            <ul className="space-y-3">
              {relatedReading.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="group inline-flex items-center gap-2 text-[17px] font-semibold text-[#0d0d0f] hover:text-[#2ba048]"
                  >
                    {r.label}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0b0f0c] py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 70% at 50% 50%, rgba(52,199,89,0.22) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[820px] px-6 text-center">
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight text-white sm:text-[44px]">
            Get paid in seconds, even when banks won&apos;t.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-white/70">
            Self-serve onboarding. KYB in minutes. 1% flat. No custody.
          </p>
          <Link
            href="/onboarding"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#34c759] px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
