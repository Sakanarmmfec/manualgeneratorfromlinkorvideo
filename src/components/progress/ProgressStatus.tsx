'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Clock, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface ProgressStatusData {
  currentStep: string;
  currentStepTitle: string;
  currentStepDescription: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  estimatedTimeRemaining?: number; // in seconds
  totalEstimatedTime?: number; // in seconds
  elapsedTime: number; // in seconds
  completedSteps: number;
  totalSteps: number;
  processingSpeed?: number; // steps per minute
  lastUpdate: Date;
}

interface ProgressStatusProps {
  data: ProgressStatusData;
  className?: string;
}

export function ProgressStatus({ data, className }: ProgressStatusProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} วินาที`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes} นาที ${remainingSeconds} วินาที`;
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'processing':
        return <Zap className="h-5 w-5 text-primary-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (data.status) {
      case 'processing':
        return 'กำลังดำเนินการ...';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'failed':
        return 'เกิดข้อผิดพลาด';
      case 'cancelled':
        return 'ยกเลิกแล้ว';
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'processing':
        return 'text-primary-700 bg-primary-50 border-primary-200';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const progressPercentage = (data.completedSteps / data.totalSteps) * 100;

  return (
    <div className={clsx('bg-white rounded-lg border shadow-sm p-6', className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getStatusText()}
            </h3>
            <p className="text-sm text-gray-600">
              {data.currentStepTitle}
            </p>
          </div>
        </div>
        
        {/* Live Status Indicator */}
        <div className={clsx(
          'px-3 py-1 rounded-full text-xs font-medium border',
          getStatusColor()
        )}>
          {data.status === 'processing' && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              <span>ทำงานอยู่</span>
            </div>
          )}
          {data.status !== 'processing' && getStatusText()}
        </div>
      </div>

      {/* Current Step Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          {data.currentStepDescription}
        </p>
      </div>

      {/* Progress Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Time Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">เวลา</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              ใช้เวลาไปแล้ว: <span className="font-medium">{formatTime(data.elapsedTime)}</span>
            </div>
            {data.estimatedTimeRemaining !== undefined && data.status === 'processing' && (
              <div className="text-xs text-gray-600">
                เหลืออีก: <span className="font-medium text-primary-600">{formatTime(data.estimatedTimeRemaining)}</span>
              </div>
            )}
            {data.totalEstimatedTime && (
              <div className="text-xs text-gray-600">
                รวมทั้งหมด: <span className="font-medium">{formatTime(data.totalEstimatedTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">ความคืบหน้า</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              ขั้นตอน: <span className="font-medium">{data.completedSteps}/{data.totalSteps}</span>
            </div>
            <div className="text-xs text-gray-600">
              เปอร์เซ็นต์: <span className="font-medium text-primary-600">{Math.round(progressPercentage)}%</span>
            </div>
            {data.processingSpeed && (
              <div className="text-xs text-gray-600">
                ความเร็ว: <span className="font-medium">{data.processingSpeed.toFixed(1)} ขั้นตอน/นาที</span>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">สถานะระบบ</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              อัปเดตล่าสุด: <span className="font-medium">{data.lastUpdate.toLocaleTimeString('th-TH')}</span>
            </div>
            <div className="text-xs text-gray-600">
              ขั้นตอนปัจจุบัน: <span className="font-medium">{data.currentStep}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Progress Bar */}
      {data.status === 'processing' && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">ความคืบหน้าโดยรวม</span>
            <span className="text-xs font-medium text-primary-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Message for Non-Processing States */}
      {data.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            ✅ การสร้างเอกสารเสร็จสิ้นแล้ว ใช้เวลาทั้งหมด {formatTime(data.elapsedTime)}
          </p>
        </div>
      )}

      {data.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            ❌ เกิดข้อผิดพลาดในการสร้างเอกสาร กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      )}

      {data.status === 'cancelled' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            ⚠️ การสร้างเอกสารถูกยกเลิก คุณสามารถเริ่มใหม่ได้ตลอดเวลา
          </p>
        </div>
      )}
    </div>
  );
}