"use client";

import { motion } from "framer-motion";
import { Check, X, Snowflake, KeyRound } from "lucide-react";
import { t, spring, staggerContainer, fadeUpScale } from "./shared";

/**
 * The core USP: the market forces high-risk merchants into a false choice -
 * custodial processors (bankable, but they can freeze you) vs. raw crypto
 * (unfreezable, but you're on your own for compliance/off-ramp). Offbank is the
 * only option that's BOTH. This section makes that choice visible.
 */

type Row = {
  label: string;
  custodial: boolean;
  rawCrypto: boolean;
  offbank: boolean;
};

const rows: Row[] = [
  {
    label: "No one can freeze your funds",
    custodial: false,
    rawCrypto: true,
    offbank: true,
  },
  {
    label: "You hold the keys (self-custodial)",
    custodial: false,
    rawCrypto: true,
    offbank: true,
  },
  { label: "No chargebacks", custodial: false, rawCrypto: true, offbank: true },
  {
    label: "KYB / AML built in",
    custodial: true,
    rawCrypto: false,
    offbank: true,
  },
  {
    label: "Compliant USD off-ramp",
    custodial: true,
    rawCrypto: false,
    offbank: true,
  },
  {
    label: "Audit trail your bank accepts",
    custodial: true,
    rawCrypto: false,
    offbank: true,
  },
  {
    label: "Instant global payouts",
    custodial: false,
    rawCrypto: true,
    offbank: true,
  },
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#34c759]/15">
      <Check className="h-3.5 w-3.5 text-[#34c759]" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.06]">
      <X className="h-3.5 w-3.5 text-[#8a8a8a]" strokeWidth={3} />
    </span>
  );
}

export function WhyUnfreezable() {
  return (
    <section className="bg-[#0b0f0c] py-[120px]">
      <div className="mx-auto max-w-[1000px] px-6">
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#34c759]/30 bg-[#34c759]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#34c759]">
            <KeyRound className="h-3.5 w-3.5" />
            Why you can&apos;t be frozen
          </p>
          <h2
            className="text-[32px] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[44px]"
            style={{ fontFamily: t.sans }}
          >
            Everyone makes you choose. We don&apos;t.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.6] text-white/70">
            Custodial processors keep you compliant - but they hold your money,
            so they can freeze you exactly like a bank. Raw crypto can&apos;t be
            frozen - but leaves you stranded on compliance and cash-out. Offbank
            is the only rail that&apos;s both.
          </p>
        </motion.div>

        {/* comparison table */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* header row */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-stretch border-b border-white/10 text-center">
            <div className="px-4 py-4 text-left text-[13px] font-medium uppercase tracking-wide text-white/40">
              Capability
            </div>
            <div className="px-2 py-4 text-[12px] font-semibold leading-tight text-white/60 sm:text-[13px]">
              Custodial
              <br />
              <span className="font-normal text-white/35">
                CoinsPaid&hellip;
              </span>
            </div>
            <div className="px-2 py-4 text-[12px] font-semibold leading-tight text-white/60 sm:text-[13px]">
              Raw crypto
              <br />
              <span className="font-normal text-white/35">Helio&hellip;</span>
            </div>
            <div className="relative px-2 py-4 text-[12px] font-bold leading-tight text-[#34c759] sm:text-[13px]">
              <span className="absolute inset-0 bg-[#34c759]/[0.07]" />
              <span className="relative">
                Offbank
                <br />
                <span className="font-normal text-[#34c759]/60">you</span>
              </span>
            </div>
          </div>

          {rows.map((row) => (
            <motion.div
              key={row.label}
              variants={fadeUpScale}
              className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b border-white/5 text-center last:border-b-0"
            >
              <div className="px-4 py-4 text-left text-[14px] font-medium text-white/85">
                {row.label}
              </div>
              <div className="flex justify-center px-2 py-4">
                <Cell on={row.custodial} />
              </div>
              <div className="flex justify-center px-2 py-4">
                <Cell on={row.rawCrypto} />
              </div>
              <div className="relative flex justify-center px-2 py-4">
                <span className="absolute inset-0 bg-[#34c759]/[0.07]" />
                <span className="relative">
                  <Cell on={row.offbank} />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* punchline */}
        <motion.div
          className="mx-auto mt-12 flex max-w-2xl items-start gap-4 rounded-2xl border border-[#34c759]/20 bg-[#34c759]/[0.06] p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <Snowflake className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#34c759]" />
          <p className="text-[15px] leading-[1.6] text-white/80">
            <strong className="font-semibold text-white">
              A custodial processor structurally can&apos;t promise this.
            </strong>{" "}
            If someone else holds your money, someone else can freeze it.
            Offbank never touches your funds - they settle straight to a wallet
            only you control. That&apos;s a guarantee a bank, Stripe, or
            CoinsPaid can never make.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
