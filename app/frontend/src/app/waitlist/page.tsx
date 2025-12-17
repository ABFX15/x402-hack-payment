"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Zap, Shield, Globe } from "lucide-react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, useCase }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join waitlist");
      }

      setStatus("success");
      setEmail("");
      setCompany("");
      setUseCase("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a12]">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={100}
              height={28}
              quality={100}
              className="object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Pricing
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6">
              <Zap className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm text-[var(--primary)]">
                Early Access
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Join the Waitlist
            </h1>

            <p className="text-xl text-[var(--text-muted)] mb-8">
              Be among the first to integrate seamless USDC payments into your
              app. Get early access, priority support, and exclusive pricing.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[var(--success)]" />
                </div>
                <span className="text-[var(--text-secondary)]">
                  Gasless payments - users pay zero gas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[var(--success)]" />
                </div>
                <span className="text-[var(--text-secondary)]">
                  7 lines of code integration
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[var(--success)]" />
                </div>
                <span className="text-[var(--text-secondary)]">
                  Sub-second finality on Solana
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[var(--success)]" />
                </div>
                <span className="text-[var(--text-secondary)]">
                  Early adopter pricing locked in
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Global Coverage</span>
              </div>
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-[var(--success)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    You&apos;re on the list!
                  </h2>
                  <p className="text-[var(--text-muted)] mb-6">
                    We&apos;ll reach out soon with your early access invite.
                  </p>
                  <Link
                    href="/"
                    className="text-[var(--primary)] hover:underline"
                  >
                    ← Back to home
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Request Early Access
                  </h2>
                  <p className="text-[var(--text-muted)] mb-6">
                    Fill out the form and we&apos;ll get you set up.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Inc"
                        className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        What will you build?
                      </label>
                      <textarea
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        placeholder="E.g., E-commerce checkout, subscription billing, in-app purchases..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                      />
                    </div>

                    {status === "error" && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-3 px-6 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        "Joining..."
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
                    No spam. We&apos;ll only email you about your access.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Image
            src="/logo-new.png"
            alt="Settlr"
            width={90}
            height={24}
            quality={100}
            className="object-contain opacity-80"
          />
          <p className="text-sm text-[var(--text-muted)]">
            © 2025 Settlr. Powering seamless payments.
          </p>
        </div>
      </footer>
    </main>
  );
}
