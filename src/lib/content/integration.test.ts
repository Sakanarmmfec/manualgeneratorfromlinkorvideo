/**
 * Integration tests for content extraction system
 * Tests the complete workflow from URL input to content extraction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentService } from './ContentService';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Content Extraction Integration', () => {
  let contentService: ContentService;

  beforeEach(() => {
    contentService = new ContentService();
    vi.clearAllMocks();
  });

  describe('Website Content Extraction Workflow', () => {
    it('should complete full website extraction workflow', async () => {
      const testUrl = 'https://example.com/product/123';
      const mockHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Amazing Product - Example Store</title>
          <meta name="description" content="This is an amazing product with great features">
          <meta name="author" content="Example Store">
          <meta name="keywords" content="product, amazing, store, shopping">
          <meta property="og:title" content="Amazing Product">
          <meta property="og:description" content="Enhanced product description">
        </head>
        <body>
          <header>
            <nav>Navigation menu</nav>
          </header>
          <main>
            <h1>Amazing Product</h1>
            <div class="product-info">
              <p>This product is designed to solve your everyday problems with innovative technology.</p>
              <p>Key features include:</p>
              <ul>
                <li>Feature 1: Advanced functionality</li>
                <li>Feature 2: User-friendly design</li>
                <li>Feature 3: Reliable performance</li>
              </ul>
              <p>Technical specifications and detailed information about usage scenarios.</p>
            </div>
            <div class="images">
              <img src="https://example.com/images/product-main.jpg" alt="Main product image" width="400" height="300">
              <img src="https://example.com/images/product-detail.jpg" alt="Product detail view" width="300" height="200">
              <img src="https://example.com/images/small-icon.jpg" alt="Small icon" width="20" height="20">
            </div>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await contentService.extractContent(testUrl, {
        website: {
          includeImages: true,
          maxImages: 5,
          imageMinWidth: 50,
          imageMinHeight: 50
        },
        validateUrl: true,
        checkAccessibility: false
      });

      // Verify successful extraction
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.urlValidation?.isValid).toBe(true);
      expect(result.urlValidation?.type).toBe('website');

      // Verify content structure
      const content = result.content!;
      expect(content.contentType).toBe('website');
      expect(content.url).toBe(testUrl);
      expect(content.title).toBe('Amazing Product'); // Should prefer OG title
      expect(content.textContent).toContain('Amazing Product');
      expect(content.textContent).toContain('innovative technology');
      expect(content.textContent).toContain('Advanced functionality');

      // Verify metadata extraction
      expect(content.metadata.title).toBe('Amazing Product');
      expect(content.metadata.description).toBe('Enhanced product description'); // OG description
      expect(content.metadata.author).toBe('Example Store');
      expect(content.metadata.language).toBe('en');
      expect(content.metadata.tags).toEqual(['product', 'amazing', 'store', 'shopping']);

      // Verify image extraction (should exclude small icon)
      expect(content.images).toHaveLength(2);
      expect(content.images[0].url).toBe('https://example.com/images/product-main.jpg');
      expect(content.images[0].width).toBe(400);
      expect(content.images[0].height).toBe(300);
      expect(content.images[1].url).toBe('https://example.com/images/product-detail.jpg');

      // Verify extraction timestamp
      expect(content.extractionTimestamp).toBeInstanceOf(Date);
    });

    it('should handle website extraction with minimal content', async () => {
      const testUrl = 'https://minimal.example.com';
      const mockHtml = `
        <html>
        <head><title>Minimal Page</title></head>
        <body><p>Very short content.</p></body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await contentService.extractContent(testUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content validation failed');
      expect(result.warnings).toContain('Insufficient text content (less than 100 characters)');
    });
  });

  describe('YouTube Content Extraction Workflow', () => {
    it('should complete full YouTube extraction workflow', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      const mockVideoPageHtml = `
        <html>
        <head>
          <title>Never Gonna Give You Up - Rick Astley - YouTube</title>
        </head>
        <body>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Never Gonna Give You Up",
                "shortDescription": "The official video for Rick Astley's classic hit song",
                "lengthSeconds": "213",
                "author": "Rick Astley",
                "viewCount": "1000000000"
              }
            };
          </script>
        </body>
        </html>
      `;

      const mockTranscriptXml = `
        <?xml version="1.0" encoding="utf-8" ?>
        <transcript>
          <text start="0" dur="4.5">We're no strangers to love</text>
          <text start="4.5" dur="4.2">You know the rules and so do I</text>
          <text start="8.7" dur="4.8">A full commitment's what I'm thinking of</text>
          <text start="13.5" dur="5.1">You wouldn't get this from any other guy</text>
          <text start="18.6" dur="3.9">I just wanna tell you how I'm feeling</text>
          <text start="22.5" dur="3.6">Gotta make you understand</text>
          <text start="26.1" dur="4.2">Never gonna give you up</text>
          <text start="30.3" dur="4.1">Never gonna let you down</text>
        </transcript>
      `;

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockVideoPageHtml)
          });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockTranscriptXml)
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await contentService.extractContent(testUrl, {
        youtube: {
          includeTranscript: true,
          transcriptLanguage: 'en'
        }
      });

      // Verify successful extraction
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.urlValidation?.isValid).toBe(true);
      expect(result.urlValidation?.type).toBe('youtube_video');
      expect(result.urlValidation?.videoId).toBe('dQw4w9WgXcQ');

      // Verify content structure
      const content = result.content!;
      expect(content.contentType).toBe('youtube_video');
      expect(content.url).toBe(testUrl);
      expect(content.title).toBe('Never Gonna Give You Up');

      // Verify video content
      expect(content.videoContent).toBeDefined();
      expect(content.videoContent?.videoId).toBe('dQw4w9WgXcQ');
      expect(content.videoContent?.duration).toBe(213);
      expect(content.videoContent?.transcript).toContain('We\'re no strangers to love');
      expect(content.videoContent?.transcript).toContain('Never gonna give you up');

      // Verify key moments extraction
      expect(content.videoContent?.keyMoments).toBeDefined();
      expect(content.videoContent?.keyMoments.length).toBeGreaterThan(0);

      // Verify metadata
      expect(content.metadata.title).toBe('Never Gonna Give You Up');
      expect(content.metadata.description).toBe('The official video for Rick Astley\'s classic hit song');
      expect(content.metadata.author).toBe('Rick Astley');

      // Verify thumbnail image
      expect(content.images).toHaveLength(1);
      expect(content.images[0].url).toContain('maxresdefault.jpg');
      expect(content.images[0].alt).toContain('Never Gonna Give You Up');

      // Verify text summary
      expect(content.textContent).toContain('Title: Never Gonna Give You Up');
      expect(content.textContent).toContain('Duration: 3:33');
      expect(content.textContent).toContain('Channel: Rick Astley');
      expect(content.textContent).toContain('Transcript:');
    });

    it('should handle YouTube video without transcript', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=noTranscript';
      
      const mockVideoPageHtml = `
        <html>
        <body>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Silent Video",
                "shortDescription": "A video without transcript",
                "lengthSeconds": "120"
              }
            };
          </script>
        </body>
        </html>
      `;

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockVideoPageHtml)
          });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({
            ok: false,
            status: 404
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await contentService.extractContent(testUrl);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain('Transcript extraction failed');
      expect(result.content?.videoContent?.transcript).toBe('');
      expect(result.content?.videoContent?.keyMoments).toBeDefined();
      expect(result.content?.videoContent?.keyMoments.length).toBeGreaterThan(0); // Should create basic moments
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await contentService.extractContent('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle HTTP errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await contentService.extractContent('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 404');
    });

    it('should validate URLs before processing', async () => {
      const result = await contentService.extractContent('invalid-url');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid URL format');
      expect(result.urlValidation?.isValid).toBe(false);
    });
  });

  describe('Multiple URL Processing', () => {
    it('should process multiple URLs concurrently', async () => {
      const urls = [
        'https://example1.com',
        'https://www.youtube.com/watch?v=test123',
        'https://example2.com'
      ];

      const mockHtml1 = '<html><head><title>Page 1</title></head><body><p>' + 'Content 1 '.repeat(20) + '</p></body></html>';
      const mockHtml2 = '<html><head><title>Page 2</title></head><body><p>' + 'Content 2 '.repeat(20) + '</p></body></html>';
      const mockVideoHtml = `
        <html><body>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Test Video",
                "shortDescription": "Test description",
                "lengthSeconds": "60"
              }
            };
          </script>
        </body></html>
      `;

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('example1.com')) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(mockHtml1) });
        }
        if (url.includes('example2.com')) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(mockHtml2) });
        }
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(mockVideoHtml) });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const results = await contentService.extractMultipleUrls(urls);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[0].content?.title).toBe('Page 1');
      expect(results[1].success).toBe(true);
      expect(results[1].content?.title).toBe('Test Video');
      expect(results[2].success).toBe(true);
      expect(results[2].content?.title).toBe('Page 2');
    });
  });

  describe('Service Utility Methods', () => {
    it('should provide comprehensive URL analysis', () => {
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&utm_source=test';
      
      const metadata = contentService.getUrlMetadata(testUrl);
      
      expect(metadata.validation.isValid).toBe(true);
      expect(metadata.validation.type).toBe('youtube_video');
      expect(metadata.validation.videoId).toBe('dQw4w9WgXcQ');
      expect(metadata.normalizedUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
      expect(metadata.metadata?.domain).toBe('www.youtube.com');
    });

    it('should identify content types correctly', () => {
      expect(contentService.isYouTubeUrl('https://www.youtube.com/watch?v=123')).toBe(true);
      expect(contentService.isYouTubeUrl('https://example.com')).toBe(false);
      
      expect(contentService.getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(contentService.getYouTubeVideoId('https://example.com')).toBeNull();
    });

    it('should provide configuration information', () => {
      const supportedTypes = contentService.getSupportedTypes();
      expect(supportedTypes).toContain('website');
      expect(supportedTypes).toContain('youtube_video');

      const defaultOptions = contentService.getDefaultOptions();
      expect(defaultOptions.website?.includeImages).toBe(true);
      expect(defaultOptions.youtube?.includeTranscript).toBe(true);
      expect(defaultOptions.validateUrl).toBe(true);
    });
  });
});