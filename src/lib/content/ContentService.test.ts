/**
 * Tests for ContentService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentService } from './ContentService';

// Mock the dependencies
vi.mock('./URLProcessor');
vi.mock('./ContentExtractor');
vi.mock('./YouTubeProcessor');

import { URLProcessor } from './URLProcessor';
import { ContentExtractor } from './ContentExtractor';
import { YouTubeProcessor } from './YouTubeProcessor';

describe('ContentService', () => {
  let service: ContentService;
  let mockUrlProcessor: any;
  let mockContentExtractor: any;
  let mockYouTubeProcessor: any;

  beforeEach(() => {
    // Create mock instances
    mockUrlProcessor = {
      validateUrl: vi.fn(),
      normalizeUrl: vi.fn(),
      checkUrlAccessibility: vi.fn(),
      validateUrls: vi.fn(),
      extractUrlMetadata: vi.fn()
    };

    mockContentExtractor = {
      extractWebsiteContent: vi.fn(),
      validateExtractedContent: vi.fn()
    };

    mockYouTubeProcessor = {
      processYouTubeVideo: vi.fn(),
      extractVideoId: vi.fn()
    };

    // Mock the constructors
    (URLProcessor as any).mockImplementation(() => mockUrlProcessor);
    (ContentExtractor as any).mockImplementation(() => mockContentExtractor);
    (YouTubeProcessor as any).mockImplementation(() => mockYouTubeProcessor);

    service = new ContentService();
  });

  describe('extractContent', () => {
    it('should extract content from a valid website URL', async () => {
      const url = 'https://example.com';
      const mockContent = {
        url,
        title: 'Test Page',
        contentType: 'website' as const,
        textContent: 'Test content',
        images: [],
        metadata: { title: 'Test Page', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      // Setup mocks
      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: true,
        type: 'website',
        url
      });
      mockUrlProcessor.normalizeUrl.mockReturnValue(url);
      mockContentExtractor.extractWebsiteContent.mockResolvedValue({
        success: true,
        content: mockContent
      });
      mockContentExtractor.validateExtractedContent.mockReturnValue({
        isValid: true,
        issues: []
      });

      const result = await service.extractContent(url);

      expect(result.success).toBe(true);
      expect(result.content).toEqual(mockContent);
      expect(result.urlValidation?.type).toBe('website');
      expect(mockUrlProcessor.validateUrl).toHaveBeenCalledWith(url);
      expect(mockContentExtractor.extractWebsiteContent).toHaveBeenCalledWith(url, undefined);
    });

    it('should extract content from a valid YouTube URL', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const mockContent = {
        url,
        title: 'Test Video',
        contentType: 'youtube_video' as const,
        textContent: 'Test video content',
        videoContent: {
          videoId: 'dQw4w9WgXcQ',
          duration: 180,
          transcript: 'Test transcript',
          keyMoments: [],
          screenshots: []
        },
        images: [],
        metadata: { title: 'Test Video', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      // Setup mocks
      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: true,
        type: 'youtube_video',
        url,
        videoId: 'dQw4w9WgXcQ'
      });
      mockUrlProcessor.normalizeUrl.mockReturnValue(url);
      mockYouTubeProcessor.processYouTubeVideo.mockResolvedValue({
        success: true,
        content: mockContent
      });

      const result = await service.extractContent(url);

      expect(result.success).toBe(true);
      expect(result.content).toEqual(mockContent);
      expect(result.urlValidation?.type).toBe('youtube_video');
      expect(mockYouTubeProcessor.processYouTubeVideo).toHaveBeenCalledWith(url, undefined);
    });

    it('should handle invalid URLs', async () => {
      const url = 'invalid-url';

      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: false,
        type: 'invalid',
        url,
        error: 'Invalid URL format'
      });

      const result = await service.extractContent(url);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid URL format');
      expect(result.urlValidation?.isValid).toBe(false);
    });

    it('should handle content extraction failures', async () => {
      const url = 'https://example.com';

      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: true,
        type: 'website',
        url
      });
      mockUrlProcessor.normalizeUrl.mockReturnValue(url);
      mockContentExtractor.extractWebsiteContent.mockResolvedValue({
        success: false,
        error: 'Failed to fetch content'
      });

      const result = await service.extractContent(url);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch content');
    });

    it('should handle content validation failures', async () => {
      const url = 'https://example.com';
      const mockContent = {
        url,
        title: '',
        contentType: 'website' as const,
        textContent: 'Short',
        images: [],
        metadata: { title: '', language: '', tags: [] },
        extractionTimestamp: new Date()
      };

      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: true,
        type: 'website',
        url
      });
      mockUrlProcessor.normalizeUrl.mockReturnValue(url);
      mockContentExtractor.extractWebsiteContent.mockResolvedValue({
        success: true,
        content: mockContent
      });
      mockContentExtractor.validateExtractedContent.mockReturnValue({
        isValid: false,
        issues: ['No title found', 'Insufficient content']
      });

      const result = await service.extractContent(url);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content validation failed');
      expect(result.warnings).toEqual(['No title found', 'Insufficient content']);
    });

    it('should check URL accessibility when requested', async () => {
      const url = 'https://example.com';

      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: true,
        type: 'website',
        url
      });
      mockUrlProcessor.normalizeUrl.mockReturnValue(url);
      mockUrlProcessor.checkUrlAccessibility.mockResolvedValue({
        accessible: false,
        error: 'Connection timeout'
      });
      mockContentExtractor.extractWebsiteContent.mockResolvedValue({
        success: true,
        content: {
          url,
          title: 'Test',
          contentType: 'website' as const,
          textContent: 'Test content',
          images: [],
          metadata: { title: 'Test', language: 'en', tags: [] },
          extractionTimestamp: new Date()
        }
      });
      mockContentExtractor.validateExtractedContent.mockReturnValue({
        isValid: true,
        issues: []
      });

      const result = await service.extractContent(url, { checkAccessibility: true });

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('URL may not be accessible: Connection timeout');
      expect(mockUrlProcessor.checkUrlAccessibility).toHaveBeenCalledWith(url);
    });
  });

  describe('extractMultipleUrls', () => {
    it('should extract content from multiple URLs', async () => {
      const urls = ['https://example1.com', 'https://example2.com'];

      mockUrlProcessor.validateUrl
        .mockReturnValueOnce({ isValid: true, type: 'website', url: urls[0] })
        .mockReturnValueOnce({ isValid: true, type: 'website', url: urls[1] });
      
      mockUrlProcessor.normalizeUrl
        .mockReturnValueOnce(urls[0])
        .mockReturnValueOnce(urls[1]);

      mockContentExtractor.extractWebsiteContent
        .mockResolvedValueOnce({
          success: true,
          content: {
            url: urls[0],
            title: 'Page 1',
            contentType: 'website' as const,
            textContent: 'Content 1',
            images: [],
            metadata: { title: 'Page 1', language: 'en', tags: [] },
            extractionTimestamp: new Date()
          }
        })
        .mockResolvedValueOnce({
          success: true,
          content: {
            url: urls[1],
            title: 'Page 2',
            contentType: 'website' as const,
            textContent: 'Content 2',
            images: [],
            metadata: { title: 'Page 2', language: 'en', tags: [] },
            extractionTimestamp: new Date()
          }
        });

      mockContentExtractor.validateExtractedContent.mockReturnValue({
        isValid: true,
        issues: []
      });

      const results = await service.extractMultipleUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].content?.title).toBe('Page 1');
      expect(results[1].success).toBe(true);
      expect(results[1].content?.title).toBe('Page 2');
    });
  });

  describe('utility methods', () => {
    it('should validate multiple URLs', () => {
      const urls = ['https://example.com', 'https://youtube.com/watch?v=123'];
      const mockResults = [
        { isValid: true, type: 'website', url: urls[0] },
        { isValid: true, type: 'youtube_video', url: urls[1], videoId: '123' }
      ];

      mockUrlProcessor.validateUrls.mockReturnValue(mockResults);

      const results = service.validateUrls(urls);

      expect(results).toEqual(mockResults);
      expect(mockUrlProcessor.validateUrls).toHaveBeenCalledWith(urls);
    });

    it('should get URL metadata', () => {
      const url = 'https://example.com/path?param=value';
      const mockValidation = { isValid: true, type: 'website', url };
      const mockMetadata = {
        domain: 'example.com',
        protocol: 'https:',
        path: '/path',
        queryParams: { param: 'value' }
      };
      const normalizedUrl = 'https://example.com/path';

      mockUrlProcessor.validateUrl.mockReturnValue(mockValidation);
      mockUrlProcessor.extractUrlMetadata.mockReturnValue(mockMetadata);
      mockUrlProcessor.normalizeUrl.mockReturnValue(normalizedUrl);

      const result = service.getUrlMetadata(url);

      expect(result).toEqual({
        validation: mockValidation,
        metadata: mockMetadata,
        normalizedUrl
      });
    });

    it('should check if URL is YouTube', () => {
      mockUrlProcessor.validateUrl.mockReturnValue({
        isValid: true,
        type: 'youtube_video',
        url: 'https://youtube.com/watch?v=123'
      });

      const result = service.isYouTubeUrl('https://youtube.com/watch?v=123');

      expect(result).toBe(true);
    });

    it('should get YouTube video ID', () => {
      mockYouTubeProcessor.extractVideoId.mockReturnValue('dQw4w9WgXcQ');

      const result = service.getYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ');

      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should return supported types', () => {
      const types = service.getSupportedTypes();
      expect(types).toEqual(['website', 'youtube_video']);
    });

    it('should return default options', () => {
      const options = service.getDefaultOptions();
      expect(options).toHaveProperty('website');
      expect(options).toHaveProperty('youtube');
      expect(options.validateUrl).toBe(true);
      expect(options.checkAccessibility).toBe(false);
    });
  });
});