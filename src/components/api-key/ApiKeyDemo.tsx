'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { UserApiKeyInput } from './UserApiKeyInput';
import { ApiKeyStatus } from './ApiKeyStatus';
import { ApiKeyManager } from './ApiKeyManager';
import { ApiKeyProvider, useApiKeyContext } from '@/contexts/ApiKeyContext';
import { Settings, Key, TestTube, RefreshCw } from 'lucide-react';

function ApiKeyDemoContent() {
  const [activeDemo, setActiveDemo] = useState<'input' | 'status' | 'manager' | 'context'>('manager');
  const [mockStatus, setMockStatus] = useState<'active' | 'exhausted' | 'invalid' | 'testing'>('active');
  const [mockKeyType, setMockKeyType] = useState<'primary' | 'fallback'>('primary');
  const [mockHasFallback, setMockHasFallback] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const apiKeyContext = useApiKeyContext();

  const handleApiKeySubmit = async (apiKey: string) => {
    setIsValidating(true);
    setValidationError('');

    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (apiKey === 'invalid') {
      setValidationError('API Key ไม่ถูกต้อง');
    } else if (apiKey === 'error') {
      setValidationError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } else {
      console.log('API Key submitted:', apiKey);
      setMockStatus('active');
      setMockKeyType('fallback');
      setMockHasFallback(true);
    }

    setIsValidating(false);
  };

  const handleTestKey = async () => {
    setMockStatus('testing');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMockStatus('active');
  };

  const handleClearFallback = () => {
    setMockHasFallback(false);
    setMockKeyType('primary');
  };

  const handleSwitchToPrimary = () => {
    setMockKeyType('primary');
  };

  const handleApiKeyUpdated = (hasValidKey: boolean) => {
    console.log('API key updated:', hasValidKey);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Key className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">API Key Management System</h1>
        </div>
        <p className="text-lg text-gray-600">
          ระบบจัดการ API Key สำหรับ MFEC LiteLLM พร้อมระบบ Fallback อัตโนมัติ
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={activeDemo === 'input' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('input')}
          className="flex items-center space-x-2"
        >
          <Key className="h-4 w-4" />
          <span>User Input</span>
        </Button>
        <Button
          variant={activeDemo === 'status' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('status')}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Status Display</span>
        </Button>
        <Button
          variant={activeDemo === 'manager' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('manager')}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Full Manager</span>
        </Button>
        <Button
          variant={activeDemo === 'context' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('context')}
          className="flex items-center space-x-2"
        >
          <TestTube className="h-4 w-4" />
          <span>Context Demo</span>
        </Button>
      </div>

      {/* Demo Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeDemo === 'input' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">UserApiKeyInput Component</h2>
            <p className="text-gray-600">
              ฟอร์มสำหรับรับ API Key จากผู้ใช้ พร้อมการตรวจสอบและคำแนะนำ
            </p>
            
            {/* Test Controls */}
            <div className="bg-white p-4 rounded border space-y-2">
              <h3 className="font-medium text-gray-900">Test Scenarios:</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setValidationError('')}>
                  Clear Error
                </Button>
                <Button size="sm" onClick={() => setValidationError('Test error message')}>
                  Show Error
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Try: "invalid" for validation error, "error" for connection error, or any other key for success
              </p>
            </div>

            <UserApiKeyInput
              onApiKeySubmit={handleApiKeySubmit}
              isValidating={isValidating}
              validationError={validationError}
              showInstructions={true}
            />
          </div>
        )}

        {activeDemo === 'status' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">ApiKeyStatus Component</h2>
            <p className="text-gray-600">
              แสดงสถานะ API Key และตัวเลือกการจัดการ
            </p>
            
            {/* Test Controls */}
            <div className="bg-white p-4 rounded border space-y-3">
              <h3 className="font-medium text-gray-900">Test Controls:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                  <select
                    value={mockStatus}
                    onChange={(e) => setMockStatus(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="active">Active</option>
                    <option value="exhausted">Exhausted</option>
                    <option value="invalid">Invalid</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Type:</label>
                  <select
                    value={mockKeyType}
                    onChange={(e) => setMockKeyType(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="primary">Primary</option>
                    <option value="fallback">Fallback</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={mockHasFallback}
                    onChange={(e) => setMockHasFallback(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Has Fallback</span>
                </label>
              </div>
            </div>

            <ApiKeyStatus
              status={mockStatus}
              currentKeyType={mockKeyType}
              hasFallback={mockHasFallback}
              canUseFallback={true}
              onTestKey={handleTestKey}
              onClearFallback={handleClearFallback}
              onSwitchToPrimary={handleSwitchToPrimary}
            />
          </div>
        )}

        {activeDemo === 'manager' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">ApiKeyManager Component</h2>
            <p className="text-gray-600">
              ระบบจัดการ API Key แบบครบครัน รวมสถานะและการใส่ Key
            </p>
            
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-500 mb-4">
                This component integrates with the actual backend API key manager.
                In a real application, it would show the current status and allow key management.
              </p>
            </div>

            <ApiKeyManager
              onApiKeyUpdated={handleApiKeyUpdated}
              showStatus={true}
            />
          </div>
        )}

        {activeDemo === 'context' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Context Integration</h2>
            <p className="text-gray-600">
              การใช้งาน API Key Context สำหรับการจัดการสถานะทั่วทั้งแอปพลิเคชัน
            </p>
            
            <div className="bg-white p-4 rounded border space-y-3">
              <h3 className="font-medium text-gray-900">Current Context State:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span> {apiKeyContext.keyState.status}
                </div>
                <div>
                  <span className="font-medium">Key Type:</span> {apiKeyContext.keyState.currentKeyType}
                </div>
                <div>
                  <span className="font-medium">Has Fallback:</span> {apiKeyContext.keyState.hasFallback ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Can Use Fallback:</span> {apiKeyContext.keyState.canUseFallback ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Is Loading:</span> {apiKeyContext.keyState.isLoading ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Requires User Key:</span> {apiKeyContext.requiresUserKey ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Is Key Valid:</span> {apiKeyContext.isKeyValid ? 'Yes' : 'No'}
                </div>
              </div>
              
              {apiKeyContext.keyState.error && (
                <div className="text-red-600 text-sm">
                  <span className="font-medium">Error:</span> {apiKeyContext.keyState.error}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded border space-y-3">
              <h3 className="font-medium text-gray-900">Context Actions:</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => apiKeyContext.testCurrentKey()}
                  disabled={apiKeyContext.keyState.isLoading}
                >
                  Test Current Key
                </Button>
                <Button
                  size="sm"
                  onClick={() => apiKeyContext.refreshStatus()}
                  disabled={apiKeyContext.keyState.isLoading}
                >
                  Refresh Status
                </Button>
                {apiKeyContext.keyState.hasFallback && (
                  <Button
                    size="sm"
                    onClick={() => apiKeyContext.clearFallbackKey()}
                    disabled={apiKeyContext.keyState.isLoading}
                  >
                    Clear Fallback
                  </Button>
                )}
                {apiKeyContext.keyState.currentKeyType === 'fallback' && (
                  <Button
                    size="sm"
                    onClick={() => apiKeyContext.switchToPrimary()}
                    disabled={apiKeyContext.keyState.isLoading}
                  >
                    Switch to Primary
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Security Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Session-based API key storage</li>
              <li>• No persistent storage of sensitive data</li>
              <li>• HTTPS-only communication</li>
              <li>• Real-time key validation</li>
              <li>• Secure configuration management</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">User Experience</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatic fallback switching</li>
              <li>• Clear error messages and guidance</li>
              <li>• Real-time status updates</li>
              <li>• Comprehensive key management</li>
              <li>• Thai language support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApiKeyDemo() {
  return (
    <ApiKeyProvider>
      <ApiKeyDemoContent />
    </ApiKeyProvider>
  );
}