import React from 'react';
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight
  };
}

// Image lazy loading with intersection observer
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      options
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
  }, []);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isError,
    handleLoad,
    handleError
  };
}

// Memoized component wrapper
export function useMemoizedComponent<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  props: T,
  deps: React.DependencyList
) {
  return useMemo(() => React.createElement(Component, props), deps);
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>();
  const [metrics, setMetrics] = useState<{
    renderTime?: number;
    memoryUsage?: number;
  }>({});

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      setMetrics({
        renderTime,
        memoryUsage
      });

      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          memoryUsage: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
        });
      }
    }
  });

  return metrics;
}

// Batch updates for better performance
export function useBatchedUpdates<T>() {
  const [updates, setUpdates] = useState<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addUpdate = useCallback((update: T) => {
    setUpdates(prev => [...prev, update]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setUpdates([]);
    }, 16); // Batch updates for one frame
  }, []);

  const processBatch = useCallback((processor: (updates: T[]) => void) => {
    if (updates.length > 0) {
      processor(updates);
      setUpdates([]);
    }
  }, [updates]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { updates, addUpdate, processBatch };
}

// Optimized scroll handler
export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  throttleMs = 16
) {
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    lastScrollY.current = window.scrollY;
    
    if (!ticking.current) {
      requestAnimationFrame(() => {
        callback(lastScrollY.current);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [callback]);

  const throttledScroll = useThrottle(handleScroll, throttleMs);

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);
}

// Memory-efficient large data handling
export function useChunkedData<T>(
  data: T[],
  chunkSize = 100
) {
  const [currentChunk, setCurrentChunk] = useState(0);
  
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      result.push(data.slice(i, i + chunkSize));
    }
    return result;
  }, [data, chunkSize]);

  const visibleData = useMemo(() => {
    return chunks.slice(0, currentChunk + 1).flat();
  }, [chunks, currentChunk]);

  const loadMore = useCallback(() => {
    if (currentChunk < chunks.length - 1) {
      setCurrentChunk(prev => prev + 1);
    }
  }, [currentChunk, chunks.length]);

  const hasMore = currentChunk < chunks.length - 1;

  return {
    visibleData,
    loadMore,
    hasMore,
    totalChunks: chunks.length,
    currentChunk
  };
}