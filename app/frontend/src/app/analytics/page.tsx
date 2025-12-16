"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

// Mock data for demo - in production, this would come from blockchain/API
const mockTransactions = [
  {
    id: "pay_001",
    amount: 150.0,
    customer: "7xKX...3mPq",
    date: "2025-12-15T10:30:00",
    status: "completed",
    memo: "Premium Plan",
  },
  {
    id: "pay_002",
    amount: 29.99,
    customer: "4dGo...7Ywd",
    date: "2025-12-15T09:15:00",
    status: "completed",
    memo: "Monthly subscription",
  },
  {
    id: "pay_003",
    amount: 500.0,
    customer: "9pLm...2kNx",
    date: "2025-12-14T16:45:00",
    status: "completed",
    memo: "Enterprise license",
  },
  {
    id: "pay_004",
    amount: 75.5,
    customer: "2wRt...8jQz",
    date: "2025-12-14T14:20:00",
    status: "completed",
    memo: "API credits",
  },
  {
    id: "pay_005",
    amount: 199.99,
    customer: "5yHn...1pVc",
    date: "2025-12-14T11:00:00",
    status: "refunded",
    memo: "Annual plan",
  },
  {
    id: "pay_006",
    amount: 45.0,
    customer: "8kBx...4mLw",
    date: "2025-12-13T18:30:00",
    status: "completed",
    memo: "Starter pack",
  },
  {
    id: "pay_007",
    amount: 1200.0,
    customer: "3nFs...9qTy",
    date: "2025-12-13T10:15:00",
    status: "completed",
    memo: "Bulk purchase",
  },
  {
    id: "pay_008",
    amount: 89.99,
    customer: "6jDc...7pRm",
    date: "2025-12-12T15:45:00",
    status: "completed",
    memo: "Pro upgrade",
  },
  {
    id: "pay_009",
    amount: 25.0,
    customer: "1mKw...3nXz",
    date: "2025-12-12T09:30:00",
    status: "completed",
    memo: "Tip",
  },
  {
    id: "pay_010",
    amount: 350.0,
    customer: "4pQr...8vBn",
    date: "2025-12-11T14:00:00",
    status: "completed",
    memo: "Consulting",
  },
];

// Generate mock daily data for the chart
const generateDailyData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      volume: Math.floor(Math.random() * 5000) + 500,
      transactions: Math.floor(Math.random() * 50) + 5,
    });
  }
  return data;
};

const dailyData = generateDailyData();

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Calculate stats
  const stats = useMemo(() => {
    const completed = mockTransactions.filter((t) => t.status === "completed");
    const totalVolume = completed.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = totalVolume / completed.length;
    const uniqueCustomers = new Set(mockTransactions.map((t) => t.customer))
      .size;

    // Mock comparison data (vs previous period)
    return {
      totalVolume,
      volumeChange: 23.5,
      transactions: completed.length,
      transactionChange: 12.3,
      avgTransaction,
      avgChange: -5.2,
      customers: uniqueCustomers,
      customerChange: 18.7,
    };
  }, []);

  // Calculate chart max for scaling
  const chartMax = Math.max(...dailyData.map((d) => d.volume));

  return (
    <main className="min-h-screen p-4 md:p-8 pt-24 bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track your payment performance and customer insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? "bg-[var(--primary)] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {range === "all" ? "All" : range}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg text-gray-700 hover:text-gray-900 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Volume"
            value={`$${stats.totalVolume.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            change={stats.volumeChange}
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="Transactions"
            value={stats.transactions.toString()}
            change={stats.transactionChange}
            icon={ShoppingCart}
            delay={0.1}
          />
          <StatCard
            title="Avg. Transaction"
            value={`$${stats.avgTransaction.toFixed(2)}`}
            change={stats.avgChange}
            icon={TrendingUp}
            delay={0.2}
          />
          <StatCard
            title="Unique Customers"
            value={stats.customers.toString()}
            change={stats.customerChange}
            icon={Users}
            delay={0.3}
          />
        </div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pop-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Payment Volume
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                <span className="text-gray-600">Volume (USDC)</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-1">
            {dailyData.slice(-30).map((day, i) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="relative w-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.volume / chartMax) * 200}px` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--primary)]/60 rounded-t-sm hover:from-[var(--primary)]/80 hover:to-[var(--primary)] transition-colors cursor-pointer"
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                      <p className="text-xs text-[var(--text-secondary)]">
                        {day.date}
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        ${day.volume.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {day.transactions} txns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
            <span>{dailyData[0]?.date}</span>
            <span>{dailyData[14]?.date}</span>
            <span>{dailyData[29]?.date}</span>
          </div>
        </motion.div>

        {/* Recent Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pop-card overflow-hidden"
        >
          <div className="p-6 border-b-2 border-black">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">
                    Transaction ID
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">
                    Memo
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="border-b border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[var(--text-primary)]">
                        {tx.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[var(--text-secondary)]">
                        {tx.customer}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[var(--text-primary)]">
                        ${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {tx.memo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : "bg-[var(--warning)]/10 text-[var(--warning)]"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t-2 border-black flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {mockTransactions.length} transactions
            </span>
            <button className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium">
              View all transactions →
            </button>
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-600 mt-8">
          📊 This is demo data. Connect your wallet to see real analytics.
        </p>
      </div>
    </main>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}

function StatCard({ title, value, change, icon: Icon, delay }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="pop-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>

      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}
