'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization';
import { Monitor, Zap, Clock, MemoryStick } from 'lucide-react';

interface PerformanceMonitorProps {
  componentName: string;
  showInDevelopment?: boolean;
  threshold?: {
    renderTime?: number; // ms
    memoryUsage?: number; // MB
  };
}

export function PerformanceMonitor({ 
  componentName, 
  showInDevelopment = true,
  threshold = { renderTime: 100, memoryUsage: 50 }
}: PerformanceMonitorProps) {
  const metrics = usePerformanceMonitor(componentName);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (metrics.renderTime && threshold.renderTime) {
      if (metrics.renderTime > threshold.renderTime) {
        setShowWarning(true);
        console.warn(`[Performance Warning] ${componentName} render time: ${metrics.renderTime.toFixed(2)}ms`);
      }
    }
  }, [metrics.renderTime, threshold.renderTime, componentName]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !showInDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs font-mono max-w-xs">
      <div className="flex items-center space-x-2 mb-2">
        <Monitor className="h-4 w-4" />
        <span className="font-semibold">{componentName}</span>
      </div>
      
      <div className="space-y-1">
        {metrics.renderTime && (
          <div className={`flex items-center justify-between ${
            metrics.renderTime > (threshold.renderTime || 100) ? 'text-red-400' : 'text-green-400'
          }`}>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Render:</span>
            </div>
            <span>{metrics.renderTime.toFixed(2)}ms</span>
          </div>
        )}
        
        {metrics.memoryUsage && (
          <div className={`flex items-center justify-between ${
            (metrics.memoryUsage / 1024 / 1024) > (threshold.memoryUsage || 50) ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            <div className="flex items-center space-x-1">
              <MemoryStick className="h-3 w-3" />
              <span>Memory:</span>
            </div>
            <span>{(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</span>
          </div>
        )}
      </div>

      {showWarning && (
        <div className="mt-2 p-2 bg-red-900/50 rounded text-red-200 text-xs">
          <Zap className="h-3 w-3 inline mr-1" />
          Performance threshold exceeded
        </div>
      )}
    </div>
  );
}

// Global performance tracker
export function GlobalPerformanceTracker() {
  const [metrics, setMetrics] = useState<{
    fps: number;
    memoryUsage: number;
    loadTime: number;
  }>({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  useEffect(() => {
    // Track FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const trackFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(trackFPS);
    };
    
    requestAnimationFrame(trackFPS);

    // Track memory usage
    const trackMemory = () => {
      if ((performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory.usedJSHeapSize / 1024 / 1024
        }));
      }
    };

    const memoryInterval = setInterval(trackMemory, 5000);

    // Track load time
    window.addEventListener('load', () => {
      setMetrics(prev => ({
        ...prev,
        loadTime: performance.now()
      }));
    });

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs font-mono">
      <div className="flex items-center space-x-2 mb-2">
        <Monitor className="h-4 w-4" />
        <span className="font-semibold">Performance</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span>FPS:</span>
          <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Memory:</span>
          <span className={metrics.memoryUsage > 100 ? 'text-yellow-400' : 'text-blue-400'}>
            {metrics.memoryUsage.toFixed(1)}MB
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Load:</span>
          <span className={metrics.loadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
            {(metrics.loadTime / 1000).toFixed(2)}s
          </span>
        </div>
      </div>
    </div>
  );
}