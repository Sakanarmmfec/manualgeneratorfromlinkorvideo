'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { animations } from '@/utils/animations';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-500',
    white: 'text-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} ${variantClasses[variant]} ${animations.spin}`} 
      />
      {text && (
        <span className={`${textSizeClasses[size]} ${variantClasses[variant]} font-medium`}>
          {text}
        </span>
      )}
    </div>
  );
}

// Skeleton loading component for better perceived performance
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = `bg-gray-200 ${animations.pulse} rounded`;
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              ...style
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Shimmer effect for loading states
export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}