"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { t, spring } from "./shared";

/* floating orbs for visual depth */
const orbs = [
  { size: 6, x: "10%", y: "20%", delay: 0, dur: 6 },
  { size: 4, x: "25%", y: "70%", delay: 1.5, dur: 7 },
  { size: 5, x: "80%", y: "15%", delay: 0.8, dur: 5.5 },
  { size: 3, x: "65%", y: "80%", delay: 2, dur: 8 },
  { size: 4, x: "90%", y: "45%", delay: 0.5, dur: 6.5 },
  { size: 3, x: "45%", y: "30%", delay: 1, dur: 7.5 },
];

export function CTA() {
  return (
    <section
      className="relative overflow-hidden py-[140px]"
      style={{ background: "#f7f7f7" }}
    >
      {/* animated breathing green glows */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: [
            [
              "radial-gradient(ellipse 50% 60% at 0% 50%, rgba(52,199,89,0.18) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 60% at 100% 80%, rgba(52,199,89,0.12) 0%, transparent 60%)",
            ].join(", "),
            [
              "radial-gradient(ellipse 60% 70% at 5% 45%, rgba(52,199,89,0.28) 0%, transparent 60%)",
              "radial-gradient(ellipse 60% 70% at 95% 75%, rgba(52,199,89,0.22) 0%, transparent 60%)",
            ].join(", "),
            [
              "radial-gradient(ellipse 50% 60% at 0% 50%, rgba(52,199,89,0.18) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 60% at 100% 80%, rgba(52,199,89,0.12) 0%, transparent 60%)",
            ].join(", "),
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: "rgba(52,199,89,0.5)",
            boxShadow: `0 0 ${orb.size * 3}px rgba(52,199,89,0.3)`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* left, copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={spring}
          >
            <h2
              className="text-[36px] leading-[1.1] tracking-tight font-extrabold sm:text-[48px]"
              style={{ color: "#212121", fontFamily: t.sans }}
            >
              Stop paying the high-risk tax.
            </h2>
            <p
              className="mt-4 text-[20px] leading-[1.4]"
              style={{ color: "#5c5c5c" }}
            >
              Start settling in seconds.
            </p>
            <p
              className="mt-6 max-w-md text-[15px] leading-relaxed"
              style={{ color: "#8a8a8a" }}
            >
              Invoicing and B2B settlement built for businesses banks won&apos;t
              reliably serve. One rail. Low fees. Instant finality. Cash out to
              USD whenever.
            </p>
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.15 }}
            >
              <Link
                href="/onboarding"
                className="group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
                style={{ background: t.green }}
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* right, dashboard screenshot */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...spring, delay: 0.2 }}
          >
            {/* pulsing green glow behind dashboard */}
            <motion.div
              className="pointer-events-none absolute -inset-8 z-0 rounded-3xl"
              animate={{
                background: [
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52,199,89,0.2) 0%, transparent 70%)",
                  "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(52,199,89,0.35) 0%, transparent 70%)",
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52,199,89,0.2) 0%, transparent 70%)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              <Image
                src="/dashboard-mock.png"
                alt="Offbank dashboard"
                width={720}
                height={480}
                loading="lazy"
                className="block w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
