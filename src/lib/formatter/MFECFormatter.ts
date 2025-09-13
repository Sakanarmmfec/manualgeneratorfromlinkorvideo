/**
 * MFECFormatter applying official brand guidelines
 * Main formatter class that coordinates all formatting components
 */

import { DocumentSection, DocumentSectionManager } from './DocumentSection';
import { ContentOrganizer, OrganizationRules } from './ContentOrganizer';
import { StyleApplicator, MFECStyleSettings } from './StyleApplicator';

export interface FormattingOptions {
  documentType: 'user_manual' | 'product_document';
  language: 'thai' | 'english';
  includeTableOfContents: boolean;
  includeSourceAttribution: boolean;
  applyMFECBranding: boolean;
  organizationRules?: Partial<OrganizationRules>;
  customStyles?: Partial<MFECStyleSettings>;
}

export interface SourceAttribution {
  originalUrl: string;
  extractedAt: Date;
  processedBy: string;
  documentVersion: string;
}

export interface FormattedDocument {
  id: string;
  title: string;
  sections: DocumentSection[];
  htmlContent: string;
  cssStyles: string;
  sourceAttribution: SourceAttribution;
  metadata: {
    wordCount: number;
    sectionCount: number;
    imageCount: number;
    generatedAt: Date;
    documentType: string;
    language: string;
  };
}

export class MFECFormatter {
  private contentOrganizer: ContentOrganizer;
  private styleApplicator: StyleApplicator;
  private options: FormattingOptions;

  constructor(options: Partial<FormattingOptions> = {}) {
    this.options = {
      documentType: 'user_manual',
      language: 'thai',
      includeTableOfContents: true,
      includeSourceAttribution: true,
      applyMFECBranding: true,
      ...options
    };

    this.contentOrganizer = new ContentOrganizer(this.options.organizationRules);
    this.styleApplicator = new StyleApplicator();

    if (this.options.customStyles) {
      this.styleApplicator.updateStyles(this.options.customStyles);
    }
  }

  /**
   * Formats content according to MFEC standards
   */
  async formatDocument(
    content: string,
    title: string,
    sourceUrl: string,
    images: any[] = []
  ): Promise<FormattedDocument> {
    // Organize content into sections
    const sections = this.contentOrganizer.organizeContent(
      content,
      this.options.documentType,
      images
    );

    // Apply MFEC formatting to sections
    const formattedSections = this.applyMFECFormatting(sections);

    // Generate HTML content
    const htmlContent = this.generateHTMLContent(formattedSections, title);

    // Generate CSS styles
    const cssStyles = this.generateStyles();

    // Create source attribution
    const sourceAttribution: SourceAttribution = {
      originalUrl: sourceUrl,
      extractedAt: new Date(),
      processedBy: 'MFEC Thai Document Generator',
      documentVersion: '1.0'
    };

    // Calculate metadata
    const metadata = this.calculateMetadata(formattedSections, htmlContent);

    return {
      id: this.generateDocumentId(title),
      title,
      sections: formattedSections,
      htmlContent,
      cssStyles,
      sourceAttribution,
      metadata
    };
  }

  /**
   * Applies MFEC-specific formatting to document sections
   */
  private applyMFECFormatting(sections: DocumentSection[]): DocumentSection[] {
    return sections.map(section => this.formatSection(section));
  }

  /**
   * Formats a single section according to MFEC standards
   */
  private formatSection(section: DocumentSection): DocumentSection {
    // Apply Thai language formatting if needed
    let formattedContent = section.content;
    
    if (this.options.language === 'thai') {
      formattedContent = this.applyThaiFormatting(formattedContent);
    }

    // Apply section-specific formatting based on type
    formattedContent = this.applySectionTypeFormatting(formattedContent, section.sectionType);

    // Format subsections recursively
    const formattedSubsections = section.subsections.map(subsection => 
      this.formatSection(subsection)
    );

    return {
      ...section,
      content: formattedContent,
      subsections: formattedSubsections
    };
  }

  /**
   * Applies Thai language specific formatting
   */
  private applyThaiFormatting(content: string): string {
    // Add proper Thai punctuation and spacing
    let formatted = content;

    // Ensure proper spacing around Thai punctuation
    formatted = formatted.replace(/([ก-๙])([.!?])/g, '$1 $2');
    formatted = formatted.replace(/([.!?])([ก-๙])/g, '$1 $2');

    // Ensure proper line breaks for Thai text
    formatted = formatted.replace(/([ก-๙]{50,})/g, (match) => {
      // Insert soft breaks at appropriate points for long Thai text
      return match.replace(/([ก-๙]{25,}?)(\s)/g, '$1$2\n');
    });

    // Clean up multiple spaces
    formatted = formatted.replace(/\s+/g, ' ').trim();

    return formatted;
  }

  /**
   * Applies formatting specific to section types
   */
  private applySectionTypeFormatting(content: string, sectionType: string): string {
    switch (sectionType) {
      case 'introduction':
        return this.formatIntroduction(content);
      case 'features':
        return this.formatFeatures(content);
      case 'installation':
        return this.formatInstallation(content);
      case 'usage':
        return this.formatUsage(content);
      case 'troubleshooting':
        return this.formatTroubleshooting(content);
      case 'specifications':
        return this.formatSpecifications(content);
      default:
        return content;
    }
  }

  /**
   * Formats introduction sections
   */
  private formatIntroduction(content: string): string {
    // Add emphasis to key points in introduction
    let formatted = content;
    
    // Highlight important terms
    formatted = formatted.replace(/(คุณสมบัติ|ประโยชน์|วัตถุประสงค์)/g, '<strong>$1</strong>');
    
    return formatted;
  }

  /**
   * Formats feature sections with bullet points and emphasis
   */
  private formatFeatures(content: string): string {
    // Convert feature lists to proper HTML lists
    const lines = content.split('\n');
    const listItems: string[] = [];
    const nonListContent: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*+•]\s/) || trimmed.match(/^\d+\.\s/)) {
        const cleanItem = trimmed.replace(/^[-*+•]\s/, '').replace(/^\d+\.\s/, '');
        listItems.push(`<li>${cleanItem}</li>`);
      } else if (trimmed) {
        nonListContent.push(trimmed);
      }
    });
    
    let result = nonListContent.join('\n\n');
    if (listItems.length > 0) {
      result += '\n\n<ul>\n' + listItems.join('\n') + '\n</ul>';
    }
    
    return result;
  }

  /**
   * Formats installation sections with step-by-step instructions
   */
  private formatInstallation(content: string): string {
    let formatted = content;
    
    // Convert numbered steps to ordered list
    const stepPattern = /(\d+)\.\s*(.+?)(?=\n\d+\.|$)/g;
    const steps: RegExpExecArray[] = [];
    let match;
    while ((match = stepPattern.exec(formatted)) !== null) {
      steps.push(match);
    }
    
    if (steps.length > 0) {
      const stepList = steps.map(step => `<li>${step[2].trim()}</li>`).join('\n');
      formatted = `<ol class="installation-steps">\n${stepList}\n</ol>`;
    }
    
    return formatted;
  }

  /**
   * Formats usage sections with clear instructions
   */
  private formatUsage(content: string): string {
    let formatted = content;
    
    // Highlight action words
    formatted = formatted.replace(/(คลิก|กด|เลือก|ป้อน|บันทึก)/g, '<em>$1</em>');
    
    return formatted;
  }

  /**
   * Formats troubleshooting sections with problem-solution pairs
   */
  private formatTroubleshooting(content: string): string {
    let formatted = content;
    
    // Format problem-solution pairs
    formatted = formatted.replace(/(ปัญหา:|Problem:)/gi, '<strong class="problem">$1</strong>');
    formatted = formatted.replace(/(วิธีแก้:|Solution:)/gi, '<strong class="solution">$1</strong>');
    
    return formatted;
  }

  /**
   * Formats specification sections with structured data
   */
  private formatSpecifications(content: string): string {
    let formatted = content;
    
    // Convert specification lists to definition lists
    const specPattern = /^(.+?):\s*(.+?)$/gm;
    const specs: RegExpExecArray[] = [];
    let match;
    while ((match = specPattern.exec(formatted)) !== null) {
      specs.push(match);
    }
    
    if (specs.length > 0) {
      const specList = specs.map(spec => 
        `<dt>${spec[1].trim()}</dt><dd>${spec[2].trim()}</dd>`
      ).join('\n');
      formatted = `<dl class="specifications">\n${specList}\n</dl>`;
    }
    
    return formatted;
  }

  /**
   * Generates complete HTML content for the document
   */
  private generateHTMLContent(sections: DocumentSection[], title: string): string {
    let html = this.generateDocumentHeader(title);
    
    if (this.options.includeTableOfContents) {
      html += this.generateTableOfContents(sections);
    }
    
    html += this.generateSectionsHTML(sections);
    
    if (this.options.includeSourceAttribution) {
      html += this.generateSourceAttributionHTML();
    }
    
    html += this.generateDocumentFooter();
    
    return html;
  }

  /**
   * Generates document header with MFEC branding
   */
  private generateDocumentHeader(title: string): string {
    const header = `
<!DOCTYPE html>
<html lang="${this.options.language === 'thai' ? 'th' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${this.styleApplicator.generateDocumentStyles()}
        ${this.styleApplicator.generatePrintStyles()}
    </style>
</head>
<body>
    <div class="document-container">
        ${this.options.applyMFECBranding ? this.generateMFECHeader(title) : ''}
`;
    
    return header;
  }

  /**
   * Generates MFEC branded header
   */
  private generateMFECHeader(title: string): string {
    return `
        <header class="mfec-header" style="${this.getHeaderStyles()}">
            <div class="logo-section">
                <img src="/assets/logo-mfec.png" alt="MFEC Logo" class="mfec-logo" />
            </div>
            <h1 class="document-title">${title}</h1>
            <div class="document-info">
                <span class="document-type">${this.getDocumentTypeLabel()}</span>
                <span class="generation-date">${new Date().toLocaleDateString(this.options.language === 'thai' ? 'th-TH' : 'en-US')}</span>
            </div>
        </header>
`;
  }

  /**
   * Gets header styles as inline CSS
   */
  private getHeaderStyles(): string {
    const headerStyles = this.styleApplicator.getElementStyles('header');
    return Object.entries(headerStyles)
      .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}${typeof value === 'number' ? 'px' : ''}`)
      .join('; ');
  }

  /**
   * Gets document type label in appropriate language
   */
  private getDocumentTypeLabel(): string {
    const labels = {
      thai: {
        user_manual: 'คู่มือผู้ใช้',
        product_document: 'เอกสารผลิตภัณฑ์'
      },
      english: {
        user_manual: 'User Manual',
        product_document: 'Product Document'
      }
    };
    
    return labels[this.options.language][this.options.documentType];
  }

  /**
   * Generates table of contents
   */
  private generateTableOfContents(sections: DocumentSection[]): string {
    const tocTitle = this.options.language === 'thai' ? 'สารบัญ' : 'Table of Contents';
    
    let toc = `<nav class="table-of-contents">
        <h2>${tocTitle}</h2>
        <ul class="toc-list">`;
    
    sections.forEach((section, index) => {
      toc += `<li><a href="#section-${index}">${section.title}</a>`;
      
      if (section.subsections.length > 0) {
        toc += '<ul>';
        section.subsections.forEach((subsection, subIndex) => {
          toc += `<li><a href="#section-${index}-${subIndex}">${subsection.title}</a></li>`;
        });
        toc += '</ul>';
      }
      
      toc += '</li>';
    });
    
    toc += '</ul></nav>';
    
    return toc;
  }

  /**
   * Generates HTML for all sections
   */
  private generateSectionsHTML(sections: DocumentSection[]): string {
    return sections.map((section, index) => 
      this.generateSectionHTML(section, index)
    ).join('\n');
  }

  /**
   * Generates HTML for a single section
   */
  private generateSectionHTML(section: DocumentSection, index: number, parentIndex?: number): string {
    const sectionId = parentIndex !== undefined ? `section-${parentIndex}-${index}` : `section-${index}`;
    const headingLevel = Math.min(section.level + 1, 6); // HTML only supports h1-h6
    
    let html = `<section id="${sectionId}" class="document-section section-${section.sectionType}">
        <h${headingLevel}>${section.title}</h${headingLevel}>
        <div class="section-content">${section.content}</div>`;
    
    // Add images
    if (section.images.length > 0) {
      html += '<div class="section-images">';
      section.images.forEach(image => {
        html += `<figure class="document-image">
            <img src="${image.imageUrl}" alt="${image.caption}" />
            <figcaption class="image-caption">${image.caption}</figcaption>
        </figure>`;
      });
      html += '</div>';
    }
    
    // Add subsections
    if (section.subsections.length > 0) {
      html += '<div class="subsections">';
      section.subsections.forEach((subsection, subIndex) => {
        html += this.generateSectionHTML(subsection, subIndex, index);
      });
      html += '</div>';
    }
    
    html += '</section>';
    
    return html;
  }

  /**
   * Generates source attribution HTML
   */
  private generateSourceAttributionHTML(): string {
    const attributionTitle = this.options.language === 'thai' ? 'ที่มาของเอกสาร' : 'Source Attribution';
    
    return `<footer class="source-attribution">
        <h3>${attributionTitle}</h3>
        <p class="attribution-note">
            ${this.options.language === 'thai' 
              ? 'เอกสารนี้สร้างขึ้นโดยอัตโนมัติจากเนื้อหาต้นฉบับ' 
              : 'This document was automatically generated from the original content'}
        </p>
    </footer>`;
  }

  /**
   * Generates document footer
   */
  private generateDocumentFooter(): string {
    return `
    </div>
</body>
</html>`;
  }

  /**
   * Generates CSS styles for the document
   */
  private generateStyles(): string {
    return this.styleApplicator.generateDocumentStyles() + '\n' + 
           this.styleApplicator.generatePrintStyles();
  }

  /**
   * Calculates document metadata
   */
  private calculateMetadata(sections: DocumentSection[], htmlContent: string): any {
    const flatSections = DocumentSectionManager.flattenSections(sections);
    const totalWordCount = flatSections.reduce((count, section) => 
      count + (section.metadata?.wordCount || 0), 0
    );
    const totalImageCount = flatSections.reduce((count, section) => 
      count + section.images.length, 0
    );

    return {
      wordCount: totalWordCount,
      sectionCount: flatSections.length,
      imageCount: totalImageCount,
      generatedAt: new Date(),
      documentType: this.options.documentType,
      language: this.options.language
    };
  }

  /**
   * Generates unique document ID
   */
  private generateDocumentId(title: string): string {
    const sanitized = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `doc-${sanitized}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Updates formatting options
   */
  updateOptions(newOptions: Partial<FormattingOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    if (newOptions.organizationRules) {
      this.contentOrganizer = new ContentOrganizer(newOptions.organizationRules);
    }
    
    if (newOptions.customStyles) {
      this.styleApplicator.updateStyles(newOptions.customStyles);
    }
  }

  /**
   * Gets current formatting options
   */
  getOptions(): FormattingOptions {
    return { ...this.options };
  }
}