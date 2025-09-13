/**
 * Example usage of the secure configuration and API key management system
 * This file demonstrates how to properly initialize and use the configuration system
 */

import { 
  initializeConfiguration, 
  secureConfigManager, 
  apiKeyManager, 
  getConfigurationHealth 
} from './index';
import { APIKeyError } from '@/types';

/**
 * Example: Initialize the configuration system
 */
export async function exampleInitialization() {
  try {
    console.log('Initializing configuration system...');
    
    // Initialize the configuration system
    await initializeConfiguration();
    
    // Check configuration health
    const health = getConfigurationHealth();
    console.log('Configuration health:', health);
    
    // Get LLM configuration (safe to log)
    const llmConfig = secureConfigManager.getLLMConfig();
    console.log('LLM Configuration:', {
      baseUrl: llmConfig.baseUrl,
      chatModel: llmConfig.chatModel,
      embeddingModel: llmConfig.embeddingModel,
      maxTokens: llmConfig.maxTokens,
      temperature: llmConfig.temperature
    });
    
    console.log('Configuration initialized successfully!');
    
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    throw error;
  }
}

/**
 * Example: Making an authenticated API request
 */
export async function exampleApiRequest() {
  try {
    console.log('Making authenticated API request...');
    
    // Make an authenticated request to list available models
    const response = await apiKeyManager.makeAuthenticatedRequest(
      'https://gpt.mfec.co.th/litellm/v1/models'
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('Available models:', data);
    } else {
      console.error('API request failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    if (error instanceof APIKeyError) {
      console.error('API Key Error:', error.message, 'Code:', error.code);
      
      if (error.isRecoverable) {
        console.log('This error is recoverable. Consider providing a fallback API key.');
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example: Handling API key exhaustion with user fallback
 */
export async function exampleHandleKeyExhaustion(userApiKey: string) {
  try {
    console.log('Handling API key exhaustion...');
    
    // Check if user API keys are allowed
    if (!secureConfigManager.isUserApiKeyAllowed()) {
      throw new Error('User API keys are not allowed in this environment');
    }
    
    // Validate the user-provided key format
    const validation = secureConfigManager.validateApiKeyFormat(userApiKey);
    if (!validation.isValid) {
      throw new Error(`Invalid API key format: ${validation.errors.join(', ')}`);
    }
    
    // Set the fallback key
    apiKeyManager.setFallbackKey(userApiKey);
    
    // Test the fallback key
    const isValid = await apiKeyManager.validateKey(userApiKey);
    if (!isValid) {
      apiKeyManager.clearFallbackKey();
      throw new Error('User API key validation failed');
    }
    
    // Switch to fallback
    apiKeyManager.switchToFallback();
    
    console.log('Successfully switched to user-provided API key');
    
    // Get updated status
    const status = apiKeyManager.getKeyStatus();
    console.log('Key status:', status);
    
  } catch (error) {
    console.error('Failed to handle key exhaustion:', error);
    throw error;
  }
}

/**
 * Example: Configuration validation and health monitoring
 */
export async function exampleHealthMonitoring() {
  try {
    console.log('Monitoring configuration health...');
    
    // Check overall configuration health
    const health = getConfigurationHealth();
    console.log('Configuration Health:', health.status, '-', health.message);
    
    if (health.details.warnings.length > 0) {
      console.warn('Configuration warnings:', health.details.warnings);
    }
    
    if (health.details.errors.length > 0) {
      console.error('Configuration errors:', health.details.errors);
    }
    
    // Test current API key configuration
    const configTest = await apiKeyManager.testConfiguration();
    console.log('API Key Test:', configTest);
    
    // Get detailed key status
    const keyStatus = apiKeyManager.getKeyStatus();
    console.log('Key Status:', keyStatus);
    
    return {
      configHealth: health,
      keyTest: configTest,
      keyStatus
    };
    
  } catch (error) {
    console.error('Health monitoring failed:', error);
    throw error;
  }
}

/**
 * Example: Complete workflow demonstration
 */
export async function exampleCompleteWorkflow() {
  console.log('=== Configuration System Demo ===');
  
  try {
    // Step 1: Initialize
    await exampleInitialization();
    
    // Step 2: Health check
    await exampleHealthMonitoring();
    
    // Step 3: Make API request
    await exampleApiRequest();
    
    console.log('=== Demo completed successfully ===');
    
  } catch (error) {
    console.error('=== Demo failed ===', error);
    
    // If it's an API key issue, demonstrate fallback handling
    if (error instanceof APIKeyError && error.code === 'KEY_EXHAUSTED') {
      console.log('Demonstrating fallback key handling...');
      
      // In a real application, you would prompt the user for their API key
      const mockUserKey = 'user-provided-api-key-example';
      
      try {
        await exampleHandleKeyExhaustion(mockUserKey);
        console.log('Fallback handling demonstration completed');
      } catch (fallbackError) {
        console.error('Fallback handling failed:', fallbackError);
      }
    }
  }
}

// Export for use in other parts of the application
export {
  initializeConfiguration,
  secureConfigManager,
  apiKeyManager,
  getConfigurationHealth
};