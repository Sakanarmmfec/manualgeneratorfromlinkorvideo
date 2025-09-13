/**
 * Tests for YouTubeProcessor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YouTubeProcessor } from './YouTubeProcessor';

// Mock fetch globally
global.fetch = vi.fn();

describe('YouTubeProcessor', () => {
  let processor: YouTubeProcessor;

  beforeEach(() => {
    processor = new YouTubeProcessor();
    vi.clearAllMocks();
  });

  describe('extractVideoId', () => {
    it('should extract video IDs from various YouTube URL formats', () => {
      const testCases = [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://youtube.com/v/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s', expected: 'dQw4w9WgXcQ' },
        { url: 'https://example.com', expected: null },
        { url: 'invalid-url', expected: null }
      ];

      testCases.forEach(({ url, expected }) => {
        const result = processor.extractVideoId(url);
        expect(result).toBe(expected);
      });
    });
  });

  describe('processYouTubeVideo', () => {
    it('should process a YouTube video successfully', async () => {
      const mockVideoPageHtml = `
        <html>
        <head>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Test Video Title",
                "shortDescription": "Test video description",
                "lengthSeconds": "180",
                "author": "Test Channel",
                "viewCount": "1000"
              }
            };
          </script>
        </head>
        <body>
          <script>
            window.ytplayer = {
              config: {
                args: {
                  "title": "Test Video Title",
                  "author": "Test Channel",
                  "length_seconds": "180"
                }
              }
            };
          </script>
        </body>
        </html>
      `;

      const mockTranscriptXml = `
        <?xml version="1.0" encoding="utf-8" ?>
        <transcript>
          <text start="0" dur="3.5">Hello and welcome to this video</text>
          <text start="3.5" dur="4.2">Today we will learn about something interesting</text>
          <text start="7.7" dur="3.8">Let me show you how this works</text>
        </transcript>
      `;

      // Mock video page fetch
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockVideoPageHtml)
          });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockTranscriptXml)
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await processor.processYouTubeVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      
      if (result.content) {
        expect(result.content.contentType).toBe('youtube_video');
        expect(result.content.videoContent).toBeDefined();
        expect(result.content.videoContent?.videoId).toBe('dQw4w9WgXcQ');
        expect(result.content.videoContent?.duration).toBe(180);
        expect(result.content.videoContent?.transcript).toContain('Hello and welcome');
        expect(result.content.videoContent?.keyMoments).toBeDefined();
        expect(result.content.images).toHaveLength(1); // Thumbnail
        expect(result.content.images[0].url).toContain('maxresdefault.jpg');
      }
    });

    it('should handle invalid YouTube URLs', async () => {
      const result = await processor.processYouTubeVideo('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid YouTube URL format');
    });

    it('should handle video info extraction failure', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await processor.processYouTubeVideo('https://www.youtube.com/watch?v=invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve video information');
    });

    it('should handle transcript extraction failure gracefully', async () => {
      const mockVideoPageHtml = `
        <html>
        <body>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Test Video",
                "shortDescription": "Test description",
                "lengthSeconds": "60"
              }
            };
          </script>
        </body>
        </html>
      `;

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockVideoPageHtml)
          });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({
            ok: false,
            status: 404
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await processor.processYouTubeVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain('Transcript extraction failed');
      expect(result.content?.videoContent?.transcript).toBe('');
    });

    it('should create key moments from transcript', async () => {
      const mockVideoPageHtml = `
        <html>
        <body>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Tutorial Video",
                "shortDescription": "Step by step tutorial",
                "lengthSeconds": "300"
              }
            };
          </script>
        </body>
        </html>
      `;

      const mockTranscriptXml = `
        <?xml version="1.0" encoding="utf-8" ?>
        <transcript>
          <text start="0" dur="5">First, let me show you the basics</text>
          <text start="5" dur="5">Step one is to open the application</text>
          <text start="10" dur="5">Next, we need to configure the settings</text>
          <text start="15" dur="5">Now you can see the result here</text>
          <text start="20" dur="5">Finally, we complete the process</text>
        </transcript>
      `;

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockVideoPageHtml)
          });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockTranscriptXml)
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await processor.processYouTubeVideo('https://www.youtube.com/watch?v=tutorial123');

      expect(result.success).toBe(true);
      expect(result.content?.videoContent?.keyMoments).toBeDefined();
      
      const keyMoments = result.content?.videoContent?.keyMoments || [];
      expect(keyMoments.length).toBeGreaterThan(0);
      
      // Should identify step-related moments
      const stepMoments = keyMoments.filter(moment => moment.actionType === 'step');
      expect(stepMoments.length).toBeGreaterThan(0);
    });
  });

  describe('video content analysis', () => {
    it('should create basic key moments when no transcript is available', async () => {
      const mockVideoPageHtml = `
        <html>
        <body>
          <script>
            var ytInitialData = {
              "videoDetails": {
                "title": "Silent Video",
                "shortDescription": "No transcript available",
                "lengthSeconds": "600"
              }
            };
          </script>
        </body>
        </html>
      `;

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('youtube.com/watch')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockVideoPageHtml)
          });
        }
        if (url.includes('timedtext')) {
          return Promise.resolve({
            ok: false,
            status: 404
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await processor.processYouTubeVideo('https://www.youtube.com/watch?v=silent123');

      expect(result.success).toBe(true);
      expect(result.content?.videoContent?.keyMoments).toBeDefined();
      
      const keyMoments = result.content?.videoContent?.keyMoments || [];
      expect(keyMoments.length).toBeGreaterThan(0);
      expect(keyMoments.length).toBeLessThanOrEqual(5); // Max 5 moments for 10-minute video
    });
  });
});