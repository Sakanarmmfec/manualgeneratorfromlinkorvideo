'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Key, CheckCircle, AlertTriangle, XCircle, RefreshCw, Trash2 } from 'lucide-react';

interface ApiKeyStatusProps {
  status: 'active' | 'exhausted' | 'invalid' | 'testing';
  currentKeyType: 'primary' | 'fallback';
  hasFallback: boolean;
  canUseFallback: boolean;
  onTestKey?: () => void;
  onClearFallback?: () => void;
  onSwitchToPrimary?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ApiKeyStatus({
  status,
  currentKeyType,
  hasFallback,
  canUseFallback,
  onTestKey,
  onClearFallback,
  onSwitchToPrimary,
  isLoading = false,
  className = ''
}: ApiKeyStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'exhausted':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Key className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'ใช้งานได้';
      case 'exhausted':
        return 'Token หมดอายุ';
      case 'invalid':
        return 'ไม่ถูกต้อง';
      case 'testing':
        return 'กำลังตรวจสอบ...';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'exhausted':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'invalid':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'testing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getKeyTypeText = () => {
    return currentKeyType === 'primary' ? 'API Key หลัก' : 'API Key ผู้ใช้';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">สถานะ API Key</h3>
        </div>
        
        {onTestKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTestKey}
            disabled={isLoading || status === 'testing'}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>ทดสอบ</span>
          </Button>
        )}
      </div>

      {/* Status Display */}
      <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div>
              <p className="font-medium">{getKeyTypeText()}</p>
              <p className="text-sm">{getStatusText()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Management Actions */}
      {(hasFallback || currentKeyType === 'fallback') && (
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-600">
            <p className="font-medium">การจัดการ API Key:</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {currentKeyType === 'fallback' && onSwitchToPrimary && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToPrimary}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <Key className="h-4 w-4" />
                <span>กลับไปใช้ Key หลัก</span>
              </Button>
            )}
            
            {hasFallback && onClearFallback && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFallback}
                disabled={isLoading}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>ลบ API Key ผู้ใช้</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Fallback Information */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p><strong>สถานะ Fallback:</strong> {hasFallback ? 'มี API Key สำรอง' : 'ไม่มี API Key สำรอง'}</p>
        <p><strong>อนุญาต User Key:</strong> {canUseFallback ? 'ได้' : 'ไม่ได้'}</p>
        {currentKeyType === 'fallback' && (
          <p className="text-yellow-600"><strong>หมายเหตุ:</strong> กำลังใช้ API Key ของผู้ใช้</p>
        )}
      </div>
    </div>
  );
}