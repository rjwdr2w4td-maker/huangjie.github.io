import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 配置静态导出模式
  output: 'export',
  // 如果需要部署到子路径（如 GitHub Pages），需要配置 basePath
  // basePath: '/your-repo-name',
  images: {
    // 静态导出模式下，不支持 next/image 的 remotePatterns，需要使用普通 img 标签或禁用优化
    unoptimized: true,
  },
};

export default nextConfig;
