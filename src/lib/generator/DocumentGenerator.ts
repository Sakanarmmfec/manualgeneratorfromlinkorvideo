/**
 * DocumentGenerator - Main document generation engine
 * Implements document generation using MFEC template structure
 * Supports both user manual and product document formats
 */

import { 
  GeneratedDocument, 
  ProcessedContent, 
  MFECTemplate, 
  SourceInfo, 
  GenerationInfo,
  DocumentRequest,
  TemplateError
} from '../../types';
import { MFECTemplateService } from '../template/MFECTemplateService';
import { MFECFormatter, FormattedDocument } from '../formatter/MFECFormatter';
import { DocumentExporter } from './DocumentExporter';

export interface GenerationOptions {
  includeImages: boolean;
  includeTableOfContents: boolean;
  includeSourceAttribution: boolean;
  customInstructions?: string;
  exportFormats: ('pdf' | 'docx' | 'html')[];
}

export interface GenerationResult {
  document: GeneratedDocument;
  exportUrls: Record<string, string>;
  generationTime: number;
  warnings: string[];
}

export class DocumentGenerator {
  private templateService: MFECTemplateService;
  private formatter: MFECFormatter;
  private exporter: DocumentExporter;

  constructor() {
    this.templateService = new MFECTemplateService();
    this.formatter = new MFECFormatter();
    this.exporter = new DocumentExporter();
  }

  /**
   * Initialize the document generator
   */
  async initialize(): Promise<void> {
    try {
      await this.templateService.initialize();
    } catch (error) {
      throw new TemplateError(
        `Failed to initialize document generator: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATOR_INIT_FAILED'
      );
    }
  }

  /**
   * Generate a complete document from processed content
   */
  async generateDocument(
    request: DocumentRequest,
    processedContent: ProcessedContent,
    options: Partial<GenerationOptions> = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Set default options
      const generationOptions: GenerationOptions = {
        includeImages: true,
        includeTableOfContents: true,
        includeSourceAttribution: true,
        exportFormats: ['html', 'pdf'],
        ...options
      };

      // Load MFEC template
      const template = await this.templateService.loadTemplate(
        request.documentType === 'user_manual' ? 'user_manual' : 'system_manual'
      );

      // Configure formatter with template settings
      this.formatter.updateOptions({
        documentType: request.documentType,
        language: request.language,
        includeTableOfContents: generationOptions.includeTableOfContents,
        includeSourceAttribution: generationOptions.includeSourceAttribution,
        applyMFECBranding: true
      });

      // Format the document
      const formattedDocument = await this.formatter.formatDocument(
        processedContent.refinedContent,
        processedContent.organizedSections[0]?.title || 'Document',
        processedContent.sourceAttribution.originalUrl,
        this.extractImagesFromSections(processedContent.organizedSections)
      );

      // Create generation metadata
      const generationMetadata: GenerationInfo = {
        generatedAt: new Date(),
        processingTime: Date.now() - startTime,
        aiModel: 'gpt-4o',
        version: '1.0.0'
      };

      // Create the generated document
      const generatedDocument: GeneratedDocument = {
        id: formattedDocument.id,
        title: formattedDocument.title,
        content: processedContent,
        template,
        sourceAttribution: processedContent.sourceAttribution,
        generationMetadata,
        previewUrl: this.generatePreviewUrl(formattedDocument.id),
        downloadFormats: generationOptions.exportFormats
      };

      // Export document in requested formats
      const exportUrls = await this.exportDocument(
        generatedDocument,
        formattedDocument,
        generationOptions.exportFormats
      );

      const generationTime = Date.now() - startTime;

      return {
        document: generatedDocument,
        exportUrls,
        generationTime,
        warnings
      };

    } catch (error) {
      throw new TemplateError(
        `Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOCUMENT_GENERATION_FAILED'
      );
    }
  }

  /**
   * Generate document from request (convenience method)
   */
  async generateFromRequest(
    request: DocumentRequest,
    processedContent: ProcessedContent
  ): Promise<GenerationResult> {
    const options: Partial<GenerationOptions> = {
      includeImages: request.includeImages,
      exportFormats: ['html', 'pdf', 'docx']
    };

    return this.generateDocument(request, processedContent, options);
  }

  /**
   * Create a preview version of the document
   */
  async createPreview(
    processedContent: ProcessedContent,
    documentType: 'user_manual' | 'product_document'
  ): Promise<FormattedDocument> {
    try {
      // Configure formatter for preview
      this.formatter.updateOptions({
        documentType,
        language: 'thai',
        includeTableOfContents: true,
        includeSourceAttribution: false,
        applyMFECBranding: true
      });

      // Format the document for preview
      return await this.formatter.formatDocument(
        processedContent.refinedContent,
        processedContent.organizedSections[0]?.title || 'Preview Document',
        processedContent.sourceAttribution.originalUrl,
        this.extractImagesFromSections(processedContent.organizedSections)
      );

    } catch (error) {
      throw new TemplateError(
        `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PREVIEW_GENERATION_FAILED'
      );
    }
  }

  /**
   * Validate document generation requirements
   */
  async validateGenerationRequirements(request: DocumentRequest): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate template system
      const templateValidation = await this.templateService.validateSystem();
      
      if (!templateValidation.isValid) {
        errors.push(...templateValidation.errors);
      }
      
      warnings.push(...templateValidation.warnings);

      // Validate request parameters
      if (!request.productUrl) {
        errors.push('Product URL is required');
      }

      if (!['user_manual', 'product_document'].includes(request.documentType)) {
        errors.push('Invalid document type');
      }

      if (request.language !== 'thai') {
        warnings.push('Only Thai language is currently supported');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Get available document templates
   */
  async getAvailableTemplates(): Promise<{
    userManual: MFECTemplate;
    systemManual: MFECTemplate;
  }> {
    try {
      const [userManual, systemManual] = await Promise.all([
        this.templateService.loadTemplate('user_manual'),
        this.templateService.loadTemplate('system_manual')
      ]);

      return {
        userManual,
        systemManual
      };

    } catch (error) {
      throw new TemplateError(
        `Failed to load templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_LOAD_FAILED'
      );
    }
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(document: GeneratedDocument): {
    contentStats: {
      wordCount: number;
      sectionCount: number;
      imageCount: number;
    };
    templateInfo: {
      templateType: string;
      brandCompliance: boolean;
    };
    processingInfo: {
      generationTime: number;
      aiModel: string;
      version: string;
    };
  } {
    const sections = document.content.organizedSections;
    const wordCount = sections.reduce((count, section) => {
      const words = section.content.split(/\s+/).length;
      return count + words;
    }, 0);

    const imageCount = sections.reduce((count, section) => {
      return count + section.images.length;
    }, 0);

    return {
      contentStats: {
        wordCount,
        sectionCount: sections.length,
        imageCount
      },
      templateInfo: {
        templateType: document.template.documentType,
        brandCompliance: true // Always true for MFEC templates
      },
      processingInfo: {
        generationTime: document.generationMetadata.processingTime,
        aiModel: document.generationMetadata.aiModel,
        version: document.generationMetadata.version
      }
    };
  }

  /**
   * Extract images from document sections
   */
  private extractImagesFromSections(sections: any[]): any[] {
    const images: any[] = [];
    
    sections.forEach(section => {
      if (section.images) {
        images.push(...section.images);
      }
      
      if (section.subsections) {
        images.push(...this.extractImagesFromSections(section.subsections));
      }
    });

    return images;
  }

  /**
   * Generate preview URL for document
   */
  private generatePreviewUrl(documentId: string): string {
    return `/api/documents/${documentId}/preview`;
  }

  /**
   * Export document in multiple formats
   */
  private async exportDocument(
    document: GeneratedDocument,
    formattedDocument: FormattedDocument,
    formats: string[]
  ): Promise<Record<string, string>> {
    const exportUrls: Record<string, string> = {};

    for (const format of formats) {
      try {
        const exportUrl = await this.exporter.exportDocument(
          formattedDocument,
          format as 'pdf' | 'docx' | 'html',
          document.template
        );
        exportUrls[format] = exportUrl;
      } catch (error) {
        console.warn(`Failed to export document in ${format} format:`, error);
        // Continue with other formats
      }
    }

    return exportUrls;
  }

  /**
   * Clear caches and reset state
   */
  async reset(): Promise<void> {
    this.templateService.clearCaches();
  }
}