'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { ApiKeyStatus } from './ApiKeyStatus';
import { UserApiKeyInput } from './UserApiKeyInput';
import { ApiKeyInstructions } from './ApiKeyInstructions';
import { useApiKeyContext } from '@/contexts/ApiKeyContext';
import { 
  Settings, 
  Key, 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Trash2,
  Plus
} from 'lucide-react';

interface ApiKeySettingsProps {
  className?: string;
}

export function ApiKeySettings({ className = '' }: ApiKeySettingsProps) {
  const {
    keyState,
    validateAndSetKey,
    testCurrentKey,
    clearFallbackKey,
    switchToPrimary,
    refreshStatus,
    isKeyValid,
    requiresUserKey
  } = useApiKeyContext();

  const [showAddKey, setShowAddKey] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleApiKeySubmit = async (apiKey: string) => {
    const success = await validateAndSetKey(apiKey);
    if (success) {
      setShowAddKey(false);
    }
  };

  const handleTestKey = async () => {
    await testCurrentKey();
  };

  const handleClearFallback = () => {
    clearFallbackKey();
  };

  const handleSwitchToPrimary = () => {
    switchToPrimary();
  };

  const handleRefreshStatus = () => {
    refreshStatus();
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">การตั้งค่า API Key</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStatus}
            disabled={keyState.isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${keyState.isLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </Button>
        </div>
        
        <p className="text-gray-600">
          จัดการ API Key สำหรับการเข้าถึง MFEC LiteLLM และระบบสร้างเอกสาร
        </p>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">สถานะปัจจุบัน</h2>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${
            isKeyValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isKeyValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium text-gray-900">สถานะการเชื่อมต่อ</span>
            </div>
            <p className={`text-sm mt-1 ${
              isKeyValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {isKeyValid ? 'เชื่อมต่อได้' : 'ไม่สามารถเชื่อมต่อได้'}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900">ประเภท API Key</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {keyState.currentKeyType === 'primary' ? 'API Key หลัก' : 'API Key ผู้ใช้'}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">API Key สำรอง</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              {keyState.hasFallback ? 'มี API Key สำรอง' : 'ไม่มี API Key สำรอง'}
            </p>
          </div>
        </div>

        {/* Detailed Status */}
        <ApiKeyStatus
          status={keyState.status}
          currentKeyType={keyState.currentKeyType}
          hasFallback={keyState.hasFallback}
          canUseFallback={keyState.canUseFallback}
          onTestKey={handleTestKey}
          onClearFallback={handleClearFallback}
          onSwitchToPrimary={handleSwitchToPrimary}
          isLoading={keyState.isLoading}
        />
      </div>

      {/* API Key Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">จัดการ API Key</h2>
          
          {!showAddKey && keyState.canUseFallback && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddKey(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่ม API Key</span>
            </Button>
          )}
        </div>

        {/* Add API Key Form */}
        {showAddKey && (
          <div className="mb-6">
            <UserApiKeyInput
              onApiKeySubmit={handleApiKeySubmit}
              isValidating={keyState.isLoading}
              validationError={keyState.error || undefined}
              onCancel={() => setShowAddKey(false)}
              showInstructions={false}
            />
          </div>
        )}

        {/* Current Keys Display */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">API Key หลัก (MFEC)</h3>
                <p className="text-sm text-gray-600">
                  API Key ที่ให้บริการโดย MFEC สำหรับการใช้งานทั่วไป
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  keyState.currentKeyType === 'primary' && keyState.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : keyState.status === 'exhausted'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {keyState.currentKeyType === 'primary' && keyState.status === 'active'
                    ? 'ใช้งานอยู่'
                    : keyState.status === 'exhausted'
                    ? 'หมดอายุ'
                    : 'ไม่ได้ใช้งาน'
                  }
                </span>
              </div>
            </div>
          </div>

          {keyState.hasFallback && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">API Key ผู้ใช้</h3>
                  <p className="text-sm text-gray-600">
                    API Key ที่คุณเพิ่มเข้ามาเพื่อใช้เป็น Fallback
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    keyState.currentKeyType === 'fallback' && keyState.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {keyState.currentKeyType === 'fallback' && keyState.status === 'active'
                      ? 'ใช้งานอยู่'
                      : 'สำรอง'
                    }
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFallback}
                    disabled={keyState.isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">คำแนะนำการใช้งาน</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center space-x-2"
          >
            <Info className="h-4 w-4" />
            <span>{showInstructions ? 'ซ่อน' : 'แสดง'}คำแนะนำ</span>
          </Button>
        </div>

        {showInstructions && (
          <ApiKeyInstructions
            variant="full"
            showSecurityNotice={true}
          />
        )}

        {!showInstructions && (
          <div className="space-y-3 text-sm text-gray-600">
            <p>• API Key หลักจะถูกใช้งานเป็นอันดับแรก</p>
            <p>• เมื่อ API Key หลักหมดอายุ ระบบจะเปลี่ยนไปใช้ API Key ผู้ใช้อัตโนมัติ</p>
            <p>• API Key ผู้ใช้จะถูกเก็บไว้เฉพาะในเซสชันนี้เท่านั้น</p>
            <p>• คลิก "แสดงคำแนะนำ" เพื่อดูวิธีการรับ API Key</p>
          </div>
        )}
      </div>

      {/* Error State */}
      {requiresUserKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">
                จำเป็นต้องใส่ API Key
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                API Key หลักหมดอายุแล้ว กรุณาเพิ่ม API Key ของคุณเพื่อใช้งานต่อ
              </p>
              {!showAddKey && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddKey(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>เพิ่ม API Key ตอนนี้</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}