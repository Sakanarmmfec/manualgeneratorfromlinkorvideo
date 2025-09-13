'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  trigger?: 'hover' | 'click';
  className?: string;
  iconClassName?: string;
}

export function HelpTooltip({
  content,
  title,
  position = 'top',
  size = 'md',
  trigger = 'hover',
  className,
  iconClassName
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: 'max-w-xs text-xs',
    md: 'max-w-sm text-sm',
    lg: 'max-w-md text-sm'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  // Check if tooltip fits in viewport and adjust position if needed
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = tooltip.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if tooltip goes outside viewport and adjust
      if (position === 'top' && rect.top < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && rect.bottom > viewport.height) {
        newPosition = 'top';
      } else if (position === 'left' && rect.left < 0) {
        newPosition = 'right';
      } else if (position === 'right' && rect.right > viewport.width) {
        newPosition = 'left';
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    if (trigger === 'click') {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, trigger]);

  // Close on outside click for click trigger
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        trigger === 'click' &&
        isVisible &&
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (trigger === 'click') {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isVisible, trigger]);

  return (
    <div className={clsx('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={clsx(
          'text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded-full',
          iconClassName
        )}
        aria-label="ความช่วยเหลือ"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={clsx(
            'absolute z-50 bg-gray-900 text-white rounded-lg shadow-lg p-3',
            sizeClasses[size],
            positionClasses[actualPosition]
          )}
          role="tooltip"
        >
          {/* Close button for click trigger */}
          {trigger === 'click' && (
            <button
              onClick={handleClose}
              className="absolute top-1 right-1 text-gray-300 hover:text-white transition-colors"
              aria-label="ปิด"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Title */}
          {title && (
            <div className="font-medium mb-1 pr-6">
              {title}
            </div>
          )}

          {/* Content */}
          <div className={title ? '' : 'pr-6'}>
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              content
            )}
          </div>

          {/* Arrow */}
          <div
            className={clsx(
              'absolute w-0 h-0 border-4',
              arrowClasses[actualPosition]
            )}
          />
        </div>
      )}
    </div>
  );
}