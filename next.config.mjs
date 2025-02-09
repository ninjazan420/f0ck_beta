/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif)$/i,
      type: 'asset/resource'
    });
    return config;
  }
};

export default nextConfig;
