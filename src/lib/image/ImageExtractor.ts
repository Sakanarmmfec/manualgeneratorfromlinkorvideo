import { ImageData, ExtractedContent } from '../../types';

export interface ImageExtractionOptions {
  maxImages?: number;
  minWidth?: number;
  minHeight?: number;
  allowedFormats?: string[];
  excludePatterns?: string[];
}

export interface ImageExtractionResult {
  images: ImageData[];
  totalFound: number;
  extractionErrors: string[];
}

export class ImageExtractor {
  private readonly defaultOptions: Required<ImageExtractionOptions> = {
    maxImages: 10,
    minWidth: 200,
    minHeight: 200,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    excludePatterns: ['icon', 'logo', 'avatar', 'thumbnail']
  };

  /**
   * Extract images from product URLs
   */
  async extractFromUrl(url: string, options: ImageExtractionOptions = {}): Promise<ImageExtractionResult> {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      const html = await response.text();
      const images = await this.parseImagesFromHtml(html, url, config);
      
      return {
        images: images.slice(0, config.maxImages),
        totalFound: images.length,
        extractionErrors: []
      };
    } catch (error) {
      return {
        images: [],
        totalFound: 0,
        extractionErrors: [error instanceof Error ? error.message : 'Unknown extraction error']
      };
    }
  }

  /**
   * Extract images from extracted content
   */
  async extractFromContent(content: ExtractedContent, options: ImageExtractionOptions = {}): Promise<ImageExtractionResult> {
    if (content.contentType === 'youtube_video') {
      // For YouTube videos, we'll use the ScreenshotProcessor
      return {
        images: content.images || [],
        totalFound: content.images?.length || 0,
        extractionErrors: []
      };
    }

    return this.extractFromUrl(content.url, options);
  }

  private async parseImagesFromHtml(html: string, baseUrl: string, config: Required<ImageExtractionOptions>): Promise<ImageData[]> {
    const images: ImageData[] = [];
    
    // Simple regex-based image extraction (in a real implementation, you'd use a proper HTML parser)
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      
      if (this.shouldIncludeImage(src, config)) {
        const absoluteUrl = this.resolveUrl(src, baseUrl);
        const imageData = await this.createImageData(absoluteUrl, html, match[0]);
        
        if (imageData) {
          images.push(imageData);
        }
      }
    }

    // Also look for images in CSS background-image properties
    const cssImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
    while ((match = cssImageRegex.exec(html)) !== null) {
      const src = match[1];
      
      if (this.shouldIncludeImage(src, config)) {
        const absoluteUrl = this.resolveUrl(src, baseUrl);
        const imageData = await this.createImageData(absoluteUrl, html);
        
        if (imageData) {
          images.push(imageData);
        }
      }
    }

    return images;
  }

  private shouldIncludeImage(src: string, config: Required<ImageExtractionOptions>): boolean {
    // Check file extension
    const extension = src.split('.').pop()?.toLowerCase();
    if (!extension || !config.allowedFormats.includes(extension)) {
      return false;
    }

    // Check exclude patterns
    const srcLower = src.toLowerCase();
    return !config.excludePatterns.some(pattern => srcLower.includes(pattern));
  }

  private resolveUrl(src: string, baseUrl: string): string {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    if (src.startsWith('//')) {
      return `https:${src}`;
    }
    
    if (src.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${src}`;
    }
    
    return new URL(src, baseUrl).href;
  }

  private async createImageData(url: string, html: string, imgTag?: string): Promise<ImageData | null> {
    try {
      // Extract alt text and other metadata from img tag if available
      let altText = '';
      let title = '';
      
      if (imgTag) {
        const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
        const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);
        
        altText = altMatch ? altMatch[1] : '';
        title = titleMatch ? titleMatch[1] : '';
      }

      // Get image dimensions (this would require actual image loading in a real implementation)
      const dimensions = await this.getImageDimensions(url);
      
      return {
        url,
        alt: altText,
        caption: title,
        width: dimensions.width,
        height: dimensions.height
      };
    } catch (error) {
      console.warn(`Failed to process image ${url}:`, error);
      return null;
    }
  }

  private async getImageDimensions(url: string): Promise<{ width: number; height: number; size?: number }> {
    // In a real implementation, this would load the image and get actual dimensions
    // For now, return default values
    return {
      width: 400,
      height: 300,
      size: 50000 // 50KB default
    };
  }

  private getImageFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private calculateRelevanceScore(url: string, altText: string, title: string): number {
    let score = 0.5; // Base score

    // Higher score for product-related keywords
    const productKeywords = ['product', 'item', 'main', 'primary', 'feature', 'detail'];
    const text = `${url} ${altText} ${title}`.toLowerCase();
    
    productKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 0.1;
      }
    });

    // Lower score for common non-product images
    const excludeKeywords = ['icon', 'logo', 'banner', 'ad', 'advertisement'];
    excludeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score -= 0.2;
      }
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Validate image URL accessibility
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
    } catch {
      return false;
    }
  }

  /**
   * Get image metadata without downloading the full image
   */
  async getImageMetadata(url: string): Promise<Partial<ImageData> | null> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) return null;

      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      return {
        url
      };
    } catch {
      return null;
    }
  }
}