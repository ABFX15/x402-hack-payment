"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Tournament {
  id: string;
  name: string;
  description: string;
  entryFee: number;
  prizePool: string;
  image: string;
  game: string;
  players: string;
  startsIn: string;
}

const tournaments: Tournament[] = [
  {
    id: "1",
    name: "Warzone Wednesday",
    description: "Battle Royale • Solo • Kill Race Format",
    entryFee: 5.0,
    prizePool: "$500",
    image: "🎯",
    game: "Call of Duty",
    players: "87/100",
    startsIn: "2h 15m",
  },
  {
    id: "2",
    name: "FIFA Pro League",
    description: "1v1 Single Elimination • Best of 3",
    entryFee: 10.0,
    prizePool: "$1,000",
    image: "⚽",
    game: "EA FC 25",
    players: "28/32",
    startsIn: "45m",
  },
  {
    id: "3",
    name: "Fortnite Friday",
    description: "Duo Tournament • Point System",
    entryFee: 2.5,
    prizePool: "$250",
    image: "🏗️",
    game: "Fortnite",
    players: "156/200",
    startsIn: "5h 30m",
  },
  {
    id: "4",
    name: "Apex Predator Cup",
    description: "Trios • Ranked Arena • 6 Games",
    entryFee: 15.0,
    prizePool: "$1,500",
    image: "🔥",
    game: "Apex Legends",
    players: "18/20",
    startsIn: "1h 20m",
  },
  {
    id: "5",
    name: "Rocket League Rumble",
    description: "2v2 Double Elimination • Best of 5 Finals",
    entryFee: 7.5,
    prizePool: "$750",
    image: "🚀",
    game: "Rocket League",
    players: "44/64",
    startsIn: "3h 45m",
  },
  {
    id: "6",
    name: "Valorant Showdown",
    description: "5v5 • Map Veto • Single Elim",
    entryFee: 25.0,
    prizePool: "$2,500",
    image: "💎",
    game: "Valorant",
    players: "14/16",
    startsIn: "30m",
  },
];

export default function DemoStorePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<
    { tournament: Tournament; quantity: number }[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addEntry = (tournament: Tournament) => {
    setEntries((prev) => {
      const existing = prev.find(
        (item) => item.tournament.id === tournament.id
      );
      if (existing) {
        // For tournaments, typically only 1 entry per player
        return prev;
      }
      return [...prev, { tournament, quantity: 1 }];
    });
  };

  const removeEntry = (tournamentId: string) => {
    setEntries((prev) =>
      prev.filter((item) => item.tournament.id !== tournamentId)
    );
  };

  const entryTotal = entries.reduce(
    (sum, item) => sum + item.tournament.entryFee * item.quantity,
    0
  );

  const entryCount = entries.length;

  const handleCheckout = () => {
    if (entries.length === 0) return;

    const demoWallet = "Ac52MMouwRypY7WPxMnUGwi6ZDRuBDgbmt9aXKSp43By";
    const tournamentNames = entries
      .map((item) => item.tournament.name)
      .join(", ");

    router.push(
      `/checkout?amount=${entryTotal.toFixed(
        2
      )}&merchant=Arena%20GG&to=${demoWallet}&memo=${encodeURIComponent(
        `Tournament Entry: ${tournamentNames}`
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)]/95 border-b border-[var(--border-color)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--accent-muted)] transition-colors"
              title="Exit demo"
            >
              <span className="text-xl">✕</span>
            </Link>
            <span className="text-3xl">🎮</span>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Arena GG
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Competitive Gaming • USDC Payouts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full bg-[var(--accent-muted)] hover:bg-[var(--accent-primary)] transition-colors"
          >
            <span className="text-xl">🎟️</span>
            {entryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {entryCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[var(--accent-muted)] to-transparent py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Compete. Win. Get Paid.
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Enter tournaments and receive instant USDC payouts.
            <span className="text-[var(--accent-primary)] font-medium">
              {" "}
              Zero gas fees on deposits!
            </span>
          </p>
        </div>
      </section>

      {/* Live Badge */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">6</strong>{" "}
            tournaments live •{" "}
            <strong className="text-[var(--text-primary)]">347</strong> players
            competing
          </span>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const isEntered = entries.some(
              (e) => e.tournament.id === tournament.id
            );
            return (
              <div
                key={tournament.id}
                className={`bg-[var(--card-bg)] rounded-2xl border overflow-hidden transition-all hover:shadow-lg group ${
                  isEntered
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20"
                    : "border-[var(--border-color)] hover:border-[var(--accent-primary)]"
                }`}
              >
                <div className="h-28 bg-gradient-to-br from-[var(--accent-muted)] to-[var(--card-bg)] flex items-center justify-center relative">
                  <span className="text-5xl group-hover:scale-110 transition-transform">
                    {tournament.image}
                  </span>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-[var(--card-bg)]/90 rounded-full text-xs font-medium text-[var(--text-secondary)]">
                    {tournament.game}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                    {tournament.prizePool} Prize
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-[var(--text-primary)] text-lg">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {tournament.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                    <span className="flex items-center gap-1">
                      👥 {tournament.players}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ Starts in {tournament.startsIn}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-[var(--accent-primary)]">
                        ${tournament.entryFee.toFixed(2)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        entry
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        isEntered
                          ? removeEntry(tournament.id)
                          : addEntry(tournament)
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        isEntered
                          ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-red-500/20 hover:text-red-400"
                          : "bg-[var(--accent-primary)] text-white hover:opacity-90"
                      }`}
                    >
                      {isEntered ? "✓ Entered" : "Enter Now"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gasless Badge */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[var(--accent-muted)] to-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Instant USDC Deposits • Zero Gas Fees
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Deposit your entry fee and winnings hit your wallet instantly.
                No SOL required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Entries Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[var(--card-bg)] h-full overflow-auto animate-slide-in-right">
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-color)] p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Your Entries
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[var(--accent-muted)] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-6xl mb-4 block">🎮</span>
                <p className="text-[var(--text-muted)]">
                  No tournaments selected
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Pick a tournament to compete!
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {entries.map((item) => (
                    <div
                      key={item.tournament.id}
                      className="flex items-center gap-4 p-3 bg-[var(--background)] rounded-xl"
                    >
                      <span className="text-3xl">{item.tournament.image}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {item.tournament.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {item.tournament.game} • {item.tournament.prizePool}{" "}
                          Prize
                        </p>
                        <p className="text-sm text-[var(--accent-primary)] font-medium">
                          ${item.tournament.entryFee.toFixed(2)} USDC
                        </p>
                      </div>
                      <button
                        onClick={() => removeEntry(item.tournament.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        title="Remove entry"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] p-4 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-[var(--text-secondary)]">
                      Total Entry Fees
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-[var(--text-primary)]">
                        ${entryTotal.toFixed(2)}
                      </span>
                      <span className="text-sm text-[var(--text-muted)] ml-1">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--accent-muted)] rounded-lg p-3">
                    <span>⚡</span>
                    <span>
                      Network fees:{" "}
                      <strong className="text-[var(--accent-primary)]">
                        $0.00
                      </strong>{" "}
                      (gasless deposit)
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    🎮 Deposit & Enter
                  </button>

                  <p className="text-xs text-center text-[var(--text-muted)]">
                    By entering, you agree to the tournament rules and terms of
                    service.
                  </p>
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
