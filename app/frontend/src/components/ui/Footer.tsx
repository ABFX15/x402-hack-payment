import Link from "next/link";
import { OffbankLogo } from "@/components/offbank-logo";

const columns = [
  {
    title: "Products",
    links: [
      { href: "/products/payment-links", label: "Payment Links" },
      { href: "/products/invoices", label: "Invoicing" },
      { href: "/docs?tab=api", label: "REST API" },
      { href: "/docs?tab=webhooks", label: "Webhooks" },
    ],
  },
  {
    title: "Industries",
    links: [
      {
        href: "/industries/high-risk-ecommerce",
        label: "High-Risk E-Commerce",
      },
      { href: "/industries/igaming", label: "iGaming" },
      { href: "/industries", label: "All Industries" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/docs", label: "Docs" },
      { href: "/help", label: "Support" },
      { href: "/learn", label: "Knowledge Hub" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "mailto:adam@settlr.dev", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

const socials = [
  {
    href: "https://x.com/offbankpay",
    label: "X / Twitter",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com/company/offbankpay",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#f7f7f7" }}>
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-8">
          {/* brand */}
          <div>
            <Link href="/" className="inline-block">
              <OffbankLogo size="sm" variant="dark" />
            </Link>
            <p
              className="mt-4 max-w-[240px] text-sm leading-relaxed"
              style={{ color: "#8a8a8a" }}
            >
              Non-custodial USDC invoicing and B2B settlement for restricted
              commerce. Built on Solana.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-[#8a8a8a] transition-colors hover:text-[#212121]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p
                className="mb-4 text-sm font-semibold"
                style={{ color: "#212121" }}
              >
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[#212121]"
                      style={{ color: "#8a8a8a" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: "#d3d3d3" }}
        >
          <p className="text-sm" style={{ color: "#8a8a8a" }}>
            &copy; {new Date().getFullYear()} Offbank. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "#8a8a8a" }}>
            Offbank is not a bank or money transmitter. Settlement is
            peer-to-peer via USDC on Solana.
          </p>
        </div>
      </div>
    </footer>
  );
}
