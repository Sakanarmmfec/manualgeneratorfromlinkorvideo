'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { ErrorMessage } from './ErrorMessage';
import { RefreshCw, ArrowLeft, Settings } from 'lucide-react';

interface RetryInterfaceProps {
  error: string;
  title?: string;
  onRetry: () => void;
  onCancel?: () => void;
  onSettings?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  showSettings?: boolean;
  className?: string;
}

export function RetryInterface({
  error,
  title = 'เกิดข้อผิดพลาด',
  onRetry,
  onCancel,
  onSettings,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  showSettings = false,
  className
}: RetryInterfaceProps) {
  const canRetry = retryCount < maxRetries;

  return (
    <ErrorMessage
      title={title}
      message={error}
      severity="error"
      className={className}
    >
      <div className="mt-4 space-y-3">
        {/* Retry Information */}
        {retryCount > 0 && (
          <div className="text-sm text-red-600">
            ความพยายามครั้งที่ {retryCount} จาก {maxRetries} ครั้ง
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {canRetry && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}</span>
            </Button>
          )}

          {showSettings && onSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>ตั้งค่า</span>
            </Button>
          )}

          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ยกเลิก</span>
            </Button>
          )}
        </div>

        {/* Max Retries Reached */}
        {!canRetry && (
          <div className="text-sm text-red-600 bg-red-100 rounded-md p-3">
            <p className="font-medium">ไม่สามารถดำเนินการได้</p>
            <p>ได้ลองใหม่ครบ {maxRetries} ครั้งแล้ว กรุณาตรวจสอบการตั้งค่าหรือลองใหม่ในภายหลัง</p>
          </div>
        )}
      </div>
    </ErrorMessage>
  );
}