'use client';

import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { OnboardingTour, useOnboarding, createAppTourSteps } from '@/components/onboarding/OnboardingTour';
import { FloatingActionButton } from '@/components/ui/AnimatedButton';
import { Plus, HelpCircle, ArrowUp } from 'lucide-react';
import { useOptimizedScroll } from '@/hooks/usePerformanceOptimization';
import { animations } from '@/utils/animations';

interface EnhancedMainLayoutProps {
  children: React.ReactNode;
  showOnboarding?: boolean;
  showFloatingActions?: boolean;
}

export function EnhancedMainLayout({ 
  children, 
  showOnboarding = true,
  showFloatingActions = true 
}: EnhancedMainLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const {
    showTour,
    startTour,
    completeTour,
    closeTour,
    hasSeenTour
  } = useOnboarding();

  // Handle scroll to top visibility
  useOptimizedScroll((scrollY) => {
    setShowScrollTop(scrollY > 300);
  });

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNewDocument = () => {
    const generateSection = document.querySelector('#generate');
    if (generateSection) {
      generateSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#generate';
    }
  };

  const tourSteps = createAppTourSteps();

  return (
    <ToastProvider>
      <div className={`min-h-screen flex flex-col bg-gray-50 ${animations.transition} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header with enhanced animations */}
        <div className={`${animations.slideInFromTop} ${animations.delay75}`}>
          <Header />
        </div>

        {/* Main Content */}
        <main className={`flex-1 ${animations.fadeIn} ${animations.delay150}`}>
          {children}
        </main>

        {/* Footer */}
        <div className={`${animations.slideInFromBottom} ${animations.delay200}`}>
          <Footer />
        </div>

        {/* Floating Action Buttons */}
        {showFloatingActions && (
          <>
            {/* Scroll to Top */}
            {showScrollTop && (
              <FloatingActionButton
                onClick={scrollToTop}
                icon={<ArrowUp className="h-6 w-6" />}
                label="กลับไปด้านบน"
                position="bottom-right"
                size="md"
              />
            )}

            {/* New Document */}
            <FloatingActionButton
              onClick={handleNewDocument}
              icon={<Plus className="h-6 w-6" />}
              label="สร้างเอกสารใหม่"
              position="bottom-left"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            />

            {/* Help/Tour */}
            {hasSeenTour && (
              <FloatingActionButton
                onClick={startTour}
                icon={<HelpCircle className="h-5 w-5" />}
                label="แนะนำการใช้งาน"
                position="bottom-right"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 mb-20"
              />
            )}
          </>
        )}

        {/* Onboarding Tour */}
        {showOnboarding && (
          <OnboardingTour
            steps={tourSteps}
            isOpen={showTour}
            onClose={closeTour}
            onComplete={completeTour}
            autoStart={!hasSeenTour}
          />
        )}

        {/* Loading Overlay for Initial Load */}
        {!isLoaded && (
          <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full ${animations.spin} mx-auto mb-4`} />
              <p className="text-gray-600 font-medium">กำลังโหลด Thai Document Generator...</p>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

// Performance-optimized wrapper for heavy components
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

export function LazyComponentWrapper({ 
  children, 
  fallback,
  threshold = 0.1 
}: LazyComponentWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div ref={setRef} className={`${animations.transition}`}>
      {isVisible ? (
        <div className={animations.fadeIn}>
          {children}
        </div>
      ) : (
        fallback || (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">กำลังโหลด...</div>
          </div>
        )
      )}
    </div>
  );
}

// Staggered animation container for lists
interface StaggeredContainerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredContainer({ 
  children, 
  staggerDelay = 100,
  className = '' 
}: StaggeredContainerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={animations.fadeIn}
          style={{
            animationDelay: `${index * staggerDelay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}