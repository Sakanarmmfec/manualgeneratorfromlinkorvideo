'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Textarea, Button } from '@/components/ui';
import { ErrorMessage } from './ErrorMessage';
import { FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface FallbackFormData {
  title: string;
  description: string;
  content: string;
  documentType: 'user_manual' | 'product_document' | '';
  language: 'thai' | 'english';
}

interface FallbackFormProps {
  onSubmit: (data: FallbackFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<FallbackFormData>;
  error?: string;
  className?: string;
}

export function FallbackForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData = {},
  error,
  className
}: FallbackFormProps) {
  const [formData, setFormData] = useState<FallbackFormData>({
    title: '',
    description: '',
    content: '',
    documentType: '',
    language: 'thai',
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<FallbackFormData>>({});

  const handleInputChange = (field: keyof FallbackFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FallbackFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'กรุณาใส่ชื่อเอกสาร';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'กรุณาใส่คำอธิบายเอกสาร';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'กรุณาใส่เนื้อหาเอกสาร';
    } else if (formData.content.trim().length < 50) {
      newErrors.content = 'เนื้อหาต้องมีอย่างน้อย 50 ตัวอักษร';
    }

    if (!formData.documentType) {
      newErrors.documentType = 'กรุณาเลือกประเภทเอกสาร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleInputChange('content', content);
      };
      reader.readAsText(file);
    }
  };

  const documentTypeOptions = [
    { value: 'user_manual', label: 'คู่มือผู้ใช้ (User Manual)' },
    { value: 'product_document', label: 'เอกสารผลิตภัณฑ์ (Product Document)' }
  ];

  const languageOptions = [
    { value: 'thai', label: 'ภาษาไทย' },
    { value: 'english', label: 'English' }
  ];

  const isValid = formData.title.trim() && 
                  formData.description.trim() && 
                  formData.content.trim().length >= 50 && 
                  formData.documentType;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary-600" />
          <span>ใส่เนื้อหาด้วยตนเอง</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <ErrorMessage
            message={error}
            severity="error"
            className="mb-6"
          />
        )}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">การใส่เนื้อหาด้วยตนเอง</p>
              <p>
                เมื่อระบบไม่สามารถดึงข้อมูลจาก URL ได้ คุณสามารถใส่เนื้อหาด้วยตนเองเพื่อสร้างเอกสารตามมาตรฐาน MFEC
                ระบบจะจัดรูปแบบและแปลเนื้อหาให้อัตโนมัติ
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Title */}
          <Input
            label="ชื่อเอกสาร"
            placeholder="เช่น คู่มือการใช้งานผลิตภัณฑ์ ABC"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            helperText="ชื่อเอกสารที่จะแสดงในหน้าปก"
          />

          {/* Document Description */}
          <Textarea
            label="คำอธิบายเอกสาร"
            placeholder="อธิบายเกี่ยวกับผลิตภัณฑ์หรือเนื้อหาของเอกสารโดยย่อ"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            rows={3}
            helperText="คำอธิบายสั้นๆ เกี่ยวกับเอกสารนี้"
          />

          {/* Document Type and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="ประเภทเอกสาร"
              placeholder="เลือกประเภทเอกสาร"
              options={documentTypeOptions}
              value={formData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              error={errors.documentType}
            />

            <Select
              label="ภาษาของเนื้อหาที่ใส่"
              options={languageOptions}
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              helperText="ระบบจะแปลเป็นภาษาไทยหากจำเป็น"
            />
          </div>

          {/* Content Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                เนื้อหาเอกสาร
              </label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                  <Upload className="h-4 w-4" />
                  <span>อัปโหลดไฟล์ .txt</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <Textarea
              placeholder="ใส่เนื้อหาของเอกสารที่ต้องการสร้าง เช่น คุณสมบัติของผลิตภัณฑ์ วิธีการใช้งาน ข้อมูลทางเทคนิค ฯลฯ"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              error={errors.content}
              rows={12}
              helperText={`${formData.content.length} ตัวอักษร (ต้องการอย่างน้อย 50 ตัวอักษร)`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
            )}
            
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>กำลังสร้าง...</span>
                </div>
              ) : isValid ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>สร้างเอกสาร</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>กรอกข้อมูลให้ครบ</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}