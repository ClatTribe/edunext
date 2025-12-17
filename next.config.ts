import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the experimental.turbo section - it's not needed in Next.js 16
  // Turbopack is now built-in and doesn't require this configuration
  
  // Webpack config for fallbacks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;