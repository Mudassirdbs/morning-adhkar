import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/daily-azkar",
        destination: "/daily-duas",
      },
      {
        source: "/daily-adhkar",
        destination: "/daily-duas",
      },
      {
        source: "/duas",
        destination: "/daily-duas",
      },
    ];
  },
};

export default nextConfig;
