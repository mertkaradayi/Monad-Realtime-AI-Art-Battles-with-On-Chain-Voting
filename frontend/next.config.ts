import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Netlify deployment
  images: {
    domains: ['localhost'],
    unoptimized: true
  }
  // Removed experimental.esmExternals to fix Turbopack compatibility
};

export default nextConfig;
