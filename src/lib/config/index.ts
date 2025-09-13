import { ConfigValidator } from './ConfigValidator';
import { secureConfigManager } from './SecureConfigManager';

// Configuration module exports
export { SecureConfigManager, secureConfigManager } from './SecureConfigManager';
export { APIKeyManager, apiKeyManager } from './APIKeyManager';
export { ConfigValidator } from './ConfigValidator';

// Initialize configuration system
export async function initializeConfiguration(): Promise<void> {
  try {
    // Validate environment first
    const envValidation = ConfigValidator.validateCompleteConfiguration();
    
    if (!envValidation.isValid) {
      console.error('Configuration validation failed:', envValidation.errors);
      throw new Error(`Configuration validation failed: ${envValidation.errors.join(', ')}`);
    }

    if (envValidation.warnings.length > 0) {
      console.warn('Configuration warnings:', envValidation.warnings);
    }

    // Initialize secure config manager
    await secureConfigManager.initialize();
    
    console.info('Configuration system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize configuration system:', error);
    throw error;
  }
}

// Configuration health check
export function getConfigurationHealth() {
  return ConfigValidator.getConfigurationHealth();
}

// Re-export types for convenience
export type {
  LLMConfiguration,
  SecureConfig,
  APIKeyManager as IAPIKeyManager,
  ConfigValidationResult,
  UserApiKeyInput,
  ConfigurationError,
  APIKeyError
} from '@/types';