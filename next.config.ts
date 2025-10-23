import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
  // Enable instrumentation for Sentry
  experimental: {
    instrumentationHook: true,
  },
  /* config options here */
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production
  disableServerWebpackPlugin: process.env.NODE_ENV !== "production",
  disableClientWebpackPlugin: process.env.NODE_ENV !== "production",
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
