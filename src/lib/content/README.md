# Content Extraction Module

This module provides comprehensive content extraction capabilities for the Thai Document Generator, supporting both website content extraction and YouTube video processing.

## Overview

The content extraction system is designed to handle multiple content sources and extract structured information that can be processed by the AI engine for document generation. It follows a modular architecture with clear separation of concerns.

## Architecture

```
ContentService (Main Interface)
├── URLProcessor (URL validation and processing)
├── ContentExtractor (Website content extraction)
└── YouTubeProcessor (YouTube video processing)
```

## Components

### ContentService

The main service that coordinates all content extraction operations.

```typescript
import { ContentService } from './ContentService';

const contentService = new ContentService();

// Extract content from any supported URL
const result = await contentService.extractContent('https://example.com');

if (result.success) {
  console.log('Title:', result.content.title);
  console.log('Content:', result.content.textContent);
  console.log('Images:', result.content.images.length);
}
```

### URLProcessor

Handles URL validation, type detection, and normalization.

```typescript
import { URLProcessor } from './URLProcessor';

const processor = new URLProcessor();

// Validate URL
const validation = processor.validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
console.log(validation.type); // 'youtube_video'
console.log(validation.videoId); // 'dQw4w9WgXcQ'

// Extract metadata
const metadata = processor.extractUrlMetadata('https://example.com/path?param=value');
console.log(metadata.domain); // 'example.com'
console.log(metadata.queryParams); // { param: 'value' }

// Normalize URL (remove tracking parameters)
const normalized = processor.normalizeUrl('https://example.com?utm_source=google&id=123');
console.log(normalized); // 'https://example.com?id=123'
```

### ContentExtractor

Extracts content from websites using web scraping.

```typescript
import { ContentExtractor } from './ContentExtractor';

const extractor = new ContentExtractor();

const result = await extractor.extractWebsiteContent('https://example.com', {
  includeImages: true,
  maxImages: 5,
  imageMinWidth: 100,
  imageMinHeight: 100
});

if (result.success) {
  console.log('Title:', result.content.title);
  console.log('Description:', result.content.metadata.description);
  console.log('Images found:', result.content.images.length);
}
```

### YouTubeProcessor

Processes YouTube videos to extract metadata, transcripts, and key moments.

```typescript
import { YouTubeProcessor } from './YouTubeProcessor';

const processor = new YouTubeProcessor();

const result = await processor.processYouTubeVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  includeTranscript: true,
  transcriptLanguage: 'en'
});

if (result.success) {
  console.log('Video ID:', result.content.videoContent.videoId);
  console.log('Duration:', result.content.videoContent.duration);
  console.log('Transcript:', result.content.videoContent.transcript);
  console.log('Key moments:', result.content.videoContent.keyMoments.length);
}
```

## Supported Content Types

### Website Content
- **Product pages**: E-commerce sites, product catalogs
- **Documentation**: Technical docs, user manuals
- **Articles**: Blog posts, news articles
- **General websites**: Any HTML content

**Extracted Information:**
- Title and metadata (description, author, publish date)
- Main text content (cleaned and structured)
- Images with alt text and dimensions
- Language detection
- Keywords and tags

### YouTube Videos
- **Tutorial videos**: Step-by-step instructions
- **Product demos**: Feature demonstrations
- **Educational content**: Learning materials
- **General videos**: Any YouTube content

**Extracted Information:**
- Video metadata (title, description, duration, channel)
- Transcript/captions (multiple languages)
- Key moments identification
- Screenshots coordination (handled by separate service)
- Content analysis and summarization

## Configuration Options

### Website Extraction Options
```typescript
interface ExtractionOptions {
  includeImages: boolean;        // Extract images from page
  maxImages: number;             // Maximum number of images
  imageMinWidth: number;         // Minimum image width
  imageMinHeight: number;        // Minimum image height
  timeout: number;               // Request timeout in ms
  userAgent: string;             // Custom user agent
}
```

### YouTube Extraction Options
```typescript
interface YouTubeExtractionOptions {
  includeTranscript: boolean;    // Extract video transcript
  includeScreenshots: boolean;   // Coordinate screenshot capture
  maxScreenshots: number;        // Maximum screenshots
  transcriptLanguage: string;    // Preferred transcript language
  timeout: number;               // Request timeout in ms
}
```

## Error Handling

The system provides comprehensive error handling with detailed error messages and recovery options:

```typescript
const result = await contentService.extractContent(url);

if (!result.success) {
  console.error('Extraction failed:', result.error);
  
  // Check URL validation issues
  if (result.urlValidation && !result.urlValidation.isValid) {
    console.error('URL validation error:', result.urlValidation.error);
  }
  
  // Handle specific error types
  if (result.error.includes('HTTP 404')) {
    // Handle not found
  } else if (result.error.includes('timeout')) {
    // Handle timeout
  }
}

// Check for warnings (non-fatal issues)
if (result.warnings) {
  result.warnings.forEach(warning => {
    console.warn('Warning:', warning);
  });
}
```

## Content Validation

Extracted content is automatically validated to ensure quality:

```typescript
// Validation checks:
// - Title presence and length
// - Content length (minimum 100 characters, maximum 100k)
// - Language detection
// - Image accessibility
// - Metadata completeness

const validation = extractor.validateExtractedContent(content);
if (!validation.isValid) {
  console.log('Validation issues:', validation.issues);
}
```

## Usage Examples

### Basic Content Extraction
```typescript
const contentService = new ContentService();

// Extract from website
const websiteResult = await contentService.extractContent('https://example.com/product');

// Extract from YouTube
const videoResult = await contentService.extractContent('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
```

### Batch Processing
```typescript
const urls = [
  'https://example.com/product1',
  'https://www.youtube.com/watch?v=video1',
  'https://example.com/product2'
];

const results = await contentService.extractMultipleUrls(urls);
results.forEach((result, index) => {
  if (result.success) {
    console.log(`URL ${index + 1}: ${result.content.title}`);
  } else {
    console.error(`URL ${index + 1} failed: ${result.error}`);
  }
});
```

### Custom Configuration
```typescript
const result = await contentService.extractContent(url, {
  website: {
    includeImages: true,
    maxImages: 15,
    imageMinWidth: 200,
    imageMinHeight: 150,
    timeout: 45000
  },
  youtube: {
    includeTranscript: true,
    transcriptLanguage: 'th', // Thai language
    maxScreenshots: 8
  },
  validateUrl: true,
  checkAccessibility: true
});
```

## Integration with Other Services

This module is designed to integrate with other parts of the Thai Document Generator:

1. **AI Processing Engine**: Extracted content is passed to the LLM for translation and organization
2. **Image Processing Service**: Image URLs are passed for optimization and processing
3. **Template Engine**: Structured content is formatted according to MFEC standards
4. **Progress Tracking**: Extraction progress is reported to the UI

## Performance Considerations

- **Concurrent Processing**: Multiple URLs can be processed simultaneously
- **Timeout Management**: Configurable timeouts prevent hanging requests
- **Content Size Limits**: Large content is truncated to prevent memory issues
- **Image Filtering**: Small and irrelevant images are automatically filtered
- **Caching**: Consider implementing caching for frequently accessed content

## Security Features

- **URL Validation**: Prevents access to local/internal URLs
- **Protocol Filtering**: Only HTTP/HTTPS protocols allowed
- **Domain Blocking**: Configurable blocked domains list
- **Content Sanitization**: HTML content is cleaned and sanitized
- **Rate Limiting**: Built-in request throttling (implement as needed)

## Testing

The module includes comprehensive tests:

```bash
# Run all content extraction tests
npm test src/lib/content/

# Run specific test files
npm test URLProcessor.test.ts
npm test ContentExtractor.test.ts
npm test YouTubeProcessor.test.ts
npm test ContentService.test.ts
npm test integration.test.ts
```

## Future Enhancements

- **Additional Content Sources**: Support for more platforms (Vimeo, social media)
- **Advanced Image Analysis**: AI-powered image relevance scoring
- **Content Caching**: Redis-based caching for improved performance
- **Real-time Processing**: WebSocket-based progress updates
- **Content Preprocessing**: Advanced text cleaning and normalization
- **Multi-language Support**: Enhanced language detection and processing