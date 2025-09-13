# Progress Tracking Components

This directory contains a comprehensive set of components for tracking and displaying progress during document generation processes.

## Components

### ProgressBar
A visual progress indicator that shows step-by-step progress with detailed status information.

**Features:**
- Step-by-step progress visualization
- Status indicators (pending, in_progress, completed, failed)
- Duration tracking (estimated vs actual)
- Visual progress bar with percentage
- Loading animations for active steps

**Usage:**
```tsx
import { ProgressBar, ProgressStep } from '@/components/progress';

const steps: ProgressStep[] = [
  {
    id: 'step1',
    title: 'Validate URL',
    description: 'Checking URL validity and content type',
    status: 'completed',
    estimatedDuration: 5,
    actualDuration: 3
  },
  // ... more steps
];

<ProgressBar steps={steps} currentStepId="step2" />
```

### ProgressStatus
A comprehensive status display showing real-time progress information, time estimates, and system status.

**Features:**
- Real-time status updates
- Time tracking (elapsed, remaining, total)
- Processing speed calculation
- System information display
- Status-specific messaging

**Usage:**
```tsx
import { ProgressStatus, ProgressStatusData } from '@/components/progress';

const statusData: ProgressStatusData = {
  currentStep: 'processing_content',
  currentStepTitle: 'Processing Content',
  currentStepDescription: 'Analyzing and organizing content',
  status: 'processing',
  estimatedTimeRemaining: 120,
  totalEstimatedTime: 300,
  elapsedTime: 180,
  completedSteps: 3,
  totalSteps: 6,
  processingSpeed: 1.2,
  lastUpdate: new Date()
};

<ProgressStatus data={statusData} />
```

### ProgressControls
Interactive controls for managing the progress workflow (cancel, retry, preview, download).

**Features:**
- Cancel functionality during processing
- Retry with attempt tracking
- Preview and download options
- Error handling and messaging
- Configurable button visibility

**Usage:**
```tsx
import { ProgressControls } from '@/components/progress';

<ProgressControls
  status="processing"
  canCancel={true}
  onCancel={() => console.log('Cancelled')}
  onRetry={() => console.log('Retrying')}
  onPreview={() => console.log('Preview')}
  onDownload={() => console.log('Download')}
  error="Connection failed"
  retryCount={1}
  maxRetries={3}
/>
```

### ProgressTracker
A complete progress tracking solution that combines all components with built-in state management.

**Features:**
- Complete progress workflow management
- Automatic step progression simulation
- Built-in error handling and retry logic
- Integrated status updates
- Configurable callbacks

**Usage:**
```tsx
import { ProgressTracker } from '@/components/progress';

<ProgressTracker
  isVisible={true}
  onCancel={() => handleCancel()}
  onRetry={() => handleRetry()}
  onPreview={() => handlePreview()}
  onDownload={() => handleDownload()}
  onStartNew={() => handleStartNew()}
/>
```

### ProgressDemo
A demonstration component showing all progress tracking features in action.

**Usage:**
```tsx
import { ProgressDemo } from '@/components/progress';

<ProgressDemo />
```

## Data Types

### ProgressStep
```typescript
interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedDuration?: number; // in seconds
  actualDuration?: number; // in seconds
}
```

### ProgressStatusData
```typescript
interface ProgressStatusData {
  currentStep: string;
  currentStepTitle: string;
  currentStepDescription: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  estimatedTimeRemaining?: number; // in seconds
  totalEstimatedTime?: number; // in seconds
  elapsedTime: number; // in seconds
  completedSteps: number;
  totalSteps: number;
  processingSpeed?: number; // steps per minute
  lastUpdate: Date;
}
```

## Styling

All components use Tailwind CSS classes and follow the established design system:

- **Primary colors**: `primary-600`, `primary-700` for active states
- **Status colors**: 
  - Green (`green-500`, `green-600`) for completed/success
  - Red (`red-500`, `red-600`) for failed/error
  - Yellow (`yellow-500`, `yellow-600`) for cancelled/warning
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standard Tailwind spacing scale
- **Animations**: Subtle transitions and loading states

## Integration

The progress components are integrated into the main document generation form (`DocumentGenerationForm.tsx`) and can be easily added to other workflows that require progress tracking.

## Testing

Comprehensive test coverage is provided for all components:
- Unit tests for individual component functionality
- Integration tests for component interactions
- Mock handlers for testing callbacks
- Accessibility and user interaction testing

Run tests with:
```bash
npm test src/components/progress/__tests__/
```

## Requirements Fulfilled

This implementation fulfills the following requirements from the specification:

- **9.1**: Progress feedback during document generation
- **9.2**: Real-time status updates during processing  
- **9.3**: Estimated time remaining display
- **9.4**: Cancel/retry functionality for failed operations

The components provide a complete solution for progress tracking with professional UI/UX, comprehensive error handling, and full test coverage.