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
  }
};

export default nextConfig;
