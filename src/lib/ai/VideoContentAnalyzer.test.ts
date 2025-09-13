import './test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoContentAnalyzer } from './VideoContentAnalyzer';
import { VideoContent, VideoMoment, APIKeyError } from '@/types';
import { llmConnector } from './LLMConnector';

describe('VideoContentAnalyzer', () => {
  let videoContentAnalyzer: VideoContentAnalyzer;
  let mockTranscript: string;

  beforeEach(() => {
    videoContentAnalyzer = new VideoContentAnalyzer();
    mockTranscript = 'Welcome to this tutorial. First, we will install the software. Then we will configure it. Finally, we will test the installation.';
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('analyzeVideoContent', () => {
    it('should analyze video content and return structured data', async () => {
      const mockKeyMomentsResponse = JSON.stringify({
        keyMoments: [
          {
            timestamp: 30,
            description: 'Software installation begins',
            importance: 'high',
            actionType: 'step'
          },
          {
            timestamp: 120,
            description: 'Configuration process',
            importance: 'medium',
            actionType: 'step'
          }
        ]
      });

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: mockKeyMomentsResponse,
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 }
      });

      const result = await videoContentAnalyzer.analyzeVideoContent(
        'test123',
        mockTranscript,
        300,
        'Test Tutorial Video'
      );

      expect(result).toBeDefined();
      expect(result.videoId).toBe('test123');
      expect(result.duration).toBe(300);
      expect(result.transcript).toBe(mockTranscript);
      expect(result.keyMoments).toHaveLength(2);
      expect(result.keyMoments[0].description).toBe('Software installation begins');
      expect(result.screenshots).toBeDefined();
      expect(result.audioAnalysis).toBeDefined();
    });

    it('should handle LLM parsing failures with fallback', async () => {
      // Mock invalid JSON response
      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: 'Invalid JSON response',
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
      });

      const result = await videoContentAnalyzer.analyzeVideoContent(
        'test123',
        mockTranscript,
        300,
        'Test Tutorial Video'
      );

      expect(result).toBeDefined();
      expect(result.keyMoments.length).toBeGreaterThan(0); // Should have fallback moments
    });

    it('should handle API errors', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValue(new APIKeyError('API request failed', 'API_ERROR', true));

      await expect(videoContentAnalyzer.analyzeVideoContent('test123', mockTranscript, 300, 'Test Video'))
        .rejects.toThrow(APIKeyError);
    });

    it('should handle general errors', async () => {
      vi.mocked(llmConnector.createChatCompletion)
        .mockRejectedValue(new Error('Network error'));

      await expect(videoContentAnalyzer.analyzeVideoContent('test123', mockTranscript, 300, 'Test Video'))
        .rejects.toThrow('Video content analysis failed');
    });
  });

  describe('extractStepByStepInstructions', () => {
    let mockVideoContent: VideoContent;

    beforeEach(() => {
      mockVideoContent = {
        videoId: 'test123',
        duration: 300,
        transcript: mockTranscript,
        keyMoments: [
          {
            timestamp: 30,
            description: 'Install the software',
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
        screenshots: []
      };
    });

    it('should extract step-by-step instructions in Thai', async () => {
      const mockStepsResponse = JSON.stringify([
        '1. ติดตั้งซอฟต์แวร์',
        '2. กำหนดค่าการตั้งค่า',
        '3. ทดสอบการติดตั้ง'
      ]);

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: mockStepsResponse,
        usage: { promptTokens: 150, completionTokens: 75, totalTokens: 225 }
      });

      const result = await videoContentAnalyzer.extractStepByStepInstructions(mockVideoContent, 'thai');

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('1. ติดตั้งซอฟต์แวร์');
      expect(result[1]).toBe('2. กำหนดค่าการตั้งค่า');
    });

    it('should extract step-by-step instructions in English', async () => {
      const mockStepsResponse = JSON.stringify([
        '1. Install the software',
        '2. Configure the settings',
        '3. Test the installation'
      ]);

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: mockStepsResponse,
        usage: { promptTokens: 150, completionTokens: 75, totalTokens: 225 }
      });

      const result = await videoContentAnalyzer.extractStepByStepInstructions(mockVideoContent, 'english');

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('1. Install the software');
    });

    it('should handle parsing failures with fallback', async () => {
      const mockResponse = `1. Install the software
2. Configure the settings
3. Test the installation`;

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: mockResponse,
        usage: { promptTokens: 150, completionTokens: 75, totalTokens: 225 }
      });

      const result = await videoContentAnalyzer.extractStepByStepInstructions(mockVideoContent);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Install the software');
    });
  });

  describe('summarizeVideoContent', () => {
    let mockVideoContent: VideoContent;

    beforeEach(() => {
      mockVideoContent = {
        videoId: 'test123',
        duration: 300,
        transcript: mockTranscript,
        keyMoments: [
          {
            timestamp: 30,
            description: 'Software installation process',
            importance: 'high',
            actionType: 'step'
          }
        ],
        screenshots: []
      };
    });

    it('should summarize video content in Thai', async () => {
      const mockSummary = 'วิดีโอนี้แสดงขั้นตอนการติดตั้งและกำหนดค่าซอฟต์แวร์ รวมถึงการทดสอบการติดตั้ง';

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: mockSummary,
        usage: { promptTokens: 200, completionTokens: 50, totalTokens: 250 }
      });

      const result = await videoContentAnalyzer.summarizeVideoContent(mockVideoContent, 500, 'thai');

      expect(result).toBe(mockSummary);
      expect(result.length).toBeLessThanOrEqual(500);
    });

    it('should summarize video content in English', async () => {
      const mockSummary = 'This video demonstrates the software installation and configuration process, including testing.';

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: mockSummary,
        usage: { promptTokens: 200, completionTokens: 50, totalTokens: 250 }
      });

      const result = await videoContentAnalyzer.summarizeVideoContent(mockVideoContent, 500, 'english');

      expect(result).toBe(mockSummary);
    });

    it('should truncate summary if it exceeds max length', async () => {
      const longSummary = 'A'.repeat(600);

      vi.mocked(llmConnector.createChatCompletion).mockResolvedValue({
        content: longSummary,
        usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 }
      });

      const result = await videoContentAnalyzer.summarizeVideoContent(mockVideoContent, 500);

      expect(result.length).toBeLessThanOrEqual(500);
    });
  });

  describe('identifyOptimalScreenshotTimestamps', () => {
    let mockVideoContent: VideoContent;

    beforeEach(() => {
      mockVideoContent = {
        videoId: 'test123',
        duration: 300,
        transcript: mockTranscript,
        keyMoments: [
          {
            timestamp: 30,
            description: 'High importance step',
            importance: 'high',
            actionType: 'step'
          },
          {
            timestamp: 60,
            description: 'Medium importance explanation',
            importance: 'medium',
            actionType: 'explanation'
          },
          {
            timestamp: 90,
            description: 'Low importance note',
            importance: 'low',
            actionType: 'explanation'
          }
        ],
        screenshots: [
          {
            timestamp: 120,
            imageUrl: 'screenshot1.jpg',
            caption: 'Existing screenshot',
            relevanceScore: 0.8
          }
        ]
      };
    });

    it('should identify optimal screenshot timestamps', () => {
      const result = videoContentAnalyzer.identifyOptimalScreenshotTimestamps(mockVideoContent, 5);

      expect(result).toBeDefined();
      expect(result.length).toBeLessThanOrEqual(5);
      expect(result).toContain(30); // High importance step should be included
      expect(result).toContain(120); // Existing screenshot should be included
      expect(result).toBeSorted(); // Should be sorted by timestamp
    });

    it('should limit number of screenshots', () => {
      const result = videoContentAnalyzer.identifyOptimalScreenshotTimestamps(mockVideoContent, 2);

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should avoid timestamps too close to each other', () => {
      // Add a moment very close to existing one
      mockVideoContent.keyMoments.push({
        timestamp: 32, // Very close to timestamp 30
        description: 'Close moment',
        importance: 'high',
        actionType: 'step'
      });

      const result = videoContentAnalyzer.identifyOptimalScreenshotTimestamps(mockVideoContent, 10);

      // Should not include both 30 and 32 (too close)
      const hasCloseTimestamps = result.some((timestamp, index) => 
        result.some((otherTimestamp, otherIndex) => 
          index !== otherIndex && Math.abs(timestamp - otherTimestamp) < 10
        )
      );

      expect(hasCloseTimestamps).toBe(false);
    });
  });

  describe('audio analysis', () => {
    it('should analyze audio from transcript', async () => {
      const result = await videoContentAnalyzer.analyzeVideoContent(
        'test123',
        'This is a test transcript with some filler words um and uh.',
        120,
        'Test Video'
      );

      expect(result.audioAnalysis).toBeDefined();
      expect(result.audioAnalysis?.duration).toBe(120);
      expect(result.audioAnalysis?.language).toBe('en');
      expect(result.audioAnalysis?.quality).toBe('medium'); // Due to filler words
      expect(result.audioAnalysis?.speechSegments).toBeDefined();
    });

    it('should detect Thai language in transcript', async () => {
      const thaiTranscript = 'นี่คือการทดสอบภาษาไทย';
      
      const result = await videoContentAnalyzer.analyzeVideoContent(
        'test123',
        thaiTranscript,
        60,
        'Thai Video'
      );

      expect(result.audioAnalysis?.language).toBe('th');
    });
  });
});