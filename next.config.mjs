/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker/Vercel deployments
  output: 'standalone',

  // Allow images from GitHub (raw.githubusercontent.com)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
