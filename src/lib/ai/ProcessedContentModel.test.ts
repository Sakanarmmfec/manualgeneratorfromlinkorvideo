import { describe, it, expect } from 'vitest';
import { ProcessedContentModel, processedContentUtils } from './ProcessedContentModel';
import { ExtractedContent, ProcessedContent } from '@/types';

describe('ProcessedContentModel', () => {
  const mockExtractedContent: ExtractedContent = {
    url: 'https://example.com/test',
    title: 'Test Content',
    contentType: 'website',
    textContent: 'This is test content for processing.',
    images: [],
    metadata: {
      title: 'Test Content',
      description: 'Test description',
      language: 'en',
      tags: ['test', 'content']
    },
    extractionTimestamp: new Date('2024-01-01')
  };

  describe('create', () => {
    it('should create ProcessedContent with valid inputs', () => {
      const result = ProcessedContentModel.create(
        'Translated content',
        [{
          id: 'test-section',
          title: 'Test Section',
          content: 'Section content',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Refined content',
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Test attribution'
        },
        85
      );

      expect(result.translatedContent).toBe('Translated content');
      expect(result.refinedContent).toBe('Refined content');
      expect(result.qualityScore).toBe(85);
      expect(result.organizedSections).toHaveLength(1);
    });

    it('should clamp quality score to valid range', () => {
      const result = ProcessedContentModel.create(
        'Content',
        [{
          id: 'section',
          title: 'Section',
          content: 'Content',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Refined',
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Attribution'
        },
        150 // Over 100
      );

      expect(result.qualityScore).toBe(100);
    });
  });

  describe('fromExtractedContent', () => {
    it('should create ProcessedContent from ExtractedContent', () => {
      const result = ProcessedContentModel.fromExtractedContent(
        mockExtractedContent,
        'Thai translation',
        'Refined Thai content'
      );

      expect(result.translatedContent).toBe('Thai translation');
      expect(result.refinedContent).toBe('Refined Thai content');
      expect(result.sourceAttribution.originalUrl).toBe(mockExtractedContent.url);
      expect(result.organizedSections.length).toBeGreaterThan(0);
    });

    it('should use fallback content when not provided', () => {
      const result = ProcessedContentModel.fromExtractedContent(mockExtractedContent);

      expect(result.translatedContent).toBe(mockExtractedContent.textContent);
      expect(result.refinedContent).toBe(mockExtractedContent.textContent);
    });
  });

  describe('merge', () => {
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

      const merged = processedContentUtils.merge([content1, content2]);

      expect(merged.organizedSections).toHaveLength(2);
      expect(merged.qualityScore).toBe(75); // Average
      expect(merged.sourceAttribution.originalUrl).toContain('example1.com');
      expect(merged.sourceAttribution.originalUrl).toContain('example2.com');
    });

    it('should handle single content merge', () => {
      const content = processedContentUtils.create(
        'Single content',
        [{
          id: 'section',
          title: 'Section',
          content: 'Content',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Refined',
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source'
        },
        90
      );

      const merged = processedContentUtils.merge([content]);
      expect(merged).toEqual(content);
    });

    it('should throw error for empty array', () => {
      expect(() => processedContentUtils.merge([])).toThrow('Cannot merge empty array');
    });
  });

  describe('updateQualityScore', () => {
    it('should update quality score with additional factors', () => {
      const content = processedContentUtils.create(
        'Content',
        [{
          id: 'section',
          title: 'Section',
          content: 'Content',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Refined',
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source'
        },
        50
      );

      const updated = processedContentUtils.updateQualityScore(content, {
        hasImages: true,
        hasProperStructure: true,
        languageQuality: 90
      });

      expect(updated.qualityScore).toBeGreaterThan(content.qualityScore);
    });
  });

  describe('extractSummary', () => {
    it('should extract summary from introduction section', () => {
      const content = processedContentUtils.create(
        'Full content',
        [{
          id: 'intro',
          title: 'Introduction',
          content: 'This is a short introduction.',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Full refined content',
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source'
        },
        80
      );

      const summary = processedContentUtils.extractSummary(content, 100);
      expect(summary).toBe('This is a short introduction.');
    });

    it('should truncate long content', () => {
      const longContent = 'A'.repeat(300);
      const content = processedContentUtils.create(
        longContent,
        [{
          id: 'section',
          title: 'Section',
          content: longContent,
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        longContent,
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source'
        },
        80
      );

      const summary = processedContentUtils.extractSummary(content, 100);
      expect(summary.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(summary).toContain('...');
    });
  });

  describe('addImagePlacements', () => {
    it('should add image placements to sections', () => {
      const content = processedContentUtils.create(
        'Content',
        [{
          id: 'section1',
          title: 'Section 1',
          content: 'Content',
          subsections: [],
          images: [],
          sectionType: 'introduction'
        }],
        'Refined',
        {
          originalUrl: 'https://example.com',
          extractionDate: new Date(),
          contentType: 'website',
          attribution: 'Source'
        },
        80
      );

      const updated = processedContentUtils.addImagePlacements(content, [{
        sectionId: 'section1',
        images: [{
          imageId: 'img1',
          position: 'top',
          caption: 'Test image',
          size: 'medium'
        }]
      }]);

      expect(updated.organizedSections[0].images).toHaveLength(1);
      expect(updated.organizedSections[0].images[0].caption).toBe('Test image');
    });
  });
});