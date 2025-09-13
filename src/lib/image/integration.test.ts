import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageProcessingService } from './ImageProcessingService';
import { ExtractedContent, DocumentSection } from '../../types';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Image Processing Integration Tests', () => {
  let imageProcessingService: ImageProcessingService;

  beforeEach(() => {
    imageProcessingService = new ImageProcessingService();
    vi.clearAllMocks();
  });

  describe('End-to-end image processing workflow', () => {
    it('should process a complete website content workflow', async () => {
      // Mock HTML content with images
      const mockHtml = `
        <html>
          <body>
            <h1>Product Page</h1>
            <img src="https://example.com/product-main.jpg" alt="Main product image" />
            <img src="https://example.com/feature1.jpg" alt="Feature 1" />
            <img src="https://example.com/installation.jpg" alt="Installation guide" />
          </body>
        </html>
      `;

      // Mock fetch responses
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        })
        .mockResolvedValue({
          ok: true,
          headers: {
            get: (name: string) => name === 'content-type' ? 'image/jpeg' : null
          }
        });

      const content: ExtractedContent = {
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

      const sections: DocumentSection[] = [
        {
          id: 'features',
          title: 'Product Features',
          content: 'This section describes the main features of the product. '.repeat(50),
          subsections: [],
          images: [],
          sectionType: 'features'
        },
        {
          id: 'installation',
          title: 'Installation Guide',
          content: 'Follow these steps to install the product. '.repeat(30),
          subsections: [],
          images: [],
          sectionType: 'installation'
        }
      ];

      const result = await imageProcessingService.processImagesForDocument(
        content,
        sections,
        {
          extraction: { maxImages: 5 },
          optimization: { maxWidth: 600, quality: 0.8 },
          placement: { maxImagesPerSection: 2 }
        }
      );

      // Verify the complete workflow
      expect(result.extractedImages.length).toBeGreaterThan(0);
      expect(result.optimizedImages.length).toBeGreaterThan(0);
      expect(result.placements.placements.length).toBeGreaterThan(0);
      expect(result.totalProcessingTime).toBeGreaterThan(0);

      // Verify optimization occurred
      result.optimizedImages.forEach(opt => {
        expect(opt.optimizedImage.width).toBeLessThanOrEqual(600);
      });

      // Verify placement logic
      result.placements.placements.forEach(placement => {
        expect(['features', 'installation']).toContain(placement.sectionId);
        expect(['top', 'middle', 'bottom']).toContain(placement.position);
      });
    });

    it('should handle YouTube video content with screenshot processing', async () => {
      const videoContent: ExtractedContent = {
        url: 'https://youtube.com/watch?v=test123',
        title: 'Tutorial Video',
        contentType: 'youtube_video',
        textContent: 'Video tutorial description',
        images: [],
        videoContent: {
          videoId: 'test123',
          duration: 600, // 10 minutes
          transcript: 'This is a tutorial video showing how to use the product...',
          keyMoments: [
            {
              timestamp: 60,
              description: 'Product overview',
              importance: 'high',
              actionType: 'explanation'
            },
            {
              timestamp: 180,
              description: 'Installation step 1',
              importance: 'high',
              actionType: 'step'
            },
            {
              timestamp: 300,
              description: 'Usage demonstration',
              importance: 'medium',
              actionType: 'demonstration'
            }
          ],
          screenshots: []
        },
        metadata: {
          description: 'Tutorial video',
          keywords: ['tutorial', 'video'],
          author: 'Tutorial Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

      const sections: DocumentSection[] = [
        {
          id: 'overview',
          title: 'Product Overview',
          content: 'Overview of the product features and capabilities. '.repeat(40),
          subsections: [],
          images: [],
          sectionType: 'features'
        },
        {
          id: 'installation',
          title: 'Installation',
          content: 'Step-by-step installation instructions. '.repeat(35),
          subsections: [],
          images: [],
          sectionType: 'installation'
        },
        {
          id: 'usage',
          title: 'Usage Guide',
          content: 'How to use the product effectively. '.repeat(45),
          subsections: [],
          images: [],
          sectionType: 'usage'
        }
      ];

      const result = await imageProcessingService.processImagesForDocument(
        videoContent,
        sections,
        imageProcessingService.getDocumentTypeOptions('user_manual')
      );

      // Verify video processing
      expect(result.screenshots.length).toBeGreaterThan(0);
      expect(result.optimizedImages.length).toBeGreaterThan(0);
      
      // Verify screenshots are properly converted to ImageData
      result.screenshots.forEach(screenshot => {
        expect(screenshot.url).toBeTruthy();
        expect(screenshot.altText).toBeTruthy();
        expect(screenshot.relevanceScore).toBeGreaterThan(0);
      });

      // Verify placement considers video content
      const placementsBySection = new Map<string, number>();
      result.placements.placements.forEach(placement => {
        const count = placementsBySection.get(placement.sectionId) || 0;
        placementsBySection.set(placement.sectionId, count + 1);
      });

      // Should distribute across multiple sections
      expect(placementsBySection.size).toBeGreaterThan(1);
    });

    it('should handle mixed content with both images and video screenshots', async () => {
      // Mock HTML with some images
      const mockHtml = `
        <html>
          <body>
            <img src="https://example.com/product.jpg" alt="Product image" />
            <img src="https://example.com/diagram.jpg" alt="Technical diagram" />
          </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const mixedContent: ExtractedContent = {
        url: 'https://example.com/product-with-video',
        title: 'Product with Video Guide',
        contentType: 'youtube_video', // Has video content
        textContent: 'Product with accompanying video guide',
        images: [
          {
            url: 'https://example.com/existing-image.jpg',
            altText: 'Existing product image',
            title: 'Product Image',
            width: 800,
            height: 600,
            format: 'jpg',
            size: 100000,
            relevanceScore: 0.9
          }
        ],
        videoContent: {
          videoId: 'mixed123',
          duration: 300,
          transcript: 'Video guide transcript',
          keyMoments: [
            {
              timestamp: 30,
              description: 'Key feature demonstration',
              importance: 'high',
              actionType: 'demonstration'
            }
          ],
          screenshots: []
        },
        metadata: {
          description: 'Mixed content',
          keywords: ['product', 'video', 'guide'],
          author: 'Content Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

      const sections: DocumentSection[] = [
        {
          id: 'overview',
          title: 'Overview',
          content: 'Product overview section. '.repeat(30),
          subsections: [],
          images: [],
          sectionType: 'features'
        },
        {
          id: 'guide',
          title: 'User Guide',
          content: 'Detailed user guide with video content. '.repeat(40),
          subsections: [],
          images: [],
          sectionType: 'usage'
        }
      ];

      const result = await imageProcessingService.processImagesForDocument(
        mixedContent,
        sections
      );

      // Should have both existing images and new screenshots
      expect(result.extractedImages.length).toBeGreaterThan(0);
      expect(result.screenshots.length).toBeGreaterThan(0);
      
      // Total processed images should include both types
      const totalImages = result.extractedImages.length + result.screenshots.length;
      expect(result.optimizedImages.length).toBe(totalImages);

      // Verify placement handles mixed content appropriately
      expect(result.placements.placements.length).toBeGreaterThan(0);
      expect(result.placements.placementScore).toBeGreaterThan(0);
    });
  });

  describe('Error handling and recovery', () => {
    it('should handle network failures gracefully', async () => {
      (fetch as any).mockRejectedValue(new Error('Network timeout'));

      const content: ExtractedContent = {
        url: 'https://unreachable.example.com/product',
        title: 'Unreachable Product',
        contentType: 'website',
        textContent: 'Product description',
        images: [],
        metadata: {
          description: 'Test product',
          keywords: ['product'],
          author: 'Test Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

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

      const result = await imageProcessingService.processImagesForDocument(
        content,
        sections
      );

      // Should complete without crashing
      expect(result.processingErrors.length).toBeGreaterThan(0);
      expect(result.extractedImages).toHaveLength(0);
      expect(result.totalProcessingTime).toBeGreaterThan(0);
    });

    it('should provide fallback options when image processing fails', async () => {
      const content: ExtractedContent = {
        url: 'https://example.com/product',
        title: 'Test Product',
        contentType: 'website',
        textContent: 'Product description',
        images: [],
        metadata: {
          description: 'Test product',
          keywords: ['product'],
          author: 'Test Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

      const sections: DocumentSection[] = [
        {
          id: 'features',
          title: 'Features',
          content: 'Product features section with substantial content. '.repeat(50),
          subsections: [],
          images: [],
          sectionType: 'features'
        },
        {
          id: 'usage',
          title: 'Usage',
          content: 'Usage instructions with detailed explanations. '.repeat(40),
          subsections: [],
          images: [],
          sectionType: 'usage'
        }
      ];

      // Simulate failed image extraction
      (fetch as any).mockRejectedValue(new Error('Image extraction failed'));

      const result = await imageProcessingService.processImagesForDocument(
        content,
        sections
      );

      // Generate fallbacks for the failed processing
      const fallbacks = await imageProcessingService.generateFallbacks(
        sections,
        [] // No failed images in this case
      );

      expect(fallbacks.placeholders.length).toBeGreaterThan(0);
      expect(fallbacks.fallbackPlacements).toBeDefined();

      // Verify placeholders are created for content-rich sections
      fallbacks.placeholders.forEach(placeholder => {
        expect(placeholder.imageId).toContain('placeholder_');
        expect(['features', 'usage']).toContain(placeholder.sectionId);
      });
    });
  });

  describe('Performance and optimization', () => {
    it('should complete processing within reasonable time limits', async () => {
      const startTime = Date.now();

      // Mock quick responses
      (fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<img src="test.jpg" alt="test" />'),
        headers: {
          get: () => 'image/jpeg'
        }
      });

      const content: ExtractedContent = {
        url: 'https://example.com/product',
        title: 'Test Product',
        contentType: 'website',
        textContent: 'Product description',
        images: [],
        metadata: {
          description: 'Test product',
          keywords: ['product'],
          author: 'Test Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

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

      const result = await imageProcessingService.processImagesForDocument(
        content,
        sections
      );

      const processingTime = Date.now() - startTime;

      // Should complete within 5 seconds for simple content
      expect(processingTime).toBeLessThan(5000);
      expect(result.totalProcessingTime).toBeLessThan(processingTime);
    });

    it('should provide meaningful processing statistics', async () => {
      // Mock successful processing
      (fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<img src="test1.jpg" alt="test1" /><img src="test2.jpg" alt="test2" />'),
        headers: {
          get: () => 'image/jpeg'
        }
      });

      const content: ExtractedContent = {
        url: 'https://example.com/product',
        title: 'Test Product',
        contentType: 'website',
        textContent: 'Product description',
        images: [],
        metadata: {
          description: 'Test product',
          keywords: ['product'],
          author: 'Test Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

      const sections: DocumentSection[] = [
        {
          id: 'section1',
          title: 'Section 1',
          content: 'Content '.repeat(100),
          subsections: [],
          images: [],
          sectionType: 'features'
        }
      ];

      const result = await imageProcessingService.processImagesForDocument(
        content,
        sections
      );

      const stats = imageProcessingService.getProcessingStats(result);

      expect(stats.totalImages).toBeGreaterThanOrEqual(0);
      expect(stats.successfulExtractions).toBeGreaterThanOrEqual(0);
      expect(stats.placementScore).toBeGreaterThanOrEqual(0);
      expect(stats.averageCompressionRatio).toBeGreaterThan(0);
      expect(Array.isArray(stats.recommendations)).toBe(true);
    });
  });
});