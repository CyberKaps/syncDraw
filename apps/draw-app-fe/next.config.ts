import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Needed for Docker deployment with pnpm monorepo
  transpilePackages: ['@repo/ui'],
  // Set the root for file tracing to include workspace dependencies
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
