# Error Handling and User Feedback Components

This directory contains comprehensive error handling and user feedback components for the Thai Document Generator application.

## Components Overview

### 1. ErrorMessage
A flexible component for displaying error messages with different severity levels.

**Features:**
- Multiple severity levels (error, warning, info)
- Dismissible messages
- Custom icons and styling
- Support for additional content/actions

**Usage:**
```tsx
<ErrorMessage
  title="Connection Error"
  message="Unable to connect to server"
  severity="error"
  dismissible
  onDismiss={() => console.log('dismissed')}
/>
```

### 2. RetryInterface
Provides retry functionality with progress tracking and recovery options.

**Features:**
- Retry with attempt counting
- Maximum retry limits
- Settings/configuration access
- Cancel functionality
- Loading states

**Usage:**
```tsx
<RetryInterface
  error="Failed to fetch data from URL"
  onRetry={handleRetry}
  onCancel={handleCancel}
  onSettings={openSettings}
  retryCount={2}
  maxRetries={3}
  isRetrying={false}
  showSettings={true}
/>
```

### 3. FallbackForm
Manual content input form when automatic extraction fails.

**Features:**
- Complete form validation
- File upload support (.txt files)
- Document type selection
- Language detection
- Rich text input with character counting

**Usage:**
```tsx
<FallbackForm
  onSubmit={handleManualSubmit}
  onCancel={handleCancel}
  isSubmitting={false}
  initialData={{ title: 'Product Manual' }}
/>
```

### 4. ApiKeyModal
Modal for API key input when tokens are exhausted.

**Features:**
- Secure API key input with show/hide toggle
- Real-time validation
- Instructions and help links
- Security notices
- Session-only storage warnings

**Usage:**
```tsx
<ApiKeyModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={handleApiKeySubmit}
  isValidating={validating}
  validationError={error}
/>
```

### 5. HelpTooltip
Contextual help tooltips with flexible positioning.

**Features:**
- Hover and click triggers
- Auto-positioning (viewport aware)
- Multiple sizes
- Rich content support
- Keyboard navigation (ESC to close)

**Usage:**
```tsx
<HelpTooltip
  content="This field accepts product URLs or YouTube video links"
  title="URL Input Help"
  trigger="hover"
  position="top"
  size="md"
/>
```

### 6. UserGuidance
Comprehensive user guidance with step-by-step instructions.

**Features:**
- Interactive step-by-step guide
- Current step highlighting
- Expandable tips and tricks
- Common issues and solutions
- Progress tracking integration

**Usage:**
```tsx
<UserGuidance currentStep="input" />
```

## Integration Examples

### Error Boundary Integration
```tsx
function DocumentGenerator() {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const handleError = (err) => {
    setError(err.message);
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Retry logic
  };
  
  if (error) {
    return (
      <RetryInterface
        error={error}
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={3}
      />
    );
  }
  
  return <DocumentGenerationForm />;
}
```

### API Key Management
```tsx
function ApiKeyManager() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  
  const handleTokenExhaustion = () => {
    setShowApiKeyModal(true);
  };
  
  const handleApiKeySubmit = async (apiKey) => {
    try {
      await validateApiKey(apiKey);
      setShowApiKeyModal(false);
    } catch (error) {
      setApiKeyError(error.message);
    }
  };
  
  return (
    <ApiKeyModal
      isOpen={showApiKeyModal}
      onClose={() => setShowApiKeyModal(false)}
      onSubmit={handleApiKeySubmit}
      validationError={apiKeyError}
    />
  );
}
```

### Fallback Content Input
```tsx
function ContentExtractor({ url }) {
  const [showFallback, setShowFallback] = useState(false);
  const [extractionError, setExtractionError] = useState('');
  
  const handleExtractionFailure = (error) => {
    setExtractionError(error.message);
    setShowFallback(true);
  };
  
  const handleManualSubmit = (data) => {
    // Process manual content
    setShowFallback(false);
  };
  
  if (showFallback) {
    return (
      <FallbackForm
        onSubmit={handleManualSubmit}
        onCancel={() => setShowFallback(false)}
        error={extractionError}
      />
    );
  }
  
  return <AutomaticExtractor url={url} onError={handleExtractionFailure} />;
}
```

## Styling and Theming

All components use Tailwind CSS classes and follow the application's design system:

- **Colors**: Primary (blue), Error (red), Warning (yellow), Success (green)
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standard padding and margin scales
- **Borders**: Rounded corners and consistent border styles
- **Shadows**: Subtle shadows for depth

## Accessibility Features

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Focus Management**: Proper focus handling in modals
- **Color Contrast**: WCAG compliant color combinations

## Testing

Each component includes comprehensive tests covering:

- **Unit Tests**: Component rendering and prop handling
- **Integration Tests**: User interactions and state changes
- **Accessibility Tests**: ARIA attributes and keyboard navigation
- **Visual Tests**: Responsive design and styling

## Requirements Mapping

This implementation addresses the following requirements:

- **6.3**: Error handling for various URL formats and sources
- **9.4**: API key fallback system and user feedback
- **All UI Requirements**: Clear error messages and user guidance throughout the interface

## Demo

See `ErrorDemo.tsx` for a comprehensive demonstration of all error handling components and their interactions.