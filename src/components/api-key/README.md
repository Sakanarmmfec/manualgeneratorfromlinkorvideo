# API Key Management System

The API Key Management System provides a comprehensive solution for handling MFEC LiteLLM API keys with automatic fallback support and user-provided key management.

## Components

### UserApiKeyInput
A form component for collecting and validating user-provided API keys.

**Features:**
- Secure API key input with show/hide toggle
- Real-time validation and error handling
- Clear instructions for obtaining API keys
- Security notices and session-based storage information
- Integration with MFEC LiteLLM Portal

**Usage:**
```tsx
import { UserApiKeyInput } from '@/components/api-key';

function MyComponent() {
  const handleApiKeySubmit = async (apiKey: string) => {
    // Validate and set the API key
    console.log('API Key submitted:', apiKey);
  };

  return (
    <UserApiKeyInput
      onApiKeySubmit={handleApiKeySubmit}
      isValidating={false}
      showInstructions={true}
    />
  );
}
```

### ApiKeyStatus
A status display component showing current API key information and management options.

**Features:**
- Real-time status display (active, exhausted, invalid, testing)
- Key type indication (primary vs fallback)
- Management actions (test, clear fallback, switch to primary)
- Fallback availability information

**Usage:**
```tsx
import { ApiKeyStatus } from '@/components/api-key';

function MyComponent() {
  const handleTestKey = async () => {
    // Test current API key
  };

  const handleClearFallback = () => {
    // Clear fallback key
  };

  return (
    <ApiKeyStatus
      status="active"
      currentKeyType="primary"
      hasFallback={false}
      canUseFallback={true}
      onTestKey={handleTestKey}
      onClearFallback={handleClearFallback}
    />
  );
}
```

### ApiKeyManager
A comprehensive component that combines status display and key input functionality.

**Features:**
- Automatic status monitoring
- Integrated key validation and management
- Error handling and user feedback
- Seamless integration with backend API key manager

**Usage:**
```tsx
import { ApiKeyManager } from '@/components/api-key';

function MyComponent() {
  const handleApiKeyUpdated = (hasValidKey: boolean) => {
    console.log('API key updated:', hasValidKey);
  };

  return (
    <ApiKeyManager
      onApiKeyUpdated={handleApiKeyUpdated}
      showStatus={true}
    />
  );
}
```

## Hooks

### useApiKeyManager
A React hook for managing API key state and operations.

**Features:**
- Reactive API key state management
- Key validation and testing
- Fallback key management
- Error handling and status updates

**Usage:**
```tsx
import { useApiKeyManager } from '@/hooks/useApiKeyManager';

function MyComponent() {
  const {
    keyState,
    validateAndSetKey,
    testCurrentKey,
    clearFallbackKey,
    switchToPrimary,
    refreshStatus,
    handleApiKeyExhaustion
  } = useApiKeyManager();

  const handleSetKey = async (apiKey: string) => {
    const success = await validateAndSetKey(apiKey);
    if (success) {
      console.log('API key set successfully');
    }
  };

  return (
    <div>
      <p>Status: {keyState.status}</p>
      <p>Key Type: {keyState.currentKeyType}</p>
      <button onClick={() => testCurrentKey()}>Test Key</button>
    </div>
  );
}
```

## Context

### ApiKeyContext
A React context for sharing API key state across the application.

**Features:**
- Global API key state management
- Automatic status updates
- Higher-order component for key requirements
- Computed properties for common use cases

**Usage:**
```tsx
import { ApiKeyProvider, useApiKeyContext, withApiKeyRequired } from '@/contexts/ApiKeyContext';

// Wrap your app with the provider
function App() {
  return (
    <ApiKeyProvider>
      <MyComponent />
    </ApiKeyProvider>
  );
}

// Use the context in components
function MyComponent() {
  const { keyState, isKeyValid, requiresUserKey } = useApiKeyContext();
  
  return (
    <div>
      {isKeyValid ? 'Key is valid' : 'Key is invalid'}
      {requiresUserKey && 'User key required'}
    </div>
  );
}

// Protect components that require valid API keys
const ProtectedComponent = withApiKeyRequired(function MyProtectedComponent() {
  return <div>This component requires a valid API key</div>;
});
```

## Integration with Backend

The components integrate seamlessly with the backend API key management system:

### APIKeyManager (Backend)
- Handles primary and fallback key management
- Provides key validation and testing
- Manages automatic fallback switching
- Handles key exhaustion scenarios

### SecureConfigManager (Backend)
- Manages secure configuration loading
- Handles environment variable management
- Provides session-based user key storage
- Validates configuration and key formats

## Security Features

### Session-Based Storage
- User-provided API keys are stored only in memory
- No persistent storage of sensitive information
- Automatic cleanup on session end

### Secure Communication
- All API communications use HTTPS
- API keys are transmitted securely
- No logging of sensitive information

### Validation and Testing
- Real-time API key validation
- Connection testing before usage
- Format validation and error handling

## Error Handling

### Graceful Degradation
- Clear error messages for different failure scenarios
- Fallback options when primary keys fail
- Recovery mechanisms for temporary failures

### User Guidance
- Step-by-step instructions for obtaining API keys
- Links to MFEC LiteLLM Portal
- Security notices and best practices

## Best Practices

### Component Usage
1. Use `ApiKeyManager` for complete key management functionality
2. Use `UserApiKeyInput` for custom key input scenarios
3. Use `ApiKeyStatus` for status-only displays
4. Wrap your app with `ApiKeyProvider` for global state management

### Error Handling
1. Always handle validation errors gracefully
2. Provide clear user feedback for all error scenarios
3. Implement retry mechanisms for transient failures
4. Log errors appropriately without exposing sensitive data

### Security
1. Never store API keys persistently on the client
2. Use session-based storage only
3. Validate keys before usage
4. Provide clear security notices to users

### Performance
1. Use context for global state management
2. Implement proper loading states
3. Avoid unnecessary re-renders with proper memoization
4. Handle async operations appropriately

## Testing

The API key management system includes comprehensive test coverage:

```bash
# Run API key component tests
npm test src/components/api-key/

# Run hook tests
npm test src/hooks/useApiKeyManager.test.ts

# Run context tests
npm test src/contexts/ApiKeyContext.test.tsx
```

## Configuration

### Environment Variables
```env
# Required for API key management
MFEC_LLM_API_KEY=your-primary-api-key
ALLOW_USER_API_KEYS=true
ENCRYPTION_KEY=your-encryption-key-32-chars-min
```

### Component Props
Most components accept optional configuration props for customization:

- `className`: Custom CSS classes
- `showInstructions`: Show/hide instruction text
- `onApiKeyUpdated`: Callback for key updates
- `autoManage`: Enable automatic context management

## Migration Guide

### From Legacy ApiKeyModal
The enhanced `ApiKeyModal` is backward compatible but offers new features:

```tsx
// Old usage (still works)
<ApiKeyModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  isValidating={isValidating}
  validationError={error}
/>

// New usage with automatic management
<ApiKeyModal
  isOpen={isOpen}
  onClose={onClose}
  autoManage={true} // Uses context for automatic management
/>
```

### Integration Steps
1. Wrap your app with `ApiKeyProvider`
2. Replace manual key management with context usage
3. Update error handling to use new error types
4. Test all key management scenarios