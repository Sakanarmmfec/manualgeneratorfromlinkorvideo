/**
 * Tests for VideoAnalyzer
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { VideoAnalyzer } from './VideoAnalyzer';
import { VideoContent, VideoMoment } from '../../types';

// Mock LLMConnector
vi.mock('./LLMConnector', () => ({
  llmConnector: {
    createChatCompletion: vi.fn()
  }
}));

describe('VideoAnalyzer', () => {
  let analyzer: VideoAnalyzer;
  let mockVideoContent: VideoContent;

  beforeEach(() => {
    analyzer = new VideoAnalyzer();
    
    mockVideoContent = {
      videoId: 'test123',
      duration: 300,
      transcript: 'First, open the application. Then, click on settings. Next, configure the options. Finally, save your changes.',
      keyMoments: [],
      screenshots: []
    };

    vi.clearAllMocks();
  });

  describe('analyzeVideo', () => {
    it('should perform comprehensive video analysis', async () => {
      const { llmConnector } = await import('./LLMConnector');
      
      // Mock AI responses
      (llmConnector.createChatCompletion as Mock)
        .mockResolvedValueOnce({
          content: JSON.stringify({
            keyMoments: [
              {
                timestamp: 30,
                description: 'Open the application',
                importance: 'high',
                actionType: 'step',
                visualImportance: 'high',
                documentationValue: 'Shows the starting point'
              },
              {
                timestamp: 120,
                description: 'Configure settings',
                importance: 'high',
                actionType: 'step',
                visualImportance: 'medium',
                documentationValue: 'Important configuration step'
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          content: JSON.stringify({
            transitions: [
              {
                timestamp: 60,
                transitionType: 'topic_change',
                description: 'Moving from opening to configuration',
                confidence: 0.8
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          content: JSON.stringify({
            segments: [
              {
                startTime: 0,
                endTime: 150,
                title: 'Application Setup',
                description: 'Initial setup and configuration',
                keyPoints: ['Open app', 'Navigate to settings'],
                actionItems: ['Click open', 'Find settings menu'],
                importance: 'high'
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          content: 'This video demonstrates how to set up and configure the application, covering essential steps from opening to saving settings.'
        })
        .mockResolvedValueOnce({
          content: JSON.stringify({
            steps: [
              'เปิดแอปพลิเคชัน',
              'คลิกที่การตั้งค่า',
              'ตั้งค่าตัวเลือก',
              'บันทึกการเปลี่ยนแปลง'
            ]
          })
        });

      const result = await analyzer.analyzeVideo(mockVideoContent, 'Test Video');

      expect(result.keyMoments).toHaveLength(2);
      expect(result.keyMoments[0].actionType).toBe('step');
      expect(result.transitions).toHaveLength(1);
      expect(result.segments).toHaveLength(1);
      expect(result.summary).toContain('application');
      expect(result.stepByStepInstructions).toHaveLength(4);
      expect(result.recommendedScreenshots).toBeDefined();
    });

    it('should handle AI parsing failures gracefully', async () => {
      const { llmConnector } = await import('./LLMConnector');
      
      // Mock invalid JSON responses
      (llmConnector.createChatCompletion as Mock)
        .mockResolvedValue({ content: 'Invalid JSON response' });

      const result = await analyzer.analyzeVideo(mockVideoContent, 'Test Video');

      // Should use fallback methods
      expect(result.keyMoments).toBeDefined();
      expect(Array.isArray(result.keyMoments)).toBe(true);
      expect(result.transitions).toEqual([]);
      expect(result.segments).toBeDefined();
    });

    it('should respect analysis options', async () => {
      const { llmConnector } = await import('./LLMConnector');
      
      (llmConnector.createChatCompletion as Mock)
        .mockResolvedValue({
          content: JSON.stringify({
            keyMoments: [
              {
                timestamp: 30,
                description: 'Test moment',
                importance: 'high',
                actionType: 'step'
              }
            ]
          })
        });

      const options = {
        focusOnSteps: true,
        includeTransitions: false,
        maxKeyMoments: 5,
        targetLanguage: 'english' as const,
        analysisDepth: 'basic' as const
      };

      const result = await analyzer.analyzeVideo(mockVideoContent, 'Test Video', options);

      expect(result.transitions).toEqual([]);
      
      // Verify that the system prompt includes the correct language
      const calls = (llmConnector.createChatCompletion as Mock).mock.calls;
      const systemPrompt = calls[0][0][0].content;
      expect(systemPrompt).toContain('English');
    });
  });

  describe('recommendScreenshotTimestamps', () => {
    it('should recommend optimal screenshot timestamps', () => {
      const keyMoments: VideoMoment[] = [
        { timestamp: 30, description: 'Step 1', importance: 'high', actionType: 'step' },
        { timestamp: 90, description: 'Step 2', importance: 'high', actionType: 'step' },
        { timestamp: 150, description: 'Explanation', importance: 'medium', actionType: 'explanation' }
      ];

      const transitions = [
        { timestamp: 60, transitionType: 'topic_change' as const, description: 'Topic change', confidence: 0.8 }
      ];

      const segments = [
        {
          startTime: 0,
          endTime: 120,
          title: 'Setup',
          description: 'Initial setup',
          keyPoints: [],
          actionItems: [],
          importance: 'high' as const
        }
      ];

      const timestamps = (analyzer as any).recommendScreenshotTimestamps(keyMoments, transitions, segments);

      expect(Array.isArray(timestamps)).toBe(true);
      expect(timestamps.length).toBeGreaterThan(0);
      expect(timestamps).toContain(30); // High importance step
      expect(timestamps).toContain(90); // High importance step
      
      // Should be sorted
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      expect(timestamps).toEqual(sortedTimestamps);
    });

    it('should avoid duplicate timestamps', () => {
      const keyMoments: VideoMoment[] = [
        { timestamp: 30, description: 'Step 1', importance: 'high', actionType: 'step' },
        { timestamp: 32, description: 'Step 1 continued', importance: 'high', actionType: 'step' }
      ];

      const transitions = [
        { timestamp: 31, transitionType: 'action_change' as const, description: 'Action change', confidence: 0.9 }
      ];

      const segments = [];

      const timestamps = (analyzer as any).recommendScreenshotTimestamps(keyMoments, transitions, segments);

      // Should not include timestamps too close to each other (within 15 seconds)
      const uniqueTimestamps = new Set(timestamps);
      expect(timestamps.length).toBe(uniqueTimestamps.size);
    });
  });

  describe('createFallbackKeyMoments', () => {
    it('should create fallback key moments when AI fails', () => {
      const transcript = 'This is a test transcript. It has multiple sentences. Each sentence should be analyzed.';
      const duration = 180;
      const options = {
        focusOnSteps: true,
        includeTransitions: true,
        maxKeyMoments: 10,
        targetLanguage: 'thai' as const,
        analysisDepth: 'detailed' as const
      };

      const moments = (analyzer as any).createFallbackKeyMoments(transcript, duration, options);

      expect(Array.isArray(moments)).toBe(true);
      expect(moments.length).toBeGreaterThan(0);
      expect(moments.length).toBeLessThanOrEqual(options.maxKeyMoments);
      
      // Check that moments have required properties
      moments.forEach((moment: VideoMoment) => {
        expect(moment.timestamp).toBeGreaterThanOrEqual(0);
        expect(moment.description).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(moment.importance);
        expect(['step', 'explanation', 'demonstration', 'result']).toContain(moment.actionType);
      });
    });
  });

  describe('createFallbackSegments', () => {
    it('should create fallback segments when AI fails', () => {
      const keyMoments: VideoMoment[] = [
        { timestamp: 30, description: 'First moment', importance: 'high', actionType: 'step' },
        { timestamp: 90, description: 'Second moment', importance: 'medium', actionType: 'explanation' },
        { timestamp: 150, description: 'Third moment', importance: 'high', actionType: 'result' }
      ];
      const duration = 240;

      const segments = (analyzer as any).createFallbackSegments(keyMoments, duration);

      expect(Array.isArray(segments)).toBe(true);
      expect(segments.length).toBeGreaterThan(0);
      
      // Check segment properties
      segments.forEach((segment: any) => {
        expect(segment.startTime).toBeGreaterThanOrEqual(0);
        expect(segment.endTime).toBeGreaterThan(segment.startTime);
        expect(segment.title).toBeDefined();
        expect(segment.description).toBeDefined();
        expect(Array.isArray(segment.keyPoints)).toBe(true);
        expect(Array.isArray(segment.actionItems)).toBe(true);
        expect(['high', 'medium', 'low']).toContain(segment.importance);
      });
    });
  });

  describe('guessActionType', () => {
    it('should correctly guess action types from sentences', () => {
      const testCases = [
        { sentence: 'First, click on the button', expected: 'step' },
        { sentence: 'Now press the enter key', expected: 'step' },
        { sentence: 'Here you can see the result', expected: 'demonstration' },
        { sentence: 'This shows the final outcome', expected: 'demonstration' },
        { sentence: 'The result is now complete', expected: 'result' },
        { sentence: 'The final result is complete', expected: 'result' },
        { sentence: 'The reason why this happens is the setting', expected: 'explanation' },
        { sentence: 'The reason for this behavior', expected: 'explanation' },
        { sentence: 'This is a general statement', expected: 'explanation' }
      ];

      testCases.forEach(({ sentence, expected }) => {
        const actionType = (analyzer as any).guessActionType(sentence);
        expect(actionType).toBe(expected);
      });
    });
  });

  describe('error handling', () => {
    it('should handle LLM API errors', async () => {
      const { llmConnector } = await import('./LLMConnector');
      
      (llmConnector.createChatCompletion as Mock)
        .mockRejectedValue(new Error('API Error'));

      await expect(analyzer.analyzeVideo(mockVideoContent, 'Test Video')).rejects.toThrow(
        'Video analysis failed: API Error'
      );
    });

    it('should handle empty transcript', async () => {
      const emptyVideoContent = {
        ...mockVideoContent,
        transcript: ''
      };

      const { llmConnector } = await import('./LLMConnector');
      
      (llmConnector.createChatCompletion as Mock)
        .mockResolvedValue({ content: '{}' });

      const result = await analyzer.analyzeVideo(emptyVideoContent, 'Empty Video');

      expect(result.keyMoments).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('language handling', () => {
    it('should handle Thai language analysis', async () => {
      const thaiVideoContent = {
        ...mockVideoContent,
        transcript: 'ขั้นแรก เปิดแอปพลิเคชัน จากนั้น คลิกที่การตั้งค่า ต่อไป ตั้งค่าตัวเลือก'
      };

      const { llmConnector } = await import('./LLMConnector');
      
      (llmConnector.createChatCompletion as Mock)
        .mockResolvedValue({
          content: JSON.stringify({
            keyMoments: [
              {
                timestamp: 30,
                description: 'เปิดแอปพลิเคชัน',
                importance: 'high',
                actionType: 'step'
              }
            ]
          })
        });

      const options = { targetLanguage: 'thai' as const };
      const result = await analyzer.analyzeVideo(thaiVideoContent, 'Thai Video', options);

      expect(result.keyMoments).toBeDefined();
      
      // Verify Thai language is specified in prompts
      const calls = (llmConnector.createChatCompletion as Mock).mock.calls;
      const systemPrompt = calls[0][0][0].content;
      expect(systemPrompt).toContain('Thai');
    });
  });
});