import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// 定义需要认证的路由
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/ai-test',
];

// 定义需要认证的API路由
const protectedApiRoutes = [
  '/api/avatar',
  '/api/language',
];

// 定义认证相关的路由（已登录用户不应访问）
const authRoutes = [
  '/signin',
  '/register',
];

/**
 * 主中间件函数
 * 实现路由保护：未认证用户访问受保护页面时重定向到登录页
 * 已认证用户访问登录/注册页面时重定向到首页
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    // 获取用户认证状态
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    let userId: number | null = null;
    
    // 如果有token，验证KV中的session
    if (token?.sub) {
      try {
        const { env } = getCloudflareContext();
        const sessionKey = `session:${token.sub}`;
        const sessionData = await env.DEV_KV.get(sessionKey);
        
        if (sessionData) {
          userId = parseInt(token.sub);
        }
      } catch (kvError) {
        console.error('Error checking session in KV:', kvError);
        // KV错误时不允许认证，确保安全性
        userId = null;
      }
    }
    
    // 检查是否访问受保护的路由
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    // 检查是否访问需要认证的API路由
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    // 检查是否访问认证相关路由
    const isAuthRoute = authRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    // 未认证用户访问需要认证的API，直接返回401
    if (isProtectedApiRoute && !userId) {
      return Response.json({ error: '未登录' }, { status: 401 });
    }
    
    // 未认证用户访问受保护页面，重定向到登录页
    if (isProtectedRoute && !userId) {
      const loginUrl = new URL('/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // 已认证用户访问登录/注册页面，重定向到首页
    if (isAuthRoute && userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // 如果用户已认证，将用户ID添加到请求头中
    if (userId) {
      const response = NextResponse.next();
      response.headers.set('x-user-id', userId.toString());
      return response;
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // 匹配所有路由，排除静态文件和 Next.js 内部文件
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};