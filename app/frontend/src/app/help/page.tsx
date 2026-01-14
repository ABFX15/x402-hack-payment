"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Mail,
  MessageCircle,
  Book,
  Zap,
  CreditCard,
  Shield,
  RefreshCw,
  Code,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

const faqCategories = [
  {
    name: "Getting Started",
    icon: Zap,
    faqs: [
      {
        question: "How do I create a merchant account?",
        answer:
          "Sign in with your email at settlr.dev/onboarding. You'll get a wallet address and API key instantly. No lengthy application process.",
      },
      {
        question: "What do I need to start accepting payments?",
        answer:
          "Just your email to sign up. We create an embedded Solana wallet for you automatically. You can start generating payment links immediately.",
      },
      {
        question: "How long does setup take?",
        answer:
          "Most merchants are set up in under 5 minutes. Sign up, get your API key, and you can start accepting payments right away.",
      },
      {
        question: "Do my customers need a crypto wallet?",
        answer:
          "No! That's one of our key features. Customers can pay with just their email address. We handle the wallet creation behind the scenes.",
      },
    ],
  },
  {
    name: "Payments & Fees",
    icon: CreditCard,
    faqs: [
      {
        question: "What are your fees?",
        answer:
          "We offer competitive volume-based pricing with no monthly fees and no hidden costs. Contact us to discuss pricing for your specific use case.",
      },
      {
        question: "When do I receive my funds?",
        answer:
          "Instantly. We're non-custodial, meaning payments go directly to your Solana wallet. No holding periods, no delays.",
      },
      {
        question: "What currencies do you support?",
        answer:
          "Customers can pay with any Solana token (SOL, BONK, JUP, PYTH, WIF, and more). We automatically swap to USDC using Jupiter, so you always receive USDC. Customers can also buy crypto with a credit card through our MoonPay integration.",
      },
      {
        question: "Can customers pay with credit cards?",
        answer:
          "Yes! Through our MoonPay integration, customers can buy crypto with their credit card. We also support paying with any Solana token and automatically swap to USDC for you.",
      },
      {
        question: "Do customers pay gas fees?",
        answer:
          "No. We sponsor all gas fees. Your customers pay the exact amount shown - no surprises.",
      },
    ],
  },
  {
    name: "Security & Compliance",
    icon: Shield,
    faqs: [
      {
        question: "Is Settlr custodial or non-custodial?",
        answer:
          "Non-custodial. We never hold your funds. Payments settle directly to your wallet. You have full control at all times.",
      },
      {
        question: "What about chargebacks?",
        answer:
          "Crypto payments are irreversible by nature. Once confirmed, payments cannot be reversed. This eliminates chargeback fraud.",
      },
      {
        question: "What verification is required?",
        answer:
          "Basic onboarding requires email verification. For higher volumes or enterprise features, we may request additional business verification.",
      },
      {
        question: "How do you handle compliance?",
        answer:
          "We're building compliance features for regulated industries. Contact us if you have specific KYC/AML requirements for your use case.",
      },
    ],
  },
  {
    name: "Refunds & Disputes",
    icon: RefreshCw,
    faqs: [
      {
        question: "Can I issue refunds?",
        answer:
          "Yes. Our smart contract supports full and partial refunds. You can process refunds directly from your dashboard.",
      },
      {
        question: "How do refunds work technically?",
        answer:
          "Refunds are sent from your wallet back to the customer's wallet. You initiate the refund, and it processes instantly on Solana.",
      },
      {
        question: "Is there a time limit for refunds?",
        answer:
          "No time limit from our side. As long as you have the customer's wallet address from the original transaction, you can refund anytime.",
      },
    ],
  },
  {
    name: "Integration & API",
    icon: Code,
    faqs: [
      {
        question: "How do I integrate Settlr?",
        answer:
          "We offer multiple options: React SDK components, REST API, or simple payment links. Check our docs at /docs for full integration guides.",
      },
      {
        question: "Do you support webhooks?",
        answer:
          "Yes. You can configure webhook URLs to receive real-time notifications when payments complete, fail, or are refunded.",
      },
      {
        question: "Is there a sandbox/testnet?",
        answer:
          "Yes. We run on Solana Devnet for testing. You can test the full payment flow without real money.",
      },
      {
        question: "Do you have plugins for Shopify/WooCommerce?",
        answer:
          "Coming soon. We're building e-commerce plugins. For now, you can integrate via API or embed payment links directly.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-white">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
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
            className="overflow-hidden"
          >
            <p className="pb-4 text-gray-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].name);

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
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
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/docs"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="/waitlist"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </nav>
          <Link
            href="/onboarding"
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2"
          >
            <HelpCircle className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">Help Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-4xl font-bold text-white md:text-5xl"
          >
            How can we help?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Find answers to common questions or reach out to our team
          </motion.p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 pb-12">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          <Link
            href="/docs"
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/30 hover:bg-white/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Book className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Documentation</h3>
              <p className="text-sm text-gray-400">Technical guides & API</p>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-gray-400" />
          </Link>

          <Link
            href="/waitlist"
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/30 hover:bg-white/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
              <Mail className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Contact Us</h3>
              <p className="text-sm text-gray-400">
                Get in touch with our team
              </p>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-gray-400" />
          </Link>

          <a
            href="https://twitter.com/SettlrPay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/30 hover:bg-white/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <MessageCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Twitter/X</h3>
              <p className="text-sm text-gray-400">@SettlrPay</p>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-gray-400" />
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-white">
            Frequently Asked Questions
          </h2>

          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {faqCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === category.name
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 px-6"
          >
            {faqCategories
              .find((c) => c.name === activeCategory)
              ?.faqs.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
          </motion.div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-white">
              Still have questions?
            </h3>
            <p className="mb-6 text-gray-400">
              Our team is here to help. Reach out and we'll get back to you
              within 24 hours.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
            >
              <Mail className="h-5 w-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
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
              className="transition-colors hover:text-white/50"
            >
              Docs
            </Link>
            <Link
              href="/waitlist"
              className="transition-colors hover:text-white/50"
            >
              Contact
            </Link>
            <Link href="/" className="transition-colors hover:text-white/50">
              Home
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
