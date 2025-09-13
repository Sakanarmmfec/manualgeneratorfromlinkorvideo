'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Download, 
  FileText, 
  File, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';

export interface DownloadProgressProps {
  progress: number; // 0-100
  format: 'pdf' | 'docx';
  filename: string;
  status?: 'preparing' | 'processing' | 'generating' | 'finalizing' | 'complete' | 'error';
  estimatedTimeRemaining?: number; // in seconds
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

const PROGRESS_STAGES = [
  { key: 'preparing', label: 'เตรียมข้อมูล', minProgress: 0 },
  { key: 'processing', label: 'ประมวลผลเนื้อหา', minProgress: 20 },
  { key: 'generating', label: 'สร้างเอกสาร', minProgress: 60 },
  { key: 'finalizing', label: 'จัดรูปแบบขั้นสุดท้าย', minProgress: 85 },
  { key: 'complete', label: 'เสร็จสิ้น', minProgress: 100 }
] as const;

export function DownloadProgress({
  progress,
  format,
  filename,
  status = 'processing',
  estimatedTimeRemaining,
  error,
  onCancel,
  onRetry
}: DownloadProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const currentStage = PROGRESS_STAGES.find(stage => 
    progress >= stage.minProgress && 
    (PROGRESS_STAGES.indexOf(stage) === PROGRESS_STAGES.length - 1 || 
     progress < PROGRESS_STAGES[PROGRESS_STAGES.indexOf(stage) + 1]?.minProgress)
  ) || PROGRESS_STAGES[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}วินาที`;
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (status === 'complete') return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  };

  const getFormatIcon = () => {
    return format === 'pdf' ? 
      <FileText className="h-6 w-6 text-red-500" /> : 
      <File className="h-6 w-6 text-blue-500" />;
  };

  return (
    <Card className={clsx(
      'border-2 transition-colors',
      error ? 'border-red-200 bg-red-50' : 
      status === 'complete' ? 'border-green-200 bg-green-50' : 
      'border-blue-200 bg-blue-50'
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFormatIcon()}
              <div>
                <h3 className="font-medium text-gray-900">
                  กำลังดาวน์โหลด {format.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600 font-mono">{filename}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {error ? 'เกิดข้อผิดพลาด' : 
                 status === 'complete' ? 'เสร็จสิ้น' : 
                 `${Math.round(progress)}%`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {!error && status !== 'complete' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{currentStage.label}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Stage Indicators */}
          {!error && (
            <div className="flex justify-between">
              {PROGRESS_STAGES.slice(0, -1).map((stage, index) => (
                <div key={stage.key} className="flex flex-col items-center">
                  <div className={clsx(
                    'w-3 h-3 rounded-full border-2 transition-colors',
                    progress >= stage.minProgress ? 
                      'bg-blue-500 border-blue-500' : 
                      'bg-white border-gray-300'
                  )} />
                  <span className={clsx(
                    'text-xs mt-1 text-center max-w-16',
                    progress >= stage.minProgress ? 'text-blue-600' : 'text-gray-400'
                  )}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Time Information */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>เวลาที่ใช้: {formatTime(elapsedTime)}</span>
            </div>
            {estimatedTimeRemaining && estimatedTimeRemaining > 0 && !error && status !== 'complete' && (
              <span>เหลืออีก: {formatTime(estimatedTimeRemaining)}</span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">เกิดข้อผิดพลาดในการดาวน์โหลด</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(error || (onCancel && status !== 'complete')) && (
            <div className="flex gap-2 pt-2">
              {error && onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  ลองใหม่
                </button>
              )}
              {onCancel && status !== 'complete' && !error && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {status === 'complete' && !error && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">ดาวน์โหลดเสร็จสิ้น</p>
                  <p className="text-sm text-green-700">ไฟล์ถูกบันทึกเรียบร้อยแล้ว</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}