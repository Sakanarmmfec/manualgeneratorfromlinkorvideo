/**
 * Tests for URLProcessor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { URLProcessor } from './URLProcessor';

describe('URLProcessor', () => {
  let processor: URLProcessor;

  beforeEach(() => {
    processor = new URLProcessor();
  });

  describe('validateUrl', () => {
    it('should validate YouTube URLs correctly', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: { isValid: true, type: 'youtube_video', videoId: 'dQw4w9WgXcQ' }
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expected: { isValid: true, type: 'youtube_video', videoId: 'dQw4w9WgXcQ' }
        },
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expected: { isValid: true, type: 'youtube_video', videoId: 'dQw4w9WgXcQ' }
        },
        {
          url: 'https://youtube.com/v/dQw4w9WgXcQ',
          expected: { isValid: true, type: 'youtube_video', videoId: 'dQw4w9WgXcQ' }
        }
      ];

      testCases.forEach(({ url, expected }) => {
        const result = processor.validateUrl(url);
        expect(result.isValid).toBe(expected.isValid);
        expect(result.type).toBe(expected.type);
        expect(result.videoId).toBe(expected.videoId);
      });
    });

    it('should validate website URLs correctly', () => {
      const testCases = [
        {
          url: 'https://www.example.com',
          expected: { isValid: true, type: 'website' }
        },
        {
          url: 'http://example.com/product/123',
          expected: { isValid: true, type: 'website' }
        },
        {
          url: 'https://shop.example.com/products/item?id=123',
          expected: { isValid: true, type: 'website' }
        }
      ];

      testCases.forEach(({ url, expected }) => {
        const result = processor.validateUrl(url);
        expect(result.isValid).toBe(expected.isValid);
        expect(result.type).toBe(expected.type);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'https://localhost',
        'https://127.0.0.1',
        'javascript:alert("xss")',
        ''
      ];

      invalidUrls.forEach(url => {
        const result = processor.validateUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.type).toBe('invalid');
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('extractYouTubeVideoId', () => {
    it('should extract video IDs from various YouTube URL formats', () => {
      const testCases = [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://youtube.com/v/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s', expected: 'dQw4w9WgXcQ' },
        { url: 'https://example.com', expected: null },
        { url: 'invalid-url', expected: null }
      ];

      testCases.forEach(({ url, expected }) => {
        const result = processor.extractYouTubeVideoId(url);
        expect(result).toBe(expected);
      });
    });
  });

  describe('extractUrlMetadata', () => {
    it('should extract URL metadata correctly', () => {
      const url = 'https://example.com/path/to/page?param1=value1&param2=value2#section';
      const metadata = processor.extractUrlMetadata(url);

      expect(metadata).toEqual({
        domain: 'example.com',
        protocol: 'https:',
        path: '/path/to/page',
        queryParams: {
          param1: 'value1',
          param2: 'value2'
        },
        fragment: 'section'
      });
    });

    it('should handle URLs without query params or fragments', () => {
      const url = 'https://example.com/simple-path';
      const metadata = processor.extractUrlMetadata(url);

      expect(metadata).toEqual({
        domain: 'example.com',
        protocol: 'https:',
        path: '/simple-path',
        queryParams: {},
        fragment: undefined
      });
    });

    it('should return null for invalid URLs', () => {
      const metadata = processor.extractUrlMetadata('invalid-url');
      expect(metadata).toBeNull();
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize YouTube URLs', () => {
      const testCases = [
        {
          input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&utm_source=test',
          expected: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
          input: 'https://youtu.be/dQw4w9WgXcQ?t=30',
          expected: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = processor.normalizeUrl(input);
        expect(result).toBe(expected);
      });
    });

    it('should remove tracking parameters from regular URLs', () => {
      const input = 'https://example.com/product?utm_source=google&utm_medium=cpc&id=123&fbclid=test#section';
      const result = processor.normalizeUrl(input);
      expect(result).toBe('https://example.com/product?id=123');
    });

    it('should return original URL if normalization fails', () => {
      const invalidUrl = 'invalid-url';
      const result = processor.normalizeUrl(invalidUrl);
      expect(result).toBe(invalidUrl);
    });
  });

  describe('validateUrls', () => {
    it('should validate multiple URLs', () => {
      const urls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://example.com',
        'invalid-url'
      ];

      const results = processor.validateUrls(urls);
      
      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[0].type).toBe('youtube_video');
      expect(results[1].isValid).toBe(true);
      expect(results[1].type).toBe('website');
      expect(results[2].isValid).toBe(false);
      expect(results[2].type).toBe('invalid');
    });
  });
});