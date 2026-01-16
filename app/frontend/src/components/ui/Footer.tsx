import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  product: [
    { href: "/demo", label: "Demo" },
    { href: "/docs", label: "Documentation" },
    { href: "/pricing", label: "Pricing" },
    { href: "/onboarding", label: "Get Started" },
  ],
  developers: [
    { href: "/docs", label: "Quick Start" },
    { href: "/docs?tab=api", label: "API Reference" },
    {
      href: "https://www.npmjs.com/package/@settlr/sdk",
      label: "npm Package",
      external: true,
    },
    {
      href: "https://github.com/ABFX15/x402-hack-payment",
      label: "GitHub",
      external: true,
    },
  ],
  company: [
    { href: "/help", label: "Support" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "mailto:support@settlr.dev", label: "Contact Us" },
  ],
};

const socialLinks = [
  { href: "https://x.com/SettlrPay", icon: Twitter, label: "Twitter" },
  {
    href: "https://github.com/ABFX15/x402-hack-payment",
    icon: Github,
    label: "GitHub",
  },
  { href: "mailto:support@settlr.dev", icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-new.png"
                alt="Settlr"
                width={100}
                height={28}
                className="object-contain opacity-80"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Non-custodial crypto payment processor. Accept any token, receive
              USDC instantly. Built on Solana.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Developers
            </h4>
            <ul className="space-y-3">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Settlr. Built on Solana.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
