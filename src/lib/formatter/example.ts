/**
 * Example usage of the Document Formatter module
 * Demonstrates how to use the MFEC formatter components
 */

import { MFECFormatter, ContentOrganizer, StyleApplicator, DocumentSectionManager } from './index';

// Example 1: Basic document formatting
export async function basicFormattingExample() {
  const formatter = new MFECFormatter({
    documentType: 'user_manual',
    language: 'thai',
    includeTableOfContents: true,
    includeSourceAttribution: true
  });

  const content = `
# การแนะนำ
นี่คือคู่มือการใช้งานสำหรับผลิตภัณฑ์ของเรา ระบบนี้ได้รับการออกแบบมาเพื่อให้ใช้งานง่ายและมีประสิทธิภาพ

# คุณสมบัติหลัก
ผลิตภัณฑ์ของเรามีคุณสมบัติที่โดดเด่น ดังนี้:

- **ใช้งานง่าย**: อินเทอร์เฟซที่เข้าใจง่าย
- **ประสิทธิภาพสูง**: ประมวลผลได้รวดเร็ว
- **ปลอดภัย**: มีระบบรักษาความปลอดภัยที่แข็งแกร่ง

# การติดตั้ง
## ความต้องการของระบบ
- Windows 10 หรือใหม่กว่า
- RAM อย่างน้อย 4GB
- พื้นที่ว่างในฮาร์ดดิสก์ 2GB

## ขั้นตอนการติดตั้ง
1. ดาวน์โหลดไฟล์ติดตั้งจากเว็บไซต์
2. รันไฟล์ติดตั้งด้วยสิทธิ์ Administrator
3. ทำตามขั้นตอนในหน้าจอติดตั้ง
4. รีสตาร์ทเครื่องคอมพิวเตอร์

# การใช้งาน
เมื่อติดตั้งเสร็จแล้ว คุณสามารถเริ่มใช้งานได้ทันที

## การเข้าสู่ระบบ
1. คลิกไอคอนโปรแกรมบนเดสก์ท็อป
2. ป้อนชื่อผู้ใช้และรหัสผ่าน
3. คลิกปุ่ม "เข้าสู่ระบบ"

## การใช้งานพื้นฐาน
- สร้างโปรเจกต์ใหม่
- เปิดไฟล์ที่มีอยู่
- บันทึกงาน
- ส่งออกผลงาน

# การแก้ไขปัญหา
## ปัญหาที่พบบ่อย

**ปัญหา**: โปรแกรมไม่สามารถเปิดได้
**วิธีแก้**: 
- ตรวจสอบความต้องการของระบบ
- รีสตาร์ทเครื่องคอมพิวเตอร์
- ติดตั้งโปรแกรมใหม่

**ปัญหา**: ประสิทธิภาพช้า
**วิธีแก้**:
- ปิดโปรแกรมอื่นที่ไม่จำเป็น
- เพิ่ม RAM ของเครื่อง
- ตรวจสอบพื้นที่ฮาร์ดดิสก์
`;

  const result = await formatter.formatDocument(
    content,
    'คู่มือการใช้งานผลิตภัณฑ์',
    'https://example.com/product-manual'
  );

  console.log('Generated document ID:', result.id);
  console.log('Number of sections:', result.sections.length);
  console.log('Word count:', result.metadata.wordCount);
  console.log('Document type:', result.metadata.documentType);

  return result;
}

// Example 2: English product document
export async function englishProductDocumentExample() {
  const formatter = new MFECFormatter({
    documentType: 'product_document',
    language: 'english',
    includeTableOfContents: true,
    includeSourceAttribution: true
  });

  const content = `
# Product Overview
Our innovative software solution provides comprehensive document management capabilities for modern businesses.

# Key Features
## Core Functionality
- Document creation and editing
- Version control and tracking
- Collaborative editing
- Advanced search capabilities

## Advanced Features
- AI-powered content suggestions
- Automated formatting
- Multi-language support
- Cloud synchronization

# Technical Specifications
- **Platform**: Cross-platform (Windows, macOS, Linux)
- **Memory**: Minimum 8GB RAM recommended
- **Storage**: 5GB available space
- **Network**: Internet connection required for cloud features

# System Requirements
## Minimum Requirements
- Operating System: Windows 10, macOS 10.15, or Ubuntu 18.04
- Processor: Intel Core i5 or equivalent
- Memory: 4GB RAM
- Graphics: DirectX 11 compatible

## Recommended Requirements
- Operating System: Latest version
- Processor: Intel Core i7 or equivalent
- Memory: 16GB RAM
- Graphics: Dedicated graphics card

# Installation Guide
1. Download the installer from our website
2. Run the installer with administrator privileges
3. Accept the license agreement
4. Choose installation directory
5. Complete the installation process
6. Launch the application

# Usage Instructions
## Getting Started
After installation, launch the application and create your first project.

## Basic Operations
- Create new documents
- Import existing files
- Apply formatting styles
- Save and export documents

## Advanced Usage
- Set up collaboration workflows
- Configure automated backups
- Customize user interface
- Integrate with third-party tools
`;

  const result = await formatter.formatDocument(
    content,
    'Product Documentation',
    'https://example.com/product-docs'
  );

  return result;
}

// Example 3: Custom styling and organization
export async function customStyledDocumentExample() {
  const formatter = new MFECFormatter({
    documentType: 'user_manual',
    language: 'thai',
    organizationRules: {
      maxSectionLength: 800,
      requireIntroduction: true,
      imageDistribution: 'content-based'
    },
    customStyles: {
      colors: {
        primary: '#0066CC',
        secondary: '#FF6B35',
        accent: '#00A86B',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF'
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F9FAFB',
          accent: '#F3F4F6'
        },
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
          dark: '#9CA3AF'
        }
      },
      fonts: {
        primaryFont: 'Sarabun, "Noto Sans Thai", Arial, sans-serif',
        secondaryFont: 'Inter, system-ui, sans-serif',
        headingFont: 'Prompt, "Noto Sans Thai", Arial, sans-serif',
        codeFont: 'Fira Code, Consolas, monospace',
        sizes: {
          h1: 32,
          h2: 24,
          h3: 20,
          h4: 18,
          body: 16,
          caption: 14
        },
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700
        }
      }
    }
  });

  const content = `
# ระบบจัดการเอกสาร
ระบบจัดการเอกสารอัจฉริยะที่ช่วยให้การทำงานมีประสิทธิภาพมากขึ้น

# ฟีเจอร์เด่น
- การจัดการไฟล์อัตโนมัติ
- ระบบค้นหาขั้นสูง
- การทำงานร่วมกันแบบเรียลไทม์
- การสำรองข้อมูลอัตโนมัติ
`;

  const result = await formatter.formatDocument(
    content,
    'คู่มือระบบจัดการเอกสาร',
    'https://example.com/document-system'
  );

  return result;
}

// Example 4: Working with individual components
export function componentUsageExample() {
  // Using ContentOrganizer directly
  const organizer = new ContentOrganizer({
    maxSectionLength: 1000,
    requireIntroduction: true,
    imageDistribution: 'even'
  });

  const rawContent = `
# Introduction
This is sample content.

# Features
- Feature 1
- Feature 2

# Usage
How to use the system.
`;

  const sections = organizer.organizeContent(rawContent, 'user_manual');
  console.log('Organized sections:', sections.length);

  // Using StyleApplicator directly
  const styleApplicator = new StyleApplicator();
  const css = styleApplicator.generateDocumentStyles();
  console.log('Generated CSS length:', css.length);

  // Working with DocumentSection directly
  const section = DocumentSectionManager.createSection(
    'Example Section',
    'This is example content for the section.',
    'usage',
    1,
    0
  );

  const subsection = DocumentSectionManager.createSection(
    'Subsection',
    'This is subsection content.',
    'installation',
    2,
    0
  );

  DocumentSectionManager.addSubsection(section, subsection);

  console.log('Section with subsection:', {
    title: section.title,
    subsectionCount: section.subsections.length,
    wordCount: section.metadata?.wordCount
  });

  return { sections, css, section };
}

// Example 5: Error handling and validation
export async function errorHandlingExample() {
  const formatter = new MFECFormatter();

  try {
    // Test with empty content
    const result1 = await formatter.formatDocument(
      '',
      'Empty Document',
      'https://example.com'
    );
    console.log('Empty document handled successfully');

    // Test with special characters
    const result2 = await formatter.formatDocument(
      '# Special "Characters" & <Tags>\nContent with special chars.',
      'Special Characters Test',
      'https://example.com'
    );
    console.log('Special characters handled successfully');

    // Test section validation
    const section = DocumentSectionManager.createSection(
      'Test Section',
      '', // Empty content
      'usage',
      1,
      0
    );

    const validation = DocumentSectionManager.validateHierarchy([section]);
    if (!validation.isValid) {
      console.log('Validation errors detected:', validation.errors);
    }

  } catch (error) {
    console.error('Error in formatting:', error);
  }
}

// Export all examples for easy testing
export const examples = {
  basicFormattingExample,
  englishProductDocumentExample,
  customStyledDocumentExample,
  componentUsageExample,
  errorHandlingExample
};

// Default export for convenience
export default examples;