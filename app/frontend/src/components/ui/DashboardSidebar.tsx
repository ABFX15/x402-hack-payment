"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OffbankLogoWithIcon } from "@/components/offbank-logo";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  LayoutDashboard,
  Wallet,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Plus,
  FileText,
  BarChart3,
  ArrowRightLeft,
  Bell,
  ClipboardList,
  ShieldCheck,
  Send,
  QrCode,
  Receipt,
  Settings,
  Link2,
  Users,
} from "lucide-react";

// Focused nav - the money loop + the tools that support it. Niche/overlapping
// pages (orders, settlements, receivables, collections, team, privacy, cloak,
// subscriptions, webhooks) still exist and are reachable, just not surfaced here.
const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { href: "/dashboard/terminal", icon: QrCode, label: "Terminal" },
  { href: "/dashboard/payment-links", icon: Link2, label: "Payment Links" },
  { href: "/dashboard/suppliers", icon: Send, label: "Pay Suppliers" },
  { href: "/dashboard/affiliates", icon: Users, label: "Affiliate Payouts" },
  { href: "/dashboard/treasury", icon: Wallet, label: "Treasury" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Transactions" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/reports", icon: ClipboardList, label: "Reports" },
  { href: "/dashboard/compliance", icon: ShieldCheck, label: "Compliance" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { disconnect } = useWallet();
  const { logout: privyLogout, authenticated: privyAuthenticated } = usePrivy();

  // Sign out of BOTH wallet types: extension wallets via the adapter's
  // disconnect, and Privy email/embedded wallets via Privy logout. Calling
  // only one leaves email users stuck "signed in".
  const handleSignOut = async () => {
    try {
      await disconnect();
    } catch {
      /* not connected via adapter - fine */
    }
    try {
      if (privyAuthenticated) await privyLogout();
    } catch {
      /* not logged in via Privy - fine */
    }
    window.location.href = "/";
  };
  const { setVisible } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#f7f7f7]">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-[#d3d3d3]">
        <Link href="/" className="flex items-center gap-2">
          <OffbankLogoWithIcon size="sm" variant="dark" />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="ml-auto rounded-md p-1.5 text-[#5c5c5c] hover:text-[#212121] lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Subtitle */}
      <div className="px-5 pt-3 pb-2">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-[#8a8a8a] uppercase">
          USDC Treasury
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-1">
        {navItems.map((item) => {
          const active = isActive(
            item.href,
            (item as { exact?: boolean }).exact,
          );
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20"
                  : "text-[#8a8a8a] hover:bg-[#f2f2f2] hover:text-[#212121] border border-transparent"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="uppercase tracking-wide text-[12px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Create Invoice Button */}
      <div className="px-3 pb-3">
        <Link
          href="/dashboard/invoices/create"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#34c759] px-4 py-3 text-[13px] font-bold text-black uppercase tracking-wider transition-colors hover:bg-[#2ba048]"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-[#d3d3d3] p-3 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#5c5c5c] transition-colors hover:bg-[#f2f2f2] hover:text-[#212121]"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support</span>
        </Link>

        {connected && publicKey ? (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#5c5c5c] transition-colors hover:bg-[#f2f2f2] hover:text-[#e74c3c]"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="mt-2 flex w-full items-center gap-3 rounded-lg bg-[#34c759] px-3 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-[#2ba048]"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-[#f7f7f7] border-b border-[#d3d3d3] px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-[#8a8a8a] hover:text-[#212121]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <OffbankLogoWithIcon size="sm" variant="light" />
        <Link
          href="/dashboard/invoices/create"
          className="flex items-center gap-1.5 rounded-lg bg-[#34c759] px-3 py-1.5 text-xs font-bold text-black uppercase"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-[260px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[220px] border-r border-[#d3d3d3] bg-[#f7f7f7] lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Spacer */}
      <div className="hidden w-[220px] flex-shrink-0 lg:block" />
    </>
  );
}

export function DashboardTopBar() {
  const { publicKey } = useActiveWallet();

  return (
    <div className="hidden h-14 items-center justify-end gap-3 border-b border-[#d3d3d3] px-8 lg:flex">
      {/* Network Status */}
      <div className="flex items-center gap-2 mr-auto">
        <span className="text-xs text-[#5c5c5c] uppercase tracking-wider">
          Network Status
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#34c759]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759] animate-pulse" />
          Synchronized
        </span>
      </div>

      {/* Notification bell */}
      <button className="relative rounded-lg p-2 text-[#5c5c5c] hover:text-[#212121] hover:bg-[#f2f2f2] transition-colors">
        <Bell className="h-4 w-4" />
      </button>

      {/* User avatar */}
      <div className="h-8 w-8 rounded-full bg-[#f2f2f2] border border-[#d3d3d3] flex items-center justify-center">
        <span className="text-xs text-[#8a8a8a]">
          {publicKey ? publicKey.slice(0, 2).toUpperCase() : "??"}
        </span>
      </div>
    </div>
  );
}
