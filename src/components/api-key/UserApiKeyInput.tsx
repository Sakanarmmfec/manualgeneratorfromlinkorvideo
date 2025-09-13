'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { ErrorMessage } from '@/components/error/ErrorMessage';
import { ApiKeyInstructions } from './ApiKeyInstructions';
import { Key, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface UserApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => Promise<void>;
  isValidating?: boolean;
  validationError?: string;
  onCancel?: () => void;
  showInstructions?: boolean;
  className?: string;
}

export function UserApiKeyInput({
  onApiKeySubmit,
  isValidating = false,
  validationError,
  onCancel,
  showInstructions = true,
  className = ''
}: UserApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update error when validation error changes
  useEffect(() => {
    setError(validationError || '');
  }, [validationError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('กรุณาใส่ API Key');
      return;
    }

    if (apiKey.length < 10) {
      setError('API Key ไม่ถูกต้อง');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onApiKeySubmit(apiKey.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบ API Key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setApiKey('');
    setError('');
    setShowApiKey(false);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">ใส่ API Key ของคุณ</h3>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="mb-6">
          <ApiKeyInstructions
            variant="modal"
            showSecurityNotice={false}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          severity="error"
          className="mb-4"
        />
      )}

      {/* API Key Form */}
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="user-api-key-form">
        <div className="relative">
          <Input
            label="API Key"
            type={showApiKey ? 'text' : 'password'}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isValidating || isSubmitting}
            helperText="API Key จะถูกเก็บไว้ในเซสชันนี้เท่านั้น ไม่มีการบันทึกถาวร"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            disabled={isValidating || isSubmitting}
            aria-label={showApiKey ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Security Notice */}
        <ApiKeyInstructions
          variant="compact"
          showSecurityNotice={true}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isValidating || isSubmitting}
            >
              ยกเลิก
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isValidating || isSubmitting || !apiKey}
          >
            ล้างข้อมูล
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={!apiKey.trim() || isValidating || isSubmitting}
            className="min-w-[120px]"
          >
            {isValidating || isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>กำลังตรวจสอบ...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>ยืนยัน</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}