
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/firebasestudio-89520.appspot.com/o/**',
      },
    ],
  },
  experimental: {
    // This is required to allow requests from the development environment's origin.
    allowedDevOrigins: [
        "https://6000-idx-studio-1744586720321.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;


    
