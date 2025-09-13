'use client';

import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const severityConfig = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700'
  }
};

export function ErrorMessage({
  title,
  message,
  severity = 'error',
  dismissible = false,
  onDismiss,
  className,
  children
}: ErrorMessageProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={clsx(
      'rounded-lg border p-4',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', config.iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium', config.titleColor)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm', config.messageColor, title && 'mt-1')}>
            {message}
          </div>
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  severity === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-600',
                  severity === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                  severity === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                )}
              >
                <span className="sr-only">ปิด</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}