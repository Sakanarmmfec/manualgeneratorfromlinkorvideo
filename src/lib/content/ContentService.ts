/**
 * ContentService - Main service that coordinates content extraction from various sources
 * Handles both website content extraction and YouTube video processing
 */

import { URLProcessor, URLValidationResult } from './URLProcessor';
import { ContentExtractor, ExtractionOptions } from './ContentExtractor';
import { YouTubeProcessor, YouTubeExtractionOptions } from './YouTubeProcessor';
import { ExtractedContent } from '../../types';

export interface ContentExtractionOptions {
  website?: Partial<ExtractionOptions>;
  youtube?: Partial<YouTubeExtractionOptions>;
  validateUrl?: boolean;
  checkAccessibility?: boolean;
}

export interface ContentExtractionResult {
  success: boolean;
  content?: ExtractedContent;
  urlValidation?: URLValidationResult;
  error?: string;
  warnings?: string[];
}

export class ContentService {
  private urlProcessor: URLProcessor;
  private contentExtractor: ContentExtractor;
  private youtubeProcessor: YouTubeProcessor;

  constructor() {
    this.urlProcessor = new URLProcessor();
    this.contentExtractor = new ContentExtractor();
    this.youtubeProcessor = new YouTubeProcessor();
  }

  /**
   * Main method to extract content from any supported URL
   */
  async extractContent(url: string, options?: ContentExtractionOptions): Promise<ContentExtractionResult> {
    const warnings: string[] = [];

    try {
      // Validate URL first
      const urlValidation = this.urlProcessor.validateUrl(url);
      
      if (!urlValidation.isValid) {
        return {
          success: false,
          urlValidation,
          error: urlValidation.error || 'Invalid URL'
        };
      }

      // Check accessibility if requested
      if (options?.checkAccessibility) {
        const accessibility = await this.urlProcessor.checkUrlAccessibility(url);
        if (!accessibility.accessible) {
          warnings.push(`URL may not be accessible: ${accessibility.error || 'Unknown issue'}`);
        }
      }

      // Normalize URL
      const normalizedUrl = this.urlProcessor.normalizeUrl(url);

      // Extract content based on URL type
      let result: ContentExtractionResult;

      if (urlValidation.type === 'youtube_video') {
        result = await this.extractYouTubeContent(normalizedUrl, options?.youtube);
      } else if (urlValidation.type === 'website') {
        result = await this.extractWebsiteContent(normalizedUrl, options?.website);
      } else {
        return {
          success: false,
          urlValidation,
          error: 'Unsupported URL type'
        };
      }

      // Add any warnings from URL processing
      if (warnings.length > 0) {
        result.warnings = [...(result.warnings || []), ...warnings];
      }

      result.urlValidation = urlValidation;
      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during content extraction'
      };
    }
  }

  /**
   * Extracts content from a website URL
   */
  private async extractWebsiteContent(url: string, options?: Partial<ExtractionOptions>): Promise<ContentExtractionResult> {
    try {
      const result = await this.contentExtractor.extractWebsiteContent(url, options);
      
      if (!result.success || !result.content) {
        return {
          success: false,
          error: result.error || 'Failed to extract website content'
        };
      }

      // Validate extracted content
      const validation = this.contentExtractor.validateExtractedContent(result.content);
      const warnings = validation.issues.length > 0 ? validation.issues : undefined;

      return {
        success: validation.isValid,
        content: result.content,
        warnings,
        error: validation.isValid ? undefined : 'Content validation failed'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during website extraction'
      };
    }
  }

  /**
   * Extracts content from a YouTube video URL
   */
  private async extractYouTubeContent(url: string, options?: Partial<YouTubeExtractionOptions>): Promise<ContentExtractionResult> {
    try {
      const result = await this.youtubeProcessor.processYouTubeVideo(url, options);
      
      if (!result.success || !result.content) {
        return {
          success: false,
          error: result.error || 'Failed to extract YouTube content'
        };
      }

      return {
        success: true,
        content: result.content,
        warnings: result.warnings
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during YouTube extraction'
      };
    }
  }

  /**
   * Extracts content from multiple URLs concurrently
   */
  async extractMultipleUrls(urls: string[], options?: ContentExtractionOptions): Promise<ContentExtractionResult[]> {
    const promises = urls.map(url => this.extractContent(url, options));
    return Promise.all(promises);
  }

  /**
   * Validates multiple URLs
   */
  validateUrls(urls: string[]): URLValidationResult[] {
    return this.urlProcessor.validateUrls(urls);
  }

  /**
   * Gets URL metadata without full content extraction
   */
  getUrlMetadata(url: string) {
    const validation = this.urlProcessor.validateUrl(url);
    const metadata = this.urlProcessor.extractUrlMetadata(url);
    
    return {
      validation,
      metadata,
      normalizedUrl: this.urlProcessor.normalizeUrl(url)
    };
  }

  /**
   * Checks if a URL is a YouTube video
   */
  isYouTubeUrl(url: string): boolean {
    const validation = this.urlProcessor.validateUrl(url);
    return validation.type === 'youtube_video';
  }

  /**
   * Extracts YouTube video ID from URL
   */
  getYouTubeVideoId(url: string): string | null {
    return this.youtubeProcessor.extractVideoId(url);
  }

  /**
   * Gets supported content types
   */
  getSupportedTypes(): string[] {
    return ['website', 'youtube_video'];
  }

  /**
   * Gets default extraction options
   */
  getDefaultOptions(): ContentExtractionOptions {
    return {
      website: {
        includeImages: true,
        maxImages: 10,
        imageMinWidth: 100,
        imageMinHeight: 100,
        timeout: 30000
      },
      youtube: {
        includeTranscript: true,
        includeScreenshots: false,
        maxScreenshots: 10,
        transcriptLanguage: 'en',
        timeout: 30000
      },
      validateUrl: true,
      checkAccessibility: false
    };
  }
}