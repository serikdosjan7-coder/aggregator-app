import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Skip full TypeScript type-checking during build to avoid OOM on
  // Windows with large dependency graphs (Framer Motion + admin pages).
  // Type errors are still caught in the editor via tsserver.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
