"use client";

import {
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useSettlr } from "./react";

/**
 * Settlr Buy Button - Drop-in payment button component
 *
 * @example
 * ```tsx
 * import { BuyButton } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   return (
 *     <BuyButton
 *       amount={49.99}
 *       memo="Premium Game Bundle"
 *       onSuccess={(result) => {
 *         console.log('Payment successful!', result.signature);
 *         // Redirect to success page or unlock content
 *       }}
 *       onError={(error) => console.error(error)}
 *     >
 *       Buy Now - $49.99
 *     </BuyButton>
 *   );
 * }
 * ```
 */

export interface BuyButtonProps {
  /** Payment amount in USDC */
  amount: number;

  /** Optional memo/description */
  memo?: string;

  /** Optional order ID for your records */
  orderId?: string;

  /** Button text/content (default: "Pay ${amount}") */
  children?: ReactNode;

  /** Called when payment succeeds */
  onSuccess?: (result: {
    signature: string;
    amount: number;
    merchantAddress: string;
  }) => void;

  /** Called when payment fails */
  onError?: (error: Error) => void;

  /** Called when payment starts processing */
  onProcessing?: () => void;

  /** Use redirect flow instead of direct payment */
  useRedirect?: boolean;

  /** Success URL for redirect flow */
  successUrl?: string;

  /** Cancel URL for redirect flow */
  cancelUrl?: string;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: CSSProperties;

  /** Disabled state */
  disabled?: boolean;

  /** Button variant */
  variant?: "primary" | "secondary" | "outline";

  /** Button size */
  size?: "sm" | "md" | "lg";
}

const defaultStyles: Record<string, CSSProperties> = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  primary: {
    background: "linear-gradient(135deg, #f472b6 0%, #67e8f9 100%)",
    color: "white",
  },
  secondary: {
    background: "#12121a",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  outline: {
    background: "transparent",
    color: "#f472b6",
    border: "2px solid #f472b6",
  },
  sm: {
    padding: "8px 16px",
    fontSize: "14px",
  },
  md: {
    padding: "12px 24px",
    fontSize: "16px",
  },
  lg: {
    padding: "16px 32px",
    fontSize: "18px",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  loading: {
    opacity: 0.8,
  },
};

export function BuyButton({
  amount,
  memo,
  orderId,
  children,
  onSuccess,
  onError,
  onProcessing,
  useRedirect = true, // Default to redirect flow (works with Privy)
  successUrl,
  cancelUrl,
  className,
  style,
  disabled = false,
  variant = "primary",
  size = "md",
}: BuyButtonProps) {
  const { getCheckoutUrl, createPayment } = useSettlr();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const handleClick = useCallback(async () => {
    if (disabled || loading) return;

    setLoading(true);
    setStatus("processing");
    onProcessing?.();

    try {
      // Always use redirect flow - Settlr checkout handles auth via Privy
      const url = getCheckoutUrl({
        amount,
        memo,
        orderId,
        successUrl,
        cancelUrl,
      });
      window.location.href = url;
    } catch (error) {
      setStatus("error");
      onError?.(error instanceof Error ? error : new Error("Payment failed"));
      setLoading(false);
    }
  }, [
    amount,
    memo,
    orderId,
    disabled,
    loading,
    successUrl,
    cancelUrl,
    getCheckoutUrl,
    onError,
    onProcessing,
  ]);

  const buttonStyle: CSSProperties = {
    ...defaultStyles.base,
    ...defaultStyles[variant],
    ...defaultStyles[size],
    ...(disabled ? defaultStyles.disabled : {}),
    ...(loading ? defaultStyles.loading : {}),
    ...style,
  };

  const buttonContent = loading ? (
    <>
      <Spinner />
      Processing...
    </>
  ) : (
    children || `Pay $${amount.toFixed(2)}`
  );

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={buttonStyle}
      type="button"
    >
      {buttonContent}
    </button>
  );
}

/**
 * Simple spinner component
 */
function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
      />
    </svg>
  );
}

/**
 * Checkout Widget - Embeddable checkout form
 *
 * @example
 * ```tsx
 * import { CheckoutWidget } from '@settlr/sdk';
 *
 * function CheckoutPage() {
 *   return (
 *     <CheckoutWidget
 *       amount={149.99}
 *       productName="Annual Subscription"
 *       productDescription="Full access to all premium features"
 *       onSuccess={(result) => {
 *         router.push('/success');
 *       }}
 *     />
 *   );
 * }
 * ```
 */

export interface CheckoutWidgetProps {
  /** Payment amount in USDC */
  amount: number;

  /** Product/service name */
  productName: string;

  /** Optional description */
  productDescription?: string;

  /** Optional product image URL */
  productImage?: string;

  /** Merchant name (from config if not provided) */
  merchantName?: string;

  /** Optional memo for the transaction */
  memo?: string;

  /** Optional order ID */
  orderId?: string;

  /** Called when payment succeeds */
  onSuccess?: (result: {
    signature: string;
    amount: number;
    merchantAddress: string;
  }) => void;

  /** Called when payment fails */
  onError?: (error: Error) => void;

  /** Called when user cancels */
  onCancel?: () => void;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: CSSProperties;

  /** Theme */
  theme?: "light" | "dark";

  /** Show powered by Settlr badge */
  showBranding?: boolean;
}

const widgetStyles: Record<string, CSSProperties> = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: "16px",
    overflow: "hidden",
    maxWidth: "400px",
    width: "100%",
  },
  containerDark: {
    background: "#12121a",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
  },
  containerLight: {
    background: "white",
    border: "1px solid #e5e7eb",
    color: "#111827",
  },
  header: {
    padding: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  productImage: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    objectFit: "cover" as const,
    marginBottom: "16px",
  },
  productName: {
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 4px 0",
  },
  productDescription: {
    fontSize: "14px",
    opacity: 0.7,
    margin: 0,
  },
  body: {
    padding: "24px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  label: {
    fontSize: "14px",
    opacity: 0.7,
  },
  value: {
    fontSize: "14px",
    fontWeight: 500,
  },
  total: {
    fontSize: "24px",
    fontWeight: 700,
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "16px 0",
  },
  footer: {
    padding: "24px",
    paddingTop: "0",
  },
  branding: {
    textAlign: "center" as const,
    fontSize: "12px",
    opacity: 0.5,
    marginTop: "16px",
  },
};

export function CheckoutWidget({
  amount,
  productName,
  productDescription,
  productImage,
  merchantName,
  memo,
  orderId,
  onSuccess,
  onError,
  onCancel,
  className,
  style,
  theme = "dark",
  showBranding = true,
}: CheckoutWidgetProps) {
  const { getCheckoutUrl } = useSettlr();
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const containerStyle: CSSProperties = {
    ...widgetStyles.container,
    ...(theme === "dark"
      ? widgetStyles.containerDark
      : widgetStyles.containerLight),
    ...style,
  };

  const dividerStyle: CSSProperties = {
    ...widgetStyles.divider,
    background: theme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e7eb",
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Header */}
      <div style={widgetStyles.header}>
        {productImage && (
          <img
            src={productImage}
            alt={productName}
            style={widgetStyles.productImage}
          />
        )}
        <h2 style={widgetStyles.productName}>{productName}</h2>
        {productDescription && (
          <p style={widgetStyles.productDescription}>{productDescription}</p>
        )}
      </div>

      {/* Body */}
      <div style={widgetStyles.body}>
        <div style={widgetStyles.row}>
          <span style={widgetStyles.label}>Subtotal</span>
          <span style={widgetStyles.value}>${amount.toFixed(2)}</span>
        </div>
        <div style={widgetStyles.row}>
          <span style={widgetStyles.label}>Network Fee</span>
          <span style={widgetStyles.value}>$0.01</span>
        </div>
        <div style={dividerStyle} />
        <div style={widgetStyles.row}>
          <span style={widgetStyles.label}>Total</span>
          <span style={widgetStyles.total}>
            ${(amount + 0.01).toFixed(2)} USDC
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={widgetStyles.footer}>
        <BuyButton
          amount={amount}
          memo={memo || productName}
          orderId={orderId}
          onSuccess={(result) => {
            setStatus("success");
            onSuccess?.(result);
          }}
          onError={(error) => {
            setStatus("error");
            onError?.(error);
          }}
          onProcessing={() => setStatus("processing")}
          size="lg"
          style={{ width: "100%" }}
        >
          {status === "success"
            ? "✓ Payment Complete"
            : status === "error"
            ? "Payment Failed - Retry"
            : `Pay $${(amount + 0.01).toFixed(2)} USDC`}
        </BuyButton>

        {showBranding && (
          <p style={widgetStyles.branding}>
            Secured by <strong>Settlr</strong> • Powered by Solana
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Payment Link Generator - Create shareable payment links
 *
 * @example
 * ```tsx
 * const { generateLink } = usePaymentLink({
 *   merchantWallet: 'YOUR_WALLET',
 *   merchantName: 'My Store',
 * });
 *
 * const link = generateLink({
 *   amount: 29.99,
 *   memo: 'Order #1234',
 * });
 * // https://settlr.dev/pay?amount=29.99&merchant=My+Store&to=YOUR_WALLET&memo=Order+%231234
 * ```
 */
export function usePaymentLink(config: {
  merchantWallet: string;
  merchantName: string;
  baseUrl?: string;
}) {
  const {
    merchantWallet,
    merchantName,
    baseUrl = "https://settlr.dev/pay",
  } = config;

  const generateLink = useCallback(
    (options: {
      amount: number;
      memo?: string;
      orderId?: string;
      successUrl?: string;
      cancelUrl?: string;
    }) => {
      const params = new URLSearchParams({
        amount: options.amount.toString(),
        merchant: merchantName,
        to: merchantWallet,
      });

      if (options.memo) params.set("memo", options.memo);
      if (options.orderId) params.set("orderId", options.orderId);
      if (options.successUrl) params.set("successUrl", options.successUrl);
      if (options.cancelUrl) params.set("cancelUrl", options.cancelUrl);

      return `${baseUrl}?${params.toString()}`;
    },
    [merchantWallet, merchantName, baseUrl]
  );

  const generateQRCode = useCallback(
    async (options: Parameters<typeof generateLink>[0]) => {
      const link = generateLink(options);
      // Simple QR code generation using Google Charts API
      const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(
        link
      )}&choe=UTF-8`;
      return qrUrl;
    },
    [generateLink]
  );

  return {
    generateLink,
    generateQRCode,
  };
}

/**
 * Payment Modal - Iframe-based checkout that keeps users on your site
 *
 * @example
 * ```tsx
 * import { PaymentModal } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   const [showPayment, setShowPayment] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowPayment(true)}>
 *         Buy Now - $49.99
 *       </button>
 *
 *       {showPayment && (
 *         <PaymentModal
 *           amount={49.99}
 *           merchantName="Arena GG"
 *           merchantWallet="YOUR_WALLET_ADDRESS"
 *           memo="Tournament Entry"
 *           onSuccess={(result) => {
 *             console.log('Paid!', result.signature);
 *             setShowPayment(false);
 *           }}
 *           onClose={() => setShowPayment(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

export interface PaymentModalProps {
  /** Payment amount in USDC */
  amount: number;

  /** Merchant display name */
  merchantName: string;

  /** Merchant wallet address */
  merchantWallet: string;

  /** Optional memo/description */
  memo?: string;

  /** Optional order ID */
  orderId?: string;

  /** Called when payment succeeds */
  onSuccess?: (result: { signature: string; amount: number }) => void;

  /** Called when modal is closed */
  onClose?: () => void;

  /** Called on error */
  onError?: (error: Error) => void;

  /** Checkout base URL (default: https://settlr.dev/checkout) */
  checkoutUrl?: string;
}

const modalStyles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    height: "90vh",
    maxHeight: "700px",
    backgroundColor: "#12121a",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    color: "white",
    fontSize: "18px",
    transition: "background-color 0.2s",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
};

export function PaymentModal({
  amount,
  merchantName,
  merchantWallet,
  memo,
  orderId,
  onSuccess,
  onClose,
  onError,
  checkoutUrl = "https://settlr.dev/checkout",
}: PaymentModalProps) {
  const [loading, setLoading] = useState(true);

  // Build checkout URL with embed mode
  const params = new URLSearchParams({
    amount: amount.toString(),
    merchant: merchantName,
    to: merchantWallet,
    embed: "true",
  });

  if (memo) params.set("memo", memo);
  if (orderId) params.set("orderId", orderId);

  const iframeSrc = `${checkoutUrl}?${params.toString()}`;

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin
      if (
        !event.origin.includes("settlr.dev") &&
        !event.origin.includes("localhost")
      ) {
        return;
      }

      const { type, data } = event.data || {};

      switch (type) {
        case "settlr:success":
          onSuccess?.({
            signature: data.signature,
            amount: data.amount || amount,
          });
          break;
        case "settlr:error":
          onError?.(new Error(data.message || "Payment failed"));
          break;
        case "settlr:close":
          onClose?.();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [amount, onSuccess, onError, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
        <button
          style={modalStyles.closeButton}
          onClick={onClose}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
          }
        >
          ✕
        </button>

        {loading && (
          <div style={modalStyles.loading as CSSProperties}>
            <Spinner />
            <span>Loading checkout...</span>
          </div>
        )}

        <iframe
          src={iframeSrc}
          style={{
            ...modalStyles.iframe,
            opacity: loading ? 0 : 1,
          }}
          onLoad={() => setLoading(false)}
          allow="payment"
        />
      </div>
    </div>
  );
}

/**
 * Hook to open payment modal programmatically
 *
 * @example
 * ```tsx
 * import { usePaymentModal } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   const { openPayment, PaymentModalComponent } = usePaymentModal({
 *     merchantName: "Arena GG",
 *     merchantWallet: "YOUR_WALLET",
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={() => openPayment({
 *         amount: 49.99,
 *         memo: "Tournament Entry",
 *         onSuccess: (result) => console.log("Paid!", result),
 *       })}>
 *         Buy Now
 *       </button>
 *       <PaymentModalComponent />
 *     </>
 *   );
 * }
 * ```
 */
export function usePaymentModal(config: {
  merchantName: string;
  merchantWallet: string;
  checkoutUrl?: string;
}) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    amount: number;
    memo?: string;
    orderId?: string;
    onSuccess?: (result: { signature: string; amount: number }) => void;
    onError?: (error: Error) => void;
  }>({
    isOpen: false,
    amount: 0,
  });

  const openPayment = useCallback(
    (options: {
      amount: number;
      memo?: string;
      orderId?: string;
      onSuccess?: (result: { signature: string; amount: number }) => void;
      onError?: (error: Error) => void;
    }) => {
      setModalState({
        isOpen: true,
        ...options,
      });
    },
    []
  );

  const closePayment = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const PaymentModalComponent = useCallback(() => {
    if (!modalState.isOpen) return null;

    return (
      <PaymentModal
        amount={modalState.amount}
        merchantName={config.merchantName}
        merchantWallet={config.merchantWallet}
        memo={modalState.memo}
        orderId={modalState.orderId}
        checkoutUrl={config.checkoutUrl}
        onSuccess={(result) => {
          modalState.onSuccess?.(result);
          closePayment();
        }}
        onError={modalState.onError}
        onClose={closePayment}
      />
    );
  }, [modalState, config, closePayment]);

  return {
    openPayment,
    closePayment,
    isOpen: modalState.isOpen,
    PaymentModalComponent,
  };
}
