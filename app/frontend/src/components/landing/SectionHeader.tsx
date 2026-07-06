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
          className={`mb-4 flex items-center gap-2.5 text-[12px] uppercase tracking-[0.16em] ${
            align === "center" ? "justify-center" : ""
          }`}
          style={{ fontFamily: "var(--font-jetbrains), monospace", color: t.green }}
        >
          <span className="h-px w-7 shrink-0" style={{ background: t.green, opacity: 0.55 }} />
          {eyebrow}
        </p>
      )}
      <h2
        className="text-[34px] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-[52px]"
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
