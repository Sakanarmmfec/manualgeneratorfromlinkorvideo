import { 
  VideoContent, 
  VideoMoment, 
  VideoScreenshot, 
  ExtractedContent,
  APIKeyError 
} from '@/types';
import { llmConnector } from './LLMConnector';

/**
 * VideoContentAnalyzer handles YouTube video analysis, summarization, and step extraction
 * Uses AI to identify key moments, extract steps, and generate structured content
 */
export class VideoContentAnalyzer {

  /**
   * Analyze video content and extract key information
   */
  public async analyzeVideoContent(
    videoId: string,
    transcript: string,
    duration: number,
    title: string,
    metadata?: any
  ): Promise<VideoContent> {
    try {
      // Step 1: Identify key moments and steps
      const keyMoments = await this.identifyKeyMoments(transcript, duration);
      
      // Step 2: Generate screenshots data (placeholder for actual screenshot capture)
      const screenshots = await this.generateScreenshotData(keyMoments, duration);
      
      // Step 3: Analyze audio content (basic analysis from transcript)
      const audioAnalysis = this.analyzeAudioFromTranscript(transcript, duration);

      return {
        videoId,
        duration,
        transcript,
        keyMoments,
        screenshots,
        audioAnalysis
      };
    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      
      throw new Error(`Video content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Identify key moments and steps from video transcript
   */
  private async identifyKeyMoments(transcript: string, duration: number): Promise<VideoMoment[]> {
    const systemPrompt = `You are a video content analyst specializing in identifying key moments and steps in instructional or product demonstration videos.

Your task is to analyze a video transcript and identify important moments that should be highlighted in documentation.

Guidelines:
- Identify clear action steps, demonstrations, explanations, and results
- Assign appropriate importance levels (high, medium, low)
- Estimate timestamps based on content flow and transcript structure
- Focus on moments that would be valuable for documentation
- Categorize each moment by action type

Return the analysis as a JSON array with this structure:
{
  "keyMoments": [
    {
      "timestamp": 120,
      "description": "Clear description of what happens at this moment",
      "importance": "high|medium|low",
      "actionType": "step|explanation|demonstration|result"
    }
  ]
}`;

    const userPrompt = `Analyze this video transcript and identify key moments for documentation:

Video Duration: ${duration} seconds
Transcript:
${transcript}

Please identify 5-15 key moments that would be most valuable for creating documentation.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 2000
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.keyMoments || [];
    } catch (error) {
      console.warn('Failed to parse key moments, creating fallback moments');
      return this.createFallbackKeyMoments(transcript, duration);
    }
  }

  /**
   * Generate screenshot data based on key moments
   */
  private async generateScreenshotData(keyMoments: VideoMoment[], duration: number): Promise<VideoScreenshot[]> {
    const screenshots: VideoScreenshot[] = [];
    
    // Generate screenshots for high and medium importance moments
    const importantMoments = keyMoments.filter(moment => 
      moment.importance === 'high' || moment.importance === 'medium'
    );

    for (const moment of importantMoments) {
      screenshots.push({
        timestamp: moment.timestamp,
        imageUrl: `placeholder_screenshot_${moment.timestamp}.jpg`, // Placeholder - actual implementation would capture real screenshots
        caption: moment.description,
        relevanceScore: moment.importance === 'high' ? 0.9 : 0.7,
        associatedStep: moment.actionType === 'step' ? moment.description : undefined
      });
    }

    // Add additional screenshots at regular intervals for comprehensive coverage
    const intervalScreenshots = Math.min(5, Math.floor(duration / 60)); // One per minute, max 5
    for (let i = 1; i <= intervalScreenshots; i++) {
      const timestamp = Math.floor((duration / (intervalScreenshots + 1)) * i);
      
      // Only add if not too close to existing screenshots
      const tooClose = screenshots.some(s => Math.abs(s.timestamp - timestamp) < 30);
      if (!tooClose) {
        screenshots.push({
          timestamp,
          imageUrl: `placeholder_screenshot_${timestamp}.jpg`,
          caption: `ภาพหน้าจอที่ ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}`,
          relevanceScore: 0.5,
        });
      }
    }

    return screenshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Create fallback key moments when AI parsing fails
   */
  private createFallbackKeyMoments(transcript: string, duration: number): VideoMoment[] {
    const moments: VideoMoment[] = [];
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Create moments at regular intervals
    const intervalCount = Math.min(8, Math.max(3, Math.floor(duration / 120))); // Every 2 minutes, 3-8 moments
    
    for (let i = 0; i < intervalCount && i < sentences.length; i++) {
      const timestamp = Math.floor((duration / intervalCount) * i);
      const sentence = sentences[Math.floor((sentences.length / intervalCount) * i)];
      
      moments.push({
        timestamp,
        description: sentence.trim().substring(0, 100) + (sentence.length > 100 ? '...' : ''),
        importance: i === 0 || i === intervalCount - 1 ? 'high' : 'medium',
        actionType: i === 0 ? 'explanation' : (i === intervalCount - 1 ? 'result' : 'step')
      });
    }

    return moments;
  }

  /**
   * Analyze audio content from transcript
   */
  private analyzeAudioFromTranscript(transcript: string, duration: number): any {
    // Basic analysis based on transcript characteristics
    const wordCount = transcript.split(/\s+/).length;
    const wordsPerMinute = (wordCount / duration) * 60;
    
    // Detect language (basic detection)
    const thaiCharPattern = /[\u0E00-\u0E7F]/;
    const hasThaiChars = thaiCharPattern.test(transcript);
    const language = hasThaiChars ? 'th' : 'en';
    
    // Estimate quality based on transcript characteristics
    const hasRepeatedWords = /(\b\w+\b).*\1.*\1/.test(transcript);
    const hasFillerWords = /\b(um|uh|er|ah)\b/gi.test(transcript);
    const quality = hasRepeatedWords || hasFillerWords ? 'medium' : 'high';
    
    // Simple speech segmentation (split by sentences)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const speechSegments = sentences.map((sentence, index) => ({
      startTime: (duration / sentences.length) * index,
      endTime: (duration / sentences.length) * (index + 1),
      text: sentence.trim(),
      confidence: 0.8 // Default confidence
    }));

    return {
      duration,
      language,
      quality,
      hasMusic: false, // Cannot detect from transcript alone
      speechSegments
    };
  }

  /**
   * Extract step-by-step instructions from video content
   */
  public async extractStepByStepInstructions(
    videoContent: VideoContent,
    targetLanguage: 'thai' | 'english' = 'thai'
  ): Promise<string[]> {
    const systemPrompt = `You are an expert at extracting step-by-step instructions from video content.
Your task is to create clear, actionable steps based on the video transcript and key moments.

Guidelines:
- Create numbered, sequential steps
- Use clear, actionable language
- Include important details and warnings
- Make steps specific and easy to follow
- Translate to ${targetLanguage === 'thai' ? 'Thai' : 'English'}
- Focus on practical implementation

Return the steps as a JSON array of strings.`;

    const keyMomentsText = videoContent.keyMoments
      .filter(moment => moment.actionType === 'step' || moment.actionType === 'demonstration')
      .map(moment => `${Math.floor(moment.timestamp / 60)}:${(moment.timestamp % 60).toString().padStart(2, '0')} - ${moment.description}`)
      .join('\n');

    const userPrompt = `Extract step-by-step instructions from this video content:

Key Moments:
${keyMomentsText}

Full Transcript:
${videoContent.transcript}

Please create clear, numbered steps in ${targetLanguage === 'thai' ? 'Thai' : 'English'}.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.3,
      maxTokens: 2000
    });

    try {
      const parsed = JSON.parse(response.content);
      return Array.isArray(parsed) ? parsed : parsed.steps || [];
    } catch (error) {
      // Fallback: split response by lines and filter
      return response.content
        .split('\n')
        .filter(line => line.trim().length > 0 && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
  }

  /**
   * Summarize video content for documentation
   */
  public async summarizeVideoContent(
    videoContent: VideoContent,
    maxLength: number = 500,
    targetLanguage: 'thai' | 'english' = 'thai'
  ): Promise<string> {
    const systemPrompt = `You are a technical writer specializing in video content summarization.
Create a concise, informative summary of the video content for documentation purposes.

Guidelines:
- Focus on key information and main points
- Include important technical details
- Mention key steps or processes covered
- Use professional ${targetLanguage === 'thai' ? 'Thai' : 'English'} language
- Keep within ${maxLength} characters
- Make it suitable for technical documentation`;

    const keyMomentsText = videoContent.keyMoments
      .filter(moment => moment.importance === 'high')
      .map(moment => moment.description)
      .join('; ');

    const userPrompt = `Summarize this video content for technical documentation:

Video Duration: ${Math.floor(videoContent.duration / 60)} minutes ${videoContent.duration % 60} seconds

Key Points: ${keyMomentsText}

Transcript: ${videoContent.transcript.substring(0, 2000)}${videoContent.transcript.length > 2000 ? '...' : ''}

Create a summary in ${targetLanguage === 'thai' ? 'Thai' : 'English'} (max ${maxLength} characters).`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: Math.floor(maxLength / 2) // Rough token estimation
    });

    return response.content.substring(0, maxLength);
  }

  /**
   * Identify optimal screenshot timestamps for documentation
   */
  public identifyOptimalScreenshotTimestamps(
    videoContent: VideoContent,
    maxScreenshots: number = 10
  ): number[] {
    const candidates: { timestamp: number; score: number }[] = [];
    
    // Add key moments as candidates
    videoContent.keyMoments.forEach(moment => {
      let score = 0;
      
      // Score based on importance
      switch (moment.importance) {
        case 'high': score += 10; break;
        case 'medium': score += 7; break;
        case 'low': score += 4; break;
      }
      
      // Score based on action type
      switch (moment.actionType) {
        case 'step': score += 8; break;
        case 'demonstration': score += 6; break;
        case 'result': score += 5; break;
        case 'explanation': score += 3; break;
      }
      
      candidates.push({ timestamp: moment.timestamp, score });
    });
    
    // Add existing screenshots as candidates
    videoContent.screenshots.forEach(screenshot => {
      candidates.push({ 
        timestamp: screenshot.timestamp, 
        score: screenshot.relevanceScore * 10 
      });
    });
    
    // Sort by score and remove duplicates (within 10 seconds)
    candidates.sort((a, b) => b.score - a.score);
    
    const selected: number[] = [];
    for (const candidate of candidates) {
      if (selected.length >= maxScreenshots) break;
      
      // Check if too close to existing selection
      const tooClose = selected.some(timestamp => 
        Math.abs(timestamp - candidate.timestamp) < 10
      );
      
      if (!tooClose) {
        selected.push(candidate.timestamp);
      }
    }
    
    return selected.sort((a, b) => a - b);
  }
}

// Export singleton instance
export const videoContentAnalyzer = new VideoContentAnalyzer();