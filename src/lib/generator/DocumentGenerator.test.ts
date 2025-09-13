/**
 * Tests for DocumentGenerator
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { DocumentGenerator } from './DocumentGenerator';
import { MFECTemplateService } from '../template/MFECTemplateService';
import { MFECFormatter } from '../formatter/MFECFormatter';
import { DocumentExporter } from './DocumentExporter';
import { 
  DocumentRequest, 
  ProcessedContent, 
  MFECTemplate,
  SourceInfo,
  DocumentSection
} from '../../types';

// Mock dependencies
vi.mock('../template/MFECTemplateService');
vi.mock('../formatter/MFECFormatter');
vi.mock('./DocumentExporter');

describe('DocumentGenerator', () => {
  let generator: DocumentGenerator;
  let mockTemplateService: Mock;
  let mockFormatter: Mock;
  let mockExporter: Mock;

  const mockTemplate: MFECTemplate = {
    templatePath: '.qodo/Template/MFEC_System&User_Manual_Template.docx',
    brandGuidelinePath: '.qodo/Template/ENG_MFEC Brand Guideline as of 11 Sep 23.pdf',
    logoAssets: {
      standard: '.qodo/Template/Logo MFEC.png',
      white: '.qodo/Template/Logo MFEC White.png',
      ai: '.qodo/Template/Logo MFEC More. 2023ai.ai'
    },
    documentType: 'user_manual',
    styleSettings: {
      primaryColors: ['#0066CC', '#003366', '#666666'],
      fonts: {
        primaryFont: 'Tahoma',
        secondaryFont: 'Arial',
        headerFont: 'Tahoma',
        bodyFont: 'Tahoma',
        sizes: { h1: 18, h2: 16, h3: 14, body: 12, caption: 10 }
      },
      spacing: {
        margins: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 },
        padding: { section: 12, paragraph: 6 },
        lineHeight: 1.15
      },
      headerFooterSettings: {
        includeHeader: true,
        includeFooter: true,
        headerHeight: 1.5,
        footerHeight: 1.0,
        logoPosition: 'left'
      },
      logoPlacement: {
        headerLogo: 'standard',
        footerLogo: 'standard',
        documentLogo: 'standard',
        maxWidth: 150,
        maxHeight: 50
      }
    }
  };

  const mockSourceInfo: SourceInfo = {
    originalUrl: 'https://example.com/product',
    extractionDate: new Date('2024-01-01'),
    contentType: 'website',
    attribution: 'Test Product Page'
  };

  const mockDocumentSection: DocumentSection = {
    id: 'section-1',
    title: 'Introduction',
    content: 'This is the introduction section.',
    subsections: [],
    images: [],
    sectionType: 'introduction'
  };

  const mockProcessedContent: ProcessedContent = {
    translatedContent: 'เนื้อหาที่แปลแล้ว',
    organizedSections: [mockDocumentSection],
    refinedContent: 'เนื้อหาที่ปรับปรุงแล้ว',
    sourceAttribution: mockSourceInfo,
    qualityScore: 0.9
  };

  const mockDocumentRequest: DocumentRequest = {
    productUrl: 'https://example.com/product',
    documentType: 'user_manual',
    language: 'thai',
    mfecTemplate: 'default',
    includeImages: true,
    customInstructions: 'Test instructions'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockTemplateService = vi.mocked(MFECTemplateService);
    mockFormatter = vi.mocked(MFECFormatter);
    mockExporter = vi.mocked(DocumentExporter);

    // Mock template service methods
    mockTemplateService.prototype.initialize = vi.fn().mockResolvedValue(undefined);
    mockTemplateService.prototype.loadTemplate = vi.fn().mockResolvedValue(mockTemplate);
    mockTemplateService.prototype.validateSystem = vi.fn().mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: []
    });

    // Mock formatter methods
    mockFormatter.prototype.updateOptions = vi.fn();
    mockFormatter.prototype.formatDocument = vi.fn().mockResolvedValue({
      id: 'doc-123',
      title: 'Test Document',
      sections: [mockDocumentSection],
      htmlContent: '<html><body>Test content</body></html>',
      cssStyles: 'body { font-family: Arial; }',
      sourceAttribution: mockSourceInfo,
      metadata: {
        wordCount: 100,
        sectionCount: 1,
        imageCount: 0,
        generatedAt: new Date(),
        documentType: 'user_manual',
        language: 'thai'
      }
    });

    // Mock exporter methods
    mockExporter.prototype.exportDocument = vi.fn().mockResolvedValue('/exports/test-doc.html');

    generator = new DocumentGenerator();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(generator.initialize()).resolves.not.toThrow();
      expect(mockTemplateService.prototype.initialize).toHaveBeenCalled();
    });

    it('should throw error if template service initialization fails', async () => {
      mockTemplateService.prototype.initialize.mockRejectedValue(new Error('Init failed'));
      
      await expect(generator.initialize()).rejects.toThrow('Failed to initialize document generator');
    });
  });

  describe('generateDocument', () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it('should generate document successfully', async () => {
      const result = await generator.generateDocument(mockDocumentRequest, mockProcessedContent);

      expect(result).toMatchObject({
        document: expect.objectContaining({
          id: 'doc-123',
          title: 'Test Document',
          content: mockProcessedContent,
          template: mockTemplate
        }),
        exportUrls: expect.objectContaining({
          html: '/exports/test-doc.html'
        }),
        generationTime: expect.any(Number),
        warnings: expect.any(Array)
      });

      expect(mockTemplateService.prototype.loadTemplate).toHaveBeenCalledWith('user_manual');
      expect(mockFormatter.prototype.updateOptions).toHaveBeenCalledWith({
        documentType: 'user_manual',
        language: 'thai',
        includeTableOfContents: true,
        includeSourceAttribution: true,
        applyMFECBranding: true
      });
    });

    it('should handle product document type', async () => {
      const productRequest = { ...mockDocumentRequest, documentType: 'product_document' as const };
      
      await generator.generateDocument(productRequest, mockProcessedContent);

      expect(mockTemplateService.prototype.loadTemplate).toHaveBeenCalledWith('system_manual');
    });

    it('should use custom generation options', async () => {
      const options = {
        includeImages: false,
        includeTableOfContents: false,
        exportFormats: ['pdf'] as const
      };

      const result = await generator.generateDocument(mockDocumentRequest, mockProcessedContent, options);

      expect(mockFormatter.prototype.updateOptions).toHaveBeenCalledWith({
        documentType: 'user_manual',
        language: 'thai',
        includeTableOfContents: false,
        includeSourceAttribution: true,
        applyMFECBranding: true
      });

      expect(result.document.downloadFormats).toEqual(['pdf']);
    });

    it('should handle template loading failure', async () => {
      mockTemplateService.prototype.loadTemplate.mockRejectedValue(new Error('Template not found'));

      await expect(
        generator.generateDocument(mockDocumentRequest, mockProcessedContent)
      ).rejects.toThrow('Document generation failed');
    });
  });

  describe('generateFromRequest', () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it('should generate document from request with default options', async () => {
      const result = await generator.generateFromRequest(mockDocumentRequest, mockProcessedContent);

      expect(result).toMatchObject({
        document: expect.objectContaining({
          title: 'Test Document'
        }),
        exportUrls: expect.any(Object),
        generationTime: expect.any(Number)
      });

      expect(result.document.downloadFormats).toEqual(['html', 'pdf', 'docx']);
    });
  });

  describe('createPreview', () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it('should create preview successfully', async () => {
      const preview = await generator.createPreview(mockProcessedContent, 'user_manual');

      expect(preview).toMatchObject({
        id: 'doc-123',
        title: 'Test Document',
        htmlContent: expect.any(String),
        cssStyles: expect.any(String)
      });

      expect(mockFormatter.prototype.updateOptions).toHaveBeenCalledWith({
        documentType: 'user_manual',
        language: 'thai',
        includeTableOfContents: true,
        includeSourceAttribution: false,
        applyMFECBranding: true
      });
    });

    it('should handle preview generation failure', async () => {
      mockFormatter.prototype.formatDocument.mockRejectedValue(new Error('Format failed'));

      await expect(
        generator.createPreview(mockProcessedContent, 'user_manual')
      ).rejects.toThrow('Preview generation failed');
    });
  });

  describe('validateGenerationRequirements', () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it('should validate requirements successfully', async () => {
      const validation = await generator.validateGenerationRequirements(mockDocumentRequest);

      expect(validation).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
    });

    it('should detect missing product URL', async () => {
      const invalidRequest = { ...mockDocumentRequest, productUrl: '' };
      
      const validation = await generator.validateGenerationRequirements(invalidRequest);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Product URL is required');
    });

    it('should detect invalid document type', async () => {
      const invalidRequest = { ...mockDocumentRequest, documentType: 'invalid' as any };
      
      const validation = await generator.validateGenerationRequirements(invalidRequest);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid document type');
    });

    it('should warn about unsupported language', async () => {
      const englishRequest = { ...mockDocumentRequest, language: 'english' as any };
      
      const validation = await generator.validateGenerationRequirements(englishRequest);

      expect(validation.warnings).toContain('Only Thai language is currently supported');
    });

    it('should handle template validation errors', async () => {
      mockTemplateService.prototype.validateSystem.mockResolvedValue({
        isValid: false,
        errors: ['Template not found'],
        warnings: []
      });

      const validation = await generator.validateGenerationRequirements(mockDocumentRequest);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Template not found');
    });
  });

  describe('getAvailableTemplates', () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it('should return available templates', async () => {
      const userTemplate = { ...mockTemplate, documentType: 'user_manual' as const };
      const systemTemplate = { ...mockTemplate, documentType: 'system_manual' as const };

      mockTemplateService.prototype.loadTemplate
        .mockResolvedValueOnce(userTemplate)
        .mockResolvedValueOnce(systemTemplate);

      const templates = await generator.getAvailableTemplates();

      expect(templates).toEqual({
        userManual: userTemplate,
        systemManual: systemTemplate
      });

      expect(mockTemplateService.prototype.loadTemplate).toHaveBeenCalledWith('user_manual');
      expect(mockTemplateService.prototype.loadTemplate).toHaveBeenCalledWith('system_manual');
    });

    it('should handle template loading failure', async () => {
      mockTemplateService.prototype.loadTemplate.mockRejectedValue(new Error('Template error'));

      await expect(generator.getAvailableTemplates()).rejects.toThrow('Failed to load templates');
    });
  });

  describe('getGenerationStats', () => {
    it('should calculate generation statistics', () => {
      const mockGeneratedDocument = {
        id: 'doc-123',
        title: 'Test Document',
        content: mockProcessedContent,
        template: mockTemplate,
        sourceAttribution: mockSourceInfo,
        generationMetadata: {
          generatedAt: new Date(),
          processingTime: 1500,
          aiModel: 'gpt-4o',
          version: '1.0.0'
        },
        previewUrl: '/preview/doc-123',
        downloadFormats: ['html', 'pdf']
      };

      const stats = generator.getGenerationStats(mockGeneratedDocument);

      expect(stats).toEqual({
        contentStats: {
          wordCount: expect.any(Number),
          sectionCount: 1,
          imageCount: 0
        },
        templateInfo: {
          templateType: 'user_manual',
          brandCompliance: true
        },
        processingInfo: {
          generationTime: 1500,
          aiModel: 'gpt-4o',
          version: '1.0.0'
        }
      });
    });
  });

  describe('reset', () => {
    it('should clear caches', async () => {
      await generator.reset();
      expect(mockTemplateService.prototype.clearCaches).toHaveBeenCalled();
    });
  });
});