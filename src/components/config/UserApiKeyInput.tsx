'use client';

import React, { useState, useCallback } from 'react';
import { UserApiKeyInput as IUserApiKeyInput, ConfigValidationResult } from '@/types';

interface UserApiKeyInputProps {
  onApiKeySubmit: (apiKeyData: IUserApiKeyInput) => Promise<void>;
  onCancel?: () => void;
  isVisible: boolean;
  isLoading?: boolean;
  error?: string;
}

/**
 * UserApiKeyInput component for collecting user-provided API keys
 * when the primary key is exhausted
 */
export const UserApiKeyInput: React.FC<UserApiKeyInputProps> = ({
  onApiKeySubmit,
  onCancel,
  isVisible,
  isLoading = false,
  error
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isTemporary, setIsTemporary] = useState(true);
  const [validation, setValidation] = useState<ConfigValidationResult | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Validate API key format on input
  const validateApiKey = useCallback((key: string): ConfigValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!key.trim()) {
      errors.push('API key is required');
    } else if (key.length < 10) {
      errors.push('API key appears to be too short');
    } else if (!/^[a-zA-Z0-9\-_.]+$/.test(key)) {
      warnings.push('API key contains unusual characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    
    if (newKey.trim()) {
      setValidation(validateApiKey(newKey));
    } else {
      setValidation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentValidation = validateApiKey(apiKey);
    setValidation(currentValidation);
    
    if (!currentValidation.isValid) {
      return;
    }

    try {
      await onApiKeySubmit({
        apiKey: apiKey.trim(),
        isTemporary
      });
      
      // Clear form on success
      setApiKey('');
      setValidation(null);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Failed to submit API key:', error);
    }
  };

  const handleCancel = () => {
    setApiKey('');
    setValidation(null);
    onCancel?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            API Key Required
          </h3>
          <p className="text-sm text-gray-600">
            The primary API key has been exhausted. Please provide your own API key to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Your API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your MFEC LLM API key"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                  validation?.isValid === false ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            
            {validation && (
              <div className="mt-1">
                {validation.errors.map((error, index) => (
                  <p key={index} className="text-xs text-red-600">{error}</p>
                ))}
                {validation.warnings.map((warning, index) => (
                  <p key={index} className="text-xs text-yellow-600">{warning}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="isTemporary"
              type="checkbox"
              checked={isTemporary}
              onChange={(e) => setIsTemporary(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="isTemporary" className="ml-2 block text-sm text-gray-700">
              Use for this session only (recommended)
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-700">
              <strong>Security Note:</strong> Your API key will only be stored in memory for this session 
              and will not be saved permanently. Make sure to use your own API key from MFEC.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !validation?.isValid}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Validating...' : 'Use API Key'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need an API key? Contact your MFEC administrator or visit the MFEC developer portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserApiKeyInput;