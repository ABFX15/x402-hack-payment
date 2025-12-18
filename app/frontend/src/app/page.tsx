"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Shield,
  ArrowRight,
  Code,
  Clock,
  DollarSign,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* Hero Section with background image */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/hero-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/90 via-[#0a0a12]/70 to-[#0a0a12]" />
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-8 bg-black/20 backdrop-blur-md border-b border-white/10">
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
            <nav className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Contact
              </Link>
              <Link
                href="/waitlist"
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
              >
                Join Waitlist
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Main headline with neon glow */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              End-to-End Stablecoin Payments
            </h1>

            {/* Tagline with neon colors */}
            <p className="text-2xl md:text-3xl font-medium mb-8">
              <span className="text-[#f472b6]">Fast.</span>{" "}
              <span className="text-white">Stable.</span>{" "}
              <span className="text-[#67e8f9]">Secure.</span>
            </p>

            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Accept USDC payments on Solana. Gasless for your users. Integrate
              in 7 lines of code.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/waitlist"
                className="group relative px-8 py-4 rounded-xl font-medium text-lg overflow-hidden"
              >
                {/* Neon gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] opacity-90 group-hover:opacity-100 transition-opacity" />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5" />
                  Join the Waitlist
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-xl font-medium text-lg border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Try Demo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Non-custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>&lt;1s finality</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>7 lines of code</span>
              </div>
            </div>
          </motion.div>

          {/* Neon sign box - centered below hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 relative"
          >
            {/* Neon frame */}
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#f472b6]/30 to-[#67e8f9]/30 blur-2xl" />

              {/* Frame border with LED dots */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[#67e8f9]/50 bg-black/40 backdrop-blur-sm overflow-hidden">
                {/* LED dots around border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#67e8f9] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f472b6] to-transparent" />
                <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-[#67e8f9] to-transparent" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-[#f472b6] to-transparent" />

                {/* Logo inside */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/logo-new.png"
                    alt="Settlr"
                    width={160}
                    height={45}
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] to-[#12121a]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "7", label: "Lines of code", icon: Code },
              { value: "<1s", label: "Settlement", icon: Clock },
              { value: "$0", label: "Gas for users", icon: DollarSign },
              { value: "2%", label: "Simple fee", icon: Zap },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 group-hover:border-[#67e8f9]/50 transition-colors">
                  <stat.icon className="w-5 h-5 text-[#67e8f9]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-[#f472b6] to-[#67e8f9] bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-[#12121a]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Settlr?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Everything you need to accept stablecoin payments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Gasless Payments",
                description:
                  "Your users pay zero gas. We handle transaction fees so they don't have to.",
                icon: Zap,
                color: "#f472b6",
              },
              {
                title: "Instant Settlement",
                description:
                  "Sub-second finality on Solana. No waiting for confirmations.",
                icon: Clock,
                color: "#67e8f9",
              },
              {
                title: "Non-Custodial",
                description:
                  "Funds go directly to your wallet. We never hold your money.",
                icon: Shield,
                color: "#a78bfa",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at center, ${feature.color}, transparent 70%)`,
                  }}
                />

                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    backgroundColor: `${feature.color}20`,
                    border: `1px solid ${feature.color}40`,
                  }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#12121a] to-[#0a0a12]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Integrate in Minutes
            </h2>
            <p className="text-white/50 text-lg">
              Simple API. No blockchain expertise required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            {/* Code window frame */}
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-[#f472b6]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#34d399]" />
                <span className="ml-4 text-sm text-white/40">payment.ts</span>
              </div>

              {/* Code content */}
              <pre className="p-6 overflow-x-auto text-sm md:text-base">
                <code className="text-white/80">
                  <span className="text-[#c084fc]">import</span> {"{"} Settlr{" "}
                  {"}"} <span className="text-[#c084fc]">from</span>{" "}
                  <span className="text-[#34d399]">
                    &apos;@settlr/sdk&apos;
                  </span>
                  ;<br />
                  <br />
                  <span className="text-[#c084fc]">const</span>{" "}
                  <span className="text-[#67e8f9]">payment</span> ={" "}
                  <span className="text-[#c084fc]">await</span> Settlr.
                  <span className="text-[#fbbf24]">pay</span>({"{"}
                  <br />
                  {"  "}
                  <span className="text-white/50">amount:</span>{" "}
                  <span className="text-[#f472b6]">10.00</span>,<br />
                  {"  "}
                  <span className="text-white/50">to:</span>{" "}
                  <span className="text-[#34d399]">
                    &apos;merchant-wallet.sol&apos;
                  </span>
                  ,<br />
                  {"  "}
                  <span className="text-white/50">memo:</span>{" "}
                  <span className="text-[#34d399]">
                    &apos;Order #1234&apos;
                  </span>
                  <br />
                  {"}"});
                  <br />
                  <br />
                  <span className="text-white/30">
                    // That&apos;s it. Payment complete.
                  </span>
                </code>
              </pre>
            </div>

            {/* Glow effect behind */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#f472b6]/20 to-[#67e8f9]/20 blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-[#0a0a12]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/50 text-lg">
              Everything you need to know about Settlr
            </p>
          </motion.div>

          <div className="space-y-4">
            <FAQItem
              question="What is Settlr?"
              answer="Settlr is a payment infrastructure that lets you accept USDC stablecoin payments on Solana. We handle all the blockchain complexity so you can integrate crypto payments in minutes, not months."
            />
            <FAQItem
              question="How does gasless payment work?"
              answer="With gasless payments, your users don't need to hold SOL to pay transaction fees. Settlr covers the gas costs and charges a small fee in USDC instead. This means anyone with USDC can pay, even if they've never used Solana before."
            />
            <FAQItem
              question="What are the fees?"
              answer="We offer flexible pricing: a Free tier to get started, a Pro plan at $29/month with lower transaction fees, and custom Enterprise pricing for high-volume businesses. Transaction fees range from 0.5% to 2% depending on your plan."
            />
            <FAQItem
              question="Is Settlr custodial?"
              answer="No. Settlr is completely non-custodial. Funds go directly from your customer's wallet to yours. We never hold or have access to your money."
            />
            <FAQItem
              question="How fast are payments?"
              answer="Payments settle in under 1 second. Solana's high throughput means you get instant confirmation without waiting for block confirmations like on other chains."
            />
            <FAQItem
              question="What wallets are supported?"
              answer="Any Solana-compatible wallet works with Settlr, including Phantom, Solflare, Backpack, and more. We also support Solana Pay QR codes for mobile payments."
            />
            <FAQItem
              question="How do I integrate Settlr?"
              answer="Integration takes about 5 minutes. Install our SDK, add your API key, and you're ready to accept payments. We provide React hooks, REST APIs, and payment links for no-code integration."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute inset-0 bg-[#0a0a12]" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Join the waitlist for early access. Be among the first to
              integrate seamless stablecoin payments.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-medium text-lg bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white hover:opacity-90 transition-opacity"
            >
              <Zap className="w-5 h-5" />
              Join the Waitlist
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Image
            src="/logo-new.png"
            alt="Settlr"
            width={90}
            height={24}
            quality={100}
            className="object-contain opacity-80"
          />
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link
              href="/pricing"
              className="hover:text-white/60 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/waitlist"
              className="hover:text-white/60 transition-colors"
            >
              Waitlist
            </Link>
            <Link
              href="/contact"
              className="hover:text-white/60 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/demo"
              className="hover:text-white/60 transition-colors"
            >
              Demo
            </Link>
          </div>
          <p className="text-sm text-white/30">
            © 2025 Settlr. Powering seamless payments.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-white/10 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-white/50 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-5 text-white/60 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
