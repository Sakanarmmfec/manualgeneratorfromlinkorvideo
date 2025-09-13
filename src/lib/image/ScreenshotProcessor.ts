import { VideoScreenshot, VideoMoment, ImageData } from '../../types';

export interface ScreenshotOptions {
  maxScreenshots?: number;
  quality?: number;
  format?: 'png' | 'jpg' | 'webp';
  width?: number;
  height?: number;
  intervalSeconds?: number;
}

export interface ScreenshotProcessingResult {
  screenshots: VideoScreenshot[];
  processedCount: number;
  errors: string[];
}

export class ScreenshotProcessor {
  private readonly defaultOptions: Required<ScreenshotOptions> = {
    maxScreenshots: 20,
    quality: 0.8,
    format: 'jpg',
    width: 1280,
    height: 720,
    intervalSeconds: 30
  };

  /**
   * Capture screenshots from YouTube video at key moments
   */
  async captureFromVideo(
    videoId: string,
    keyMoments: VideoMoment[],
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotProcessingResult> {
    const config = { ...this.defaultOptions, ...options };
    const screenshots: VideoScreenshot[] = [];
    const errors: string[] = [];

    try {
      // Sort moments by importance and timestamp
      const sortedMoments = this.prioritizeMoments(keyMoments, config.maxScreenshots);

      for (const moment of sortedMoments) {
        try {
          const screenshot = await this.captureScreenshotAtTimestamp(
            videoId,
            moment.timestamp,
            config,
            moment
          );
          
          if (screenshot) {
            screenshots.push(screenshot);
          }
        } catch (error) {
          errors.push(`Failed to capture screenshot at ${moment.timestamp}s: ${error}`);
        }
      }

      return {
        screenshots: await this.optimizeScreenshots(screenshots, config),
        processedCount: screenshots.length,
        errors
      };
    } catch (error) {
      return {
        screenshots: [],
        processedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown processing error']
      };
    }
  }

  /**
   * Capture screenshots at regular intervals
   */
  async captureAtIntervals(
    videoId: string,
    duration: number,
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotProcessingResult> {
    const config = { ...this.defaultOptions, ...options };
    const screenshots: VideoScreenshot[] = [];
    const errors: string[] = [];

    try {
      const interval = config.intervalSeconds;
      const totalScreenshots = Math.min(
        Math.floor(duration / interval),
        config.maxScreenshots
      );

      for (let i = 0; i < totalScreenshots; i++) {
        const timestamp = (i + 1) * interval;
        
        try {
          const screenshot = await this.captureScreenshotAtTimestamp(
            videoId,
            timestamp,
            config,
            undefined
          );
          
          if (screenshot) {
            screenshots.push(screenshot);
          }
        } catch (error) {
          errors.push(`Failed to capture screenshot at ${timestamp}s: ${error}`);
        }
      }

      return {
        screenshots: await this.optimizeScreenshots(screenshots, config),
        processedCount: screenshots.length,
        errors
      };
    } catch (error) {
      return {
        screenshots: [],
        processedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown processing error']
      };
    }
  }

  private prioritizeMoments(moments: VideoMoment[], maxCount: number): VideoMoment[] {
    // Sort by importance first, then by timestamp
    const sorted = [...moments].sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];
      
      if (importanceDiff !== 0) {
        return importanceDiff;
      }
      
      return a.timestamp - b.timestamp;
    });

    return sorted.slice(0, maxCount);
  }

  private async captureScreenshotAtTimestamp(
    videoId: string,
    timestamp: number,
    config: Required<ScreenshotOptions>,
    moment?: VideoMoment
  ): Promise<VideoScreenshot | null> {
    try {
      // In a real implementation, this would use a video processing library
      // For now, we'll simulate the screenshot capture
      const imageUrl = await this.generateScreenshotUrl(videoId, timestamp, config);
      
      const caption = moment?.description || `Screenshot at ${this.formatTimestamp(timestamp)}`;
      const relevanceScore = moment ? this.calculateMomentRelevance(moment) : 0.5;

      return {
        timestamp,
        imageUrl,
        caption,
        relevanceScore,
        associatedStep: moment?.actionType === 'step' ? moment.description : undefined
      };
    } catch (error) {
      console.warn(`Failed to capture screenshot at ${timestamp}:`, error);
      return null;
    }
  }

  private async generateScreenshotUrl(
    videoId: string,
    timestamp: number,
    config: Required<ScreenshotOptions>
  ): Promise<string> {
    // In a real implementation, this would:
    // 1. Download the video segment
    // 2. Extract the frame at the specified timestamp
    // 3. Process and optimize the image
    // 4. Return the URL to the processed image
    
    // For now, return a placeholder URL
    return `data:image/${config.format};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  private calculateMomentRelevance(moment: VideoMoment): number {
    let score = 0.5; // Base score

    // Higher score for important moments
    switch (moment.importance) {
      case 'high':
        score += 0.3;
        break;
      case 'medium':
        score += 0.2;
        break;
      case 'low':
        score += 0.1;
        break;
    }

    // Higher score for actionable content
    switch (moment.actionType) {
      case 'step':
        score += 0.2;
        break;
      case 'demonstration':
        score += 0.15;
        break;
      case 'result':
        score += 0.1;
        break;
      case 'explanation':
        score += 0.05;
        break;
    }

    return Math.max(0, Math.min(1, score));
  }

  private async optimizeScreenshots(
    screenshots: VideoScreenshot[],
    config: Required<ScreenshotOptions>
  ): Promise<VideoScreenshot[]> {
    // Remove duplicates and low-quality screenshots
    const optimized: VideoScreenshot[] = [];
    
    for (const screenshot of screenshots) {
      if (await this.isScreenshotUseful(screenshot)) {
        optimized.push(await this.optimizeScreenshot(screenshot, config));
      }
    }

    return optimized;
  }

  private async isScreenshotUseful(screenshot: VideoScreenshot): Promise<boolean> {
    // In a real implementation, this would analyze the image for:
    // - Blur detection
    // - Content analysis
    // - Duplicate detection
    
    return screenshot.relevanceScore > 0.3;
  }

  private async optimizeScreenshot(
    screenshot: VideoScreenshot,
    config: Required<ScreenshotOptions>
  ): Promise<VideoScreenshot> {
    // In a real implementation, this would:
    // - Resize the image to optimal dimensions
    // - Compress the image
    // - Apply filters if needed
    
    return screenshot;
  }

  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Convert VideoScreenshot to ImageData format
   */
  convertToImageData(screenshot: VideoScreenshot): ImageData {
    return {
      url: screenshot.imageUrl,
      alt: screenshot.caption,
      caption: `Video screenshot at ${this.formatTimestamp(screenshot.timestamp)}`,
      width: 1280, // Default width
      height: 720 // Default height
    };
  }

  /**
   * Batch convert screenshots to ImageData
   */
  convertScreenshotsToImageData(screenshots: VideoScreenshot[]): ImageData[] {
    return screenshots.map(screenshot => this.convertToImageData(screenshot));
  }

  /**
   * Generate thumbnail from video screenshot
   */
  async generateThumbnail(
    screenshot: VideoScreenshot,
    maxWidth: number = 300,
    maxHeight: number = 200
  ): Promise<string> {
    // In a real implementation, this would resize the screenshot
    // For now, return the original image URL
    return screenshot.imageUrl;
  }
}