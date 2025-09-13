'use client';

import React from 'react';
import { clsx } from 'clsx';
import { X, RotateCcw, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export interface ProgressControlsProps {
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  canCancel?: boolean;
  canRetry?: boolean;
  canPreview?: boolean;
  canDownload?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onStartNew?: () => void;
  className?: string;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
}

export function ProgressControls({
  status,
  canCancel = true,
  canRetry = true,
  canPreview = false,
  canDownload = false,
  onCancel,
  onRetry,
  onPreview,
  onDownload,
  onStartNew,
  className,
  error,
  retryCount = 0,
  maxRetries = 3
}: ProgressControlsProps) {
  const renderProcessingControls = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
          <span>กำลังดำเนินการ...</span>
        </div>
      </div>
      
      {canCancel && onCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-1" />
          ยกเลิก
        </Button>
      )}
    </div>
  );

  const renderCompletedControls = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-green-700">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">สร้างเอกสารเสร็จสิ้น</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {canPreview && onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4 mr-1" />
            ดูตัวอย่าง
          </Button>
        )}
        
        {canDownload && onDownload && (
          <Button
            variant="primary"
            size="sm"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            ดาวน์โหลด
          </Button>
        )}
        
        {onStartNew && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartNew}
          >
            สร้างเอกสารใหม่
          </Button>
        )}
      </div>
    </div>
  );

  const renderFailedControls = () => (
    <div className="space-y-3">
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-red-700">เกิดข้อผิดพลาด</p>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ลองใหม่แล้ว {retryCount} ครั้ง
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {canRetry && onRetry && retryCount < maxRetries && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            ลองใหม่ ({maxRetries - retryCount} ครั้งเหลือ)
          </Button>
        )}
        
        {retryCount >= maxRetries && (
          <div className="text-sm text-red-600">
            ลองใหม่ครบจำนวนแล้ว กรุณาตรวจสอบข้อมูลและเริ่มใหม่
          </div>
        )}
        
        {onStartNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStartNew}
          >
            เริ่มใหม่
          </Button>
        )}
      </div>
    </div>
  );

  const renderCancelledControls = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-yellow-700">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">การสร้างเอกสารถูกยกเลิก</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {canRetry && onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            เริ่มใหม่
          </Button>
        )}
        
        {onStartNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStartNew}
          >
            สร้างเอกสารใหม่
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={clsx(
      'bg-white rounded-lg border shadow-sm p-4',
      className
    )}>
      {status === 'processing' && renderProcessingControls()}
      {status === 'completed' && renderCompletedControls()}
      {status === 'failed' && renderFailedControls()}
      {status === 'cancelled' && renderCancelledControls()}
    </div>
  );
}