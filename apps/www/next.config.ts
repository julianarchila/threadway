import type { NextConfig } from "next";
import "@env";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/relay-r5mr/static/:path*",
                destination: "https://us-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/relay-r5mr/:path*",
                destination: "https://us.i.posthog.com/:path*",
            },
        ];
    },

    skipTrailingSlashRedirect: true,
};

export default nextConfig;
