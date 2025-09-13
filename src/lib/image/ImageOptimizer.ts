import { ImageData } from '../../types';

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
  compressionLevel?: number;
}

export interface OptimizationResult {
  optimizedImage: ImageData;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

export class ImageOptimizer {
  private readonly defaultOptions: Required<OptimizationOptions> = {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.85,
    format: 'jpg',
    maintainAspectRatio: true,
    compressionLevel: 7
  };

  /**
   * Optimize image for document inclusion
   */
  async optimizeForDocument(
    image: ImageData,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const optimizedImage = await this.processImage(image, config);
      
      return {
        optimizedImage,
        originalSize: 0, // Size information not available in ImageData
        optimizedSize: 0, // Size information not available in ImageData
        compressionRatio: 1
      };
    } catch (error) {
      // Return original image if optimization fails
      return {
        optimizedImage: image,
        originalSize: 0,
        optimizedSize: 0,
        compressionRatio: 1
      };
    }
  }

  /**
   * Batch optimize multiple images
   */
  async optimizeBatch(
    images: ImageData[],
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    
    for (const image of images) {
      const result = await this.optimizeForDocument(image, options);
      results.push(result);
    }
    
    return results;
  }

  private async processImage(
    image: ImageData,
    config: Required<OptimizationOptions>
  ): Promise<ImageData> {
    // Calculate new dimensions
    const newDimensions = this.calculateOptimalDimensions(
      image.width || 800, // Default width if not specified
      image.height || 600, // Default height if not specified
      config.maxWidth,
      config.maxHeight,
      config.maintainAspectRatio
    );

    // In a real implementation, this would:
    // 1. Load the image from the URL
    // 2. Resize it to the new dimensions
    // 3. Apply compression based on quality settings
    // 4. Convert to the target format
    // 5. Return the optimized image data

    return {
      ...image,
      width: newDimensions.width,
      height: newDimensions.height,
      url: await this.generateOptimizedUrl(image, config)
    };
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight)
      };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = Math.min(originalWidth, maxWidth);
    let newHeight = newWidth / aspectRatio;
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
    
    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    };
  }

  private estimateOptimizedSize(
    image: ImageData,
    newDimensions: { width: number; height: number },
    config: Required<OptimizationOptions>
  ): number {
    const originalSize = 0; // Size information not available in ImageData
    const imageWidth = image.width || 800;
    const imageHeight = image.height || 600;
    const dimensionRatio = (newDimensions.width * newDimensions.height) / (imageWidth * imageHeight);
    const qualityRatio = config.quality;
    
    return Math.round(originalSize * dimensionRatio * qualityRatio);
  }

  private async generateOptimizedUrl(
    image: ImageData,
    config: Required<OptimizationOptions>
  ): Promise<string> {
    // In a real implementation, this would return the URL to the optimized image
    // For now, return the original URL with a query parameter to indicate optimization
    return `${image.url}?optimized=true&w=${config.maxWidth}&h=${config.maxHeight}&q=${config.quality}`;
  }

  /**
   * Optimize image specifically for print documents
   */
  async optimizeForPrint(image: ImageData): Promise<OptimizationResult> {
    return this.optimizeForDocument(image, {
      maxWidth: 1200,
      maxHeight: 900,
      quality: 0.9,
      format: 'jpg',
      maintainAspectRatio: true
    });
  }

  /**
   * Optimize image for web display
   */
  async optimizeForWeb(image: ImageData): Promise<OptimizationResult> {
    return this.optimizeForDocument(image, {
      maxWidth: 600,
      maxHeight: 400,
      quality: 0.8,
      format: 'webp',
      maintainAspectRatio: true
    });
  }

  /**
   * Create thumbnail version of image
   */
  async createThumbnail(
    image: ImageData,
    size: number = 150
  ): Promise<OptimizationResult> {
    return this.optimizeForDocument(image, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpg',
      maintainAspectRatio: true
    });
  }

  /**
   * Validate image quality and suggest optimizations
   */
  analyzeImage(image: ImageData): {
    needsOptimization: boolean;
    recommendations: string[];
    estimatedSavings: number;
  } {
    const recommendations: string[] = [];
    let needsOptimization = false;
    let estimatedSavings = 0;

    // Note: File size information not available in ImageData interface
    // Optimization recommendations based on dimensions only

    // Check dimensions
    if ((image.width && image.width > 1200) || (image.height && image.height > 900)) {
      needsOptimization = true;
      recommendations.push('Image dimensions are large, resizing recommended');
      estimatedSavings += 0.4; // 40% potential savings
    }

    // Note: Format information not available in ImageData interface
    // Format optimization recommendations would require additional metadata

    return {
      needsOptimization,
      recommendations,
      estimatedSavings: Math.min(estimatedSavings, 0.8) // Cap at 80% savings
    };
  }

  private requiresTransparency(image: ImageData): boolean {
    // In a real implementation, this would analyze the image for transparency
    // Format information not available in ImageData interface
    return false; // Default to no transparency requirement
  }

  /**
   * Get optimal format for image based on content
   */
  getOptimalFormat(image: ImageData): 'jpg' | 'png' | 'webp' {
    // Simple heuristics for format selection
    if (this.requiresTransparency(image)) {
      return 'png';
    }
    
    const width = image.width || 800;
    const height = image.height || 600;
    if (width * height > 500000) { // Large images
      return 'webp'; // Better compression for large images
    }
    
    return 'jpg'; // Default for photos and complex images
  }

  /**
   * Calculate optimal quality setting based on image characteristics
   */
  calculateOptimalQuality(image: ImageData): number {
    let quality = 0.85; // Default quality

    // Adjust based on image size
    const width = image.width || 800;
    const height = image.height || 600;
    const pixelCount = width * height;
    if (pixelCount > 1000000) { // 1MP+
      quality = 0.8; // Lower quality for very large images
    } else if (pixelCount < 100000) { // <0.1MP
      quality = 0.9; // Higher quality for small images
    }

    // Note: File size information not available in ImageData interface
    // Quality adjustment based on pixel count only

    return quality;
  }
}