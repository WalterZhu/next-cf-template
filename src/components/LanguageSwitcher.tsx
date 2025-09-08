'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Language } from '@/types/language';
import { supportedLanguages } from '@/types/language';
import { useNotification } from './NotificationProvider';

interface LanguageSwitcherProps {
  currentLanguage: Language;
}

export default function LanguageSwitcher({ currentLanguage }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showError, showSuccess } = useNotification();

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === currentLanguage) return;

    try {
      // 调用 API 更新语言偏好
      const response = await fetch('/api/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: newLanguage }),
      });

      if (response.ok) {
        const successData = await response.json().catch(() => ({})) as { message?: string };
        showSuccess(successData.message || '语言设置已更新');
        startTransition(() => {
          router.refresh();
        });
      } else {
        const errorData = await response.json().catch(() => ({})) as { 
          error?: { message: string } | string 
        };
        
        // 处理标准化错误格式或旧格式
        const errorMessage = typeof errorData.error === 'object' 
          ? errorData.error.message 
          : errorData.error || '更新语言设置失败，请重试';
        
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      showError('网络错误，请检查连接后重试');
    }
  };

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        disabled={isPending}
        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}