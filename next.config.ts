import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic rendering for pages that use MongoDB
  experimental: {
    // Needed for dynamic params
  },
  // Disable static generation for dynamic pages
  output: undefined,
};

export default nextConfig;
