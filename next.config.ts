import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'build',
  basePath: '/sx.zzzl',
  assetPrefix: '/sx.zzzl',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
