import { getCloudflareContext } from "@opennextjs/cloudflare";
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

/**
 * 上传头像到R2存储
 * @param file 文件内容
 * @param userId 用户ID
 * @param originalName 原始文件名
 * @returns 上传结果
 */
export async function uploadAvatar(
  file: ArrayBuffer,
  userId: number,
  originalName: string
): Promise<UploadResult> {
  try {
    const { env } = getCloudflareContext();
    
    // 获取文件扩展名
    const ext = originalName.split('.').pop()?.toLowerCase();
    if (!ext || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return { success: false, error: '不支持的文件格式' };
    }
    
    // 生成唯一的文件名
    const fileName = `avatar/${nanoid()}.${ext}`;
    
    // 上传到R2
    await env.R2_BUCKET.put(fileName, file, {
      httpMetadata: {
        contentType: getContentType(ext),
      },
      customMetadata: {
        userId: userId.toString(),
        originalName,
        uploadDate: new Date().toISOString(),
      },
    });
    
    // 构造访问URL - 从环境变量获取域名
    const r2Domain = process.env.R2_PUBLIC_DOMAIN || 'dev-r2.wildcloud.app';
    const url = `https://${r2Domain}/${fileName}`;
    
    return {
      success: true,
      key: fileName,
      url,
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败' 
    };
  }
}


/**
 * 根据文件扩展名获取Content-Type
 */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * 验证文件大小（最大2MB）
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 2 * 1024 * 1024; // 2MB
  return file.size <= maxSize;
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  return allowedTypes.includes(file.type);
}