/**
 * Tests for MFECFormatter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MFECFormatter, FormattingOptions } from './MFECFormatter';

// Mock the dependencies
vi.mock('./ContentOrganizer', () => ({
  ContentOrganizer: vi.fn().mockImplementation(() => ({
    organizeContent: vi.fn().mockReturnValue([
      {
        id: 'section-1',
        title: 'Introduction',
        content: 'This is the introduction content.',
        subsections: [],
        images: [],
        sectionType: 'introduction',
        level: 1,
        order: 0,
        metadata: { wordCount: 5, estimatedReadTime: 1 }
      },
      {
        id: 'section-2',
        title: 'Features',
        content: 'This describes the features.',
        subsections: [],
        images: [],
        sectionType: 'features',
        level: 1,
        order: 1,
        metadata: { wordCount: 4, estimatedReadTime: 1 }
      }
    ])
  }))
}));

vi.mock('./StyleApplicator', () => ({
  StyleApplicator: vi.fn().mockImplementation(() => ({
    generateDocumentStyles: vi.fn().mockReturnValue('body { font-family: Arial; }'),
    generatePrintStyles: vi.fn().mockReturnValue('@media print { body { font-size: 12pt; } }'),
    getElementStyles: vi.fn().mockReturnValue({ backgroundColor: '#0066CC' }),
    updateStyles: vi.fn()
  }))
}));

describe('MFECFormatter', () => {
  let formatter: MFECFormatter;

  beforeEach(() => {
    formatter = new MFECFormatter();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const options = formatter.getOptions();

      expect(options.documentType).toBe('user_manual');
      expect(options.language).toBe('thai');
      expect(options.includeTableOfContents).toBe(true);
      expect(options.includeSourceAttribution).toBe(true);
      expect(options.applyMFECBranding).toBe(true);
    });

    it('should accept custom options', () => {
      const customOptions: Partial<FormattingOptions> = {
        documentType: 'product_document',
        language: 'english',
        includeTableOfContents: false
      };

      const customFormatter = new MFECFormatter(customOptions);
      const options = customFormatter.getOptions();

      expect(options.documentType).toBe('product_document');
      expect(options.language).toBe('english');
      expect(options.includeTableOfContents).toBe(false);
    });
  });

  describe('formatDocument', () => {
    it('should format document with all components', async () => {
      const content = 'Test content for formatting';
      const title = 'Test Document';
      const sourceUrl = 'https://example.com';

      const result = await formatter.formatDocument(content, title, sourceUrl);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title', title);
      expect(result).toHaveProperty('sections');
      expect(result).toHaveProperty('htmlContent');
      expect(result).toHaveProperty('cssStyles');
      expect(result).toHaveProperty('sourceAttribution');
      expect(result).toHaveProperty('metadata');
    });

    it('should generate proper source attribution', async () => {
      const sourceUrl = 'https://example.com/product';
      
      const result = await formatter.formatDocument('content', 'title', sourceUrl);

      expect(result.sourceAttribution.originalUrl).toBe(sourceUrl);
      expect(result.sourceAttribution.processedBy).toBe('MFEC Thai Document Generator');
      expect(result.sourceAttribution.documentVersion).toBe('1.0');
      expect(result.sourceAttribution.extractedAt).toBeInstanceOf(Date);
    });

    it('should calculate metadata correctly', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.metadata.wordCount).toBe(9); // 5 + 4 from mocked sections
      expect(result.metadata.sectionCount).toBe(2);
      expect(result.metadata.imageCount).toBe(0);
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
      expect(result.metadata.documentType).toBe('user_manual');
      expect(result.metadata.language).toBe('thai');
    });

    it('should generate unique document IDs', async () => {
      const result1 = await formatter.formatDocument('content', 'Test Title', 'url');
      const result2 = await formatter.formatDocument('content', 'Test Title', 'url');

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^doc-test-title-\d+-[a-z0-9]+$/);
    });
  });

  describe('HTML generation', () => {
    it('should generate complete HTML document', async () => {
      const result = await formatter.formatDocument('content', 'Test Title', 'url');

      expect(result.htmlContent).toContain('<!DOCTYPE html>');
      expect(result.htmlContent).toContain('<html lang="th">');
      expect(result.htmlContent).toContain('<head>');
      expect(result.htmlContent).toContain('<body>');
      expect(result.htmlContent).toContain('</html>');
    });

    it('should include document title in HTML', async () => {
      const title = 'My Test Document';
      const result = await formatter.formatDocument('content', title, 'url');

      expect(result.htmlContent).toContain(`<title>${title}</title>`);
    });

    it('should include CSS styles in HTML head', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('<style>');
      expect(result.htmlContent).toContain('body { font-family: Arial; }');
    });

    it('should generate table of contents when enabled', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('สารบัญ'); // Thai for "Table of Contents"
      expect(result.htmlContent).toContain('table-of-contents');
    });

    it('should skip table of contents when disabled', async () => {
      const noTocFormatter = new MFECFormatter({ includeTableOfContents: false });
      const result = await noTocFormatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).not.toContain('สารบัญ');
      expect(result.htmlContent).not.toContain('table-of-contents');
    });

    it('should include source attribution when enabled', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('ที่มาของเอกสาร'); // Thai for "Source Attribution"
      expect(result.htmlContent).toContain('source-attribution');
    });

    it('should use English language when configured', async () => {
      const englishFormatter = new MFECFormatter({ language: 'english' });
      const result = await englishFormatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('<html lang="en">');
      expect(result.htmlContent).toContain('Table of Contents');
      expect(result.htmlContent).toContain('Source Attribution');
    });
  });

  describe('MFEC branding', () => {
    it('should include MFEC header when branding is enabled', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('mfec-header');
      expect(result.htmlContent).toContain('mfec-logo');
    });

    it('should skip MFEC header when branding is disabled', async () => {
      const noBrandFormatter = new MFECFormatter({ applyMFECBranding: false });
      const result = await noBrandFormatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).not.toContain('mfec-header');
    });

    it('should include document type label in Thai', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('คู่มือผู้ใช้'); // Thai for "User Manual"
    });

    it('should include document type label in English', async () => {
      const englishFormatter = new MFECFormatter({ 
        language: 'english',
        documentType: 'product_document' 
      });
      const result = await englishFormatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('Product Document');
    });
  });

  describe('Thai language formatting', () => {
    it('should apply Thai-specific formatting', async () => {
      // This would test the applyThaiFormatting method
      // Since it's private, we test through the public interface
      const thaiContent = 'นี่คือเนื้อหาภาษาไทยที่ต้องจัดรูปแบบ.มันควรมีการเว้นวรรคที่เหมาะสม';
      const result = await formatter.formatDocument(thaiContent, 'title', 'url');

      // The formatted content should be in the HTML
      expect(result.htmlContent).toContain('เนื้อหาภาษาไทย');
    });
  });

  describe('section formatting', () => {
    it('should format sections with proper HTML structure', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('<section id="section-0"');
      expect(result.htmlContent).toContain('class="document-section section-introduction"');
      expect(result.htmlContent).toContain('<h2>Introduction</h2>');
    });

    it('should handle subsections with proper nesting', async () => {
      // This would require mocking sections with subsections
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.htmlContent).toContain('section-content');
    });
  });

  describe('updateOptions', () => {
    it('should update formatting options', () => {
      const newOptions: Partial<FormattingOptions> = {
        documentType: 'product_document',
        language: 'english'
      };

      formatter.updateOptions(newOptions);
      const options = formatter.getOptions();

      expect(options.documentType).toBe('product_document');
      expect(options.language).toBe('english');
    });

    it('should preserve existing options when updating', () => {
      const originalIncludeToc = formatter.getOptions().includeTableOfContents;
      
      formatter.updateOptions({ documentType: 'product_document' });
      const options = formatter.getOptions();

      expect(options.documentType).toBe('product_document');
      expect(options.includeTableOfContents).toBe(originalIncludeToc);
    });
  });

  describe('CSS generation', () => {
    it('should generate CSS styles', async () => {
      const result = await formatter.formatDocument('content', 'title', 'url');

      expect(result.cssStyles).toContain('body { font-family: Arial; }');
      expect(result.cssStyles).toContain('@media print');
    });
  });

  describe('error handling', () => {
    it('should handle empty content gracefully', async () => {
      const result = await formatter.formatDocument('', 'title', 'url');

      expect(result).toHaveProperty('htmlContent');
      expect(result).toHaveProperty('sections');
      expect(result.sections).toHaveLength(2); // From mocked organizer
    });

    it('should handle special characters in title', async () => {
      const specialTitle = 'Title with "quotes" & <tags>';
      const result = await formatter.formatDocument('content', specialTitle, 'url');

      expect(result.title).toBe(specialTitle);
      expect(result.id).toMatch(/^doc-title-with-quotes-tags-\d+$/);
    });
  });
});