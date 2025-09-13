/**
 * ContentExtractor - Handles web scraping and content parsing for websites
 * Extracts text content, images, and metadata from web pages
 */

import * as cheerio from 'cheerio';
import { ImageData, ContentMetadata, ExtractedContent } from '../../types';

export interface ExtractionOptions {
  includeImages: boolean;
  maxImages: number;
  imageMinWidth: number;
  imageMinHeight: number;
  timeout: number;
  userAgent: string;
}

export interface ExtractionResult {
  success: boolean;
  content?: ExtractedContent;
  error?: string;
}

export class ContentExtractor {
  private readonly defaultOptions: ExtractionOptions = {
    includeImages: true,
    maxImages: 10,
    imageMinWidth: 100,
    imageMinHeight: 100,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  /**
   * Extracts content from a website URL
   */
  async extractWebsiteContent(url: string, options?: Partial<ExtractionOptions>): Promise<ExtractionResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Fetch the webpage
      const response = await fetch(url, {
        headers: {
          'User-Agent': opts.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(opts.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract metadata
      const metadata = this.extractMetadata($, url);

      // Extract main content
      const textContent = this.extractTextContent($);

      // Extract images if requested
      const images = opts.includeImages ? this.extractImages($, url, opts) : [];

      const extractedContent: ExtractedContent = {
        url,
        title: metadata.title,
        contentType: 'website',
        textContent,
        images,
        metadata,
        extractionTimestamp: new Date()
      };

      return {
        success: true,
        content: extractedContent
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      };
    }
  }

  /**
   * Extracts metadata from the webpage
   */
  private extractMetadata($: cheerio.CheerioAPI, url: string): ContentMetadata {
    // Extract title - prefer OG title over page title
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text().trim();
    
    const title = ogTitle || twitterTitle || pageTitle || 'Untitled';

    // Extract description - prefer OG description over regular description
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const twitterDescription = $('meta[name="twitter:description"]').attr('content');
    const regularDescription = $('meta[name="description"]').attr('content');
    
    const description = ogDescription || twitterDescription || regularDescription;

    // Extract author
    const author = $('meta[name="author"]').attr('content') || 
                  $('meta[property="article:author"]').attr('content');

    // Extract publish date
    let publishDate: Date | undefined;
    const dateStr = $('meta[property="article:published_time"]').attr('content') || 
                   $('meta[name="date"]').attr('content') ||
                   $('time[datetime]').attr('datetime');
    
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
      }
    }

    // Extract language
    const language = $('html').attr('lang') || 
                    $('meta[http-equiv="content-language"]').attr('content') || 
                    'en';

    // Extract keywords/tags
    const keywordsStr = $('meta[name="keywords"]').attr('content') || '';
    const tags = keywordsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    return {
      title,
      description,
      author,
      publishDate,
      language,
      tags
    };
  }

  /**
   * Extracts main text content from the webpage
   */
  private extractTextContent($: cheerio.CheerioAPI): string {
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share').remove();

    // Try to find main content area
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      '#content',
      '#main',
      '.container .row .col',
      'body'
    ];

    let mainContent = '';
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Extract text and clean it up
        mainContent = element.text();
        break;
      }
    }

    // If no main content found, extract from body
    if (!mainContent) {
      mainContent = $('body').text();
    }

    // Clean up the text
    return this.cleanTextContent(mainContent);
  }

  /**
   * Cleans and normalizes text content
   */
  private cleanTextContent(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Remove common unwanted patterns
      .replace(/\s*\n\s*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      // Remove empty lines at start/end
      .replace(/^\n+|\n+$/g, '');
  }

  /**
   * Extracts images from the webpage
   */
  private extractImages($: cheerio.CheerioAPI, baseUrl: string, options: ExtractionOptions): ImageData[] {
    const images: ImageData[] = [];
    const seenUrls = new Set<string>();

    $('img').each((_, element) => {
      if (images.length >= options.maxImages) return false;

      const $img = $(element);
      const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      
      if (!src) return;

      // Convert relative URLs to absolute
      try {
        const imageUrl = new URL(src, baseUrl).toString();
        
        // Skip if we've already seen this URL
        if (seenUrls.has(imageUrl)) return;
        seenUrls.add(imageUrl);

        // Skip data URLs and very small images
        if (imageUrl.startsWith('data:') || 
            imageUrl.includes('1x1') || 
            imageUrl.includes('pixel')) {
          return;
        }

        const alt = $img.attr('alt') || '';
        const title = $img.attr('title') || '';
        
        // Try to get dimensions
        const width = parseInt($img.attr('width') || '0');
        const height = parseInt($img.attr('height') || '0');

        // Skip very small images if dimensions are available
        if ((width > 0 && width < options.imageMinWidth) || 
            (height > 0 && height < options.imageMinHeight)) {
          return;
        }

        images.push({
          url: imageUrl,
          alt: alt || title || 'Image',
          caption: title || alt,
          width: width > 0 ? width : undefined,
          height: height > 0 ? height : undefined
        });

      } catch (error) {
        // Skip invalid URLs
        console.warn(`Invalid image URL: ${src}`);
      }
    });

    return images;
  }

  /**
   * Validates if content extraction was successful
   */
  validateExtractedContent(content: ExtractedContent): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!content.title || content.title.trim().length === 0) {
      issues.push('No title found');
    }

    if (!content.textContent || content.textContent.trim().length < 100) {
      issues.push('Insufficient text content (less than 100 characters)');
    }

    if (content.textContent && content.textContent.length > 100000) {
      issues.push('Content too large (over 100,000 characters)');
    }

    if (!content.metadata.language) {
      issues.push('Language not detected');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Extracts content from multiple URLs concurrently
   */
  async extractMultipleUrls(urls: string[], options?: Partial<ExtractionOptions>): Promise<ExtractionResult[]> {
    const promises = urls.map(url => this.extractWebsiteContent(url, options));
    return Promise.all(promises);
  }
}