/**
 * TemplateEngine - Advanced template processing and rendering engine
 * Handles MFEC template integration and document structure generation
 */

import { 
  MFECTemplate, 
  DocumentSection, 
  ProcessedContent,
  BrandStyleSettings,
  TemplateError
} from '../../types';
import { MFECTemplateService } from '../template/MFECTemplateService';

export interface TemplateContext {
  title: string;
  content: ProcessedContent;
  documentType: 'user_manual' | 'product_document';
  language: 'thai' | 'english';
  generationDate: Date;
  sourceUrl: string;
  customVariables?: Record<string, any>;
}

export interface RenderedTemplate {
  html: string;
  css: string;
  metadata: TemplateMetadata;
  assets: TemplateAsset[];
}

export interface TemplateMetadata {
  templateId: string;
  templateVersion: string;
  renderTime: number;
  variablesUsed: string[];
  assetsIncluded: string[];
}

export interface TemplateAsset {
  type: 'image' | 'font' | 'style';
  name: string;
  path: string;
  size?: number;
}

export class TemplateEngine {
  private templateService: MFECTemplateService;
  private templateCache: Map<string, MFECTemplate> = new Map();

  constructor() {
    this.templateService = new MFECTemplateService();
  }

  /**
   * Initialize the template engine
   */
  async initialize(): Promise<void> {
    try {
      await this.templateService.initialize();
    } catch (error) {
      throw new TemplateError(
        `Template engine initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_ENGINE_INIT_FAILED'
      );
    }
  }

  /**
   * Render document using MFEC template
   */
  async renderDocument(context: TemplateContext): Promise<RenderedTemplate> {
    const startTime = Date.now();

    try {
      // Load appropriate template
      const template = await this.loadTemplate(context.documentType);
      
      // Prepare template variables
      const templateVariables = this.prepareTemplateVariables(context, template);
      
      // Render HTML content
      const html = await this.renderHTML(context, template, templateVariables);
      
      // Generate CSS styles
      const css = this.generateCSS(template, context);
      
      // Collect template assets
      const assets = await this.collectTemplateAssets(template);
      
      // Create metadata
      const metadata: TemplateMetadata = {
        templateId: this.generateTemplateId(template),
        templateVersion: '1.0.0',
        renderTime: Date.now() - startTime,
        variablesUsed: Object.keys(templateVariables),
        assetsIncluded: assets.map(asset => asset.name)
      };

      return {
        html,
        css,
        metadata,
        assets
      };

    } catch (error) {
      throw new TemplateError(
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_RENDER_FAILED'
      );
    }
  }

  /**
   * Load template with caching
   */
  private async loadTemplate(documentType: 'user_manual' | 'product_document'): Promise<MFECTemplate> {
    const templateType = documentType === 'user_manual' ? 'user_manual' : 'system_manual';
    const cacheKey = `mfec_${templateType}`;

    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    const template = await this.templateService.loadTemplate(templateType);
    this.templateCache.set(cacheKey, template);
    
    return template;
  }

  /**
   * Prepare template variables for rendering
   */
  private prepareTemplateVariables(context: TemplateContext, template: MFECTemplate): Record<string, any> {
    const variables: Record<string, any> = {
      // Document metadata
      title: context.title,
      documentType: context.documentType,
      language: context.language,
      generationDate: context.generationDate,
      sourceUrl: context.sourceUrl,
      
      // Content variables
      sections: context.content.organizedSections,
      translatedContent: context.content.translatedContent,
      refinedContent: context.content.refinedContent,
      sourceAttribution: context.content.sourceAttribution,
      
      // Template variables
      templateType: template.documentType,
      brandColors: template.styleSettings.primaryColors,
      logoAssets: template.logoAssets,
      
      // Formatting variables
      tableOfContents: this.generateTableOfContents(context.content.organizedSections),
      sectionCount: context.content.organizedSections.length,
      wordCount: this.calculateWordCount(context.content.refinedContent),
      
      // Localization
      labels: this.getLocalizedLabels(context.language),
      
      // Custom variables
      ...context.customVariables
    };

    return variables;
  }

  /**
   * Render HTML content using template
   */
  private async renderHTML(
    context: TemplateContext, 
    template: MFECTemplate, 
    variables: Record<string, any>
  ): Promise<string> {
    
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="${context.language === 'thai' ? 'th' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="generator" content="MFEC Thai Document Generator">
    <meta name="document-type" content="{{documentType}}">
    <meta name="language" content="{{language}}">
</head>
<body class="mfec-document {{documentType}}-document">
    ${this.renderHeader(template, variables)}
    ${this.renderTableOfContents(variables)}
    ${this.renderMainContent(context.content.organizedSections, variables)}
    ${this.renderFooter(template, variables)}
</body>
</html>`;

    return this.interpolateTemplate(htmlTemplate, variables);
  }

  /**
   * Render document header
   */
  private renderHeader(template: MFECTemplate, variables: Record<string, any>): string {
    const logoPath = this.getLogoPath(template, 'header');
    
    return `
<header class="mfec-header">
    <div class="header-content">
        <div class="logo-section">
            <img src="${logoPath}" alt="MFEC Logo" class="mfec-logo" />
        </div>
        <div class="title-section">
            <h1 class="document-title">{{title}}</h1>
            <div class="document-meta">
                <span class="document-type">{{labels.documentType}}</span>
                <span class="generation-date">{{generationDate}}</span>
            </div>
        </div>
    </div>
</header>`;
  }

  /**
   * Render table of contents
   */
  private renderTableOfContents(variables: Record<string, any>): string {
    if (!variables.tableOfContents || variables.tableOfContents.length === 0) {
      return '';
    }

    let tocHtml = `
<nav class="table-of-contents">
    <h2>{{labels.tableOfContents}}</h2>
    <ul class="toc-list">`;

    variables.tableOfContents.forEach((item: any, index: number) => {
      tocHtml += `
        <li class="toc-item level-${item.level}">
            <a href="#section-${index}" class="toc-link">
                <span class="toc-number">${item.number}</span>
                <span class="toc-title">${item.title}</span>
            </a>
        </li>`;
    });

    tocHtml += `
    </ul>
</nav>`;

    return tocHtml;
  }

  /**
   * Render main content sections
   */
  private renderMainContent(sections: DocumentSection[], variables: Record<string, any>): string {
    let contentHtml = '<main class="document-content">';

    sections.forEach((section, index) => {
      contentHtml += this.renderSection(section, index, variables);
    });

    contentHtml += '</main>';
    return contentHtml;
  }

  /**
   * Render individual section
   */
  private renderSection(section: DocumentSection, index: number, variables: Record<string, any>): string {
    const sectionId = `section-${index}`;
    // Default to level 1 if not specified, then add 1 for heading level (h2, h3, etc.)
    const sectionLevel = section.level || 1;
    const headingLevel = Math.min(sectionLevel + 1, 6);

    let sectionHtml = `
<section id="${sectionId}" class="document-section section-${section.sectionType}">
    <h${headingLevel} class="section-title">${section.title}</h${headingLevel}>
    <div class="section-content">
        ${this.formatSectionContent(section.content, section.sectionType)}
    </div>`;

    // Add images
    if (section.images && section.images.length > 0) {
      sectionHtml += '<div class="section-images">';
      section.images.forEach(image => {
        sectionHtml += `
            <figure class="document-image">
                <img src="${image.imageId}" alt="${image.caption}" class="content-image" />
                <figcaption class="image-caption">${image.caption}</figcaption>
            </figure>`;
      });
      sectionHtml += '</div>';
    }

    // Add subsections
    if (section.subsections && section.subsections.length > 0) {
      sectionHtml += '<div class="subsections">';
      section.subsections.forEach((subsection, subIndex) => {
        sectionHtml += this.renderSection(subsection, subIndex, variables);
      });
      sectionHtml += '</div>';
    }

    sectionHtml += '</section>';
    return sectionHtml;
  }

  /**
   * Format section content based on type
   */
  private formatSectionContent(content: string, sectionType: string): string {
    // Apply section-specific formatting
    switch (sectionType) {
      case 'introduction':
        return `<div class="introduction-content">${content}</div>`;
      case 'features':
        return this.formatFeaturesList(content);
      case 'installation':
        return this.formatInstallationSteps(content);
      case 'usage':
        return `<div class="usage-content">${content}</div>`;
      case 'troubleshooting':
        return this.formatTroubleshootingContent(content);
      case 'specifications':
        return this.formatSpecifications(content);
      default:
        return `<div class="section-content">${content}</div>`;
    }
  }

  /**
   * Format features list
   */
  private formatFeaturesList(content: string): string {
    // Convert bullet points to proper HTML lists
    const lines = content.split('\n').filter(line => line.trim());
    const listItems: string[] = [];
    const regularContent: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*+•]\s/) || trimmed.match(/^\d+\.\s/)) {
        const cleanItem = trimmed.replace(/^[-*+•]\s/, '').replace(/^\d+\.\s/, '');
        listItems.push(`<li class="feature-item">${cleanItem}</li>`);
      } else if (trimmed) {
        regularContent.push(trimmed);
      }
    });

    let result = regularContent.join('\n\n');
    if (listItems.length > 0) {
      result += `\n<ul class="features-list">\n${listItems.join('\n')}\n</ul>`;
    }

    return result;
  }

  /**
   * Format installation steps
   */
  private formatInstallationSteps(content: string): string {
    const stepPattern = /(\d+)\.\s*(.+?)(?=\n\d+\.|$)/g;
    const steps = Array.from(content.matchAll(stepPattern));

    if (steps.length > 0) {
      const stepList = steps.map((step, index) => 
        `<li class="installation-step" data-step="${index + 1}">
            <div class="step-content">${step[2].trim()}</div>
        </li>`
      ).join('\n');
      
      return `<ol class="installation-steps">\n${stepList}\n</ol>`;
    }

    return content;
  }

  /**
   * Format troubleshooting content
   */
  private formatTroubleshootingContent(content: string): string {
    let formatted = content;
    
    // Format problem-solution pairs
    formatted = formatted.replace(/(ปัญหา:|Problem:)/gi, '<h4 class="problem-title">$1</h4>');
    formatted = formatted.replace(/(วิธีแก้:|Solution:)/gi, '<h4 class="solution-title">$1</h4>');
    
    return `<div class="troubleshooting-content">${formatted}</div>`;
  }

  /**
   * Format specifications
   */
  private formatSpecifications(content: string): string {
    const specPattern = /^(.+?):\s*(.+?)$/gm;
    const specs = Array.from(content.matchAll(specPattern));

    if (specs.length > 0) {
      const specList = specs.map(spec => 
        `<div class="spec-item">
            <dt class="spec-label">${spec[1].trim()}</dt>
            <dd class="spec-value">${spec[2].trim()}</dd>
        </div>`
      ).join('\n');
      
      return `<dl class="specifications-list">\n${specList}\n</dl>`;
    }

    return content;
  }

  /**
   * Render document footer
   */
  private renderFooter(template: MFECTemplate, variables: Record<string, any>): string {
    return `
<footer class="mfec-footer">
    <div class="footer-content">
        <div class="source-attribution">
            <h3>{{labels.sourceAttribution}}</h3>
            <p class="source-url">{{labels.originalSource}}: {{sourceUrl}}</p>
            <p class="generation-info">{{labels.generatedBy}}: MFEC Thai Document Generator</p>
            <p class="generation-date">{{labels.generatedOn}}: {{generationDate}}</p>
        </div>
        <div class="footer-logo">
            <img src="${this.getLogoPath(template, 'footer')}" alt="MFEC Logo" class="footer-logo-img" />
        </div>
    </div>
</footer>`;
  }

  /**
   * Generate CSS styles for the template
   */
  private generateCSS(template: MFECTemplate, context: TemplateContext): string {
    const styles = template.styleSettings;
    
    return `
/* MFEC Document Styles */
.mfec-document {
    font-family: ${styles.fonts.primaryFont}, sans-serif;
    line-height: ${styles.spacing.lineHeight};
    color: #333;
    max-width: 210mm; /* A4 width */
    margin: 0 auto;
    padding: ${styles.spacing.margins.top}cm ${styles.spacing.margins.right}cm ${styles.spacing.margins.bottom}cm ${styles.spacing.margins.left}cm;
}

/* Header Styles */
.mfec-header {
    border-bottom: 3px solid ${styles.primaryColors[0]};
    padding-bottom: ${styles.spacing.padding.section}pt;
    margin-bottom: ${styles.spacing.padding.section * 2}pt;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.mfec-logo {
    max-width: ${styles.logoPlacement.maxWidth}px;
    max-height: ${styles.logoPlacement.maxHeight}px;
}

.document-title {
    font-size: ${styles.fonts.sizes.h1}pt;
    font-weight: bold;
    color: ${styles.primaryColors[0]};
    margin: 0;
}

.document-meta {
    font-size: ${styles.fonts.sizes.caption}pt;
    color: ${styles.primaryColors[2]};
    margin-top: 5px;
}

/* Table of Contents */
.table-of-contents {
    background: #f8f9fa;
    border: 1px solid ${styles.primaryColors[2]};
    border-radius: 5px;
    padding: ${styles.spacing.padding.section}pt;
    margin-bottom: ${styles.spacing.padding.section * 2}pt;
}

.table-of-contents h2 {
    font-size: ${styles.fonts.sizes.h2}pt;
    color: ${styles.primaryColors[0]};
    margin-top: 0;
}

.toc-list {
    list-style: none;
    padding: 0;
}

.toc-item {
    margin-bottom: 8px;
}

.toc-link {
    text-decoration: none;
    color: ${styles.primaryColors[1]};
    display: flex;
    align-items: center;
}

.toc-link:hover {
    color: ${styles.primaryColors[0]};
}

.toc-number {
    font-weight: bold;
    margin-right: 10px;
    min-width: 30px;
}

/* Content Sections */
.document-section {
    margin-bottom: ${styles.spacing.padding.section * 2}pt;
}

.section-title {
    color: ${styles.primaryColors[0]};
    border-bottom: 2px solid ${styles.primaryColors[1]};
    padding-bottom: 5px;
    margin-bottom: ${styles.spacing.padding.section}pt;
}

.section-content {
    font-size: ${styles.fonts.sizes.body}pt;
    line-height: ${styles.spacing.lineHeight};
}

.section-content p {
    margin-bottom: ${styles.spacing.padding.paragraph}pt;
}

/* Features List */
.features-list {
    background: #f0f8ff;
    border-left: 4px solid ${styles.primaryColors[0]};
    padding: ${styles.spacing.padding.section}pt;
    margin: ${styles.spacing.padding.section}pt 0;
}

.feature-item {
    margin-bottom: 8px;
    padding-left: 10px;
}

/* Installation Steps */
.installation-steps {
    counter-reset: step-counter;
    padding-left: 0;
}

.installation-step {
    counter-increment: step-counter;
    margin-bottom: ${styles.spacing.padding.section}pt;
    padding: ${styles.spacing.padding.paragraph}pt;
    background: #fff8dc;
    border-left: 4px solid ${styles.primaryColors[1]};
    position: relative;
}

.installation-step::before {
    content: counter(step-counter);
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    background: ${styles.primaryColors[0]};
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

/* Troubleshooting */
.troubleshooting-content .problem-title {
    color: #d32f2f;
    font-size: ${styles.fonts.sizes.h3}pt;
    margin-top: ${styles.spacing.padding.section}pt;
}

.troubleshooting-content .solution-title {
    color: #388e3c;
    font-size: ${styles.fonts.sizes.h3}pt;
    margin-top: ${styles.spacing.padding.paragraph}pt;
}

/* Specifications */
.specifications-list {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 10px;
    background: #f5f5f5;
    padding: ${styles.spacing.padding.section}pt;
    border-radius: 5px;
}

.spec-item {
    display: contents;
}

.spec-label {
    font-weight: bold;
    color: ${styles.primaryColors[1]};
    padding: 5px;
    background: white;
}

.spec-value {
    padding: 5px;
    background: white;
}

/* Images */
.section-images {
    margin: ${styles.spacing.padding.section}pt 0;
}

.document-image {
    text-align: center;
    margin: ${styles.spacing.padding.section}pt 0;
}

.content-image {
    max-width: 100%;
    height: auto;
    border: 1px solid ${styles.primaryColors[2]};
    border-radius: 5px;
}

.image-caption {
    font-size: ${styles.fonts.sizes.caption}pt;
    color: ${styles.primaryColors[2]};
    margin-top: 5px;
    font-style: italic;
}

/* Footer */
.mfec-footer {
    border-top: 2px solid ${styles.primaryColors[2]};
    padding-top: ${styles.spacing.padding.section}pt;
    margin-top: ${styles.spacing.padding.section * 3}pt;
    font-size: ${styles.fonts.sizes.caption}pt;
    color: ${styles.primaryColors[2]};
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.footer-logo-img {
    max-width: 100px;
    opacity: 0.7;
}

/* Print Styles */
@media print {
    .mfec-document {
        margin: 0;
        padding: 1cm;
    }
    
    .document-section {
        page-break-inside: avoid;
    }
    
    .mfec-header, .mfec-footer {
        page-break-inside: avoid;
    }
    
    .installation-step {
        page-break-inside: avoid;
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        text-align: center;
    }
    
    .footer-content {
        flex-direction: column;
        text-align: center;
    }
    
    .specifications-list {
        grid-template-columns: 1fr;
    }
}
`;
  }

  /**
   * Get logo path for specific context
   */
  private getLogoPath(template: MFECTemplate, context: 'header' | 'footer' | 'document'): string {
    const logoType = template.styleSettings.logoPlacement[`${context}Logo`];
    return template.logoAssets[logoType] || template.logoAssets.standard;
  }

  /**
   * Generate table of contents data
   */
  private generateTableOfContents(sections: DocumentSection[]): any[] {
    return sections.map((section, index) => ({
      number: index + 1,
      title: section.title,
      level: section.level,
      id: `section-${index}`
    }));
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get localized labels
   */
  private getLocalizedLabels(language: 'thai' | 'english'): Record<string, string> {
    const labels = {
      thai: {
        tableOfContents: 'สารบัญ',
        documentType: 'ประเภทเอกสาร',
        sourceAttribution: 'ที่มาของเอกสาร',
        originalSource: 'แหล่งที่มาต้นฉบับ',
        generatedBy: 'สร้างโดย',
        generatedOn: 'วันที่สร้าง'
      },
      english: {
        tableOfContents: 'Table of Contents',
        documentType: 'Document Type',
        sourceAttribution: 'Source Attribution',
        originalSource: 'Original Source',
        generatedBy: 'Generated by',
        generatedOn: 'Generated on'
      }
    };

    return labels[language];
  }

  /**
   * Interpolate template variables
   */
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(variables, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Generate template ID
   */
  private generateTemplateId(template: MFECTemplate): string {
    return `mfec-${template.documentType}-${Date.now()}`;
  }

  /**
   * Collect template assets
   */
  private async collectTemplateAssets(template: MFECTemplate): Promise<TemplateAsset[]> {
    const assets: TemplateAsset[] = [];

    // Add logo assets
    for (const [logoType, logoPath] of Object.entries(template.logoAssets)) {
      assets.push({
        type: 'image',
        name: `logo-${logoType}`,
        path: logoPath
      });
    }

    // Add template document
    assets.push({
      type: 'style',
      name: 'mfec-template',
      path: template.templatePath
    });

    return assets;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}