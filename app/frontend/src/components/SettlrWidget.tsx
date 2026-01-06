"use client";

import { useEffect, useState } from "react";

interface SettlrCheckoutConfig {
  merchantWallet: string;
  amount: number;
  currency?: string;
  memo?: string;
  merchantName?: string;
  theme?: "dark" | "light";
  accentColor?: string;
  onSuccess?: (data: { signature: string; paymentId: string }) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Global Settlr Checkout instance
 * Games/websites can use: window.Settlr.checkout({ ... })
 */
declare global {
  interface Window {
    Settlr?: {
      checkout: (config: SettlrCheckoutConfig) => void;
      version: string;
    };
  }
}

/**
 * Initialize the Settlr global object
 */
export function initSettlrGlobal() {
  if (typeof window === "undefined") return;

  const SETTLR_BASE_URL =
    process.env.NEXT_PUBLIC_SETTLR_URL || "https://settlr.app";

  window.Settlr = {
    version: "1.0.0",

    checkout: (config: SettlrCheckoutConfig) => {
      const {
        merchantWallet,
        amount,
        currency = "USDC",
        memo = "",
        merchantName = "Merchant",
        theme = "dark",
        accentColor = "#a855f7",
        onSuccess,
        onCancel,
        onError,
      } = config;

      // Build checkout URL
      const params = new URLSearchParams({
        to: merchantWallet,
        amount: amount.toString(),
        currency,
        memo,
        merchant: merchantName,
        theme,
        accent: accentColor,
        embed: "true",
      });

      const checkoutUrl = `${SETTLR_BASE_URL}/checkout?${params.toString()}`;

      // Create modal overlay
      const overlay = document.createElement("div");
      overlay.id = "settlr-checkout-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      // Create modal container
      const modal = document.createElement("div");
      modal.style.cssText = `
        width: 100%;
        max-width: 420px;
        max-height: 90vh;
        background: ${theme === "dark" ? "#18181b" : "#ffffff"};
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        transform: scale(0.95) translateY(20px);
        transition: transform 0.3s ease;
      `;

      // Create close button
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      closeBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border: none;
        background: ${theme === "dark" ? "#27272a" : "#f4f4f5"};
        color: ${theme === "dark" ? "#a1a1aa" : "#71717a"};
        border-radius: 8px;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      `;

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.src = checkoutUrl;
      iframe.style.cssText = `
        width: 100%;
        height: 600px;
        border: none;
      `;
      iframe.allow = "payment";

      // Assemble modal
      modal.style.position = "relative";
      modal.appendChild(closeBtn);
      modal.appendChild(iframe);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Animate in
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        modal.style.transform = "scale(1) translateY(0)";
      });

      // Close function
      const closeCheckout = () => {
        overlay.style.opacity = "0";
        modal.style.transform = "scale(0.95) translateY(20px)";
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      };

      // Close handlers
      closeBtn.onclick = () => {
        closeCheckout();
        onCancel?.();
      };

      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closeCheckout();
          onCancel?.();
        }
      };

      // Listen for messages from iframe
      const handleMessage = (event: MessageEvent) => {
        // Verify origin
        if (!event.origin.includes("settlr")) return;

        const { type, data } = event.data || {};

        switch (type) {
          case "settlr:success":
            closeCheckout();
            onSuccess?.(data);
            break;
          case "settlr:cancel":
            closeCheckout();
            onCancel?.();
            break;
          case "settlr:error":
            closeCheckout();
            onError?.(new Error(data?.message || "Payment failed"));
            break;
        }
      };

      window.addEventListener("message", handleMessage);

      // Cleanup on close
      const originalClose = closeCheckout;
      overlay.dataset.cleanup = "true";
    },
  };

  console.log("[Settlr] Checkout widget initialized v1.0.0");
}

/**
 * React hook to initialize Settlr global
 */
export function useSettlrWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSettlrGlobal();
    setReady(true);
  }, []);

  return {
    ready,
    Settlr: typeof window !== "undefined" ? window.Settlr : null,
  };
}

/**
 * React component for inline checkout button
 */
interface CheckoutButtonProps {
  merchantWallet: string;
  amount: number;
  memo?: string;
  merchantName?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: (data: { signature: string; paymentId: string }) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

export function CheckoutButton({
  merchantWallet,
  amount,
  memo = "",
  merchantName = "Merchant",
  buttonText,
  className = "",
  onSuccess,
  onCancel,
  onError,
}: CheckoutButtonProps) {
  const { ready, Settlr } = useSettlrWidget();

  const handleClick = () => {
    if (!Settlr) return;

    Settlr.checkout({
      merchantWallet,
      amount,
      memo,
      merchantName,
      onSuccess,
      onCancel,
      onError,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={!ready}
      className={className || "settlr-checkout-button"}
      style={
        !className
          ? {
              padding: "12px 24px",
              background: "linear-gradient(to right, #ec4899, #06b6d4)",
              color: "white",
              fontWeight: 600,
              borderRadius: "12px",
              border: "none",
              cursor: ready ? "pointer" : "not-allowed",
              opacity: ready ? 1 : 0.7,
            }
          : undefined
      }
    >
      {buttonText || `Pay $${amount.toFixed(2)}`}
    </button>
  );
}

export default CheckoutButton;
