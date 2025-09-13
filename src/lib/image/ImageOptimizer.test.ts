import { describe, it, expect, beforeEach } from 'vitest';
import { ImageOptimizer } from './ImageOptimizer';
import { ImageData } from '../../types';

describe('ImageOptimizer', () => {
  let imageOptimizer: ImageOptimizer;
  let sampleImage: ImageData;

  beforeEach(() => {
    imageOptimizer = new ImageOptimizer();
    sampleImage = {
      url: 'https://example.com/image.jpg',
      altText: 'Sample image',
      title: 'Sample Image Title',
      width: 1920,
      height: 1080,
      format: 'jpg',
      size: 500000, // 500KB
      relevanceScore: 0.8
    };
  });

  describe('optimizeForDocument', () => {
    it('should optimize image with default settings', async () => {
      const result = await imageOptimizer.optimizeForDocument(sampleImage);

      expect(result.optimizedImage.width).toBeLessThanOrEqual(800);
      expect(result.optimizedImage.height).toBeLessThanOrEqual(600);
      expect(result.optimizedImage.format).toBe('jpg');
      expect(result.compressionRatio).toBeLessThan(1);
      expect(result.optimizedSize).toBeLessThan(result.originalSize);
    });

    it('should respect custom optimization options', async () => {
      const options = {
        maxWidth: 400,
        maxHeight: 300,
        quality: 0.7,
        format: 'webp' as const
      };

      const result = await imageOptimizer.optimizeForDocument(sampleImage, options);

      expect(result.optimizedImage.width).toBeLessThanOrEqual(400);
      expect(result.optimizedImage.height).toBeLessThanOrEqual(300);
      expect(result.optimizedImage.format).toBe('webp');
    });

    it('should maintain aspect ratio when enabled', async () => {
      const options = {
        maxWidth: 400,
        maxHeight: 400,
        maintainAspectRatio: true
      };

      const result = await imageOptimizer.optimizeForDocument(sampleImage, options);
      const originalAspectRatio = sampleImage.width / sampleImage.height;
      const optimizedAspectRatio = result.optimizedImage.width / result.optimizedImage.height;

      expect(Math.abs(originalAspectRatio - optimizedAspectRatio)).toBeLessThan(0.01);
    });

    it('should handle optimization failures gracefully', async () => {
      const invalidImage: ImageData = {
        ...sampleImage,
        url: 'invalid-url'
      };

      const result = await imageOptimizer.optimizeForDocument(invalidImage);

      expect(result.optimizedImage).toEqual(invalidImage);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe('optimizeBatch', () => {
    it('should optimize multiple images', async () => {
      const images: ImageData[] = [
        sampleImage,
        { ...sampleImage, url: 'https://example.com/image2.jpg', width: 800, height: 600 },
        { ...sampleImage, url: 'https://example.com/image3.jpg', width: 1200, height: 800 }
      ];

      const results = await imageOptimizer.optimizeBatch(images);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.optimizedImage.width).toBeLessThanOrEqual(800);
        expect(result.optimizedImage.height).toBeLessThanOrEqual(600);
      });
    });
  });

  describe('optimizeForPrint', () => {
    it('should use print-optimized settings', async () => {
      const result = await imageOptimizer.optimizeForPrint(sampleImage);

      expect(result.optimizedImage.width).toBeLessThanOrEqual(1200);
      expect(result.optimizedImage.height).toBeLessThanOrEqual(900);
      expect(result.optimizedImage.format).toBe('jpg');
    });
  });

  describe('optimizeForWeb', () => {
    it('should use web-optimized settings', async () => {
      const result = await imageOptimizer.optimizeForWeb(sampleImage);

      expect(result.optimizedImage.width).toBeLessThanOrEqual(600);
      expect(result.optimizedImage.height).toBeLessThanOrEqual(400);
      expect(result.optimizedImage.format).toBe('webp');
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail with specified size', async () => {
      const thumbnailSize = 150;
      const result = await imageOptimizer.createThumbnail(sampleImage, thumbnailSize);

      expect(result.optimizedImage.width).toBeLessThanOrEqual(thumbnailSize);
      expect(result.optimizedImage.height).toBeLessThanOrEqual(thumbnailSize);
    });
  });

  describe('analyzeImage', () => {
    it('should identify optimization needs for large images', () => {
      const largeImage: ImageData = {
        ...sampleImage,
        width: 3000,
        height: 2000,
        size: 2000000 // 2MB
      };

      const analysis = imageOptimizer.analyzeImage(largeImage);

      expect(analysis.needsOptimization).toBe(true);
      expect(analysis.recommendations).toContain('Image size is large, compression recommended');
      expect(analysis.recommendations).toContain('Image dimensions are large, resizing recommended');
      expect(analysis.estimatedSavings).toBeGreaterThan(0);
    });

    it('should suggest format changes for PNG images', () => {
      const pngImage: ImageData = {
        ...sampleImage,
        format: 'png'
      };

      const analysis = imageOptimizer.analyzeImage(pngImage);

      expect(analysis.recommendations).toContain('PNG format detected, consider JPEG for better compression');
    });

    it('should not suggest optimization for already optimized images', () => {
      const optimizedImage: ImageData = {
        ...sampleImage,
        width: 600,
        height: 400,
        size: 50000 // 50KB
      };

      const analysis = imageOptimizer.analyzeImage(optimizedImage);

      expect(analysis.needsOptimization).toBe(false);
      expect(analysis.recommendations).toHaveLength(0);
    });
  });

  describe('getOptimalFormat', () => {
    it('should recommend PNG for images requiring transparency', () => {
      const pngImage: ImageData = {
        ...sampleImage,
        format: 'png'
      };

      const format = imageOptimizer.getOptimalFormat(pngImage);

      expect(format).toBe('png');
    });

    it('should recommend WebP for large images', () => {
      const largeImage: ImageData = {
        ...sampleImage,
        width: 2000,
        height: 1500
      };

      const format = imageOptimizer.getOptimalFormat(largeImage);

      expect(format).toBe('webp');
    });

    it('should recommend JPEG for regular photos', () => {
      const regularImage: ImageData = {
        ...sampleImage,
        width: 800,
        height: 600
      };

      const format = imageOptimizer.getOptimalFormat(regularImage);

      expect(format).toBe('jpg');
    });
  });

  describe('calculateOptimalQuality', () => {
    it('should reduce quality for very large images', () => {
      const largeImage: ImageData = {
        ...sampleImage,
        width: 4000,
        height: 3000,
        size: 5000000 // 5MB
      };

      const quality = imageOptimizer.calculateOptimalQuality(largeImage);

      expect(quality).toBeLessThan(0.85);
    });

    it('should increase quality for small images', () => {
      const smallImage: ImageData = {
        ...sampleImage,
        width: 200,
        height: 150,
        size: 20000 // 20KB
      };

      const quality = imageOptimizer.calculateOptimalQuality(smallImage);

      expect(quality).toBeGreaterThan(0.85);
    });
  });
});