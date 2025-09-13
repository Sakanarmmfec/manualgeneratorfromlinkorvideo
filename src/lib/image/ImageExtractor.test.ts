import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageExtractor } from './ImageExtractor';
import { ExtractedContent } from '../../types';

// Mock fetch globally
global.fetch = vi.fn();

describe('ImageExtractor', () => {
  let imageExtractor: ImageExtractor;

  beforeEach(() => {
    imageExtractor = new ImageExtractor();
    vi.clearAllMocks();
  });

  describe('extractFromUrl', () => {
    it('should extract images from HTML content', async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="https://example.com/product1.jpg" alt="Product 1" />
            <img src="https://example.com/product2.png" alt="Product 2" />
            <img src="https://example.com/icon.jpg" alt="Icon" />
          </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await imageExtractor.extractFromUrl('https://example.com/product');

      expect(result.images).toHaveLength(2); // Icon should be excluded
      expect(result.totalFound).toBe(2);
      expect(result.extractionErrors).toHaveLength(0);
    });

    it('should handle fetch errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await imageExtractor.extractFromUrl('https://example.com/product');

      expect(result.images).toHaveLength(0);
      expect(result.totalFound).toBe(0);
      expect(result.extractionErrors).toHaveLength(1);
      expect(result.extractionErrors[0]).toContain('Network error');
    });

    it('should respect maxImages option', async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="https://example.com/img1.jpg" alt="Image 1" />
            <img src="https://example.com/img2.jpg" alt="Image 2" />
            <img src="https://example.com/img3.jpg" alt="Image 3" />
          </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await imageExtractor.extractFromUrl('https://example.com/product', {
        maxImages: 2
      });

      expect(result.images).toHaveLength(2);
      expect(result.totalFound).toBe(3);
    });

    it('should filter images by format', async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="https://example.com/image.jpg" alt="JPEG Image" />
            <img src="https://example.com/image.bmp" alt="BMP Image" />
            <img src="https://example.com/image.png" alt="PNG Image" />
          </body>
        </html>
      `;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await imageExtractor.extractFromUrl('https://example.com/product', {
        allowedFormats: ['jpg', 'png']
      });

      expect(result.images).toHaveLength(2); // BMP should be excluded
    });
  });

  describe('extractFromContent', () => {
    it('should extract images from website content', async () => {
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

      const mockHtml = '<img src="https://example.com/product.jpg" alt="Product" />';
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await imageExtractor.extractFromContent(content);

      expect(result.images).toHaveLength(1);
      expect(result.images[0].url).toBe('https://example.com/product.jpg');
    });

    it('should return existing images for YouTube content', async () => {
      const existingImages = [
        {
          url: 'https://example.com/screenshot1.jpg',
          altText: 'Screenshot 1',
          title: 'Video Screenshot',
          width: 1280,
          height: 720,
          format: 'jpg',
          size: 50000,
          relevanceScore: 0.8
        }
      ];

      const content: ExtractedContent = {
        url: 'https://youtube.com/watch?v=123',
        title: 'Test Video',
        contentType: 'youtube_video',
        textContent: 'Video description',
        images: existingImages,
        metadata: {
          description: 'Test video',
          keywords: ['video', 'test'],
          author: 'Test Author',
          publishDate: new Date(),
          language: 'en'
        },
        extractionTimestamp: new Date()
      };

      const result = await imageExtractor.extractFromContent(content);

      expect(result.images).toEqual(existingImages);
      expect(result.totalFound).toBe(1);
    });
  });

  describe('validateImageUrl', () => {
    it('should validate accessible image URLs', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'image/jpeg' : null
        }
      });

      const isValid = await imageExtractor.validateImageUrl('https://example.com/image.jpg');

      expect(isValid).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://example.com/image.jpg', { method: 'HEAD' });
    });

    it('should reject non-image URLs', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'text/html' : null
        }
      });

      const isValid = await imageExtractor.validateImageUrl('https://example.com/page.html');

      expect(isValid).toBe(false);
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const isValid = await imageExtractor.validateImageUrl('https://example.com/image.jpg');

      expect(isValid).toBe(false);
    });
  });

  describe('getImageMetadata', () => {
    it('should extract image metadata from headers', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            switch (name) {
              case 'content-type': return 'image/jpeg';
              case 'content-length': return '50000';
              default: return null;
            }
          }
        }
      });

      const metadata = await imageExtractor.getImageMetadata('https://example.com/image.jpg');

      expect(metadata).toEqual({
        url: 'https://example.com/image.jpg',
        format: 'jpeg',
        size: 50000
      });
    });

    it('should return null for failed requests', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false
      });

      const metadata = await imageExtractor.getImageMetadata('https://example.com/image.jpg');

      expect(metadata).toBeNull();
    });
  });
});