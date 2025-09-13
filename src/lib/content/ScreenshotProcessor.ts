/**
 * ScreenshotProcessor - Handles automatic screenshot capture from YouTube videos
 * Integrates with MCP puppeteer tool for frame extraction at key moments
 */

import { VideoScreenshot, VideoMoment } from '../../types';

export interface ScreenshotOptions {
  quality: 'high' | 'medium' | 'low';
  width?: number;
  height?: number;
  format: 'png' | 'jpg' | 'webp';
  waitForLoad: number; // milliseconds to wait for video to load
  seekAccuracy: number; // seconds tolerance for seeking
}

export interface ScreenshotCaptureResult {
  success: boolean;
  screenshot?: VideoScreenshot;
  error?: string;
  actualTimestamp?: number;
}

export interface BatchScreenshotResult {
  success: boolean;
  screenshots: VideoScreenshot[];
  failed: number[];
  errors: string[];
  totalProcessed: number;
}

/**
 * Processes YouTube video screenshots using MCP puppeteer integration
 */
export class ScreenshotProcessor {
  private readonly defaultOptions: ScreenshotOptions = {
    quality: 'medium',
    width: 1280,
    height: 720,
    format: 'jpg',
    waitForLoad: 3000,
    seekAccuracy: 2
  };

  /**
   * Capture screenshots at multiple timestamps from a YouTube video
   */
  async captureScreenshotsFromVideo(
    videoId: string,
    timestamps: number[],
    options?: Partial<ScreenshotOptions>
  ): Promise<BatchScreenshotResult> {
    const opts = { ...this.defaultOptions, ...options };
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const screenshots: VideoScreenshot[] = [];
    const failed: number[] = [];
    const errors: string[] = [];

    try {
      // Initialize browser session
      await this.initializeBrowserSession();

      // Navigate to video
      const navigationSuccess = await this.navigateToVideo(videoUrl);
      if (!navigationSuccess) {
        throw new Error('Failed to navigate to YouTube video');
      }

      // Process each timestamp
      for (const timestamp of timestamps) {
        try {
          const result = await this.captureScreenshotAtTimestamp(
            videoId,
            timestamp,
            opts
          );

          if (result.success && result.screenshot) {
            screenshots.push(result.screenshot);
          } else {
            failed.push(timestamp);
            if (result.error) {
              errors.push(`Timestamp ${timestamp}s: ${result.error}`);
            }
          }

          // Small delay between captures to avoid overwhelming the browser
          await this.delay(1000);

        } catch (error) {
          failed.push(timestamp);
          errors.push(`Timestamp ${timestamp}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: screenshots.length > 0,
        screenshots,
        failed,
        errors,
        totalProcessed: timestamps.length
      };

    } catch (error) {
      return {
        success: false,
        screenshots: [],
        failed: timestamps,
        errors: [error instanceof Error ? error.message : 'Batch processing failed'],
        totalProcessed: 0
      };
    }
  }

  /**
   * Capture screenshots based on key moments analysis
   */
  async captureScreenshotsFromKeyMoments(
    videoId: string,
    keyMoments: VideoMoment[],
    options?: Partial<ScreenshotOptions>
  ): Promise<BatchScreenshotResult> {
    // Filter and prioritize key moments for screenshot capture
    const prioritizedMoments = this.prioritizeKeyMoments(keyMoments);
    const timestamps = prioritizedMoments.map(moment => moment.timestamp);

    const result = await this.captureScreenshotsFromVideo(videoId, timestamps, options);

    // Enhance screenshots with key moment information
    result.screenshots = result.screenshots.map(screenshot => {
      const correspondingMoment = prioritizedMoments.find(moment => 
        Math.abs(moment.timestamp - screenshot.timestamp) <= (options?.seekAccuracy || this.defaultOptions.seekAccuracy)
      );

      if (correspondingMoment) {
        return {
          ...screenshot,
          caption: correspondingMoment.description,
          relevanceScore: this.calculateRelevanceScore(correspondingMoment),
          associatedStep: correspondingMoment.actionType === 'step' ? correspondingMoment.description : undefined
        };
      }

      return screenshot;
    });

    return result;
  }

  /**
   * Initialize browser session using MCP puppeteer
   */
  private async initializeBrowserSession(): Promise<void> {
    try {
      // This would use MCP puppeteer to initialize browser
      // For now, this is a placeholder implementation
      console.log('Initializing browser session for screenshot capture...');
      
      // In actual implementation, this would call MCP puppeteer functions:
      // await mcp.puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Navigate to YouTube video using MCP puppeteer
   */
  private async navigateToVideo(videoUrl: string): Promise<boolean> {
    try {
      // This would use MCP puppeteer to navigate to the video
      console.log(`Navigating to video: ${videoUrl}`);
      
      // In actual implementation:
      // await mcp.puppeteer.navigate(videoUrl);
      // await mcp.puppeteer.waitForSelector('video', { timeout: 10000 });
      
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }

  /**
   * Capture screenshot at specific timestamp using MCP puppeteer
   */
  private async captureScreenshotAtTimestamp(
    videoId: string,
    timestamp: number,
    options: ScreenshotOptions
  ): Promise<ScreenshotCaptureResult> {
    try {
      // Seek to timestamp
      const seekSuccess = await this.seekToTimestamp(timestamp);
      if (!seekSuccess) {
        return {
          success: false,
          error: `Failed to seek to timestamp ${timestamp}s`
        };
      }

      // Wait for video to stabilize
      await this.delay(options.waitForLoad);

      // Capture screenshot
      const screenshotData = await this.captureScreenshot(options);
      if (!screenshotData) {
        return {
          success: false,
          error: 'Failed to capture screenshot data'
        };
      }

      // Create screenshot object
      const screenshot: VideoScreenshot = {
        timestamp,
        imageUrl: screenshotData.url,
        caption: `ภาพหน้าจอที่ ${this.formatTimestamp(timestamp)}`,
        relevanceScore: 0.8, // Default relevance score
        associatedStep: undefined
      };

      return {
        success: true,
        screenshot,
        actualTimestamp: timestamp
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Screenshot capture failed'
      };
    }
  }

  /**
   * Seek video to specific timestamp using MCP puppeteer
   */
  private async seekToTimestamp(timestamp: number): Promise<boolean> {
    try {
      // This would use MCP puppeteer to control the video player
      console.log(`Seeking to timestamp: ${timestamp}s`);
      
      // In actual implementation:
      // await mcp.puppeteer.evaluate(`
      //   const video = document.querySelector('video');
      //   if (video) {
      //     video.currentTime = ${timestamp};
      //     return new Promise(resolve => {
      //       video.addEventListener('seeked', () => resolve(true), { once: true });
      //     });
      //   }
      // `);
      
      return true;
    } catch (error) {
      console.error('Seek failed:', error);
      return false;
    }
  }

  /**
   * Capture screenshot using MCP puppeteer
   */
  private async captureScreenshot(options: ScreenshotOptions): Promise<{ url: string; data?: string } | null> {
    try {
      // This would use MCP puppeteer to capture screenshot
      console.log('Capturing screenshot...');
      
      // In actual implementation:
      // const screenshot = await mcp.puppeteer.screenshot({
      //   selector: 'video',
      //   width: options.width,
      //   height: options.height,
      //   format: options.format,
      //   quality: options.quality === 'high' ? 90 : (options.quality === 'medium' ? 70 : 50)
      // });
      
      // For now, return placeholder data
      return {
        url: `screenshot_${Date.now()}.${options.format}`,
        data: 'placeholder_screenshot_data'
      };
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  }

  /**
   * Prioritize key moments for screenshot capture
   */
  private prioritizeKeyMoments(keyMoments: VideoMoment[]): VideoMoment[] {
    return keyMoments
      .filter(moment => {
        // Include high importance moments and step/demonstration actions
        return moment.importance === 'high' || 
               moment.actionType === 'step' || 
               moment.actionType === 'demonstration';
      })
      .sort((a, b) => {
        // Sort by importance first, then by action type
        const importanceScore = (moment: VideoMoment) => {
          switch (moment.importance) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
          }
        };

        const actionScore = (moment: VideoMoment) => {
          switch (moment.actionType) {
            case 'step': return 4;
            case 'demonstration': return 3;
            case 'result': return 2;
            case 'explanation': return 1;
          }
        };

        const scoreA = importanceScore(a) + actionScore(a);
        const scoreB = importanceScore(b) + actionScore(b);
        
        return scoreB - scoreA;
      })
      .slice(0, 15); // Limit to top 15 moments
  }

  /**
   * Calculate relevance score for a key moment
   */
  private calculateRelevanceScore(moment: VideoMoment): number {
    let score = 0.5; // Base score

    // Importance contribution
    switch (moment.importance) {
      case 'high': score += 0.4; break;
      case 'medium': score += 0.2; break;
      case 'low': score += 0.1; break;
    }

    // Action type contribution
    switch (moment.actionType) {
      case 'step': score += 0.3; break;
      case 'demonstration': score += 0.25; break;
      case 'result': score += 0.15; break;
      case 'explanation': score += 0.05; break;
    }

    return Math.min(1.0, score);
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Capture screenshot with automatic retry logic
   */
  async captureScreenshotWithRetry(
    videoId: string,
    timestamp: number,
    options?: Partial<ScreenshotOptions>,
    maxRetries: number = 3
  ): Promise<ScreenshotCaptureResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.captureScreenshotAtTimestamp(videoId, timestamp, opts);
        
        if (result.success) {
          return result;
        }

        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          await this.delay(2000 * attempt); // Exponential backoff
        }
        
      } catch (error) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries} attempts`
    };
  }

  /**
   * Optimize screenshot for document inclusion
   */
  async optimizeScreenshotForDocument(
    screenshot: VideoScreenshot,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<VideoScreenshot> {
    try {
      // This would implement image optimization logic
      // For now, return the screenshot as-is with optimized caption
      
      const optimizedCaption = this.generateOptimizedCaption(screenshot);
      
      return {
        ...screenshot,
        caption: optimizedCaption
      };
      
    } catch (error) {
      console.warn('Screenshot optimization failed:', error);
      return screenshot;
    }
  }

  /**
   * Generate optimized caption for screenshot
   */
  private generateOptimizedCaption(screenshot: VideoScreenshot): string {
    const timeStr = this.formatTimestamp(screenshot.timestamp);
    
    if (screenshot.associatedStep) {
      return `ขั้นตอนที่ ${timeStr}: ${screenshot.associatedStep}`;
    }
    
    if (screenshot.caption && !screenshot.caption.includes('ภาพหน้าจอ')) {
      return `ภาพหน้าจอที่ ${timeStr}: ${screenshot.caption}`;
    }
    
    return `ภาพหน้าจอที่ ${timeStr}`;
  }

  /**
   * Validate screenshot quality and content
   */
  async validateScreenshot(screenshot: VideoScreenshot): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check if screenshot has valid timestamp
    if (screenshot.timestamp < 0) {
      issues.push('Invalid timestamp (negative value)');
    }
    
    // Check if screenshot has valid image URL
    if (!screenshot.imageUrl || screenshot.imageUrl.trim().length === 0) {
      issues.push('Missing or empty image URL');
    }
    
    // Check if screenshot has meaningful caption
    if (!screenshot.caption || screenshot.caption.trim().length < 5) {
      issues.push('Caption is too short or missing');
    }
    
    // Check relevance score
    if (screenshot.relevanceScore < 0 || screenshot.relevanceScore > 1) {
      issues.push('Invalid relevance score (must be between 0 and 1)');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const screenshotProcessor = new ScreenshotProcessor();