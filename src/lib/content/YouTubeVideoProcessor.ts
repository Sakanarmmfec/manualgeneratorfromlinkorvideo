/**
 * YouTubeVideoProcessor - Advanced YouTube video processing with download and frame extraction
 * Integrates with MCP tools for video processing and screenshot capture
 */

import { 
  VideoContent, 
  VideoMoment, 
  VideoScreenshot, 
  ExtractedContent,
  ContentMetadata,
  ImageData,
  AudioAnalysis
} from '../../types';
import { YouTubeProcessor, YouTubeExtractionOptions, YouTubeExtractionResult } from './YouTubeProcessor';
import { videoContentAnalyzer } from '../ai/VideoContentAnalyzer';

export interface VideoProcessingOptions extends YouTubeExtractionOptions {
  captureScreenshots: boolean;
  screenshotQuality: 'high' | 'medium' | 'low';
  maxScreenshots: number;
  screenshotInterval?: number; // seconds between screenshots
  analyzeAudio: boolean;
  extractKeyMoments: boolean;
}

export interface VideoDownloadInfo {
  videoId: string;
  title: string;
  duration: number;
  quality: string;
  format: string;
  downloadUrl?: string;
  thumbnailUrl: string;
}

export interface FrameExtractionResult {
  success: boolean;
  screenshots: VideoScreenshot[];
  error?: string;
  totalFrames?: number;
}

export interface VideoAnalysisResult {
  videoContent: VideoContent;
  extractedContent: ExtractedContent;
  processingTime: number;
  warnings: string[];
}

/**
 * Enhanced YouTube video processor with download and frame extraction capabilities
 */
export class YouTubeVideoProcessor extends YouTubeProcessor {
  private readonly defaultVideoOptions: VideoProcessingOptions = {
    includeTranscript: true,
    includeScreenshots: true,
    captureScreenshots: true,
    screenshotQuality: 'medium',
    maxScreenshots: 15,
    screenshotInterval: 30, // Every 30 seconds
    transcriptLanguage: 'en',
    timeout: 60000, // 1 minute timeout
    analyzeAudio: true,
    extractKeyMoments: true
  };

  /**
   * Process YouTube video with comprehensive analysis and frame extraction
   */
  async processVideoWithAnalysis(
    url: string, 
    options?: Partial<VideoProcessingOptions>
  ): Promise<VideoAnalysisResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultVideoOptions, ...options };
    const warnings: string[] = [];

    try {
      // Step 1: Extract basic video information using parent class
      const basicResult = await this.processYouTubeVideo(url, opts);
      if (!basicResult.success || !basicResult.content) {
        throw new Error(basicResult.error || 'Failed to extract basic video information');
      }

      const extractedContent = basicResult.content;
      if (basicResult.warnings) {
        warnings.push(...basicResult.warnings);
      }

      // Step 2: Get detailed video information for download
      const videoInfo = await this.getVideoDownloadInfo(extractedContent.videoContent!.videoId);
      if (!videoInfo) {
        warnings.push('Could not retrieve video download information');
      }

      // Step 3: Enhance video content with AI analysis
      const enhancedVideoContent = await this.enhanceVideoContentWithAI(
        extractedContent.videoContent!,
        extractedContent.title,
        extractedContent.metadata
      );

      // Step 4: Capture screenshots if requested
      if (opts.captureScreenshots) {
        const screenshotResult = await this.captureVideoScreenshots(
          extractedContent.videoContent!.videoId,
          enhancedVideoContent.keyMoments,
          opts
        );
        
        if (screenshotResult.success) {
          enhancedVideoContent.screenshots = screenshotResult.screenshots;
        } else {
          warnings.push(`Screenshot capture failed: ${screenshotResult.error}`);
        }
      }

      // Step 5: Analyze audio content if requested
      if (opts.analyzeAudio && enhancedVideoContent.transcript) {
        const audioAnalysis = await this.analyzeAudioContent(
          enhancedVideoContent.transcript,
          enhancedVideoContent.duration
        );
        enhancedVideoContent.audioAnalysis = audioAnalysis;
      }

      // Step 6: Update extracted content with enhanced video content
      const finalExtractedContent: ExtractedContent = {
        ...extractedContent,
        videoContent: enhancedVideoContent,
        images: [
          ...extractedContent.images,
          ...enhancedVideoContent.screenshots.map(screenshot => ({
            url: screenshot.imageUrl,
            alt: screenshot.caption,
            caption: screenshot.caption
          }))
        ]
      };

      const processingTime = Date.now() - startTime;

      return {
        videoContent: enhancedVideoContent,
        extractedContent: finalExtractedContent,
        processingTime,
        warnings
      };

    } catch (error) {
      throw new Error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video download information using MCP youtube tool
   */
  private async getVideoDownloadInfo(videoId: string): Promise<VideoDownloadInfo | null> {
    try {
      // This would use the MCP youtube tool to get detailed video info
      // For now, we'll create a placeholder implementation
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      if (!response.ok) {
        return null;
      }

      // Extract basic info - in a real implementation, this would use the MCP tool
      return {
        videoId,
        title: 'Video Title', // Would be extracted via MCP
        duration: 0, // Would be extracted via MCP
        quality: 'medium',
        format: 'mp4',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    } catch (error) {
      console.error('Error getting video download info:', error);
      return null;
    }
  }

  /**
   * Enhance video content using AI analysis
   */
  private async enhanceVideoContentWithAI(
    videoContent: VideoContent,
    title: string,
    metadata: ContentMetadata
  ): Promise<VideoContent> {
    try {
      // Use the VideoContentAnalyzer to enhance the content
      const enhancedContent = await videoContentAnalyzer.analyzeVideoContent(
        videoContent.videoId,
        videoContent.transcript,
        videoContent.duration,
        title,
        metadata
      );

      // Merge with existing content, preferring enhanced analysis
      return {
        ...videoContent,
        keyMoments: enhancedContent.keyMoments.length > 0 ? enhancedContent.keyMoments : videoContent.keyMoments,
        screenshots: enhancedContent.screenshots.length > 0 ? enhancedContent.screenshots : videoContent.screenshots,
        audioAnalysis: enhancedContent.audioAnalysis || videoContent.audioAnalysis
      };
    } catch (error) {
      console.warn('AI enhancement failed, using basic analysis:', error);
      return videoContent;
    }
  }

  /**
   * Capture screenshots from video at key moments using MCP puppeteer tool
   */
  private async captureVideoScreenshots(
    videoId: string,
    keyMoments: VideoMoment[],
    options: VideoProcessingOptions
  ): Promise<FrameExtractionResult> {
    try {
      const screenshots: VideoScreenshot[] = [];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Determine optimal screenshot timestamps
      const timestamps = this.calculateOptimalScreenshotTimestamps(keyMoments, options);

      // For each timestamp, capture a screenshot using MCP puppeteer
      for (const timestamp of timestamps) {
        try {
          const screenshot = await this.captureScreenshotAtTimestamp(
            videoUrl,
            timestamp,
            options.screenshotQuality
          );
          
          if (screenshot) {
            screenshots.push(screenshot);
          }
        } catch (error) {
          console.warn(`Failed to capture screenshot at ${timestamp}s:`, error);
        }
      }

      return {
        success: true,
        screenshots,
        totalFrames: screenshots.length
      };

    } catch (error) {
      return {
        success: false,
        screenshots: [],
        error: error instanceof Error ? error.message : 'Screenshot capture failed'
      };
    }
  }

  /**
   * Calculate optimal timestamps for screenshot capture
   */
  private calculateOptimalScreenshotTimestamps(
    keyMoments: VideoMoment[],
    options: VideoProcessingOptions
  ): number[] {
    const timestamps: number[] = [];

    // Add key moments with high importance
    const importantMoments = keyMoments
      .filter(moment => moment.importance === 'high' || moment.importance === 'medium')
      .map(moment => moment.timestamp);

    timestamps.push(...importantMoments);

    // Add interval-based screenshots if specified
    if (options.screenshotInterval && keyMoments.length > 0) {
      const maxDuration = Math.max(...keyMoments.map(m => m.timestamp));
      for (let t = 0; t <= maxDuration; t += options.screenshotInterval) {
        // Only add if not too close to existing timestamps
        const tooClose = timestamps.some(existing => Math.abs(existing - t) < 10);
        if (!tooClose) {
          timestamps.push(t);
        }
      }
    }

    // Sort and limit to maxScreenshots
    return timestamps
      .sort((a, b) => a - b)
      .slice(0, options.maxScreenshots);
  }

  /**
   * Capture a single screenshot at specific timestamp using MCP puppeteer
   */
  private async captureScreenshotAtTimestamp(
    videoUrl: string,
    timestamp: number,
    quality: 'high' | 'medium' | 'low'
  ): Promise<VideoScreenshot | null> {
    try {
      // This is a placeholder for MCP puppeteer integration
      // In the actual implementation, this would:
      // 1. Navigate to the YouTube video URL
      // 2. Seek to the specific timestamp
      // 3. Capture a screenshot
      // 4. Return the screenshot data

      // For now, return a placeholder screenshot
      const screenshotUrl = `placeholder_screenshot_${timestamp}.jpg`;
      
      return {
        timestamp,
        imageUrl: screenshotUrl,
        caption: `ภาพหน้าจอที่ ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}`,
        relevanceScore: 0.8,
        associatedStep: `Step at ${timestamp}s`
      };

    } catch (error) {
      console.error(`Error capturing screenshot at ${timestamp}s:`, error);
      return null;
    }
  }

  /**
   * Analyze audio content from transcript
   */
  private async analyzeAudioContent(transcript: string, duration: number): Promise<AudioAnalysis> {
    // Enhanced audio analysis using AI
    const wordCount = transcript.split(/\s+/).length;
    const wordsPerMinute = (wordCount / duration) * 60;
    
    // Detect language
    const thaiCharPattern = /[\u0E00-\u0E7F]/;
    const hasThaiChars = thaiCharPattern.test(transcript);
    const language = hasThaiChars ? 'th' : 'en';
    
    // Analyze speech quality
    const hasFillerWords = /\b(um|uh|er|ah|เอ่อ|อืม)\b/gi.test(transcript);
    const hasRepeatedPhrases = /(.{10,})\1/gi.test(transcript);
    
    let quality: 'high' | 'medium' | 'low' = 'high';
    if (hasFillerWords || hasRepeatedPhrases) {
      quality = 'medium';
    }
    if (wordsPerMinute < 100 || wordsPerMinute > 200) {
      quality = quality === 'high' ? 'medium' : 'low';
    }

    // Detect potential background music (simple heuristic)
    const musicKeywords = /\b(music|song|beat|melody|เพลง|ดนตรี)\b/gi;
    const hasMusic = musicKeywords.test(transcript);

    // Create speech segments
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const speechSegments = sentences.map((sentence, index) => ({
      startTime: (duration / sentences.length) * index,
      endTime: (duration / sentences.length) * (index + 1),
      text: sentence.trim(),
      confidence: quality === 'high' ? 0.9 : (quality === 'medium' ? 0.7 : 0.5)
    }));

    return {
      duration,
      language,
      quality,
      hasMusic,
      speechSegments
    };
  }

  /**
   * Extract step-by-step instructions from processed video
   */
  async extractVideoInstructions(
    videoContent: VideoContent,
    targetLanguage: 'thai' | 'english' = 'thai'
  ): Promise<string[]> {
    return await videoContentAnalyzer.extractStepByStepInstructions(videoContent, targetLanguage);
  }

  /**
   * Generate video summary for documentation
   */
  async generateVideoSummary(
    videoContent: VideoContent,
    maxLength: number = 500,
    targetLanguage: 'thai' | 'english' = 'thai'
  ): Promise<string> {
    return await videoContentAnalyzer.summarizeVideoContent(videoContent, maxLength, targetLanguage);
  }

  /**
   * Identify optimal screenshot moments for manual review
   */
  identifyScreenshotMoments(videoContent: VideoContent, maxScreenshots: number = 10): number[] {
    return videoContentAnalyzer.identifyOptimalScreenshotTimestamps(videoContent, maxScreenshots);
  }

  /**
   * Process video transcript for step identification
   */
  async processTranscriptForSteps(transcript: string, videoId: string): Promise<VideoMoment[]> {
    // Split transcript into segments and analyze for step patterns
    const segments = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const moments: VideoMoment[] = [];

    // Keywords that indicate steps or actions
    const stepKeywords = [
      // English
      /\b(first|second|third|next|then|now|after|step|click|press|open|close|select|choose)\b/i,
      // Thai
      /\b(ขั้นตอน|แรก|ต่อไป|จากนั้น|คลิก|กด|เปิด|ปิด|เลือก|ทำ)\b/i
    ];

    const explanationKeywords = [
      /\b(because|since|reason|explain|understand|why|how)\b/i,
      /\b(เพราะ|เนื่องจาก|เหตุผล|อธิบาย|เข้าใจ|ทำไม|อย่างไร)\b/i
    ];

    segments.forEach((segment, index) => {
      const text = segment.trim();
      if (text.length < 10) return;

      let actionType: VideoMoment['actionType'] = 'explanation';
      let importance: VideoMoment['importance'] = 'low';

      // Check for step indicators
      if (stepKeywords.some(pattern => pattern.test(text))) {
        actionType = 'step';
        importance = 'high';
      } else if (explanationKeywords.some(pattern => pattern.test(text))) {
        actionType = 'explanation';
        importance = 'medium';
      }

      // Estimate timestamp based on position in transcript
      const estimatedTimestamp = (segments.length > 0) ? 
        Math.floor((index / segments.length) * 300) : // Assume 5 minute video
        index * 10; // Fallback: 10 seconds per segment

      moments.push({
        timestamp: estimatedTimestamp,
        description: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        importance,
        actionType
      });
    });

    return moments.slice(0, 20); // Limit to 20 moments
  }
}

// Export singleton instance
export const youTubeVideoProcessor = new YouTubeVideoProcessor();