import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker containerization
  /* config options here */
};

export default nextConfig;
