"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Shield,
  Zap,
  ArrowDownToLine,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

// Sphere Application ID - replace with your actual ID from spherepay.co dashboard
const SPHERE_APPLICATION_ID =
  process.env.NEXT_PUBLIC_SPHERE_APP_ID || "YOUR_APPLICATION_ID";

function OfframpContent() {
  const searchParams = useSearchParams();
  const [sphereLoaded, setSphereLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Parse URL params for pre-filling
  const amount = searchParams.get("amount");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Sphere Ramp when script loads
  const initSphereRamp = () => {
    if (typeof window !== "undefined" && (window as any).SphereRamp) {
      new (window as any).SphereRamp({
        containerId: "sphere-ramp-container",
        applicationId: SPHERE_APPLICATION_ID,
        theme: {
          color: "violet",
          radius: "lg",
          components: {
            logo: "/logo.png",
          },
        },
        debug: process.env.NODE_ENV === "development",
      });
      setSphereLoaded(true);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 pt-24">
      {/* Sphere Ramp Script */}
      <Script
        src="https://spherepay.co/packages/sphere-ramp/index.js"
        type="module"
        crossOrigin="anonymous"
        onLoad={initSphereRamp}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] mb-4"
          >
            <ArrowDownToLine className="w-4 h-4 text-[var(--secondary)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              Cash Out
            </span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Convert to Cash
          </h1>
          <p className="text-[var(--text-muted)]">
            Convert your USDC to fiat and withdraw to your bank
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 text-center"
          >
            <Zap className="w-6 h-6 text-[var(--secondary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Instant</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 text-center"
          >
            <Banknote className="w-6 h-6 text-[var(--success)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Low Fees</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 text-center"
          >
            <Shield className="w-6 h-6 text-[var(--primary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Secure</p>
          </motion.div>
        </div>

        {/* Sphere Ramp Widget Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-2 min-h-[500px]"
        >
          {!mounted || !sphereLoaded ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[var(--text-muted)]">Loading Sphere...</p>
              </div>
            </div>
          ) : null}
          <div id="sphere-ramp-container" className="w-full" />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[var(--text-muted)]">
            Powered by{" "}
            <a
              href="https://spherepay.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              Sphere
            </a>{" "}
            • Compliant off-ramp infrastructure
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function OfframpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OfframpContent />
    </Suspense>
  );
}
