"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Loader2,
  CheckCircle2,
  X,
  Zap,
  CreditCard,
  Wallet,
} from "lucide-react";

// Pre-built examples
const examples = [
  {
    id: "simple",
    name: "Simple Payment",
    description: "Basic payment button",
    code: `<SettlrCheckout
  amount={9.99}
  memo="Coffee Order"
  onSuccess={(tx) => console.log('Paid!', tx)}
/>`,
  },
  {
    id: "custom-button",
    name: "Custom Button",
    description: "Styled payment button",
    code: `<SettlrCheckout
  amount={49.99}
  memo="Pro Subscription"
  buttonText="Subscribe Now"
  buttonStyle={{
    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px'
  }}
  onSuccess={(tx) => alert('Welcome to Pro!')}
/>`,
  },
  {
    id: "dynamic",
    name: "Dynamic Amount",
    description: "Cart total checkout",
    code: `const cartTotal = 129.99;
const orderId = 'ORD-' + Date.now();

<SettlrCheckout
  amount={cartTotal}
  memo={\`Order \${orderId}\`}
  metadata={{ orderId, items: 3 }}
  onSuccess={async (tx) => {
    await saveOrder(orderId, tx.signature);
    router.push('/success');
  }}
  onError={(err) => toast.error(err.message)}
/>`,
  },
  {
    id: "subscription",
    name: "Subscription",
    description: "Recurring payment setup",
    code: `<SettlrCheckout
  amount={19.99}
  memo="Monthly Plan"
  recurring={{
    interval: 'monthly',
    startDate: new Date()
  }}
  buttonText="Start Subscription"
  onSuccess={(tx) => {
    console.log('Subscription started!');
    console.log('Tx:', tx.signature);
  }}
/>`,
  },
];

interface PlaygroundProps {
  defaultCode?: string;
  showExamples?: boolean;
}

export function InteractivePlayground({
  defaultCode = examples[0].code,
  showExamples = true,
}: PlaygroundProps) {
  const [code, setCode] = useState(defaultCode);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "idle" | "email" | "payment" | "processing" | "success"
  >("idle");
  const [selectedExample, setSelectedExample] = useState(examples[0]);
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);

  // Parse amount from code
  const parseAmount = () => {
    const match = code.match(/amount[=:]\s*\{?\s*(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 9.99;
  };

  // Parse memo from code
  const parseMemo = () => {
    const match = code.match(/memo[=:]\s*["'`]([^"'`]+)["'`]/);
    return match ? match[1] : "Payment";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(selectedExample.code);
    setShowPreview(false);
    setCheckoutStep("idle");
  };

  const handleRun = () => {
    setIsRunning(true);
    setShowPreview(true);
    setCheckoutStep("idle");
    setTimeout(() => setIsRunning(false), 500);
  };

  const handleLoadExample = (example: (typeof examples)[0]) => {
    setSelectedExample(example);
    setCode(example.code);
    setShowExampleDropdown(false);
    setShowPreview(false);
    setCheckoutStep("idle");
  };

  const simulateCheckout = () => {
    setCheckoutStep("email");
  };

  const simulatePayment = () => {
    setCheckoutStep("payment");
  };

  const simulateProcess = () => {
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0a0f] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-sm font-medium text-white/60">
            Interactive Playground
          </span>
        </div>

        {/* Example Selector */}
        {showExamples && (
          <div className="relative">
            <button
              onClick={() => setShowExampleDropdown(!showExampleDropdown)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10"
            >
              <span>{selectedExample.name}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showExampleDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {showExampleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#12121a] p-2 shadow-xl"
                >
                  {examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={() => handleLoadExample(example)}
                      className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors ${
                        selectedExample.id === example.id
                          ? "bg-purple-500/10 text-purple-400"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {example.name}
                      </span>
                      <span className="text-xs text-white/40">
                        {example.description}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Code Editor */}
        <div className="border-b border-white/5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
            <span className="text-xs font-medium text-white/40">
              component.tsx
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="rounded p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopy}
                className="rounded p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                title="Copy"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-64 w-full resize-none bg-transparent p-4 font-mono text-sm text-white/90 outline-none"
              style={{
                lineHeight: "1.6",
                tabSize: 2,
              }}
            />
            {/* Syntax highlighting overlay - simplified */}
            <div className="pointer-events-none absolute inset-0 hidden p-4 font-mono text-sm">
              <SyntaxHighlight code={code} />
            </div>
          </div>
          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span>Devnet Mode</span>
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Try It
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-[#08080c]">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
            <span className="text-xs font-medium text-white/40">Preview</span>
            {showPreview && (
              <button
                onClick={() => {
                  setShowPreview(false);
                  setCheckoutStep("idle");
                }}
                className="rounded p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex h-64 items-center justify-center p-4">
            <AnimatePresence mode="wait">
              {!showPreview ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-white/30"
                >
                  <Play className="mx-auto mb-3 h-8 w-8" />
                  <p className="text-sm">Click "Try It" to see the preview</p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-xs"
                >
                  <CheckoutSimulator
                    amount={parseAmount()}
                    memo={parseMemo()}
                    step={checkoutStep}
                    onStartCheckout={simulateCheckout}
                    onEnterEmail={simulatePayment}
                    onConfirmPayment={simulateProcess}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 bg-[#0a0a0f] px-4 py-3">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>💡 Edit the code above and click "Try It" to see changes</span>
          <a
            href="/demo"
            className="text-purple-400 transition-colors hover:text-purple-300"
          >
            Try with real payments →
          </a>
        </div>
      </div>
    </div>
  );
}

// Checkout simulator component
function CheckoutSimulator({
  amount,
  memo,
  step,
  onStartCheckout,
  onEnterEmail,
  onConfirmPayment,
}: {
  amount: number;
  memo: string;
  step: "idle" | "email" | "payment" | "processing" | "success";
  onStartCheckout: () => void;
  onEnterEmail: () => void;
  onConfirmPayment: () => void;
}) {
  const [email, setEmail] = useState("");

  if (step === "idle") {
    return (
      <button
        onClick={onStartCheckout}
        className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
      >
        Pay ${amount.toFixed(2)}
      </button>
    );
  }

  if (step === "email") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-4 rounded-xl border border-white/10 bg-[#12121a] p-4"
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            ${amount.toFixed(2)}
          </p>
          <p className="text-sm text-white/50">{memo}</p>
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none"
        />
        <button
          onClick={onEnterEmail}
          className="w-full rounded-lg bg-purple-500 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  if (step === "payment") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-3 rounded-xl border border-white/10 bg-[#12121a] p-4"
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            ${amount.toFixed(2)}
          </p>
          <p className="text-sm text-white/50">{memo}</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={onConfirmPayment}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#512da8] py-3 font-semibold text-white transition-colors hover:bg-[#5e35b1]"
          >
            <Wallet className="h-5 w-5" />
            Pay with Wallet
          </button>
          <button
            onClick={onConfirmPayment}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-3 font-semibold text-white transition-colors hover:bg-white/5"
          >
            <CreditCard className="h-5 w-5" />
            Pay with Card
          </button>
        </div>
      </motion.div>
    );
  }

  if (step === "processing") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-4 rounded-xl border border-white/10 bg-[#12121a] p-6 text-center"
      >
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-400" />
        <div>
          <p className="font-semibold text-white">Processing Payment</p>
          <p className="text-sm text-white/50">Confirming on Solana...</p>
        </div>
      </motion.div>
    );
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-4 rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
        </motion.div>
        <div>
          <p className="font-semibold text-white">Payment Successful!</p>
          <p className="text-sm text-white/50">
            ${amount.toFixed(2)} • {memo}
          </p>
        </div>
        <div className="rounded-lg bg-black/20 px-3 py-2 font-mono text-xs text-green-400">
          tx: 5Kj2...x8mN
        </div>
      </motion.div>
    );
  }

  return null;
}

// Simple syntax highlighting component
function SyntaxHighlight({ code }: { code: string }) {
  const keywords = [
    "import",
    "export",
    "from",
    "const",
    "let",
    "async",
    "await",
    "return",
    "function",
  ];
  const components = ["SettlrCheckout", "BuyButton"];

  const lines = code.split("\n");

  return (
    <>
      {lines.map((line, i) => (
        <div key={i} className="leading-relaxed">
          {line.split(/(\s+)/).map((word, j) => {
            if (keywords.includes(word)) {
              return (
                <span key={j} className="text-purple-400">
                  {word}
                </span>
              );
            }
            if (components.some((c) => word.includes(c))) {
              return (
                <span key={j} className="text-cyan-400">
                  {word}
                </span>
              );
            }
            if (word.startsWith('"') || word.startsWith("'")) {
              return (
                <span key={j} className="text-green-400">
                  {word}
                </span>
              );
            }
            if (!isNaN(Number(word)) && word.trim()) {
              return (
                <span key={j} className="text-orange-400">
                  {word}
                </span>
              );
            }
            return <span key={j}>{word}</span>;
          })}
        </div>
      ))}
    </>
  );
}
