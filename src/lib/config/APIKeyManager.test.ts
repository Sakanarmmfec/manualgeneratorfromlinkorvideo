import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIKeyManager } from './APIKeyManager';
import { APIKeyError } from '@/types';

// Mock fetch
global.fetch = vi.fn();

// Mock SecureConfigManager
vi.mock('./SecureConfigManager', () => ({
  secureConfigManager: {
    getLLMConfig: () => ({
      baseUrl: 'https://gpt.mfec.co.th/litellm',
      timeout: 30000
    }),
    getAPIKey: () => 'primary-api-key-12345',
    isUserApiKeyAllowed: () => true,
    setUserApiKey: vi.fn(),
    clearUserApiKey: vi.fn()
  }
}));

describe('APIKeyManager', () => {
  let apiKeyManager: APIKeyManager;
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.mocked(fetch);
    mockFetch.mockClear();
    
    apiKeyManager = new APIKeyManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with primary key', () => {
      expect(apiKeyManager.primaryKey).toBe('primary-api-key-12345');
      expect(apiKeyManager.keyStatus).toBe('active');
      expect(apiKeyManager.getCurrentKey()).toBe('primary-api-key-12345');
    });
  });

  describe('key validation', () => {
    it('should validate API key successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      const isValid = await apiKeyManager.validateKey('test-key');
      
      expect(isValid).toBe(true);
      expect(apiKeyManager.keyStatus).toBe('active');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://gpt.mfec.co.th/litellm/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
    });

    it('should handle invalid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const isValid = await apiKeyManager.validateKey('invalid-key');
      
      expect(isValid).toBe(false);
      expect(apiKeyManager.keyStatus).toBe('invalid');
    });

    it('should handle network errors during validation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isValid = await apiKeyManager.validateKey('test-key');
      
      expect(isValid).toBe(false);
      expect(apiKeyManager.keyStatus).toBe('invalid');
    });
  });

  describe('fallback key management', () => {
    it('should set fallback key', () => {
      const fallbackKey = 'fallback-key-12345';
      
      apiKeyManager.setFallbackKey(fallbackKey);
      
      expect(apiKeyManager.fallbackKey).toBe(fallbackKey);
    });

    it('should switch to fallback key', () => {
      const fallbackKey = 'fallback-key-12345';
      apiKeyManager.setFallbackKey(fallbackKey);
      
      apiKeyManager.switchToFallback();
      
      expect(apiKeyManager.getCurrentKey()).toBe(fallbackKey);
    });

    it('should throw error when switching to fallback without key', () => {
      expect(() => apiKeyManager.switchToFallback()).toThrow(APIKeyError);
    });

    it('should reset to primary key', () => {
      const fallbackKey = 'fallback-key-12345';
      apiKeyManager.setFallbackKey(fallbackKey);
      apiKeyManager.switchToFallback();
      
      apiKeyManager.resetToPrimary();
      
      expect(apiKeyManager.getCurrentKey()).toBe('primary-api-key-12345');
    });

    it('should clear fallback key', () => {
      const fallbackKey = 'fallback-key-12345';
      apiKeyManager.setFallbackKey(fallbackKey);
      apiKeyManager.switchToFallback();
      
      apiKeyManager.clearFallbackKey();
      
      expect(apiKeyManager.fallbackKey).toBeUndefined();
      expect(apiKeyManager.getCurrentKey()).toBe('primary-api-key-12345');
    });
  });

  describe('key exhaustion handling', () => {
    it('should handle key exhaustion with valid fallback', async () => {
      const fallbackKey = 'fallback-key-12345';
      apiKeyManager.setFallbackKey(fallbackKey);
      
      // Mock successful validation of fallback key
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      await apiKeyManager.handleKeyExhaustion();
      
      expect(apiKeyManager.getCurrentKey()).toBe(fallbackKey);
      expect(apiKeyManager.keyStatus).toBe('active');
    });

    it('should throw error when no fallback available', async () => {
      await expect(apiKeyManager.handleKeyExhaustion()).rejects.toThrow(APIKeyError);
      expect(apiKeyManager.keyStatus).toBe('exhausted');
    });

    it('should throw error when fallback is invalid', async () => {
      const fallbackKey = 'invalid-fallback-key';
      apiKeyManager.setFallbackKey(fallbackKey);
      
      // Mock failed validation of fallback key
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(apiKeyManager.handleKeyExhaustion()).rejects.toThrow(APIKeyError);
    });
  });

  describe('authenticated requests', () => {
    it('should make authenticated request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'success' })
      });

      const response = await apiKeyManager.makeAuthenticatedRequest('https://api.example.com/test');
      
      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer primary-api-key-12345'
          })
        })
      );
    });

    it('should handle rate limiting with fallback', async () => {
      const fallbackKey = 'fallback-key-12345';
      apiKeyManager.setFallbackKey(fallbackKey);
      
      // First request fails with rate limit
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429
        })
        // Validation of fallback key succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200
        })
        // Retry with fallback succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200
        });

      const response = await apiKeyManager.makeAuthenticatedRequest('https://api.example.com/test');
      
      expect(response.ok).toBe(true);
      expect(apiKeyManager.getCurrentKey()).toBe(fallbackKey);
    });

    it('should handle unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(
        apiKeyManager.makeAuthenticatedRequest('https://api.example.com/test')
      ).rejects.toThrow(APIKeyError);
      
      expect(apiKeyManager.keyStatus).toBe('invalid');
    });

    it('should throw error when no valid key available', async () => {
      apiKeyManager.keyStatus = 'invalid';
      
      await expect(
        apiKeyManager.makeAuthenticatedRequest('https://api.example.com/test')
      ).rejects.toThrow(APIKeyError);
    });
  });

  describe('status reporting', () => {
    it('should return key status', () => {
      const status = apiKeyManager.getKeyStatus();
      
      expect(status).toHaveProperty('status', 'active');
      expect(status).toHaveProperty('currentKeyType', 'primary');
      expect(status).toHaveProperty('hasFallback', false);
      expect(status).toHaveProperty('canUseFallback', true);
    });

    it('should test configuration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      const result = await apiKeyManager.testConfiguration();
      
      expect(result.isValid).toBe(true);
      expect(result.keyType).toBe('primary');
      expect(result.error).toBeUndefined();
    });

    it('should report configuration test failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await apiKeyManager.testConfiguration();
      
      expect(result.isValid).toBe(false);
      expect(result.keyType).toBe('primary');
      expect(result.error).toBe('Key validation failed');
    });
  });
});