import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "20mb",
        },
    },

    // Turbopack config (required for Next.js 16 when webpack config is present)
    turbopack: {},
    serverExternalPackages: ["sharp"],

    // Add images configuration for Cloudinary
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
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

    // Redirects for SEO & URL cleanups
    async redirects() {
        return [
            {
                source: '/college/:slug/course-&-fees',
                destination: '/college/:slug/course-and-fees',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;