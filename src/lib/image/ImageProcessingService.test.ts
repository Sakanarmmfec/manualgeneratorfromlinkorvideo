import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageProcessingService } from './ImageProcessingService';
import { ExtractedContent, DocumentSection, VideoMoment } from '../../types';

// Mock the individual processors
vi.mock('./ImageExtractor', () => ({
  ImageExtractor: vi.fn().mockImplementation(() => ({
    extractFromContent: vi.fn(),
    validateImageUrl: vi.fn()
  }))
}));

vi.mock('./ScreenshotProcessor', () => ({
  ScreenshotProcessor: vi.fn().mockImplementation(() => ({
    captureFromVideo: vi.fn(),
    captureAtIntervals: vi.fn(),
    convertScreenshotsToImageData: vi.fn()
  }))
}));

vi.mock('./ImageOptimizer', () => ({
  ImageOptimizer: vi.fn().mockImplementation(() => ({
    optimizeBatch: vi.fn()
  }))
}));

vi.mock('./ImagePlacer', () => ({
  ImagePlacer: vi.fn().mockImplementation(() => ({
    determineOptimalPlacement: vi.fn(),
    createPlaceholderPlacements: vi.fn(),
    generateFallbackPlacements: vi.fn()
  }))
}));

describe('ImageProcessingService', () => {
  let imageProcessingService: ImageProcessingService;
  let mockExtractor: any;
  let mockScreenshotProcessor: any;
  let mockOptimizer: any;
  let mockPlacer: any;

  beforeEach(() => {
    imageProcessingService = new ImageProcessingService();
    
    // Get the mocked instances
    mockExtractor = (imageProcessingService as any).imageExtractor;
    mockScreenshotProcessor = (imageProcessingService as any).screenshotProcessor;
    mockOptimizer = (imageProcessingService as any).imageOptimizer;
    mockPlacer = (imageProcessingService as any).imagePlacer;

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('processImagesForDocument', () => {
    const sampleWebsiteContent: ExtractedContent = {
      url: 'https://example.com/product',
      title: 'Test Product',
      contentType: 'website',
      textContent: 'Product description',
      images: [],
      metadata: {
        description: 'Test product',
        keywords: ['product', 'test'],
        author: 'Test Author',
        publishDate: new Date(),
        language: 'en'
      },
      extractionTimestamp: new Date()
    };

    const sampleSections: DocumentSection[] = [
      {
        id: 'features',
        title: 'Features',
        content: 'Product features',
        subsections: [],
        images: [],
        sectionType: 'features'
      }
    ];

    it('should process website content successfully', async () => {
      // Setup mocks
      mockExtractor.extractFromContent.mockResolvedValue({
        images: [{ url: 'https://example.com/image1.jpg', relevanceScore: 0.8 }],
        totalFound: 1,
        extractionErrors: []
      });

      mockOptimizer.optimizeBatch.mockResolvedValue([
        {
          optimizedImage: { url: 'https://example.com/image1.jpg', relevanceScore: 0.8 },
          originalSize: 100000,
          optimizedSize: 50000,
          compressionRatio: 0.5
        }
      ]);

      mockPlacer.determineOptimalPlacement.mockResolvedValue({
        placements: [{ imageId: 'img1', sectionId: 'features' }],
        unplacedImages: [],
        placementScore: 85
      });

      mockScreenshotProcessor.convertScreenshotsToImageData.mockReturnValue([]);

      const result = await imageProcessingService.processImagesForDocument(
        sampleWebsiteContent,
        sampleSections
      );

      expect(result.extractedImages).toHaveLength(1);
      expect(result.screenshots).toHaveLength(0);
      expect(result.optimizedImages).toHaveLength(1);
      expect(result.placements.placements).toHaveLength(1);
      expect(result.processingErrors).toHaveLength(0);
      expect(result.totalProcessingTime).toBeGreaterThan(0);
    });

    it('should process YouTube video content with screenshots', async () => {
      const videoContent: ExtractedContent = {
        ...sampleWebsiteContent,
        contentType: 'youtube_video',
        videoContent: {
          videoId: 'test123',
          duration: 300,
          transcript: 'Video transcript',
          keyMoments: [
            {
              timestamp: 30,
              description: 'Key moment',
              importance: 'high',
              actionType: 'step'
            }
          ] as VideoMoment[],
          screenshots: []
        }
      };

      // Setup mocks
      mockExtractor.extractFromContent.mockResolvedValue({
        images: [],
        totalFound: 0,
        extractionErrors: []
      });

      mockScreenshotProcessor.captureFromVideo.mockResolvedValue({
        screenshots: [{ timestamp: 30, imageUrl: 'screenshot1.jpg' }],
        processedCount: 1,
        errors: []
      });

      mockScreenshotProcessor.convertScreenshotsToImageData.mockReturnValue([
        { url: 'screenshot1.jpg', relevanceScore: 0.7 }
      ]);

      mockOptimizer.optimizeBatch.mockResolvedValue([
        {
          optimizedImage: { url: 'screenshot1.jpg', relevanceScore: 0.7 },
          originalSize: 80000,
          optimizedSize: 40000,
          compressionRatio: 0.5
        }
      ]);

      mockPlacer.determineOptimalPlacement.mockResolvedValue({
        placements: [{ imageId: 'screenshot1', sectionId: 'features' }],
        unplacedImages: [],
        placementScore: 75
      });

      const result = await imageProcessingService.processImagesForDocument(
        videoContent,
        sampleSections
      );

      expect(result.screenshots).toHaveLength(1);
      expect(mockScreenshotProcessor.captureFromVideo).toHaveBeenCalledWith(
        'test123',
        videoContent.videoContent!.keyMoments,
        expect.any(Object)
      );
    });

    it('should handle processing errors gracefully', async () => {
      mockExtractor.extractFromContent.mockRejectedValue(new Error('Extraction failed'));

      const result = await imageProcessingService.processImagesForDocument(
        sampleWebsiteContent,
        sampleSections
      );

      expect(result.extractedImages).toHaveLength(0);
      expect(result.processingErrors).toContain('Extraction failed');
    });

    it('should collect errors from individual processors', async () => {
      mockExtractor.extractFromContent.mockResolvedValue({
        images: [],
        totalFound: 0,
        extractionErrors: ['Image extraction error']
      });

      mockScreenshotProcessor.captureFromVideo.mockResolvedValue({
        screenshots: [],
        processedCount: 0,
        errors: ['Screenshot error']
      });

      mockScreenshotProcessor.convertScreenshotsToImageData.mockReturnValue([]);
      mockOptimizer.optimizeBatch.mockResolvedValue([]);
      mockPlacer.determineOptimalPlacement.mockResolvedValue({
        placements: [],
        unplacedImages: [],
        placementScore: 0
      });

      const videoContent: ExtractedContent = {
        ...sampleWebsiteContent,
        contentType: 'youtube_video',
        videoContent: {
          videoId: 'test123',
          duration: 300,
          transcript: 'Video transcript',
          keyMoments: [],
          screenshots: []
        }
      };

      const result = await imageProcessingService.processImagesForDocument(
        videoContent,
        sampleSections
      );

      expect(result.processingErrors).toContain('Image extraction error');
      expect(result.processingErrors).toContain('Screenshot error');
    });
  });

  describe('validateImages', () => {
    it('should separate valid and invalid images', async () => {
      const images = [
        { url: 'https://example.com/valid.jpg', relevanceScore: 0.8 },
        { url: 'https://example.com/invalid.jpg', relevanceScore: 0.6 }
      ];

      mockExtractor.validateImageUrl
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await imageProcessingService.validateImages(images as any);

      expect(result.validImages).toHaveLength(1);
      expect(result.invalidImages).toHaveLength(1);
      expect(result.validImages[0].url).toBe('https://example.com/valid.jpg');
      expect(result.invalidImages[0].url).toBe('https://example.com/invalid.jpg');
    });
  });

  describe('generateFallbacks', () => {
    it('should generate placeholders and fallback placements', async () => {
      const sections: DocumentSection[] = [
        {
          id: 'section1',
          title: 'Section 1',
          content: 'Content',
          subsections: [],
          images: [],
          sectionType: 'features'
        }
      ];

      const failedImages = [
        { url: 'https://example.com/failed.jpg', relevanceScore: 0.5 }
      ];

      mockPlacer.createPlaceholderPlacements.mockReturnValue([
        { imageId: 'placeholder1', sectionId: 'section1' }
      ]);

      mockPlacer.generateFallbackPlacements.mockReturnValue([
        { imageId: 'fallback1', sectionId: 'section1' }
      ]);

      const result = await imageProcessingService.generateFallbacks(
        sections,
        failedImages as any
      );

      expect(result.placeholders).toHaveLength(1);
      expect(result.fallbackPlacements).toHaveLength(1);
    });
  });

  describe('getProcessingStats', () => {
    it('should calculate processing statistics correctly', () => {
      const result = {
        extractedImages: [{ url: 'img1.jpg' }, { url: 'img2.jpg' }],
        screenshots: [{ url: 'screenshot1.jpg' }],
        optimizedImages: [
          { compressionRatio: 0.6, originalSize: 100, optimizedSize: 60 },
          { compressionRatio: 0.8, originalSize: 200, optimizedSize: 160 }
        ],
        placements: {
          placements: [{ imageId: 'img1' }],
          unplacedImages: [{ url: 'unplaced.jpg' }],
          placementScore: 75
        },
        processingErrors: [],
        totalProcessingTime: 1000
      };

      const stats = imageProcessingService.getProcessingStats(result as any);

      expect(stats.totalImages).toBe(3);
      expect(stats.successfulExtractions).toBe(2);
      expect(stats.successfulOptimizations).toBe(2);
      expect(stats.placementScore).toBe(75);
      expect(stats.averageCompressionRatio).toBe(0.7);
      expect(stats.recommendations).toContain('1 images could not be placed automatically');
    });

    it('should provide recommendations based on results', () => {
      const poorResult = {
        extractedImages: [],
        screenshots: [],
        optimizedImages: [
          { compressionRatio: 0.9, originalSize: 100, optimizedSize: 90 }
        ],
        placements: {
          placements: [],
          unplacedImages: [{ url: 'unplaced1.jpg' }, { url: 'unplaced2.jpg' }],
          placementScore: 30
        },
        processingErrors: [],
        totalProcessingTime: 1000
      };

      const stats = imageProcessingService.getProcessingStats(poorResult as any);

      expect(stats.recommendations).toContain('2 images could not be placed automatically');
      expect(stats.recommendations).toContain('Consider more aggressive image optimization for better document size');
      expect(stats.recommendations).toContain('Image placement could be improved - consider manual review');
    });
  });

  describe('getDocumentTypeOptions', () => {
    it('should return user manual specific options', () => {
      const options = imageProcessingService.getDocumentTypeOptions('user_manual');

      expect(options.extraction?.maxImages).toBe(20);
      expect(options.screenshot?.maxScreenshots).toBe(15);
      expect(options.screenshot?.intervalSeconds).toBe(20);
      expect(options.placement?.prioritizeRelevance).toBe(true);
    });

    it('should return product document specific options', () => {
      const options = imageProcessingService.getDocumentTypeOptions('product_document');

      expect(options.extraction?.maxImages).toBe(10);
      expect(options.screenshot?.maxScreenshots).toBe(8);
      expect(options.screenshot?.intervalSeconds).toBe(45);
      expect(options.placement?.maxImagesPerSection).toBe(2);
    });
  });
});