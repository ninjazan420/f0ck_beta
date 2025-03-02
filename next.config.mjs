/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
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
    domains: ['localhost'],
    unoptimized: true,
    minimumCacheTTL: 0,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      },
      {
        protocol: 'https',
        hostname: 'giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'media4.giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'media3.giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'media2.giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'media1.giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'media0.giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'media.giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'i.giphy.com'
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  async headers() {
    return [
      {
        source: '/api/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
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
