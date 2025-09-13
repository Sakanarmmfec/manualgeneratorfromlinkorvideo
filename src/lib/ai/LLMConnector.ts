import { LLMConfiguration, APIKeyError } from '@/types';
import { apiKeyManager } from '@/lib/config/APIKeyManager';
import { secureConfigManager } from '@/lib/config/SecureConfigManager';

/**
 * LLMConnector handles secure connections to MFEC's LiteLLM endpoint
 * Provides methods for chat completions, embeddings, and model management
 */
export class LLMConnector {
  private config: LLMConfiguration;
  private baseUrl: string;

  constructor() {
    this.config = secureConfigManager.getLLMConfig();
    this.baseUrl = this.config.baseUrl;
  }

  /**
   * Make a chat completion request using gpt-4o model
   */
  public async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<{
    content: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    const requestBody = {
      model: options.model || this.config.chatModel,
      messages,
      temperature: options.temperature ?? this.config.temperature,
      max_tokens: options.maxTokens || this.config.maxTokens,
      stream: false
    };

    try {
      const response = await apiKeyManager.makeAuthenticatedRequest(
        `${this.baseUrl}/v1/chat/completions`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIKeyError(
          `LLM request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`,
          'LLM_REQUEST_FAILED',
          response.status === 429 || response.status === 402
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new APIKeyError(
          'Invalid response format from LLM API',
          'INVALID_RESPONSE',
          false
        );
      }

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      
      throw new APIKeyError(
        `Chat completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CHAT_COMPLETION_FAILED',
        true
      );
    }
  }

  /**
   * Create embeddings using text-embedding-3-large model
   */
  public async createEmbedding(
    text: string,
    model?: string
  ): Promise<{
    embedding: number[];
    usage: {
      promptTokens: number;
      totalTokens: number;
    };
  }> {
    const requestBody = {
      model: model || this.config.embeddingModel,
      input: text,
      encoding_format: 'float'
    };

    try {
      const response = await apiKeyManager.makeAuthenticatedRequest(
        `${this.baseUrl}/v1/embeddings`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIKeyError(
          `Embedding request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`,
          'EMBEDDING_REQUEST_FAILED',
          response.status === 429 || response.status === 402
        );
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new APIKeyError(
          'Invalid embedding response format from LLM API',
          'INVALID_EMBEDDING_RESPONSE',
          false
        );
      }

      return {
        embedding: data.data[0].embedding,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      
      throw new APIKeyError(
        `Embedding creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EMBEDDING_FAILED',
        true
      );
    }
  }

  /**
   * List available models
   */
  public async listModels(): Promise<string[]> {
    try {
      const response = await apiKeyManager.makeAuthenticatedRequest(
        `${this.baseUrl}/v1/models`
      );

      if (!response.ok) {
        throw new APIKeyError(
          `Failed to list models: ${response.status} ${response.statusText}`,
          'LIST_MODELS_FAILED',
          false
        );
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      
      throw new APIKeyError(
        `Model listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MODEL_LIST_FAILED',
        true
      );
    }
  }

  /**
   * Test connection to LLM endpoint
   */
  public async testConnection(): Promise<{
    isConnected: boolean;
    latency: number;
    availableModels: string[];
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const models = await this.listModels();
      const latency = Date.now() - startTime;
      
      return {
        isConnected: true,
        latency,
        availableModels: models
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        isConnected: false,
        latency,
        availableModels: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): LLMConfiguration {
    return { ...this.config };
  }

  /**
   * Update configuration (for testing or dynamic updates)
   */
  public updateConfig(newConfig: Partial<LLMConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.baseUrl) {
      this.baseUrl = newConfig.baseUrl;
    }
  }
}

// Export singleton instance
export const llmConnector = new LLMConnector();