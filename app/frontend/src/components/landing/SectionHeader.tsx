"use client";

import { useReducedMotion } from "framer-motion";
import { t } from "./shared";

/**
 * Shared section header: mono green eyebrow (with dash) → big ink headline
 * that reveals word-by-word with a blur-in → gray subtext.
 * Centered by default. Keeps every section on the same rhythm.
 *
 * The headline reveal uses the CSS `.char-blur-in` animation (same as the
 * hero) rather than framer `whileInView`: it needs no IntersectionObserver
 * and its resting state is visible, so the headline can never be left
 * permanently hidden if anything about the reveal fails to run.
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
  const reduceMotion = useReducedMotion();
  const alignCls = align === "center" ? "mx-auto text-center" : "text-left";

  // Split keeping whitespace so accessible text (copy-paste / SEO) keeps its
  // spaces; only non-space tokens animate.
  let wordIdx = -1;

  return (
    <div className={`${alignCls} max-w-2xl`}>
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
        {reduceMotion
          ? title
          : title.split(/(\s+)/).map((tok, i) => {
              if (/^\s+$/.test(tok)) return tok;
              wordIdx += 1;
              return (
                <span
                  key={i}
                  className="char-blur-in inline-block"
                  style={{ animationDelay: `${0.05 + wordIdx * 0.06}s` }}
                >
                  {tok}
                </span>
              );
            })}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-[17px] leading-[1.6] ${align === "center" ? "mx-auto" : ""} max-w-lg`}
          style={{ color: t.bodyLight }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
