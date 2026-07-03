import dynamic from "next/dynamic";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Hero, LogoBar, BentoCards } from "@/components/landing";

/* Below-fold sections, lazy loaded to reduce initial JS bundle */
const WhyUnfreezable = dynamic(() =>
  import("@/components/landing/WhyUnfreezable").then((m) => ({
    default: m.WhyUnfreezable,
  })),
);
const SocialProof = dynamic(() =>
  import("@/components/landing/SocialProof").then((m) => ({
    default: m.SocialProof,
  })),
);
const Features = dynamic(() =>
  import("@/components/landing/Features").then((m) => ({
    default: m.Features,
  })),
);
const TabSection = dynamic(() =>
  import("@/components/landing/TabSection").then((m) => ({
    default: m.TabSection,
  })),
);
const Pricing = dynamic(() =>
  import("@/components/landing/Pricing").then((m) => ({
    default: m.Pricing,
  })),
);
const Testimonials = dynamic(() =>
  import("@/components/landing/Testimonials").then((m) => ({
    default: m.Testimonials,
  })),
);
const Steps = dynamic(() =>
  import("@/components/landing/Steps").then((m) => ({
    default: m.Steps,
  })),
);
const FAQ = dynamic(() =>
  import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })),
);
const CTA = dynamic(() =>
  import("@/components/landing/CTA").then((m) => ({ default: m.CTA })),
);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://offbankpay.com/#organization",
                name: "Offbank",
                url: "https://offbankpay.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://offbankpay.com/icon.svg",
                  width: 512,
                  height: 512,
                },
                description:
                  "Self-custodial USDC payment infrastructure for merchants processors won't touch - high-risk e-commerce, iGaming, cross-border, and cannabis. Drop-in checkout, instant payouts, and invoicing. When your processor freezes or goes down, Offbank keeps settling. 1% flat, non-custodial, USDC on Solana.",
                foundingDate: "2025",
                sameAs: ["https://x.com/offbankpay"],
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "adam@settlr.dev",
                  contactType: "sales",
                },
                areaServed: "US",
                knowsAbout: [
                  "stablecoin settlement",
                  "high-risk e-commerce checkout",
                  "iGaming payments",
                  "USDC",
                  "Solana blockchain",
                  "non-custodial payments",
                  "high-risk merchant processing",
                  "cannabis B2B payments",
                ],
              },
              {
                "@type": "WebSite",
                "@id": "https://offbankpay.com/#website",
                url: "https://offbankpay.com",
                name: "Offbank",
                publisher: { "@id": "https://offbankpay.com/#organization" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://offbankpay.com/help?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "SoftwareApplication",
                name: "Offbank",
                applicationCategory: "FinanceApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "1% flat fee per settlement, no monthly minimums",
                },
                featureList: [
                  "Non-custodial USDC settlement",
                  "Instant on-chain finality on Solana",
                  "Purchase order to invoice workflow",
                  "Automated collection reminders",
                  "LeafLink integration",
                  "USDC to USD off-ramp via Sphere",
                  "BSA/AML compliance receipts",
                ],
              },
            ],
          }),
        }}
      />

      <div
        className="min-h-screen bg-white text-[#5c5c5c]"
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
        }}
      >
        <Navbar />
        <Hero />
        <LogoBar />
        <BentoCards />
        <WhyUnfreezable />
        <SocialProof />
        <Features />
        <TabSection />
        <Pricing />
        <Testimonials />
        <Steps />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
