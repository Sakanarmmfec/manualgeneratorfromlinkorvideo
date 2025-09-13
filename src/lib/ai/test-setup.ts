import { vi } from 'vitest';

// Mock the configuration managers before any imports
vi.mock('@/lib/config/SecureConfigManager', () => ({
  secureConfigManager: {
    getLLMConfig: vi.fn(() => ({
      baseUrl: 'https://gpt.mfec.co.th/litellm',
      apiKeyRef: 'test-key-ref',
      chatModel: 'gpt-4o',
      embeddingModel: 'text-embedding-3-large',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000
    })),
    isInitialized: vi.fn(() => true),
    initialize: vi.fn()
  }
}));

vi.mock('@/lib/config/APIKeyManager', () => ({
  apiKeyManager: {
    getKeyStatus: vi.fn(() => 'active'),
    hasFallbackKey: vi.fn(() => false),
    switchToFallback: vi.fn(),
    makeAuthenticatedRequest: vi.fn()
  }
}));

vi.mock('./LLMConnector', () => ({
  llmConnector: {
    createChatCompletion: vi.fn(),
    createEmbedding: vi.fn(),
    listModels: vi.fn(),
    testConnection: vi.fn(),
    getConfig: vi.fn(),
    updateConfig: vi.fn()
  },
  LLMConnector: vi.fn().mockImplementation(() => ({
    createChatCompletion: vi.fn(),
    createEmbedding: vi.fn(),
    listModels: vi.fn(),
    testConnection: vi.fn(),
    getConfig: vi.fn(),
    updateConfig: vi.fn()
  }))
}));

// Don't mock VideoContentAnalyzer and ContentProcessor - let them be real classes
// Just mock their dependencies