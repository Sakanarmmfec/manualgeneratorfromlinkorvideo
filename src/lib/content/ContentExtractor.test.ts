/**
 * Tests for ContentExtractor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentExtractor } from './ContentExtractor';

// Mock fetch globally
global.fetch = vi.fn();

describe('ContentExtractor', () => {
  let extractor: ContentExtractor;

  beforeEach(() => {
    extractor = new ContentExtractor();
    vi.clearAllMocks();
  });

  describe('extractWebsiteContent', () => {
    it('should extract content from a simple HTML page', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Test Page</title>
          <meta name="description" content="Test description">
          <meta name="author" content="Test Author">
          <meta name="keywords" content="test, page, content">
        </head>
        <body>
          <main>
            <h1>Main Title</h1>
            <p>This is the main content of the page.</p>
            <p>It contains multiple paragraphs with useful information.</p>
            <img src="https://example.com/image1.jpg" alt="Test Image 1" width="300" height="200">
            <img src="https://example.com/image2.jpg" alt="Test Image 2">
          </main>
        </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await extractor.extractWebsiteContent('https://example.com');

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      
      if (result.content) {
        expect(result.content.title).toBe('Test Page');
        expect(result.content.contentType).toBe('website');
        expect(result.content.textContent).toContain('Main Title');
        expect(result.content.textContent).toContain('main content');
        expect(result.content.metadata.description).toBe('Test description');
        expect(result.content.metadata.author).toBe('Test Author');
        expect(result.content.metadata.tags).toEqual(['test', 'page', 'content']);
        expect(result.content.images).toHaveLength(2);
        expect(result.content.images[0].url).toBe('https://example.com/image1.jpg');
        expect(result.content.images[0].width).toBe(300);
        expect(result.content.images[0].height).toBe(200);
      }
    });

    it('should handle pages with Open Graph metadata', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Original Title</title>
          <meta property="og:title" content="OG Title">
          <meta property="og:description" content="OG Description">
          <meta property="article:author" content="OG Author">
          <meta property="article:published_time" content="2023-01-01T00:00:00Z">
        </head>
        <body>
          <article>
            <h1>Article Title</h1>
            <p>Article content goes here.</p>
          </article>
        </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await extractor.extractWebsiteContent('https://example.com');

      expect(result.success).toBe(true);
      expect(result.content?.title).toBe('OG Title'); // Should prefer OG title
      expect(result.content?.metadata.description).toBe('OG Description');
      expect(result.content?.metadata.author).toBe('OG Author');
      expect(result.content?.metadata.publishDate).toEqual(new Date('2023-01-01T00:00:00Z'));
    });

    it('should handle extraction errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await extractor.extractWebsiteContent('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle HTTP errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await extractor.extractWebsiteContent('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 404');
    });

    it('should filter out small and invalid images', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <img src="https://example.com/large.jpg" width="500" height="400" alt="Large image">
          <img src="https://example.com/small.jpg" width="50" height="30" alt="Small image">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Data URL">
          <img src="https://example.com/1x1.gif" alt="Tracking pixel">
          <img src="/relative-image.jpg" alt="Relative URL">
        </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await extractor.extractWebsiteContent('https://example.com');

      expect(result.success).toBe(true);
      expect(result.content?.images).toHaveLength(2); // Only large image and relative URL (converted to absolute)
      expect(result.content?.images[0].url).toBe('https://example.com/large.jpg');
      expect(result.content?.images[1].url).toBe('https://example.com/relative-image.jpg');
    });
  });

  describe('validateExtractedContent', () => {
    it('should validate good content', () => {
      const content = {
        url: 'https://example.com',
        title: 'Good Title',
        contentType: 'website' as const,
        textContent: 'This is a good amount of content that should pass validation. '.repeat(10),
        images: [],
        metadata: {
          title: 'Good Title',
          language: 'en',
          tags: []
        },
        extractionTimestamp: new Date()
      };

      const validation = extractor.validateExtractedContent(content);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should identify content issues', () => {
      const content = {
        url: 'https://example.com',
        title: '',
        contentType: 'website' as const,
        textContent: 'Short',
        images: [],
        metadata: {
          title: '',
          language: '',
          tags: []
        },
        extractionTimestamp: new Date()
      };

      const validation = extractor.validateExtractedContent(content);
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('No title found');
      expect(validation.issues).toContain('Insufficient text content (less than 100 characters)');
      expect(validation.issues).toContain('Language not detected');
    });

    it('should identify content that is too large', () => {
      const content = {
        url: 'https://example.com',
        title: 'Good Title',
        contentType: 'website' as const,
        textContent: 'x'.repeat(100001), // Over 100k characters
        images: [],
        metadata: {
          title: 'Good Title',
          language: 'en',
          tags: []
        },
        extractionTimestamp: new Date()
      };

      const validation = extractor.validateExtractedContent(content);
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Content too large (over 100,000 characters)');
    });
  });

  describe('extractMultipleUrls', () => {
    it('should extract content from multiple URLs', async () => {
      const mockHtml1 = '<html><head><title>Page 1</title></head><body><p>Content 1</p></body></html>';
      const mockHtml2 = '<html><head><title>Page 2</title></head><body><p>Content 2</p></body></html>';

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockHtml1)
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockHtml2)
        });

      const urls = ['https://example1.com', 'https://example2.com'];
      const results = await extractor.extractMultipleUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].content?.title).toBe('Page 1');
      expect(results[1].success).toBe(true);
      expect(results[1].content?.title).toBe('Page 2');
    });
  });
});