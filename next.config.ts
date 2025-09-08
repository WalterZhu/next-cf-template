import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 构建时忽略错误（开发便利性）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Cloudflare 部署优化

  // 禁用 SWC minify，使用 Terser（更兼容原生依赖）
  swcMinify: false,
  
  // 优化 Cloudflare 部署
  output: 'standalone',
  
  // 禁用一些可能导致原生依赖问题的特性
  experimental: {
    forceSwcTransforms: false,
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
