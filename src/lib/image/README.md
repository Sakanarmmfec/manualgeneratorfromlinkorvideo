# Image Processing Service

The Image Processing Service provides comprehensive image handling capabilities for the Thai Document Generator, including extraction, optimization, and intelligent placement of images within generated documents.

## Overview

This service handles the complete image processing pipeline:

1. **Image Extraction** - Extract images from product URLs and web content
2. **Screenshot Processing** - Capture and process screenshots from YouTube videos
3. **Image Optimization** - Optimize images for document inclusion with appropriate compression and sizing
4. **Image Placement** - Intelligently determine optimal placement of images within document sections
5. **Fallback Handling** - Generate placeholders and fallback options when image processing fails

## Components

### ImageExtractor

Extracts images from product URLs and web content.

```typescript
import { ImageExtractor } from './ImageExtractor';

const extractor = new ImageExtractor();

// Extract images from a URL
const result = await extractor.extractFromUrl('https://example.com/product', {
  maxImages: 10,
  minWidth: 200,
  minHeight: 200,
  allowedFormats: ['jpg', 'png', 'webp']
});

// Extract images from extracted content
const contentResult = await extractor.extractFromContent(extractedContent);
```

**Features:**
- Supports multiple image formats (JPG, PNG, WebP, GIF)
- Filters out unwanted images (icons, logos, thumbnails)
- Extracts metadata (alt text, dimensions, file size)
- Calculates relevance scores for intelligent prioritization
- Handles both `<img>` tags and CSS background images

### ScreenshotProcessor

Captures and processes screenshots from YouTube videos at key moments.

```typescript
import { ScreenshotProcessor } from './ScreenshotProcessor';

const processor = new ScreenshotProcessor();

// Capture screenshots at key moments
const result = await processor.captureFromVideo(videoId, keyMoments, {
  maxScreenshots: 15,
  quality: 0.8,
  format: 'jpg',
  width: 1280,
  height: 720
});

// Capture at regular intervals
const intervalResult = await processor.captureAtIntervals(videoId, duration, {
  intervalSeconds: 30
});
```

**Features:**
- Captures screenshots at AI-identified key moments
- Supports interval-based capture as fallback
- Prioritizes moments by importance and action type
- Optimizes screenshot quality and format
- Generates descriptive captions automatically

### ImageOptimizer

Optimizes images for document inclusion with appropriate compression and sizing.

```typescript
import { ImageOptimizer } from './ImageOptimizer';

const optimizer = new ImageOptimizer();

// Optimize for document inclusion
const result = await optimizer.optimizeForDocument(image, {
  maxWidth: 800,
  maxHeight: 600,
  quality: 0.85,
  format: 'jpg'
});

// Batch optimization
const batchResults = await optimizer.optimizeBatch(images, options);

// Specialized optimizations
const printResult = await optimizer.optimizeForPrint(image);
const webResult = await optimizer.optimizeForWeb(image);
const thumbnail = await optimizer.createThumbnail(image, 150);
```

**Features:**
- Intelligent resizing with aspect ratio preservation
- Format conversion for optimal compression
- Quality adjustment based on image characteristics
- Batch processing for multiple images
- Specialized presets for different use cases

### ImagePlacer

Determines optimal placement of images within document sections.

```typescript
import { ImagePlacer } from './ImagePlacer';

const placer = new ImagePlacer();

// Determine optimal placement
const result = await placer.determineOptimalPlacement(images, sections, {
  maxImagesPerSection: 3,
  preferredPosition: 'middle',
  preferredAlignment: 'center',
  prioritizeRelevance: true
});

// Generate fallback placements
const fallbacks = placer.generateFallbackPlacements(images, sections);

// Create placeholders for missing images
const placeholders = placer.createPlaceholderPlacements(sections);
```

**Features:**
- Analyzes section content and type for optimal placement
- Considers image relevance and section compatibility
- Distributes images evenly across document sections
- Generates appropriate captions and sizing
- Provides fallback options when optimal placement fails

### ImageProcessingService

Main service that coordinates all image processing components.

```typescript
import { ImageProcessingService } from './ImageProcessingService';

const service = new ImageProcessingService();

// Complete processing pipeline
const result = await service.processImagesForDocument(
  extractedContent,
  documentSections,
  {
    extraction: { maxImages: 15 },
    optimization: { maxWidth: 800, quality: 0.85 },
    placement: { maxImagesPerSection: 3 }
  }
);

// Get processing statistics
const stats = service.getProcessingStats(result);

// Document type specific options
const userManualOptions = service.getDocumentTypeOptions('user_manual');
const productDocOptions = service.getDocumentTypeOptions('product_document');
```

## Usage Examples

### Basic Website Image Processing

```typescript
const service = new ImageProcessingService();

const websiteContent: ExtractedContent = {
  url: 'https://example.com/product',
  contentType: 'website',
  // ... other properties
};

const sections: DocumentSection[] = [
  {
    id: 'features',
    title: 'Product Features',
    content: 'Feature descriptions...',
    sectionType: 'features'
  }
  // ... more sections
];

const result = await service.processImagesForDocument(
  websiteContent,
  sections
);

console.log(`Processed ${result.extractedImages.length} images`);
console.log(`Placement score: ${result.placements.placementScore}`);
```

### YouTube Video Processing

```typescript
const videoContent: ExtractedContent = {
  url: 'https://youtube.com/watch?v=example',
  contentType: 'youtube_video',
  videoContent: {
    videoId: 'example',
    duration: 600,
    keyMoments: [
      {
        timestamp: 30,
        description: 'Product overview',
        importance: 'high',
        actionType: 'explanation'
      }
    ]
  }
  // ... other properties
};

const result = await service.processImagesForDocument(
  videoContent,
  sections,
  service.getDocumentTypeOptions('user_manual')
);

console.log(`Captured ${result.screenshots.length} screenshots`);
```

### Error Handling and Fallbacks

```typescript
const result = await service.processImagesForDocument(content, sections);

if (result.processingErrors.length > 0) {
  console.log('Processing errors:', result.processingErrors);
  
  // Generate fallbacks
  const fallbacks = await service.generateFallbacks(
    sections,
    result.placements.unplacedImages
  );
  
  console.log(`Generated ${fallbacks.placeholders.length} placeholders`);
}

// Validate images before processing
const { validImages, invalidImages } = await service.validateImages(images);
console.log(`${validImages.length} valid, ${invalidImages.length} invalid images`);
```

## Configuration Options

### Extraction Options

```typescript
interface ImageExtractionOptions {
  maxImages?: number;        // Maximum images to extract (default: 10)
  minWidth?: number;         // Minimum image width (default: 200)
  minHeight?: number;        // Minimum image height (default: 200)
  allowedFormats?: string[]; // Allowed formats (default: ['jpg', 'jpeg', 'png', 'webp', 'gif'])
  excludePatterns?: string[]; // Patterns to exclude (default: ['icon', 'logo', 'avatar', 'thumbnail'])
}
```

### Screenshot Options

```typescript
interface ScreenshotOptions {
  maxScreenshots?: number;   // Maximum screenshots (default: 20)
  quality?: number;          // Image quality 0-1 (default: 0.8)
  format?: 'png' | 'jpg' | 'webp'; // Output format (default: 'jpg')
  width?: number;            // Screenshot width (default: 1280)
  height?: number;           // Screenshot height (default: 720)
  intervalSeconds?: number;  // Interval for automatic capture (default: 30)
}
```

### Optimization Options

```typescript
interface OptimizationOptions {
  maxWidth?: number;         // Maximum width (default: 800)
  maxHeight?: number;        // Maximum height (default: 600)
  quality?: number;          // Compression quality 0-1 (default: 0.85)
  format?: 'jpg' | 'png' | 'webp'; // Output format (default: 'jpg')
  maintainAspectRatio?: boolean;   // Preserve aspect ratio (default: true)
  compressionLevel?: number; // Compression level 1-10 (default: 7)
}
```

### Placement Options

```typescript
interface PlacementOptions {
  maxImagesPerSection?: number;    // Max images per section (default: 3)
  preferredPosition?: 'top' | 'middle' | 'bottom'; // Default position (default: 'middle')
  preferredAlignment?: 'left' | 'center' | 'right'; // Default alignment (default: 'center')
  allowTextWrapping?: boolean;     // Allow text wrapping (default: true)
  prioritizeRelevance?: boolean;   // Prioritize by relevance score (default: true)
}
```

## Document Type Presets

The service provides optimized configurations for different document types:

### User Manual
- More images (20 max)
- Frequent video screenshots (every 20 seconds)
- Prioritizes relevance for step-by-step content
- Allows more images per section for detailed instructions

### Product Document
- Fewer images (10 max)
- Less frequent screenshots (every 45 seconds)
- Focuses on key product features
- Limits images per section for cleaner presentation

## Error Handling

The service provides comprehensive error handling:

- **Network Errors**: Graceful handling of unreachable URLs
- **Processing Failures**: Fallback options when optimization fails
- **Invalid Images**: Validation and filtering of inaccessible images
- **Placement Issues**: Placeholder generation when placement fails

## Performance Considerations

- **Batch Processing**: Optimizes multiple images simultaneously
- **Lazy Loading**: Processes images only when needed
- **Caching**: Avoids reprocessing identical images
- **Resource Limits**: Respects memory and processing constraints
- **Timeout Handling**: Prevents hanging on slow operations

## Testing

The service includes comprehensive tests:

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **Error Scenarios**: Failure mode testing
- **Performance Tests**: Processing time validation

Run tests with:
```bash
npm test src/lib/image/
```

## Requirements Fulfilled

This implementation addresses the following requirements:

- **2.1**: Extract relevant product images from URLs
- **2.2**: Optimize images for document inclusion
- **2.3**: Place images appropriately within content structure
- **2.4**: Handle image fallbacks and placeholder generation
- **10.1**: Automatically capture screenshots from YouTube videos
- **10.2**: Optimize and organize video screenshots
- **10.3**: Place screenshots within corresponding text sections
- **10.4**: Provide captions and descriptions for captured screens