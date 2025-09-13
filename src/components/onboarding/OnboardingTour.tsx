'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { animations } from '@/utils/animations';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  autoStart?: boolean;
}

export function OnboardingTour({ 
  steps, 
  isOpen, 
  onClose, 
  onComplete,
  autoStart = false 
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoStart) {
        setCurrentStep(0);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoStart]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
      
      {/* Tour Content */}
      <div className={`fixed z-50 ${animations.fadeIn}`}>
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">แนะนำการใช้งาน</h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>ขั้นตอนที่ {currentStep + 1} จาก {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {step.content}
            </p>

            {/* Action Button */}
            {step.action && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={step.action.onClick}
                  className="w-full"
                >
                  {step.action.text}
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ก่อนหน้า</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500"
              >
                ข้าม
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex items-center space-x-1"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>เสร็จสิ้น</span>
                  </>
                ) : (
                  <>
                    <span>ถัดไป</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Predefined tour steps for the application
export const createAppTourSteps = (): TourStep[] => [
  {
    id: 'welcome',
    title: 'ยินดีต้อนรับสู่ Thai Document Generator',
    content: 'ระบบสร้างเอกสารภาษาไทยอัตโนมัติของ MFEC ที่จะช่วยให้คุณสร้างคู่มือและเอกสารผลิตภัณฑ์ได้อย่างรวดเร็ว',
  },
  {
    id: 'input-url',
    title: 'เริ่มต้นด้วยการใส่ URL',
    content: 'ใส่ลิงก์ผลิตภัณฑ์หรือ URL วิดีโอ YouTube ที่คุณต้องการสร้างเอกสาร ระบบจะวิเคราะห์เนื้อหาและสร้างเอกสารให้อัตโนมัติ',
    target: '#url-input',
  },
  {
    id: 'document-type',
    title: 'เลือกประเภทเอกสาร',
    content: 'เลือกว่าต้องการสร้างคู่มือผู้ใช้ (User Manual) หรือเอกสารผลิตภัณฑ์ (Product Document) ระบบจะจัดรูปแบบให้เหมาะสม',
    target: '#document-type-select',
  },
  {
    id: 'api-key',
    title: 'การจัดการ API Key',
    content: 'หาก API Key หลักหมดอายุ คุณสามารถเพิ่ม API Key ของตัวเองได้ที่การตั้งค่า เพื่อใช้งานต่อไปได้',
    target: '#api-key-settings',
    action: {
      text: 'ดูการตั้งค่า API Key',
      onClick: () => window.location.href = '/settings/api-key'
    }
  },
  {
    id: 'progress-tracking',
    title: 'ติดตามความคืบหน้า',
    content: 'ระบบจะแสดงความคืบหน้าการสร้างเอกสารแบบเรียลไทม์ คุณสามารถยกเลิกหรือลองใหม่ได้ตลอดเวลา',
  },
  {
    id: 'preview-edit',
    title: 'แสดงตัวอย่างและแก้ไข',
    content: 'เมื่อเอกสารสร้างเสร็จ คุณสามารถดูตัวอย่าง แก้ไขเนื้อหา และปรับปรุงก่อนดาวน์โหลด',
  },
  {
    id: 'keyboard-shortcuts',
    title: 'คีย์บอร์ดลัด',
    content: 'ใช้ Ctrl+N สร้างเอกสารใหม่, Ctrl+S บันทึก, Ctrl+P แสดงตัวอย่าง, และ ? เพื่อดูคีย์บอร์ดลัดทั้งหมด',
  },
  {
    id: 'complete',
    title: 'พร้อมใช้งาน!',
    content: 'ตอนนี้คุณพร้อมที่จะสร้างเอกสารภาษาไทยคุณภาพสูงแล้ว เริ่มต้นด้วยการใส่ URL ผลิตภัณฑ์หรือวิดีโอที่ต้องการ',
  }
];

// Hook for managing onboarding state
export function useOnboarding() {
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('thai-doc-gen-tour-completed');
    setHasSeenTour(!!seen);
    
    // Auto-show tour for new users
    if (!seen) {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => setShowTour(true);
  
  const completeTour = () => {
    localStorage.setItem('thai-doc-gen-tour-completed', 'true');
    setHasSeenTour(true);
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem('thai-doc-gen-tour-completed');
    setHasSeenTour(false);
  };

  return {
    hasSeenTour,
    showTour,
    startTour,
    completeTour,
    resetTour,
    closeTour: () => setShowTour(false)
  };
}