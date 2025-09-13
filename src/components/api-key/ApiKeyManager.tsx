'use client';

import React, { useState, useEffect } from 'react';
import { UserApiKeyInput } from './UserApiKeyInput';
import { ApiKeyStatus } from './ApiKeyStatus';
import { ErrorMessage } from '@/components/error/ErrorMessage';
import { apiKeyManager } from '@/lib/config/APIKeyManager';
import { APIKeyError } from '@/types';

interface ApiKeyManagerProps {
  onApiKeyUpdated?: (hasValidKey: boolean) => void;
  showStatus?: boolean;
  className?: string;
}

export function ApiKeyManager({
  onApiKeyUpdated,
  showStatus = true,
  className = ''
}: ApiKeyManagerProps) {
  const [keyStatus, setKeyStatus] = useState({
    status: 'active' as const,
    currentKeyType: 'primary' as const,
    hasFallback: false,
    canUseFallback: false
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial status
  useEffect(() => {
    loadKeyStatus();
  }, []);

  const loadKeyStatus = async () => {
    try {
      setIsLoading(true);
      const status = apiKeyManager.getKeyStatus();
      setKeyStatus(status);
      
      // Show API key input if primary key is exhausted and no fallback
      if (status.status === 'exhausted' && !status.hasFallback && status.canUseFallback) {
        setShowApiKeyInput(true);
      }
    } catch (error) {
      console.error('Failed to load key status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySubmit = async (apiKey: string) => {
    setIsValidating(true);
    setValidationError('');

    try {
      // Validate the API key
      const isValid = await apiKeyManager.validateKey(apiKey);
      
      if (!isValid) {
        throw new APIKeyError('API Key ไม่ถูกต้องหรือไม่สามารถใช้งานได้', 'INVALID_KEY', true);
      }

      // Set as fallback key
      apiKeyManager.setFallbackKey(apiKey);
      
      // Switch to fallback if primary is exhausted
      if (keyStatus.status === 'exhausted') {
        apiKeyManager.switchToFallback();
      }

      // Reload status
      await loadKeyStatus();
      
      // Hide input form
      setShowApiKeyInput(false);
      
      // Notify parent component
      onApiKeyUpdated?.(true);
      
    } catch (error) {
      if (error instanceof APIKeyError) {
        setValidationError(error.message);
      } else {
        setValidationError('เกิดข้อผิดพลาดในการตรวจสอบ API Key');
      }
      console.error('API key validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTestKey = async () => {
    setIsLoading(true);
    try {
      const result = await apiKeyManager.testConfiguration();
      await loadKeyStatus();
      
      if (!result.isValid) {
        setValidationError(result.error || 'การทดสอบ API Key ล้มเหลว');
      } else {
        setValidationError('');
      }
    } catch (error) {
      setValidationError('เกิดข้อผิดพลาดในการทดสอบ API Key');
      console.error('Key test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFallback = async () => {
    try {
      setIsLoading(true);
      apiKeyManager.clearFallbackKey();
      await loadKeyStatus();
      onApiKeyUpdated?.(keyStatus.status === 'active');
    } catch (error) {
      console.error('Failed to clear fallback key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToPrimary = async () => {
    try {
      setIsLoading(true);
      apiKeyManager.resetToPrimary();
      await loadKeyStatus();
      onApiKeyUpdated?.(keyStatus.status === 'active');
    } catch (error) {
      console.error('Failed to switch to primary key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowApiKeyInput = () => {
    setShowApiKeyInput(true);
    setValidationError('');
  };

  const handleCancelApiKeyInput = () => {
    setShowApiKeyInput(false);
    setValidationError('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Display */}
      {showStatus && (
        <ApiKeyStatus
          status={keyStatus.status}
          currentKeyType={keyStatus.currentKeyType}
          hasFallback={keyStatus.hasFallback}
          canUseFallback={keyStatus.canUseFallback}
          onTestKey={handleTestKey}
          onClearFallback={handleClearFallback}
          onSwitchToPrimary={handleSwitchToPrimary}
          isLoading={isLoading}
        />
      )}

      {/* Error Display */}
      {validationError && (
        <ErrorMessage
          message={validationError}
          severity="error"
        />
      )}

      {/* API Key Input */}
      {showApiKeyInput && keyStatus.canUseFallback && (
        <UserApiKeyInput
          onApiKeySubmit={handleApiKeySubmit}
          isValidating={isValidating}
          validationError={validationError}
          onCancel={handleCancelApiKeyInput}
          showInstructions={true}
        />
      )}

      {/* Show Input Button */}
      {!showApiKeyInput && keyStatus.canUseFallback && (keyStatus.status === 'exhausted' || keyStatus.status === 'invalid') && (
        <div className="text-center">
          <button
            onClick={handleShowApiKeyInput}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            disabled={isLoading}
          >
            ใส่ API Key ของคุณ
          </button>
        </div>
      )}
    </div>
  );
}