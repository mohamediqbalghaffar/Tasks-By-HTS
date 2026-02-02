
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Required for GitHub Pages
  // basePath: '/Tasks-By-HTS', // UNCOMMENT THIS LINE if your repo name is 'Tasks-By-HTS'
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/firebasestudio-89520.appspot.com/o/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    allowedDevOrigins: [
      "https://6000-idx-studio-1744586720321.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev"
    ],
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "service-worker.js",
});

export default withPWA(nextConfig);


