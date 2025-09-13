'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiKeyManager } from '@/lib/config/APIKeyManager';
import { APIKeyError } from '@/types';

interface ApiKeyState {
  status: 'active' | 'exhausted' | 'invalid' | 'testing';
  currentKeyType: 'primary' | 'fallback';
  hasFallback: boolean;
  canUseFallback: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseApiKeyManagerReturn {
  keyState: ApiKeyState;
  validateAndSetKey: (apiKey: string) => Promise<boolean>;
  testCurrentKey: () => Promise<boolean>;
  clearFallbackKey: () => void;
  switchToPrimary: () => void;
  refreshStatus: () => Promise<void>;
  handleApiKeyExhaustion: () => Promise<void>;
}

export function useApiKeyManager(): UseApiKeyManagerReturn {
  const [keyState, setKeyState] = useState<ApiKeyState>({
    status: 'active',
    currentKeyType: 'primary',
    hasFallback: false,
    canUseFallback: false,
    isLoading: false,
    error: null
  });

  // Load initial status
  const refreshStatus = useCallback(async () => {
    try {
      setKeyState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const status = apiKeyManager.getKeyStatus();
      
      setKeyState(prev => ({
        ...prev,
        status: status.status,
        currentKeyType: status.currentKeyType,
        hasFallback: status.hasFallback,
        canUseFallback: status.canUseFallback,
        isLoading: false
      }));
    } catch (error) {
      setKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load API key status'
      }));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Validate and set user API key
  const validateAndSetKey = useCallback(async (apiKey: string): Promise<boolean> => {
    try {
      setKeyState(prev => ({ ...prev, isLoading: true, error: null }));

      // Validate the key
      const isValid = await apiKeyManager.validateKey(apiKey);
      
      if (!isValid) {
        throw new APIKeyError('API Key is invalid or cannot be used', 'INVALID_KEY', true);
      }

      // Set as fallback key
      apiKeyManager.setFallbackKey(apiKey);
      
      // Switch to fallback if primary is exhausted
      if (keyState.status === 'exhausted') {
        apiKeyManager.switchToFallback();
      }

      // Refresh status
      await refreshStatus();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof APIKeyError 
        ? error.message 
        : 'Failed to validate API key';
      
      setKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return false;
    }
  }, [keyState.status, refreshStatus]);

  // Test current API key
  const testCurrentKey = useCallback(async (): Promise<boolean> => {
    try {
      setKeyState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await apiKeyManager.testConfiguration();
      
      await refreshStatus();
      
      if (!result.isValid) {
        setKeyState(prev => ({
          ...prev,
          error: result.error || 'API key test failed'
        }));
      }
      
      return result.isValid;
    } catch (error) {
      setKeyState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to test API key'
      }));
      
      return false;
    }
  }, [refreshStatus]);

  // Clear fallback key
  const clearFallbackKey = useCallback(() => {
    try {
      apiKeyManager.clearFallbackKey();
      refreshStatus();
    } catch (error) {
      setKeyState(prev => ({
        ...prev,
        error: 'Failed to clear fallback key'
      }));
    }
  }, [refreshStatus]);

  // Switch to primary key
  const switchToPrimary = useCallback(() => {
    try {
      apiKeyManager.resetToPrimary();
      refreshStatus();
    } catch (error) {
      setKeyState(prev => ({
        ...prev,
        error: 'Failed to switch to primary key'
      }));
    }
  }, [refreshStatus]);

  // Handle API key exhaustion
  const handleApiKeyExhaustion = useCallback(async () => {
    try {
      await apiKeyManager.handleKeyExhaustion();
      await refreshStatus();
    } catch (error) {
      if (error instanceof APIKeyError && error.code === 'KEY_EXHAUSTED') {
        // This is expected when no fallback is available
        await refreshStatus();
      } else {
        setKeyState(prev => ({
          ...prev,
          error: 'Failed to handle key exhaustion'
        }));
      }
    }
  }, [refreshStatus]);

  return {
    keyState,
    validateAndSetKey,
    testCurrentKey,
    clearFallbackKey,
    switchToPrimary,
    refreshStatus,
    handleApiKeyExhaustion
  };
}