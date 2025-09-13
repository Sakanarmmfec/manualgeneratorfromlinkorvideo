/**
 * Integration tests for YouTube video processing system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YouTubeVideoProcessor } from './YouTubeVideoProcessor';
import { videoAnalyzer } from '../ai/VideoAnalyzer';
import { screenshotProcessor } from './ScreenshotProcessor';

// Mock the configuration system
vi.mock('../config/SecureConfigManager', () => ({
  secureConfigManager: {
    getLLMConfig: vi.fn().mockReturnValue({
      baseUrl: 'https://test.example.com',
      apiKeyRef: 'test-key',
      chatModel: 'gpt-4o',
      embeddingModel: 'text-embedding-3-large',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000
    }),
    initialize: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('../config/APIKeyManager', () => ({
  apiKeyManager: {
    getCurrentKey: vi.fn().mockReturnValue('test-api-key'),
    validateKey: vi.fn().mockResolvedValue(true),
    keyStatus: 'active'
  }
}));

describe('Video Processing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process a complete YouTube video workflow', async () => {
    const processor = new YouTubeVideoProcessor();
    const testUrl = 'https://youtube.com/watch?v=test123';

    // Mock the basic video processing
    vi.spyOn(processor, 'processYouTubeVideo').mockResolvedValue({
      success: true,
      content: {
        url: testUrl,
        title: 'Test Tutorial Video',
        contentType: 'youtube_video',
        textContent: 'Complete tutorial content',
        videoContent: {
          videoId: 'test123',
          duration: 300,
          transcript: 'First, open the application. Then, click on settings. Next, configure the options. Finally, save your changes.',
          keyMoments: [
            {
              timestamp: 30,
              description: 'Open the application',
              importance: 'high',
              actionType: 'step'
            }
          ],
          screenshots: []
        },
        images: [],
        metadata: {
          title: 'Test Tutorial Video',
          language: 'en',
          tags: ['tutorial', 'software']
        },
        extractionTimestamp: new Date()
      }
    });

    // Mock AI analysis
    vi.spyOn(videoAnalyzer, 'analyzeVideo').mockResolvedValue({
      keyMoments: [
        {
          timestamp: 30,
          description: 'Open the application',
          importance: 'high',
          actionType: 'step'
        },
        {
          timestamp: 120,
          description: 'Configure settings',
          importance: 'high',
          actionType: 'step'
        }
      ],
      transitions: [
        {
          timestamp: 75,
          transitionType: 'topic_change',
          description: 'Moving to configuration',
          confidence: 0.8
        }
      ],
      segments: [
        {
          startTime: 0,
          endTime: 150,
          title: 'Application Setup',
          description: 'Setting up the application',
          keyPoints: ['Open app', 'Navigate to settings'],
          actionItems: ['Click open button', 'Find settings menu'],
          importance: 'high'
        }
      ],
      summary: 'This video shows how to set up and configure the application.',
      stepByStepInstructions: [
        'เปิดแอปพลิเคชัน',
        'คลิกที่การตั้งค่า',
        'ตั้งค่าตัวเลือก',
        'บันทึกการเปลี่ยนแปลง'
      ],
      recommendedScreenshots: [30, 120, 180]
    });

    // Mock screenshot processing
    vi.spyOn(screenshotProcessor, 'captureScreenshotsFromKeyMoments').mockResolvedValue({
      success: true,
      screenshots: [
        {
          timestamp: 30,
          imageUrl: 'screenshot_30.jpg',
          caption: 'Open the application',
          relevanceScore: 0.9,
          associatedStep: 'Open the application'
        },
        {
          timestamp: 120,
          imageUrl: 'screenshot_120.jpg',
          caption: 'Configure settings',
          relevanceScore: 0.8,
          associatedStep: 'Configure settings'
        }
      ],
      failed: [],
      errors: [],
      totalProcessed: 2
    });

    // Process the video with full analysis
    const result = await processor.processVideoWithAnalysis(testUrl, {
      captureScreenshots: true,
      analyzeAudio: true,
      extractKeyMoments: true
    });

    // Verify the complete workflow
    expect(result.success).toBe(true);
    expect(result.videoContent).toBeDefined();
    expect(result.extractedContent).toBeDefined();
    
    // Verify video content has been enhanced
    expect(result.videoContent.keyMoments).toHaveLength(2);
    expect(result.videoContent.screenshots).toHaveLength(2);
    
    // Verify extracted content includes screenshots as images
    expect(result.extractedContent.images.length).toBeGreaterThan(0);
    
    // Verify processing metadata
    expect(result.processingTime).toBeGreaterThan(0);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should handle video processing with screenshot failures gracefully', async () => {
    const processor = new YouTubeVideoProcessor();
    const testUrl = 'https://youtube.com/watch?v=test456';

    // Mock basic processing success
    vi.spyOn(processor, 'processYouTubeVideo').mockResolvedValue({
      success: true,
      content: {
        url: testUrl,
        title: 'Test Video',
        contentType: 'youtube_video',
        textContent: 'Test content',
        videoContent: {
          videoId: 'test456',
          duration: 180,
          transcript: 'Simple test transcript.',
          keyMoments: [],
          screenshots: []
        },
        images: [],
        metadata: {
          title: 'Test Video',
          language: 'en',
          tags: []
        },
        extractionTimestamp: new Date()
      }
    });

    // Mock AI analysis success
    vi.spyOn(videoAnalyzer, 'analyzeVideo').mockResolvedValue({
      keyMoments: [
        {
          timestamp: 60,
          description: 'Test moment',
          importance: 'medium',
          actionType: 'explanation'
        }
      ],
      transitions: [],
      segments: [],
      summary: 'Test summary',
      stepByStepInstructions: [],
      recommendedScreenshots: [60]
    });

    // Mock screenshot processing failure
    vi.spyOn(screenshotProcessor, 'captureScreenshotsFromKeyMoments').mockResolvedValue({
      success: false,
      screenshots: [],
      failed: [60],
      errors: ['Screenshot capture failed'],
      totalProcessed: 1
    });

    const result = await processor.processVideoWithAnalysis(testUrl, {
      captureScreenshots: true
    });

    // Should still succeed overall
    expect(result.success).toBe(true);
    
    // Should include warning about screenshot failure
    expect(result.warnings).toContain('Screenshot capture failed: Screenshot capture failed');
    
    // Video content should still be processed
    expect(result.videoContent.keyMoments).toHaveLength(1);
    expect(result.videoContent.screenshots).toHaveLength(0);
  });

  it('should extract step-by-step instructions from processed video', async () => {
    const processor = new YouTubeVideoProcessor();
    
    const mockVideoContent = {
      videoId: 'test789',
      duration: 240,
      transcript: 'First, open the application. Then, click on settings. Next, configure the options. Finally, save your changes.',
      keyMoments: [
        {
          timestamp: 30,
          description: 'Open application',
          importance: 'high' as const,
          actionType: 'step' as const
        },
        {
          timestamp: 90,
          description: 'Click settings',
          importance: 'high' as const,
          actionType: 'step' as const
        }
      ],
      screenshots: []
    };

    // Mock the video content analyzer
    vi.spyOn(videoAnalyzer, 'extractStepByStepInstructions').mockResolvedValue([
      'เปิดแอปพลิเคชัน',
      'คลิกที่การตั้งค่า',
      'ตั้งค่าตัวเลือก',
      'บันทึกการเปลี่ยนแปลง'
    ]);

    const instructions = await processor.extractVideoInstructions(mockVideoContent, 'thai');

    expect(instructions).toHaveLength(4);
    expect(instructions[0]).toContain('เปิดแอปพลิเคชัน');
    expect(instructions[1]).toContain('คลิกที่การตั้งค่า');
    expect(instructions[2]).toContain('ตั้งค่าตัวเลือก');
    expect(instructions[3]).toContain('บันทึกการเปลี่ยนแปลง');
  });

  it('should generate comprehensive video summary', async () => {
    const processor = new YouTubeVideoProcessor();
    
    const mockVideoContent = {
      videoId: 'test101',
      duration: 360,
      transcript: 'This tutorial covers the complete setup process for the application, including installation, configuration, and basic usage.',
      keyMoments: [
        {
          timestamp: 60,
          description: 'Installation process',
          importance: 'high' as const,
          actionType: 'step' as const
        },
        {
          timestamp: 180,
          description: 'Configuration setup',
          importance: 'high' as const,
          actionType: 'step' as const
        }
      ],
      screenshots: []
    };

    // Mock the video content analyzer
    vi.spyOn(videoAnalyzer, 'summarizeVideoContent').mockResolvedValue(
      'วิดีโอนี้แสดงขั้นตอนการติดตั้งและตั้งค่าแอปพลิเคชันอย่างครบถ้วน รวมถึงการใช้งานเบื้องต้น เหมาะสำหรับผู้ใช้งานใหม่ที่ต้องการเรียนรู้การใช้งานระบบ'
    );

    const summary = await processor.generateVideoSummary(mockVideoContent, 300, 'thai');

    expect(summary).toContain('วิดีโอนี้แสดงขั้นตอน');
    expect(summary).toContain('การติดตั้งและตั้งค่า');
    expect(summary).toContain('แอปพลิเคชัน');
    expect(summary.length).toBeLessThanOrEqual(300);
  });

  it('should identify optimal screenshot moments', () => {
    const processor = new YouTubeVideoProcessor();
    
    const mockVideoContent = {
      videoId: 'test202',
      duration: 300,
      transcript: 'Tutorial transcript',
      keyMoments: [
        {
          timestamp: 45,
          description: 'Important step',
          importance: 'high' as const,
          actionType: 'step' as const
        },
        {
          timestamp: 135,
          description: 'Configuration',
          importance: 'medium' as const,
          actionType: 'demonstration' as const
        },
        {
          timestamp: 225,
          description: 'Final result',
          importance: 'high' as const,
          actionType: 'result' as const
        }
      ],
      screenshots: []
    };

    // Mock the video content analyzer
    vi.spyOn(videoAnalyzer, 'identifyOptimalScreenshotTimestamps').mockReturnValue([
      45, 135, 225
    ]);

    const moments = processor.identifyScreenshotMoments(mockVideoContent, 5);

    expect(moments).toEqual([45, 135, 225]);
    expect(moments.length).toBeLessThanOrEqual(5);
  });

  it('should process transcript for step identification', async () => {
    const processor = new YouTubeVideoProcessor();
    
    const transcript = 'ขั้นแรก เปิดแอปพลิเคชัน จากนั้น คลิกที่เมนูการตั้งค่า ต่อไป เลือกตัวเลือกที่ต้องการ สุดท้าย บันทึกการตั้งค่า';
    
    const steps = await processor.processTranscriptForSteps(transcript, 'test303');

    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    
    // Should identify Thai step keywords
    const stepMoments = steps.filter(step => step.actionType === 'step');
    expect(stepMoments.length).toBeGreaterThan(0);
    
    // Should have reasonable timestamps
    steps.forEach(step => {
      expect(step.timestamp).toBeGreaterThanOrEqual(0);
      expect(step.description).toBeDefined();
      expect(step.description.length).toBeGreaterThan(0);
    });
  });
});