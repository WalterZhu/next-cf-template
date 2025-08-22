import { NextRequest, NextResponse } from "next/server";
import { 
  isRegionBlocked, 
  createBlockedResponse,
  getGeoInfoFromCloudflare 
} from "./lib/geo-blocking";

export async function middleware(request: NextRequest) {
  // 从 Cloudflare Workers 获取地理信息
  const { country } = getGeoInfoFromCloudflare(request);
  
  // 检查国家是否被屏蔽
  if (isRegionBlocked(country)) {
    console.log(`Blocked access from country: ${country}`);
    return createBlockedResponse(country || 'Unknown');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路由，排除静态文件和 Next.js 内部文件
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};