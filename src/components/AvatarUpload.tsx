'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (url: string | null) => void;
}

export default function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as { error?: string; avatarUrl?: string };

      if (!response.ok) {
        throw new Error(result.error || '上传失败');
      }

      onAvatarChange?.(result.avatarUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 头像预览 */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {currentAvatar ? (
            <img 
              src={currentAvatar} 
              alt="头像" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-2xl">
              {session.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        
        {/* 上传状态覆盖层 */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="text-white text-sm">上传中...</div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div>
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {currentAvatar ? '更换头像' : '上传头像'}
        </button>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 错误信息 */}
      {error && (
        <div className="text-red-500 text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-gray-500 text-xs text-center max-w-xs">
        支持 JPG、PNG、WebP、GIF 格式，最大 2MB
      </div>
    </div>
  );
}