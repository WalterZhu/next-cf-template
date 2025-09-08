'use client';

import { useState, useEffect } from 'react';

export interface NotificationProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function ErrorNotification({ 
  message, 
  type, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-md
        ${typeStyles[type]}
        animate-in slide-in-from-right-full duration-300
      `}>
        <span className="text-xl">{iconStyles[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-lg hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}