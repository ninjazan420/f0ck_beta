/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
//  swcMinify: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif)$/i,
      type: 'asset/resource'
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    minimumCacheTTL: 60
  },
  eslint: {
    // Warning: Dies erlaubt Production Builds auch mit ESLint Fehlern
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: Dies erlaubt Production Builds auch mit TypeScript Fehlern
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
