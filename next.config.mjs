/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_COOKIE_DOMAIN: process.env.NEXTAUTH_COOKIE_DOMAIN,
    PUBLIC_URL: process.env.PUBLIC_URL || 'http://localhost:3000',
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif)$/i,
      type: 'asset/resource'
    });
    return config;
  },
  images: {
    domains: ['f0ck.org', 'localhost'],
    unoptimized: true,
    minimumCacheTTL: 0,
    remotePatterns: [
      // Nutze die neue URL()-Unterstützung in Next.js 15.3.1
      new URL('https://picsum.photos'),
      new URL('https://placehold.co'),
      new URL('https://giphy.com'),
      new URL('https://media4.giphy.com'),
      new URL('https://media3.giphy.com'),
      new URL('https://media2.giphy.com'),
      new URL('https://media1.giphy.com'),
      new URL('https://media0.giphy.com'),
      new URL('https://media.giphy.com'),
      new URL('https://i.giphy.com'),
      // Wildcard-Muster müssen weiterhin im alten Format angegeben werden
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
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
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
      {
        source: '/api/images/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
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
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || 'https://f0ck.org' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
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
