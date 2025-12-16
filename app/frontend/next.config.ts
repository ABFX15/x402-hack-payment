import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
