'use client';

import React, { useState } from 'react';
import { DocumentPreview } from './DocumentPreview';
import { GeneratedDocument, DocumentSection, ProcessedContent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data for demonstration
const createMockDocument = (): GeneratedDocument => {
  const mockSections: DocumentSection[] = [
    {
      id: 'intro-1',
      title: 'บทนำ',
      content: `<p>ยินดีต้อนรับสู่คู่มือการใช้งานผลิตภัณฑ์นี้ เอกสารนี้จะแนะนำคุณเกี่ยวกับคุณสมบัติและวิธีการใช้งานต่างๆ ที่จะช่วยให้คุณได้รับประสบการณ์ที่ดีที่สุดจากผลิตภัณฑ์</p>
      <p>ผลิตภัณฑ์นี้ได้รับการออกแบบมาเพื่อให้ใช้งานง่าย มีประสิทธิภาพสูง และตอบสนองความต้องการของผู้ใช้ในยุคดิจิทัล</p>`,
      level: 1,
      subsections: [],
      images: [
        {
          imageId: 'intro-img-1',
          position: 'top',
          caption: 'ภาพรวมของผลิตภัณฑ์',
          size: 'large'
        }
      ],
      sectionType: 'introduction'
    },
    {
      id: 'features-1',
      title: 'คุณสมบัติหลัก',
      content: `<p>ผลิตภัณฑ์นี้มาพร้อมกับคุณสมบัติที่หลากหลายเพื่อตอบสนองความต้องการของผู้ใช้:</p>
      <ul>
        <li><strong>ใช้งานง่าย:</strong> อินเทอร์เฟซที่เรียบง่ายและเข้าใจง่าย</li>
        <li><strong>ประสิทธิภาพสูง:</strong> การประมวลผลที่รวดเร็วและเสถียร</li>
        <li><strong>ความปลอดภัย:</strong> การเข้ารหัสข้อมูลและการรักษาความปลอดภัยระดับสูง</li>
        <li><strong>การปรับแต่ง:</strong> สามารถปรับแต่งได้ตามความต้องการ</li>
      </ul>`,
      level: 1,
      subsections: [
        {
          id: 'features-ui-1',
          title: 'อินเทอร์เฟซผู้ใช้',
          content: `<p>อินเทอร์เฟซได้รับการออกแบบให้ใช้งานง่าย เหมาะสำหรับผู้ใช้ทุกระดับ ตั้งแต่ผู้เริ่มต้นจนถึงผู้เชี่ยวชาญ</p>`,
          level: 2,
          subsections: [],
          images: [
            {
              imageId: 'ui-img-1',
              position: 'inline',
              caption: 'หน้าจอหลักของแอปพลิเคชัน',
              size: 'medium'
            }
          ],
          sectionType: 'features'
        }
      ],
      images: [],
      sectionType: 'features'
    },
    {
      id: 'installation-1',
      title: 'การติดตั้ง',
      content: `<p>การติดตั้งผลิตภัณฑ์นี้เป็นเรื่องง่าย เพียงทำตามขั้นตอนต่อไปนี้:</p>
      <ol>
        <li>ดาวน์โหลดไฟล์ติดตั้งจากเว็บไซต์อย่างเป็นทางการ</li>
        <li>เรียกใช้ไฟล์ติดตั้งและทำตามคำแนะนำ</li>
        <li>รีสตาร์ทระบบเมื่อการติดตั้งเสร็จสิ้น</li>
        <li>เปิดแอปพลิเคชันและทำการตั้งค่าเริ่มต้น</li>
      </ol>`,
      level: 1,
      subsections: [],
      images: [
        {
          imageId: 'install-img-1',
          position: 'bottom',
          caption: 'หน้าจอการติดตั้ง',
          size: 'medium'
        }
      ],
      sectionType: 'installation'
    }
  ];

  const mockProcessedContent: ProcessedContent = {
    translatedContent: 'เนื้อหาที่แปลแล้ว',
    organizedSections: mockSections,
    refinedContent: 'เนื้อหาที่ปรับปรุงแล้ว',
    sourceAttribution: {
      originalUrl: 'https://example.com/product',
      extractionDate: new Date(),
      contentType: 'website',
      attribution: 'ข้อมูลจาก Example Product Website'
    },
    qualityScore: 0.95
  };

  return {
    id: 'doc-1',
    title: 'คู่มือการใช้งานผลิตภัณฑ์ตัวอย่าง',
    content: mockProcessedContent,
    template: {
      templatePath: '/templates/mfec-template.docx',
      brandGuidelinePath: '/templates/mfec-brand-guideline.pdf',
      logoAssets: {
        standard: '/logos/mfec-standard.png',
        white: '/logos/mfec-white.png',
        ai: '/logos/mfec-ai.ai'
      },
      documentType: 'user_manual',
      styleSettings: {
        primaryColors: ['#3b82f6', '#1e40af'],
        fonts: {
          primaryFont: 'Sarabun',
          secondaryFont: 'Inter',
          headerFont: 'Sarabun',
          bodyFont: 'Sarabun',
          sizes: {
            h1: 24,
            h2: 20,
            h3: 18,
            body: 14,
            caption: 12
          }
        },
        spacing: {
          margins: { top: 20, bottom: 20, left: 20, right: 20 },
          padding: { section: 16, paragraph: 8 },
          lineHeight: 1.6
        },
        headerFooterSettings: {
          includeHeader: true,
          includeFooter: true,
          headerHeight: 60,
          footerHeight: 40,
          logoPosition: 'left'
        },
        logoPlacement: {
          headerLogo: 'standard',
          footerLogo: 'standard',
          documentLogo: 'standard',
          maxWidth: 120,
          maxHeight: 60
        }
      }
    },
    sourceAttribution: {
      originalUrl: 'https://example.com/product',
      extractionDate: new Date(),
      contentType: 'website',
      attribution: 'ข้อมูลจาก Example Product Website'
    },
    generationMetadata: {
      generatedAt: new Date(),
      processingTime: 45000,
      aiModel: 'gpt-4o',
      version: '1.0.0'
    },
    previewUrl: '/preview/doc-1',
    downloadFormats: ['pdf', 'docx']
  };
};

export function PreviewDemo() {
  const [document, setDocument] = useState<GeneratedDocument>(createMockDocument());
  const [isEditing, setIsEditing] = useState(false);

  const handleDocumentUpdate = (updatedDocument: GeneratedDocument) => {
    setDocument(updatedDocument);
    console.log('Document updated:', updatedDocument);
  };

  const handleSave = () => {
    console.log('Saving document:', document);
    // In a real implementation, this would save to backend
  };

  const handleDownload = (format: 'pdf' | 'docx') => {
    console.log(`Downloading document as ${format}:`, document);
    // In a real implementation, this would trigger download
    alert(`กำลังดาวน์โหลดเอกสารในรูปแบบ ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Demo Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ตัวอย่างการแสดงผลและแก้ไขเอกสาร</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              นี่คือตัวอย่างของระบบแสดงผลและแก้ไขเอกสารที่สร้างขึ้น 
              คุณสามารถเปลี่ยนโหมดแก้ไข แก้ไขเนื้อหาแต่ละส่วน และจัดการรูปภาพได้
            </p>
            <div className="flex gap-4">
              <Button
                variant={isEditing ? "primary" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'ออกจากโหมดแก้ไข' : 'เข้าสู่โหมดแก้ไข'}
              </Button>
              <Button variant="outline" onClick={() => setDocument(createMockDocument())}>
                รีเซ็ตเอกสาร
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <DocumentPreview
          document={document}
          onDocumentUpdate={handleDocumentUpdate}
          onSave={handleSave}
          onDownload={handleDownload}
          isEditing={isEditing}
          onEditModeChange={setIsEditing}
        />
      </div>
    </div>
  );
}