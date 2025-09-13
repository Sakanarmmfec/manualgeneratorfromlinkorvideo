import './test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentProcessor } from './ContentProcessor';
import { ExtractedContent, ProcessedContent, APIKeyError } from '@/types';
import { llmConnector } from './LLMConnector';
import { apiKeyManager } from '@/lib/config/APIKeyManager';

describe('ContentProcessor', () => {
  let contentProcessor: ContentProcessor;
  let mockExtractedContent: ExtractedContent;

  beforeEach(() => {
    contentProcessor = new ContentProcessor();
    
    mockExtractedContent = {
      url: 'https://example.com/product',
      title: 'Test Product',
      contentType: 'website',
      textContent: 'This is a test product with great features.',
      images: [],
      metadata: {
        title: 'Test Product',
        description: 'A great product',
        language: 'en',
        tags: ['product', 'test']
      },
      extractionTimestamp: new Date('2024-01-01')
    };

    // Reset mocks
    vi.clearAllMocks();
    
    // Mock API key manager
    vi.mocked(apiKeyManager.getKeyStatus).mockReturnValue('active');
    vi.mocked(apiKeyManager.hasFallbackKey).mockReturnValue(false);
    
    // Mock LLM connector
    vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
      content: 'Mocked AI response',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    });
  });

  describe('processContent', () => {
    it('should process website content successfully', async () => {
      // Mock translation response
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValueOnce({
          content: 'นี่คือผลิตภัณฑ์ทดสอบที่มีคุณสมบัติดีเยี่ยม',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
        // Mock section organization response
        .mockResolvedValueOnce({
          content: JSON.stringify({
            sections: [{
              id: 'introduction',
              title: 'บทนำ',
              content: 'นี่คือผลิตภัณฑ์ทดสอบที่มีคุณสมบัติดีเยี่ยม',
              sectionType: 'introduction',
              subsections: [],
              images: []
            }]
          }),
          usage: { promptTokens: 150, completionTokens: 100, totalTokens: 250 }
        })
        // Mock content refinement response
        .mockResolvedValueOnce({
          content: '# บทนำ\n\nนี่คือผลิตภัณฑ์ทดสอบที่มีคุณสมบัติดีเยี่ยม ผลิตภัณฑ์นี้ได้รับการออกแบบมาเพื่อตอบสนองความต้องการของผู้ใช้งาน',
          usage: { promptTokens: 200, completionTokens: 80, totalTokens: 280 }
        });

      const result = await contentProcessor.processContent(mockExtractedContent);

      expect(result).toBeDefined();
      expect(result.translatedContent).toBe('นี่คือผลิตภัณฑ์ทดสอบที่มีคุณสมบัติดีเยี่ยม');
      expect(result.organizedSections).toHaveLength(1);
      expect(result.organizedSections[0].title).toBe('บทนำ');
      expect(result.sourceAttribution.originalUrl).toBe(mockExtractedContent.url);
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should handle API key exhaustion with fallback', async () => {
      // Mock API key exhaustion
      vi.mocked(apiKeyManager.getKeyStatus).mockReturnValue('exhausted');
      vi.mocked(apiKeyManager.hasFallbackKey).mockReturnValue(true);
      vi.mocked(apiKeyManager.switchToFallback).mockImplementation(() => {});

      // Mock successful processing after fallback
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Processed with fallback key',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        });

      const result = await contentProcessor.processContent(mockExtractedContent);

      expect(apiKeyManager.switchToFallback).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when API key exhausted and no fallback available', async () => {
      vi.mocked(apiKeyManager.getKeyStatus).mockReturnValue('exhausted');
      vi.mocked(apiKeyManager.hasFallbackKey).mockReturnValue(false);

      await expect(contentProcessor.processContent(mockExtractedContent))
        .rejects.toThrow('Primary API key is exhausted and no user fallback key is available');
    });

    it('should handle LLM API errors gracefully', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValue(new APIKeyError('API request failed', 'API_ERROR', true));

      await expect(contentProcessor.processContent(mockExtractedContent))
        .rejects.toThrow(APIKeyError);
    });
  });

  describe('processVideoContent', () => {
    it('should process YouTube video content with enhanced structure', async () => {
      const videoExtractedContent: ExtractedContent = {
        ...mockExtractedContent,
        contentType: 'youtube_video',
        videoContent: {
          videoId: 'test123',
          duration: 300,
          transcript: 'This is a video transcript about the product.',
          keyMoments: [
            {
              timestamp: 60,
              description: 'Product introduction',
              importance: 'high',
              actionType: 'explanation'
            }
          ],
          screenshots: []
        }
      };

      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Enhanced video content processing',
          usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 }
        });

      const result = await contentProcessor.processVideoContent(videoExtractedContent);

      expect(result).toBeDefined();
      expect(result.translatedContent).toContain('Enhanced video content processing');
    });

    it('should throw error for non-video content', async () => {
      await expect(contentProcessor.processVideoContent(mockExtractedContent))
        .rejects.toThrow('Invalid content type for video processing');
    });
  });

  describe('processWebsiteContent', () => {
    it('should process website content successfully', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Processed website content',
          usage: { promptTokens: 150, completionTokens: 75, totalTokens: 225 }
        });

      const result = await contentProcessor.processWebsiteContent(mockExtractedContent);

      expect(result).toBeDefined();
      expect(result.translatedContent).toBe('Processed website content');
    });

    it('should throw error for non-website content', async () => {
      const videoContent = { ...mockExtractedContent, contentType: 'youtube_video' as const };
      
      await expect(contentProcessor.processWebsiteContent(videoContent))
        .rejects.toThrow('Invalid content type for website processing');
    });
  });

  describe('processMultipleContents', () => {
    it('should process and merge multiple content sources', async () => {
      const contents = [
        mockExtractedContent,
        { ...mockExtractedContent, url: 'https://example.com/product2', title: 'Product 2' }
      ];

      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Merged content processing',
          usage: { promptTokens: 300, completionTokens: 150, totalTokens: 450 }
        });

      const result = await contentProcessor.processMultipleContents(contents);

      expect(result).toBeDefined();
      expect(llmConnector.createChatCompletion).toHaveBeenCalledTimes(6); // 3 calls per content (translate, organize, refine)
    });

    it('should handle single content source', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Single content processing',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        });

      const result = await contentProcessor.processMultipleContents([mockExtractedContent]);

      expect(result).toBeDefined();
    });

    it('should throw error for empty content array', async () => {
      await expect(contentProcessor.processMultipleContents([]))
        .rejects.toThrow('No content provided for processing');
    });
  });

  describe('enhanceProcessedContent', () => {
    let mockProcessedContent: ProcessedContent;

    beforeEach(() => {
      mockProcessedContent = {
        translatedContent: 'Translated content',
        organizedSections: [{
          id: 'intro',
          title: 'Introduction',
          content: 'Content',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        refinedContent: 'Refined content',
        sourceAttribution: {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source attribution'
        },
        qualityScore: 75
      };
    });

    it('should enhance content with table of contents', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Enhanced content with TOC',
          usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 }
        });

      const result = await contentProcessor.enhanceProcessedContent(mockProcessedContent, {
        addTableOfContents: true
      });

      expect(result.refinedContent).toBe('Enhanced content with TOC');
      expect(result.qualityScore).toBeGreaterThan(mockProcessedContent.qualityScore);
    });

    it('should handle enhancement failures gracefully', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValue(new Error('Enhancement failed'));

      const result = await contentProcessor.enhanceProcessedContent(mockProcessedContent, {
        addTableOfContents: true
      });

      // Should return original content when enhancement fails
      expect(result).toEqual(mockProcessedContent);
    });
  });

  describe('error handling', () => {
    it('should handle translation failures with fallback', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValueOnce(new APIKeyError('Translation failed', 'TRANSLATION_ERROR', true))
        .mockResolvedValue({
          content: 'Fallback translation',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        });

      vi.mocked(apiKeyManager.hasFallbackKey).mockReturnValue(true);

      const result = await contentProcessor.processContent(mockExtractedContent);

      expect(apiKeyManager.switchToFallback).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle non-recoverable API errors', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValue(new APIKeyError('Non-recoverable error', 'FATAL_ERROR', false));

      await expect(contentProcessor.processContent(mockExtractedContent))
        .rejects.toThrow('Non-recoverable error');
    });
  });
});