'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ErrorNotification, { NotificationProps } from './ErrorNotification';

interface Notification extends Omit<NotificationProps, 'onClose'> {
  id: string;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // 自动移除通知
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showError = (message: string) => {
    showNotification({ type: 'error', message });
  };

  const showSuccess = (message: string) => {
    showNotification({ type: 'success', message });
  };

  const showWarning = (message: string) => {
    showNotification({ type: 'warning', message });
  };

  const showInfo = (message: string) => {
    showNotification({ type: 'info', message });
  };

  const contextValue: NotificationContextType = {
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* 渲染所有通知 */}
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="fixed z-50"
          style={{
            top: `${1 + index * 4.5}rem`,
            right: '1rem',
          }}
        >
          <ErrorNotification
            message={notification.message}
            type={notification.type}
            duration={0} // 由 Provider 控制自动消失
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </NotificationContext.Provider>
  );
}