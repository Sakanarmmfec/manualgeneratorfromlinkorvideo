import { 
  ExtractedContent, 
  ProcessedContent, 
  DocumentSection, 
  SourceInfo,
  APIKeyError 
} from '@/types';
import { llmConnector } from './LLMConnector';
import { processedContentUtils } from './ProcessedContentModel';
import { apiKeyManager } from '@/lib/config/APIKeyManager';

/**
 * ContentProcessor handles translation and content organization using gpt-4o
 * Transforms extracted content into structured, refined Thai documentation
 */
export class ContentProcessor {
  
  /**
   * Process extracted content into structured Thai documentation
   */
  public async processContent(
    extractedContent: ExtractedContent,
    documentType: 'user_manual' | 'product_document' = 'user_manual',
    customInstructions?: string
  ): Promise<ProcessedContent> {
    try {
      // Check API key status and handle fallback if needed
      await this.ensureAPIKeyAvailable();

      // Step 1: Translate content to Thai
      const translatedContent = await this.translateContentWithFallback(
        extractedContent.textContent,
        extractedContent.contentType,
        customInstructions
      );

      // Step 2: Organize content into structured sections
      const organizedSections = await this.organizeIntoSectionsWithFallback(
        translatedContent,
        documentType,
        extractedContent.contentType
      );

      // Step 3: Refine and polish the content
      const refinedContent = await this.refineContentWithFallback(
        organizedSections,
        documentType
      );

      // Step 4: Create ProcessedContent using the model utility
      const processedContent = processedContentUtils.fromExtractedContent(
        extractedContent,
        translatedContent,
        refinedContent
      );

      // Step 5: Update with organized sections
      const finalProcessedContent = {
        ...processedContent,
        organizedSections
      };

      // Step 6: Calculate and update quality score
      const qualityScore = this.calculateQualityScore(
        extractedContent,
        organizedSections,
        refinedContent
      );

      return processedContentUtils.updateQualityScore(finalProcessedContent, {
        hasImages: extractedContent.images.length > 0,
        hasProperStructure: organizedSections.length > 1,
        contentCompleteness: qualityScore
      });

    } catch (error) {
      if (error instanceof APIKeyError) {
        // Try to handle API key exhaustion
        if (error.isRecoverable && error.code === 'TOKEN_EXHAUSTED') {
          throw new APIKeyError(
            'API tokens exhausted. Please provide your own API key to continue.',
            'TOKEN_EXHAUSTED_USER_KEY_REQUIRED',
            true
          );
        }
        throw error;
      }
      
      throw new Error(`Content processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ensure API key is available, handle fallback if needed
   */
  private async ensureAPIKeyAvailable(): Promise<void> {
    const keyStatus = apiKeyManager.getKeyStatus();
    
    if (keyStatus.status === 'exhausted' || keyStatus.status === 'invalid') {
      // Check if user has provided a fallback key
      if (!keyStatus.hasFallback) {
        throw new APIKeyError(
          'Primary API key is exhausted and no user fallback key is available',
          'TOKEN_EXHAUSTED_USER_KEY_REQUIRED',
          true
        );
      }
      
      // Switch to fallback key
      apiKeyManager.switchToFallback();
    }
  }

  /**
   * Translate content with API key fallback handling
   */
  private async translateContentWithFallback(
    content: string,
    contentType: 'website' | 'youtube_video',
    customInstructions?: string
  ): Promise<string> {
    try {
      return await this.translateContent(content, contentType, customInstructions);
    } catch (error) {
      if (error instanceof APIKeyError && error.isRecoverable) {
        // Try with fallback key if available
        const currentKeyStatus = apiKeyManager.getKeyStatus();
        if (currentKeyStatus.hasFallback) {
          apiKeyManager.switchToFallback();
          return await this.translateContent(content, contentType, customInstructions);
        }
      }
      throw error;
    }
  }

  /**
   * Organize content with API key fallback handling
   */
  private async organizeIntoSectionsWithFallback(
    translatedContent: string,
    documentType: 'user_manual' | 'product_document',
    contentType: 'website' | 'youtube_video'
  ): Promise<DocumentSection[]> {
    try {
      return await this.organizeIntoSections(translatedContent, documentType, contentType);
    } catch (error) {
      if (error instanceof APIKeyError && error.isRecoverable) {
        // Try with fallback key if available
        const currentKeyStatus = apiKeyManager.getKeyStatus();
        if (currentKeyStatus.hasFallback) {
          apiKeyManager.switchToFallback();
          return await this.organizeIntoSections(translatedContent, documentType, contentType);
        }
      }
      throw error;
    }
  }

  /**
   * Refine content with API key fallback handling
   */
  private async refineContentWithFallback(
    sections: DocumentSection[],
    documentType: 'user_manual' | 'product_document'
  ): Promise<string> {
    try {
      return await this.refineContent(sections, documentType);
    } catch (error) {
      if (error instanceof APIKeyError && error.isRecoverable) {
        // Try with fallback key if available
        const currentKeyStatus = apiKeyManager.getKeyStatus();
        if (currentKeyStatus.hasFallback) {
          apiKeyManager.switchToFallback();
          return await this.refineContent(sections, documentType);
        }
      }
      throw error;
    }
  }

  /**
   * Translate content to natural Thai language
   */
  private async translateContent(
    content: string,
    contentType: 'website' | 'youtube_video',
    customInstructions?: string
  ): Promise<string> {
    const systemPrompt = `You are a professional Thai translator specializing in technical documentation. 
Your task is to translate content into natural, professional Thai while maintaining technical accuracy.

Guidelines:
- Use formal but accessible Thai language appropriate for technical documentation
- Maintain technical terms in English when commonly used (e.g., "software", "API", "URL")
- Adapt sentence structure to be natural in Thai
- Preserve important formatting and structure markers
- Ensure cultural appropriateness for Thai readers
- Keep the tone professional and informative

Content type: ${contentType}
${customInstructions ? `Additional instructions: ${customInstructions}` : ''}`;

    const userPrompt = `Please translate the following content to Thai:

${content}`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.3, // Lower temperature for more consistent translation
      maxTokens: 4000
    });

    return response.content;
  }

  /**
   * Organize translated content into structured document sections
   */
  private async organizeIntoSections(
    translatedContent: string,
    documentType: 'user_manual' | 'product_document',
    contentType: 'website' | 'youtube_video'
  ): Promise<DocumentSection[]> {
    const sectionTypes = documentType === 'user_manual' 
      ? ['introduction', 'installation', 'usage', 'troubleshooting']
      : ['introduction', 'features', 'specifications'];

    const systemPrompt = `You are a technical documentation specialist. Your task is to organize translated Thai content into structured sections for a ${documentType}.

Required sections for ${documentType}:
${sectionTypes.map(type => `- ${type}`).join('\n')}

Guidelines:
- Create clear, logical section hierarchy
- Ensure smooth transitions between sections
- Include relevant subsections where appropriate
- Maintain professional Thai language
- Preserve important technical information
- Adapt content structure based on source type (${contentType})

Return the organized content as a JSON array of sections with this structure:
{
  "sections": [
    {
      "id": "unique_id",
      "title": "Section Title in Thai",
      "content": "Section content in Thai",
      "sectionType": "section_type",
      "subsections": [
        {
          "id": "subsection_id",
          "title": "Subsection Title",
          "content": "Subsection content",
          "sectionType": "section_type",
          "subsections": [],
          "images": []
        }
      ],
      "images": []
    }
  ]
}`;

    const userPrompt = `Please organize this translated Thai content into structured sections:

${translatedContent}`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 4000
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.sections || [];
    } catch (error) {
      // Fallback: create basic sections if JSON parsing fails
      console.warn('Failed to parse structured sections, creating fallback sections');
      return this.createFallbackSections(translatedContent, documentType);
    }
  }

  /**
   * Create fallback sections when structured parsing fails
   */
  private createFallbackSections(
    content: string,
    documentType: 'user_manual' | 'product_document'
  ): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const contentParts = content.split('\n\n').filter(part => part.trim());
    
    if (documentType === 'user_manual') {
      sections.push({
        id: 'introduction',
        title: 'บทนำ',
        content: contentParts[0] || content.substring(0, 500),
        subsections: [],
        images: [],
        sectionType: 'introduction'
      });

      if (contentParts.length > 1) {
        sections.push({
          id: 'usage',
          title: 'การใช้งาน',
          content: contentParts.slice(1).join('\n\n'),
          subsections: [],
          images: [],
          sectionType: 'usage'
        });
      }
    } else {
      sections.push({
        id: 'introduction',
        title: 'ข้อมูลผลิตภัณฑ์',
        content: content,
        subsections: [],
        images: [],
        sectionType: 'introduction'
      });
    }

    return sections;
  }

  /**
   * Refine and polish the organized content
   */
  private async refineContent(
    sections: DocumentSection[],
    documentType: 'user_manual' | 'product_document'
  ): Promise<string> {
    const systemPrompt = `You are a professional technical writer specializing in Thai documentation. 
Your task is to refine and polish organized content sections to create a cohesive, professional document.

Guidelines:
- Ensure consistent tone and style throughout
- Improve readability and flow between sections
- Add appropriate transitions and connections
- Maintain technical accuracy
- Use professional Thai language
- Ensure logical progression of information
- Add any necessary clarifications or context

Document type: ${documentType}`;

    const sectionsText = sections.map(section => {
      let text = `## ${section.title}\n${section.content}`;
      if (section.subsections.length > 0) {
        text += '\n' + section.subsections.map(sub => 
          `### ${sub.title}\n${sub.content}`
        ).join('\n');
      }
      return text;
    }).join('\n\n');

    const userPrompt = `Please refine and polish this organized content to create a cohesive, professional document:

${sectionsText}`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.5,
      maxTokens: 4000
    });

    return response.content;
  }

  /**
   * Calculate content quality score based on various factors
   */
  private calculateQualityScore(
    extractedContent: ExtractedContent,
    organizedSections: DocumentSection[],
    refinedContent: string
  ): number {
    let score = 0;
    
    // Content completeness (0-30 points)
    if (extractedContent.textContent.length > 500) score += 10;
    if (extractedContent.textContent.length > 1500) score += 10;
    if (extractedContent.textContent.length > 3000) score += 10;
    
    // Section organization (0-25 points)
    score += Math.min(organizedSections.length * 5, 25);
    
    // Content depth (0-20 points)
    const hasSubsections = organizedSections.some(s => s.subsections.length > 0);
    if (hasSubsections) score += 10;
    
    const avgSectionLength = organizedSections.reduce((sum, s) => sum + s.content.length, 0) / organizedSections.length;
    if (avgSectionLength > 200) score += 10;
    
    // Refinement quality (0-15 points)
    if (refinedContent.length > extractedContent.textContent.length * 0.8) score += 8;
    if (refinedContent.includes('##') || refinedContent.includes('###')) score += 7;
    
    // Image availability (0-10 points)
    if (extractedContent.images.length > 0) score += 5;
    if (extractedContent.images.length > 3) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Create source attribution information
   */
  private createSourceAttribution(extractedContent: ExtractedContent): SourceInfo {
    return {
      originalUrl: extractedContent.url,
      extractionDate: extractedContent.extractionTimestamp,
      contentType: extractedContent.contentType,
      attribution: `เอกสารนี้สร้างขึ้นจากข้อมูลที่ได้จาก: ${extractedContent.url} เมื่อวันที่ ${extractedContent.extractionTimestamp.toLocaleDateString('th-TH')}`
    };
  }

  /**
   * Process content specifically for video content with enhanced structure
   */
  public async processVideoContent(
    extractedContent: ExtractedContent,
    documentType: 'user_manual' | 'product_document' = 'user_manual'
  ): Promise<ProcessedContent> {
    if (extractedContent.contentType !== 'youtube_video' || !extractedContent.videoContent) {
      throw new Error('Invalid content type for video processing');
    }

    const videoContent = extractedContent.videoContent;
    
    // Enhanced processing for video content
    const enhancedTextContent = `
วิดีโอ: ${extractedContent.title}
ระยะเวลา: ${Math.floor(videoContent.duration / 60)} นาที ${videoContent.duration % 60} วินาที

เนื้อหาจากการถอดเสียง:
${videoContent.transcript}

จุดสำคัญในวิดีโอ:
${videoContent.keyMoments.map(moment => 
  `${Math.floor(moment.timestamp / 60)}:${(moment.timestamp % 60).toString().padStart(2, '0')} - ${moment.description}`
).join('\n')}

เนื้อหาเพิ่มเติม:
${extractedContent.textContent}
    `.trim();

    // Process with enhanced content
    const enhancedExtractedContent = {
      ...extractedContent,
      textContent: enhancedTextContent
    };

    return this.processContent(enhancedExtractedContent, documentType);
  }

  /**
   * Process content specifically for website content
   */
  public async processWebsiteContent(
    extractedContent: ExtractedContent,
    documentType: 'user_manual' | 'product_document' = 'product_document'
  ): Promise<ProcessedContent> {
    if (extractedContent.contentType !== 'website') {
      throw new Error('Invalid content type for website processing');
    }

    return this.processContent(extractedContent, documentType);
  }

  /**
   * Process multiple content sources and merge them
   */
  public async processMultipleContents(
    extractedContents: ExtractedContent[],
    documentType: 'user_manual' | 'product_document' = 'user_manual',
    mergeStrategy: 'concatenate' | 'interleave' | 'prioritize' = 'prioritize'
  ): Promise<ProcessedContent> {
    if (extractedContents.length === 0) {
      throw new Error('No content provided for processing');
    }

    if (extractedContents.length === 1) {
      return this.processContent(extractedContents[0], documentType);
    }

    // Process each content separately
    const processedContents: ProcessedContent[] = [];
    
    for (const extractedContent of extractedContents) {
      try {
        const processed = extractedContent.contentType === 'youtube_video'
          ? await this.processVideoContent(extractedContent, documentType)
          : await this.processWebsiteContent(extractedContent, documentType);
        
        processedContents.push(processed);
      } catch (error) {
        console.warn(`Failed to process content from ${extractedContent.url}:`, error);
        // Continue with other content sources
      }
    }

    if (processedContents.length === 0) {
      throw new Error('Failed to process any of the provided content sources');
    }

    // Merge all processed contents
    return processedContentUtils.merge(processedContents, mergeStrategy);
  }

  /**
   * Enhance processed content with additional refinement
   */
  public async enhanceProcessedContent(
    processedContent: ProcessedContent,
    enhancements: {
      addTableOfContents?: boolean;
      improveTransitions?: boolean;
      addConclusion?: boolean;
      enhanceFormatting?: boolean;
    }
  ): Promise<ProcessedContent> {
    try {
      await this.ensureAPIKeyAvailable();

      let enhancedContent = processedContent.refinedContent;

      if (enhancements.addTableOfContents) {
        enhancedContent = await this.addTableOfContents(processedContent);
      }

      if (enhancements.improveTransitions) {
        enhancedContent = await this.improveTransitions(enhancedContent, processedContent.organizedSections);
      }

      if (enhancements.addConclusion) {
        enhancedContent = await this.addConclusion(enhancedContent, processedContent.sourceAttribution);
      }

      if (enhancements.enhanceFormatting) {
        enhancedContent = await this.enhanceFormatting(enhancedContent);
      }

      return {
        ...processedContent,
        refinedContent: enhancedContent,
        qualityScore: Math.min(100, processedContent.qualityScore + 10) // Bonus for enhancements
      };

    } catch (error) {
      if (error instanceof APIKeyError) {
        throw error;
      }
      
      console.warn('Content enhancement failed, returning original content:', error);
      return processedContent;
    }
  }

  /**
   * Add table of contents to processed content
   */
  private async addTableOfContents(processedContent: ProcessedContent): Promise<string> {
    const systemPrompt = `You are a technical writer. Add a professional table of contents to the beginning of this Thai document.

Guidelines:
- Create a clear, numbered table of contents
- Use Thai language for section titles
- Include page numbers or section references
- Format professionally for technical documentation
- Keep it concise and well-organized`;

    const sectionsText = processedContent.organizedSections
      .map((section, index) => `${index + 1}. ${section.title}`)
      .join('\n');

    const userPrompt = `Add a table of contents to this document:

Current Sections:
${sectionsText}

Document Content:
${processedContent.refinedContent}

Please add a professional table of contents at the beginning.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.3,
      maxTokens: 3000
    });

    return response.content;
  }

  /**
   * Improve transitions between sections
   */
  private async improveTransitions(content: string, sections: DocumentSection[]): Promise<string> {
    const systemPrompt = `You are a professional technical writer. Improve the transitions between sections in this Thai document to create better flow and readability.

Guidelines:
- Add smooth transitions between sections
- Ensure logical progression of ideas
- Maintain professional Thai language
- Keep technical accuracy
- Improve overall document coherence`;

    const userPrompt = `Improve the transitions and flow in this document:

${content}

Focus on making the document read more smoothly and professionally.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 4000
    });

    return response.content;
  }

  /**
   * Add conclusion to the document
   */
  private async addConclusion(content: string, sourceAttribution: SourceInfo): Promise<string> {
    const systemPrompt = `You are a technical writer. Add a professional conclusion to this Thai technical document.

Guidelines:
- Summarize key points covered
- Provide final thoughts or recommendations
- Include source attribution naturally
- Use professional Thai language
- Keep it concise but comprehensive`;

    const userPrompt = `Add a professional conclusion to this document:

${content}

Source: ${sourceAttribution.attribution}

Please add an appropriate conclusion that summarizes the document and includes source attribution.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 2000
    });

    return response.content;
  }

  /**
   * Enhance document formatting
   */
  private async enhanceFormatting(content: string): Promise<string> {
    const systemPrompt = `You are a technical document formatter. Enhance the formatting and structure of this Thai document for professional presentation.

Guidelines:
- Improve heading hierarchy and formatting
- Add appropriate bullet points and numbering
- Enhance readability with proper spacing
- Maintain professional appearance
- Keep all content intact while improving presentation`;

    const userPrompt = `Enhance the formatting and structure of this document:

${content}

Focus on improving visual presentation and readability while maintaining all content.`;

    const response = await llmConnector.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.3,
      maxTokens: 4000
    });

    return response.content;
  }
}

// Export singleton instance
export const contentProcessor = new ContentProcessor();