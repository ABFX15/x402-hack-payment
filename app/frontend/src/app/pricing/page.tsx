"use client";

import Link from "next/link";
import { Check, Zap, Building2, Rocket } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const plans = [
  {
    name: "Starter",
    description: "Perfect for indie developers and small projects",
    price: "1%",
    priceSubtext: "per transaction",
    icon: Zap,
    features: [
      "Unlimited transactions",
      "Gasless payments",
      "Embedded wallets",
      "Payment links",
      "Email support",
      "Basic analytics",
    ],
    cta: "Get Started",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Growth",
    description: "For growing businesses with higher volume",
    price: "0.75%",
    priceSubtext: "per transaction",
    icon: Rocket,
    features: [
      "Everything in Starter",
      "Priority support",
      "Webhooks",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Team accounts",
    ],
    cta: "Contact Sales",
    href: "/waitlist",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for high-volume merchants",
    price: "Custom",
    priceSubtext: "volume-based pricing",
    icon: Building2,
    features: [
      "Everything in Growth",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
      "Compliance tools",
      "White-label options",
      "On-chain reporting",
    ],
    cta: "Talk to Us",
    href: "/waitlist",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                Pricing
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              No hidden fees. No monthly charges. Just pay per transaction.
              Start accepting crypto payments today.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 transition-all ${
                    plan.popular
                      ? "border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10"
                      : "border-white/10 bg-[#12121a]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div
                      className={`inline-flex rounded-xl p-3 mb-4 ${
                        plan.popular ? "bg-purple-500/20" : "bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          plan.popular ? "text-purple-400" : "text-white/60"
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-white/50">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-white/50 ml-2">
                      {plan.priceSubtext}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-white/70"
                      >
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full rounded-xl py-3 text-center font-semibold transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                        : "border border-white/10 text-white hover:bg-white/5"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Are there any monthly fees?",
                  a: "No. You only pay per transaction. There are no setup fees, monthly fees, or hidden charges.",
                },
                {
                  q: "Who pays for gas fees?",
                  a: "We cover all gas fees for your customers. They only pay the transaction amount - no SOL required.",
                },
                {
                  q: "How fast are settlements?",
                  a: "Instant. Funds are settled directly to your wallet in real-time, typically within 2 seconds.",
                },
                {
                  q: "Can I try before committing?",
                  a: "Yes! Try our demo with test payments. No credit card or signup required.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-white/10 bg-[#12121a] p-6"
                >
                  <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                  <p className="text-white/60 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
