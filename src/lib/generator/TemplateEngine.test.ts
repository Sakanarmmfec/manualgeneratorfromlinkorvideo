/**
 * Tests for TemplateEngine
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { TemplateEngine } from './TemplateEngine';
import { MFECTemplateService } from '../template/MFECTemplateService';
import { 
  TemplateContext, 
  MFECTemplate, 
  ProcessedContent, 
  DocumentSection,
  SourceInfo
} from '../../types';

// Mock dependencies
vi.mock('../template/MFECTemplateService');

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;
  let mockTemplateService: Mock;

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
    content: 'This is the introduction section with some content.',
    subsections: [],
    images: [{
      imageId: 'img-1',
      position: 'inline',
      caption: 'Test image',
      size: 'medium'
    }],
    sectionType: 'introduction'
  };

  const mockProcessedContent: ProcessedContent = {
    translatedContent: 'เนื้อหาที่แปลแล้ว',
    organizedSections: [mockDocumentSection],
    refinedContent: 'เนื้อหาที่ปรับปรุงแล้ว',
    sourceAttribution: mockSourceInfo,
    qualityScore: 0.9
  };

  const mockTemplateContext: TemplateContext = {
    title: 'Test Document',
    content: mockProcessedContent,
    documentType: 'user_manual',
    language: 'thai',
    generationDate: new Date('2024-01-01T10:00:00Z'),
    sourceUrl: 'https://example.com/product',
    customVariables: {
      customField: 'custom value'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockTemplateService = vi.mocked(MFECTemplateService);
    mockTemplateService.prototype.initialize = vi.fn().mockResolvedValue(undefined);
    mockTemplateService.prototype.loadTemplate = vi.fn().mockResolvedValue(mockTemplate);

    templateEngine = new TemplateEngine();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(templateEngine.initialize()).resolves.not.toThrow();
      expect(mockTemplateService.prototype.initialize).toHaveBeenCalled();
    });

    it('should throw error if template service initialization fails', async () => {
      mockTemplateService.prototype.initialize.mockRejectedValue(new Error('Init failed'));
      
      await expect(templateEngine.initialize()).rejects.toThrow('Template engine initialization failed');
    });
  });

  describe('renderDocument', () => {
    beforeEach(async () => {
      await templateEngine.initialize();
    });

    it('should render document successfully', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result).toMatchObject({
        html: expect.stringContaining('<!DOCTYPE html>'),
        css: expect.stringContaining('.mfec-document'),
        metadata: expect.objectContaining({
          templateId: expect.stringMatching(/^mfec-user_manual-\d+$/),
          templateVersion: '1.0.0',
          renderTime: expect.any(Number),
          variablesUsed: expect.arrayContaining(['title', 'documentType', 'language']),
          assetsIncluded: expect.arrayContaining(['logo-standard', 'logo-white', 'logo-ai'])
        }),
        assets: expect.arrayContaining([
          expect.objectContaining({
            type: 'image',
            name: 'logo-standard',
            path: mockTemplate.logoAssets.standard
          })
        ])
      });

      expect(mockTemplateService.prototype.loadTemplate).toHaveBeenCalledWith('user_manual');
    });

    it('should handle product document type', async () => {
      const productContext = { ...mockTemplateContext, documentType: 'product_document' as const };
      
      await templateEngine.renderDocument(productContext);

      expect(mockTemplateService.prototype.loadTemplate).toHaveBeenCalledWith('system_manual');
    });

    it('should include custom variables in template variables', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.metadata.variablesUsed).toContain('customField');
    });

    it('should handle template loading failure', async () => {
      mockTemplateService.prototype.loadTemplate.mockRejectedValue(new Error('Template not found'));

      await expect(
        templateEngine.renderDocument(mockTemplateContext)
      ).rejects.toThrow('Template rendering failed');
    });
  });

  describe('HTML rendering', () => {
    beforeEach(async () => {
      await templateEngine.initialize();
    });

    it('should render complete HTML document', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html lang="th">');
      expect(result.html).toContain('<title>Test Document</title>');
      expect(result.html).toContain('class="mfec-document user_manual-document"');
    });

    it('should render header with logo and title', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('<header class="mfec-header">');
      expect(result.html).toContain('alt="MFEC Logo"');
      expect(result.html).toContain('<h1 class="document-title">Test Document</h1>');
    });

    it('should render table of contents', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('<nav class="table-of-contents">');
      expect(result.html).toContain('สารบัญ'); // Thai for "Table of Contents"
      expect(result.html).toContain('Introduction');
    });

    it('should render main content sections', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('<main class="document-content">');
      expect(result.html).toContain('<section id="section-0"');
      expect(result.html).toContain('class="document-section section-introduction"');
      expect(result.html).toContain('<h2 class="section-title">Introduction</h2>');
    });

    it('should render images in sections', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('<div class="section-images">');
      expect(result.html).toContain('<figure class="document-image">');
      expect(result.html).toContain('alt="Test image"');
      expect(result.html).toContain('<figcaption class="image-caption">Test image</figcaption>');
    });

    it('should render footer with source attribution', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('<footer class="mfec-footer">');
      expect(result.html).toContain('ที่มาของเอกสาร'); // Thai for "Source Attribution"
      expect(result.html).toContain('https://example.com/product');
    });

    it('should use English labels for English language', async () => {
      const englishContext = { ...mockTemplateContext, language: 'english' as const };
      
      const result = await templateEngine.renderDocument(englishContext);

      expect(result.html).toContain('<html lang="en">');
      expect(result.html).toContain('Table of Contents');
      expect(result.html).toContain('Source Attribution');
    });
  });

  describe('CSS generation', () => {
    beforeEach(async () => {
      await templateEngine.initialize();
    });

    it('should generate comprehensive CSS styles', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.css).toContain('.mfec-document');
      expect(result.css).toContain('font-family: Tahoma');
      expect(result.css).toContain('color: #0066CC'); // Primary color
      expect(result.css).toContain('.mfec-header');
      expect(result.css).toContain('.table-of-contents');
      expect(result.css).toContain('.document-section');
      expect(result.css).toContain('.mfec-footer');
    });

    it('should include print styles', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.css).toContain('@media print');
      expect(result.css).toContain('page-break-inside: avoid');
    });

    it('should include responsive styles', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.css).toContain('@media (max-width: 768px)');
      expect(result.css).toContain('flex-direction: column');
    });

    it('should use template style settings', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.css).toContain(`font-size: ${mockTemplate.styleSettings.fonts.sizes.h1}pt`);
      expect(result.css).toContain(`line-height: ${mockTemplate.styleSettings.spacing.lineHeight}`);
      expect(result.css).toContain(`max-width: ${mockTemplate.styleSettings.logoPlacement.maxWidth}px`);
    });
  });

  describe('content formatting', () => {
    beforeEach(async () => {
      await templateEngine.initialize();
    });

    it('should format features list', async () => {
      const featuresSection: DocumentSection = {
        id: 'features',
        title: 'Features',
        content: '- Feature 1\n- Feature 2\n- Feature 3',
        subsections: [],
        images: [],
        sectionType: 'features'
      };

      const contextWithFeatures = {
        ...mockTemplateContext,
        content: {
          ...mockProcessedContent,
          organizedSections: [featuresSection]
        }
      };

      const result = await templateEngine.renderDocument(contextWithFeatures);

      expect(result.html).toContain('<ul class="features-list">');
      expect(result.html).toContain('<li class="feature-item">Feature 1</li>');
    });

    it('should format installation steps', async () => {
      const installationSection: DocumentSection = {
        id: 'installation',
        title: 'Installation',
        content: '1. First step\n2. Second step\n3. Third step',
        subsections: [],
        images: [],
        sectionType: 'installation'
      };

      const contextWithInstallation = {
        ...mockTemplateContext,
        content: {
          ...mockProcessedContent,
          organizedSections: [installationSection]
        }
      };

      const result = await templateEngine.renderDocument(contextWithInstallation);

      expect(result.html).toContain('<ol class="installation-steps">');
      expect(result.html).toContain('<li class="installation-step"');
      expect(result.html).toContain('First step');
    });

    it('should format troubleshooting content', async () => {
      const troubleshootingSection: DocumentSection = {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        content: 'ปัญหา: Connection failed\nวิธีแก้: Check network settings',
        subsections: [],
        images: [],
        sectionType: 'troubleshooting'
      };

      const contextWithTroubleshooting = {
        ...mockTemplateContext,
        content: {
          ...mockProcessedContent,
          organizedSections: [troubleshootingSection]
        }
      };

      const result = await templateEngine.renderDocument(contextWithTroubleshooting);

      expect(result.html).toContain('<h4 class="problem-title">ปัญหา:</h4>');
      expect(result.html).toContain('<h4 class="solution-title">วิธีแก้:</h4>');
    });

    it('should format specifications', async () => {
      const specificationsSection: DocumentSection = {
        id: 'specifications',
        title: 'Specifications',
        content: 'CPU: Intel i7\nRAM: 16GB\nStorage: 512GB SSD',
        subsections: [],
        images: [],
        sectionType: 'specifications'
      };

      const contextWithSpecs = {
        ...mockTemplateContext,
        content: {
          ...mockProcessedContent,
          organizedSections: [specificationsSection]
        }
      };

      const result = await templateEngine.renderDocument(contextWithSpecs);

      expect(result.html).toContain('<dl class="specifications-list">');
      expect(result.html).toContain('<dt class="spec-label">CPU</dt>');
      expect(result.html).toContain('<dd class="spec-value">Intel i7</dd>');
    });
  });

  describe('template variable interpolation', () => {
    beforeEach(async () => {
      await templateEngine.initialize();
    });

    it('should interpolate simple variables', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.html).toContain('Test Document'); // {{title}}
      expect(result.html).toContain('user_manual'); // {{documentType}}
    });

    it('should handle missing variables gracefully', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      // Should not contain unresolved template variables
      expect(result.html).not.toContain('{{undefinedVariable}}');
    });
  });

  describe('asset collection', () => {
    beforeEach(async () => {
      await templateEngine.initialize();
    });

    it('should collect all template assets', async () => {
      const result = await templateEngine.renderDocument(mockTemplateContext);

      expect(result.assets).toHaveLength(4); // 3 logos + 1 template
      
      const logoAssets = result.assets.filter(asset => asset.type === 'image');
      expect(logoAssets).toHaveLength(3);
      expect(logoAssets.map(asset => asset.name)).toEqual([
        'logo-standard',
        'logo-white', 
        'logo-ai'
      ]);

      const templateAssets = result.assets.filter(asset => asset.type === 'style');
      expect(templateAssets).toHaveLength(1);
      expect(templateAssets[0].name).toBe('mfec-template');
    });
  });

  describe('clearCache', () => {
    it('should clear template cache', () => {
      expect(() => templateEngine.clearCache()).not.toThrow();
    });
  });
});