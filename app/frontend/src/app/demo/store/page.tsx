"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing: string;
  icon: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "1",
    name: "Starter",
    description: "For early-stage platforms",
    price: 5.0,
    billing: "/month",
    icon: "🚀",
    features: [
      "Up to 100 settlements/month",
      "Email-based claiming",
      "Webhook notifications",
      "Devnet sandbox",
    ],
  },
  {
    id: "2",
    name: "Growth",
    description: "For scaling platforms",
    price: 149.0,
    billing: "/month",
    icon: "📈",
    features: [
      "Up to 1,000 settlements/month",
      "Batch settlements (CSV & API)",
      "Recurring subscriptions",
      "Priority support",
      "Custom branding",
    ],
    badge: "Most Popular",
    popular: true,
  },
  {
    id: "3",
    name: "Scale",
    description: "For high-volume operations",
    price: 499.0,
    billing: "/month",
    icon: "⚡",
    features: [
      "Unlimited settlements",
      "Dedicated treasury account",
      "SOC 2 compliance report",
      "Gasless transactions",
      "Multi-sig support",
      "99.99% uptime SLA",
    ],
  },
  {
    id: "4",
    name: "Enterprise",
    description: "Custom deployment & support",
    price: 999.0,
    billing: "/month",
    icon: "🏢",
    features: [
      "Everything in Scale",
      "On-prem deployment option",
      "Dedicated account manager",
      "Custom integrations",
      "Volume-based pricing",
      "White-label checkout",
    ],
    badge: "Custom",
  },
];

const addons: Plan[] = [
  {
    id: "a1",
    name: "One-Click Checkout Widget",
    description: "Embeddable payment button for any website or app",
    price: 29.0,
    billing: "/month",
    icon: "🔗",
    features: [],
  },
  {
    id: "a2",
    name: "Privacy Shield (PER)",
    description: "TEE-based privacy for sensitive settlement data",
    price: 99.0,
    billing: "/month",
    icon: "🔒",
    features: [],
  },
];

export default function DemoStorePage() {
  const [selectedItems, setSelectedItems] = useState<
    { plan: Plan; quantity: number }[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPaid, setOrderPaid] = useState<{
    amount: number;
    signature: string;
  } | null>(null);

  const addItem = (plan: Plan) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.plan.id === plan.id);
      if (existing) {
        return prev;
      }
      return [...prev, { plan, quantity: 1 }];
    });
  };

  const removeItem = (planId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.plan.id !== planId));
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + item.plan.price * item.quantity,
    0,
  );

  const itemCount = selectedItems.length;

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    const demoWallet = "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV";
    // The store calls the Offbank widget with the LIVE cart total + line items.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settlr = (window as any).OffbankCheckout;
    if (!settlr) return;
    settlr.open({
      merchant: demoWallet,
      amount: Number(total.toFixed(2)),
      name: "Offbank Demo Store",
      orderId: "ORD-" + Date.now(),
      items: selectedItems.map((item) => ({
        name: item.plan.name,
        qty: item.quantity,
        price: item.plan.price,
      })),
      onSuccess: (d: { signature: string }) => {
        // The store marks the order paid here (and verifies via webhook).
        setOrderPaid({ amount: Number(total.toFixed(2)), signature: d.signature });
        setSelectedItems([]);
        setIsCartOpen(false);
      },
    });
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Offbank checkout widget loader */}
      <Script src="/embed.js" strategy="afterInteractive" />

      {/* Order confirmed (after a successful USDC payment) */}
      {orderPaid && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOrderPaid(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34c759]">
              <span className="text-3xl text-white">✓</span>
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#101828]">
              Order confirmed
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              ${orderPaid.amount.toFixed(2)} paid in USDC. Your order is on its
              way.
            </p>
            <p className="mt-3 break-all font-mono text-[11px] text-[#98a2b3]">
              {orderPaid.signature.slice(0, 24)}…
            </p>
            <button
              onClick={() => setOrderPaid(null)}
              className="mt-6 w-full rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2ba048]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)]/95 border-b border-[var(--border-color)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--accent-muted)] transition-colors"
              title="Back to demos"
            >
              <span className="text-xl">✕</span>
            </Link>
            <span className="text-3xl">💳</span>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Offbank Platform Plans
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Demo Store • Pay with USDC
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full bg-[var(--accent-muted)] hover:bg-[var(--accent-primary)] transition-colors"
          >
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent-primary)] text-[#212121] text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[var(--accent-muted)] to-transparent py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Pick a plan. Pay with USDC.
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Try the checkout flow - select a plan and complete payment.
            <span className="text-[var(--accent-primary)] font-medium">
              {" "}
              Gasless • Instant settlement.
            </span>
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6">
          Platform Plans
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedItems.some((e) => e.plan.id === plan.id);
            return (
              <div
                key={plan.id}
                className={`bg-[var(--card-bg)] rounded-2xl border overflow-hidden transition-all hover:shadow-lg group relative ${
                  isSelected
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20"
                    : plan.popular
                    ? "border-[var(--accent-primary)]/50 hover:border-[var(--accent-primary)]"
                    : "border-[var(--border-color)] hover:border-[var(--accent-primary)]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-[var(--accent-primary)] text-[#212121] text-xs font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="p-5">
                  <span className="text-3xl mb-3 block">{plan.icon}</span>
                  <h3 className="font-semibold text-[var(--text-primary)] text-lg">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-[var(--accent-primary)]">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      USDC {plan.billing}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="text-[var(--accent-primary)] mt-0.5">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      isSelected ? removeItem(plan.id) : addItem(plan)
                    }
                    className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                      isSelected
                        ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-[#e74c3c]/20 hover:text-[#e74c3c]"
                        : plan.popular
                        ? "bg-[var(--accent-primary)] text-[#212121] hover:opacity-90"
                        : "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[#212121]"
                    }`}
                  >
                    {isSelected ? "✓ Selected" : "Select Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="max-w-6xl mx-auto px-4 py-4 pb-8">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6">
          Add-ons
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          {addons.map((addon) => {
            const isSelected = selectedItems.some(
              (e) => e.plan.id === addon.id,
            );
            return (
              <div
                key={addon.id}
                className={`bg-[var(--card-bg)] rounded-2xl border p-5 transition-all hover:shadow-lg ${
                  isSelected
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20"
                    : "border-[var(--border-color)] hover:border-[var(--accent-primary)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addon.icon}</span>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {addon.name}
                    </h4>
                  </div>
                  <span className="text-lg font-bold text-[var(--accent-primary)]">
                    ${addon.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  {addon.description}
                </p>
                <button
                  onClick={() =>
                    isSelected ? removeItem(addon.id) : addItem(addon)
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isSelected
                      ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-[#e74c3c]/20 hover:text-[#e74c3c]"
                      : "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[#212121]"
                  }`}
                >
                  {isSelected ? "✓ Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gasless Badge */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[var(--accent-muted)] to-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Pay with USDC • Zero Gas Fees
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Pay with USDC - no SOL required. Offbank covers the gas so
                checkout is seamless for every user.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[#FFFFFF]/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[var(--card-bg)] h-full overflow-auto animate-slide-in-right">
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-color)] p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Your Order
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[var(--accent-muted)] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-6xl mb-4 block">🛒</span>
                <p className="text-[var(--text-muted)]">No items selected</p>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Pick a plan to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {selectedItems.map((item) => (
                    <div
                      key={item.plan.id}
                      className="flex items-center gap-4 p-3 bg-[var(--background)] rounded-xl"
                    >
                      <span className="text-3xl">{item.plan.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {item.plan.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {item.plan.description}
                        </p>
                        <p className="text-sm text-[var(--accent-primary)] font-medium">
                          ${item.plan.price.toFixed(2)} USDC {item.plan.billing}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.plan.id)}
                        className="p-2 hover:bg-[#e74c3c]/20 rounded-lg transition-colors text-[#e74c3c]"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] p-4 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-[var(--text-secondary)]">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-[var(--text-primary)]">
                        ${total.toFixed(2)}
                      </span>
                      <span className="text-sm text-[var(--text-muted)] ml-1">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--accent-muted)] rounded-lg p-3">
                    <span>⚡</span>
                    <span>
                      Network fees:{" "}
                      <strong className="text-[var(--accent-primary)]">
                        $0.00
                      </strong>{" "}
                      (gasless)
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[var(--accent-primary)] text-[#212121] rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    Pay with USDC
                  </button>

                  <p className="text-xs text-center text-[var(--text-muted)]">
                    Powered by Offbank. Instant USDC settlement.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
