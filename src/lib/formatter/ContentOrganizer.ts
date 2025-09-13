/**
 * ContentOrganizer for structuring content into proper sections
 * Handles intelligent content organization and section creation
 */

import { DocumentSection, DocumentSectionManager, SectionType, ImagePlacement } from './DocumentSection';

export interface ContentBlock {
  type: 'text' | 'heading' | 'list' | 'code' | 'image';
  content: string;
  level?: number;
  metadata?: Record<string, any>;
}

export interface OrganizationRules {
  maxSectionLength: number;
  preferredSectionTypes: SectionType[];
  requireIntroduction: boolean;
  requireConclusion: boolean;
  imageDistribution: 'even' | 'content-based' | 'manual';
}

export class ContentOrganizer {
  private rules: OrganizationRules;

  constructor(rules: Partial<OrganizationRules> = {}) {
    this.rules = {
      maxSectionLength: 1000,
      preferredSectionTypes: ['introduction', 'features', 'usage', 'troubleshooting'],
      requireIntroduction: true,
      requireConclusion: false,
      imageDistribution: 'content-based',
      ...rules
    };
  }

  /**
   * Organizes raw content into structured document sections
   */
  organizeContent(
    rawContent: string,
    documentType: 'user_manual' | 'product_document',
    images: ImagePlacement[] = []
  ): DocumentSection[] {
    const contentBlocks = this.parseContentBlocks(rawContent);
    const sections = this.createSectionsFromBlocks(contentBlocks, documentType);
    const organizedSections = this.applySectionHierarchy(sections);
    const sectionsWithImages = this.distributeImages(organizedSections, images);
    
    return this.validateAndOptimize(sectionsWithImages);
  }

  /**
   * Parses raw content into structured blocks
   */
  private parseContentBlocks(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect headings
      if (line.match(/^#{1,6}\s/)) {
        const level = (line.match(/^#+/) || [''])[0].length;
        blocks.push({
          type: 'heading',
          content: line.replace(/^#+\s*/, ''),
          level
        });
      }
      // Detect lists
      else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        const listItems = [line];
        // Collect consecutive list items
        while (i + 1 < lines.length && lines[i + 1].match(/^[-*+\d]/)) {
          listItems.push(lines[++i].trim());
        }
        blocks.push({
          type: 'list',
          content: listItems.join('\n')
        });
      }
      // Detect code blocks
      else if (line.startsWith('```')) {
        const codeLines = [];
        i++; // Skip opening ```
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        blocks.push({
          type: 'code',
          content: codeLines.join('\n')
        });
      }
      // Regular text
      else {
        // Combine consecutive text lines into paragraphs
        const textLines = [line];
        while (i + 1 < lines.length && 
               !lines[i + 1].match(/^#{1,6}\s/) && 
               !lines[i + 1].match(/^[-*+\d]/) &&
               !lines[i + 1].startsWith('```') &&
               lines[i + 1].trim()) {
          textLines.push(lines[++i].trim());
        }
        blocks.push({
          type: 'text',
          content: textLines.join(' ')
        });
      }
    }

    return blocks;
  }

  /**
   * Creates sections based on document type and content blocks
   */
  private createSectionsFromBlocks(
    blocks: ContentBlock[],
    documentType: 'user_manual' | 'product_document'
  ): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const sectionOrder = this.getSectionOrder(documentType);

    // Add introduction if required
    if (this.rules.requireIntroduction) {
      const introContent = this.extractIntroductionContent(blocks);
      if (introContent) {
        sections.push(DocumentSectionManager.createSection(
          'Introduction',
          introContent,
          'introduction',
          1,
          0
        ));
      }
    }

    // Group blocks into sections based on headings and content
    let currentSection: DocumentSection | null = null;
    let sectionContent: string[] = [];
    let sectionOrder_index = this.rules.requireIntroduction ? 1 : 0;

    for (const block of blocks) {
      if (block.type === 'heading' && block.level === 1) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          currentSection.content = sectionContent.join('\n\n');
          sections.push(currentSection);
        }

        // Start new section
        const sectionType = this.determineSectionType(block.content, documentType);
        currentSection = DocumentSectionManager.createSection(
          block.content,
          '',
          sectionType,
          1,
          sectionOrder_index++
        );
        sectionContent = [];
      } else if (block.type === 'heading' && block.level && block.level > 1) {
        // Save current section content before creating subsection
        if (currentSection && sectionContent.length > 0) {
          currentSection.content = sectionContent.join('\n\n');
          sectionContent = [];
        }
        
        // Handle subsections
        if (currentSection) {
          const subsection = DocumentSectionManager.createSection(
            block.content,
            '',
            this.determineSectionType(block.content, documentType),
            block.level,
            currentSection.subsections.length
          );
          DocumentSectionManager.addSubsection(currentSection, subsection);
        }
      } else {
        // Add content to current section or subsection
        if (currentSection && currentSection.subsections.length > 0) {
          // Add to the last subsection
          const lastSubsection = currentSection.subsections[currentSection.subsections.length - 1];
          if (!lastSubsection.content) {
            lastSubsection.content = block.content;
          } else {
            lastSubsection.content += '\n\n' + block.content;
          }
        } else {
          // Add to current section
          sectionContent.push(block.content);
        }
      }
    }

    // Add final section
    if (currentSection && sectionContent.length > 0) {
      currentSection.content = sectionContent.join('\n\n');
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Determines section type based on content and document type
   */
  private determineSectionType(title: string, documentType: string): SectionType {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('introduction') || titleLower.includes('overview')) {
      return 'introduction';
    }
    if (titleLower.includes('feature') || titleLower.includes('capability')) {
      return 'features';
    }
    if (titleLower.includes('install') || titleLower.includes('setup')) {
      return 'installation';
    }
    if (titleLower.includes('usage') || titleLower.includes('how to') || titleLower.includes('using')) {
      return 'usage';
    }
    if (titleLower.includes('troubleshoot') || titleLower.includes('problem') || titleLower.includes('issue')) {
      return 'troubleshooting';
    }
    if (titleLower.includes('specification') || titleLower.includes('technical') || titleLower.includes('spec')) {
      return 'specifications';
    }
    if (titleLower.includes('requirement') || titleLower.includes('prerequisite')) {
      return 'requirements';
    }
    if (titleLower.includes('configuration') || titleLower.includes('config') || titleLower.includes('setting')) {
      return 'configuration';
    }
    if (titleLower.includes('maintenance') || titleLower.includes('care')) {
      return 'maintenance';
    }

    // Default based on document type
    return documentType === 'user_manual' ? 'usage' : 'features';
  }

  /**
   * Gets the preferred section order for document type
   */
  private getSectionOrder(documentType: 'user_manual' | 'product_document'): SectionType[] {
    if (documentType === 'user_manual') {
      return ['introduction', 'requirements', 'installation', 'configuration', 'usage', 'troubleshooting', 'maintenance'];
    } else {
      return ['introduction', 'features', 'specifications', 'requirements', 'usage', 'troubleshooting'];
    }
  }

  /**
   * Extracts introduction content from blocks
   */
  private extractIntroductionContent(blocks: ContentBlock[]): string | null {
    // Look for first few text blocks that could serve as introduction
    const introBlocks = blocks
      .filter(block => block.type === 'text')
      .slice(0, 2);
    
    if (introBlocks.length > 0) {
      return introBlocks.map(block => block.content).join('\n\n');
    }
    
    return null;
  }

  /**
   * Applies proper section hierarchy and nesting
   */
  private applySectionHierarchy(sections: DocumentSection[]): DocumentSection[] {
    // Sort sections by preferred order
    const sectionOrder = this.getSectionOrder('user_manual'); // Default order
    
    return sections.sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a.sectionType);
      const bIndex = sectionOrder.indexOf(b.sectionType);
      
      if (aIndex === -1 && bIndex === -1) return a.order - b.order;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    }).map((section, index) => ({
      ...section,
      order: index
    }));
  }

  /**
   * Distributes images across sections based on content relevance
   */
  private distributeImages(sections: DocumentSection[], images: ImagePlacement[]): DocumentSection[] {
    if (images.length === 0) return sections;

    switch (this.rules.imageDistribution) {
      case 'even':
        return this.distributeImagesEvenly(sections, images);
      case 'content-based':
        return this.distributeImagesBasedOnContent(sections, images);
      default:
        return sections; // Manual distribution - images already assigned
    }
  }

  /**
   * Distributes images evenly across sections
   */
  private distributeImagesEvenly(sections: DocumentSection[], images: ImagePlacement[]): DocumentSection[] {
    const imagesPerSection = Math.ceil(images.length / sections.length);
    
    return sections.map((section, index) => {
      const startIndex = index * imagesPerSection;
      const endIndex = Math.min(startIndex + imagesPerSection, images.length);
      
      return {
        ...section,
        images: images.slice(startIndex, endIndex)
      };
    });
  }

  /**
   * Distributes images based on content relevance
   */
  private distributeImagesBasedOnContent(sections: DocumentSection[], images: ImagePlacement[]): DocumentSection[] {
    return sections.map(section => {
      // Simple relevance matching based on keywords
      const relevantImages = images.filter(image => {
        const imageKeywords = image.caption.toLowerCase().split(/\s+/);
        const sectionKeywords = (section.title + ' ' + section.content).toLowerCase().split(/\s+/);
        
        return imageKeywords.some(keyword => 
          sectionKeywords.some(sectionKeyword => 
            sectionKeyword.includes(keyword) || keyword.includes(sectionKeyword)
          )
        );
      });
      
      return {
        ...section,
        images: relevantImages.slice(0, 3) // Limit to 3 images per section
      };
    });
  }

  /**
   * Validates and optimizes the organized sections
   */
  private validateAndOptimize(sections: DocumentSection[]): DocumentSection[] {
    const validation = DocumentSectionManager.validateHierarchy(sections);
    
    if (!validation.isValid) {
      console.warn('Section hierarchy validation failed:', validation.errors);
    }

    // Optimize section lengths
    return sections.map(section => this.optimizeSectionLength(section));
  }

  /**
   * Optimizes section length by splitting if too long
   */
  private optimizeSectionLength(section: DocumentSection): DocumentSection {
    if (section.content.length <= this.rules.maxSectionLength) {
      return section;
    }

    // Split long sections into subsections
    const sentences = section.content.split(/[.!?]+/).filter(s => s.trim());
    const midPoint = Math.floor(sentences.length / 2);
    
    const firstHalf = sentences.slice(0, midPoint).join('. ') + '.';
    const secondHalf = sentences.slice(midPoint).join('. ') + '.';

    const subsection = DocumentSectionManager.createSection(
      `${section.title} (continued)`,
      secondHalf,
      section.sectionType,
      section.level + 1,
      0
    );

    return {
      ...section,
      content: firstHalf,
      subsections: [subsection, ...section.subsections]
    };
  }
}