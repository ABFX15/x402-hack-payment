"use client";

import { type Variants } from "framer-motion";

/* ── design tokens ─────────────────────────────────────── */
export const t = {
    green: "#34c759",
    greenHover: "#2ba048",
    greenLight: "#D8F3DC",
    greenPale: "#B7E4C7",
    /** Faint green wash for tinted eyebrows / pills */
    greenWash: "#eafaf0",
    dark: "#212121",
    navy: "#212121",
    /** Near-black for big display headlines (Metafi-style) */
    ink: "#0d0d0f",
    bodyLight: "#5c5c5c",
    bodyDark: "#8a8a8a",
    muted: "#8a8a8a",
    border: "#d3d3d3",
    /** Hairline border for airy cards */
    hair: "#ececef",
    cardBg: "#f2f2f2",
    bgOff: "#f2f2f2",
    /** Page background (clean near-white) */
    bg: "#ffffff",
    /** Soft tinted inner panel that holds product mocks */
    panel: "#f5f6f8",
    /** Dark footer / dark surfaces */
    footer: "#0d0d0f",
    /** Deep base behind dark hero imagery - keeps text legible if the
     *  background image is slow or fails to load. */
    heroBase: "#0a0a0a",
    /** Text colors on dark/imagery backgrounds. */
    onDark: "#ffffff",
    onDarkBody: "#e5e5e5",
    onDarkMuted: "#c4c4c4",
    /** Geist sans-serif for all text */
    sans: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    /** Same sans stack for display headings (no serif) */
    serif: "var(--font-heading)",
    /** alias for body text on light bg, matches bodyLight */
    slate: "#5c5c5c",
    /** max content width */
    maxW: "1200px",
    /** section vertical padding */
    sectionPy: "py-[120px]",
} as const;

/* ── spring configs ────────────────────────────────────── */
export const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
export const springFast = {
    type: "spring" as const,
    stiffness: 260,
    damping: 24,
};
export const springSnappy = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
};

/* ── stagger container ─────────────────────────────────── */
export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

/* ── card entrance variants ────────────────────────────── */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: spring },
};

export const fadeUpScale: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
    },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: spring },
};

/* ── hover lift for cards ──────────────────────────────── */
export const cardHover = {
    y: -6,
    transition: springFast,
};

export const cardTap = {
    scale: 0.98,
    transition: springFast,
};

/* ── section-level scroll fade-in ──────────────────────── */
export const sectionFade: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { ...spring, duration: 0.8 },
    },
};

/* ── counter utility (for animated stats) ──────────────── */
export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
}
