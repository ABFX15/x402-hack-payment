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
} from "lucide-react";

// Animated grid background component
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      {/* Animated grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
    </div>
  );
}

// Feature pill component
function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-4 py-1.5 text-sm text-white/80 bg-white/5 rounded-full border border-fuchsia-500/30 hover:border-fuchsia-500/50 transition-colors">
      {children}
    </span>
  );
}

// Syntax highlighting helper
function highlightCode(code: string): React.ReactNode[] {
  return code.split("\n").map((line, lineIndex) => {
    // Tokenize the line
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    // Helper to add a token
    const addToken = (text: string, className: string) => {
      tokens.push(
        <span key={keyIndex++} className={className}>
          {text}
        </span>
      );
    };

    // Process line character by character with regex patterns
    while (remaining.length > 0) {
      // Comments (// ...)
      const commentMatch = remaining.match(/^(\/\/.*)/);
      if (commentMatch) {
        addToken(commentMatch[1], "text-white/40 italic");
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      // Strings ("..." or '...' or `...`)
      const stringMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
      if (stringMatch) {
        addToken(stringMatch[1], "text-emerald-400");
        remaining = remaining.slice(stringMatch[1].length);
        continue;
      }

      // Keywords
      const keywordMatch = remaining.match(
        /^(import|from|export|default|const|let|var|function|return|await|async)\b/
      );
      if (keywordMatch) {
        addToken(keywordMatch[1], "text-purple-400");
        remaining = remaining.slice(keywordMatch[1].length);
        continue;
      }

      // JSX tags and components
      const jsxMatch = remaining.match(/^(<\/?[A-Z][a-zA-Z]*|<\/?[a-z]+)/);
      if (jsxMatch) {
        addToken(jsxMatch[1], "text-cyan-400");
        remaining = remaining.slice(jsxMatch[1].length);
        continue;
      }

      // Closing bracket for JSX
      const closingMatch = remaining.match(/^(>|\/>)/);
      if (closingMatch) {
        addToken(closingMatch[1], "text-cyan-400");
        remaining = remaining.slice(closingMatch[1].length);
        continue;
      }

      // Numbers
      const numberMatch = remaining.match(/^(\d+\.?\d*)/);
      if (numberMatch) {
        addToken(numberMatch[1], "text-orange-400");
        remaining = remaining.slice(numberMatch[1].length);
        continue;
      }

      // Props/attributes (word followed by =)
      const propMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?==)/);
      if (propMatch) {
        addToken(propMatch[1], "text-sky-300");
        remaining = remaining.slice(propMatch[1].length);
        continue;
      }

      // Function calls (word followed by ()
      const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/);
      if (funcMatch) {
        addToken(funcMatch[1], "text-yellow-300");
        remaining = remaining.slice(funcMatch[1].length);
        continue;
      }

      // Braces and brackets
      const braceMatch = remaining.match(/^([{}[\]()])/);
      if (braceMatch) {
        addToken(braceMatch[1], "text-white/60");
        remaining = remaining.slice(braceMatch[1].length);
        continue;
      }

      // Default: single character
      addToken(remaining[0], "text-white/80");
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIndex} className="leading-relaxed">
        <span className="text-white/30 select-none mr-4">
          {String(lineIndex + 1).padStart(2, " ")}
        </span>
        {tokens}
      </div>
    );
  });
}

// Code block component with syntax highlighting
function CodeBlock() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"react" | "next" | "node">(
    "react"
  );

  const codeSnippets = {
    react: `import { BuyButton } from "@settlr/sdk";

<BuyButton
  amount={29.99}
  onSuccess={(tx) => unlockContent()}
>
  Buy Now - $29.99
</BuyButton>`,
    next: `// app/checkout/page.tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

export default function Checkout() {
  return (
    <SettlrProvider config={{ apiKey: "sk_live_..." }}>
      <BuyButton amount={29.99} />
    </SettlrProvider>
  );
}`,
    node: `import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({ apiKey: "sk_live_..." });

const payment = await settlr.createPayment({
  amount: 29.99,
  memo: "Premium Pack",
});

// Redirect to: payment.checkoutUrl`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Terminal window */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0d14] shadow-2xl">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0f] border-b border-white/10">
          <div className="flex gap-2">
            {(["react", "next", "node"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                {tab === "react"
                  ? "React"
                  : tab === "next"
                  ? "Next.js"
                  : "Node.js"}
              </button>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-white/50 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code content */}
        <div className="p-4 font-mono text-sm overflow-x-auto">
          <pre>
            <code>{highlightCode(codeSnippets[activeTab])}</code>
          </pre>
        </div>
      </div>
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 rounded-xl blur-xl -z-10" />
    </div>
  );
}

// Comparison table component
function ComparisonTable() {
  const features = [
    {
      name: "Transaction Fees",
      stripe: "2.9% + $0.30",
      settlr: "2% flat",
      winner: "settlr",
    },
    {
      name: "Settlement Time",
      stripe: "2-7 days",
      settlr: "Instant",
      winner: "settlr",
    },
    {
      name: "Chargebacks",
      stripe: "Yes + fees",
      settlr: "Zero",
      winner: "settlr",
    },
    {
      name: "Wallet Required",
      stripe: "N/A",
      settlr: "No",
      winner: "settlr",
    },
    { name: "Gas Fees", stripe: "N/A", settlr: "Zero", winner: "settlr" },
    {
      name: "Payment Holds",
      stripe: "Yes",
      settlr: "None",
      winner: "settlr",
    },
    {
      name: "Global Reach",
      stripe: "Limited",
      settlr: "Worldwide",
      winner: "settlr",
    },
    {
      name: "Compliance",
      stripe: "Complex KYC",
      settlr: "Built-in",
      winner: "settlr",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-[#0a0a0f]">
            <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
              Feature
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium text-white/50">
              Stripe
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium">
              <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                Settlr
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <motion.tr
              key={feature.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-white/70">
                {feature.name}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-sm text-red-400">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-xs">
                    ✕
                  </span>
                  {feature.stripe}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  {feature.settlr}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Demo phone mockup
function DemoShowcase() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Enter Email", description: "No wallet required", icon: Mail },
    {
      title: "Pay with Card",
      description: "Familiar checkout flow",
      icon: DollarSign,
    },
    { title: "Get USDC", description: "Instant settlement", icon: Check },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d0d14] p-8 md:p-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    i === currentStep
                      ? "bg-purple-500/20 border-purple-500 text-purple-400"
                      : i < currentStep
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : "bg-white/5 border-white/10 text-white/30"
                  }`}
                >
                  {i < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium transition-colors ${
                      i === currentStep ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-white/30">{step.description}</p>
                </div>
              </motion.div>
            );
          })}

          <Link
            href="/demo/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-all mt-4"
          >
            Try it yourself
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right side - Phone mockup */}
        <div className="relative flex justify-center">
          <div className="relative w-[260px] h-[520px] rounded-[2.5rem] border-2 border-purple-500/30 bg-[#0a0a0f] shadow-2xl overflow-hidden">
            {/* Glow effect on phone */}
            <div className="absolute -inset-1 bg-gradient-to-b from-purple-500/20 to-cyan-500/10 rounded-[2.5rem] blur-xl -z-10" />

            {/* Screen content */}
            <div className="absolute inset-2 rounded-[2rem] overflow-hidden bg-[#0d0d14]">
              {/* Status bar */}
              <div className="flex justify-center items-center py-3">
                <div className="w-20 h-5 bg-black rounded-full" />
              </div>

              {/* Checkout UI */}
              <div className="p-6 pt-2">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Mail className="w-7 h-7 text-purple-400" />
                      </div>
                      <p className="text-white/50 text-sm mb-4">
                        Enter your email
                      </p>
                      <div className="px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30">
                        <p className="text-white/50 text-sm">you@example.com</p>
                      </div>
                    </motion.div>
                  )}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <DollarSign className="w-7 h-7 text-purple-400" />
                      </div>
                      <p className="text-white font-medium mb-1">$29.99</p>
                      <p className="text-white/50 text-xs mb-4">
                        Premium Bundle
                      </p>
                      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium text-sm">
                        Pay Now
                      </button>
                    </motion.div>
                  )}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                      >
                        <Check className="w-8 h-8 text-green-400" />
                      </motion.div>
                      <p className="text-white font-medium">
                        Payment Complete!
                      </p>
                      <p className="text-white/50 text-xs mt-1">
                        USDC sent instantly
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated background */}
      <AnimatedGrid />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-8 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
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
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#demo"
              className="text-white/50 hover:text-white transition-colors text-sm"
            >
              Demo
            </Link>
            <Link
              href="#compare"
              className="text-white/50 hover:text-white transition-colors text-sm"
            >
              Compare
            </Link>
            <Link
              href="/docs"
              className="text-white/50 hover:text-white transition-colors text-sm"
            >
              Docs
            </Link>
          </nav>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/10"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Floating animation wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-fuchsia-300 bg-clip-text text-transparent">
                Accept Payments
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
                Without Wallets
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/60 mb-8 max-w-2xl mx-auto">
              Players pay with email. You get USDC instantly.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <FeaturePill>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Checkout
                </span>
              </FeaturePill>
              <FeaturePill>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Gasless
                </span>
              </FeaturePill>
              <FeaturePill>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> 2% Fees
                </span>
              </FeaturePill>
              <FeaturePill>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Instant
                </span>
              </FeaturePill>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/demo/store"
                className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-white">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </span>
              </Link>
              <Link
                href="/onboarding"
                className="px-8 py-4 rounded-xl font-semibold text-lg border border-purple-500/50 text-white hover:bg-purple-500/10 transition-all flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              See It Work
            </h2>
            <p className="text-white/50 text-lg">
              Three steps. No wallets. No complexity.
            </p>
          </motion.div>

          <DemoShowcase />
        </div>
      </section>

      {/* Comparison Section */}
      <section id="compare" className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Gaming Platforms Choose Settlr
            </h2>
            <p className="text-white/50 text-lg">
              Lower fees. Faster settlement. Zero chargebacks.
            </p>
          </motion.div>

          <ComparisonTable />
        </div>
      </section>

      {/* Code Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ship in 5 Minutes
            </h2>
            <p className="text-white/50 text-lg">
              One component. That&apos;s all you need.
            </p>
          </motion.div>

          <CodeBlock />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to accept payments?
            </h2>
            <p className="text-white/50 text-lg mb-8">
              Get your API key in 30 seconds. No credit card required.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:opacity-90 transition-all"
            >
              Get Your API Key
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
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
              className="hover:text-white/50 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/demo"
              className="hover:text-white/50 transition-colors"
            >
              Demo
            </Link>
            <Link
              href="https://github.com/ABFX15/x402-hack-payment"
              className="hover:text-white/50 transition-colors"
            >
              GitHub
            </Link>
          </div>
          <p className="text-sm text-white/30">
            © 2026 Settlr. Built on Solana.
          </p>
        </div>
      </footer>
    </main>
  );
}
