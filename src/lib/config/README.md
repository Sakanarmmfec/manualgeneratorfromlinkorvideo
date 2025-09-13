# Secure Configuration and API Key Management

This module provides secure configuration management and API key handling for the Thai Document Generator application, with support for MFEC's LiteLLM endpoint.

## Features

- ✅ Secure environment variable handling
- ✅ API key validation and testing
- ✅ Automatic fallback to user-provided API keys
- ✅ Configuration validation and health monitoring
- ✅ Session-based user API key storage (not persistent)
- ✅ Comprehensive error handling and recovery
- ✅ TypeScript support with full type safety

## Quick Start

### 1. Environment Setup

Create a `.env` file with the required configuration:

```env
# Required
MFEC_LLM_API_KEY=your_mfec_api_key_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Optional (with defaults)
MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
MFEC_LLM_CHAT_MODEL=gpt-4o
MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large
MFEC_LLM_MAX_TOKENS=4000
MFEC_LLM_TEMPERATURE=0.7
MFEC_LLM_TIMEOUT=30000

# Security
ALLOW_USER_API_KEYS=true
NODE_ENV=development
```

### 2. Initialize Configuration

```typescript
import { initializeConfiguration } from '@/lib/config';

async function setup() {
  try {
    await initializeConfiguration();
    console.log('Configuration initialized successfully');
  } catch (error) {
    console.error('Configuration failed:', error);
  }
}
```

### 3. Make Authenticated Requests

```typescript
import { apiKeyManager } from '@/lib/config';

async function callLLM() {
  try {
    const response = await apiKeyManager.makeAuthenticatedRequest(
      'https://gpt.mfec.co.th/litellm/v1/chat/completions',
      {
        method: 'POST',
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello!' }]
        })
      }
    );
    
    const data = await response.json();
    console.log('LLM Response:', data);
  } catch (error) {
    console.error('LLM request failed:', error);
  }
}
```

## Core Components

### SecureConfigManager

Handles secure loading and management of configuration from environment variables.

```typescript
import { secureConfigManager } from '@/lib/config';

// Get configuration (without sensitive data)
const config = secureConfigManager.getConfig();

// Get LLM configuration
const llmConfig = secureConfigManager.getLLMConfig();

// Check if user API keys are allowed
const canUseUserKeys = secureConfigManager.isUserApiKeyAllowed();
```

### APIKeyManager

Manages API key lifecycle, validation, and fallback mechanisms.

```typescript
import { apiKeyManager } from '@/lib/config';

// Get current key status
const status = apiKeyManager.getKeyStatus();

// Set user fallback key
apiKeyManager.setFallbackKey('user-provided-key');

// Test configuration
const testResult = await apiKeyManager.testConfiguration();

// Make authenticated request with automatic key management
const response = await apiKeyManager.makeAuthenticatedRequest(url, options);
```

### ConfigValidator

Provides comprehensive validation for configuration settings.

```typescript
import { ConfigValidator } from '@/lib/config';

// Validate environment variables
const envValidation = ConfigValidator.validateEnvironmentVariables();

// Validate API key format
const keyValidation = ConfigValidator.validateApiKey('your-key');

// Get complete configuration health
const health = ConfigValidator.getConfigurationHealth();
```

## Error Handling

The system provides specific error types for different scenarios:

### ConfigurationError

Thrown when configuration is invalid or missing:

```typescript
try {
  await initializeConfiguration();
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Config error:', error.message, 'Code:', error.code);
  }
}
```

### APIKeyError

Thrown when API key operations fail:

```typescript
try {
  await apiKeyManager.makeAuthenticatedRequest(url);
} catch (error) {
  if (error instanceof APIKeyError) {
    console.error('API key error:', error.message);
    
    if (error.isRecoverable) {
      // Handle recoverable errors (e.g., prompt for user key)
      console.log('This error can be recovered from');
    }
  }
}
```

## User API Key Fallback

When the primary API key is exhausted, users can provide their own key:

### Backend Implementation

```typescript
// API route: /api/config/user-key
import { apiKeyManager } from '@/lib/config';

export async function POST(request: NextRequest) {
  const { apiKey } = await request.json();
  
  try {
    apiKeyManager.setFallbackKey(apiKey);
    const isValid = await apiKeyManager.validateKey(apiKey);
    
    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Frontend Implementation

```typescript
import { UserApiKeyInput } from '@/components/config/UserApiKeyInput';

function MyComponent() {
  const [showKeyInput, setShowKeyInput] = useState(false);
  
  const handleApiKeySubmit = async (keyData: UserApiKeyInput) => {
    const response = await fetch('/api/config/user-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keyData)
    });
    
    if (response.ok) {
      setShowKeyInput(false);
      // Continue with operations
    }
  };
  
  return (
    <UserApiKeyInput
      isVisible={showKeyInput}
      onApiKeySubmit={handleApiKeySubmit}
      onCancel={() => setShowKeyInput(false)}
    />
  );
}
```

## Configuration Health Monitoring

Monitor configuration health in real-time:

```typescript
import { ConfigurationStatus } from '@/components/config/ConfigurationStatus';

function AdminPanel() {
  return (
    <div>
      <h2>System Status</h2>
      <ConfigurationStatus onRefresh={() => window.location.reload()} />
    </div>
  );
}
```

## Security Best Practices

### Environment Variables
- Store API keys in environment variables, never in code
- Use `.env.local` for local development (excluded from git)
- Use secure key management services in production

### API Key Handling
- User-provided keys are stored in memory only (session-based)
- Keys are never logged or exposed in client-side code
- Automatic key validation before use

### Configuration Validation
- Comprehensive validation on startup
- Runtime health monitoring
- Graceful error handling and recovery

## Testing

Run the configuration tests:

```bash
npm test -- src/lib/config
```

The test suite covers:
- Configuration initialization and validation
- API key management and fallback mechanisms
- Error handling scenarios
- Security features

## API Reference

### Types

```typescript
interface LLMConfiguration {
  baseUrl: string;
  apiKeyRef: string;
  chatModel: string;
  embeddingModel: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface UserApiKeyInput {
  apiKey: string;
  isTemporary: boolean;
}
```

### Functions

```typescript
// Initialize the configuration system
async function initializeConfiguration(): Promise<void>

// Get configuration health status
function getConfigurationHealth(): ConfigurationHealth

// Validate API key format
function validateApiKey(key: string): ConfigValidationResult
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing required environment variables: MFEC_LLM_API_KEY
   ```
   Solution: Ensure all required environment variables are set in your `.env` file.

2. **Invalid API Key**
   ```
   Error: API key validation failed
   ```
   Solution: Check that your MFEC API key is correct and has sufficient quota.

3. **Configuration Validation Failed**
   ```
   Error: Configuration validation failed: Invalid LLM base URL format
   ```
   Solution: Ensure the MFEC_LLM_BASE_URL is a valid URL format.

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed logging for configuration initialization and API key operations.