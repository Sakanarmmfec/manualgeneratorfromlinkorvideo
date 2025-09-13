import { 
  ProcessedContent, 
  DocumentSection, 
  SourceInfo, 
  ExtractedContent,
  ImagePlacement 
} from '@/types';

/**
 * ProcessedContentModel provides utilities for creating and managing ProcessedContent
 * with source attribution for multiple content types
 */
export class ProcessedContentModel {
  
  /**
   * Create a new ProcessedContent instance with proper initialization
   */
  public static create(
    translatedContent: string,
    organizedSections: DocumentSection[],
    refinedContent: string,
    sourceAttribution: SourceInfo,
    qualityScore: number = 0
  ): ProcessedContent {
    // Clamp quality score first
    const clampedQualityScore = Math.max(0, Math.min(100, qualityScore));
    
    const processedContent = {
      translatedContent,
      organizedSections,
      refinedContent,
      sourceAttribution,
      qualityScore: clampedQualityScore
    };

    // Validate inputs
    this.validateProcessedContent(processedContent);

    return processedContent;
  }

  /**
   * Create ProcessedContent from ExtractedContent with minimal processing
   */
  public static fromExtractedContent(
    extractedContent: ExtractedContent,
    translatedContent?: string,
    refinedContent?: string
  ): ProcessedContent {
    const sourceAttribution = this.createSourceAttribution(extractedContent);
    
    // Use provided content or fallback to original
    const finalTranslatedContent = translatedContent || extractedContent.textContent;
    const finalRefinedContent = refinedContent || finalTranslatedContent;
    
    // Create basic sections if none provided
    const organizedSections = this.createBasicSections(finalTranslatedContent, extractedContent.contentType);
    
    // Calculate basic quality score
    const qualityScore = this.calculateBasicQualityScore(extractedContent, organizedSections);

    return this.create(
      finalTranslatedContent,
      organizedSections,
      finalRefinedContent,
      sourceAttribution,
      qualityScore
    );
  }

  /**
   * Merge multiple ProcessedContent instances (useful for multi-source documents)
   */
  public static merge(
    processedContents: ProcessedContent[],
    mergeStrategy: 'concatenate' | 'interleave' | 'prioritize' = 'concatenate'
  ): ProcessedContent {
    if (processedContents.length === 0) {
      throw new Error('Cannot merge empty array of ProcessedContent');
    }

    if (processedContents.length === 1) {
      return processedContents[0];
    }

    const mergedTranslatedContent = processedContents
      .map(pc => pc.translatedContent)
      .join('\n\n---\n\n');

    const mergedSections = this.mergeSections(processedContents, mergeStrategy);
    
    const mergedRefinedContent = processedContents
      .map(pc => pc.refinedContent)
      .join('\n\n---\n\n');

    const mergedSourceAttribution = this.mergeSourceAttributions(
      processedContents.map(pc => pc.sourceAttribution)
    );

    const averageQualityScore = processedContents.reduce(
      (sum, pc) => sum + pc.qualityScore, 0
    ) / processedContents.length;

    return this.create(
      mergedTranslatedContent,
      mergedSections,
      mergedRefinedContent,
      mergedSourceAttribution,
      averageQualityScore
    );
  }

  /**
   * Add image placements to sections
   */
  public static addImagePlacements(
    processedContent: ProcessedContent,
    imagePlacements: { sectionId: string; images: ImagePlacement[] }[]
  ): ProcessedContent {
    const updatedSections = processedContent.organizedSections.map(section => {
      const placement = imagePlacements.find(p => p.sectionId === section.id);
      if (placement) {
        return {
          ...section,
          images: [...section.images, ...placement.images]
        };
      }
      return section;
    });

    return {
      ...processedContent,
      organizedSections: updatedSections
    };
  }

  /**
   * Update quality score based on additional factors
   */
  public static updateQualityScore(
    processedContent: ProcessedContent,
    additionalFactors: {
      hasImages?: boolean;
      hasProperStructure?: boolean;
      languageQuality?: number; // 0-100
      contentCompleteness?: number; // 0-100
    }
  ): ProcessedContent {
    let adjustedScore = processedContent.qualityScore;

    if (additionalFactors.hasImages) {
      adjustedScore += 5;
    }

    if (additionalFactors.hasProperStructure) {
      adjustedScore += 10;
    }

    if (additionalFactors.languageQuality !== undefined) {
      adjustedScore = (adjustedScore + additionalFactors.languageQuality) / 2;
    }

    if (additionalFactors.contentCompleteness !== undefined) {
      adjustedScore = (adjustedScore + additionalFactors.contentCompleteness) / 2;
    }

    return {
      ...processedContent,
      qualityScore: Math.max(0, Math.min(100, adjustedScore))
    };
  }

  /**
   * Extract summary from ProcessedContent
   */
  public static extractSummary(
    processedContent: ProcessedContent,
    maxLength: number = 200
  ): string {
    // Try to get summary from introduction section first
    const introSection = processedContent.organizedSections.find(
      section => section.sectionType === 'introduction'
    );

    if (introSection && introSection.content.length <= maxLength) {
      return introSection.content;
    }

    // Fallback to truncated refined content
    const content = processedContent.refinedContent || processedContent.translatedContent;
    if (content.length <= maxLength) {
      return content;
    }

    // Truncate at word boundary
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  /**
   * Validate ProcessedContent structure
   */
  private static validateProcessedContent(content: ProcessedContent): void {
    if (!content.translatedContent || content.translatedContent.trim().length === 0) {
      throw new Error('ProcessedContent must have non-empty translatedContent');
    }

    if (!content.organizedSections || content.organizedSections.length === 0) {
      throw new Error('ProcessedContent must have at least one organized section');
    }

    if (!content.sourceAttribution || !content.sourceAttribution.originalUrl) {
      throw new Error('ProcessedContent must have valid source attribution');
    }

    if (typeof content.qualityScore !== 'number' || content.qualityScore < 0 || content.qualityScore > 100) {
      throw new Error('ProcessedContent qualityScore must be a number between 0 and 100');
    }
  }

  /**
   * Create source attribution from ExtractedContent
   */
  private static createSourceAttribution(extractedContent: ExtractedContent): SourceInfo {
    const contentTypeText = extractedContent.contentType === 'youtube_video' 
      ? 'วิดีโอ YouTube' 
      : 'เว็บไซต์';

    return {
      originalUrl: extractedContent.url,
      extractionDate: extractedContent.extractionTimestamp,
      contentType: extractedContent.contentType,
      attribution: `เอกสารนี้สร้างขึ้นจากข้อมูลที่ได้จาก${contentTypeText}: ${extractedContent.url} เมื่อวันที่ ${extractedContent.extractionTimestamp.toLocaleDateString('th-TH')}`
    };
  }

  /**
   * Create basic sections from content
   */
  private static createBasicSections(
    content: string, 
    contentType: 'website' | 'youtube_video'
  ): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length === 0) {
      // Single section with all content
      sections.push({
        id: 'main-content',
        title: contentType === 'youtube_video' ? 'เนื้อหาจากวิดีโอ' : 'ข้อมูลผลิตภัณฑ์',
        content: content,
        subsections: [],
        images: [],
        sectionType: 'introduction'
      });
    } else if (paragraphs.length === 1) {
      // Single paragraph
      sections.push({
        id: 'introduction',
        title: 'บทนำ',
        content: paragraphs[0],
        subsections: [],
        images: [],
        sectionType: 'introduction'
      });
    } else {
      // Multiple paragraphs - create introduction and content sections
      sections.push({
        id: 'introduction',
        title: 'บทนำ',
        content: paragraphs[0],
        subsections: [],
        images: [],
        sectionType: 'introduction'
      });

      if (paragraphs.length > 1) {
        sections.push({
          id: 'main-content',
          title: contentType === 'youtube_video' ? 'รายละเอียดจากวิดีโอ' : 'รายละเอียดผลิตภัณฑ์',
          content: paragraphs.slice(1).join('\n\n'),
          subsections: [],
          images: [],
          sectionType: contentType === 'youtube_video' ? 'usage' : 'features'
        });
      }
    }

    return sections;
  }

  /**
   * Calculate basic quality score
   */
  private static calculateBasicQualityScore(
    extractedContent: ExtractedContent,
    sections: DocumentSection[]
  ): number {
    let score = 0;

    // Content length scoring (0-30 points)
    const contentLength = extractedContent.textContent.length;
    if (contentLength > 100) score += 10;
    if (contentLength > 500) score += 10;
    if (contentLength > 1500) score += 10;

    // Section organization (0-25 points)
    score += Math.min(sections.length * 8, 25);

    // Content type bonus (0-15 points)
    if (extractedContent.contentType === 'youtube_video' && extractedContent.videoContent) {
      score += 10;
      if (extractedContent.videoContent.keyMoments.length > 0) score += 5;
    }

    // Image availability (0-15 points)
    if (extractedContent.images.length > 0) score += 8;
    if (extractedContent.images.length > 3) score += 7;

    // Metadata completeness (0-15 points)
    if (extractedContent.metadata.title) score += 5;
    if (extractedContent.metadata.description) score += 5;
    if (extractedContent.metadata.tags.length > 0) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Merge sections from multiple ProcessedContent instances
   */
  private static mergeSections(
    processedContents: ProcessedContent[],
    strategy: 'concatenate' | 'interleave' | 'prioritize'
  ): DocumentSection[] {
    const allSections = processedContents.flatMap(pc => pc.organizedSections);
    
    switch (strategy) {
      case 'concatenate':
        return allSections;
        
      case 'interleave':
        // Interleave sections by type
        const sectionsByType: { [key: string]: DocumentSection[] } = {};
        allSections.forEach(section => {
          if (!sectionsByType[section.sectionType]) {
            sectionsByType[section.sectionType] = [];
          }
          sectionsByType[section.sectionType].push(section);
        });
        
        const interleaved: DocumentSection[] = [];
        const types = Object.keys(sectionsByType);
        const maxLength = Math.max(...Object.values(sectionsByType).map(arr => arr.length));
        
        for (let i = 0; i < maxLength; i++) {
          for (const type of types) {
            if (sectionsByType[type][i]) {
              interleaved.push(sectionsByType[type][i]);
            }
          }
        }
        
        return interleaved;
        
      case 'prioritize':
        // Sort by section type priority and quality
        const typePriority = {
          'introduction': 1,
          'features': 2,
          'installation': 3,
          'usage': 4,
          'specifications': 5,
          'troubleshooting': 6
        };
        
        return allSections.sort((a, b) => {
          const aPriority = typePriority[a.sectionType] || 99;
          const bPriority = typePriority[b.sectionType] || 99;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // Secondary sort by content length (longer content first)
          return b.content.length - a.content.length;
        });
        
      default:
        return allSections;
    }
  }

  /**
   * Merge source attributions from multiple sources
   */
  private static mergeSourceAttributions(attributions: SourceInfo[]): SourceInfo {
    const urls = attributions.map(attr => attr.originalUrl);
    const dates = attributions.map(attr => attr.extractionDate);
    const types = attributions.map(attr => attr.contentType);
    
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const uniqueTypes = Array.from(new Set(types));
    
    return {
      originalUrl: urls.join(', '),
      extractionDate: earliestDate,
      contentType: uniqueTypes.join(', '),
      attribution: `เอกสารนี้สร้างขึ้นจากข้อมูลหลายแหล่ง: ${urls.join(', ')} เมื่อวันที่ ${earliestDate.toLocaleDateString('th-TH')}`
    };
  }
}

// Export utility functions for common operations
export const processedContentUtils = {
  create: ProcessedContentModel.create.bind(ProcessedContentModel),
  fromExtractedContent: ProcessedContentModel.fromExtractedContent.bind(ProcessedContentModel),
  merge: ProcessedContentModel.merge.bind(ProcessedContentModel),
  addImagePlacements: ProcessedContentModel.addImagePlacements.bind(ProcessedContentModel),
  updateQualityScore: ProcessedContentModel.updateQualityScore.bind(ProcessedContentModel),
  extractSummary: ProcessedContentModel.extractSummary.bind(ProcessedContentModel)
};