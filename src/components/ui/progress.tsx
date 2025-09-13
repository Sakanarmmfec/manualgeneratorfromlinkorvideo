import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const variantStyles = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500'
};

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  className,
  size = 'md',
  variant = 'default',
  showValue = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeStyles[size]
      )}>
        <div
          className={clsx(
            'transition-all duration-300 ease-out rounded-full',
            sizeStyles[size],
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{Math.round(percentage)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  );
};