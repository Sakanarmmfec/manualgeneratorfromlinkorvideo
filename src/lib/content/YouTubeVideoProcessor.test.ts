/**
 * Tests for YouTubeVideoProcessor
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { YouTubeVideoProcessor } from './YouTubeVideoProcessor';
import { VideoContent, VideoMoment, ExtractedContent } from '../../types';

// Mock the parent class and dependencies
vi.mock('./YouTubeProcessor', () => ({
  YouTubeProcessor: class MockYouTubeProcessor {
    processYouTubeVideo = vi.fn();
    extractVideoId = vi.fn();
  }
}));

vi.mock('../ai/VideoContentAnalyzer', () => ({
  videoContentAnalyzer: {
    analyzeVideoContent: vi.fn(),
    extractStepByStepInstructions: vi.fn(),
    summarizeVideoContent: vi.fn(),
    identifyOptimalScreenshotTimestamps: vi.fn()
  }
}));

describe('YouTubeVideoProcessor', () => {
  let processor: YouTubeVideoProcessor;
  let mockVideoContent: VideoContent;
  let mockExtractedContent: ExtractedContent;

  beforeEach(() => {
    processor = new YouTubeVideoProcessor();
    
    mockVideoContent = {
      videoId: 'test123',
      duration: 300,
      transcript: 'This is a test transcript with step-by-step instructions.',
      keyMoments: [
        {
          timestamp: 30,
          description: 'First step: Open the application',
          importance: 'high',
          actionType: 'step'
        },
        {
          timestamp: 120,
          description: 'Second step: Configure settings',
          importance: 'high',
          actionType: 'step'
        }
      ],
      screenshots: []
    };

    mockExtractedContent = {
      url: 'https://youtube.com/watch?v=test123',
      title: 'Test Video',
      contentType: 'youtube_video',
      textContent: 'Test content',
      videoContent: mockVideoContent,
      images: [],
      metadata: {
        title: 'Test Video',
        language: 'en',
        tags: ['test']
      },
      extractionTimestamp: new Date()
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('processVideoWithAnalysis', () => {
    it('should process video with comprehensive analysis', async () => {
      // Mock parent class method
      const mockProcessYouTubeVideo = processor.processYouTubeVideo as Mock;
      mockProcessYouTubeVideo.mockResolvedValue({
        success: true,
        content: mockExtractedContent
      });

      // Mock video content analyzer
      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.analyzeVideoContent as Mock).mockResolvedValue({
        ...mockVideoContent,
        keyMoments: [
          ...mockVideoContent.keyMoments,
          {
            timestamp: 180,
            description: 'Third step: Save configuration',
            importance: 'medium',
            actionType: 'step'
          }
        ]
      });

      const result = await processor.processVideoWithAnalysis('https://youtube.com/watch?v=test123');

      expect(result.success).toBe(true);
      expect(result.videoContent).toBeDefined();
      expect(result.extractedContent).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.videoContent.keyMoments).toHaveLength(3);
    });

    it('should handle processing errors gracefully', async () => {
      const mockProcessYouTubeVideo = processor.processYouTubeVideo as Mock;
      mockProcessYouTubeVideo.mockResolvedValue({
        success: false,
        error: 'Failed to extract video information'
      });

      await expect(processor.processVideoWithAnalysis('invalid-url')).rejects.toThrow(
        'Video processing failed: Failed to extract video information'
      );
    });

    it('should include warnings when screenshot capture fails', async () => {
      const mockProcessYouTubeVideo = processor.processYouTubeVideo as Mock;
      mockProcessYouTubeVideo.mockResolvedValue({
        success: true,
        content: mockExtractedContent
      });

      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.analyzeVideoContent as Mock).mockResolvedValue(mockVideoContent);

      // Mock screenshot capture failure
      vi.spyOn(processor as any, 'captureVideoScreenshots').mockResolvedValue({
        success: false,
        screenshots: [],
        error: 'Screenshot capture failed'
      });

      const result = await processor.processVideoWithAnalysis(
        'https://youtube.com/watch?v=test123',
        { captureScreenshots: true }
      );

      expect(result.warnings).toContain('Screenshot capture failed: Screenshot capture failed');
    });
  });

  describe('extractVideoInstructions', () => {
    it('should extract step-by-step instructions', async () => {
      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.extractStepByStepInstructions as Mock).mockResolvedValue([
        'ขั้นตอนที่ 1: เปิดแอปพลิเคชัน',
        'ขั้นตอนที่ 2: ตั้งค่าระบบ',
        'ขั้นตอนที่ 3: บันทึกการตั้งค่า'
      ]);

      const instructions = await processor.extractVideoInstructions(mockVideoContent, 'thai');

      expect(instructions).toHaveLength(3);
      expect(instructions[0]).toContain('เปิดแอปพลิเคชัน');
      expect(videoContentAnalyzer.extractStepByStepInstructions).toHaveBeenCalledWith(
        mockVideoContent,
        'thai'
      );
    });
  });

  describe('generateVideoSummary', () => {
    it('should generate video summary', async () => {
      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.summarizeVideoContent as Mock).mockResolvedValue(
        'วิดีโอนี้แสดงขั้นตอนการใช้งานแอปพลิเคชันตั้งแต่การเปิดโปรแกรมจนถึงการบันทึกการตั้งค่า'
      );

      const summary = await processor.generateVideoSummary(mockVideoContent, 200, 'thai');

      expect(summary).toContain('วิดีโอนี้แสดงขั้นตอน');
      expect(videoContentAnalyzer.summarizeVideoContent).toHaveBeenCalledWith(
        mockVideoContent,
        200,
        'thai'
      );
    });
  });

  describe('identifyScreenshotMoments', () => {
    it('should identify optimal screenshot moments', async () => {
      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.identifyOptimalScreenshotTimestamps as Mock).mockReturnValue([
        30, 120, 180, 240
      ]);

      const moments = processor.identifyScreenshotMoments(mockVideoContent, 10);

      expect(moments).toEqual([30, 120, 180, 240]);
      expect(videoContentAnalyzer.identifyOptimalScreenshotTimestamps).toHaveBeenCalledWith(
        mockVideoContent,
        10
      );
    });
  });

  describe('processTranscriptForSteps', () => {
    it('should process transcript and identify steps', async () => {
      const transcript = 'First, open the application. Then, click on settings. Next, configure the options. Finally, save your changes.';
      
      const steps = await processor.processTranscriptForSteps(transcript, 'test123');

      expect(steps.length).toBeGreaterThan(0);
      
      // Check that step-type moments are identified
      const stepMoments = steps.filter(step => step.actionType === 'step');
      expect(stepMoments.length).toBeGreaterThan(0);
      
      // Check that descriptions contain relevant content
      const descriptions = steps.map(step => step.description.toLowerCase());
      expect(descriptions.some(desc => desc.includes('open') || desc.includes('click'))).toBe(true);
    });

    it('should handle Thai language transcript', async () => {
      const thaiTranscript = 'ขั้นแรก เปิดแอปพลิเคชัน จากนั้น คลิกที่การตั้งค่า ต่อไป ตั้งค่าตัวเลือก สุดท้าย บันทึกการเปลี่ยนแปลง';
      
      const steps = await processor.processTranscriptForSteps(thaiTranscript, 'test123');

      expect(steps.length).toBeGreaterThan(0);
      
      // Check that Thai keywords are recognized
      const stepMoments = steps.filter(step => step.actionType === 'step');
      expect(stepMoments.length).toBeGreaterThan(0);
    });

    it('should handle empty or short transcript', async () => {
      const shortTranscript = 'Short.';
      
      const steps = await processor.processTranscriptForSteps(shortTranscript, 'test123');

      // Should handle gracefully, possibly returning empty array or minimal steps
      expect(Array.isArray(steps)).toBe(true);
    });
  });

  describe('private methods', () => {
    it('should calculate optimal screenshot timestamps', () => {
      const keyMoments: VideoMoment[] = [
        { timestamp: 30, description: 'Step 1', importance: 'high', actionType: 'step' },
        { timestamp: 60, description: 'Step 2', importance: 'high', actionType: 'step' },
        { timestamp: 90, description: 'Explanation', importance: 'medium', actionType: 'explanation' },
        { timestamp: 120, description: 'Step 3', importance: 'high', actionType: 'step' }
      ];

      const options = {
        maxScreenshots: 10,
        screenshotInterval: 45,
        captureScreenshots: true,
        screenshotQuality: 'medium' as const,
        includeTranscript: true,
        includeScreenshots: true,
        transcriptLanguage: 'en',
        timeout: 30000,
        analyzeAudio: true,
        extractKeyMoments: true
      };

      // Access private method through type assertion
      const timestamps = (processor as any).calculateOptimalScreenshotTimestamps(keyMoments, options);

      expect(Array.isArray(timestamps)).toBe(true);
      expect(timestamps.length).toBeLessThanOrEqual(options.maxScreenshots);
      
      // Should include high importance moments
      expect(timestamps).toContain(30);
      expect(timestamps).toContain(60);
      expect(timestamps).toContain(120);
      
      // Should be sorted
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      expect(timestamps).toEqual(sortedTimestamps);
    });
  });

  describe('error handling', () => {
    it('should handle AI analysis failures gracefully', async () => {
      const mockProcessYouTubeVideo = processor.processYouTubeVideo as Mock;
      mockProcessYouTubeVideo.mockResolvedValue({
        success: true,
        content: mockExtractedContent
      });

      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.analyzeVideoContent as Mock).mockRejectedValue(
        new Error('AI analysis failed')
      );

      // Should not throw, but use fallback analysis
      const result = await processor.processVideoWithAnalysis('https://youtube.com/watch?v=test123');

      expect(result.success).toBe(true);
      expect(result.videoContent).toBeDefined();
    });

    it('should handle invalid video URLs', async () => {
      const mockProcessYouTubeVideo = processor.processYouTubeVideo as Mock;
      mockProcessYouTubeVideo.mockResolvedValue({
        success: false,
        error: 'Invalid YouTube URL format'
      });

      await expect(processor.processVideoWithAnalysis('not-a-url')).rejects.toThrow(
        'Video processing failed: Invalid YouTube URL format'
      );
    });
  });

  describe('options handling', () => {
    it('should respect processing options', async () => {
      const mockProcessYouTubeVideo = processor.processYouTubeVideo as Mock;
      mockProcessYouTubeVideo.mockResolvedValue({
        success: true,
        content: mockExtractedContent
      });

      const { videoContentAnalyzer } = await import('../ai/VideoContentAnalyzer');
      (videoContentAnalyzer.analyzeVideoContent as Mock).mockResolvedValue(mockVideoContent);

      const options = {
        captureScreenshots: false,
        analyzeAudio: false,
        maxScreenshots: 5,
        screenshotQuality: 'high' as const
      };

      const result = await processor.processVideoWithAnalysis(
        'https://youtube.com/watch?v=test123',
        options
      );

      expect(result.success).toBe(true);
      // Should not have attempted screenshot capture
      expect(result.videoContent.screenshots).toHaveLength(0);
    });
  });
});