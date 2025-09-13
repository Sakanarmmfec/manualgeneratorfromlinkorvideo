'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  className = ''
}) => {
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
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
    default: 'bg-gray-500 text-white'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${typeStyles[type]} ${className}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-4 text-lg font-bold opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Toast Context
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType; duration: number }>>([]);

  const showToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const useSuccessToast = () => {
  const { showToast } = useToast();
  return (message: string, duration?: number) => showToast(message, 'success', duration);
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return (message: string, duration?: number) => showToast(message, 'error', duration);
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return (message: string, duration?: number) => showToast(message, 'warning', duration);
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return (message: string, duration?: number) => showToast(message, 'info', duration);
};