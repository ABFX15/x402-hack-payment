"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  t,
  spring,
  staggerContainer,
  fadeUpScale,
  easeOutQuart,
} from "./shared";

/* ── counter that animates from 0 → target on scroll ──── */
function AnimatedCount({
  to,
  prefix,
  suffix,
  inView,
}: {
  to: number;
  prefix: string;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutQuart(progress) * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <>
      {prefix}
      {count}
      {suffix}
    </>
  );
}

const cards = [
  {
    stat: "$34B",
    countTo: 34,
    prefix: "$",
    suffix: "B",
    desc: "US high-risk commerce TAM banks won't reliably serve, including high-risk e-commerce, iGaming, CBD, hemp, firearms, cross-border wholesale, and cannabis",
    img: "/nobg-globe.png",
    span: "sm:col-span-2",
    bg: "#f7f7f7",
    accent: false,
  },
  {
    stat: "$4B",
    countTo: 4,
    prefix: "$",
    suffix: "B",
    desc: "Unpaid B2B receivables in high-friction wholesale verticals",
    img: "/nobg-dollar.png",
    span: "",
    bg: "#f7f7f7",
    accent: false,
  },
  {
    stat: "300 days",
    countTo: 300,
    prefix: "",
    suffix: " days",
    desc: "Average collection placement time",
    img: "/nobg-clock.png",
    span: "",
    bg: "#f7f7f7",
    accent: false,
  },
  {
    stat: "The Opportunity",
    countTo: null,
    prefix: "",
    suffix: "",
    desc: "Stablecoin settlement built for industries banks won't serve. Until now.",
    img: "/nobg-shield.png",
    span: "",
    bg: "#34c759",
    accent: true,
  },
  {
    stat: "5-9%",
    countTo: 9,
    prefix: "5-",
    suffix: "%",
    desc: "What high-risk processors charge, because they can",
    img: "/nobg-document.png",
    span: "",
    bg: "#f7f7f7",
    accent: false,
  },
];

export function BentoCards() {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "-80px" });

  return (
    <section className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* heading */}
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <h2
            className="text-[32px] leading-[1.15] tracking-tight font-extrabold sm:text-[44px]"
            style={{ color: t.navy, fontFamily: t.sans }}
          >
            Your bank can pull the plug tomorrow. The rail you settle on
            shouldn&apos;t.
          </h2>
        </motion.div>

        {/* bento grid */}
        <motion.div
          ref={gridRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.stat}
              variants={fadeUpScale}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.25 },
              }}
              className={`relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl p-7 ${card.span}`}
              style={{ background: card.bg }}
            >
              {/* pulsing glow on accent card */}
              {card.accent && (
                <motion.div
                  className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      "inset 0 0 30px rgba(216,243,220,0.05)",
                      "inset 0 0 60px rgba(216,243,220,0.15)",
                      "inset 0 0 30px rgba(216,243,220,0.05)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* text */}
              <div className="relative z-10">
                <div
                  className={`font-extrabold leading-none tracking-tight ${
                    card.accent
                      ? "text-[28px] sm:text-[32px]"
                      : "text-[48px] sm:text-[56px]"
                  }`}
                  style={{
                    color: card.accent ? "#FFFFFF" : "#212121",
                    fontFamily: t.sans,
                  }}
                >
                  {card.countTo != null ? (
                    <AnimatedCount
                      to={card.countTo}
                      prefix={card.prefix}
                      suffix={card.suffix}
                      inView={inView}
                    />
                  ) : (
                    card.stat
                  )}
                </div>
                <p
                  className="mt-3 max-w-xs text-[15px] leading-relaxed"
                  style={{
                    color: card.accent ? "rgba(255,255,255,0.8)" : "#5c5c5c",
                  }}
                >
                  {card.desc}
                </p>
              </div>

              {/* 3D illustration with subtle float */}
              <motion.div
                className="absolute bottom-4 right-4 z-0 opacity-20"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={card.img}
                  alt={card.stat}
                  width={120}
                  height={120}
                  loading="lazy"
                  className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
