import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError } from "./errors";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserSession, UserSettings } from "@/types/user";
import type { Language } from "@/types/language";

// 获取用户session
export async function getUserSession(userId: number): Promise<UserSession | null> {
  try {
    const { env } = getCloudflareContext();
    const sessionData = await env.DEV_KV.get(`session:${userId}`);
    
    if (!sessionData) {
      return null;
    }
    
    return JSON.parse(sessionData) as UserSession;
  } catch (error) {
    throw new AppError('SERVICE_KV_ERROR', 'KV获取用户会话操作失败', error);
  }
}

// 更新用户session过期时间
export async function refreshUserSession(userId: number): Promise<void> {
  try {
    const session = await getUserSession(userId);
    if (session) {
      const { env } = getCloudflareContext();
      await env.DEV_KV.put(
        `session:${userId}`,
        JSON.stringify(session),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7天
      );
    }
  } catch (error) {
    throw new AppError('SERVICE_KV_ERROR', 'KV刷新用户会话操作失败', error);
  }
}

// 删除用户session（登出）
export async function deleteUserSession(userId: number): Promise<void> {
  try {
    const { env } = getCloudflareContext();
    await env.DEV_KV.delete(`session:${userId}`);
  } catch (error) {
    throw new AppError('SERVICE_KV_ERROR', 'KV删除用户会话操作失败', error);
  }
}

// 获取用户设置
export async function getUserSettings(userId: number): Promise<UserSettings | null> {
  try {
    const { env } = getCloudflareContext();
    
    // 首先尝试从 KV 缓存获取
    const settingsData = await env.DEV_KV.get(`settings:${userId}`);
    
    if (settingsData) {
      return JSON.parse(settingsData) as UserSettings;
    }
    
    // KV 中没有，从 D1 数据库读取
    const userSettings = await env.DEV_D1.prepare(`
      SELECT language_preference, theme, timezone 
      FROM users 
      WHERE id = ?
    `).bind(userId).first() as {
      language_preference: string | null;
      theme: string | null;
      timezone: string | null;
    } | null;
    
    // 构建设置对象（使用默认值）
    const settings: UserSettings = {
      userId,
      languagePreference: (userSettings?.language_preference || 'zh-CN') as Language,
      theme: userSettings?.theme || 'light',
      timezone: userSettings?.timezone || 'Asia/Shanghai'
    };
    
    // 缓存到 KV
    await env.DEV_KV.put(
      `settings:${userId}`,
      JSON.stringify(settings)
    );
    
    return settings;
  } catch (error) {
    throw new AppError('SERVICE_KV_ERROR', 'KV获取用户设置操作失败', error);
  }
}

// 更新用户设置
export async function updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<void> {
  try {
    const { env } = getCloudflareContext();
    const currentSettings = await getUserSettings(userId);
    
    if (currentSettings) {
      const updatedSettings = { ...currentSettings, ...settings };
      
      // 同时更新 D1 数据库和 KV 缓存
      await Promise.all([
        // 更新 D1 数据库
        env.DEV_D1.prepare(`
          UPDATE users 
          SET language_preference = ?, theme = ?, timezone = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(
          updatedSettings.languagePreference,
          updatedSettings.theme || 'light',
          updatedSettings.timezone || 'Asia/Shanghai',
          userId
        ).run(),
        
        // 更新 KV 缓存
        env.DEV_KV.put(
          `settings:${userId}`,
          JSON.stringify(updatedSettings)
        )
      ]);
    }
  } catch (error) {
    throw new AppError('SERVICE_KV_ERROR', 'KV更新用户设置操作失败', error);
  }
}

// 更新用户活动记录（仅每天第一次访问时更新）
export async function updateUserActivity(userId: number): Promise<void> {
  try {
    const session = await getUserSession(userId);
    if (!session) return;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
    
    // 检查是否需要更新（今天还没有活动记录）
    if (session.lastActivityDate !== today) {
      const { env } = getCloudflareContext();
      const updatedSession = {
        ...session,
        lastActivityDate: today
      };
      
      await env.DEV_KV.put(
        `session:${userId}`,
        JSON.stringify(updatedSession),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7天
      );
    }
  } catch (error) {
    throw new AppError('SERVICE_KV_ERROR', 'KV更新用户活动操作失败', error);
  }
}

// 验证用户是否已登录
export async function verifyUserSession(userId: number): Promise<boolean> {
  const session = await getUserSession(userId);
  return session !== null;
}

// 会话相关常量
export const REGULAR_SESSION_TTL = 7 * 24 * 60 * 60; // 7天

// Auth相关接口和类型
export interface AuthContext {
  userId: number;
  email: string;
  name: string | null;
  isAuthenticated: true;
}

export interface UnauthenticatedContext {
  isAuthenticated: false;
}

export type AuthResult = AuthContext | UnauthenticatedContext;


/**
 * 验证API请求的用户权限
 * 使用方法：在API路由中调用此函数来检查用户是否已登录
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // 从JWT token获取用户信息
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.sub) {
      return { isAuthenticated: false };
    }
    
    // 将 token.sub 转换为数字
    const userId = parseInt(token.sub);
    if (isNaN(userId)) {
      return { isAuthenticated: false };
    }
    
    // 从KV验证session是否有效
    const session = await getUserSession(userId);
    if (!session) {
      return { isAuthenticated: false };
    }
    
    // 更新用户活动时间
    await updateUserActivity(userId);
    
    return {
      userId: session.id, // session.id 现在是数字
      email: session.email!,
      name: session.name || null,
      isAuthenticated: true
    };
    
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false };
  }
}

/**
 * 要求API必须已登录才能访问的装饰器函数
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  return verifyAuth(request);
}

/**
 * 创建标准的未授权响应
 */
export function createUnauthorizedResponse(message = 'Unauthorized - Please login first') {
  return Response.json(
    { error: message }, 
    { status: 401 }
  );
}

/**
 * API权限检查的便捷函数
 * 如果未授权，直接返回401响应；如果已授权，返回用户信息
 */
export async function checkAuthOrResponse(request: NextRequest): Promise<AuthContext | Response> {
  const auth = await verifyAuth(request);
  
  if (!auth.isAuthenticated) {
    return createUnauthorizedResponse();
  }
  
  return auth;
}