import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // config to allow Python API
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/'
      }
    ]
  }
};

export default nextConfig;
