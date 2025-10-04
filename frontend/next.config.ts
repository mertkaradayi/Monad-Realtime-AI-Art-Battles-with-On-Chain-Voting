import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Netlify deployment
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // Enable experimental features if needed
  experimental: {
    esmExternals: false
  }
};

export default nextConfig;
