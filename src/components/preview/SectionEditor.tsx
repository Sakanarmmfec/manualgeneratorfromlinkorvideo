'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentSection } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { 
  Save, 
  X, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface SectionEditorProps {
  section: DocumentSection;
  onUpdate: (updatedSection: DocumentSection) => void;
  onCancel: () => void;
  onSave: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

export function SectionEditor({ section, onUpdate, onCancel, onSave }: SectionEditorProps) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Validation function
  const validateSection = useCallback((): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    if (!title.trim()) {
      newErrors.push({ field: 'title', message: 'หัวข้อส่วนไม่สามารถเว้นว่างได้' });
    }

    if (!content.trim()) {
      newErrors.push({ field: 'content', message: 'เนื้อหาส่วนไม่สามารถเว้นว่างได้' });
    }

    if (title.length > 200) {
      newErrors.push({ field: 'title', message: 'หัวข้อส่วนต้องมีความยาวไม่เกิน 200 ตัวอักษร' });
    }

    if (content.length > 10000) {
      newErrors.push({ field: 'content', message: 'เนื้อหาส่วนต้องมีความยาวไม่เกิน 10,000 ตัวอักษร' });
    }

    return newErrors;
  }, [title, content]);

  // Real-time validation
  useEffect(() => {
    const newErrors = validateSection();
    setErrors(newErrors);
  }, [validateSection]);

  // Rich text formatting functions
  const insertFormatting = useCallback((before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  }, [content]);

  const formatBold = () => insertFormatting('**', '**');
  const formatItalic = () => insertFormatting('*', '*');
  const formatBulletList = () => insertFormatting('\n- ', '');
  const formatNumberedList = () => insertFormatting('\n1. ', '');
  const formatHeading = () => insertFormatting('### ', '');

  const handleSave = useCallback(() => {
    const validationErrors = validateSection();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedSection: DocumentSection = {
      ...section,
      title: title.trim(),
      content: content.trim()
    };

    onUpdate(updatedSection);
    onSave();
  }, [section, title, content, validateSection, onUpdate, onSave]);

  const handleCancel = useCallback(() => {
    setTitle(section.title);
    setContent(section.content);
    setErrors([]);
    onCancel();
  }, [section, onCancel]);

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  return (
    <Card className="p-6 border-2 border-primary-200 bg-primary-50/30">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          แก้ไขส่วน: {section.sectionType}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? 'แก้ไข' : 'ดูตัวอย่าง'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            ยกเลิก
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave}
            disabled={errors.length > 0}
          >
            <Save className="h-4 w-4 mr-1" />
            บันทึก
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-2">กรุณาแก้ไขข้อผิดพลาดต่อไปนี้:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {isPreviewMode ? (
        /* Preview Mode */
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
          </div>
          <div 
            className="prose prose-lg max-w-none mfec-text bg-white p-4 rounded-md border"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
          />
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-4">
          {/* Title Editor */}
          <div>
            <Input
              label="หัวข้อส่วน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={getFieldError('title')}
              placeholder="ใส่หัวข้อส่วน..."
              className="text-lg font-semibold"
            />
          </div>

          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-md border">
            <Button
              variant="ghost"
              size="sm"
              onClick={formatBold}
              title="ตัวหนา"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={formatItalic}
              title="ตัวเอียง"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={formatHeading}
              title="หัวข้อย่อย"
            >
              <Type className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={formatBulletList}
              title="รายการแบบจุด"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={formatNumberedList}
              title="รายการแบบตัวเลข"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Content Editor */}
          <div>
            <Textarea
              ref={contentRef}
              label="เนื้อหาส่วน"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              error={getFieldError('content')}
              placeholder="ใส่เนื้อหาส่วน... (รองรับ Markdown)"
              rows={12}
              className="font-mono text-sm"
              helperText="รองรับการจัดรูปแบบ Markdown: **ตัวหนา**, *ตัวเอียง*, ### หัวข้อ, - รายการ"
            />
          </div>

          {/* Content Statistics */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>ตัวอักษร: {content.length}/10,000</span>
            <span>คำ: {content.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
        </div>
      )}
    </Card>
  );
}