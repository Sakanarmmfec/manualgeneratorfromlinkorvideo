import { ConfigValidationResult, LLMConfiguration, SecureConfig } from '@/types';

/**
 * ConfigValidator provides comprehensive validation for configuration settings
 */
export class ConfigValidator {
  
  /**
   * Validate environment variables are properly set
   */
  public static validateEnvironmentVariables(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required environment variables
    const required = [
      'MFEC_LLM_API_KEY',
      'ENCRYPTION_KEY'
    ];

    // Optional but recommended
    const recommended = [
      'MFEC_LLM_BASE_URL',
      'MFEC_LLM_CHAT_MODEL',
      'MFEC_LLM_EMBEDDING_MODEL'
    ];

    // Check required variables
    for (const envVar of required) {
      if (!process.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      } else if (process.env[envVar]!.length < 8) {
        errors.push(`Environment variable ${envVar} appears to be too short`);
      }
    }

    // Check recommended variables
    for (const envVar of recommended) {
      if (!process.env[envVar]) {
        warnings.push(`Missing recommended environment variable: ${envVar} (using default)`);
      }
    }

    // Validate specific formats
    if (process.env.MFEC_LLM_BASE_URL) {
      try {
        new URL(process.env.MFEC_LLM_BASE_URL);
      } catch {
        errors.push('MFEC_LLM_BASE_URL is not a valid URL');
      }
    }

    // Validate numeric values
    if (process.env.MFEC_LLM_MAX_TOKENS) {
      const maxTokens = parseInt(process.env.MFEC_LLM_MAX_TOKENS);
      if (isNaN(maxTokens) || maxTokens <= 0) {
        errors.push('MFEC_LLM_MAX_TOKENS must be a positive number');
      } else if (maxTokens > 100000) {
        warnings.push('MFEC_LLM_MAX_TOKENS is very high, this may cause issues');
      }
    }

    if (process.env.MFEC_LLM_TEMPERATURE) {
      const temperature = parseFloat(process.env.MFEC_LLM_TEMPERATURE);
      if (isNaN(temperature) || temperature < 0 || temperature > 2) {
        errors.push('MFEC_LLM_TEMPERATURE must be a number between 0 and 2');
      }
    }

    if (process.env.MFEC_LLM_TIMEOUT) {
      const timeout = parseInt(process.env.MFEC_LLM_TIMEOUT);
      if (isNaN(timeout) || timeout <= 0) {
        errors.push('MFEC_LLM_TIMEOUT must be a positive number');
      } else if (timeout < 5000) {
        warnings.push('MFEC_LLM_TIMEOUT is very low, requests may timeout frequently');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate LLM configuration object
   */
  public static validateLLMConfiguration(config: LLMConfiguration): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate base URL
    try {
      const url = new URL(config.baseUrl);
      if (!url.protocol.startsWith('http')) {
        errors.push('LLM base URL must use HTTP or HTTPS protocol');
      }
    } catch {
      errors.push('Invalid LLM base URL format');
    }

    // Validate models
    if (!config.chatModel || config.chatModel.trim().length === 0) {
      errors.push('Chat model is required');
    }

    if (!config.embeddingModel || config.embeddingModel.trim().length === 0) {
      errors.push('Embedding model is required');
    }

    // Validate numeric values
    if (config.maxTokens <= 0) {
      errors.push('Max tokens must be greater than 0');
    } else if (config.maxTokens > 100000) {
      warnings.push('Max tokens is very high');
    }

    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (config.timeout <= 0) {
      errors.push('Timeout must be greater than 0');
    } else if (config.timeout < 5000) {
      warnings.push('Timeout is very low, requests may fail frequently');
    } else if (config.timeout > 300000) {
      warnings.push('Timeout is very high, this may cause poor user experience');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate API key format and basic structure
   */
  public static validateApiKey(apiKey: string): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
      return { isValid: false, errors, warnings };
    }

    // Basic length check
    if (apiKey.length < 10) {
      errors.push('API key appears to be too short');
    } else if (apiKey.length > 200) {
      warnings.push('API key is unusually long');
    }

    // Character validation
    if (!/^[a-zA-Z0-9\-_.]+$/.test(apiKey)) {
      warnings.push('API key contains unusual characters');
    }

    // Common patterns that might indicate test/placeholder keys
    const testPatterns = [
      /^test/i,
      /^demo/i,
      /^placeholder/i,
      /^your.*key/i,
      /^sk-[0-9]+$/,
      /^[0-9]+$/
    ];

    for (const pattern of testPatterns) {
      if (pattern.test(apiKey)) {
        warnings.push('API key appears to be a test or placeholder value');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate complete configuration setup
   */
  public static validateCompleteConfiguration(): ConfigValidationResult {
    const envValidation = this.validateEnvironmentVariables();
    
    if (!envValidation.isValid) {
      return envValidation;
    }

    // If environment is valid, validate the actual configuration objects
    try {
      const apiKeyValidation = this.validateApiKey(process.env.MFEC_LLM_API_KEY!);
      
      const llmConfig: LLMConfiguration = {
        baseUrl: process.env.MFEC_LLM_BASE_URL || 'https://gpt.mfec.co.th/litellm',
        apiKeyRef: 'MFEC_LLM_API_KEY',
        chatModel: process.env.MFEC_LLM_CHAT_MODEL || 'gpt-4o',
        embeddingModel: process.env.MFEC_LLM_EMBEDDING_MODEL || 'text-embedding-3-large',
        maxTokens: parseInt(process.env.MFEC_LLM_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.MFEC_LLM_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.MFEC_LLM_TIMEOUT || '30000')
      };

      const llmValidation = this.validateLLMConfiguration(llmConfig);

      // Combine all validation results
      const allErrors = [
        ...envValidation.errors,
        ...apiKeyValidation.errors,
        ...llmValidation.errors
      ];

      const allWarnings = [
        ...envValidation.warnings,
        ...apiKeyValidation.warnings,
        ...llmValidation.warnings
      ];

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Get configuration health status
   */
  public static getConfigurationHealth(): {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details: ConfigValidationResult;
  } {
    const validation = this.validateCompleteConfiguration();

    if (!validation.isValid) {
      return {
        status: 'error',
        message: `Configuration has ${validation.errors.length} error(s)`,
        details: validation
      };
    }

    if (validation.warnings.length > 0) {
      return {
        status: 'warning',
        message: `Configuration has ${validation.warnings.length} warning(s)`,
        details: validation
      };
    }

    return {
      status: 'healthy',
      message: 'Configuration is valid',
      details: validation
    };
  }
}

export default ConfigValidator;