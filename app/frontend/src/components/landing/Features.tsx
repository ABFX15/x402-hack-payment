"use client";

import Image from "next/image";
import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { t, spring } from "./shared";
import { SectionHeader } from "./SectionHeader";

const features = [
  {
    title: "Send Invoice\n→ Get Paid",
    desc: "Send invoice → get paid instantly. No banks, no delays.",
    img: "/nobg-document.png",
  },
  {
    title: "Plug Into\nYour OMS",
    desc: "LeafLink, Shopify, or your custom stack. Webhook in, USDC payment link out. REST API for everything else.",
    img: "/nobg-globe.png",
  },
  {
    title: "Compliance\nBuilt In",
    desc: "Automated KYB verification, OFAC screening, real-time BSA/AML monitoring.",
    img: "/nobg-shield.png",
  },
  {
    title: "No Account\nFreezes",
    desc: "Non-custodial means no one holds your funds. No one can freeze them.",
    img: "/nobg-padlock.png",
  },
  {
    title: "Cash Out\nto USD",
    desc: "Cash out USDC to USD via ACH, Wire, or SEPA. Bank deposit in 1-2 business days.",
    img: "/nobg-dollar.png",
  },
  {
    title: "1% Flat\nFee",
    desc: "Not 5-9% like high-risk processors. One percent, every transaction, no surprises.",
    img: "/nobg-envelope.png",
  },
];

/* per-card entrance: alternate slide from left / right + fade */
const cardVariant = (i: number) => ({
  hidden: {
    opacity: 0,
    x: i % 2 === 0 ? -60 : 60,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      ...spring,
      delay: i * 0.1,
    },
  },
});

/* ── 3D tilt card wrapper ─────────────────────────────── */
function TiltCard({ children, i }: { children: React.ReactNode; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const smoothY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  function handleMouse(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * 12); // max 6deg tilt
    rotateX.set(-y * 12);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      custom={i}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={cardVariant(i)}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX: smoothX,
        rotateY: smoothY,
        transformPerspective: 800,
        borderColor: t.hair,
      }}
      whileHover={{
        boxShadow: "0 24px 60px -20px rgba(13,13,15,0.14)",
        transition: { duration: 0.25 },
      }}
      className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-[18px] border bg-white"
    >
      {children}
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to settle"
          subtitle="One platform for restricted and high-friction commerce: accept, invoice, pay out, and cash out in USDC."
        />

        {/* 2x3 grid */}
        <div
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          style={{ perspective: "1000px" }}
        >
          {features.map((f, i) => (
            <TiltCard key={f.title} i={i}>
              <div className="flex h-full w-full flex-col bg-white">
                {/* text, top left */}
                <div className="relative z-10 px-7 pt-7 pb-2">
                  <h3
                    className="whitespace-pre-line text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[28px]"
                    style={{ color: t.ink, fontFamily: t.sans }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="mt-3 max-w-[240px] text-[14px] leading-[1.6]"
                    style={{ color: t.bodyLight }}
                  >
                    {f.desc}
                  </p>
                </div>

                {/* 3D illustration on a tinted panel, bottom half */}
                <div
                  className="relative mt-auto overflow-hidden border-t"
                  style={{ background: t.panel, borderColor: t.hair }}
                >
                  {/* left fade */}
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12"
                    style={{
                      background: `linear-gradient(to right, ${t.panel} 0%, transparent 100%)`,
                    }}
                  />
                  {/* right fade */}
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12"
                    style={{
                      background: `linear-gradient(to left, ${t.panel} 0%, transparent 100%)`,
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "200px" }}
                    transition={{ ...spring, delay: 0.15 + i * 0.08 }}
                    className="flex items-end justify-center px-6 pb-0 pt-4 transition-transform duration-300 group-hover:scale-105"
                  >
                    <Image
                      src={f.img}
                      alt={f.title.replace("\n", " ")}
                      width={280}
                      height={280}
                      className="h-52 w-52 object-contain sm:h-56 sm:w-56"
                    />
                  </motion.div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
