/**
 * DocumentSection data model and hierarchy management
 * Represents a section within a document with support for nested subsections
 */

export interface ImagePlacement {
  id: string;
  imageUrl: string;
  caption: string;
  position: 'before' | 'after' | 'inline';
  alignment: 'left' | 'center' | 'right';
  width?: number;
  height?: number;
}

export type SectionType = 
  | 'introduction' 
  | 'features' 
  | 'installation' 
  | 'usage' 
  | 'troubleshooting' 
  | 'specifications'
  | 'overview'
  | 'requirements'
  | 'configuration'
  | 'maintenance';

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  subsections: DocumentSection[];
  images: ImagePlacement[];
  sectionType: SectionType;
  level: number; // Hierarchy level (1 = top level, 2 = subsection, etc.)
  order: number; // Order within the same level
  metadata?: {
    sourceUrl?: string;
    generatedAt?: Date;
    wordCount?: number;
    estimatedReadTime?: number;
  };
}

export class DocumentSectionManager {
  /**
   * Creates a new document section with proper hierarchy
   */
  static createSection(
    title: string,
    content: string,
    sectionType: SectionType,
    level: number = 1,
    order: number = 0
  ): DocumentSection {
    return {
      id: this.generateSectionId(title, level),
      title,
      content,
      subsections: [],
      images: [],
      sectionType,
      level,
      order,
      metadata: {
        generatedAt: new Date(),
        wordCount: this.countWords(content),
        estimatedReadTime: this.calculateReadTime(content)
      }
    };
  }

  /**
   * Adds a subsection to a parent section
   */
  static addSubsection(parent: DocumentSection, subsection: DocumentSection): void {
    subsection.level = parent.level + 1;
    subsection.order = parent.subsections.length;
    parent.subsections.push(subsection);
  }

  /**
   * Finds a section by ID in the document hierarchy
   */
  static findSectionById(sections: DocumentSection[], id: string): DocumentSection | null {
    for (const section of sections) {
      if (section.id === id) {
        return section;
      }
      const found = this.findSectionById(section.subsections, id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Gets all sections flattened with their hierarchy levels
   */
  static flattenSections(sections: DocumentSection[]): DocumentSection[] {
    const flattened: DocumentSection[] = [];
    
    const flatten = (sectionList: DocumentSection[]) => {
      for (const section of sectionList) {
        flattened.push(section);
        if (section.subsections.length > 0) {
          flatten(section.subsections);
        }
      }
    };
    
    flatten(sections);
    return flattened;
  }

  /**
   * Reorders sections within the same level
   */
  static reorderSections(sections: DocumentSection[]): DocumentSection[] {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        ...section,
        subsections: this.reorderSections(section.subsections)
      }));
  }

  /**
   * Validates section hierarchy and structure
   */
  static validateHierarchy(sections: DocumentSection[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const validate = (sectionList: DocumentSection[], parentLevel: number = 0) => {
      for (const section of sectionList) {
        // Check level consistency
        if (section.level !== parentLevel + 1) {
          errors.push(`Section "${section.title}" has incorrect level ${section.level}, expected ${parentLevel + 1}`);
        }
        
        // Check for empty content
        if (!section.content.trim()) {
          errors.push(`Section "${section.title}" has empty content`);
        }
        
        // Check subsection levels
        if (section.subsections.length > 0) {
          validate(section.subsections, section.level);
        }
      }
    };
    
    validate(sections);
    return { isValid: errors.length === 0, errors };
  }

  private static generateSectionId(title: string, level: number): string {
    const sanitized = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `section-${level}-${sanitized}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private static calculateReadTime(text: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }
}