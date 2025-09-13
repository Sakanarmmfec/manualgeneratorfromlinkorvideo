/**
 * URLProcessor - Validates and processes product URLs and YouTube video URLs
 * Handles URL validation, type detection, and basic URL parsing
 */

export interface URLValidationResult {
  isValid: boolean;
  type: 'website' | 'youtube_video' | 'invalid';
  url: string;
  videoId?: string; // For YouTube URLs
  error?: string;
}

export interface URLMetadata {
  domain: string;
  protocol: string;
  path: string;
  queryParams: Record<string, string>;
  fragment?: string;
}

export class URLProcessor {
  private readonly youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  private readonly validProtocols = ['http:', 'https:'];
  private readonly blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0'];

  /**
   * Validates and categorizes a URL
   */
  validateUrl(url: string): URLValidationResult {
    try {
      // Basic URL validation
      const urlObj = new URL(url);
      
      // Check protocol
      if (!this.validProtocols.includes(urlObj.protocol)) {
        return {
          isValid: false,
          type: 'invalid',
          url,
          error: 'Invalid protocol. Only HTTP and HTTPS are supported.'
        };
      }

      // Check for blocked domains (security)
      if (this.blockedDomains.includes(urlObj.hostname)) {
        return {
          isValid: false,
          type: 'invalid',
          url,
          error: 'Local URLs are not allowed for security reasons.'
        };
      }

      // Check if it's a YouTube URL
      const videoId = this.extractYouTubeVideoId(url);
      if (videoId) {
        return {
          isValid: true,
          type: 'youtube_video',
          url,
          videoId
        };
      }

      // Check if it's a valid website URL
      if (this.isValidWebsiteUrl(urlObj)) {
        return {
          isValid: true,
          type: 'website',
          url
        };
      }

      return {
        isValid: false,
        type: 'invalid',
        url,
        error: 'URL format not supported.'
      };

    } catch (error) {
      return {
        isValid: false,
        type: 'invalid',
        url,
        error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extracts YouTube video ID from various YouTube URL formats
   */
  extractYouTubeVideoId(url: string): string | null {
    for (const pattern of this.youtubePatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Checks if URL is a valid website URL
   */
  private isValidWebsiteUrl(urlObj: URL): boolean {
    // Check if it's a YouTube URL (should be handled separately)
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return false;
    }

    // Basic website validation
    return urlObj.hostname.includes('.') && urlObj.hostname.length > 3;
  }

  /**
   * Extracts metadata from URL
   */
  extractUrlMetadata(url: string): URLMetadata | null {
    try {
      const urlObj = new URL(url);
      const queryParams: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      return {
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        path: urlObj.pathname,
        queryParams,
        fragment: urlObj.hash ? urlObj.hash.substring(1) : undefined
      };
    } catch {
      return null;
    }
  }

  /**
   * Normalizes URL by removing unnecessary parameters and fragments
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // For YouTube URLs, keep only essential parameters
      if (this.extractYouTubeVideoId(url)) {
        const videoId = this.extractYouTubeVideoId(url);
        const timeParam = urlObj.searchParams.get('t') || urlObj.searchParams.get('time_continue');
        
        let normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
        if (timeParam) {
          normalizedUrl += `&t=${timeParam}`;
        }
        return normalizedUrl;
      }

      // For regular websites, remove tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      // Remove fragment
      urlObj.hash = '';

      return urlObj.toString();
    } catch {
      return url; // Return original if normalization fails
    }
  }

  /**
   * Validates multiple URLs at once
   */
  validateUrls(urls: string[]): URLValidationResult[] {
    return urls.map(url => this.validateUrl(url));
  }

  /**
   * Checks if URL is accessible (basic connectivity test)
   */
  async checkUrlAccessibility(url: string): Promise<{ accessible: boolean; status?: number; error?: string }> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      return {
        accessible: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}