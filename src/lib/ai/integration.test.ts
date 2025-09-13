import './test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentProcessor } from './ContentProcessor';
import { VideoContentAnalyzer } from './VideoContentAnalyzer';
import { LLMConnector } from './LLMConnector';
import { processedContentUtils } from './ProcessedContentModel';
import { ExtractedContent, ProcessedContent, VideoContent } from '@/types';
import { apiKeyManager } from '@/lib/config/APIKeyManager';

describe('AI Processing Engine Integration', () => {
  let contentProcessor: ContentProcessor;
  let videoContentAnalyzer: VideoContentAnalyzer;
  let llmConnector: LLMConnector;

  beforeEach(() => {
    contentProcessor = new ContentProcessor();
    videoContentAnalyzer = new VideoContentAnalyzer();
    llmConnector = new LLMConnector();

    // Reset mocks
    vi.clearAllMocks();

    // Mock API key manager
    vi.mocked(apiKeyManager.getKeyStatus).mockReturnValue('active');
    vi.mocked(apiKeyManager.hasFallbackKey).mockReturnValue(false);
  });

  describe('End-to-End Content Processing', () => {
    it('should process website content from extraction to final document', async () => {
      const mockExtractedContent: ExtractedContent = {
        url: 'https://example.com/product',
        title: 'Amazing Product X',
        contentType: 'website',
        textContent: 'This is an amazing product with great features. It has advanced technology and user-friendly interface. Perfect for professionals and beginners alike.',
        images: [
          {
            url: 'https://example.com/image1.jpg',
            alt: 'Product image',
            caption: 'Main product view'
          }
        ],
        metadata: {
          title: 'Amazing Product X',
          description: 'Revolutionary product for modern users',
          language: 'en',
          tags: ['product', 'technology', 'innovation']
        },
        extractionTimestamp: new Date('2024-01-01')
      };

      // Mock LLM responses for the complete pipeline
      vi.mocked(llmConnector.createChatCompletion)
        // Translation response
        .mockResolvedValueOnce({
          content: 'นี่คือผลิตภัณฑ์ที่น่าทึ่งพร้อมคุณสมบัติที่ยอดเยี่ยม มีเทคโนโลยีขั้นสูงและอินเทอร์เฟซที่ใช้งานง่าย เหมาะสำหรับผู้เชี่ยวชาญและผู้เริ่มต้น',
          usage: { promptTokens: 100, completionTokens: 80, totalTokens: 180 }
        })
        // Section organization response
        .mockResolvedValueOnce({
          content: JSON.stringify({
            sections: [
              {
                id: 'introduction',
                title: 'บทนำ',
                content: 'ผลิตภัณฑ์ X เป็นนวัตกรรมใหม่ที่จะเปลี่ยนแปลงวิธีการทำงานของคุณ',
                sectionType: 'introduction',
                subsections: [],
                images: []
              },
              {
                id: 'features',
                title: 'คุณสมบัติ',
                content: 'เทคโนโลยีขั้นสูง อินเทอร์เฟซที่ใช้งานง่าย เหมาะสำหรับทุกระดับผู้ใช้',
                sectionType: 'features',
                subsections: [],
                images: []
              }
            ]
          }),
          usage: { promptTokens: 150, completionTokens: 120, totalTokens: 270 }
        })
        // Content refinement response
        .mockResolvedValueOnce({
          content: '# บทนำ\n\nผลิตภัณฑ์ X เป็นนวัตกรรมใหม่ที่จะเปลี่ยนแปลงวิธีการทำงานของคุณ ด้วยการออกแบบที่ทันสมัยและฟังก์ชันที่ครบครัน\n\n# คุณสมบัติ\n\nเทคโนโลยีขั้นสูงที่ผสานกับอินเทอร์เฟซที่ใช้งานง่าย ทำให้เหมาะสำหรับผู้ใช้ทุกระดับ ตั้งแต่ผู้เริ่มต้นจนถึงผู้เชี่ยวชาญ',
          usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 }
        });

      const result = await contentProcessor.processContent(mockExtractedContent, 'product_document');

      expect(result).toBeDefined();
      expect(result.translatedContent).toContain('ผลิตภัณฑ์ที่น่าทึ่ง');
      expect(result.organizedSections).toHaveLength(2);
      expect(result.organizedSections[0].title).toBe('บทนำ');
      expect(result.organizedSections[1].title).toBe('คุณสมบัติ');
      expect(result.refinedContent).toContain('# บทนำ');
      expect(result.sourceAttribution.originalUrl).toBe(mockExtractedContent.url);
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should process YouTube video content with full analysis pipeline', async () => {
      const mockVideoContent: VideoContent = {
        videoId: 'abc123',
        duration: 600,
        transcript: 'Welcome to this tutorial. First, we will install the software by downloading it from the official website. Then we will configure the settings according to your needs. Finally, we will test the installation to make sure everything works correctly.',
        keyMoments: [],
        screenshots: []
      };

      const mockExtractedContent: ExtractedContent = {
        url: 'https://youtube.com/watch?v=abc123',
        title: 'Software Installation Tutorial',
        contentType: 'youtube_video',
        textContent: 'Complete guide to installing and configuring the software',
        videoContent: mockVideoContent,
        images: [],
        metadata: {
          title: 'Software Installation Tutorial',
          description: 'Step by step installation guide',
          language: 'en',
          tags: ['tutorial', 'software', 'installation']
        },
        extractionTimestamp: new Date('2024-01-01')
      };

      // Mock video analysis response
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValueOnce({
          content: JSON.stringify({
            keyMoments: [
              {
                timestamp: 60,
                description: 'Download software from official website',
                importance: 'high',
                actionType: 'step'
              },
              {
                timestamp: 240,
                description: 'Configure application settings',
                importance: 'high',
                actionType: 'step'
              },
              {
                timestamp: 480,
                description: 'Test installation and verify functionality',
                importance: 'medium',
                actionType: 'result'
              }
            ]
          }),
          usage: { promptTokens: 200, completionTokens: 150, totalTokens: 350 }
        })
        // Translation response
        .mockResolvedValueOnce({
          content: 'ยินดีต้อนรับสู่บทช่วยสอนนี้ ขั้นแรก เราจะติดตั้งซอฟต์แวร์โดยการดาวน์โหลดจากเว็บไซต์อย่างเป็นทางการ จากนั้นเราจะกำหนดค่าการตั้งค่าตามความต้องการของคุณ สุดท้าย เราจะทดสอบการติดตั้งเพื่อให้แน่ใจว่าทุกอย่างทำงานได้อย่างถูกต้อง',
          usage: { promptTokens: 300, completionTokens: 120, totalTokens: 420 }
        })
        // Section organization response
        .mockResolvedValueOnce({
          content: JSON.stringify({
            sections: [
              {
                id: 'introduction',
                title: 'บทนำ',
                content: 'บทช่วยสอนการติดตั้งซอฟต์แวร์แบบครบวงจร',
                sectionType: 'introduction',
                subsections: [],
                images: []
              },
              {
                id: 'installation',
                title: 'การติดตั้ง',
                content: 'ขั้นตอนการดาวน์โหลดและติดตั้งซอฟต์แวร์',
                sectionType: 'installation',
                subsections: [],
                images: []
              },
              {
                id: 'usage',
                title: 'การใช้งาน',
                content: 'การกำหนดค่าและทดสอบการทำงาน',
                sectionType: 'usage',
                subsections: [],
                images: []
              }
            ]
          }),
          usage: { promptTokens: 250, completionTokens: 180, totalTokens: 430 }
        })
        // Content refinement response
        .mockResolvedValueOnce({
          content: '# บทนำ\n\nบทช่วยสอนนี้จะแนะนำขั้นตอนการติดตั้งซอฟต์แวร์แบบครบวงจร\n\n# การติดตั้ง\n\n1. ดาวน์โหลดซอฟต์แวร์จากเว็บไซต์อย่างเป็นทางการ\n2. รันไฟล์ติดตั้งและทำตามขั้นตอน\n\n# การใช้งาน\n\n1. กำหนดค่าการตั้งค่าตามความต้องการ\n2. ทดสอบการทำงานเพื่อยืนยันการติดตั้ง',
          usage: { promptTokens: 300, completionTokens: 150, totalTokens: 450 }
        });

      // First analyze the video content
      const analyzedVideo = await videoContentAnalyzer.analyzeVideoContent(
        mockVideoContent.videoId,
        mockVideoContent.transcript,
        mockVideoContent.duration,
        mockExtractedContent.title
      );

      // Update the extracted content with analyzed video data
      const enhancedExtractedContent = {
        ...mockExtractedContent,
        videoContent: analyzedVideo
      };

      // Process the video content
      const result = await contentProcessor.processVideoContent(enhancedExtractedContent, 'user_manual');

      expect(result).toBeDefined();
      expect(result.translatedContent).toContain('บทช่วยสอน');
      expect(result.organizedSections).toHaveLength(3);
      expect(result.organizedSections.some(s => s.sectionType === 'installation')).toBe(true);
      expect(result.organizedSections.some(s => s.sectionType === 'usage')).toBe(true);
      expect(result.refinedContent).toContain('# การติดตั้ง');
      expect(analyzedVideo.keyMoments).toHaveLength(3);
      expect(analyzedVideo.keyMoments[0].description).toContain('Download software');
    });

    it('should handle API key fallback during processing', async () => {
      const mockExtractedContent: ExtractedContent = {
        url: 'https://example.com/product',
        title: 'Test Product',
        contentType: 'website',
        textContent: 'Test content',
        images: [],
        metadata: {
          title: 'Test',
          language: 'en',
          tags: []
        },
        extractionTimestamp: new Date()
      };

      // Mock API key exhaustion scenario
      vi.mocked(apiKeyManager.getKeyStatus)
        .mockReturnValueOnce('exhausted')
        .mockReturnValue('active');
      
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
      expect(result.translatedContent).toBe('Processed with fallback key');
    });

    it('should merge multiple content sources effectively', async () => {
      const websiteContent: ExtractedContent = {
        url: 'https://example.com/product',
        title: 'Product Website',
        contentType: 'website',
        textContent: 'Product specifications and features',
        images: [],
        metadata: { title: 'Product', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      const videoContent: ExtractedContent = {
        url: 'https://youtube.com/watch?v=xyz789',
        title: 'Product Demo Video',
        contentType: 'youtube_video',
        textContent: 'Video demonstration of product usage',
        videoContent: {
          videoId: 'xyz789',
          duration: 300,
          transcript: 'This video shows how to use the product effectively',
          keyMoments: [],
          screenshots: []
        },
        images: [],
        metadata: { title: 'Demo', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      // Mock processing responses for both contents
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValue({
          content: 'Merged content processing',
          usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 }
        });

      const result = await contentProcessor.processMultipleContents(
        [websiteContent, videoContent],
        'user_manual',
        'prioritize'
      );

      expect(result).toBeDefined();
      expect(result.sourceAttribution.originalUrl).toContain('example.com');
      expect(result.sourceAttribution.originalUrl).toContain('youtube.com');
      expect(llmConnector.createChatCompletion).toHaveBeenCalledTimes(6); // 3 calls per content
    });
  });

  describe('ProcessedContent Model Integration', () => {
    it('should create and manipulate ProcessedContent using utilities', () => {
      const mockExtractedContent: ExtractedContent = {
        url: 'https://example.com',
        title: 'Test',
        contentType: 'website',
        textContent: 'Test content',
        images: [],
        metadata: { title: 'Test', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      // Create ProcessedContent from ExtractedContent
      const processedContent = processedContentUtils.fromExtractedContent(
        mockExtractedContent,
        'Translated content',
        'Refined content'
      );

      expect(processedContent.translatedContent).toBe('Translated content');
      expect(processedContent.refinedContent).toBe('Refined content');
      expect(processedContent.sourceAttribution.originalUrl).toBe('https://example.com');

      // Update quality score
      const enhancedContent = processedContentUtils.updateQualityScore(processedContent, {
        hasImages: true,
        hasProperStructure: true,
        languageQuality: 90
      });

      expect(enhancedContent.qualityScore).toBeGreaterThan(processedContent.qualityScore);

      // Extract summary
      const summary = processedContentUtils.extractSummary(enhancedContent, 100);
      expect(summary.length).toBeLessThanOrEqual(100);
    });

    it('should merge multiple ProcessedContent instances', () => {
      const content1 = processedContentUtils.create(
        'Content 1',
        [{
          id: 'section1',
          title: 'Section 1',
          content: 'Content 1',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Refined 1',
        {
          originalUrl: 'https://example1.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source 1'
        },
        80
      );

      const content2 = processedContentUtils.create(
        'Content 2',
        [{
          id: 'section2',
          title: 'Section 2',
          content: 'Content 2',
          subsections: [],
          images: [],
          sectionType: 'features'
        }],
        'Refined 2',
        {
          originalUrl: 'https://example2.com',
          extractionDate: new Date(),
          contentType: 'youtube_video',
          attribution: 'Source 2'
        },
        70
      );

      const merged = processedContentUtils.merge([content1, content2], 'prioritize');

      expect(merged.organizedSections).toHaveLength(2);
      expect(merged.organizedSections[0].sectionType).toBe('introduction'); // Should be prioritized
      expect(merged.sourceAttribution.originalUrl).toContain('example1.com');
      expect(merged.sourceAttribution.originalUrl).toContain('example2.com');
      expect(merged.qualityScore).toBe(75); // Average of 80 and 70
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle partial failures in multi-content processing', async () => {
      const validContent: ExtractedContent = {
        url: 'https://valid.com',
        title: 'Valid Content',
        contentType: 'website',
        textContent: 'Valid content',
        images: [],
        metadata: { title: 'Valid', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      const invalidContent: ExtractedContent = {
        url: 'https://invalid.com',
        title: 'Invalid Content',
        contentType: 'website',
        textContent: 'Invalid content',
        images: [],
        metadata: { title: 'Invalid', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      // Mock one success and one failure
      vi.mocked(llmConnector.createChatCompletion)
        .mockResolvedValueOnce({
          content: 'Valid processing',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
        .mockResolvedValueOnce({
          content: JSON.stringify({ sections: [] }),
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
        .mockResolvedValueOnce({
          content: 'Valid refinement',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
        .mockRejectedValueOnce(new Error('Processing failed for invalid content'));

      const result = await contentProcessor.processMultipleContents([validContent, invalidContent]);

      // Should succeed with the valid content only
      expect(result).toBeDefined();
      expect(result.sourceAttribution.originalUrl).toContain('valid.com');
    });

    it('should throw error when all content processing fails', async () => {
      const content1: ExtractedContent = {
        url: 'https://fail1.com',
        title: 'Fail 1',
        contentType: 'website',
        textContent: 'Content 1',
        images: [],
        metadata: { title: 'Fail1', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      const content2: ExtractedContent = {
        url: 'https://fail2.com',
        title: 'Fail 2',
        contentType: 'website',
        textContent: 'Content 2',
        images: [],
        metadata: { title: 'Fail2', language: 'en', tags: [] },
        extractionTimestamp: new Date()
      };

      // Mock all processing to fail
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValue(new Error('All processing failed'));

      await expect(contentProcessor.processMultipleContents([content1, content2]))
        .rejects.toThrow('Failed to process any of the provided content sources');
    });
  });
});