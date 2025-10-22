import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker containerization
  eslint: {
    // Disable ESLint during production builds (fix warnings later)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds (fix warnings later)
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
