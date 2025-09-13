/**
 * Example usage of the Content Extraction System
 * Demonstrates various ways to extract content from URLs
 */

import { ContentService } from './ContentService';
import { URLProcessor } from './URLProcessor';
import { ContentExtractor } from './ContentExtractor';
import { YouTubeProcessor } from './YouTubeProcessor';

// Initialize the main content service
const contentService = new ContentService();

/**
 * Example 1: Basic content extraction from a website
 */
export async function extractWebsiteExample() {
  console.log('=== Website Content Extraction Example ===');
  
  const url = 'https://example.com/product/amazing-gadget';
  
  try {
    const result = await contentService.extractContent(url);
    
    if (result.success && result.content) {
      console.log('✅ Extraction successful!');
      console.log('Title:', result.content.title);
      console.log('Content Type:', result.content.contentType);
      console.log('Content Length:', result.content.textContent.length, 'characters');
      console.log('Images Found:', result.content.images.length);
      console.log('Language:', result.content.metadata.language);
      console.log('Tags:', result.content.metadata.tags.join(', '));
      
      // Display first few images
      result.content.images.slice(0, 3).forEach((image, index) => {
        console.log(`Image ${index + 1}:`, image.url);
        console.log(`  Alt text: ${image.alt}`);
        console.log(`  Dimensions: ${image.width}x${image.height}`);
      });
      
    } else {
      console.error('❌ Extraction failed:', result.error);
      if (result.urlValidation && !result.urlValidation.isValid) {
        console.error('URL validation error:', result.urlValidation.error);
      }
    }
    
    // Display any warnings
    if (result.warnings) {
      result.warnings.forEach(warning => {
        console.warn('⚠️ Warning:', warning);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

/**
 * Example 2: YouTube video content extraction
 */
export async function extractYouTubeExample() {
  console.log('\n=== YouTube Video Extraction Example ===');
  
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  try {
    const result = await contentService.extractContent(url, {
      youtube: {
        includeTranscript: true,
        transcriptLanguage: 'en',
        maxScreenshots: 5
      }
    });
    
    if (result.success && result.content) {
      console.log('✅ YouTube extraction successful!');
      console.log('Title:', result.content.title);
      console.log('Video ID:', result.content.videoContent?.videoId);
      console.log('Duration:', formatDuration(result.content.videoContent?.duration || 0));
      console.log('Channel:', result.content.metadata.author);
      
      // Display transcript info
      if (result.content.videoContent?.transcript) {
        const transcriptLength = result.content.videoContent.transcript.length;
        console.log('Transcript Length:', transcriptLength, 'characters');
        console.log('Transcript Preview:', 
          result.content.videoContent.transcript.substring(0, 100) + '...');
      }
      
      // Display key moments
      const keyMoments = result.content.videoContent?.keyMoments || [];
      console.log('Key Moments Found:', keyMoments.length);
      keyMoments.slice(0, 3).forEach((moment, index) => {
        console.log(`  ${index + 1}. [${formatTime(moment.timestamp)}] ${moment.description}`);
        console.log(`     Type: ${moment.actionType}, Importance: ${moment.importance}`);
      });
      
    } else {
      console.error('❌ YouTube extraction failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

/**
 * Example 3: Batch processing multiple URLs
 */
export async function batchProcessingExample() {
  console.log('\n=== Batch Processing Example ===');
  
  const urls = [
    'https://example.com/product1',
    'https://www.youtube.com/watch?v=video1',
    'https://example.com/product2',
    'https://youtu.be/video2',
    'invalid-url' // This will fail
  ];
  
  try {
    console.log(`Processing ${urls.length} URLs...`);
    const results = await contentService.extractMultipleUrls(urls);
    
    results.forEach((result, index) => {
      const url = urls[index];
      console.log(`\n${index + 1}. ${url}`);
      
      if (result.success && result.content) {
        console.log('   ✅ Success:', result.content.title);
        console.log('   Type:', result.content.contentType);
        console.log('   Content:', result.content.textContent.length, 'chars');
      } else {
        console.log('   ❌ Failed:', result.error);
      }
      
      if (result.warnings) {
        result.warnings.forEach(warning => {
          console.log('   ⚠️ Warning:', warning);
        });
      }
    });
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    console.log(`\nSummary: ${successful} successful, ${failed} failed`);
    
  } catch (error) {
    console.error('❌ Batch processing error:', error);
  }
}

/**
 * Example 4: URL validation and metadata extraction
 */
export async function urlAnalysisExample() {
  console.log('\n=== URL Analysis Example ===');
  
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&utm_source=test',
    'https://example.com/product?id=123&utm_campaign=summer',
    'https://youtu.be/shortVideo',
    'invalid-url',
    'ftp://example.com/file.txt'
  ];
  
  testUrls.forEach(url => {
    console.log(`\nAnalyzing: ${url}`);
    
    // Get comprehensive URL metadata
    const analysis = contentService.getUrlMetadata(url);
    
    console.log('  Validation:', analysis.validation.isValid ? '✅ Valid' : '❌ Invalid');
    console.log('  Type:', analysis.validation.type);
    
    if (analysis.validation.videoId) {
      console.log('  Video ID:', analysis.validation.videoId);
    }
    
    if (analysis.validation.error) {
      console.log('  Error:', analysis.validation.error);
    }
    
    if (analysis.metadata) {
      console.log('  Domain:', analysis.metadata.domain);
      console.log('  Protocol:', analysis.metadata.protocol);
      console.log('  Path:', analysis.metadata.path);
      
      if (Object.keys(analysis.metadata.queryParams).length > 0) {
        console.log('  Query Params:', Object.keys(analysis.metadata.queryParams).join(', '));
      }
    }
    
    console.log('  Normalized URL:', analysis.normalizedUrl);
  });
}

/**
 * Example 5: Custom extraction with specific options
 */
export async function customExtractionExample() {
  console.log('\n=== Custom Extraction Options Example ===');
  
  const websiteUrl = 'https://example.com/detailed-product';
  const youtubeUrl = 'https://www.youtube.com/watch?v=tutorial123';
  
  // Custom options for different content types
  const customOptions = {
    website: {
      includeImages: true,
      maxImages: 15,
      imageMinWidth: 200,
      imageMinHeight: 150,
      timeout: 45000, // 45 seconds
      userAgent: 'Thai-Document-Generator/1.0'
    },
    youtube: {
      includeTranscript: true,
      transcriptLanguage: 'th', // Try Thai first
      maxScreenshots: 8,
      timeout: 60000 // 60 seconds
    },
    validateUrl: true,
    checkAccessibility: true
  };
  
  try {
    // Extract website with custom options
    console.log('Extracting website with custom options...');
    const websiteResult = await contentService.extractContent(websiteUrl, customOptions);
    
    if (websiteResult.success) {
      console.log('✅ Website extraction with custom options successful');
      console.log('Images extracted:', websiteResult.content?.images.length);
    }
    
    // Extract YouTube with custom options
    console.log('\nExtracting YouTube with custom options...');
    const youtubeResult = await contentService.extractContent(youtubeUrl, customOptions);
    
    if (youtubeResult.success) {
      console.log('✅ YouTube extraction with custom options successful');
      console.log('Transcript language:', youtubeResult.content?.metadata.language);
    }
    
  } catch (error) {
    console.error('❌ Custom extraction error:', error);
  }
}

/**
 * Example 6: Individual component usage
 */
export async function individualComponentsExample() {
  console.log('\n=== Individual Components Example ===');
  
  // Using URLProcessor directly
  const urlProcessor = new URLProcessor();
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share';
  
  console.log('URL Processor:');
  console.log('  Original URL:', url);
  console.log('  Video ID:', urlProcessor.extractYouTubeVideoId(url));
  console.log('  Normalized:', urlProcessor.normalizeUrl(url));
  
  // Using ContentExtractor directly
  const contentExtractor = new ContentExtractor();
  console.log('\nContent Extractor:');
  
  try {
    const extractionResult = await contentExtractor.extractWebsiteContent('https://example.com');
    if (extractionResult.success) {
      const validation = contentExtractor.validateExtractedContent(extractionResult.content!);
      console.log('  Extraction valid:', validation.isValid);
      if (!validation.isValid) {
        console.log('  Issues:', validation.issues.join(', '));
      }
    }
  } catch (error) {
    console.log('  Extraction failed (expected for example.com)');
  }
  
  // Using YouTubeProcessor directly
  const youtubeProcessor = new YouTubeProcessor();
  console.log('\nYouTube Processor:');
  
  const testVideoUrl = 'https://youtu.be/dQw4w9WgXcQ';
  console.log('  Video ID from short URL:', youtubeProcessor.extractVideoId(testVideoUrl));
}

/**
 * Example 7: Error handling patterns
 */
export async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');
  
  const problematicUrls = [
    'https://nonexistent-domain-12345.com',
    'https://httpstat.us/404',
    'https://httpstat.us/500',
    'invalid-url-format',
    'ftp://not-supported.com'
  ];
  
  for (const url of problematicUrls) {
    console.log(`\nTesting: ${url}`);
    
    try {
      const result = await contentService.extractContent(url);
      
      if (result.success) {
        console.log('  ✅ Unexpected success');
      } else {
        console.log('  ❌ Expected failure:', result.error);
        
        // Categorize error types
        if (result.error?.includes('Invalid URL')) {
          console.log('  → URL format error');
        } else if (result.error?.includes('HTTP')) {
          console.log('  → HTTP error');
        } else if (result.error?.includes('timeout')) {
          console.log('  → Timeout error');
        } else if (result.error?.includes('Network')) {
          console.log('  → Network error');
        } else {
          console.log('  → Other error');
        }
      }
      
    } catch (error) {
      console.log('  💥 Unexpected exception:', error);
    }
  }
}

/**
 * Utility functions
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Content Extraction System Examples\n');
  
  await extractWebsiteExample();
  await extractYouTubeExample();
  await batchProcessingExample();
  await urlAnalysisExample();
  await customExtractionExample();
  await individualComponentsExample();
  await errorHandlingExample();
  
  console.log('\n✨ All examples completed!');
}

// All functions are already exported with their declarations above

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}