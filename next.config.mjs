/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif)$/i,
      type: 'asset/resource'
    });
    return config;
  },
  experimental: {
    turbopack: true
  },
  env: {
    PORT: 3001
  },
  images: {
    domains: ['picsum.photos', 'placehold.co'],  // Alternative zu remotePatterns
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
  }
};

export default nextConfig;
