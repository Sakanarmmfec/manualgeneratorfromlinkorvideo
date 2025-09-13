import './test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMConnector } from './LLMConnector';
import { APIKeyError } from '@/types';
import { apiKeyManager } from '@/lib/config/APIKeyManager';
import { secureConfigManager } from '@/lib/config/SecureConfigManager';

// Mock fetch globally
global.fetch = vi.fn();

describe('LLMConnector', () => {
  let llmConnector: LLMConnector;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock secure config manager
    vi.mocked(secureConfigManager.getLLMConfig).mockReturnValue({
      baseUrl: 'https://gpt.mfec.co.th/litellm',
      apiKeyRef: 'test-key-ref',
      chatModel: 'gpt-4o',
      embeddingModel: 'text-embedding-3-large',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000
    });

    llmConnector = new LLMConnector();
  });

  describe('createChatCompletion', () => {
    it('should create chat completion successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'This is a test response from the AI model.'
          }
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      };

      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant.' },
        { role: 'user' as const, content: 'Hello, how are you?' }
      ];

      const result = await llmConnector.createChatCompletion(messages);

      expect(result.content).toBe('This is a test response from the AI model.');
      expect(result.usage.totalTokens).toBe(150);
      expect(apiKeyManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        'https://gpt.mfec.co.th/litellm/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('gpt-4o')
        })
      );
    });

    it('should handle custom options', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Custom response' } }],
        usage: { prompt_tokens: 50, completion_tokens: 25, total_tokens: 75 }
      };

      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const messages = [{ role: 'user' as const, content: 'Test' }];
      const options = {
        temperature: 0.5,
        maxTokens: 2000,
        model: 'gpt-3.5-turbo'
      };

      await llmConnector.createChatCompletion(messages, options);

      const requestBody = JSON.parse(
        vi.mocked(apiKeyManager.makeAuthenticatedRequest).mock.calls[0][1]?.body as string
      );

      expect(requestBody.temperature).toBe(0.5);
      expect(requestBody.max_tokens).toBe(2000);
      expect(requestBody.model).toBe('gpt-3.5-turbo');
    });

    it('should handle API errors', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      } as Response);

      const messages = [{ role: 'user' as const, content: 'Test' }];

      await expect(llmConnector.createChatCompletion(messages))
        .rejects.toThrow(APIKeyError);
    });

    it('should handle invalid response format', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      } as Response);

      const messages = [{ role: 'user' as const, content: 'Test' }];

      await expect(llmConnector.createChatCompletion(messages))
        .rejects.toThrow('Invalid response format from LLM API');
    });

    it('should handle network errors', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest)
        .mockRejectedValue(new Error('Network error'));

      const messages = [{ role: 'user' as const, content: 'Test' }];

      await expect(llmConnector.createChatCompletion(messages))
        .rejects.toThrow(APIKeyError);
    });
  });

  describe('createEmbedding', () => {
    it('should create embedding successfully', async () => {
      const mockResponse = {
        data: [{
          embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
        }],
        usage: {
          prompt_tokens: 10,
          total_tokens: 10
        }
      };

      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await llmConnector.createEmbedding('Test text for embedding');

      expect(result.embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
      expect(result.usage.totalTokens).toBe(10);
      expect(apiKeyManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        'https://gpt.mfec.co.th/litellm/v1/embeddings',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('text-embedding-3-large')
        })
      );
    });

    it('should handle custom model', async () => {
      const mockResponse = {
        data: [{ embedding: [0.1, 0.2] }],
        usage: { prompt_tokens: 5, total_tokens: 5 }
      };

      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await llmConnector.createEmbedding('Test', 'custom-embedding-model');

      const requestBody = JSON.parse(
        vi.mocked(apiKeyManager.makeAuthenticatedRequest).mock.calls[0][1]?.body as string
      );

      expect(requestBody.model).toBe('custom-embedding-model');
    });

    it('should handle embedding API errors', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        json: () => Promise.resolve({ error: { message: 'Insufficient credits' } })
      } as Response);

      await expect(llmConnector.createEmbedding('Test'))
        .rejects.toThrow(APIKeyError);
    });

    it('should handle invalid embedding response', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'embedding response' })
      } as Response);

      await expect(llmConnector.createEmbedding('Test'))
        .rejects.toThrow('Invalid embedding response format from LLM API');
    });
  });

  describe('listModels', () => {
    it('should list available models', async () => {
      const mockResponse = {
        data: [
          { id: 'gpt-4o' },
          { id: 'gpt-3.5-turbo' },
          { id: 'text-embedding-3-large' }
        ]
      };

      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await llmConnector.listModels();

      expect(result).toEqual(['gpt-4o', 'gpt-3.5-turbo', 'text-embedding-3-large']);
    });

    it('should handle empty model list', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      } as Response);

      const result = await llmConnector.listModels();

      expect(result).toEqual([]);
    });

    it('should handle model list errors', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      } as Response);

      await expect(llmConnector.listModels())
        .rejects.toThrow(APIKeyError);
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const mockResponse = {
        data: [{ id: 'gpt-4o' }, { id: 'gpt-3.5-turbo' }]
      };

      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await llmConnector.testConnection();

      expect(result.isConnected).toBe(true);
      expect(result.latency).toBeGreaterThan(0);
      expect(result.availableModels).toEqual(['gpt-4o', 'gpt-3.5-turbo']);
      expect(result.error).toBeUndefined();
    });

    it('should handle connection failures', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest)
        .mockRejectedValue(new Error('Connection failed'));

      const result = await llmConnector.testConnection();

      expect(result.isConnected).toBe(false);
      expect(result.latency).toBeGreaterThan(0);
      expect(result.availableModels).toEqual([]);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('configuration management', () => {
    it('should get current configuration', () => {
      const config = llmConnector.getConfig();

      expect(config.baseUrl).toBe('https://gpt.mfec.co.th/litellm');
      expect(config.chatModel).toBe('gpt-4o');
      expect(config.embeddingModel).toBe('text-embedding-3-large');
    });

    it('should update configuration', () => {
      const newConfig = {
        baseUrl: 'https://new-endpoint.com',
        temperature: 0.5
      };

      llmConnector.updateConfig(newConfig);
      const updatedConfig = llmConnector.getConfig();

      expect(updatedConfig.baseUrl).toBe('https://new-endpoint.com');
      expect(updatedConfig.temperature).toBe(0.5);
      expect(updatedConfig.chatModel).toBe('gpt-4o'); // Should preserve existing values
    });
  });

  describe('error handling', () => {
    it('should identify recoverable errors', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({})
      } as Response);

      try {
        await llmConnector.createChatCompletion([{ role: 'user', content: 'test' }]);
      } catch (error) {
        expect(error).toBeInstanceOf(APIKeyError);
        expect((error as APIKeyError).isRecoverable).toBe(true);
      }
    });

    it('should identify non-recoverable errors', async () => {
      vi.mocked(apiKeyManager.makeAuthenticatedRequest).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({})
      } as Response);

      try {
        await llmConnector.createChatCompletion([{ role: 'user', content: 'test' }]);
      } catch (error) {
        expect(error).toBeInstanceOf(APIKeyError);
        expect((error as APIKeyError).isRecoverable).toBe(false);
      }
    });
  });
});