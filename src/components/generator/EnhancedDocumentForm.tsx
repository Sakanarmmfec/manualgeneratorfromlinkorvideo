'use client';

import React, { useState, useCallback } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { LoadingSpinner, Skeleton } from '@/components/ui/LoadingSpinner';
import { useSuccessToast, useErrorToast, useWarningToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/usePerformanceOptimization';
import { animations } from '@/utils/animations';
import { 
  Link, 
  FileText, 
  Youtube, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Clock,
  Image as ImageIcon
} from 'lucide-react';

interface DocumentGenerationFormData {
  url: string;
  documentType: 'user-manual' | 'product-document';
  includeImages: boolean;
  captureScreenshots: boolean;
  customInstructions: string;
}

type InputType = 'unknown' | 'website' | 'youtube';

export function EnhancedDocumentForm() {
  const [formData, setFormData] = useState<DocumentGenerationFormData>({
    url: '',
    documentType: 'user-manual',
    includeImages: true,
    captureScreenshots: true,
    customInstructions: ''
  });

  const [inputType, setInputType] = useState<InputType>('unknown');
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const warningToast = useWarningToast();

  // Debounced URL validation
  const debouncedUrl = useDebounce(formData.url, 500);

  // Detect input type and validate URL
  const validateUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setInputType('unknown');
      setValidationResult(null);
      return;
    }

    setIsValidating(true);

    try {
      // Simulate URL validation
      await new Promise(resolve => setTimeout(resolve, 800));

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        setInputType('youtube');
        setValidationResult({
          isValid: true,
          message: 'ตรวจพบวิดีโอ YouTube - ระบบจะสกัดเนื้อหาและภาพหน้าจอ'
        });
      } else if (url.startsWith('http')) {
        setInputType('website');
        setValidationResult({
          isValid: true,
          message: 'ตรวจพบเว็บไซต์ - ระบบจะสกัดเนื้อหาและรูปภาพ'
        });
      } else {
        setInputType('unknown');
        setValidationResult({
          isValid: false,
          message: 'URL ไม่ถูกต้อง กรุณาใส่ลิงก์ที่ขึ้นต้นด้วย http:// หรือ https://'
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'ไม่สามารถตรวจสอบ URL ได้ กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate URL when it changes
  React.useEffect(() => {
    validateUrl(debouncedUrl);
  }, [debouncedUrl, validateUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationResult?.isValid) {
      errorToast('URL ไม่ถูกต้อง', 'กรุณาใส่ URL ที่ถูกต้องก่อนดำเนินการ');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      successToast(
        'เริ่มสร้างเอกสารแล้ว',
        'ระบบกำลังประมวลผลเนื้อหาและสร้างเอกสารให้คุณ'
      );

      // Reset form or redirect to progress page
      // window.location.href = '/generate/progress';
      
    } catch (error) {
      errorToast(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถเริ่มสร้างเอกสารได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputIcon = () => {
    switch (inputType) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'website':
        return <Globe className="h-5 w-5 text-blue-500" />;
      default:
        return <Link className="h-5 w-5 text-gray-400" />;
    }
  };

  const getEstimatedTime = () => {
    switch (inputType) {
      case 'youtube':
        return '5-10 นาที';
      case 'website':
        return '3-7 นาที';
      default:
        return '-';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className={`text-center mb-8 ${animations.fadeIn}`}>
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <Sparkles className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          สร้างเอกสารภาษาไทยอัตโนมัติ
        </h1>
        <p className="text-lg text-gray-600">
          ใส่ลิงก์ผลิตภัณฑ์หรือวิดีโอ YouTube เพื่อสร้างคู่มือและเอกสารคุณภาพสูง
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input Section */}
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${animations.slideInFromLeft}`}>
          <div className="flex items-center space-x-2 mb-4">
            {getInputIcon()}
            <h2 className="text-lg font-semibold text-gray-900">
              ลิงก์ต้นฉบับ
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                id="url-input"
                label="URL ผลิตภัณฑ์หรือวิดีโอ YouTube"
                placeholder="https://example.com/product หรือ https://youtube.com/watch?v=..."
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="pr-12"
              />
              
              {/* Validation Status */}
              <div className="absolute right-3 top-9 flex items-center">
                {isValidating ? (
                  <LoadingSpinner size="sm" variant="secondary" />
                ) : validationResult?.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : validationResult && !validationResult.isValid ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
            </div>

            {/* Validation Message */}
            {validationResult && (
              <div className={`
                p-3 rounded-lg text-sm ${animations.fadeIn}
                ${validationResult.isValid 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
                }
              `}>
                {validationResult.message}
              </div>
            )}

            {/* Input Type Info */}
            {inputType !== 'unknown' && (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${animations.slideInFromBottom}`}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">ประเภท</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {inputType === 'youtube' ? 'วิดีโอ YouTube' : 'เว็บไซต์'}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">เวลาประมาณ</span>
                  </div>
                  <p className="text-sm text-gray-600">{getEstimatedTime()}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">รูปภาพ</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {inputType === 'youtube' ? 'ภาพหน้าจอ' : 'รูปผลิตภัณฑ์'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Type Selection */}
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${animations.slideInFromRight} ${animations.delay100}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ประเภทเอกสาร
          </h2>

          <Select
            id="document-type-select"
            label="เลือกประเภทเอกสารที่ต้องการสร้าง"
            value={formData.documentType}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              documentType: e.target.value as 'user-manual' | 'product-document' 
            }))}
            options={[
              { value: 'user-manual', label: 'คู่มือผู้ใช้ (User Manual)' },
              { value: 'product-document', label: 'เอกสารผลิตภัณฑ์ (Product Document)' }
            ]}
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              formData.documentType === 'user-manual' 
                ? 'border-primary-200 bg-primary-50' 
                : 'border-gray-200 bg-gray-50'
            } ${animations.transition}`}>
              <h3 className="font-medium text-gray-900 mb-2">คู่มือผู้ใช้</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• วิธีการติดตั้งและใช้งาน</li>
                <li>• คำแนะนำทีละขั้นตอน</li>
                <li>• การแก้ไขปัญหาเบื้องต้น</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              formData.documentType === 'product-document' 
                ? 'border-primary-200 bg-primary-50' 
                : 'border-gray-200 bg-gray-50'
            } ${animations.transition}`}>
              <h3 className="font-medium text-gray-900 mb-2">เอกสารผลิตภัณฑ์</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ข้อมูลจำเพาะทางเทคนิค</li>
                <li>• คุณสมบัติและฟีเจอร์</li>
                <li>• รายละเอียดผลิตภัณฑ์</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${animations.slideInFromLeft} ${animations.delay200}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ตัวเลือกเพิ่มเติม
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">รวมรูปภาพ</h3>
                <p className="text-sm text-gray-600">
                  สกัดและรวมรูปภาพจากแหล่งที่มา
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.includeImages}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  includeImages: e.target.checked 
                }))}
                className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>

            {inputType === 'youtube' && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">จับภาพหน้าจอ</h3>
                  <p className="text-sm text-gray-600">
                    จับภาพหน้าจอสำคัญจากวิดีโอ
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.captureScreenshots}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    captureScreenshots: e.target.checked 
                  }))}
                  className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำแนะนำเพิ่มเติม (ไม่บังคับ)
              </label>
              <textarea
                value={formData.customInstructions}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  customInstructions: e.target.value 
                }))}
                placeholder="ระบุคำแนะนำเพิ่มเติมสำหรับการสร้างเอกสาร เช่น โฟกัสที่ฟีเจอร์เฉพาะ หรือกลุ่มผู้ใช้เป้าหมาย"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className={`text-center ${animations.fadeIn} ${animations.delay300}`}>
          <AnimatedButton
            type="submit"
            size="lg"
            loading={isSubmitting}
            disabled={!validationResult?.isValid || isValidating}
            loadingText="กำลังเริ่มสร้างเอกสาร..."
            className="px-8 py-3 text-lg"
            animateOnClick={true}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>สร้างเอกสาร</span>
            </div>
          </AnimatedButton>

          <p className="text-sm text-gray-500 mt-3">
            การสร้างเอกสารจะใช้เวลาประมาณ {getEstimatedTime()}
          </p>
        </div>
      </form>
    </div>
  );
}