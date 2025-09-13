import { ImageData, DocumentSection } from '../../types';

export interface ImagePlacement {
  imageId: string;
  sectionId: string;
  position: 'top' | 'middle' | 'bottom' | 'inline' | 'sidebar';
  alignment: 'left' | 'center' | 'right';
  caption?: string;
  wrapText: boolean;
  size: 'small' | 'medium' | 'large' | 'full-width';
  priority: number; // Higher number = higher priority
}

export interface PlacementOptions {
  maxImagesPerSection?: number;
  preferredPosition?: 'top' | 'middle' | 'bottom';
  preferredAlignment?: 'left' | 'center' | 'right';
  allowTextWrapping?: boolean;
  prioritizeRelevance?: boolean;
}

export interface PlacementResult {
  placements: ImagePlacement[];
  unplacedImages: ImageData[];
  placementScore: number;
}

export class ImagePlacer {
  private readonly defaultOptions: Required<PlacementOptions> = {
    maxImagesPerSection: 3,
    preferredPosition: 'middle',
    preferredAlignment: 'center',
    allowTextWrapping: true,
    prioritizeRelevance: true
  };

  /**
   * Determine optimal image placement within document sections
   */
  async determineOptimalPlacement(
    images: ImageData[],
    sections: DocumentSection[],
    options: PlacementOptions = {}
  ): Promise<PlacementResult> {
    const config = { ...this.defaultOptions, ...options };
    const placements: ImagePlacement[] = [];
    const unplacedImages: ImageData[] = [];

    try {
      // Note: relevanceScore not available in ImageData interface
      // Using original order for now
      const sortedImages = images;

      // Analyze sections for image placement opportunities
      const sectionAnalysis = this.analyzeSections(sections);

      for (const image of sortedImages) {
        const placement = await this.findBestPlacement(
          image,
          sectionAnalysis,
          placements,
          config
        );

        if (placement) {
          placements.push(placement);
        } else {
          unplacedImages.push(image);
        }
      }

      return {
        placements,
        unplacedImages,
        placementScore: this.calculatePlacementScore(placements, sections)
      };
    } catch (error) {
      console.error('Error in image placement:', error);
      return {
        placements: [],
        unplacedImages: images,
        placementScore: 0
      };
    }
  }

  private analyzeSections(sections: DocumentSection[]): SectionAnalysis[] {
    return sections.map(section => ({
      section,
      contentLength: section.content.length,
      hasSubsections: section.subsections.length > 0,
      sectionType: section.sectionType,
      imageCapacity: this.calculateImageCapacity(section),
      contentComplexity: this.analyzeContentComplexity(section.content)
    }));
  }

  private calculateImageCapacity(section: DocumentSection): number {
    const baseCapacity = 2;
    const contentLength = section.content.length;
    
    // Longer sections can accommodate more images
    if (contentLength > 2000) return baseCapacity + 2;
    if (contentLength > 1000) return baseCapacity + 1;
    if (contentLength < 300) return Math.max(1, baseCapacity - 1);
    
    return baseCapacity;
  }

  private analyzeContentComplexity(content: string): 'low' | 'medium' | 'high' {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence > 20 || words > 1500) return 'high';
    if (avgWordsPerSentence > 12 || words > 500) return 'medium';
    return 'low';
  }

  private async findBestPlacement(
    image: ImageData,
    sectionAnalysis: SectionAnalysis[],
    existingPlacements: ImagePlacement[],
    config: Required<PlacementOptions>
  ): Promise<ImagePlacement | null> {
    let bestPlacement: ImagePlacement | null = null;
    let bestScore = 0;

    for (const analysis of sectionAnalysis) {
      // Check if section has capacity for more images
      const currentImageCount = existingPlacements.filter(
        p => p.sectionId === analysis.section.id
      ).length;

      if (currentImageCount >= config.maxImagesPerSection) {
        continue;
      }

      // Calculate placement score for this section
      const placementScore = this.calculateSectionPlacementScore(
        image,
        analysis,
        config
      );

      if (placementScore > bestScore) {
        bestScore = placementScore;
        bestPlacement = this.createPlacement(
          image,
          analysis.section,
          currentImageCount,
          config
        );
      }
    }

    return bestPlacement;
  }

  private calculateSectionPlacementScore(
    image: ImageData,
    analysis: SectionAnalysis,
    config: Required<PlacementOptions>
  ): number {
    let score = 0;

    // Base relevance score (default since relevanceScore not available in ImageData)
    score += 0.5 * 40;

    // Section type compatibility
    score += this.getSectionTypeScore(analysis.section.sectionType, image) * 30;

    // Content length compatibility
    if (analysis.contentLength > 500) score += 15;
    if (analysis.contentLength > 1000) score += 10;

    // Prefer sections without existing images
    const hasImages = analysis.section.images && analysis.section.images.length > 0;
    if (!hasImages) score += 20;

    // Content complexity factor
    switch (analysis.contentComplexity) {
      case 'high':
        score += 15; // Complex content benefits from visual aids
        break;
      case 'medium':
        score += 10;
        break;
      case 'low':
        score += 5;
        break;
    }

    return score;
  }

  private getSectionTypeScore(sectionType: string, image: ImageData): number {
    const imageKeywords = `${image.alt} ${image.caption || ''}`.toLowerCase();
    
    switch (sectionType) {
      case 'features':
        if (imageKeywords.includes('feature') || imageKeywords.includes('function')) {
          return 1.0;
        }
        return 0.8;
      
      case 'installation':
        if (imageKeywords.includes('install') || imageKeywords.includes('setup')) {
          return 1.0;
        }
        return 0.6;
      
      case 'usage':
        if (imageKeywords.includes('use') || imageKeywords.includes('step')) {
          return 1.0;
        }
        return 0.9;
      
      case 'troubleshooting':
        if (imageKeywords.includes('error') || imageKeywords.includes('problem')) {
          return 1.0;
        }
        return 0.5;
      
      case 'specifications':
        if (imageKeywords.includes('spec') || imageKeywords.includes('technical')) {
          return 1.0;
        }
        return 0.7;
      
      default:
        return 0.6;
    }
  }

  private createPlacement(
    image: ImageData,
    section: DocumentSection,
    currentImageCount: number,
    config: Required<PlacementOptions>
  ): ImagePlacement {
    return {
      imageId: this.generateImageId(image),
      sectionId: section.id,
      position: this.determinePosition(section, currentImageCount, config),
      alignment: this.determineAlignment(image, config),
      caption: this.generateCaption(image, section),
      wrapText: config.allowTextWrapping && this.shouldWrapText(image, section),
      size: this.determineSize(image, section),
      priority: this.calculatePriority(image, section)
    };
  }

  private generateImageId(image: ImageData): string {
    // Generate a unique ID based on image URL
    return `img_${image.url.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'}`;
  }

  private determinePosition(
    section: DocumentSection,
    currentImageCount: number,
    config: Required<PlacementOptions>
  ): 'top' | 'middle' | 'bottom' | 'inline' | 'sidebar' {
    // First image in section goes to preferred position
    if (currentImageCount === 0) {
      return config.preferredPosition;
    }

    // Distribute subsequent images
    const positions: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom'];
    return positions[currentImageCount % positions.length];
  }

  private determineAlignment(
    image: ImageData,
    config: Required<PlacementOptions>
  ): 'left' | 'center' | 'right' {
    // Use preferred alignment, but consider image aspect ratio
    const width = image.width || 800;
    const height = image.height || 600;
    const aspectRatio = width / height;
    
    if (aspectRatio > 2) { // Wide images
      return 'center';
    }
    
    if (aspectRatio < 0.7) { // Tall images
      return config.preferredAlignment === 'center' ? 'center' : 'left';
    }
    
    return config.preferredAlignment;
  }

  private generateCaption(image: ImageData, section: DocumentSection): string {
    if (image.alt && image.alt.trim()) {
      return image.alt;
    }
    
    if (image.caption && image.caption.trim()) {
      return image.caption;
    }
    
    // Generate caption based on section type
    switch (section.sectionType) {
      case 'features':
        return 'Product feature illustration';
      case 'installation':
        return 'Installation step';
      case 'usage':
        return 'Usage example';
      case 'troubleshooting':
        return 'Troubleshooting guide';
      case 'specifications':
        return 'Technical specification';
      default:
        return 'Product image';
    }
  }

  private shouldWrapText(image: ImageData, section: DocumentSection): boolean {
    // Don't wrap text for large images or in short sections
    const width = image.width || 800;
    const height = image.height || 600;
    const aspectRatio = width / height;
    const isWideImage = aspectRatio > 1.5;
    const isShortSection = section.content.length < 500;
    
    return !isWideImage && !isShortSection;
  }

  private determineSize(image: ImageData, section: DocumentSection): 'small' | 'medium' | 'large' | 'full-width' {
    const width = image.width || 800;
    const height = image.height || 600;
    const aspectRatio = width / height;
    const contentLength = section.content.length;
    
    // Wide images should be larger
    if (aspectRatio > 2) {
      return 'full-width';
    }
    
    // Long sections can accommodate larger images
    if (contentLength > 1500) {
      return 'large';
    }
    
    if (contentLength > 800) {
      return 'medium';
    }
    
    return 'small';
  }

  private calculatePriority(image: ImageData, section: DocumentSection): number {
    let priority = 0.5 * 100; // Default priority since relevanceScore not available
    
    // Boost priority for important sections
    switch (section.sectionType) {
      case 'features':
        priority += 20;
        break;
      case 'usage':
        priority += 15;
        break;
      case 'installation':
        priority += 10;
        break;
      default:
        priority += 5;
        break;
    }
    
    return Math.round(priority);
  }

  private calculatePlacementScore(placements: ImagePlacement[], sections: DocumentSection[]): number {
    if (placements.length === 0) return 0;
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    for (const placement of placements) {
      totalScore += placement.priority;
      maxPossibleScore += 100; // Maximum priority score
    }
    
    // Factor in distribution across sections
    const sectionsWithImages = new Set(placements.map(p => p.sectionId)).size;
    const distributionBonus = (sectionsWithImages / sections.length) * 20;
    
    return Math.min(100, (totalScore / maxPossibleScore) * 80 + distributionBonus);
  }

  /**
   * Generate fallback placements when optimal placement fails
   */
  generateFallbackPlacements(
    images: ImageData[],
    sections: DocumentSection[]
  ): ImagePlacement[] {
    const placements: ImagePlacement[] = [];
    
    // Simple fallback: distribute images evenly across sections
    for (let i = 0; i < images.length && i < sections.length; i++) {
      const image = images[i];
      const section = sections[i % sections.length];
      
      placements.push({
        imageId: this.generateImageId(image),
        sectionId: section.id,
        position: 'middle',
        alignment: 'center',
        caption: image.alt || 'Product image',
        wrapText: true,
        size: 'medium',
        priority: 50
      });
    }
    
    return placements;
  }

  /**
   * Create placeholder placements for missing images
   */
  createPlaceholderPlacements(sections: DocumentSection[]): ImagePlacement[] {
    const placeholders: ImagePlacement[] = [];
    
    for (const section of sections) {
      // Add placeholder for sections that would benefit from images
      if (section.content.length > 500 && section.sectionType !== 'introduction') {
        placeholders.push({
          imageId: `placeholder_${section.id}`,
          sectionId: section.id,
          position: 'middle',
          alignment: 'center',
          caption: '[Image placeholder - manual insertion required]',
          wrapText: false,
          size: 'medium',
          priority: 25
        });
      }
    }
    
    return placeholders;
  }
}

interface SectionAnalysis {
  section: DocumentSection;
  contentLength: number;
  hasSubsections: boolean;
  sectionType: string;
  imageCapacity: number;
  contentComplexity: 'low' | 'medium' | 'high';
}