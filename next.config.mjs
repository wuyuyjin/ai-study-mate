/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 明确禁用 Turbopack,避免在某些环境下自动启用导致崩溃
  experimental: {
    turbo: false,
  },
}

export default nextConfig
