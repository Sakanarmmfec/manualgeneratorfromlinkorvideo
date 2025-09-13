'use client';

import React, { useState } from 'react';
import { EnhancedMainLayout } from '@/components/layout/EnhancedMainLayout';
import { EnhancedDocumentForm } from '@/components/generator/EnhancedDocumentForm';
import { HelpDocumentation } from '@/components/help/HelpDocumentation';
import { 
  AnimatedButton, 
  FloatingActionButton, 
  RippleButton,
  LoadingSpinner,
  Skeleton,
  useSuccessToast,
  useErrorToast,
  useWarningToast,
  useInfoToast
} from '@/components/ui';
import { PerformanceMonitor, GlobalPerformanceTracker } from '@/components/ui/PerformanceMonitor';
import { Container } from '@/components/layout/Container';
import { animations } from '@/utils/animations';
import { 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Rocket,
  Play,
  Pause,
  Settings,
  Download
} from 'lucide-react';

export default function UIEnhancementsDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('animations');

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const warningToast = useWarningToast();
  const infoToast = useInfoToast();

  const handleAnimatedAction = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowSuccess(true);
    successToast('การดำเนินการสำเร็จ', 'ระบบได้ประมวลผลเสร็จเรียบร้อยแล้ว');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'animations', label: 'Animations & Transitions', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'buttons', label: 'Enhanced Buttons', icon: <Zap className="h-4 w-4" /> },
    { id: 'loading', label: 'Loading States', icon: <Play className="h-4 w-4" /> },
    { id: 'toasts', label: 'Toast Notifications', icon: <Star className="h-4 w-4" /> },
    { id: 'form', label: 'Enhanced Form', icon: <Settings className="h-4 w-4" /> },
    { id: 'help', label: 'Help Documentation', icon: <Heart className="h-4 w-4" /> }
  ];

  return (
    <EnhancedMainLayout showOnboarding={false}>
      <PerformanceMonitor componentName="UIEnhancementsDemo" />
      <GlobalPerformanceTracker />
      
      <Container className="py-8">
        {/* Header */}
        <div className={`text-center mb-12 ${animations.fadeIn}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full">
              <Rocket className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI Polish & UX Enhancements
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ระบบ Thai Document Generator ได้รับการปรับปรุงด้วยฟีเจอร์ UI/UX ที่ทันสมัย 
            รวมถึง animations, keyboard shortcuts, onboarding tour และ performance optimizations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`mb-8 ${animations.slideInFromTop}`}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    ${animations.transition}
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-screen">
          {/* Animations & Transitions */}
          {activeTab === 'animations' && (
            <div className={`space-y-8 ${animations.fadeIn}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Animation Examples</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className={`p-6 bg-blue-50 rounded-lg ${animations.slideInFromLeft}`}>
                    <h3 className="font-semibold text-blue-900 mb-2">Slide In Left</h3>
                    <p className="text-blue-700 text-sm">เอฟเฟกต์เลื่อนเข้าจากซ้าย</p>
                  </div>
                  
                  <div className={`p-6 bg-green-50 rounded-lg ${animations.slideInFromRight} ${animations.delay100}`}>
                    <h3 className="font-semibold text-green-900 mb-2">Slide In Right</h3>
                    <p className="text-green-700 text-sm">เอฟเฟกต์เลื่อนเข้าจากขวา</p>
                  </div>
                  
                  <div className={`p-6 bg-purple-50 rounded-lg ${animations.scaleIn} ${animations.delay200}`}>
                    <h3 className="font-semibold text-purple-900 mb-2">Scale In</h3>
                    <p className="text-purple-700 text-sm">เอฟเฟกต์ขยายเข้า</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Staggered Animation</h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item, index) => (
                      <div
                        key={item}
                        className={`p-4 bg-gray-100 rounded-lg ${animations.slideInFromLeft}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <p className="text-gray-700">รายการที่ {item} - แสดงผลแบบเป็นขั้นตอน</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Buttons */}
          {activeTab === 'buttons' && (
            <div className={`space-y-8 ${animations.fadeIn}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Button Components</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Animated Buttons</h3>
                    <div className="flex flex-wrap gap-4">
                      <AnimatedButton
                        loading={isLoading}
                        success={showSuccess}
                        onClick={handleAnimatedAction}
                        loadingText="กำลังประมวลผล..."
                        successText="สำเร็จ!"
                      >
                        ทดสอบ Animated Button
                      </AnimatedButton>
                      
                      <AnimatedButton variant="secondary" animateOnClick={true}>
                        Secondary Button
                      </AnimatedButton>
                      
                      <AnimatedButton variant="outline" animateOnClick={true}>
                        Outline Button
                      </AnimatedButton>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ripple Buttons</h3>
                    <div className="flex flex-wrap gap-4">
                      <RippleButton variant="primary">
                        Primary Ripple
                      </RippleButton>
                      
                      <RippleButton variant="secondary">
                        Secondary Ripple
                      </RippleButton>
                      
                      <RippleButton variant="ghost">
                        Ghost Ripple
                      </RippleButton>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Floating Action Buttons</h3>
                    <p className="text-gray-600 mb-4">
                      ดู Floating Action Buttons ที่มุมล่างขวาของหน้าจอ
                    </p>
                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <FloatingActionButton
                        onClick={() => infoToast('FAB Clicked', 'Floating Action Button ถูกคลิก')}
                        icon={<Download className="h-5 w-5" />}
                        label="ดาวน์โหลด"
                        position="bottom-right"
                        className="absolute"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading States */}
          {activeTab === 'loading' && (
            <div className={`space-y-8 ${animations.fadeIn}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading States & Skeletons</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading Spinners</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <LoadingSpinner size="sm" text="Small" />
                      </div>
                      <div className="text-center">
                        <LoadingSpinner size="md" text="Medium" />
                      </div>
                      <div className="text-center">
                        <LoadingSpinner size="lg" text="Large" />
                      </div>
                      <div className="text-center">
                        <LoadingSpinner size="xl" text="Extra Large" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skeleton Loading</h3>
                    <div className="space-y-4">
                      <Skeleton variant="text" lines={3} />
                      <div className="flex space-x-4">
                        <Skeleton variant="circular" width={60} height={60} />
                        <div className="flex-1">
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="80%" />
                        </div>
                      </div>
                      <Skeleton variant="rectangular" height={200} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notifications */}
          {activeTab === 'toasts' && (
            <div className={`space-y-8 ${animations.fadeIn}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Toast Notifications</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => successToast('สำเร็จ!', 'การดำเนินการเสร็จสิ้นแล้ว')}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="text-green-600 font-medium">Success Toast</div>
                  </button>
                  
                  <button
                    onClick={() => errorToast('เกิดข้อผิดพลาด', 'ไม่สามารถดำเนินการได้')}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="text-red-600 font-medium">Error Toast</div>
                  </button>
                  
                  <button
                    onClick={() => warningToast('คำเตือน', 'กรุณาตรวจสอบข้อมูล')}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="text-yellow-600 font-medium">Warning Toast</div>
                  </button>
                  
                  <button
                    onClick={() => infoToast('ข้อมูล', 'นี่คือข้อมูลเพิ่มเติม')}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-blue-600 font-medium">Info Toast</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Form */}
          {activeTab === 'form' && (
            <div className={`${animations.fadeIn}`}>
              <EnhancedDocumentForm />
            </div>
          )}

          {/* Help Documentation */}
          {activeTab === 'help' && (
            <div className={`${animations.fadeIn}`}>
              <HelpDocumentation />
            </div>
          )}
        </div>
      </Container>
    </EnhancedMainLayout>
  );
}