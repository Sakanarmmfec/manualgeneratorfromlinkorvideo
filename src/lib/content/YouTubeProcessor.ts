/**
 * Enhanced YouTubeProcessor - Handles YouTube video processing with better metadata and transcript extraction
 * Supports video analysis, transcript extraction, and screenshot capture coordination
 */

import { VideoContent, VideoMoment, VideoScreenshot, ExtractedContent, ContentMetadata, ImageData } from '../../types';

export interface YouTubeExtractionOptions {
  includeTranscript: boolean;
  includeScreenshots: boolean;
  maxScreenshots: number;
  transcriptLanguage: string;
  timeout: number;
}

export interface YouTubeExtractionResult {
  success: boolean;
  content?: ExtractedContent;
  error?: string;
  warnings?: string[];
}

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
  confidence?: number;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  channelName?: string;
  publishDate?: Date;
  viewCount?: number;
  language?: string;
}

export class YouTubeProcessor {
  private readonly defaultOptions: YouTubeExtractionOptions = {
    includeTranscript: true,
    includeScreenshots: false, // Screenshots handled by separate service
    maxScreenshots: 10,
    transcriptLanguage: 'en',
    timeout: 30000
  };

  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  /**
   * Extracts video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Processes YouTube video and extracts comprehensive content
   */
  async processYouTubeVideo(url: string, options?: Partial<YouTubeExtractionOptions>): Promise<YouTubeExtractionResult> {
    const opts = { ...this.defaultOptions, ...options };
    const warnings: string[] = [];

    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        return {
          success: false,
          error: 'Invalid YouTube URL format'
        };
      }

      // Get basic video information
      const videoInfo = await this.getVideoInfo(videoId);
      if (!videoInfo) {
        return {
          success: false,
          error: 'Failed to retrieve video information'
        };
      }

      // Get transcript if requested
      let transcript: TranscriptSegment[] = [];
      let fullTranscriptText = '';
      
      if (opts.includeTranscript) {
        const transcriptResult = await this.getVideoTranscript(videoId, opts.transcriptLanguage);
        if (transcriptResult.success && transcriptResult.transcript) {
          transcript = transcriptResult.transcript;
          fullTranscriptText = transcript.map(segment => segment.text).join(' ');
        } else {
          warnings.push(`Transcript extraction failed: ${transcriptResult.error}`);
        }
      }

      // Analyze video content and identify key moments
      const keyMoments = this.analyzeVideoContent(transcript, videoInfo);

      // Create video content object
      const videoContent: VideoContent = {
        videoId,
        duration: videoInfo.duration,
        transcript: fullTranscriptText,
        keyMoments,
        screenshots: [] // Will be populated by screenshot service
      };

      // Create metadata
      const metadata: ContentMetadata = {
        title: videoInfo.title,
        description: videoInfo.description,
        author: videoInfo.channelName,
        publishDate: videoInfo.publishDate,
        language: videoInfo.language || opts.transcriptLanguage,
        tags: this.extractTagsFromDescription(videoInfo.description)
      };

      // Create thumbnail image
      const images: ImageData[] = [{
        url: videoInfo.thumbnailUrl,
        alt: `Thumbnail for ${videoInfo.title}`,
        caption: 'Video thumbnail'
      }];

      // Create extracted content
      const extractedContent: ExtractedContent = {
        url,
        title: videoInfo.title,
        contentType: 'youtube_video',
        textContent: this.createTextSummary(videoInfo, fullTranscriptText),
        videoContent,
        images,
        metadata,
        extractionTimestamp: new Date()
      };

      return {
        success: true,
        content: extractedContent,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during video processing'
      };
    }
  }

  /**
   * Gets basic video information from YouTube
   */
  private async getVideoInfo(videoId: string): Promise<VideoInfo | null> {
    try {
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Extract video information from page HTML - try multiple patterns
      // First try to extract from ytInitialData
      let title = 'Unknown Title';
      let description = '';
      let duration = 0;
      let channelName: string | undefined;
      let viewCount: number | undefined;

      // Try to extract from ytInitialData JSON
      const ytInitialDataMatch = html.match(/var ytInitialData = ({[\s\S]*?});/);
      if (ytInitialDataMatch) {
        try {
          const ytData = JSON.parse(ytInitialDataMatch[1]);
          if (ytData.videoDetails) {
            title = ytData.videoDetails.title || title;
            description = ytData.videoDetails.shortDescription || description;
            duration = parseInt(ytData.videoDetails.lengthSeconds || '0');
            channelName = ytData.videoDetails.author;
            viewCount = parseInt(ytData.videoDetails.viewCount || '0');
          }
        } catch (e) {
          // Fall back to regex extraction
        }
      }

      // Fallback to regex patterns if JSON parsing failed
      if (title === 'Unknown Title') {
        title = this.extractFromHTML(html, /"title":"([^"]+)"/) || title;
      }
      if (!description) {
        description = this.extractFromHTML(html, /"shortDescription":"([^"]+)"/) || '';
      }
      if (duration === 0) {
        const durationStr = this.extractFromHTML(html, /"lengthSeconds":"(\d+)"/) || '0';
        duration = parseInt(durationStr);
      }
      if (!channelName) {
        channelName = this.extractFromHTML(html, /"author":"([^"]+)"/) || undefined;
      }
      if (!viewCount) {
        const viewCountStr = this.extractFromHTML(html, /"viewCount":"(\d+)"/) || '0';
        viewCount = parseInt(viewCountStr);
      }

      // Extract publish date
      let publishDate: Date | undefined;
      const publishDateStr = this.extractFromHTML(html, /"publishDate":"([^"]+)"/);
      if (publishDateStr) {
        publishDate = new Date(publishDateStr);
      }

      return {
        videoId,
        title: this.decodeHTMLEntities(title),
        description: this.decodeHTMLEntities(description),
        duration,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelName: channelName ? this.decodeHTMLEntities(channelName) : undefined,
        publishDate,
        viewCount: viewCount > 0 ? viewCount : undefined,
        language: 'en' // Default, could be enhanced with language detection
      };

    } catch (error) {
      console.error('Error getting video info:', error);
      return null;
    }
  }

  /**
   * Gets video transcript/captions
   */
  private async getVideoTranscript(videoId: string, language: string): Promise<{ success: boolean; transcript?: TranscriptSegment[]; error?: string }> {
    try {
      // Try to get transcript from YouTube's timedtext API
      const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=${language}&v=${videoId}`;
      
      const response = await fetch(transcriptUrl, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        // Try alternative languages
        const altLanguages = ['en', 'auto'];
        for (const altLang of altLanguages) {
          if (altLang === language) continue;
          
          const altResponse = await fetch(`https://www.youtube.com/api/timedtext?lang=${altLang}&v=${videoId}`, {
            headers: { 'User-Agent': this.userAgent }
          });
          
          if (altResponse.ok) {
            const xmlText = await altResponse.text();
            return {
              success: true,
              transcript: this.parseTranscriptXML(xmlText)
            };
          }
        }
        
        return {
          success: false,
          error: 'No transcript available in requested or alternative languages'
        };
      }

      const xmlText = await response.text();
      const transcript = this.parseTranscriptXML(xmlText);

      return {
        success: true,
        transcript
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown transcript extraction error'
      };
    }
  }

  /**
   * Parses transcript XML from YouTube API
   */
  private parseTranscriptXML(xmlText: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    
    try {
      // Simple XML parsing for transcript segments
      const textMatches = xmlText.match(/<text[^>]*>([^<]*)<\/text>/g);
      
      if (textMatches) {
        textMatches.forEach(match => {
          const startMatch = match.match(/start="([^"]+)"/);
          const durMatch = match.match(/dur="([^"]+)"/);
          const textMatch = match.match(/>([^<]*)</);
          
          if (startMatch && textMatch) {
            const start = parseFloat(startMatch[1]);
            const duration = durMatch ? parseFloat(durMatch[1]) : 0;
            const text = this.decodeHTMLEntities(textMatch[1].trim());
            
            if (text) {
              segments.push({
                start,
                duration,
                text
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error parsing transcript XML:', error);
    }

    return segments;
  }

  /**
   * Analyzes video content to identify key moments
   */
  private analyzeVideoContent(transcript: TranscriptSegment[], videoInfo: VideoInfo): VideoMoment[] {
    const keyMoments: VideoMoment[] = [];
    
    if (transcript.length === 0) {
      // If no transcript, create basic moments based on video duration
      const duration = videoInfo.duration;
      if (duration > 0) {
        const intervals = Math.min(5, Math.max(1, Math.floor(duration / 60))); // Max 5 moments, min 1, one per minute
        
        for (let i = 0; i < intervals; i++) {
          const timestamp = Math.floor((duration / intervals) * i);
          keyMoments.push({
            timestamp,
            description: `Key moment at ${this.formatTime(timestamp)}`,
            importance: 'medium',
            actionType: 'explanation'
          });
        }
      } else {
        // If duration is 0 or unknown, create at least one moment
        keyMoments.push({
          timestamp: 0,
          description: 'Video start',
          importance: 'medium',
          actionType: 'explanation'
        });
      }
      
      return keyMoments;
    }

    // Analyze transcript for key moments
    const keywordPatterns = {
      step: /\b(step|first|second|third|next|then|now|after)\b/i,
      explanation: /\b(because|since|reason|explain|understand)\b/i,
      demonstration: /\b(show|see|look|watch|here|this)\b/i,
      result: /\b(result|outcome|final|complete|done|finish)\b/i
    };

    transcript.forEach((segment, index) => {
      const text = segment.text.toLowerCase();
      let actionType: VideoMoment['actionType'] = 'explanation';
      let importance: VideoMoment['importance'] = 'low';

      // Determine action type based on keywords
      if (keywordPatterns.step.test(text)) {
        actionType = 'step';
        importance = 'high';
      } else if (keywordPatterns.demonstration.test(text)) {
        actionType = 'demonstration';
        importance = 'medium';
      } else if (keywordPatterns.result.test(text)) {
        actionType = 'result';
        importance = 'medium';
      }

      // Add key moments for important segments
      if (importance !== 'low' || index % 10 === 0) { // Every 10th segment or important ones
        keyMoments.push({
          timestamp: segment.start,
          description: segment.text,
          importance,
          actionType
        });
      }
    });

    return keyMoments.slice(0, 20); // Limit to 20 key moments
  }

  /**
   * Creates a text summary from video info and transcript
   */
  private createTextSummary(videoInfo: VideoInfo, transcript: string): string {
    const parts = [
      `Title: ${videoInfo.title}`,
      `Duration: ${this.formatTime(videoInfo.duration)}`,
      videoInfo.channelName ? `Channel: ${videoInfo.channelName}` : '',
      videoInfo.description ? `Description: ${videoInfo.description}` : '',
      transcript ? `\nTranscript:\n${transcript}` : ''
    ].filter(part => part.length > 0);

    return parts.join('\n\n');
  }

  /**
   * Extracts tags from video description
   */
  private extractTagsFromDescription(description: string): string[] {
    const tags: string[] = [];
    
    // Look for hashtags
    const hashtagMatches = description.match(/#\w+/g);
    if (hashtagMatches) {
      tags.push(...hashtagMatches.map(tag => tag.substring(1)));
    }

    // Look for common keywords
    const keywords = description.toLowerCase().match(/\b\w{3,}\b/g);
    if (keywords) {
      const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']);
      const uniqueKeywords = Array.from(new Set(keywords))
        .filter(word => !commonWords.has(word) && word.length > 3)
        .slice(0, 10);
      tags.push(...uniqueKeywords);
    }

    return Array.from(new Set(tags)); // Remove duplicates
  }

  /**
   * Utility functions
   */
  private extractFromHTML(html: string, pattern: RegExp): string | null {
    const match = html.match(pattern);
    return match ? match[1] : null;
  }

  private decodeHTMLEntities(text: string): string {
    return text
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}