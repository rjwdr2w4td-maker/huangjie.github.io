import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'build',
  assetPrefix: '/huangjie.github.io',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
