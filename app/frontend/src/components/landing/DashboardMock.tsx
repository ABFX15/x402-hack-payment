"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  FileText,
  RefreshCw,
  Banknote,
  KeyRound,
  Webhook,
  ShieldCheck,
  LifeBuoy,
  Plus,
  TrendingUp,
} from "lucide-react";

/**
 * Static, realistic-looking Offbank dashboard rendered in HTML (not an image)
 * so the numbers read as a live product, not an empty $0 shell. Used as the
 * hero product shot inside the browser-chrome frame.
 */

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ArrowLeftRight, label: "Transactions" },
  { icon: Landmark, label: "Treasury" },
  { icon: FileText, label: "Invoices" },
  { icon: RefreshCw, label: "Recurring" },
  { icon: Banknote, label: "Off-Ramp" },
  { icon: KeyRound, label: "API Keys" },
  { icon: Webhook, label: "Webhooks" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: LifeBuoy, label: "Support" },
];

const stats = [
  { label: "Total Volume", value: "$2,847,300", delta: "+12.5%", sub: "4,182 payments" },
  { label: "Transactions", value: "4,182", delta: "+8.2%", sub: "All time" },
  { label: "Average Payment", value: "$681", delta: "+3.1%", sub: "Per transaction" },
  { label: "Today", value: "$48,210", delta: "+21%", sub: "156 payments today" },
];

const activity = [
  { name: "Skyline Gaming Ltd", type: "Deposit", amount: "+$12,400.00", pos: true, time: "2m ago" },
  { name: "AffiliateHub payout", type: "Payout", amount: "-$3,250.00", pos: false, time: "14m ago" },
  { name: "Northwind Supply Co · Invoice #1042", type: "Invoice", amount: "+$8,900.00", pos: true, time: "1h ago" },
  { name: "Cross-border supplier", type: "Payout", amount: "-$21,000.00", pos: false, time: "3h ago" },
];

// area chart points (0..100 x, value 0..100 y-from-top)
const line1 = "0,62 12,58 24,64 36,46 48,52 60,34 72,40 84,24 96,30 100,22";
const line2 = "0,78 12,74 24,80 36,70 48,74 60,66 72,70 84,60 96,64 100,58";

export function DashboardMock() {
  return (
    <div className="flex min-h-[520px] w-full bg-[#fbfbfc] text-[#0d0d0f]">
      {/* sidebar */}
      <aside className="hidden w-[188px] shrink-0 flex-col bg-[#0d0d0f] px-3 py-4 md:flex">
        <div className="mb-5 flex items-center gap-2 px-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#34c759] text-[11px] font-bold text-white">
            O
          </span>
          <span className="text-sm font-semibold text-white">Offbank</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {nav.map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${
                n.active
                  ? "bg-white/10 text-white"
                  : "text-white/45"
              }`}
            >
              <n.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {n.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* main */}
      <div className="flex-1 overflow-hidden p-5">
        {/* header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold tracking-tight">Dashboard</h3>
            <p className="text-[11px] text-[#8a8a8a]">Welcome back, 8dJ4…LvxG</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-[#ececef] bg-white px-3 py-1.5 text-[11px] font-medium text-[#5c5c5c] sm:inline">
              Fund Treasury
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#34c759] px-3 py-1.5 text-[11px] font-semibold text-white">
              <Plus className="h-3 w-3" /> New Payment
            </span>
          </div>
        </div>

        {/* balance + chart row */}
        <div className="mb-4 grid gap-3 lg:grid-cols-[1.1fr_1.4fr]">
          {/* wallet balance */}
          <div className="rounded-xl border border-[#ececef] bg-white p-4">
            <p className="text-[11px] font-medium text-[#8a8a8a]">Wallet Balance</p>
            <p className="mt-1 text-[26px] font-bold leading-none">
              $128,540.00
              <span className="ml-1 text-[12px] font-medium text-[#8a8a8a]">USDC</span>
            </p>
            <div className="mt-3 flex items-center justify-center rounded-lg bg-[#0d0d0f] py-2 text-[11px] font-semibold text-white">
              Cash Out to Bank
            </div>
          </div>

          {/* revenue chart */}
          <div className="rounded-xl border border-[#ececef] bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-medium text-[#8a8a8a]">Settlement volume</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2ba048]">
                <TrendingUp className="h-3 w-3" /> +12.5%
              </span>
            </div>
            <svg viewBox="0 0 100 90" preserveAspectRatio="none" className="h-[110px] w-full">
              <defs>
                <linearGradient id="dashfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34c759" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#34c759" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f0f0f2" strokeWidth="0.5" />
              ))}
              <polygon points={`${line1} 100,90 0,90`} fill="url(#dashfill)" />
              <polyline points={line1} fill="none" stroke="#34c759" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              <polyline points={line2} fill="none" stroke="#00d5b8" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-[#ececef] bg-white p-3">
              <p className="text-[10px] font-medium text-[#8a8a8a]">{s.label}</p>
              <p className="mt-1 text-[18px] font-bold leading-none">{s.value}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[10px] font-semibold text-[#2ba048]">{s.delta}</span>
                <span className="text-[10px] text-[#b0b0b5]">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* recent activity */}
        <div className="rounded-xl border border-[#ececef] bg-white">
          <div className="flex items-center justify-between border-b border-[#f0f0f2] px-4 py-2.5">
            <p className="text-[12px] font-semibold">Recent Activity</p>
            <span className="text-[11px] font-medium text-[#2ba048]">View all</span>
          </div>
          <div className="divide-y divide-[#f4f4f6]">
            {activity.map((a) => (
              <div key={a.name} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      a.pos ? "bg-[#34c759]/12 text-[#2ba048]" : "bg-[#0d0d0f]/6 text-[#5c5c5c]"
                    }`}
                  >
                    {a.pos ? "↓" : "↑"}
                  </span>
                  <div>
                    <p className="text-[12px] font-medium leading-tight">{a.name}</p>
                    <p className="text-[10px] text-[#8a8a8a]">{a.type} · Settled</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[12px] font-semibold ${a.pos ? "text-[#2ba048]" : "text-[#0d0d0f]"}`}>
                    {a.amount}
                  </p>
                  <p className="text-[10px] text-[#b0b0b5]">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
