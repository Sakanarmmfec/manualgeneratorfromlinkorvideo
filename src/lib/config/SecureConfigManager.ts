import { 
  SecureConfig, 
  LLMConfiguration, 
  ConfigValidationResult, 
  ConfigurationError,
  APIKeyError 
} from '@/types';

/**
 * SecureConfigManager handles secure loading and management of configuration
 * including API keys and sensitive settings from environment variables
 */
export class SecureConfigManager {
  private static instance: SecureConfigManager;
  private config: SecureConfig | null = null;
  private llmConfig: LLMConfiguration | null = null;

  private constructor() {}

  /**
   * Get singleton instance of SecureConfigManager
   */
  public static getInstance(): SecureConfigManager {
    if (!SecureConfigManager.instance) {
      SecureConfigManager.instance = new SecureConfigManager();
    }
    return SecureConfigManager.instance;
  }

  /**
   * Initialize configuration from environment variables
   */
  public async initialize(): Promise<void> {
    try {
      this.config = this.loadSecureConfig();
      this.llmConfig = this.loadLLMConfiguration();
      
      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        throw new ConfigurationError(
          `Configuration validation failed: ${validation.errors.join(', ')}`,
          'INVALID_CONFIG'
        );
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings:', validation.warnings);
      }

    } catch (error) {
      console.error('Failed to initialize SecureConfigManager:', error);
      throw error;
    }
  }

  /**
   * Load secure configuration from environment variables
   */
  private loadSecureConfig(): SecureConfig {
    // For development/demo purposes, provide defaults if env vars are missing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const llmApiKey = process.env.MFEC_LLM_API_KEY || (isDevelopment ? 'demo-api-key' : '');
    const encryptionKey = process.env.ENCRYPTION_KEY || (isDevelopment ? 'demo-encryption-key-32-characters-long' : '');
    
    if (!llmApiKey || !encryptionKey) {
      const missing = [];
      if (!llmApiKey) missing.push('MFEC_LLM_API_KEY');
      if (!encryptionKey) missing.push('ENCRYPTION_KEY');
      
      throw new ConfigurationError(
        `Missing required environment variables: ${missing.join(', ')}`,
        'MISSING_ENV_VARS'
      );
    }

    return {
      llmApiKey,
      encryptionKey,
      environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      allowUserApiKeys: process.env.ALLOW_USER_API_KEYS !== 'false', // Default to true
      userApiKey: undefined // Will be set dynamically when user provides key
    };
  }

  /**
   * Load LLM configuration from environment variables
   */
  private loadLLMConfiguration(): LLMConfiguration {
    return {
      baseUrl: process.env.MFEC_LLM_BASE_URL || 'https://gpt.mfec.co.th/litellm',
      apiKeyRef: 'MFEC_LLM_API_KEY', // Reference to env var, not actual key
      chatModel: process.env.MFEC_LLM_CHAT_MODEL || 'gpt-4o',
      embeddingModel: process.env.MFEC_LLM_EMBEDDING_MODEL || 'text-embedding-3-large',
      maxTokens: parseInt(process.env.MFEC_LLM_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.MFEC_LLM_TEMPERATURE || '0.7'),
      timeout: parseInt(process.env.MFEC_LLM_TIMEOUT || '30000')
    };
  }

  /**
   * Validate the loaded configuration
   */
  private validateConfiguration(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config || !this.llmConfig) {
      errors.push('Configuration not loaded');
      return { isValid: false, errors, warnings };
    }

    // Validate API key format (basic check)
    if (!this.config.llmApiKey || this.config.llmApiKey.length < 10) {
      errors.push('Invalid MFEC LLM API key format');
    }

    // Validate encryption key
    if (!this.config.encryptionKey || this.config.encryptionKey.length < 32) {
      errors.push('Encryption key must be at least 32 characters');
    }

    // Validate LLM configuration
    try {
      new URL(this.llmConfig.baseUrl);
    } catch {
      errors.push('Invalid LLM base URL format');
    }

    if (this.llmConfig.maxTokens <= 0 || this.llmConfig.maxTokens > 100000) {
      warnings.push('Max tokens value seems unusual');
    }

    if (this.llmConfig.temperature < 0 || this.llmConfig.temperature > 2) {
      warnings.push('Temperature value outside recommended range (0-2)');
    }

    // Environment-specific validations
    if (this.config.environment === 'production') {
      if (this.config.allowUserApiKeys) {
        warnings.push('User API keys are enabled in production');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get secure configuration (without sensitive data)
   */
  public getConfig(): Omit<SecureConfig, 'llmApiKey' | 'encryptionKey'> {
    if (!this.config) {
      throw new ConfigurationError('Configuration not initialized', 'NOT_INITIALIZED');
    }

    return {
      environment: this.config.environment,
      allowUserApiKeys: this.config.allowUserApiKeys,
      userApiKey: this.config.userApiKey ? '[REDACTED]' : undefined
    } as any;
  }

  /**
   * Get LLM configuration
   */
  public getLLMConfig(): LLMConfiguration {
    if (!this.llmConfig) {
      // Try to initialize if not already done
      try {
        this.config = this.loadSecureConfig();
        this.llmConfig = this.loadLLMConfiguration();
      } catch (error) {
        throw new ConfigurationError('LLM configuration not initialized and failed to auto-initialize', 'NOT_INITIALIZED');
      }
    }

    return { ...this.llmConfig };
  }

  /**
   * Get API key securely (for internal use only)
   */
  public getAPIKey(): string {
    if (!this.config) {
      // Try to initialize if not already done
      try {
        this.config = this.loadSecureConfig();
        this.llmConfig = this.loadLLMConfiguration();
      } catch (error) {
        throw new ConfigurationError('Configuration not initialized and failed to auto-initialize', 'NOT_INITIALIZED');
      }
    }

    // Return user API key if available and primary key is exhausted
    if (this.config.userApiKey) {
      return this.config.userApiKey;
    }

    return this.config.llmApiKey;
  }

  /**
   * Set user-provided API key (session-based, not persistent)
   */
  public setUserApiKey(apiKey: string): void {
    if (!this.config) {
      throw new ConfigurationError('Configuration not initialized', 'NOT_INITIALIZED');
    }

    if (!this.config.allowUserApiKeys) {
      throw new APIKeyError(
        'User-provided API keys are not allowed in this environment',
        'USER_KEYS_DISABLED',
        false
      );
    }

    // Basic validation
    if (!apiKey || apiKey.length < 10) {
      throw new APIKeyError(
        'Invalid API key format',
        'INVALID_KEY_FORMAT',
        true
      );
    }

    this.config.userApiKey = apiKey;
  }

  /**
   * Clear user-provided API key
   */
  public clearUserApiKey(): void {
    if (this.config) {
      this.config.userApiKey = undefined;
    }
  }

  /**
   * Check if user API keys are allowed
   */
  public isUserApiKeyAllowed(): boolean {
    return this.config?.allowUserApiKeys || false;
  }

  /**
   * Get current environment
   */
  public getEnvironment(): string {
    return this.config?.environment || 'development';
  }

  /**
   * Validate API key format (basic client-side validation)
   */
  public validateApiKeyFormat(apiKey: string): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
    } else if (apiKey.length < 10) {
      errors.push('API key appears to be too short');
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(apiKey)) {
      warnings.push('API key contains unusual characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Reset configuration (for testing purposes)
   */
  public reset(): void {
    this.config = null;
    this.llmConfig = null;
  }
}

// Export singleton instance
export const secureConfigManager = SecureConfigManager.getInstance();