/**
 * DocumentExporter - Handles document export in multiple formats (PDF, DOCX, HTML)
 * Implements document export functionality with MFEC template integration
 */

import { promises as fs } from 'fs';
import path from 'path';
import { 
  MFECTemplate, 
  TemplateError 
} from '../../types';
import { FormattedDocument } from '../formatter/MFECFormatter';

export interface ExportOptions {
  outputDirectory?: string;
  filename?: string;
  includeAssets?: boolean;
  compression?: boolean;
}

export interface ExportResult {
  filePath: string;
  fileSize: number;
  format: string;
  exportTime: number;
}

export class DocumentExporter {
  private static readonly DEFAULT_OUTPUT_DIR = 'exports';
  private static readonly SUPPORTED_FORMATS = ['html', 'pdf', 'docx'] as const;

  constructor() {
    this.ensureOutputDirectory();
  }

  /**
   * Export document in specified format
   */
  async exportDocument(
    document: FormattedDocument,
    format: 'pdf' | 'docx' | 'html',
    template: MFECTemplate,
    options: ExportOptions = {}
  ): Promise<string> {
    const startTime = Date.now();

    try {
      if (!DocumentExporter.SUPPORTED_FORMATS.includes(format)) {
        throw new TemplateError(
          `Unsupported export format: ${format}`,
          'UNSUPPORTED_FORMAT'
        );
      }

      const exportOptions: Required<ExportOptions> = {
        outputDirectory: DocumentExporter.DEFAULT_OUTPUT_DIR,
        filename: this.generateFilename(document.title, format),
        includeAssets: true,
        compression: false,
        ...options
      };

      let exportPath: string;

      switch (format) {
        case 'html':
          exportPath = await this.exportToHTML(document, template, exportOptions);
          break;
        case 'pdf':
          exportPath = await this.exportToPDF(document, template, exportOptions);
          break;
        case 'docx':
          exportPath = await this.exportToDOCX(document, template, exportOptions);
          break;
        default:
          throw new TemplateError(
            `Export format ${format} not implemented`,
            'FORMAT_NOT_IMPLEMENTED'
          );
      }

      const exportTime = Date.now() - startTime;
      console.log(`Document exported to ${format.toUpperCase()} in ${exportTime}ms: ${exportPath}`);

      return exportPath;

    } catch (error) {
      throw new TemplateError(
        `Export to ${format} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXPORT_FAILED'
      );
    }
  }

  /**
   * Export multiple formats simultaneously
   */
  async exportMultipleFormats(
    document: FormattedDocument,
    formats: ('pdf' | 'docx' | 'html')[],
    template: MFECTemplate,
    options: ExportOptions = {}
  ): Promise<Record<string, string>> {
    const exportPromises = formats.map(async format => {
      const exportPath = await this.exportDocument(document, format, template, options);
      return { format, path: exportPath };
    });

    const results = await Promise.allSettled(exportPromises);
    const exportPaths: Record<string, string> = {};

    results.forEach((result, index) => {
      const format = formats[index];
      if (result.status === 'fulfilled') {
        exportPaths[format] = result.value.path;
      } else {
        console.error(`Failed to export ${format}:`, result.reason);
      }
    });

    return exportPaths;
  }

  /**
   * Export to HTML format
   */
  private async exportToHTML(
    document: FormattedDocument,
    template: MFECTemplate,
    options: Required<ExportOptions>
  ): Promise<string> {
    try {
      const outputPath = path.join(options.outputDirectory, options.filename);
      
      // Create complete HTML document with MFEC styling
      const htmlContent = this.createCompleteHTMLDocument(document, template);
      
      // Write HTML file
      await fs.writeFile(outputPath, htmlContent, 'utf-8');

      // Copy assets if requested
      if (options.includeAssets) {
        await this.copyAssetsForHTML(template, options.outputDirectory);
      }

      return outputPath;

    } catch (error) {
      throw new TemplateError(
        `HTML export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'HTML_EXPORT_FAILED'
      );
    }
  }

  /**
   * Export to PDF format (placeholder implementation)
   */
  private async exportToPDF(
    document: FormattedDocument,
    template: MFECTemplate,
    options: Required<ExportOptions>
  ): Promise<string> {
    try {
      // For now, create a placeholder PDF export
      // In a real implementation, you would use libraries like puppeteer, jsPDF, or PDFKit
      const outputPath = path.join(options.outputDirectory, options.filename);
      
      // Create HTML first, then convert to PDF
      const htmlContent = this.createCompleteHTMLDocument(document, template);
      
      // Placeholder: Save as HTML with PDF extension for now
      // TODO: Implement actual PDF generation using puppeteer or similar
      const pdfPlaceholder = `
<!-- PDF Export Placeholder -->
<!-- This would be converted to PDF using puppeteer or similar library -->
${htmlContent}
`;
      
      await fs.writeFile(outputPath, pdfPlaceholder, 'utf-8');
      
      return outputPath;

    } catch (error) {
      throw new TemplateError(
        `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PDF_EXPORT_FAILED'
      );
    }
  }

  /**
   * Export to DOCX format (placeholder implementation)
   */
  private async exportToDOCX(
    document: FormattedDocument,
    template: MFECTemplate,
    options: Required<ExportOptions>
  ): Promise<string> {
    try {
      // For now, create a placeholder DOCX export
      // In a real implementation, you would use libraries like docx or officegen
      const outputPath = path.join(options.outputDirectory, options.filename);
      
      // Create a simple text representation for DOCX placeholder
      const docxContent = this.createDOCXContent(document, template);
      
      // Placeholder: Save as text with DOCX extension for now
      // TODO: Implement actual DOCX generation using docx library
      await fs.writeFile(outputPath, docxContent, 'utf-8');
      
      return outputPath;

    } catch (error) {
      throw new TemplateError(
        `DOCX export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOCX_EXPORT_FAILED'
      );
    }
  }

  /**
   * Create complete HTML document with MFEC styling
   */
  private createCompleteHTMLDocument(document: FormattedDocument, template: MFECTemplate): string {
    const mfecStyles = this.generateMFECStyles(template);
    
    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.title}</title>
    <style>
        ${document.cssStyles}
        ${mfecStyles}
    </style>
</head>
<body>
    <div class="mfec-document">
        <header class="mfec-header">
            <img src="assets/logo-mfec.png" alt="MFEC Logo" class="mfec-logo" />
            <h1 class="document-title">${document.title}</h1>
            <div class="document-meta">
                <span class="document-type">${template.documentType}</span>
                <span class="generation-date">${new Date().toLocaleDateString('th-TH')}</span>
            </div>
        </header>
        
        <main class="document-content">
            ${document.htmlContent}
        </main>
        
        <footer class="mfec-footer">
            <div class="source-attribution">
                <p>สร้างโดย MFEC Thai Document Generator</p>
                <p>วันที่สร้าง: ${new Date().toLocaleDateString('th-TH')}</p>
            </div>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Generate MFEC-specific CSS styles
   */
  private generateMFECStyles(template: MFECTemplate): string {
    const styles = template.styleSettings;
    
    return `
        .mfec-document {
            font-family: ${styles.fonts.primaryFont}, sans-serif;
            line-height: ${styles.spacing.lineHeight};
            margin: ${styles.spacing.margins.top}cm ${styles.spacing.margins.right}cm ${styles.spacing.margins.bottom}cm ${styles.spacing.margins.left}cm;
            color: #333;
        }
        
        .mfec-header {
            border-bottom: 2px solid ${styles.primaryColors[0]};
            padding-bottom: ${styles.spacing.padding.section}pt;
            margin-bottom: ${styles.spacing.padding.section * 2}pt;
            text-align: center;
        }
        
        .mfec-logo {
            max-width: ${template.styleSettings.logoPlacement.maxWidth}px;
            max-height: ${template.styleSettings.logoPlacement.maxHeight}px;
            margin-bottom: 10px;
        }
        
        .document-title {
            font-size: ${styles.fonts.sizes.h1}pt;
            font-weight: bold;
            color: ${styles.primaryColors[0]};
            margin: 10px 0;
        }
        
        .document-meta {
            font-size: ${styles.fonts.sizes.caption}pt;
            color: ${styles.primaryColors[2]};
        }
        
        .document-content h1 {
            font-size: ${styles.fonts.sizes.h1}pt;
            color: ${styles.primaryColors[0]};
            border-bottom: 1px solid ${styles.primaryColors[1]};
            padding-bottom: 5px;
        }
        
        .document-content h2 {
            font-size: ${styles.fonts.sizes.h2}pt;
            color: ${styles.primaryColors[1]};
        }
        
        .document-content h3 {
            font-size: ${styles.fonts.sizes.h3}pt;
            color: ${styles.primaryColors[1]};
        }
        
        .document-content p {
            font-size: ${styles.fonts.sizes.body}pt;
            margin-bottom: ${styles.spacing.padding.paragraph}pt;
        }
        
        .mfec-footer {
            border-top: 1px solid ${styles.primaryColors[2]};
            padding-top: ${styles.spacing.padding.section}pt;
            margin-top: ${styles.spacing.padding.section * 2}pt;
            text-align: center;
            font-size: ${styles.fonts.sizes.caption}pt;
            color: ${styles.primaryColors[2]};
        }
        
        @media print {
            .mfec-document {
                margin: 0;
            }
            
            .mfec-header, .mfec-footer {
                page-break-inside: avoid;
            }
        }
    `;
  }

  /**
   * Create DOCX content (placeholder)
   */
  private createDOCXContent(document: FormattedDocument, template: MFECTemplate): string {
    // This is a placeholder implementation
    // In a real implementation, you would use the docx library to create proper DOCX files
    
    const textContent = document.htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    return `MFEC Document Export - DOCX Format
=====================================

Title: ${document.title}
Document Type: ${template.documentType}
Generated: ${new Date().toLocaleDateString('th-TH')}

Content:
--------
${textContent}

Source Attribution:
------------------
Generated by MFEC Thai Document Generator
Template: ${template.templatePath}

Note: This is a placeholder DOCX export. 
In production, this would be a proper DOCX file generated using the docx library.
`;
  }

  /**
   * Copy assets for HTML export
   */
  private async copyAssetsForHTML(template: MFECTemplate, outputDir: string): Promise<void> {
    try {
      const assetsDir = path.join(outputDir, 'assets');
      await fs.mkdir(assetsDir, { recursive: true });

      // Copy logo assets
      const logoAssets = Object.entries(template.logoAssets);
      
      for (const [logoType, logoPath] of logoAssets) {
        try {
          const targetPath = path.join(assetsDir, `logo-mfec-${logoType}.png`);
          await fs.copyFile(logoPath, targetPath);
        } catch (error) {
          console.warn(`Failed to copy logo asset ${logoType}:`, error);
        }
      }

      // Create a default logo reference
      const defaultLogoPath = path.join(assetsDir, 'logo-mfec.png');
      try {
        await fs.copyFile(template.logoAssets.standard, defaultLogoPath);
      } catch (error) {
        console.warn('Failed to copy default logo:', error);
      }

    } catch (error) {
      console.warn('Failed to copy assets:', error);
    }
  }

  /**
   * Generate filename for export
   */
  private generateFilename(title: string, format: string): string {
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `${sanitizedTitle}-${timestamp}.${format}`;
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(DocumentExporter.DEFAULT_OUTPUT_DIR, { recursive: true });
    } catch (error) {
      console.warn('Failed to create output directory:', error);
    }
  }

  /**
   * Get export file info
   */
  async getExportInfo(filePath: string): Promise<ExportResult | null> {
    try {
      const stats = await fs.stat(filePath);
      const format = path.extname(filePath).substring(1);
      
      return {
        filePath,
        fileSize: stats.size,
        format,
        exportTime: stats.mtime.getTime()
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Clean up old export files
   */
  async cleanupOldExports(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(DocumentExporter.DEFAULT_OUTPUT_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(DocumentExporter.DEFAULT_OUTPUT_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old export file: ${file}`);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup old exports:', error);
    }
  }
}