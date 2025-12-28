"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Artisan Coffee Blend",
    description: "Single-origin Ethiopian beans, medium roast",
    price: 0.1,
    image: "☕",
    category: "Drinks",
  },
  {
    id: "2",
    name: "Avocado Toast",
    description: "Sourdough, smashed avo, chili flakes, poached egg",
    price: 0.15,
    image: "🥑",
    category: "Food",
  },
  {
    id: "3",
    name: "Matcha Latte",
    description: "Ceremonial grade matcha with oat milk",
    price: 0.08,
    image: "🍵",
    category: "Drinks",
  },
  {
    id: "4",
    name: "Croissant",
    description: "Butter croissant, baked fresh daily",
    price: 0.05,
    image: "🥐",
    category: "Food",
  },
  {
    id: "5",
    name: "Açaí Bowl",
    description: "Organic açaí, granola, banana, berries",
    price: 0.12,
    image: "🫐",
    category: "Food",
  },
  {
    id: "6",
    name: "Cold Brew",
    description: "24-hour steeped, smooth and bold",
    price: 0.06,
    image: "🧊",
    category: "Drinks",
  },
];

export default function DemoStorePage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
    []
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const demoWallet = "Ac52MMouwRypY7WPxMnUGwi6ZDRuBDgbmt9aXKSp43By";
    const itemNames = cart
      .map((item) => `${item.quantity}x ${item.product.name}`)
      .join(", ");

    router.push(
      `/checkout?amount=${cartTotal.toFixed(
        2
      )}&merchant=Solana%20Café&to=${demoWallet}&memo=${encodeURIComponent(
        itemNames
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--card-bg)] border-b border-[var(--border-color)] backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--accent-muted)] transition-colors"
              title="Exit demo"
            >
              <span className="text-xl">✕</span>
            </Link>
            <span className="text-3xl">☕</span>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Solana Café
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Pay with USDC • No gas fees
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full bg-[var(--accent-muted)] hover:bg-[var(--accent-primary)] transition-colors"
          >
            <span className="text-xl">🛒</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[var(--accent-muted)] to-transparent py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Fresh & Delicious
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Order your favorites and pay instantly with USDC.
            <span className="text-[var(--accent-primary)] font-medium">
              {" "}
              Zero gas fees!
            </span>
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:border-[var(--accent-primary)] transition-all hover:shadow-lg group"
            >
              <div className="h-32 bg-gradient-to-br from-[var(--accent-muted)] to-[var(--card-bg)] flex items-center justify-center">
                <span className="text-6xl group-hover:scale-110 transition-transform">
                  {product.image}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {product.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-[var(--accent-primary)]">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      USDC
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gasless Badge */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-[var(--accent-muted)] to-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Gasless Payments Powered by Kora
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Pay only what you see. No hidden fees, no SOL required for gas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[var(--card-bg)] h-full overflow-auto animate-slide-in-right">
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-color)] p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Your Cart
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[var(--accent-muted)] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-6xl mb-4 block">🛒</span>
                <p className="text-[var(--text-muted)]">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 p-3 bg-[var(--background)] rounded-xl"
                    >
                      <span className="text-3xl">{item.product.image}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-[var(--accent-primary)]">
                          ${item.product.price.toFixed(2)} USDC
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--accent-muted)]"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--accent-muted)]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] p-4 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-[var(--text-secondary)]">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-[var(--text-primary)]">
                        ${cartTotal.toFixed(2)}
                      </span>
                      <span className="text-sm text-[var(--text-muted)] ml-1">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--accent-muted)] rounded-lg p-3">
                    <span>⚡</span>
                    <span>
                      Gas fees:{" "}
                      <strong className="text-[var(--accent-primary)]">
                        $0.00
                      </strong>{" "}
                      (covered by merchant)
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    Pay with USDC
                  </button>
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
