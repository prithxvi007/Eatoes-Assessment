/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  // Enable static builds for API routes that are dynamic
  output: 'standalone',
  // Skip linting during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip type checking during build for production
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;