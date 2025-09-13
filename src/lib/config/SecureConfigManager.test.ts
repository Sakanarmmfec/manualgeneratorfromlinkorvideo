import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SecureConfigManager } from './SecureConfigManager';
import { ConfigurationError, APIKeyError } from '@/types';

// Mock environment variables
const mockEnv = {
  MFEC_LLM_API_KEY: 'test-api-key-12345',
  ENCRYPTION_KEY: 'test-encryption-key-32-characters-long',
  MFEC_LLM_BASE_URL: 'https://gpt.mfec.co.th/litellm',
  MFEC_LLM_CHAT_MODEL: 'gpt-4o',
  MFEC_LLM_EMBEDDING_MODEL: 'text-embedding-3-large',
  NODE_ENV: 'development',
  ALLOW_USER_API_KEYS: 'true'
};

describe('SecureConfigManager', () => {
  let configManager: SecureConfigManager;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set mock environment
    Object.assign(process.env, mockEnv);
    
    // Get fresh instance
    configManager = SecureConfigManager.getInstance();
    configManager.reset();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    configManager.reset();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid environment', async () => {
      await expect(configManager.initialize()).resolves.not.toThrow();
    });

    it('should throw error when required environment variables are missing', async () => {
      delete process.env.MFEC_LLM_API_KEY;
      
      await expect(configManager.initialize()).rejects.toThrow(ConfigurationError);
    });

    it('should throw error when encryption key is too short', async () => {
      process.env.ENCRYPTION_KEY = 'short';
      
      await expect(configManager.initialize()).rejects.toThrow(ConfigurationError);
    });

    it('should handle invalid LLM base URL', async () => {
      process.env.MFEC_LLM_BASE_URL = 'invalid-url';
      
      await expect(configManager.initialize()).rejects.toThrow(ConfigurationError);
    });
  });

  describe('configuration access', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    it('should return configuration without sensitive data', () => {
      const config = configManager.getConfig();
      
      expect(config).toHaveProperty('environment', 'development');
      expect(config).toHaveProperty('allowUserApiKeys', true);
      expect(config).not.toHaveProperty('llmApiKey');
      expect(config).not.toHaveProperty('encryptionKey');
    });

    it('should return LLM configuration', () => {
      const llmConfig = configManager.getLLMConfig();
      
      expect(llmConfig).toHaveProperty('baseUrl', 'https://gpt.mfec.co.th/litellm');
      expect(llmConfig).toHaveProperty('chatModel', 'gpt-4o');
      expect(llmConfig).toHaveProperty('embeddingModel', 'text-embedding-3-large');
      expect(llmConfig).toHaveProperty('maxTokens', 4000);
      expect(llmConfig).toHaveProperty('temperature', 0.7);
    });

    it('should return API key securely', () => {
      const apiKey = configManager.getAPIKey();
      
      expect(apiKey).toBe('test-api-key-12345');
    });
  });

  describe('user API key management', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    it('should set user API key when allowed', () => {
      const userKey = 'user-provided-key-12345';
      
      expect(() => configManager.setUserApiKey(userKey)).not.toThrow();
      expect(configManager.getAPIKey()).toBe(userKey);
    });

    it('should reject user API key when not allowed', async () => {
      process.env.ALLOW_USER_API_KEYS = 'false';
      configManager.reset();
      await configManager.initialize();
      
      expect(() => configManager.setUserApiKey('user-key')).toThrow(APIKeyError);
    });

    it('should validate user API key format', () => {
      expect(() => configManager.setUserApiKey('')).toThrow(APIKeyError);
      expect(() => configManager.setUserApiKey('short')).toThrow(APIKeyError);
    });

    it('should clear user API key', () => {
      configManager.setUserApiKey('user-key-12345');
      expect(configManager.getAPIKey()).toBe('user-key-12345');
      
      configManager.clearUserApiKey();
      expect(configManager.getAPIKey()).toBe('test-api-key-12345');
    });
  });

  describe('validation', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    it('should validate API key format correctly', () => {
      const validKey = 'valid-api-key-12345';
      const validation = configManager.validateApiKeyFormat(validKey);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid API key formats', () => {
      const invalidKey = '';
      const validation = configManager.validateApiKeyFormat(invalidKey);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should warn about unusual characters', () => {
      const keyWithSpecialChars = 'key-with-@#$-chars';
      const validation = configManager.validateApiKeyFormat(keyWithSpecialChars);
      
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('environment checks', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    it('should return correct environment', () => {
      expect(configManager.getEnvironment()).toBe('development');
    });

    it('should check user API key permission correctly', () => {
      expect(configManager.isUserApiKeyAllowed()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error when accessing config before initialization', () => {
      expect(() => configManager.getConfig()).toThrow(ConfigurationError);
      expect(() => configManager.getLLMConfig()).toThrow(ConfigurationError);
      expect(() => configManager.getAPIKey()).toThrow(ConfigurationError);
    });

    it('should handle missing environment variables gracefully', async () => {
      delete process.env.MFEC_LLM_API_KEY;
      delete process.env.ENCRYPTION_KEY;
      
      await expect(configManager.initialize()).rejects.toThrow(ConfigurationError);
    });
  });

  describe('singleton behavior', () => {
    it('should return same instance', () => {
      const instance1 = SecureConfigManager.getInstance();
      const instance2 = SecureConfigManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});