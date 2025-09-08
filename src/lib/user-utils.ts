import { headers } from 'next/headers';

/**
 * 从middleware设置的请求头中获取当前用户ID
 * @returns 用户ID（数字）或null（如果未认证）
 */
export async function getCurrentUserIdFromHeaders(): Promise<number | null> {
  try {
    const headersList = await headers();
    const userIdHeader = headersList.get('x-user-id');
    
    if (!userIdHeader) {
      return null;
    }
    
    const userId = parseInt(userIdHeader);
    return userId > 0 ? userId : null;
  } catch (error) {
    console.error('Error getting user ID from headers:', error);
    return null;
  }
}

/**
 * 获取当前用户ID，如果未认证则抛出错误
 * @returns 用户ID
 * @throws Error 如果用户未认证
 */
export async function requireUserIdFromHeaders(): Promise<number> {
  const userId = await getCurrentUserIdFromHeaders();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}