import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'build',
  basePath: '/huangjie.github.io',
  assetPrefix: '/huangjie.github.io',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
