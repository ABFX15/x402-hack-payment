"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Loader2, LogIn, User } from "lucide-react";

interface PrivyLoginButtonProps {
  className?: string;
}

export function PrivyLoginButton({ className = "" }: PrivyLoginButtonProps) {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return (
      <button
        disabled
        className={`flex items-center justify-center gap-2 bg-zinc-700 text-zinc-400 rounded-xl h-12 px-6 ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (authenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 bg-zinc-800 rounded-xl h-12 px-4">
          <User className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm">
            {user?.email?.address?.slice(0, 15) || "Connected"}
          </span>
        </div>
        <button
          onClick={logout}
          className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl h-12 px-4 text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl h-12 px-6 hover:opacity-90 transition-opacity ${className}`}
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </button>
  );
}
