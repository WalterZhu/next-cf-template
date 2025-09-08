import { NextRequest, NextResponse } from "next/server";
import { requireUserIdFromHeaders } from "@/lib/user-utils";
import { updateUserSettings } from "@/lib/session";
import { ApiErrors, AppError } from "@/lib/errors";
import type { Language } from "@/types/language";

export async function POST(request: NextRequest) {
  try {
    // 从middleware传递的请求头中获取用户ID
    const userId = await requireUserIdFromHeaders();
    // 解析请求体
    let body: { language: string };
    try {
      body = await request.json() as { language: string };
    } catch {
      return ApiErrors.badRequest('请求格式错误，请发送有效的JSON数据');
    }
    
    const { language } = body;
    
    // 验证参数
    if (!language) {
      return ApiErrors.missingParams(['language']);
    }
    
    if (!['zh-CN', 'en'].includes(language)) {
      return ApiErrors.invalidParams('无效的语言选择，请选择中文或英文', {
        supportedLanguages: ['zh-CN', 'en']
      });
    }

    // 执行业务逻辑 - 直接更新用户设置
    await updateUserSettings(userId, { languagePreference: language as Language });
    
    return NextResponse.json({ 
      success: true, 
      message: '语言设置更新成功',
      data: { language }
    });
    
  } catch (error) {
    console.error('Language API error:', error);
    
    // 处理AppError
    if (error instanceof AppError) {
      return Response.json(error.toJSON(), { status: error.statusCode });
    }
    
    // 处理已知的业务逻辑错误
    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return ApiErrors.unauthorized('请先登录后再更改语言设置');
      }
    }
    
    // 未知错误
    return ApiErrors.internal('更新语言设置时发生未知错误');
  }
}