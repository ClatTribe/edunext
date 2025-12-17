import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // Allow Sanity CDN images
  images: {
    domains: ['cdn.sanity.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // Subdomain routing for blogs
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/blogs/:path*',
        has: [{ type: 'host', value: 'blogs.getedunext.com' }]
      }
    ];
  }
};

export default nextConfig;