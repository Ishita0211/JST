/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This allows the app to work even if there are small 
  // styling warnings during the Vercel build.
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
