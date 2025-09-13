/**
 * Tests for ScreenshotProcessor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenshotProcessor } from './ScreenshotProcessor';
import { VideoMoment, VideoScreenshot } from '../../types';

describe('ScreenshotProcessor', () => {
  let processor: ScreenshotProcessor;
  let mockKeyMoments: VideoMoment[];

  beforeEach(() => {
    processor = new ScreenshotProcessor();
    
    mockKeyMoments = [
      {
        timestamp: 30,
        description: 'First step: Open application',
        importance: 'high',
        actionType: 'step'
      },
      {
        timestamp: 90,
        description: 'Second step: Configure settings',
        importance: 'high',
        actionType: 'step'
      },
      {
        timestamp: 150,
        description: 'Explanation of the process',
        importance: 'medium',
        actionType: 'explanation'
      },
      {
        timestamp: 210,
        description: 'Final result',
        importance: 'high',
        actionType: 'result'
      }
    ];

    vi.clearAllMocks();
  });

  describe('captureScreenshotsFromVideo', () => {
    it('should capture screenshots at specified timestamps', async () => {
      const timestamps = [30, 90, 150];
      
      // Mock the private methods
      vi.spyOn(processor as any, 'initializeBrowserSession').mockResolvedValue(undefined);
      vi.spyOn(processor as any, 'navigateToVideo').mockResolvedValue(true);
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp').mockResolvedValue({
        success: true,
        screenshot: {
          timestamp: 30,
          imageUrl: 'screenshot_30.jpg',
          caption: 'ภาพหน้าจอที่ 0:30',
          relevanceScore: 0.8
        }
      });

      const result = await processor.captureScreenshotsFromVideo('test123', timestamps);

      expect(result.success).toBe(true);
      expect(result.screenshots).toHaveLength(3);
      expect(result.totalProcessed).toBe(3);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle screenshot capture failures', async () => {
      const timestamps = [30, 90];
      
      vi.spyOn(processor as any, 'initializeBrowserSession').mockResolvedValue(undefined);
      vi.spyOn(processor as any, 'navigateToVideo').mockResolvedValue(true);
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp')
        .mockResolvedValueOnce({
          success: true,
          screenshot: {
            timestamp: 30,
            imageUrl: 'screenshot_30.jpg',
            caption: 'ภาพหน้าจอที่ 0:30',
            relevanceScore: 0.8
          }
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Failed to capture screenshot'
        });

      const result = await processor.captureScreenshotsFromVideo('test123', timestamps);

      expect(result.success).toBe(true); // Still successful if at least one screenshot captured
      expect(result.screenshots).toHaveLength(1);
      expect(result.failed).toEqual([90]);
      expect(result.errors).toContain('Timestamp 90s: Failed to capture screenshot');
    });

    it('should handle navigation failures', async () => {
      const timestamps = [30];
      
      vi.spyOn(processor as any, 'initializeBrowserSession').mockResolvedValue(undefined);
      vi.spyOn(processor as any, 'navigateToVideo').mockResolvedValue(false);

      const result = await processor.captureScreenshotsFromVideo('test123', timestamps);

      expect(result.success).toBe(false);
      expect(result.screenshots).toHaveLength(0);
      expect(result.errors).toContain('Failed to navigate to YouTube video');
    });
  });

  describe('captureScreenshotsFromKeyMoments', () => {
    it('should capture screenshots based on key moments', async () => {
      vi.spyOn(processor as any, 'initializeBrowserSession').mockResolvedValue(undefined);
      vi.spyOn(processor as any, 'navigateToVideo').mockResolvedValue(true);
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp').mockImplementation(
        (videoId: string, timestamp: number) => Promise.resolve({
          success: true,
          screenshot: {
            timestamp,
            imageUrl: `screenshot_${timestamp}.jpg`,
            caption: `ภาพหน้าจอที่ ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}`,
            relevanceScore: 0.8
          }
        })
      );

      const result = await processor.captureScreenshotsFromKeyMoments('test123', mockKeyMoments);

      expect(result.success).toBe(true);
      expect(result.screenshots.length).toBeGreaterThan(0);
      
      // Should prioritize high importance moments
      const highImportanceScreenshots = result.screenshots.filter(s => 
        mockKeyMoments.some(m => m.timestamp === s.timestamp && m.importance === 'high')
      );
      expect(highImportanceScreenshots.length).toBeGreaterThan(0);
    });

    it('should enhance screenshots with key moment information', async () => {
      vi.spyOn(processor as any, 'initializeBrowserSession').mockResolvedValue(undefined);
      vi.spyOn(processor as any, 'navigateToVideo').mockResolvedValue(true);
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp').mockResolvedValue({
        success: true,
        screenshot: {
          timestamp: 30,
          imageUrl: 'screenshot_30.jpg',
          caption: 'Basic caption',
          relevanceScore: 0.5
        }
      });

      const result = await processor.captureScreenshotsFromKeyMoments('test123', mockKeyMoments);

      expect(result.success).toBe(true);
      
      const enhancedScreenshot = result.screenshots.find(s => s.timestamp === 30);
      expect(enhancedScreenshot).toBeDefined();
      expect(enhancedScreenshot!.caption).toBe('First step: Open application');
      expect(enhancedScreenshot!.associatedStep).toBe('First step: Open application');
    });
  });

  describe('prioritizeKeyMoments', () => {
    it('should prioritize high importance and step/demonstration moments', () => {
      const prioritized = (processor as any).prioritizeKeyMoments(mockKeyMoments);

      expect(prioritized.length).toBeLessThanOrEqual(mockKeyMoments.length);
      
      // Should include high importance moments
      const highImportanceMoments = prioritized.filter((m: VideoMoment) => m.importance === 'high');
      expect(highImportanceMoments.length).toBeGreaterThan(0);
      
      // Should include step and demonstration moments
      const actionMoments = prioritized.filter((m: VideoMoment) => 
        m.actionType === 'step' || m.actionType === 'demonstration'
      );
      expect(actionMoments.length).toBeGreaterThan(0);
    });

    it('should limit to maximum 15 moments', () => {
      // Create more than 15 moments
      const manyMoments: VideoMoment[] = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i * 30,
        description: `Moment ${i}`,
        importance: 'high' as const,
        actionType: 'step' as const
      }));

      const prioritized = (processor as any).prioritizeKeyMoments(manyMoments);

      expect(prioritized.length).toBeLessThanOrEqual(15);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should calculate relevance score based on importance and action type', () => {
      const testCases = [
        {
          moment: { importance: 'high', actionType: 'step' } as VideoMoment,
          expectedMin: 0.9
        },
        {
          moment: { importance: 'medium', actionType: 'demonstration' } as VideoMoment,
          expectedMin: 0.7
        },
        {
          moment: { importance: 'low', actionType: 'explanation' } as VideoMoment,
          expectedMax: 0.7
        }
      ];

      testCases.forEach(({ moment, expectedMin, expectedMax }) => {
        const score = (processor as any).calculateRelevanceScore(moment);
        
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
        
        if (expectedMin) {
          expect(score).toBeGreaterThanOrEqual(expectedMin);
        }
        if (expectedMax) {
          expect(score).toBeLessThanOrEqual(expectedMax);
        }
      });
    });
  });

  describe('captureScreenshotWithRetry', () => {
    it('should retry failed screenshot captures', async () => {
      // Mock the delay function to speed up the test
      vi.spyOn(processor as any, 'delay').mockResolvedValue(undefined);
      
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp')
        .mockResolvedValueOnce({ success: false, error: 'Network error' })
        .mockResolvedValueOnce({ success: false, error: 'Timeout' })
        .mockResolvedValueOnce({
          success: true,
          screenshot: {
            timestamp: 30,
            imageUrl: 'screenshot_30.jpg',
            caption: 'ภาพหน้าจอที่ 0:30',
            relevanceScore: 0.8
          }
        });

      const result = await processor.captureScreenshotWithRetry('test123', 30, {}, 3);

      expect(result.success).toBe(true);
      expect(result.screenshot).toBeDefined();
      
      // Should have been called 3 times (2 failures + 1 success)
      expect((processor as any).captureScreenshotAtTimestamp).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should fail after maximum retries', async () => {
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp')
        .mockResolvedValue({ success: false, error: 'Persistent error' });

      const result = await processor.captureScreenshotWithRetry('test123', 30, {}, 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed after 2 attempts');
    });
  });

  describe('optimizeScreenshotForDocument', () => {
    it('should optimize screenshot for document inclusion', async () => {
      const screenshot: VideoScreenshot = {
        timestamp: 90,
        imageUrl: 'screenshot_90.jpg',
        caption: 'Basic caption',
        relevanceScore: 0.7
      };

      const optimized = await processor.optimizeScreenshotForDocument(screenshot);

      expect(optimized.caption).toContain('ภาพหน้าจอที่ 1:30');
    });

    it('should handle screenshots with associated steps', async () => {
      const screenshot: VideoScreenshot = {
        timestamp: 30,
        imageUrl: 'screenshot_30.jpg',
        caption: 'Basic caption',
        relevanceScore: 0.8,
        associatedStep: 'Click the button'
      };

      const optimized = await processor.optimizeScreenshotForDocument(screenshot);

      expect(optimized.caption).toContain('ขั้นตอนที่ 0:30: Click the button');
    });
  });

  describe('validateScreenshot', () => {
    it('should validate valid screenshots', async () => {
      const validScreenshot: VideoScreenshot = {
        timestamp: 30,
        imageUrl: 'screenshot_30.jpg',
        caption: 'Valid screenshot caption',
        relevanceScore: 0.8
      };

      const validation = await processor.validateScreenshot(validScreenshot);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should identify invalid screenshots', async () => {
      const invalidScreenshot: VideoScreenshot = {
        timestamp: -10,
        imageUrl: '',
        caption: 'Bad',
        relevanceScore: 1.5
      };

      const validation = await processor.validateScreenshot(invalidScreenshot);

      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues).toContain('Invalid timestamp (negative value)');
      expect(validation.issues).toContain('Missing or empty image URL');
      expect(validation.issues).toContain('Caption is too short or missing');
      expect(validation.issues).toContain('Invalid relevance score (must be between 0 and 1)');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamps correctly', () => {
      const testCases = [
        { seconds: 30, expected: '0:30' },
        { seconds: 90, expected: '1:30' },
        { seconds: 3661, expected: '61:01' }
      ];

      testCases.forEach(({ seconds, expected }) => {
        const formatted = (processor as any).formatTimestamp(seconds);
        expect(formatted).toBe(expected);
      });
    });
  });

  describe('generateOptimizedCaption', () => {
    it('should generate optimized captions', () => {
      const testCases = [
        {
          screenshot: {
            timestamp: 30,
            imageUrl: 'test.jpg',
            caption: 'Basic caption',
            relevanceScore: 0.8,
            associatedStep: 'Click button'
          },
          expectedPattern: /ขั้นตอนที่ 0:30: Click button/
        },
        {
          screenshot: {
            timestamp: 90,
            imageUrl: 'test.jpg',
            caption: 'Custom description',
            relevanceScore: 0.7
          },
          expectedPattern: /ภาพหน้าจอที่ 1:30: Custom description/
        },
        {
          screenshot: {
            timestamp: 150,
            imageUrl: 'test.jpg',
            caption: 'ภาพหน้าจอที่ 2:30',
            relevanceScore: 0.6
          },
          expectedPattern: /ภาพหน้าจอที่ 2:30/
        }
      ];

      testCases.forEach(({ screenshot, expectedPattern }) => {
        const caption = (processor as any).generateOptimizedCaption(screenshot);
        expect(caption).toMatch(expectedPattern);
      });
    });
  });

  describe('error handling', () => {
    it('should handle browser initialization failures', async () => {
      vi.spyOn(processor as any, 'initializeBrowserSession')
        .mockRejectedValue(new Error('Browser failed to start'));

      const result = await processor.captureScreenshotsFromVideo('test123', [30]);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Browser failed to start');
    });

    it('should handle individual screenshot failures gracefully', async () => {
      vi.spyOn(processor as any, 'initializeBrowserSession').mockResolvedValue(undefined);
      vi.spyOn(processor as any, 'navigateToVideo').mockResolvedValue(true);
      vi.spyOn(processor as any, 'captureScreenshotAtTimestamp')
        .mockRejectedValue(new Error('Screenshot failed'));

      const result = await processor.captureScreenshotsFromVideo('test123', [30, 60]);

      expect(result.success).toBe(false);
      expect(result.screenshots).toHaveLength(0);
      expect(result.failed).toEqual([30, 60]);
      expect(result.errors.length).toBe(2);
    });
  });
});