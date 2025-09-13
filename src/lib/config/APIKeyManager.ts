import { APIKeyManager as IAPIKeyManager, APIKeyError, LLMConfiguration } from '@/types';
import { secureConfigManager } from './SecureConfigManager';

/**
 * APIKeyManager handles API key lifecycle, validation, and fallback mechanisms
 */
export class APIKeyManager implements IAPIKeyManager {
  public primaryKey: string;
  public fallbackKey?: string;
  public keyStatus: 'active' | 'exhausted' | 'invalid' | 'testing' = 'active';
  
  private llmConfig: LLMConfiguration;
  private currentKeyType: 'primary' | 'fallback' = 'primary';

  constructor() {
    this.llmConfig = secureConfigManager.getLLMConfig();
    this.primaryKey = secureConfigManager.getAPIKey();
  }

  /**
   * Validate an API key by making a test request to the LLM endpoint
   */
  public async validateKey(key: string): Promise<boolean> {
    try {
      this.keyStatus = 'testing';
      
      const response = await fetch(`${this.llmConfig.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.llmConfig.timeout)
      });

      const isValid = response.ok;
      
      if (isValid) {
        this.keyStatus = 'active';
      } else {
        this.keyStatus = 'invalid';
        console.warn('API key validation failed:', response.status, response.statusText);
      }

      return isValid;
    } catch (error) {
      this.keyStatus = 'invalid';
      console.error('API key validation error:', error);
      return false;
    }
  }

  /**
   * Switch to fallback API key when primary is exhausted
   */
  public switchToFallback(): void {
    if (!this.fallbackKey) {
      throw new APIKeyError(
        'No fallback API key available',
        'NO_FALLBACK_KEY',
        true
      );
    }

    this.currentKeyType = 'fallback';
    this.keyStatus = 'active';
    
    console.info('Switched to fallback API key');
  }

  /**
   * Reset to primary API key
   */
  public resetToPrimary(): void {
    this.currentKeyType = 'primary';
    this.keyStatus = 'active';
    
    console.info('Reset to primary API key');
  }

  /**
   * Get the currently active API key
   */
  public getCurrentKey(): string | null {
    if (this.keyStatus === 'invalid') {
      return null;
    }

    if (this.currentKeyType === 'fallback' && this.fallbackKey) {
      return this.fallbackKey;
    }

    return this.primaryKey;
  }

  /**
   * Set fallback API key (user-provided)
   */
  public setFallbackKey(key: string): void {
    if (!secureConfigManager.isUserApiKeyAllowed()) {
      throw new APIKeyError(
        'User-provided API keys are not allowed',
        'USER_KEYS_DISABLED',
        false
      );
    }

    this.fallbackKey = key;
    secureConfigManager.setUserApiKey(key);
  }

  /**
   * Clear fallback API key
   */
  public clearFallbackKey(): void {
    this.fallbackKey = undefined;
    secureConfigManager.clearUserApiKey();
    
    if (this.currentKeyType === 'fallback') {
      this.resetToPrimary();
    }
  }

  /**
   * Handle API key exhaustion scenario
   */
  public async handleKeyExhaustion(): Promise<void> {
    this.keyStatus = 'exhausted';
    
    // Try to switch to fallback if available
    if (this.fallbackKey) {
      const isValid = await this.validateKey(this.fallbackKey);
      if (isValid) {
        this.switchToFallback();
        return;
      }
    }

    // If no valid fallback, throw error requiring user intervention
    throw new APIKeyError(
      'Primary API key exhausted and no valid fallback available',
      'KEY_EXHAUSTED',
      true
    );
  }

  /**
   * Make an authenticated request with automatic key management
   */
  public async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const currentKey = this.getCurrentKey();
    
    if (!currentKey) {
      throw new APIKeyError(
        'No valid API key available',
        'NO_VALID_KEY',
        true
      );
    }

    const headers = {
      'Authorization': `Bearer ${currentKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || AbortSignal.timeout(this.llmConfig.timeout)
      });

      // Handle rate limiting or quota exceeded
      if (response.status === 429 || response.status === 402) {
        await this.handleKeyExhaustion();
        
        // Retry with new key if available
        const newKey = this.getCurrentKey();
        if (newKey && newKey !== currentKey) {
          return this.makeAuthenticatedRequest(url, options);
        }
      }

      // Handle unauthorized (invalid key)
      if (response.status === 401) {
        this.keyStatus = 'invalid';
        throw new APIKeyError(
          'API key is invalid or expired',
          'INVALID_KEY',
          true
        );
      }

      return response;
    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      
      throw new APIKeyError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REQUEST_FAILED',
        true
      );
    }
  }

  /**
   * Get key status information
   */
  public getKeyStatus(): {
    status: string;
    currentKeyType: string;
    hasFallback: boolean;
    canUseFallback: boolean;
  } {
    return {
      status: this.keyStatus,
      currentKeyType: this.currentKeyType,
      hasFallback: !!this.fallbackKey,
      canUseFallback: secureConfigManager.isUserApiKeyAllowed()
    };
  }

  /**
   * Test current configuration
   */
  public async testConfiguration(): Promise<{
    isValid: boolean;
    keyType: string;
    error?: string;
  }> {
    const currentKey = this.getCurrentKey();
    
    if (!currentKey) {
      return {
        isValid: false,
        keyType: 'none',
        error: 'No API key available'
      };
    }

    try {
      const isValid = await this.validateKey(currentKey);
      return {
        isValid,
        keyType: this.currentKeyType,
        error: isValid ? undefined : 'Key validation failed'
      };
    } catch (error) {
      return {
        isValid: false,
        keyType: this.currentKeyType,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const apiKeyManager = new APIKeyManager();