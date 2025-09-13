'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Checkbox, Textarea, Button } from '@/components/ui';
import { ProgressTracker } from '@/components/progress';
import { Globe, Youtube, FileText, Settings, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface DocumentGenerationFormData {
  url: string;
  documentType: 'user_manual' | 'product_document' | '';
  includeImages: boolean;
  captureScreenshots: boolean;
  customInstructions: string;
}

interface ValidationErrors {
  url?: string;
  documentType?: string;
}

type InputType = 'unknown' | 'website' | 'youtube';

export function DocumentGenerationForm() {
  const [formData, setFormData] = useState<DocumentGenerationFormData>({
    url: '',
    documentType: '',
    includeImages: true,
    captureScreenshots: true,
    customInstructions: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [inputType, setInputType] = useState<InputType>('unknown');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // URL validation and type detection
  const validateUrl = (url: string): { isValid: boolean; type: InputType; error?: string } => {
    if (!url.trim()) {
      return { isValid: false, type: 'unknown', error: 'กรุณาใส่ URL' };
    }

    try {
      const urlObj = new URL(url);
      
      // Check for YouTube URLs
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return { isValid: true, type: 'youtube' };
      }
      
      // Check for valid website URLs
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return { isValid: true, type: 'website' };
      }
      
      return { isValid: false, type: 'unknown', error: 'URL ไม่ถูกต้อง กรุณาใช้ http:// หรือ https://' };
    } catch {
      return { isValid: false, type: 'unknown', error: 'รูปแบบ URL ไม่ถูกต้อง' };
    }
  };

  // Real-time URL validation
  useEffect(() => {
    if (formData.url) {
      setIsValidating(true);
      const timeoutId = setTimeout(() => {
        const validation = validateUrl(formData.url);
        setInputType(validation.type);
        setErrors(prev => ({
          ...prev,
          url: validation.error
        }));
        setIsValidating(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setInputType('unknown');
      setErrors(prev => ({ ...prev, url: undefined }));
      setIsValidating(false);
    }
  }, [formData.url]);

  // Form validation
  useEffect(() => {
    const urlValidation = validateUrl(formData.url);
    const hasValidUrl = urlValidation.isValid;
    const hasDocumentType = formData.documentType !== '';
    
    setIsValid(hasValidUrl && hasDocumentType);
  }, [formData.url, formData.documentType]);

  const handleInputChange = (field: keyof DocumentGenerationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear related errors
    if (field === 'url') {
      setErrors(prev => ({ ...prev, url: undefined }));
    }
    if (field === 'documentType') {
      setErrors(prev => ({ ...prev, documentType: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: ValidationErrors = {};
    const urlValidation = validateUrl(formData.url);
    
    if (!urlValidation.isValid) {
      newErrors.url = urlValidation.error || 'URL ไม่ถูกต้อง';
    }
    
    if (!formData.documentType) {
      newErrors.documentType = 'กรุณาเลือกประเภทเอกสาร';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Start document generation
    setIsGenerating(true);
    setShowProgress(true);
    console.log('Form submitted:', formData);
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setShowProgress(false);
  };

  const handleRetry = () => {
    setIsGenerating(true);
    // Progress tracker will handle the retry logic
  };

  const handlePreview = () => {
    console.log('Preview document');
    // TODO: Implement preview functionality
  };

  const handleDownload = () => {
    console.log('Download document');
    // TODO: Implement download functionality
  };

  const handleStartNew = () => {
    setIsGenerating(false);
    setShowProgress(false);
    setFormData({
      url: '',
      documentType: '',
      includeImages: true,
      captureScreenshots: true,
      customInstructions: ''
    });
    setErrors({});
    setInputType('unknown');
  };

  const handleBackToForm = () => {
    setShowProgress(false);
  };

  const getInputIcon = () => {
    if (isValidating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />;
    }
    
    switch (inputType) {
      case 'youtube':
        return <Youtube className="text-red-500" />;
      case 'website':
        return <Globe className="text-green-500" />;
      default:
        return <Globe className="text-gray-400" />;
    }
  };

  const getInputTypeLabel = () => {
    switch (inputType) {
      case 'youtube':
        return 'วิดีโอ YouTube';
      case 'website':
        return 'เว็บไซต์';
      default:
        return 'ไม่ทราบประเภท';
    }
  };

  const documentTypeOptions = [
    { value: 'user_manual', label: 'คู่มือผู้ใช้ (User Manual)' },
    { value: 'product_document', label: 'เอกสารผลิตภัณฑ์ (Product Document)' }
  ];

  // Show progress tracker when generation is in progress
  if (showProgress) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back to Form Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToForm}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            กลับไปแก้ไขฟอร์ม
          </Button>
          
          <div className="text-sm text-gray-600">
            กำลังสร้างเอกสาร: {formData.documentType === 'user_manual' ? 'คู่มือผู้ใช้' : 'เอกสารผลิตภัณฑ์'}
          </div>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker
          isVisible={showProgress}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onStartNew={handleStartNew}
        />

        {/* Source Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {inputType === 'youtube' ? (
                <Youtube className="h-5 w-5 text-red-500" />
              ) : (
                <Globe className="h-5 w-5 text-green-500" />
              )}
              <span>ข้อมูลแหล่งที่มา</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">URL: </span>
                <span className="text-sm text-gray-600 break-all">{formData.url}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">ประเภทเอกสาร: </span>
                <span className="text-sm text-gray-600">
                  {formData.documentType === 'user_manual' ? 'คู่มือผู้ใช้' : 'เอกสารผลิตภัณฑ์'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">ตัวเลือก: </span>
                <span className="text-sm text-gray-600">
                  {inputType === 'youtube' && formData.captureScreenshots && 'จับภาพหน้าจอ, '}
                  {inputType === 'website' && formData.includeImages && 'รวมรูปภาพ, '}
                  {formData.customInstructions && 'มีคำแนะนำเพิ่มเติม'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <span>สร้างเอกสารใหม่</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div>
              <Input
                label="URL ผลิตภัณฑ์หรือวิดีโอ YouTube"
                placeholder="https://example.com/product หรือ https://youtube.com/watch?v=..."
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                error={errors.url}
                icon={getInputIcon()}
                helperText={inputType !== 'unknown' ? `ประเภท: ${getInputTypeLabel()}` : 'ใส่ URL ของผลิตภัณฑ์หรือวิดีโอ YouTube'}
              />
            </div>

            {/* Document Type Selection */}
            <div>
              <Select
                label="ประเภทเอกสาร"
                placeholder="เลือกประเภทเอกสารที่ต้องการสร้าง"
                options={documentTypeOptions}
                value={formData.documentType}
                onChange={(e) => handleInputChange('documentType', e.target.value)}
                error={errors.documentType}
                helperText="เลือกรูปแบบเอกสารที่เหมาะสมกับเนื้อหาของคุณ"
              />
            </div>

            {/* Input Type Specific Options */}
            {inputType === 'youtube' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-800">ตัวเลือกสำหรับวิดีโอ YouTube</span>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  ระบบจะวิเคราะห์วิดีโอและสกัดข้อมูลสำคัญเพื่อสร้างเอกสาร
                </p>
                <Checkbox
                  label="จับภาพหน้าจอจากวิดีโอ"
                  description="สร้างภาพประกอบจากช่วงเวลาสำคัญในวิดีโอ"
                  checked={formData.captureScreenshots}
                  onChange={(e) => handleInputChange('captureScreenshots', e.target.checked)}
                />
              </div>
            )}

            {inputType === 'website' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-800">ตัวเลือกสำหรับเว็บไซต์</span>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  ระบบจะสกัดเนื้อหาและรูปภาพจากเว็บไซต์ผลิตภัณฑ์
                </p>
                <Checkbox
                  label="รวมรูปภาพจากเว็บไซต์"
                  description="ดาวน์โหลดและรวมรูปภาพผลิตภัณฑ์ในเอกสาร"
                  checked={formData.includeImages}
                  onChange={(e) => handleInputChange('includeImages', e.target.checked)}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isValid}
                className="min-w-[200px]"
              >
                {isValid ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>เริ่มสร้างเอกสาร</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>กรอกข้อมูลให้ครบถ้วน</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary-600" />
            <span>ตัวเลือกขั้นสูง</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              label="คำแนะนำเพิ่มเติม (ไม่บังคับ)"
              placeholder="ระบุคำแนะนำเพิ่มเติมสำหรับการสร้างเอกสาร เช่น จุดเน้นพิเศษ หรือรายละเอียดที่ต้องการเน้น..."
              value={formData.customInstructions}
              onChange={(e) => handleInputChange('customInstructions', e.target.value)}
              rows={4}
              helperText="คำแนะนำเหล่านี้จะช่วยให้ AI สร้างเอกสารที่ตรงกับความต้องการของคุณมากขึ้น"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}