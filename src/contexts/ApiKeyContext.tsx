'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';

interface ApiKeyContextType {
  keyState: {
    status: 'active' | 'exhausted' | 'invalid' | 'testing';
    currentKeyType: 'primary' | 'fallback';
    hasFallback: boolean;
    canUseFallback: boolean;
    isLoading: boolean;
    error: string | null;
  };
  validateAndSetKey: (apiKey: string) => Promise<boolean>;
  testCurrentKey: () => Promise<boolean>;
  clearFallbackKey: () => void;
  switchToPrimary: () => void;
  refreshStatus: () => Promise<void>;
  handleApiKeyExhaustion: () => Promise<void>;
  requiresUserKey: boolean;
  isKeyValid: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: React.ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const apiKeyManager = useApiKeyManager();

  // Computed properties
  const requiresUserKey = apiKeyManager.keyState.status === 'exhausted' && 
                         !apiKeyManager.keyState.hasFallback && 
                         apiKeyManager.keyState.canUseFallback;

  const isKeyValid = apiKeyManager.keyState.status === 'active';

  const contextValue: ApiKeyContextType = {
    ...apiKeyManager,
    requiresUserKey,
    isKeyValid
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeyContext(): ApiKeyContextType {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeyContext must be used within an ApiKeyProvider');
  }
  return context;
}

// Higher-order component for components that require a valid API key
export function withApiKeyRequired<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ApiKeyRequiredComponent(props: P) {
    const { isKeyValid, requiresUserKey } = useApiKeyContext();

    if (!isKeyValid && requiresUserKey) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              จำเป็นต้องใส่ API Key
            </h3>
            <p className="text-gray-600">
              กรุณาใส่ API Key ของคุณเพื่อใช้งานฟีเจอร์นี้
            </p>
          </div>
        </div>
      );
    }

    if (!isKeyValid) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              API Key ไม่ถูกต้อง
            </h3>
            <p className="text-gray-600">
              กรุณาตรวจสอบการตั้งค่า API Key
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}