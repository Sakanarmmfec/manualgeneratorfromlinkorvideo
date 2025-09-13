'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { ProgressBar, ProgressStep } from './ProgressBar';
import { ProgressStatus, ProgressStatusData } from './ProgressStatus';
import { ProgressControls } from './ProgressControls';

export interface ProgressTrackerProps {
  isVisible: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onStartNew?: () => void;
  className?: string;
}

// Default steps for document generation process
const DEFAULT_STEPS: ProgressStep[] = [
  {
    id: 'url_validation',
    title: 'ตรวจสอบ URL',
    description: 'กำลังตรวจสอบความถูกต้องของ URL และประเภทเนื้อหา',
    status: 'pending',
    estimatedDuration: 5
  },
  {
    id: 'content_extraction',
    title: 'สกัดเนื้อหา',
    description: 'กำลังดาวน์โหลดและสกัดเนื้อหาจากแหล่งที่มา',
    status: 'pending',
    estimatedDuration: 15
  },
  {
    id: 'image_processing',
    title: 'ประมวลผลรูปภาพ',
    description: 'กำลังดาวน์โหลดและปรับแต่งรูปภาพสำหรับเอกสาร',
    status: 'pending',
    estimatedDuration: 20
  },
  {
    id: 'ai_translation',
    title: 'แปลและจัดระเบียบเนื้อหา',
    description: 'กำลังใช้ AI แปลและจัดระเบียบเนื้อหาเป็นภาษาไทย',
    status: 'pending',
    estimatedDuration: 30
  },
  {
    id: 'document_formatting',
    title: 'จัดรูปแบบเอกสาร',
    description: 'กำลังจัดรูปแบบตามมาตรฐาน MFEC',
    status: 'pending',
    estimatedDuration: 15
  },
  {
    id: 'document_generation',
    title: 'สร้างเอกสารขั้นสุดท้าย',
    description: 'กำลังสร้างไฟล์เอกสารในรูปแบบที่เลือก',
    status: 'pending',
    estimatedDuration: 10
  }
];

export function ProgressTracker({
  isVisible,
  onCancel,
  onRetry,
  onPreview,
  onDownload,
  onStartNew,
  className
}: ProgressTrackerProps) {
  const [steps, setSteps] = useState<ProgressStep[]>(DEFAULT_STEPS);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed' | 'cancelled'>('processing');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Calculate progress data
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const currentStep = steps.find(step => step.id === currentStepId);
  const totalEstimatedTime = steps.reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);
  const completedTime = steps
    .filter(step => step.status === 'completed')
    .reduce((sum, step) => sum + (step.actualDuration || step.estimatedDuration || 0), 0);
  const remainingTime = totalEstimatedTime - completedTime;

  // Update elapsed time every second
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  // Simulate progress (this would be replaced with real progress updates)
  useEffect(() => {
    if (!isVisible || status !== 'processing') return;

    let currentIndex = 0;
    const processStep = () => {
      if (currentIndex >= steps.length) {
        setStatus('completed');
        return;
      }

      const step = steps[currentIndex];
      setCurrentStepId(step.id);

      // Mark current step as in progress
      setSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'in_progress' as const } : s
      ));

      // Simulate step completion
      setTimeout(() => {
        const actualDuration = step.estimatedDuration ? 
          step.estimatedDuration + (Math.random() - 0.5) * 10 : 
          Math.random() * 20 + 5;

        setSteps(prev => prev.map(s => 
          s.id === step.id ? { 
            ...s, 
            status: 'completed' as const, 
            actualDuration: Math.max(1, actualDuration)
          } : s
        ));

        currentIndex++;
        setTimeout(processStep, 1000); // Brief pause between steps
      }, (step.estimatedDuration || 10) * 100); // Simulate actual work (scaled down for demo)
    };

    // Start processing after a brief delay
    const timeout = setTimeout(processStep, 1000);
    return () => clearTimeout(timeout);
  }, [isVisible, status, steps.length]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setStatus('cancelled');
    setSteps(prev => prev.map(step => 
      step.status === 'in_progress' ? { ...step, status: 'pending' as const } : step
    ));
    onCancel?.();
  }, [onCancel]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setStatus('processing');
    setStartTime(new Date());
    setElapsedTime(0);
    setError('');
    setSteps(DEFAULT_STEPS);
    setCurrentStepId('');
    onRetry?.();
  }, [onRetry]);

  // Handle start new
  const handleStartNew = useCallback(() => {
    setRetryCount(0);
    setStatus('processing');
    setStartTime(new Date());
    setElapsedTime(0);
    setError('');
    setSteps(DEFAULT_STEPS);
    setCurrentStepId('');
    onStartNew?.();
  }, [onStartNew]);

  // Simulate random failures for demo
  useEffect(() => {
    if (status === 'processing' && Math.random() < 0.1) { // 10% chance of failure
      setTimeout(() => {
        if (status === 'processing') {
          setStatus('failed');
          setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
          setSteps(prev => prev.map(step => 
            step.status === 'in_progress' ? { ...step, status: 'failed' as const } : step
          ));
        }
      }, Math.random() * 10000 + 5000); // Random failure between 5-15 seconds
    }
  }, [status]);

  const progressStatusData: ProgressStatusData = {
    currentStep: currentStepId,
    currentStepTitle: currentStep?.title || '',
    currentStepDescription: currentStep?.description || '',
    status,
    estimatedTimeRemaining: status === 'processing' ? remainingTime : undefined,
    totalEstimatedTime,
    elapsedTime,
    completedSteps,
    totalSteps,
    processingSpeed: elapsedTime > 0 ? (completedSteps / elapsedTime) * 60 : undefined,
    lastUpdate: new Date()
  };

  if (!isVisible) return null;

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Progress Status */}
      <ProgressStatus data={progressStatusData} />

      {/* Detailed Progress Steps */}
      <ProgressBar 
        steps={steps} 
        currentStepId={currentStepId}
      />

      {/* Progress Controls */}
      <ProgressControls
        status={status}
        canCancel={status === 'processing'}
        canRetry={status === 'failed' || status === 'cancelled'}
        canPreview={status === 'completed'}
        canDownload={status === 'completed'}
        onCancel={handleCancel}
        onRetry={handleRetry}
        onPreview={onPreview}
        onDownload={onDownload}
        onStartNew={handleStartNew}
        error={error}
        retryCount={retryCount}
        maxRetries={3}
      />
    </div>
  );
}