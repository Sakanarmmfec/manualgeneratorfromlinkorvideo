import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-50 border-gray-200 text-gray-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const iconMap = {
  default: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info
};

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'default', 
  className 
}) => {
  const Icon = iconMap[variant];
  
  return (
    <div
      className={clsx(
        'rounded-lg border p-4 flex items-start gap-3',
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return <div className="text-sm">{children}</div>;
};