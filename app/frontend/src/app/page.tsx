"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Zap,
  DollarSign,
  Clock,
  Check,
  Copy,
  Play,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  X,
} from "lucide-react";

// Code block component with syntax highlighting
function CodeBlock() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"react" | "nextjs" | "vue">(
    "react"
  );

  const codeSnippets = {
    react: `import { SettlrCheckout } from 'settlr'

<SettlrCheckout
  amount={9.99}
  onSuccess={(tx) => console.log(tx)}
/>`,
    nextjs: `import { SettlrButton } from 'settlr/next'

export default function Page() {
  return <SettlrButton amount={9.99} />
}`,
    vue: `<template>
  <SettlrCheckout :amount="9.99" />
</template>

<script setup>
import { SettlrCheckout } from 'settlr/vue'
</script>`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting for code
  const highlightLine = (line: string, index: number) => {
    if (line.includes("import")) {
      return (
        <div key={index} className="min-h-[1.5rem]">
          <span style={{ color: "rgb(249, 115, 22)" }}>import</span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(251, 146, 60)" }}>
            {line.match(/\{.*?\}/)?.[0] || line.match(/'.*?'/)?.[0]}
          </span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(249, 115, 22)" }}>from</span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(34, 197, 94)" }}>
            {line.match(/'[^']*'$/)?.[0]}
          </span>
        </div>
      );
    } else if (line.includes("export")) {
      return (
        <div key={index} className="min-h-[1.5rem]">
          <span style={{ color: "rgb(249, 115, 22)" }}>export</span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(249, 115, 22)" }}>default</span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(249, 115, 22)" }}>function</span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(96, 165, 250)" }}>Page</span>
          <span style={{ color: "rgb(209, 213, 219)" }}>()</span>
        </div>
      );
    } else if (
      line.includes("<template>") ||
      line.includes("</template>") ||
      line.includes("<script") ||
      line.includes("</script>")
    ) {
      return (
        <div key={index} className="min-h-[1.5rem]">
          <span style={{ color: "rgb(139, 92, 246)" }}>{line}</span>
        </div>
      );
    } else if (line.includes("return")) {
      return (
        <div key={index} className="min-h-[1.5rem]">
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          <span style={{ color: "rgb(249, 115, 22)" }}>return</span>
          <span style={{ color: "rgb(209, 213, 219)" }}>
            {" "}
            {line.substring(line.indexOf("return") + 7)}
          </span>
        </div>
      );
    } else if (line.includes("<Settlr")) {
      return (
        <div key={index} className="min-h-[1.5rem]">
          <span style={{ color: "rgb(209, 213, 219)" }}>{"<"}</span>
          <span style={{ color: "rgb(96, 165, 250)" }}>
            {line.match(/<\w+/)?.[0]?.substring(1)}
          </span>
          <span style={{ color: "rgb(209, 213, 219)" }}> </span>
          {line.includes("amount") && (
            <>
              <span style={{ color: "rgb(251, 146, 60)" }}>amount</span>
              <span style={{ color: "rgb(209, 213, 219)" }}>=</span>
              <span style={{ color: "rgb(34, 197, 94)" }}>
                {line.match(/\{[^}]*\}/)?.[0]}
              </span>
            </>
          )}
          {line.includes("onSuccess") && (
            <>
              <span style={{ color: "rgb(251, 146, 60)" }}>onSuccess</span>
              <span style={{ color: "rgb(209, 213, 219)" }}>=</span>
              <span style={{ color: "rgb(34, 197, 94)" }}>
                {line.match(/\{.*?\}/)?.[0]}
              </span>
            </>
          )}
          {line.includes("/>") && (
            <span style={{ color: "rgb(209, 213, 219)" }}> /{">"}</span>
          )}
        </div>
      );
    } else {
      return (
        <div key={index} className="min-h-[1.5rem]">
          <span style={{ color: "rgb(209, 213, 219)" }}>
            {line || "\u00A0"}
          </span>
        </div>
      );
    }
  };

  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center text-5xl font-bold text-white md:text-6xl"
        >
          Ship in 5 Minutes
        </motion.h2>

        {/* Code Editor Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            borderColor: "rgba(139, 92, 246, 0.3)",
            backgroundColor: "rgba(17, 17, 27, 0.8)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Glow Effect */}
          <div
            className="absolute -inset-1 -z-10 opacity-20 blur-2xl"
            style={{
              background:
                "linear-gradient(135deg, #a855f7, #22d3ee)",
            }}
          />

          {/* Window Header */}
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{
              borderColor: "rgba(139, 92, 246, 0.2)",
              backgroundColor: "rgba(13, 13, 20, 0.6)",
            }}
          >
            {/* Window Buttons */}
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>

            {/* Framework Tabs */}
            <div
              className="flex gap-1 rounded-lg border p-1"
              style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
            >
              {(["react", "nextjs", "vue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors"
                  style={{
                    color: activeTab === tab ? "white" : "rgb(156, 163, 175)",
                  }}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundColor: "rgba(168, 85, 247, 0.3)" }}
                      transition={{
                        type: "spring",
                        duration: 0.5,
                        bounce: 0.2,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === "nextjs" ? "Next.js" : tab}
                  </span>
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="group relative flex h-8 items-center gap-2 rounded border px-3 text-gray-400 transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
              style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
            >
              <motion.div
                key={copied ? "check" : "copy"}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </motion.div>
              <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Code Content */}
          <div className="p-6">
            <motion.pre
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto font-mono text-sm leading-relaxed"
            >
              <code>
                {codeSnippets[activeTab]
                  .split("\n")
                  .map((line, i) => highlightLine(line, i))}
              </code>
            </motion.pre>
          </div>

          {/* Terminal-style bottom bar */}
          <div
            className="border-t px-6 py-3"
            style={{
              borderColor: "rgba(139, 92, 246, 0.2)",
              backgroundColor: "rgba(13, 13, 20, 0.6)",
            }}
          >
            <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
              <span className="text-green-400">●</span>
              <span>Ready to integrate</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Comparison table component
function ComparisonTable() {
  const comparisonData = [
    {
      feature: "Transaction Fees",
      stripe: { value: "2.9% + $0.30", isNegative: true },
      settlr: { value: "2% flat", isPositive: true },
    },
    {
      feature: "Settlement Time",
      stripe: { value: "2-7 days", isNegative: true },
      settlr: { value: "Instant", isPositive: true },
    },
    {
      feature: "Chargebacks",
      stripe: { value: "Yes + fees", isNegative: true },
      settlr: { value: "Zero", isPositive: true },
    },
    {
      feature: "Wallet Required",
      stripe: { value: "N/A", isNegative: false },
      settlr: { value: "No", isPositive: true },
    },
    {
      feature: "Gas Fees",
      stripe: { value: "N/A", isNegative: false },
      settlr: { value: "Zero", isPositive: true },
    },
    {
      feature: "Payment Holds",
      stripe: { value: "Yes", isNegative: true },
      settlr: { value: "None", isPositive: true },
    },
    {
      feature: "Global Reach",
      stripe: { value: "Limited", isNegative: true },
      settlr: { value: "Worldwide", isPositive: true },
    },
    {
      feature: "Compliance",
      stripe: { value: "Complex KYC", isNegative: true },
      settlr: { value: "Built-in", isPositive: true },
    },
  ];

  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center text-5xl font-bold text-white md:text-6xl"
        >
          Why Gaming Platforms Choose Settlr
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: "rgba(139, 92, 246, 0.2)",
            backgroundColor: "rgba(17, 17, 27, 0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-purple-500/20 bg-purple-500/5 p-6">
            <div className="text-lg font-semibold text-gray-400">Feature</div>
            <div className="text-center text-lg font-semibold text-gray-300">
              Stripe
            </div>
            <div className="text-center text-lg font-semibold text-white">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #a855f7, #22d3ee)",
                }}
              >
                Settlr
              </span>
            </div>
          </div>

          {/* Table Rows */}
          <div>
            {comparisonData.map((row, index) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  backgroundColor: "rgba(139, 92, 246, 0.05)",
                }}
                className="grid grid-cols-3 items-center border-b border-purple-500/10 p-6 transition-colors duration-300 last:border-b-0"
              >
                {/* Feature Name */}
                <div className="text-base font-medium text-gray-300">
                  {row.feature}
                </div>

                {/* Stripe Column */}
                <div className="flex items-center justify-center gap-2">
                  {row.stripe.isNegative && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
                      <X className="h-3 w-3 text-red-400" />
                    </div>
                  )}
                  <span
                    className={
                      row.stripe.isNegative ? "text-red-400" : "text-gray-400"
                    }
                  >
                    {row.stripe.value}
                  </span>
                </div>

                {/* Settlr Column */}
                <div className="flex items-center justify-center gap-2">
                  {row.settlr.isPositive && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                  )}
                  <span className="font-semibold text-green-400">
                    {row.settlr.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Demo phone mockup with steps
function DemoShowcase() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: Mail,
      title: "Enter Email",
      description: "No wallet required",
    },
    {
      icon: CreditCard,
      title: "Pay with Card",
      description: "Familiar checkout flow",
    },
    {
      icon: CheckCircle2,
      title: "Get USDC",
      description: "Instant settlement",
    },
  ];

  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center text-5xl font-bold text-white md:text-6xl"
        >
          See It Work
        </motion.h2>

        {/* Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-6xl rounded-3xl border p-8 md:p-12"
          style={{
            borderColor: "rgba(139, 92, 246, 0.2)",
            backgroundColor: "rgba(17, 17, 27, 0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Steps */}
            <div className="flex flex-col justify-center space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                const isPast = activeStep > index;

                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    {/* Step Number with Progress */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2"
                        animate={{
                          borderColor:
                            isActive || isPast
                              ? "#a855f7"
                              : "rgba(139, 92, 246, 0.3)",
                          backgroundColor:
                            isActive || isPast
                              ? "rgba(168, 85, 247, 0.2)"
                              : "transparent",
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{
                            color:
                              isActive || isPast
                                ? "#a855f7"
                                : "rgb(156, 163, 175)",
                          }}
                        />
                      </motion.div>

                      {/* Progress Line */}
                      {index < steps.length - 1 && (
                        <div
                          className="absolute left-1/2 top-14 h-8 w-0.5 -translate-x-1/2"
                          style={{ backgroundColor: "rgba(139, 92, 246, 0.2)" }}
                        >
                          <motion.div
                            className="h-full w-full"
                            style={{ backgroundColor: "#a855f7" }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: isPast ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-2">
                      <motion.h3
                        className="text-xl font-semibold"
                        animate={{
                          color:
                            isActive || isPast
                              ? "rgb(255, 255, 255)"
                              : "rgb(156, 163, 175)",
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p
                        className="mt-1 text-sm"
                        animate={{
                          color:
                            isActive || isPast
                              ? "rgb(209, 213, 219)"
                              : "rgb(107, 114, 128)",
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        {step.description}
                      </motion.p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Try it CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <Link
                  href="/demo/store"
                  className="group inline-flex items-center gap-2 rounded-lg border-0 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #a855f7, #22d3ee)",
                  }}
                >
                  Try it yourself
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>

            {/* Right Side - Phone Mockup */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Phone Frame */}
                <div
                  className="relative h-[600px] w-[300px] rounded-[3rem] border-8 p-4 shadow-2xl"
                  style={{
                    borderColor: "rgba(31, 41, 55, 0.8)",
                    backgroundColor: "#1a1a24",
                  }}
                >
                  {/* Notch */}
                  <div
                    className="absolute left-1/2 top-4 h-6 w-32 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: "#0a0a0f" }}
                  />

                  {/* Screen Content */}
                  <div
                    className="relative h-full overflow-hidden rounded-[2rem] p-6"
                    style={{ backgroundColor: "#0f0f17" }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex h-full flex-col items-center justify-center text-center"
                      >
                        {activeStep === 0 && (
                          <div className="space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 p-4">
                              <Mail className="h-full w-full text-purple-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                              Enter your email
                            </p>
                            <input
                              type="email"
                              placeholder="you@example.com"
                              className="w-full rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-white placeholder-gray-500"
                              readOnly
                            />
                          </div>
                        )}

                        {activeStep === 1 && (
                          <div className="space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 p-4">
                              <CreditCard className="h-full w-full text-cyan-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                              Pay with card
                            </p>
                            <div className="space-y-3">
                              <div className="h-12 w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10" />
                              <div className="flex gap-3">
                                <div className="h-12 flex-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10" />
                                <div className="h-12 flex-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10" />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeStep === 2 && (
                          <div className="space-y-4">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", duration: 0.6 }}
                              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 p-4"
                            >
                              <CheckCircle2 className="h-full w-full text-green-400" />
                            </motion.div>
                            <p className="text-lg font-semibold text-white">
                              Payment Complete!
                            </p>
                            <p className="text-sm text-gray-400">
                              USDC received instantly
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Glow Effect */}
                <div
                  className="absolute inset-0 -z-10 rounded-[3rem] opacity-20 blur-3xl"
                  style={{
                    background:
                      "linear-gradient(to bottom right, #a855f7, #22d3ee)",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={100}
              height={28}
              quality={100}
              className="object-contain"
            />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#demo"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Demo
            </Link>
            <Link
              href="#compare"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Compare
            </Link>
            <Link
              href="/docs"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Docs
            </Link>
          </nav>
          <a
            href="https://www.npmjs.com/package/@settlr/sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
          >
            Get Started
          </a>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Main Headline with Gradient */}
          <motion.h1
            className="max-w-5xl text-6xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #a855f7, #22d3ee)",
              }}
            >
              Accept Payments Without Wallets
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mx-auto max-w-2xl text-xl text-gray-400 md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Players pay with email. You get USDC instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link
              href="/demo/store"
              className="group relative overflow-hidden rounded-lg border-0 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #a855f7, #22d3ee)",
              }}
            >
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Watch Demo
              </span>
            </Link>

            <a
              href="https://www.npmjs.com/package/@settlr/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 bg-transparent px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/10"
              style={{
                borderColor: "#a855f7",
              }}
            >
              Get Started
            </a>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 pt-8 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              { icon: Mail, label: "Email Checkout" },
              { icon: Zap, label: "Gasless" },
              { icon: DollarSign, label: "2% Fees" },
              { icon: Clock, label: "Instant" },
            ].map((feature, index) => (
              <span
                key={feature.label}
                className="flex items-center gap-1.5 rounded-full border px-4 py-2 backdrop-blur-sm"
                style={{
                  borderColor: "rgba(139, 92, 246, 0.3)",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                }}
              >
                <feature.icon className="h-3.5 w-3.5" />
                {feature.label}
                {index < 3 && <span className="ml-2 text-purple-400">•</span>}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Demo Showcase Section */}
      <div id="demo">
        <DemoShowcase />
      </div>

      {/* Comparison Table Section */}
      <div id="compare">
        <ComparisonTable />
      </div>

      {/* Code Showcase Section */}
      <CodeBlock />

      {/* Final CTA */}
      <section className="relative px-4 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
              Ready to accept payments?
            </h2>
            <p className="mb-8 text-lg text-white/50">
              Install the SDK and start accepting payments in minutes.
            </p>
            <a
              href="https://www.npmjs.com/package/@settlr/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #a855f7, #22d3ee)",
              }}
            >
              View on npm
              <ArrowRight className="h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={80}
              height={22}
              className="object-contain opacity-50"
            />
          </div>
          <div className="flex gap-6 text-sm text-white/30">
            <Link
              href="/docs"
              className="transition-colors hover:text-white/50"
            >
              Docs
            </Link>
            <Link
              href="/demo"
              className="transition-colors hover:text-white/50"
            >
              Demo
            </Link>
            <a
              href="https://www.npmjs.com/package/@settlr/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/50"
            >
              npm
            </a>
            <a
              href="https://github.com/ABFX15/x402-hack-payment"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/50"
            >
              GitHub
            </a>
          </div>
          <p className="text-sm text-white/30">
            © 2026 Settlr. Built on Solana.
          </p>
        </div>
      </footer>

      {/* CSS Animation for Grid */}
      <style jsx global>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(80px, 80px);
          }
        }
      `}</style>
    </main>
  );
}
