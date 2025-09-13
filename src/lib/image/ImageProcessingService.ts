import { ImageExtractor, ImageExtractionOptions, ImageExtractionResult } from './ImageExtractor';
import { ScreenshotProcessor, ScreenshotOptions, ScreenshotProcessingResult } from './ScreenshotProcessor';
import { ImageOptimizer, OptimizationOptions, OptimizationResult } from './ImageOptimizer';
import { ImagePlacer, PlacementOptions, PlacementResult } from './ImagePlacer';
import { ImageData, ExtractedContent, DocumentSection, VideoMoment } from '../../types';

export interface ImageProcessingOptions {
  extraction?: ImageExtractionOptions;
  screenshot?: ScreenshotOptions;
  optimization?: OptimizationOptions;
  placement?: PlacementOptions;
}

export interface ImageProcessingResult {
  extractedImages: ImageData[];
  screenshots: ImageData[];
  optimizedImages: OptimizationResult[];
  placements: PlacementResult;
  processingErrors: string[];
  totalProcessingTime: number;
}

export class ImageProcessingService {
  private imageExtractor: ImageExtractor;
  private screenshotProcessor: ScreenshotProcessor;
  private imageOptimizer: ImageOptimizer;
  private imagePlacer: ImagePlacer;

  constructor() {
    this.imageExtractor = new ImageExtractor();
    this.screenshotProcessor = new ScreenshotProcessor();
    this.imageOptimizer = new ImageOptimizer();
    this.imagePlacer = new ImagePlacer();
  }

  /**
   * Complete image processing pipeline for document generation
   */
  async processImagesForDocument(
    content: ExtractedContent,
    sections: DocumentSection[],
    options: ImageProcessingOptions = {}
  ): Promise<ImageProcessingResult> {
    const startTime = Date.now();
    const processingErrors: string[] = [];
    
    try {
      // Step 1: Extract images from content
      const extractionResult = await this.extractImages(content, options.extraction);
      if (extractionResult.extractionErrors.length > 0) {
        processingErrors.push(...extractionResult.extractionErrors);
      }

      // Step 2: Process video screenshots if content is a video
      let screenshotResult: ScreenshotProcessingResult = {
        screenshots: [],
        processedCount: 0,
        errors: []
      };

      if (content.contentType === 'youtube_video' && content.videoContent) {
        screenshotResult = await this.processVideoScreenshots(
          content.videoContent.videoId,
          content.videoContent.keyMoments,
          content.videoContent.duration,
          options.screenshot
        );
        
        if (screenshotResult.errors.length > 0) {
          processingErrors.push(...screenshotResult.errors);
        }
      }

      // Step 3: Combine all images
      const allImages = [
        ...extractionResult.images,
        ...this.screenshotProcessor.convertScreenshotsToImageData(screenshotResult.screenshots)
      ];

      // Step 4: Optimize images for document inclusion
      const optimizationResults = await this.optimizeImages(allImages, options.optimization);

      // Step 5: Determine optimal image placement
      const optimizedImages = optimizationResults.map(result => result.optimizedImage);
      const placementResult = await this.placeImages(optimizedImages, sections, options.placement);

      const totalProcessingTime = Date.now() - startTime;

      return {
        extractedImages: extractionResult.images,
        screenshots: this.screenshotProcessor.convertScreenshotsToImageData(screenshotResult.screenshots),
        optimizedImages: optimizationResults,
        placements: placementResult,
        processingErrors,
        totalProcessingTime
      };
    } catch (error) {
      const totalProcessingTime = Date.now() - startTime;
      
      return {
        extractedImages: [],
        screenshots: [],
        optimizedImages: [],
        placements: {
          placements: [],
          unplacedImages: [],
          placementScore: 0
        },
        processingErrors: [error instanceof Error ? error.message : 'Unknown processing error'],
        totalProcessingTime
      };
    }
  }

  /**
   * Extract images from content
   */
  async extractImages(
    content: ExtractedContent,
    options?: ImageExtractionOptions
  ): Promise<ImageExtractionResult> {
    return this.imageExtractor.extractFromContent(content, options);
  }

  /**
   * Process video screenshots
   */
  async processVideoScreenshots(
    videoId: string,
    keyMoments: VideoMoment[],
    duration: number,
    options?: ScreenshotOptions
  ): Promise<ScreenshotProcessingResult> {
    if (keyMoments.length > 0) {
      // Use key moments for targeted screenshot capture
      return this.screenshotProcessor.captureFromVideo(videoId, keyMoments, options);
    } else {
      // Fall back to interval-based capture
      return this.screenshotProcessor.captureAtIntervals(videoId, duration, options);
    }
  }

  /**
   * Optimize images for document inclusion
   */
  async optimizeImages(
    images: ImageData[],
    options?: OptimizationOptions
  ): Promise<OptimizationResult[]> {
    return this.imageOptimizer.optimizeBatch(images, options);
  }

  /**
   * Determine optimal image placement
   */
  async placeImages(
    images: ImageData[],
    sections: DocumentSection[],
    options?: PlacementOptions
  ): Promise<PlacementResult> {
    return this.imagePlacer.determineOptimalPlacement(images, sections, options);
  }

  /**
   * Handle image fallbacks and placeholder generation
   */
  async generateFallbacks(
    sections: DocumentSection[],
    failedImages: ImageData[] = []
  ): Promise<{
    placeholders: any[];
    fallbackPlacements: any[];
  }> {
    // Generate placeholder placements for sections without images
    const placeholders = this.imagePlacer.createPlaceholderPlacements(sections);
    
    // Generate fallback placements for failed images
    const fallbackPlacements = this.imagePlacer.generateFallbackPlacements(failedImages, sections);

    return {
      placeholders,
      fallbackPlacements
    };
  }

  /**
   * Validate image URLs and filter out inaccessible images
   */
  async validateImages(images: ImageData[]): Promise<{
    validImages: ImageData[];
    invalidImages: ImageData[];
  }> {
    const validImages: ImageData[] = [];
    const invalidImages: ImageData[] = [];

    for (const image of images) {
      const isValid = await this.imageExtractor.validateImageUrl(image.url);
      if (isValid) {
        validImages.push(image);
      } else {
        invalidImages.push(image);
      }
    }

    return { validImages, invalidImages };
  }

  /**
   * Get processing statistics and recommendations
   */
  getProcessingStats(result: ImageProcessingResult): {
    totalImages: number;
    successfulExtractions: number;
    successfulOptimizations: number;
    placementScore: number;
    averageCompressionRatio: number;
    recommendations: string[];
  } {
    const totalImages = result.extractedImages.length + result.screenshots.length;
    const successfulOptimizations = result.optimizedImages.filter(
      opt => opt.compressionRatio < 1
    ).length;
    
    const averageCompressionRatio = result.optimizedImages.length > 0
      ? result.optimizedImages.reduce((sum, opt) => sum + opt.compressionRatio, 0) / result.optimizedImages.length
      : 1;

    const recommendations: string[] = [];
    
    if (result.placements.unplacedImages.length > 0) {
      recommendations.push(`${result.placements.unplacedImages.length} images could not be placed automatically`);
    }
    
    if (averageCompressionRatio > 0.8) {
      recommendations.push('Consider more aggressive image optimization for better document size');
    }
    
    if (result.placements.placementScore < 60) {
      recommendations.push('Image placement could be improved - consider manual review');
    }

    return {
      totalImages,
      successfulExtractions: result.extractedImages.length,
      successfulOptimizations,
      placementScore: result.placements.placementScore,
      averageCompressionRatio,
      recommendations
    };
  }

  /**
   * Create optimized image processing options for different document types
   */
  getDocumentTypeOptions(documentType: 'user_manual' | 'product_document'): ImageProcessingOptions {
    const baseOptions: ImageProcessingOptions = {
      extraction: {
        maxImages: 15,
        minWidth: 200,
        minHeight: 200
      },
      optimization: {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.85
      },
      placement: {
        maxImagesPerSection: 3,
        preferredAlignment: 'center',
        allowTextWrapping: true
      }
    };

    if (documentType === 'user_manual') {
      return {
        ...baseOptions,
        extraction: {
          ...baseOptions.extraction,
          maxImages: 20 // More images for step-by-step guides
        },
        screenshot: {
          maxScreenshots: 15,
          intervalSeconds: 20 // More frequent screenshots for tutorials
        },
        placement: {
          ...baseOptions.placement,
          preferredPosition: 'middle',
          prioritizeRelevance: true
        }
      };
    } else {
      return {
        ...baseOptions,
        extraction: {
          ...baseOptions.extraction,
          maxImages: 10 // Fewer images for product documents
        },
        screenshot: {
          maxScreenshots: 8,
          intervalSeconds: 45 // Less frequent screenshots
        },
        placement: {
          ...baseOptions.placement,
          preferredPosition: 'top',
          maxImagesPerSection: 2
        }
      };
    }
  }
}