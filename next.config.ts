import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize Turbopack for Supabase client
    turbo: {
      resolveAlias: {
        '@supabase/supabase-js': '@supabase/supabase-js',
      },
    },
  },
  
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