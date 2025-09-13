'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { ErrorMessage } from './ErrorMessage';
import { ApiKeyInstructions } from '@/components/api-key/ApiKeyInstructions';
import { useApiKeyContext } from '@/contexts/ApiKeyContext';
import { X, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (apiKey: string) => void;
  title?: string;
  description?: string;
  autoManage?: boolean; // Use context for automatic API key management
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'API Key หมดอายุ',
  description = 'กรุณาใส่ API Key ของคุณเพื่อดำเนินการต่อ',
  autoManage = true
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use context for automatic management if enabled
  const apiKeyContext = autoManage ? useApiKeyContext() : null;
  const isValidating = apiKeyContext?.keyState.isLoading || isSubmitting;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setApiKey('');
      setError('');
      setShowApiKey(false);
    }
  }, [isOpen]);

  // Update error from context
  useEffect(() => {
    if (apiKeyContext?.keyState.error) {
      setError(apiKeyContext.keyState.error);
    }
  }, [apiKeyContext?.keyState.error]);

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

    if (autoManage && apiKeyContext) {
      // Use context for automatic management
      try {
        const success = await apiKeyContext.validateAndSetKey(apiKey.trim());
        if (success) {
          onClose();
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบ API Key');
      }
    } else if (onSubmit) {
      // Use custom submit handler
      setIsSubmitting(true);
      try {
        await onSubmit(apiKey.trim());
      } catch (error) {
        setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบ API Key');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isValidating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {!isValidating && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Instructions */}
            <div className="mb-6">
              <ApiKeyInstructions
                variant="modal"
                showSecurityNotice={false}
              />
            </div>

            {/* Error Display */}
            {error && (
              <ErrorMessage
                message={error}
                severity="error"
                className="mb-4"
              />
            )}

            {/* API Key Form */}
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="api-key-form">
              <div className="relative">
                <Input
                  label="API Key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isValidating}
                  helperText="API Key จะถูกเก็บไว้ในเซสชันนี้เท่านั้น ไม่มีการบันทึกถาวร"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  disabled={isValidating}
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isValidating}
                >
                  ยกเลิก
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!apiKey.trim() || isValidating}
                  className="min-w-[120px]"
                >
                  {isValidating ? (
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
        </div>
      </div>
    </div>
  );
}