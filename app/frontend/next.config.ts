import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning
  turbopack: {
    root: ".",
  },
  // Ignore ESLint errors during build (Vercel compat)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (handled separately)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
