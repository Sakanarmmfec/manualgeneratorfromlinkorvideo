# AI Processing Engine

The AI Processing Engine is the core component responsible for transforming extracted content into structured, refined Thai documentation using MFEC's LiteLLM endpoint. It provides intelligent content translation, organization, and refinement capabilities with robust API key management and fallback systems.

## Components

### LLMConnector
Handles secure connections to MFEC's LiteLLM endpoint at `https://gpt.mfec.co.th/litellm`.

**Key Features:**
- Secure API key management with fallback support
- Chat completions using gpt-4o model
- Text embeddings using text-embedding-3-large model
- Connection testing and model listing
- Comprehensive error handling with recovery options

**Usage:**
```typescript
import { llmConnector } from '@/lib/ai/LLMConnector';

// Create chat completion
const response = await llmConnector.createChatCompletion([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Translate this to Thai: Hello world' }
]);

// Create embeddings
const embedding = await llmConnector.createEmbedding('Text to embed');

// Test connection
const status = await llmConnector.testConnection();
```

### ContentProcessor
Transforms extracted content into structured Thai documentation with intelligent organization and refinement.

**Key Features:**
- Natural Thai translation with technical accuracy
- Intelligent content organization into document sections
- Content refinement and polishing
- API key fallback handling
- Multi-source content merging
- Content enhancement capabilities

**Usage:**
```typescript
import { contentProcessor } from '@/lib/ai/ContentProcessor';

// Process single content source
const processed = await contentProcessor.processContent(
  extractedContent,
  'user_manual',
  'Custom instructions for translation'
);

// Process video content with enhanced structure
const videoProcessed = await contentProcessor.processVideoContent(
  videoExtractedContent,
  'user_manual'
);

// Process multiple content sources
const merged = await contentProcessor.processMultipleContents(
  [websiteContent, videoContent],
  'user_manual',
  'prioritize'
);

// Enhance processed content
const enhanced = await contentProcessor.enhanceProcessedContent(processed, {
  addTableOfContents: true,
  improveTransitions: true,
  addConclusion: true
});
```

### VideoContentAnalyzer
Specialized analyzer for YouTube video content with AI-powered step extraction and moment identification.

**Key Features:**
- Key moment identification from video transcripts
- Step-by-step instruction extraction
- Video content summarization
- Screenshot timestamp optimization
- Audio analysis from transcripts
- Multi-language support (Thai/English)

**Usage:**
```typescript
import { videoContentAnalyzer } from '@/lib/ai/VideoContentAnalyzer';

// Analyze video content
const videoContent = await videoContentAnalyzer.analyzeVideoContent(
  'videoId123',
  transcript,
  duration,
  'Video Title'
);

// Extract step-by-step instructions
const steps = await videoContentAnalyzer.extractStepByStepInstructions(
  videoContent,
  'thai'
);

// Summarize video content
const summary = await videoContentAnalyzer.summarizeVideoContent(
  videoContent,
  500,
  'thai'
);

// Get optimal screenshot timestamps
const timestamps = videoContentAnalyzer.identifyOptimalScreenshotTimestamps(
  videoContent,
  10
);
```

### ProcessedContentModel
Utility class for creating, manipulating, and managing ProcessedContent instances with source attribution.

**Key Features:**
- ProcessedContent creation and validation
- Multi-source content merging strategies
- Quality score calculation and updates
- Image placement management
- Content summarization
- Source attribution handling

**Usage:**
```typescript
import { processedContentUtils } from '@/lib/ai/ProcessedContentModel';

// Create from extracted content
const processed = processedContentUtils.fromExtractedContent(
  extractedContent,
  translatedContent,
  refinedContent
);

// Merge multiple processed contents
const merged = processedContentUtils.merge(
  [content1, content2],
  'prioritize'
);

// Update quality score
const enhanced = processedContentUtils.updateQualityScore(processed, {
  hasImages: true,
  hasProperStructure: true,
  languageQuality: 90
});

// Extract summary
const summary = processedContentUtils.extractSummary(processed, 200);
```

## API Key Management and Fallback System

The AI Processing Engine includes a robust API key management system that handles token exhaustion and provides fallback options:

### Primary API Key
- Uses MFEC's main API key for LiteLLM endpoint
- Automatically managed through secure configuration
- Monitors usage and token availability

### Fallback System
- Supports user-provided API keys when primary key is exhausted
- Automatic switching to fallback keys during processing
- Session-based storage for security (not persistent)
- Clear error messages when fallback is needed

### Error Handling
```typescript
try {
  const result = await contentProcessor.processContent(extractedContent);
} catch (error) {
  if (error instanceof APIKeyError && error.code === 'TOKEN_EXHAUSTED_USER_KEY_REQUIRED') {
    // Prompt user to provide their own API key
    // Use UserApiKeyInput component to collect key
    // Retry processing with user key
  }
}
```

## Content Processing Pipeline

### 1. Content Translation
- Translates content to natural, professional Thai
- Maintains technical accuracy and terminology
- Adapts sentence structure for Thai language
- Preserves formatting and structure markers

### 2. Content Organization
- Structures content into logical document sections
- Creates hierarchical section organization
- Assigns appropriate section types (introduction, features, usage, etc.)
- Handles different document types (user manual vs product document)

### 3. Content Refinement
- Polishes and improves content flow
- Adds transitions between sections
- Ensures consistent tone and style
- Enhances readability and professional presentation

### 4. Quality Assessment
- Calculates quality scores based on multiple factors
- Considers content completeness, structure, and organization
- Evaluates image availability and metadata richness
- Provides feedback for content improvement

## Video Content Processing

### Enhanced Video Analysis
- Analyzes video transcripts to identify key moments
- Extracts actionable steps and procedures
- Generates screenshot recommendations
- Creates structured documentation from video content

### Key Moment Detection
- Identifies important timestamps in videos
- Categorizes moments by type (step, explanation, demonstration, result)
- Assigns importance levels (high, medium, low)
- Provides descriptions for each key moment

### Step Extraction
- Converts video content into step-by-step instructions
- Maintains logical sequence and flow
- Includes important details and warnings
- Supports both Thai and English output

## Multi-Source Content Merging

### Merging Strategies
- **Concatenate**: Simple sequential combination
- **Interleave**: Alternates sections by type
- **Prioritize**: Orders by section importance and type

### Source Attribution
- Maintains references to all original sources
- Includes extraction timestamps and content types
- Provides proper attribution in Thai language
- Supports multiple source URLs and types

## Error Handling and Recovery

### Graceful Degradation
- Continues processing when individual steps fail
- Provides fallback options for AI processing failures
- Maintains partial results when possible
- Clear error messages with recovery suggestions

### Retry Mechanisms
- Automatic retry for transient failures
- API key fallback for token exhaustion
- Alternative processing paths for different error types
- Progress preservation during failures

## Testing

The AI Processing Engine includes comprehensive test coverage:

- **Unit Tests**: Individual component testing with mocked dependencies
- **Integration Tests**: End-to-end processing pipeline testing
- **Error Handling Tests**: Failure scenarios and recovery testing
- **API Key Management Tests**: Fallback system and error handling

Run tests:
```bash
npm test src/lib/ai/
```

## Configuration

### Environment Variables
```env
# MFEC LiteLLM Configuration
MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
MFEC_LLM_API_KEY=your-mfec-api-key
MFEC_LLM_CHAT_MODEL=gpt-4o
MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large
```

### LLM Configuration
```typescript
const config: LLMConfiguration = {
  baseUrl: 'https://gpt.mfec.co.th/litellm',
  apiKeyRef: 'secure-key-reference',
  chatModel: 'gpt-4o',
  embeddingModel: 'text-embedding-3-large',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000
};
```

## Best Practices

### Content Processing
1. Always validate input content before processing
2. Use appropriate document types for different content sources
3. Handle API key exhaustion gracefully
4. Provide clear error messages to users
5. Monitor processing quality scores

### Video Analysis
1. Ensure video transcripts are available and accurate
2. Use appropriate language settings for target audience
3. Optimize screenshot timestamps for documentation needs
4. Validate key moment extraction results

### Multi-Source Processing
1. Choose appropriate merging strategies based on content types
2. Validate source attribution accuracy
3. Handle partial processing failures gracefully
4. Monitor merged content quality

### Error Handling
1. Implement proper retry mechanisms
2. Provide fallback options for critical failures
3. Log errors appropriately without exposing sensitive data
4. Guide users through recovery processes

## Performance Considerations

### Token Usage Optimization
- Monitor API token consumption
- Use appropriate model parameters for different tasks
- Implement caching where appropriate
- Batch similar requests when possible

### Processing Efficiency
- Process content sources in parallel when possible
- Use streaming for large content processing
- Implement progress tracking for long operations
- Optimize memory usage for large documents

### Quality vs Speed Trade-offs
- Balance processing quality with response time
- Use appropriate temperature settings for different tasks
- Consider content complexity when setting timeouts
- Implement quality thresholds for acceptable results