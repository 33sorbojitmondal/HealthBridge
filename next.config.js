/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Use React's new hydration to help with hydration errors
    optimizeFonts: true,
  },
};

module.exports = nextConfig; 