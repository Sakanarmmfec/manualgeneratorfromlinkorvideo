/**
 * Animation utilities for smooth transitions and micro-interactions
 */

export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-200',
  
  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2 duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left-2 duration-300',
  slideInFromRight: 'animate-in slide-in-from-right-2 duration-300',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
  
  // Bounce for success states
  bounceIn: 'animate-bounce',
  
  // Pulse for loading states
  pulse: 'animate-pulse',
  
  // Spin for loading
  spin: 'animate-spin',
  
  // Smooth transitions
  transition: 'transition-all duration-200 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
} as const;

export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Custom animation classes for Tailwind
export const customAnimations = {
  'slide-up': {
    '0%': { transform: 'translateY(10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'slide-down': {
    '0%': { transform: 'translateY(-10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'scale-in': {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  'shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
} as const;

// Animation delay utilities
export const delays = {
  delay0: 'delay-0',
  delay75: 'delay-75',
  delay100: 'delay-100',
  delay150: 'delay-150',
  delay200: 'delay-200',
  delay300: 'delay-300',
  delay500: 'delay-500',
  delay700: 'delay-700',
  delay1000: 'delay-1000',
} as const;

// Stagger animation helper
export const staggerChildren = (index: number, baseDelay = 50) => ({
  animationDelay: `${index * baseDelay}ms`,
});

// Spring animation presets
export const springs = {
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
} as const;