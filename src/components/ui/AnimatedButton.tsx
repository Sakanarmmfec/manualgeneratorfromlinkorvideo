'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { animations } from '@/utils/animations';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  animateOnClick?: boolean;
}

export function AnimatedButton({
  children,
  loading = false,
  success = false,
  error = false,
  loadingText,
  successText,
  errorText,
  animateOnClick = true,
  onClick,
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animateOnClick && !loading && !disabled) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    }
    onClick?.(e);
  };

  const getContent = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText || 'กำลังดำเนินการ...'}</span>
        </div>
      );
    }
    
    if (success && successText) {
      return successText;
    }
    
    if (error && errorText) {
      return errorText;
    }
    
    return children;
  };

  const getVariant = () => {
    if (success) return 'success';
    if (error) return 'danger';
    return props.variant || 'primary';
  };

  const getAnimationClasses = () => {
    const classes = [animations.transition];
    
    if (isClicked) {
      classes.push('transform scale-95');
    }
    
    if (loading) {
      classes.push(animations.pulse);
    }
    
    if (success) {
      classes.push(animations.bounceIn);
    }
    
    return classes.join(' ');
  };

  return (
    <Button
      {...props}
      variant={getVariant()}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${getAnimationClasses()} ${className}`}
    >
      {getContent()}
    </Button>
  );
}

// Floating Action Button with animations
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  className = ''
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${sizeClasses[size]}
          bg-primary-600 hover:bg-primary-700 text-white
          rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center
          ${animations.transition}
          transform hover:scale-110 active:scale-95
          ${className}
        `}
      >
        <div className={`${animations.transition} ${isHovered ? 'scale-110' : ''}`}>
          {icon}
        </div>
      </button>
      
      {label && isHovered && (
        <div className={`
          absolute ${position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'}
          top-1/2 transform -translate-y-1/2
          bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap
          ${animations.fadeIn}
        `}>
          {label}
        </div>
      )}
    </div>
  );
}

// Ripple effect button
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function RippleButton({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  ...props 
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);

    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'hover:bg-gray-100 text-gray-700'
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`
        relative overflow-hidden px-4 py-2 rounded-lg font-medium
        ${variantClasses[variant]}
        ${animations.transition}
        ${className}
      `}
    >
      {children}
      
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}
    </button>
  );
}