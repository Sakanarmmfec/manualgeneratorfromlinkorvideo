/**
 * Integration tests for the document formatter module
 * Tests the complete formatting workflow with real components
 */

import { describe, it, expect } from 'vitest';
import { MFECFormatter } from './MFECFormatter';
import { ContentOrganizer } from './ContentOrganizer';
import { StyleApplicator } from './StyleApplicator';
import { DocumentSectionManager } from './DocumentSection';

describe('Document Formatter Integration', () => {
  describe('Complete formatting workflow', () => {
    it('should format a complete document from raw content to HTML', async () => {
      const formatter = new MFECFormatter({
        documentType: 'user_manual',
        language: 'thai',
        includeTableOfContents: true,
        includeSourceAttribution: true
      });

      const rawContent = `
# การแนะนำ
นี่คือคู่มือการใช้งานสำหรับผลิตภัณฑ์ของเรา

# คุณสมบัติหลัก
- คุณสมบัติที่ 1: ใช้งานง่าย
- คุณสมบัติที่ 2: ประสิทธิภาพสูง
- คุณสมบัติที่ 3: ปลอดภัย

# การติดตั้ง
## ขั้นตอนที่ 1
ดาวน์โหลดไฟล์ติดตั้ง

## ขั้นตอนที่ 2
รันไฟล์ติดตั้งและทำตามคำแนะนำ

# การใช้งาน
1. เปิดแอปพลิเคชัน
2. เข้าสู่ระบบด้วยบัญชีของคุณ
3. เริ่มใช้งานฟีเจอร์ต่างๆ

# การแก้ไขปัญหา
ปัญหา: แอปพลิเคชันไม่เปิด
วิธีแก้: ตรวจสอบการติดตั้งและรีสตาร์ทเครื่อง
`;

      const result = await formatter.formatDocument(
        rawContent,
        'คู่มือการใช้งานผลิตภัณฑ์',
        'https://example.com/product'
      );

      // Verify document structure
      expect(result.title).toBe('คู่มือการใช้งานผลิตภัณฑ์');
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.htmlContent).toContain('<!DOCTYPE html>');
      expect(result.cssStyles).toContain('body {');

      // Verify Thai content is preserved
      expect(result.htmlContent).toContain('การแนะนำ');
      expect(result.htmlContent).toContain('คุณสมบัติหลัก');
      expect(result.htmlContent).toContain('การติดตั้ง');

      // Verify MFEC branding
      expect(result.htmlContent).toContain('mfec-header');
      expect(result.htmlContent).toContain('คู่มือผู้ใช้');

      // Verify table of contents
      expect(result.htmlContent).toContain('สารบัญ');

      // Verify source attribution
      expect(result.sourceAttribution.originalUrl).toBe('https://example.com/product');
      expect(result.htmlContent).toContain('ที่มาของเอกสาร');

      // Verify metadata
      expect(result.metadata.language).toBe('thai');
      expect(result.metadata.documentType).toBe('user_manual');
      expect(result.metadata.sectionCount).toBeGreaterThan(0);
    });

    it('should handle English content with product document format', async () => {
      const formatter = new MFECFormatter({
        documentType: 'product_document',
        language: 'english',
        includeTableOfContents: true
      });

      const rawContent = `
# Product Overview
This is a comprehensive product documentation.

# Key Features
- Advanced functionality
- User-friendly interface
- High performance
- Secure architecture

# Technical Specifications
- CPU: Intel Core i7
- RAM: 16GB DDR4
- Storage: 512GB SSD
- OS: Windows 11

# System Requirements
Minimum requirements:
- Windows 10 or later
- 8GB RAM
- 100GB free space

# Installation Guide
1. Download the installer
2. Run as administrator
3. Follow setup wizard
4. Restart computer

# Usage Instructions
## Getting Started
Launch the application from desktop shortcut.

## Basic Operations
- File operations
- Data processing
- Report generation
`;

      const result = await formatter.formatDocument(
        rawContent,
        'Product Documentation',
        'https://example.com/docs'
      );

      // Verify English language settings
      expect(result.htmlContent).toContain('<html lang="en">');
      expect(result.htmlContent).toContain('Table of Contents');
      expect(result.htmlContent).toContain('Product Document');

      // Verify section organization
      const sections = result.sections;
      expect(sections.some(s => s.sectionType === 'introduction')).toBe(true);
      expect(sections.some(s => s.sectionType === 'features')).toBe(true);
      expect(sections.some(s => s.sectionType === 'specifications')).toBe(true);
      expect(sections.some(s => s.sectionType === 'installation')).toBe(true);

      // Verify subsections are created
      const installSection = sections.find(s => s.title === 'Installation Guide');
      expect(installSection).toBeDefined();

      const usageSection = sections.find(s => s.title === 'Usage Instructions');
      expect(usageSection?.subsections.length).toBeGreaterThan(0);
    });
  });

  describe('Component integration', () => {
    it('should integrate ContentOrganizer with proper section creation', () => {
      const organizer = new ContentOrganizer({
        maxSectionLength: 500,
        requireIntroduction: true,
        imageDistribution: 'content-based'
      });

      const content = `
# Features
This product has many great features.

# Installation
Step-by-step installation guide.

# Usage
How to use the product effectively.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      // Should have introduction + content sections
      expect(sections.length).toBeGreaterThan(3);
      expect(sections[0].sectionType).toBe('introduction');

      // Verify section hierarchy
      const validation = DocumentSectionManager.validateHierarchy(sections);
      expect(validation.isValid).toBe(true);
    });

    it('should integrate StyleApplicator with proper CSS generation', () => {
      const styleApplicator = new StyleApplicator();

      // Test document styles
      const documentCSS = styleApplicator.generateDocumentStyles();
      expect(documentCSS).toContain('Sarabun'); // Thai font
      expect(documentCSS).toContain('#0066CC'); // MFEC blue
      expect(documentCSS).toContain('.document-container');

      // Test print styles
      const printCSS = styleApplicator.generatePrintStyles();
      expect(printCSS).toContain('@media print');
      expect(printCSS).toContain('page-break');

      // Test element styles
      const headerStyles = styleApplicator.getElementStyles('header');
      expect(headerStyles.backgroundColor).toBe('#0066CC');
    });

    it('should handle complex content with mixed elements', async () => {
      const formatter = new MFECFormatter();

      const complexContent = `
# Introduction
This is a complex document with various content types.

## Overview
Brief overview of the system.

# Features and Capabilities
The system provides:

- **Core Features**
  - Feature A: Description of feature A
  - Feature B: Description of feature B
- **Advanced Features**
  - Advanced feature 1
  - Advanced feature 2

# Installation Process
Follow these steps:

1. **Preparation**
   - Check system requirements
   - Download installer
   
2. **Installation**
   \`\`\`bash
   ./installer --install
   \`\`\`
   
3. **Configuration**
   Edit the config file:
   \`\`\`json
   {
     "setting1": "value1",
     "setting2": "value2"
   }
   \`\`\`

# Troubleshooting
Common issues and solutions:

**Problem**: Application won't start
**Solution**: Check system requirements and reinstall

**Problem**: Performance issues
**Solution**: Increase memory allocation
`;

      const result = await formatter.formatDocument(
        complexContent,
        'Complex System Documentation',
        'https://example.com/complex'
      );

      // Verify complex structure is handled
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.htmlContent).toContain('Introduction');
      expect(result.htmlContent).toContain('Features and Capabilities');
      expect(result.htmlContent).toContain('Installation Process');
      expect(result.htmlContent).toContain('Troubleshooting');

      // Verify code blocks are preserved
      expect(result.htmlContent).toContain('./installer --install');
      expect(result.htmlContent).toContain('"setting1": "value1"');

      // Verify lists are formatted
      expect(result.htmlContent).toContain('<li>');
      expect(result.htmlContent).toContain('<ul>');

      // Verify sections exist
      const introSection = result.sections.find(s => s.title === 'Introduction');
      expect(introSection).toBeDefined();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle empty or minimal content', async () => {
      const formatter = new MFECFormatter();

      const minimalContent = 'Just a single line of content.';
      const result = await formatter.formatDocument(
        minimalContent,
        'Minimal Document',
        'https://example.com'
      );

      expect(result.htmlContent).toContain('<!DOCTYPE html>');
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should handle content with no headings', async () => {
      const formatter = new MFECFormatter();

      const noHeadingsContent = `
This is a document without any headings.
It just contains paragraphs of text.

Another paragraph with more information.
And yet another paragraph to make it longer.
`;

      const result = await formatter.formatDocument(
        noHeadingsContent,
        'No Headings Document',
        'https://example.com'
      );

      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.htmlContent).toContain('This is a document');
    });

    it('should handle special characters and formatting', async () => {
      const formatter = new MFECFormatter();

      const specialContent = `
# Special Characters & Formatting
This content has "quotes", <tags>, and & symbols.

## Code Example
\`\`\`javascript
const message = "Hello, World!";
console.log(message);
\`\`\`

## Mathematical Expressions
E = mc²
α + β = γ
`;

      const result = await formatter.formatDocument(
        specialContent,
        'Special Characters Test',
        'https://example.com'
      );

      expect(result.htmlContent).toContain('Special Characters &amp; Formatting' || 'Special Characters & Formatting');
      expect(result.htmlContent).toContain('console.log(message)');
      expect(result.htmlContent).toContain('E = mc²');
    });
  });

  describe('Performance and scalability', () => {
    it('should handle large documents efficiently', async () => {
      const formatter = new MFECFormatter();

      // Generate large content
      const sections = Array.from({ length: 20 }, (_, i) => `
# Section ${i + 1}
This is section ${i + 1} with substantial content. ${'Lorem ipsum '.repeat(50)}

## Subsection ${i + 1}.1
More detailed content for subsection. ${'Detailed information '.repeat(30)}

## Subsection ${i + 1}.2
Additional subsection content. ${'Additional details '.repeat(25)}
`).join('\n');

      const startTime = Date.now();
      const result = await formatter.formatDocument(
        sections,
        'Large Document Test',
        'https://example.com'
      );
      const endTime = Date.now();

      // Should complete within reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      // Should produce valid output
      expect(result.sections.length).toBeGreaterThan(20);
      expect(result.metadata.wordCount).toBeGreaterThan(1000);
      expect(result.htmlContent).toContain('<!DOCTYPE html>');
    });
  });

  describe('Customization and configuration', () => {
    it('should respect custom organization rules', async () => {
      const formatter = new MFECFormatter({
        organizationRules: {
          maxSectionLength: 100,
          requireIntroduction: false,
          imageDistribution: 'even'
        }
      });

      const longContent = `
# Long Section
${'This is a very long section with lots of content. '.repeat(20)}
`;

      const result = await formatter.formatDocument(
        longContent,
        'Custom Rules Test',
        'https://example.com'
      );

      // Should not have auto-generated introduction
      expect(result.sections.every(s => 
        s.sectionType !== 'introduction' || s.title !== 'Introduction'
      )).toBe(true);

      // Long section should be split due to maxSectionLength
      const longSection = result.sections.find(s => s.title === 'Long Section');
      expect(longSection?.subsections.length).toBeGreaterThan(0);
    });

    it('should apply custom styles', async () => {
      const formatter = new MFECFormatter({
        customStyles: {
          colors: {
            primary: '#FF0000',
            secondary: '#00FF00'
          },
          fonts: {
            primaryFont: 'Custom Font, Arial, sans-serif'
          }
        }
      });

      const result = await formatter.formatDocument(
        '# Test\nContent',
        'Custom Styles Test',
        'https://example.com'
      );

      expect(result.cssStyles).toContain('#FF0000');
      expect(result.cssStyles).toContain('Custom Font');
    });
  });
});