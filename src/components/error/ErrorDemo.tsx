'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { 
  ErrorMessage, 
  RetryInterface, 
  FallbackForm, 
  ApiKeyModal, 
  HelpTooltip, 
  UserGuidance 
} from './index';
import { 
  AlertCircle, 
  RefreshCw, 
  Key, 
  FileText, 
  HelpCircle,
  BookOpen
} from 'lucide-react';

export function ErrorDemo() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showFallbackForm, setShowFallbackForm] = useState(false);
  const [apiKeyValidating, setApiKeyValidating] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fallbackSubmitting, setFallbackSubmitting] = useState(false);

  const handleApiKeySubmit = (apiKey: string) => {
    setApiKeyValidating(true);
    setApiKeyError('');
    
    // Simulate API key validation
    setTimeout(() => {
      if (apiKey === 'invalid-key') {
        setApiKeyError('API Key ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่');
        setApiKeyValidating(false);
      } else {
        setApiKeyValidating(false);
        setShowApiKeyModal(false);
        alert('API Key ถูกต้อง! ระบบจะใช้ API Key ของคุณในการดำเนินการต่อ');
      }
    }, 2000);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Simulate retry process
    setTimeout(() => {
      setIsRetrying(false);
      if (retryCount >= 2) {
        alert('ลองใหม่สำเร็จ!');
        setRetryCount(0);
      }
    }, 2000);
  };

  const handleFallbackSubmit = (data: any) => {
    setFallbackSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setFallbackSubmitting(false);
      setShowFallbackForm(false);
      alert('สร้างเอกสารจากเนื้อหาที่ใส่สำเร็จ!');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ระบบจัดการข้อผิดพลาดและช่วยเหลือผู้ใช้
        </h1>
        <p className="text-gray-600">
          ตัวอย่างการใช้งานคอมโพเนนต์สำหรับจัดการข้อผิดพลาดและให้ความช่วยเหลือผู้ใช้
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Error Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>ข้อความแสดงข้อผิดพลาด</span>
                <HelpTooltip
                  content="คอมโพเนนต์สำหรับแสดงข้อความข้อผิดพลาดในระดับความรุนแรงต่างๆ"
                  title="Error Messages"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ErrorMessage
                title="ข้อผิดพลาดร้ายแรง"
                message="ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
                severity="error"
                dismissible
                onDismiss={() => console.log('Error dismissed')}
              />
              
              <ErrorMessage
                title="คำเตือน"
                message="API Key ใกล้หมดอายุแล้ว กรุณาเตรียม API Key ใหม่"
                severity="warning"
              />
              
              <ErrorMessage
                message="ระบบกำลังประมวลผลข้อมูล กรุณารอสักครู่"
                severity="info"
              />
            </CardContent>
          </Card>

          {/* Retry Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <span>อินเทอร์เฟซลองใหม่</span>
                <HelpTooltip
                  content="ให้ผู้ใช้สามารถลองใหม่เมื่อเกิดข้อผิดพลาด พร้อมตัวเลือกการตั้งค่า"
                  title="Retry Interface"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RetryInterface
                error="การดึงข้อมูลจาก URL ล้มเหลว: เซิร์ฟเวอร์ไม่ตอบสนอง (HTTP 500)"
                title="ไม่สามารถดึงข้อมูลได้"
                onRetry={handleRetry}
                onCancel={() => console.log('Cancelled')}
                onSettings={() => console.log('Open settings')}
                isRetrying={isRetrying}
                retryCount={retryCount}
                maxRetries={3}
                showSettings={true}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>ทดสอบฟีเจอร์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowApiKeyModal(true)}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <Key className="h-4 w-4" />
                <span>เปิด API Key Modal</span>
              </Button>
              
              <Button
                onClick={() => setShowFallbackForm(true)}
                className="w-full flex items-center justify-center space-x-2"
                variant="outline"
              >
                <FileText className="h-4 w-4" />
                <span>เปิดฟอร์มใส่เนื้อหาด้วยตนเอง</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Help Tooltips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-green-500" />
                <span>Help Tooltips</span>
                <HelpTooltip
                  content="คอมโพเนนต์สำหรับแสดงความช่วยเหลือแบบ tooltip ที่สามารถใช้ได้ทั้งแบบ hover และ click"
                  title="Help Tooltips"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span>URL ผลิตภัณฑ์</span>
                <HelpTooltip
                  content="ใส่ URL ของหน้าเว็บผลิตภัณฑ์ที่ต้องการสร้างเอกสาร เช่น หน้าผลิตภัณฑ์ในเว็บไซต์ e-commerce"
                  title="เกี่ยวกับ URL ผลิตภัณฑ์"
                  trigger="hover"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span>ประเภทเอกสาร</span>
                <HelpTooltip
                  content={
                    <div className="space-y-2">
                      <p><strong>คู่มือผู้ใช้:</strong> เน้นวิธีการใช้งาน การติดตั้ง และการแก้ไขปัญหา</p>
                      <p><strong>เอกสารผลิตภัณฑ์:</strong> เน้นคุณสมบัติ ข้อมูลทางเทคนิค และรายละเอียดผลิตภัณฑ์</p>
                    </div>
                  }
                  title="ประเภทเอกสาร"
                  trigger="click"
                  size="lg"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span>การจัดรูปแบบ MFEC</span>
                <HelpTooltip
                  content="ระบบจะจัดรูปแบบเอกสารตามมาตรฐาน MFEC รวมถึงการใช้โลโก้ สี และรูปแบบที่เหมาะสม"
                  title="มาตรฐาน MFEC"
                  position="left"
                />
              </div>
            </CardContent>
          </Card>

          {/* User Guidance */}
          <UserGuidance currentStep="input" />
        </div>
      </div>

      {/* Fallback Form Modal */}
      {showFallbackForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <FallbackForm
                onSubmit={handleFallbackSubmit}
                onCancel={() => setShowFallbackForm(false)}
                isSubmitting={fallbackSubmitting}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSubmit={handleApiKeySubmit}
        isValidating={apiKeyValidating}
        validationError={apiKeyError}
      />
    </div>
  );
}