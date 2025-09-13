/**
 * VideoAnalyzer - AI-powered video analysis for identifying key moments and transitions
 * Uses LLM to analyze video content and extract meaningful segments for documentation
 */

import { 
  VideoContent, 
  VideoMoment, 
  VideoScreenshot,
  APIKeyError 
} from '../../types';
import { llmConnector } from './LLMConnector';

export interface VideoAnalysisOptions {
  focusOnSteps: boolean;
  includeTransitions: boolean;
  maxKeyMoments: number;
  targetLanguage: 'thai' | 'english';
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

export interface TransitionAnalysis {
  timestamp: number;
  transitionType: 'scene_change' | 'topic_change' | 'action_change' | 'speaker_change';
  description: string;
  confidence: number;
}

export interface VideoSegment {
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  keyPoints: string[];
  actionItems: string[];
  importance: 'high' | 'medium' | 'low';
}

export interface VideoAnalysisResult {
  keyMoments: VideoMoment[];
  transitions: TransitionAnalysis[];
  segments: VideoSegment[];
  summary: string;
  stepByStepInstructions: string[];
  recommendedScreenshots: number[];
}

/**
 * Advanced video analyzer using AI to identify key moments and transitions
 */
export class VideoAnalyzer {
  private readonly defaultOptions: VideoAnalysisOptions = {
    focusOnSteps: true,
    includeTransitions: true,
    maxKeyMoments: 15,
    targetLanguage: 'thai',
    analysisDepth: 'detailed'
  };

  /**
   * Perform comprehensive video analysis
   */
  async analyzeVideo(
    videoContent: VideoContent,
    title: string,
    options?: Partial<VideoAnalysisOptions>
  ): Promise<VideoAnalysisResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Step 1: Analyze transcript for key moments
      const keyMoments = await this.identifyKeyMoments(
        videoContent.transcript,
        videoContent.duration,
        title,
        opts
      );

      // Step 2: Identify transitions if requested
      const transitions = opts.includeTransitions ? 
        await this.identifyTransitions(videoContent.transcript, videoContent.duration) : [];

      // Step 3: Segment the video into logical sections
      const segments = await this.segmentVideo(
        videoContent.transcript,
        keyMoments,
        videoContent.duration,
        opts
      );

      // Step 4: Generate summary
      const summary = await this.generateVideoSummary(
        videoContent.transcript,
        title,
        keyMoments,
        opts.targetLanguage
      );

      // Step 5: Extract step-by-step instructions
      const stepByStepInstructions = await this.extractStepInstructions(
        videoContent.transcript,
        keyMoments,
        opts.targetLanguage
      );

      // Step 6: Recommend optimal screenshot timestamps
      const recommendedScreenshots = this.recommendScreenshotTimestamps(
        keyMoments,
        transitions,
        segments
      );

      return {
        keyMoments,
        transitions,
        segments,
        summary,
        stepByStepInstructions,
        recommendedScreenshots
      };

    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      throw new Error(`Video analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Identify key moments in the video using AI analysis
   */
  private async identifyKeyMoments(
    transcript: string,
    duration: number,
    title: string,
    options: VideoAnalysisOptions
  ): Promise<VideoMoment[]> {
    const systemPrompt = `You are an expert video analyst specializing in identifying key moments in instructional and product demonstration videos.

Your task is to analyze a video transcript and identify the most important moments that should be highlighted in documentation.

Analysis Guidelines:
- Focus on actionable steps, demonstrations, and important explanations
- Identify moments where visual information would be most valuable
- Consider the context of creating ${options.targetLanguage === 'thai' ? 'Thai' : 'English'} documentation
- Prioritize moments that show clear actions, results, or transitions
- Estimate timestamps based on content flow and natural speech patterns

Return your analysis as a JSON object with this structure:
{
  "keyMoments": [
    {
      "timestamp": 45,
      "description": "Clear description of what happens at this moment",
      "importance": "high|medium|low",
      "actionType": "step|explanation|demonstration|result",
      "visualImportance": "high|medium|low",
      "documentationValue": "Brief explanation of why this moment is valuable for documentation"
    }
  ]
}

Limit to ${options.maxKeyMoments} most important moments.`;

    const userPrompt = `Analyze this video for key moments:

Title: ${title}
Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds
Analysis Focus: ${options.focusOnSteps ? 'Step-by-step instructions' : 'General content'}
Target Language: ${options.targetLanguage}

Transcript:
${transcript}

Please identify the most important moments for creating comprehensive documentation.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.3,
      maxTokens: 3000
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.keyMoments || [];
    } catch (error) {
      console.warn('Failed to parse key moments, creating fallback analysis');
      return this.createFallbackKeyMoments(transcript, duration, options);
    }
  }

  /**
   * Identify transitions and scene changes in the video
   */
  private async identifyTransitions(transcript: string, duration: number): Promise<TransitionAnalysis[]> {
    const systemPrompt = `You are a video transition analyst. Your task is to identify significant transitions in video content based on transcript analysis.

Look for:
- Topic changes or new subjects being introduced
- Scene changes (indicated by language like "now let's", "next we'll", "moving on to")
- Action changes (from explanation to demonstration, etc.)
- Speaker changes or perspective shifts

Return analysis as JSON:
{
  "transitions": [
    {
      "timestamp": 120,
      "transitionType": "scene_change|topic_change|action_change|speaker_change",
      "description": "Description of the transition",
      "confidence": 0.8
    }
  ]
}`;

    const userPrompt = `Identify transitions in this video transcript:

Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds

Transcript:
${transcript}

Focus on significant transitions that would affect documentation structure.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 2000
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.transitions || [];
    } catch (error) {
      console.warn('Failed to parse transitions, returning empty array');
      return [];
    }
  }

  /**
   * Segment video into logical sections
   */
  private async segmentVideo(
    transcript: string,
    keyMoments: VideoMoment[],
    duration: number,
    options: VideoAnalysisOptions
  ): Promise<VideoSegment[]> {
    const systemPrompt = `You are a video content organizer. Your task is to divide video content into logical segments for documentation purposes.

Create segments that:
- Group related content together
- Have clear start and end points
- Include meaningful titles and descriptions
- Identify key points and action items within each segment
- Are appropriate for ${options.targetLanguage === 'thai' ? 'Thai' : 'English'} documentation

Return as JSON:
{
  "segments": [
    {
      "startTime": 0,
      "endTime": 120,
      "title": "Segment title",
      "description": "What this segment covers",
      "keyPoints": ["Point 1", "Point 2"],
      "actionItems": ["Action 1", "Action 2"],
      "importance": "high|medium|low"
    }
  ]
}`;

    const keyMomentsText = keyMoments
      .map(m => `${Math.floor(m.timestamp / 60)}:${(m.timestamp % 60).toString().padStart(2, '0')} - ${m.description}`)
      .join('\n');

    const userPrompt = `Segment this video content for documentation:

Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds
Key Moments:
${keyMomentsText}

Transcript:
${transcript}

Create 3-8 logical segments that would work well for structured documentation.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 2500
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.segments || [];
    } catch (error) {
      console.warn('Failed to parse segments, creating fallback segments');
      return this.createFallbackSegments(keyMoments, duration);
    }
  }

  /**
   * Generate comprehensive video summary
   */
  private async generateVideoSummary(
    transcript: string,
    title: string,
    keyMoments: VideoMoment[],
    targetLanguage: 'thai' | 'english'
  ): Promise<string> {
    const systemPrompt = `You are a technical writer creating video summaries for documentation.

Create a comprehensive summary that:
- Captures the main purpose and content of the video
- Highlights key processes or procedures covered
- Mentions important steps or demonstrations
- Is written in professional ${targetLanguage === 'thai' ? 'Thai' : 'English'}
- Is suitable for inclusion in technical documentation
- Is between 200-400 words

Focus on information that would be valuable for someone creating a manual or guide.`;

    const keyMomentsText = keyMoments
      .filter(m => m.importance === 'high')
      .map(m => m.description)
      .join('; ');

    const userPrompt = `Create a summary for this video:

Title: ${title}
Key Highlights: ${keyMomentsText}

Transcript:
${transcript.substring(0, 3000)}${transcript.length > 3000 ? '...' : ''}

Write the summary in ${targetLanguage === 'thai' ? 'Thai' : 'English'}.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.5,
      maxTokens: 800
    });

    return response.content;
  }

  /**
   * Extract step-by-step instructions from video content
   */
  private async extractStepInstructions(
    transcript: string,
    keyMoments: VideoMoment[],
    targetLanguage: 'thai' | 'english'
  ): Promise<string[]> {
    const systemPrompt = `You are an instruction writer specializing in creating clear, actionable steps from video content.

Extract step-by-step instructions that:
- Are clear and actionable
- Follow logical sequence
- Include important details and warnings
- Are written in ${targetLanguage === 'thai' ? 'Thai' : 'English'}
- Are suitable for technical documentation
- Can be followed by someone who hasn't seen the video

Return as JSON array of strings:
{
  "steps": ["Step 1 description", "Step 2 description", ...]
}`;

    const stepMoments = keyMoments
      .filter(m => m.actionType === 'step' || m.actionType === 'demonstration')
      .map(m => `${Math.floor(m.timestamp / 60)}:${(m.timestamp % 60).toString().padStart(2, '0')} - ${m.description}`)
      .join('\n');

    const userPrompt = `Extract step-by-step instructions from this video:

Key Step Moments:
${stepMoments}

Full Transcript:
${transcript}

Create numbered steps in ${targetLanguage === 'thai' ? 'Thai' : 'English'}.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.3,
      maxTokens: 2000
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.steps || [];
    } catch (error) {
      // Fallback: extract steps from response text
      return response.content
        .split('\n')
        .filter(line => line.trim().length > 0 && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
  }

  /**
   * Recommend optimal timestamps for screenshot capture
   */
  private recommendScreenshotTimestamps(
    keyMoments: VideoMoment[],
    transitions: TransitionAnalysis[],
    segments: VideoSegment[]
  ): number[] {
    const candidates: { timestamp: number; score: number }[] = [];

    // Add key moments as candidates
    keyMoments.forEach(moment => {
      let score = 0;
      
      // Score based on importance and action type
      switch (moment.importance) {
        case 'high': score += 10; break;
        case 'medium': score += 6; break;
        case 'low': score += 3; break;
      }

      switch (moment.actionType) {
        case 'step': score += 8; break;
        case 'demonstration': score += 7; break;
        case 'result': score += 5; break;
        case 'explanation': score += 2; break;
      }

      candidates.push({ timestamp: moment.timestamp, score });
    });

    // Add transition points as candidates
    transitions.forEach(transition => {
      const score = transition.confidence * 5;
      candidates.push({ timestamp: transition.timestamp, score });
    });

    // Add segment boundaries as candidates
    segments.forEach(segment => {
      const startScore = segment.importance === 'high' ? 6 : 3;
      const endScore = segment.importance === 'high' ? 4 : 2;
      
      candidates.push({ timestamp: segment.startTime, score: startScore });
      candidates.push({ timestamp: segment.endTime, score: endScore });
    });

    // Sort by score and remove duplicates
    candidates.sort((a, b) => b.score - a.score);

    const selected: number[] = [];
    for (const candidate of candidates) {
      if (selected.length >= 15) break; // Limit to 15 screenshots

      // Check if too close to existing selection
      const tooClose = selected.some(timestamp => 
        Math.abs(timestamp - candidate.timestamp) < 15
      );

      if (!tooClose) {
        selected.push(candidate.timestamp);
      }
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Create fallback key moments when AI parsing fails
   */
  private createFallbackKeyMoments(
    transcript: string,
    duration: number,
    options: VideoAnalysisOptions
  ): VideoMoment[] {
    const moments: VideoMoment[] = [];
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    // Create moments at regular intervals
    const intervalCount = Math.min(options.maxKeyMoments, Math.max(3, Math.floor(duration / 60)));
    
    for (let i = 0; i < intervalCount && i < sentences.length; i++) {
      const timestamp = Math.floor((duration / intervalCount) * i);
      const sentence = sentences[Math.floor((sentences.length / intervalCount) * i)];
      
      moments.push({
        timestamp,
        description: sentence.trim().substring(0, 120) + (sentence.length > 120 ? '...' : ''),
        importance: i === 0 || i === intervalCount - 1 ? 'high' : 'medium',
        actionType: this.guessActionType(sentence)
      });
    }

    return moments;
  }

  /**
   * Create fallback segments when AI parsing fails
   */
  private createFallbackSegments(keyMoments: VideoMoment[], duration: number): VideoSegment[] {
    const segments: VideoSegment[] = [];
    const segmentCount = Math.min(5, Math.max(2, Math.floor(duration / 120))); // 2-minute segments
    
    for (let i = 0; i < segmentCount; i++) {
      const startTime = Math.floor((duration / segmentCount) * i);
      const endTime = Math.floor((duration / segmentCount) * (i + 1));
      
      const segmentMoments = keyMoments.filter(m => 
        m.timestamp >= startTime && m.timestamp < endTime
      );

      segments.push({
        startTime,
        endTime,
        title: `ส่วนที่ ${i + 1}`,
        description: `เนื้อหาตั้งแต่นาทีที่ ${Math.floor(startTime / 60)} ถึง ${Math.floor(endTime / 60)}`,
        keyPoints: segmentMoments.map(m => m.description.substring(0, 50) + '...'),
        actionItems: segmentMoments.filter(m => m.actionType === 'step').map(m => m.description),
        importance: segmentMoments.some(m => m.importance === 'high') ? 'high' : 'medium'
      });
    }

    return segments;
  }

  /**
   * Guess action type from sentence content
   */
  private guessActionType(sentence: string): VideoMoment['actionType'] {
    const stepKeywords = /\b(step|click|press|open|select|first|next|then)\b/i;
    const explanationKeywords = /\b(because|why|reason|explain|understand)\b/i;
    const demonstrationKeywords = /\b(show|see|look|watch|here|this)\b/i;
    const resultKeywords = /\b(result|done|complete|finish|final)\b/i;

    if (stepKeywords.test(sentence)) return 'step';
    if (demonstrationKeywords.test(sentence)) return 'demonstration';
    if (resultKeywords.test(sentence)) return 'result';
    if (explanationKeywords.test(sentence)) return 'explanation';
    
    return 'explanation';
  }
}

// Export singleton instance
export const videoAnalyzer = new VideoAnalyzer();