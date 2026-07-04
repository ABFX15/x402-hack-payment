"use client";

import { motion } from "framer-motion";
import { t, spring } from "./shared";

/**
 * Shared section header: green eyebrow → big ink headline → gray subtext.
 * Centered by default. Keeps every section on the same rhythm.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <motion.div
      className={`${alignCls} max-w-2xl`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={spring}
    >
      {eyebrow && (
        <p
          className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: t.green }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[46px]"
        style={{ color: t.ink, fontFamily: t.sans }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-[17px] leading-[1.6] ${align === "center" ? "mx-auto" : ""} max-w-lg`}
          style={{ color: t.bodyLight }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
