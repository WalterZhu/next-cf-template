import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { uploadAvatar, validateFileSize, validateFileType } from '@/lib/avatar';
import { requireUserIdFromHeaders } from '@/lib/user-utils';
import type { UserSettings } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    // 从middleware传递的请求头中获取用户ID
    const userId = await requireUserIdFromHeaders();
    const { env } = getCloudflareContext();

    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return Response.json({ error: '未找到文件' }, { status: 400 });
    }

    // 验证文件
    if (!validateFileType(file)) {
      return Response.json({ 
        error: '文件格式不支持，请上传 JPG、PNG、WebP 或 GIF 格式的图片' 
      }, { status: 400 });
    }

    if (!validateFileSize(file)) {
      return Response.json({ 
        error: '文件大小超过2MB限制' 
      }, { status: 400 });
    }


    // 上传新头像
    const fileBuffer = await file.arrayBuffer();
    const uploadResult = await uploadAvatar(fileBuffer, userId, file.name);

    if (!uploadResult.success) {
      return Response.json({ 
        error: uploadResult.error || '上传失败' 
      }, { status: 500 });
    }

    // 更新数据库
    await env.DEV_D1.prepare(`
      UPDATE users 
      SET avatar_url = ?, avatar_key = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(uploadResult.url, uploadResult.key, userId).run();

    // 更新KV中的用户设置
    try {
      const settingsKey = `settings:${userId}`;
      const existingSettings = await env.DEV_KV.get(settingsKey);
      
      if (existingSettings) {
        const settings: UserSettings = JSON.parse(existingSettings);
        settings.avatarUrl = uploadResult.url;
        await env.DEV_KV.put(settingsKey, JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Failed to update avatar in KV settings:', error);
    }


    return Response.json({
      success: true,
      avatarUrl: uploadResult.url
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return Response.json({ 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

