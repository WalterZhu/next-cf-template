import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 从 Cloudflare 的 CF-IPCountry 头部获取国家信息
  const country = request.headers.get('CF-IPCountry');
  
  return NextResponse.json({
    country,
  });
}