# YouTube Video Processing System

This module provides comprehensive YouTube video processing capabilities for the Thai Document Generator, including video analysis, transcript processing, screenshot capture, and AI-powered content extraction.

## Components

### 1. YouTubeVideoProcessor

Enhanced YouTube video processor that extends the basic `YouTubeProcessor` with advanced analysis and frame extraction capabilities.

**Key Features:**
- Video download information extraction
- AI-powered content enhancement
- Automatic screenshot capture coordination
- Audio content analysis
- Step-by-step instruction extraction
- Video summarization

**Usage:**
```typescript
import { youTubeVideoProcessor } from './YouTubeVideoProcessor';

// Process video with comprehensive analysis
const result = await youTubeVideoProcessor.processVideoWithAnalysis(
  'https://youtube.com/watch?v=VIDEO_ID',
  {
    captureScreenshots: true,
    screenshotQuality: 'high',
    maxScreenshots: 15,
    analyzeAudio: true,
    extractKeyMoments: true
  }
);

// Extract step-by-step instructions
const instructions = await youTubeVideoProcessor.extractVideoInstructions(
  result.videoContent,
  'thai'
);

// Generate summary
const summary = await youTubeVideoProcessor.generateVideoSummary(
  result.videoContent,
  500,
  'thai'
);
```

### 2. VideoAnalyzer

AI-powered video analyzer that uses LLM technology to identify key moments, transitions, and extract meaningful content from video transcripts.

**Key Features:**
- Key moment identification with importance scoring
- Transition detection (scene changes, topic changes)
- Video segmentation into logical sections
- Step-by-step instruction extraction
- Comprehensive video summarization
- Screenshot timestamp recommendations

**Usage:**
```typescript
import { videoAnalyzer } from '../ai/VideoAnalyzer';

const analysis = await videoAnalyzer.analyzeVideo(
  videoContent,
  'Video Title',
  {
    focusOnSteps: true,
    includeTransitions: true,
    maxKeyMoments: 15,
    targetLanguage: 'thai',
    analysisDepth: 'detailed'
  }
);

// Access analysis results
console.log(analysis.keyMoments);
console.log(analysis.segments);
console.log(analysis.stepByStepInstructions);
console.log(analysis.recommendedScreenshots);
```

### 3. ScreenshotProcessor

Handles automatic screenshot capture from YouTube videos using MCP puppeteer integration.

**Key Features:**
- Batch screenshot capture at multiple timestamps
- Key moment-based screenshot capture
- Screenshot quality optimization
- Retry logic for failed captures
- Screenshot validation and optimization
- Thai language caption generation

**Usage:**
```typescript
import { screenshotProcessor } from './ScreenshotProcessor';

// Capture screenshots at specific timestamps
const result = await screenshotProcessor.captureScreenshotsFromVideo(
  'VIDEO_ID',
  [30, 90, 150, 210],
  {
    quality: 'high',
    format: 'jpg',
    width: 1280,
    height: 720
  }
);

// Capture screenshots based on key moments
const keyMomentResult = await screenshotProcessor.captureScreenshotsFromKeyMoments(
  'VIDEO_ID',
  keyMoments,
  { quality: 'medium' }
);
```

## Data Models

### VideoContent
```typescript
interface VideoContent {
  videoId: string;
  duration: number;
  transcript: string;
  keyMoments: VideoMoment[];
  screenshots: VideoScreenshot[];
  audioAnalysis?: AudioAnalysis;
}
```

### VideoMoment
```typescript
interface VideoMoment {
  timestamp: number;
  description: string;
  importance: 'high' | 'medium' | 'low';
  actionType: 'step' | 'explanation' | 'demonstration' | 'result';
  screenshot?: string;
}
```

### VideoScreenshot
```typescript
interface VideoScreenshot {
  timestamp: number;
  imageUrl: string;
  caption: string;
  relevanceScore: number;
  associatedStep?: string;
}
```

### VideoAnalysisResult
```typescript
interface VideoAnalysisResult {
  keyMoments: VideoMoment[];
  transitions: TransitionAnalysis[];
  segments: VideoSegment[];
  summary: string;
  stepByStepInstructions: string[];
  recommendedScreenshots: number[];
}
```

## Integration with MCP Tools

The video processing system integrates with Model Context Protocol (MCP) tools for enhanced functionality:

### YouTube MCP Tool
- Video metadata extraction
- Transcript and caption retrieval
- Video search capabilities
- Duration and quality information

### Puppeteer MCP Tool
- Screenshot capture at specific timestamps
- Video player control and navigation
- Frame extraction and optimization
- Automated browser interaction

## AI Integration

The system uses the MFEC LiteLLM endpoint for AI-powered analysis:

### Content Analysis
- Natural language processing of video transcripts
- Key moment identification using contextual understanding
- Step extraction with action type classification
- Content summarization in Thai and English

### Language Support
- Thai language processing and generation
- English to Thai translation
- Thai keyword recognition for step identification
- Cultural context adaptation for Thai documentation

## Error Handling

### Graceful Degradation
- Fallback methods when AI analysis fails
- Alternative screenshot capture strategies
- Basic content extraction when advanced features fail
- User-friendly error messages with recovery suggestions

### Retry Logic
- Automatic retry for transient failures
- Exponential backoff for network issues
- Alternative API endpoints when primary fails
- Manual intervention options for critical failures

## Performance Optimization

### Efficient Processing
- Parallel screenshot capture when possible
- Optimized AI prompt engineering for faster responses
- Caching of processed content to avoid reprocessing
- Batch operations for multiple timestamps

### Resource Management
- Memory-efficient video processing
- Cleanup of temporary files and browser sessions
- Rate limiting for API calls
- Progress tracking for long-running operations

## Testing

### Unit Tests
- Individual component testing with mocked dependencies
- Edge case handling verification
- Error condition testing
- Performance benchmarking

### Integration Tests
- End-to-end workflow testing
- MCP tool integration verification
- AI analysis accuracy validation
- Screenshot quality assessment

### Test Coverage
- All public methods and interfaces
- Error handling paths
- Edge cases and boundary conditions
- Performance under load

## Usage Examples

### Basic Video Processing
```typescript
// Simple video processing
const processor = new YouTubeVideoProcessor();
const result = await processor.processVideoWithAnalysis(
  'https://youtube.com/watch?v=dQw4w9WgXcQ'
);

console.log(`Processed ${result.videoContent.keyMoments.length} key moments`);
console.log(`Captured ${result.videoContent.screenshots.length} screenshots`);
```

### Advanced Analysis
```typescript
// Comprehensive analysis with custom options
const analysisResult = await videoAnalyzer.analyzeVideo(
  videoContent,
  'Product Tutorial Video',
  {
    focusOnSteps: true,
    includeTransitions: true,
    maxKeyMoments: 20,
    targetLanguage: 'thai',
    analysisDepth: 'comprehensive'
  }
);

// Generate Thai documentation content
const thaiInstructions = analysisResult.stepByStepInstructions;
const thaiSummary = analysisResult.summary;
```

### Screenshot Optimization
```typescript
// Capture and optimize screenshots for documentation
const screenshots = await screenshotProcessor.captureScreenshotsFromKeyMoments(
  videoId,
  keyMoments,
  { quality: 'high', format: 'jpg' }
);

// Optimize for document inclusion
const optimizedScreenshots = await Promise.all(
  screenshots.screenshots.map(screenshot =>
    screenshotProcessor.optimizeScreenshotForDocument(screenshot, 800, 600)
  )
);
```

## Configuration

### Environment Variables
```bash
# MCP tool configuration
MCP_PUPPETEER_ENABLED=true
MCP_YOUTUBE_ENABLED=true

# AI processing configuration
MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
MFEC_LLM_API_KEY=your_api_key_here

# Screenshot processing configuration
SCREENSHOT_QUALITY=medium
SCREENSHOT_MAX_COUNT=15
SCREENSHOT_TIMEOUT=30000
```

### Processing Options
```typescript
interface VideoProcessingOptions {
  captureScreenshots: boolean;
  screenshotQuality: 'high' | 'medium' | 'low';
  maxScreenshots: number;
  screenshotInterval?: number;
  analyzeAudio: boolean;
  extractKeyMoments: boolean;
  includeTranscript: boolean;
  transcriptLanguage: string;
  timeout: number;
}
```

## Future Enhancements

### Planned Features
- Real-time video processing with streaming
- Advanced audio analysis with speech recognition
- Multi-language subtitle generation
- Interactive screenshot annotation
- Video chapter detection and organization

### Performance Improvements
- GPU-accelerated video processing
- Distributed screenshot capture
- Advanced caching strategies
- Optimized AI model usage

### Integration Enhancements
- Additional MCP tool support
- Cloud storage integration for screenshots
- Advanced video format support
- Live video processing capabilities