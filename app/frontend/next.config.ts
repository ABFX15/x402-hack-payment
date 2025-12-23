import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning
  turbopack: {
    root: ".",
  },
  // Exclude problematic packages from server-side bundling
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  // Transpile Privy packages
  transpilePackages: ["@privy-io/react-auth"],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      perf_hooks: false,
      "why-is-node-running": false,
    };

    // Handle pino and thread-stream which have Node.js-only dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      "why-is-node-running": false,
    };

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        pino: false,
        "pino-pretty": false,
        "thread-stream": false,
      };
    }

    // Ignore problematic test files from node_modules
    config.module.rules.push({
      test: /node_modules[/\\](thread-stream|pino)[/\\].*\.(js|ts)$/,
      loader: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
