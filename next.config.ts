import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "20mb",
        },
    },

    outputFileTracingExcludes: {
        '**/*': [
            '*.jsonl',
            '*.jsonl*',
            'colleges-data.json',
        ],
    },

    // Turbopack config (required for Next.js 16 when webpack config is present)
    turbopack: {},
    serverExternalPackages: ["sharp", "@remotion/bundler", "@remotion/renderer", "instagram-private-api", "@resvg/resvg-js"],

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
            {
                // Duplicate XAT post merged into the newer, longer version
                source: '/blogs/xat-response-sheet-2026-download-calculate-score',
                destination: '/blogs/xat-response-sheet-2026-download-link-calculate-score',
                permanent: true,
            },
            {
                source: '/blogs/is-an-online-mba-worth-it-in-india-in-2026',
                destination: '/blogs/is-an-online-mba-worth-it-in-india-in-2027',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;