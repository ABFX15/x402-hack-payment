import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Sprout,
  Crosshair,
  Globe,
  Gamepad2,
  ShoppingBag,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Industries | Offbank",
  description:
    "USDC payments for businesses banks won't serve — high-risk e-commerce, iGaming, CBD, hemp, firearms, cross-border wholesale, and cannabis. Checkout, payouts, and invoicing. 1% flat. Non-custodial.",
  alternates: { canonical: "/industries" },
};

// The two verticals we lead with — checkout-native and fastest to live.
const primaryIndustries = [
  {
    href: "/industries/high-risk-ecommerce",
    icon: ShoppingBag,
    title: "High-Risk E-Commerce",
    desc: "A drop-in USDC checkout for online stores payment processors drop — vape hardware, smoke-shop, kratom, nutra, adult and 2A gear. Sell retail with the checkout, bill wholesale buyers with B2B invoicing. No chargebacks, global by default.",
    points: ["Drop-in checkout widget", "B2B invoicing for wholesale", "No chargebacks"],
  },
  {
    href: "/industries/igaming",
    icon: Gamepad2,
    title: "iGaming & Online Gaming",
    desc: "Crypto deposits at checkout and instant USDC player payouts in under a second. No card processor to freeze you, no rolling reserves, no disputes weeks later. Fast withdrawals become your retention edge.",
    points: ["Instant player payouts", "Crypto deposits", "No processor freezes"],
  },
];

// The wider restricted-commerce market we also serve (secondary to the two above).
const alsoServing = [
  {
    href: "/industries/cbd-hemp",
    icon: Sprout,
    title: "CBD & Hemp",
    desc: "Hemp-derived cannabinoids, kratom, kava, botanicals.",
  },
  {
    href: "/industries/firearms",
    icon: Crosshair,
    title: "Firearms & Ammunition",
    desc: "FFLs, ammo manufacturers, and 2A retail.",
  },
  {
    href: "/industries/international-wholesale",
    icon: Globe,
    title: "International Wholesale",
    desc: "Cross-border B2B settlement without SWIFT.",
  },
  {
    href: "/industries/cannabis",
    icon: Leaf,
    title: "Cannabis & Wholesalers",
    desc: "State-legal cannabis operators. LeafLink-native.",
  },
];

export default function IndustriesHubPage() {
  return (
    <main className="bg-white text-[#212121]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0b0f0c] pt-32 pb-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(52,199,89,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1100px] px-6 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#34c759]/30 bg-[#34c759]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#34c759]">
            Industries we serve
          </p>
          <h1 className="text-[40px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[56px]">
            Built for commerce banks won&apos;t touch.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.6] text-white/75">
            We focus on two: online stores payment processors drop, and iGaming.
            1% flat USDC settlement, non-custodial, with USD off-ramp — checkout,
            invoicing, and instant payouts in one rail.
          </p>
        </div>
      </section>

      {/* Two primary verticals — the focus */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {primaryIndustries.map(({ href, icon: Icon, title, desc, points }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex flex-col rounded-2xl border border-[#eee] bg-[#fafafa] p-8 transition hover:-translate-y-0.5 hover:border-[#34c759]/40 hover:bg-white hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759]/10">
                  <Icon className="h-6 w-6 text-[#34c759]" />
                </div>
                <h2 className="mt-5 text-2xl font-bold">{title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5c5c5c]">
                  {desc}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {points.map((p) => (
                    <li
                      key={p}
                      className="rounded-full bg-[#34c759]/10 px-3 py-1 text-[12px] font-semibold text-[#027a48]"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#34c759]">
                  See how it works
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary — the wider restricted-commerce market we also serve */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-[#98a2b3]">
            Also serving the wider restricted-commerce market
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alsoServing.map(({ href, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-xl border border-[#eee] bg-[#fafafa] p-5 transition hover:border-[#34c759]/40 hover:bg-white hover:shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#34c759]/10">
                  <Icon className="h-4.5 w-4.5 text-[#34c759]" />
                </div>
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[#5c5c5c]">
                  {desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#34c759]">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f7] py-20">
        <div className="mx-auto max-w-[820px] px-6 text-center">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
            Don&apos;t see your category?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5c5c5c]">
            If banks treat you as &quot;high-risk&quot;, Offbank probably fits.
            Reach out and we&apos;ll tell you straight whether we can support
            your flow.
          </p>
          <Link
            href="mailto:adam@settlr.dev"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#34c759] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Talk to us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
