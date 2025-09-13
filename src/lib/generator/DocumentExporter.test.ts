/**
 * Tests for DocumentExporter
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { DocumentExporter } from './DocumentExporter';
import { FormattedDocument } from '../formatter/MFECFormatter';
import { MFECTemplate, SourceInfo } from '../../types';

// Mock fs module
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    promises: {
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      copyFile: vi.fn(),
      stat: vi.fn(),
      readdir: vi.fn(),
      unlink: vi.fn()
    }
  };
});

describe('DocumentExporter', () => {
  let exporter: DocumentExporter;
  let mockFs: typeof fs;

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

  const mockFormattedDocument: FormattedDocument = {
    id: 'doc-123',
    title: 'Test Document',
    sections: [],
    htmlContent: '<div class="content">Test content</div>',
    cssStyles: 'body { font-family: Arial; }',
    sourceAttribution: {
      originalUrl: 'https://example.com/product',
      extractedAt: new Date('2024-01-01'),
      processedBy: 'MFEC Thai Document Generator',
      documentVersion: '1.0'
    },
    metadata: {
      wordCount: 100,
      sectionCount: 1,
      imageCount: 0,
      generatedAt: new Date(),
      documentType: 'user_manual',
      language: 'thai'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFs = vi.mocked(fs);
    
    // Mock fs methods
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.copyFile.mockResolvedValue(undefined);
    mockFs.stat.mockResolvedValue({
      size: 1024,
      mtime: new Date()
    } as any);
    mockFs.readdir.mockResolvedValue([]);
    mockFs.unlink.mockResolvedValue(undefined);

    exporter = new DocumentExporter();
  });

  describe('exportDocument', () => {
    it('should export to HTML format successfully', async () => {
      const exportPath = await exporter.exportDocument(
        mockFormattedDocument,
        'html',
        mockTemplate
      );

      expect(exportPath).toMatch(/exports\/.*\.html$/);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.html$/),
        expect.stringContaining('<!DOCTYPE html>'),
        'utf-8'
      );
    });

    it('should export to PDF format (placeholder)', async () => {
      const exportPath = await exporter.exportDocument(
        mockFormattedDocument,
        'pdf',
        mockTemplate
      );

      expect(exportPath).toMatch(/exports\/.*\.pdf$/);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.pdf$/),
        expect.stringContaining('PDF Export Placeholder'),
        'utf-8'
      );
    });

    it('should export to DOCX format (placeholder)', async () => {
      const exportPath = await exporter.exportDocument(
        mockFormattedDocument,
        'docx',
        mockTemplate
      );

      expect(exportPath).toMatch(/exports\/.*\.docx$/);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.docx$/),
        expect.stringContaining('MFEC Document Export - DOCX Format'),
        'utf-8'
      );
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        exporter.exportDocument(mockFormattedDocument, 'xml' as any, mockTemplate)
      ).rejects.toThrow('Unsupported export format: xml');
    });

    it('should use custom export options', async () => {
      const options = {
        outputDirectory: 'custom-exports',
        filename: 'custom-document.html',
        includeAssets: false
      };

      const exportPath = await exporter.exportDocument(
        mockFormattedDocument,
        'html',
        mockTemplate,
        options
      );

      expect(exportPath).toBe('custom-exports/custom-document.html');
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'custom-exports/custom-document.html',
        expect.any(String),
        'utf-8'
      );
    });

    it('should handle file write errors', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(
        exporter.exportDocument(mockFormattedDocument, 'html', mockTemplate)
      ).rejects.toThrow('Export to html failed');
    });
  });

  describe('exportMultipleFormats', () => {
    it('should export multiple formats successfully', async () => {
      const formats = ['html', 'pdf', 'docx'] as const;
      
      const exportPaths = await exporter.exportMultipleFormats(
        mockFormattedDocument,
        formats,
        mockTemplate
      );

      expect(Object.keys(exportPaths)).toEqual(['html', 'pdf', 'docx']);
      expect(exportPaths.html).toMatch(/\.html$/);
      expect(exportPaths.pdf).toMatch(/\.pdf$/);
      expect(exportPaths.docx).toMatch(/\.docx$/);
    });

    it('should handle partial failures gracefully', async () => {
      mockFs.writeFile
        .mockResolvedValueOnce(undefined) // HTML succeeds
        .mockRejectedValueOnce(new Error('PDF failed')) // PDF fails
        .mockResolvedValueOnce(undefined); // DOCX succeeds

      const formats = ['html', 'pdf', 'docx'] as const;
      
      const exportPaths = await exporter.exportMultipleFormats(
        mockFormattedDocument,
        formats,
        mockTemplate
      );

      // Should have HTML and DOCX, but not PDF
      expect(exportPaths).toHaveProperty('html');
      expect(exportPaths).toHaveProperty('docx');
      expect(exportPaths).not.toHaveProperty('pdf');
    });
  });

  describe('getExportInfo', () => {
    it('should return export file information', async () => {
      const mockStats = {
        size: 2048,
        mtime: new Date('2024-01-01T10:00:00Z')
      };
      mockFs.stat.mockResolvedValue(mockStats as any);

      const info = await exporter.getExportInfo('exports/test-document.html');

      expect(info).toEqual({
        filePath: 'exports/test-document.html',
        fileSize: 2048,
        format: 'html',
        exportTime: mockStats.mtime.getTime()
      });
    });

    it('should return null for non-existent files', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));

      const info = await exporter.getExportInfo('non-existent.html');

      expect(info).toBeNull();
    });
  });

  describe('cleanupOldExports', () => {
    it('should clean up old export files', async () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago

      mockFs.readdir.mockResolvedValue(['old-file.html', 'recent-file.pdf'] as any);
      mockFs.stat
        .mockResolvedValueOnce({ mtime: oldDate } as any)
        .mockResolvedValueOnce({ mtime: recentDate } as any);

      await exporter.cleanupOldExports(24 * 60 * 60 * 1000); // 24 hours

      expect(mockFs.unlink).toHaveBeenCalledWith('exports/old-file.html');
      expect(mockFs.unlink).not.toHaveBeenCalledWith('exports/recent-file.pdf');
    });

    it('should handle cleanup errors gracefully', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      // Should not throw
      await expect(exporter.cleanupOldExports()).resolves.not.toThrow();
    });
  });

  describe('HTML export with assets', () => {
    it('should copy assets when includeAssets is true', async () => {
      const options = { includeAssets: true };

      await exporter.exportDocument(
        mockFormattedDocument,
        'html',
        mockTemplate,
        options
      );

      // Should create assets directory
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringMatching(/assets$/),
        { recursive: true }
      );

      // Should copy logo files
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        mockTemplate.logoAssets.standard,
        expect.stringMatching(/logo-mfec-standard\.png$/)
      );
    });

    it('should handle asset copy failures gracefully', async () => {
      mockFs.copyFile.mockRejectedValue(new Error('Copy failed'));
      const options = { includeAssets: true };

      // Should not throw even if asset copying fails
      await expect(
        exporter.exportDocument(mockFormattedDocument, 'html', mockTemplate, options)
      ).resolves.not.toThrow();
    });
  });

  describe('filename generation', () => {
    it('should generate valid filenames', async () => {
      const documentWithSpecialChars = {
        ...mockFormattedDocument,
        title: 'Test Document: With Special Characters! & Symbols'
      };

      const exportPath = await exporter.exportDocument(
        documentWithSpecialChars,
        'html',
        mockTemplate
      );

      // Should sanitize filename
      expect(exportPath).toMatch(/test-document-with-special-characters-symbols/);
      expect(exportPath).toMatch(/\d{4}-\d{2}-\d{2}\.html$/);
    });

    it('should truncate long titles', async () => {
      const documentWithLongTitle = {
        ...mockFormattedDocument,
        title: 'A'.repeat(100) // Very long title
      };

      const exportPath = await exporter.exportDocument(
        documentWithLongTitle,
        'html',
        mockTemplate
      );

      const filename = path.basename(exportPath);
      // Should be truncated to reasonable length
      expect(filename.length).toBeLessThan(70);
    });
  });
});