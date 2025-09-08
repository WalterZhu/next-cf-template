import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ApiErrors, AppError } from "@/lib/errors";
import bcrypt from "bcryptjs";

// 邮箱格式验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 密码强度验证
function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少6位' };
  }
  if (password.length > 128) {
    return { valid: false, message: '密码长度不能超过128位' };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let body: { email: string; password: string; name?: string };
    try {
      body = await request.json() as { email: string; password: string; name?: string };
    } catch {
      return ApiErrors.badRequest('请求格式错误，请发送有效的JSON数据');
    }

    const { email, password, name } = body;

    // 验证必需参数
    if (!email || !password) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      return ApiErrors.missingParams(missingFields);
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return ApiErrors.invalidParams('邮箱格式无效');
    }

    // 验证密码强度
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return ApiErrors.invalidParams(passwordValidation.message);
    }

    // 验证用户名长度（如果提供）
    if (name && (name.length < 1 || name.length > 50)) {
      return ApiErrors.invalidParams('用户名长度必须在1-50个字符之间');
    }

    const { env } = getCloudflareContext();

    // 检查邮箱是否已存在
    const existingUser = await env.DEV_D1.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();

    if (existingUser) {
      return ApiErrors.conflict('该邮箱已注册，请使用其他邮箱或直接登录');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户（ID 自动生成）
    const result = await env.DEV_D1.prepare(
      `INSERT INTO users (email, name, password_hash, language_preference, theme, timezone, created_at, updated_at) 
       VALUES (?, ?, ?, 'zh-CN', 'light', 'Asia/Shanghai', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(email, name || null, hashedPassword).run();

    if (!result.success) {
      return ApiErrors.dbError('创建用户');
    }

    // 获取自动生成的用户 ID
    const userId = result.meta.last_row_id;

    // 返回成功响应
    return NextResponse.json({ 
      success: true,
      message: '注册成功，请登录', 
      data: { 
        user: { 
          id: userId, 
          email, 
          name: name || null 
        } 
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // 处理AppError
    if (error instanceof AppError) {
      return Response.json(error.toJSON(), { status: error.statusCode });
    }
    
    // 数据库约束错误（如唯一性约束）
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return ApiErrors.conflict('该邮箱已注册');
    }
    
    // 未知错误
    return ApiErrors.internal('注册过程中发生未知错误，请稍后重试');
  }
}