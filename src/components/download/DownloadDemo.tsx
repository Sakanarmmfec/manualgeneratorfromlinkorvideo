'use client';

import React, { useState } from 'react';
import { DownloadInterface } from './DownloadInterface';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GeneratedDocument } from '@/types';
import { RefreshCw, FileText } from 'lucide-react';

// Mock document data for demonstration
const mockDocument: GeneratedDocument = {
  id: 'demo-doc-1',
  title: 'คู่มือการใช้งานผลิตภัณฑ์ตัวอย่าง',
  content: {
    translatedContent: 'เนื้อหาที่แปลแล้ว...',
    organizedSections: [
      {
        id: 'intro',
        title: 'บทนำ',
        content: '<p>นี่คือบทนำของเอกสาร</p>',
        subsections: [],
        images: [],
        sectionType: 'introduction'
      },
      {
        id: 'features',
        title: 'คุณสมบัติ',
        content: '<p>คุณสมบัติต่างๆ ของผลิตภัณฑ์</p>',
        subsections: [],
        images: [],
        sectionType: 'features'
      }
    ],
    refinedContent: 'เนื้อหาที่ปรับปรุงแล้ว...',
    sourceAttribution: {
      originalUrl: 'https://example.com/product-page',
      extractionDate: new Date('2024-01-15T10:00:00'),
      contentType: 'website',
      attribution: 'ข้อมูลจาก example.com'
    },
    qualityScore: 0.95
  },
  template: {
    templatePath: '.qodo/Template/MFEC_System&User_Manual_Template.docx',
    brandGuidelinePath: '.qodo/Template/ENG_MFEC Brand Guideline.pdf',
    logoAssets: {
      standard: '.qodo/Template/Logo MFEC.png',
      white: '.qodo/Template/Logo MFEC White.png',
      ai: '.qodo/Template/Logo MFEC More. 2023ai.ai'
    },
    documentType: 'user_manual',
    styleSettings: {
      primaryColors: ['#1E40AF', '#3B82F6'],
      fonts: {
        primaryFont: 'Sarabun',
        secondaryFont: 'Prompt',
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
        margins: { top: 25, bottom: 25, left: 25, right: 25 },
        padding: { section: 16, paragraph: 8 },
        lineHeight: 1.5
      },
      headerFooterSettings: {
        includeHeader: true,
        includeFooter: true,
        headerHeight: 50,
        footerHeight: 30,
        logoPosition: 'right'
      },
      logoPlacement: {
        headerLogo: 'standard',
        footerLogo: 'standard',
        documentLogo: 'standard',
        maxWidth: 100,
        maxHeight: 50
      }
    }
  },
  sourceAttribution: {
    originalUrl: 'https://example.com/product-page',
    extractionDate: new Date('2024-01-15T10:00:00'),
    contentType: 'website',
    attribution: 'ข้อมูลจาก example.com'
  },
  generationMetadata: {
    generatedAt: new Date('2024-01-15T10:30:00'),
    processingTime: 45000, // 45 seconds
    aiModel: 'gpt-4o',
    version: '1.0.0'
  },
  previewUrl: '/preview/demo-doc-1',
  downloadFormats: ['pdf', 'docx']
};

export function DownloadDemo() {
  const [notifications, setNotifications] = useState<Array<{
    type: 'success' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  const handleDownloadComplete = (filename: string, format: 'pdf' | 'docx') => {
    setNotifications(prev => [...prev, {
      type: 'success',
      message: `ดาวน์โหลด ${filename} (${format.toUpperCase()}) เสร็จสิ้น`,
      timestamp: new Date()
    }]);
  };

  const handleDownloadError = (error: string) => {
    setNotifications(prev => [...prev, {
      type: 'error',
      message: `เกิดข้อผิดพลาด: ${error}`,
      timestamp: new Date()
    }]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            ตัวอย่างระบบดาวน์โหลดและส่งออกเอกสาร
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              นี่คือตัวอย่างการทำงานของระบบดาวน์โหลดและส่งออกเอกสาร 
              ซึ่งรองรับการดาวน์โหลดในรูปแบบ PDF และ DOCX พร้อมตัวเลือกการปรับแต่งต่างๆ
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900">คุณสมบัติหลัก</h4>
                <ul className="mt-2 text-blue-800 space-y-1">
                  <li>• ดาวน์โหลด PDF และ DOCX</li>
                  <li>• ตั้งชื่อไฟล์อัตโนมัติ</li>
                  <li>• แสดงความคืบหน้า</li>
                  <li>• ประวัติการดาวน์โหลด</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-900">ตัวเลือกขั้นสูง</h4>
                <ul className="mt-2 text-green-800 space-y-1">
                  <li>• รวมข้อมูลแหล่งที่มา</li>
                  <li>• เพิ่มลายน้ำ MFEC</li>
                  <li>• ปรับระดับการบีบอัด</li>
                  <li>• ตั้งค่าวันที่สร้าง</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-medium text-purple-900">การจัดการไฟล์</h4>
                <ul className="mt-2 text-purple-800 space-y-1">
                  <li>• ค้นหาและกรองไฟล์</li>
                  <li>• ดาวน์โหลดซ้ำ</li>
                  <li>• ลบไฟล์เก่า</li>
                  <li>• แจ้งเตือนหมดอายุ</li>
                </ul>
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">การแจ้งเตือน</h4>
                  <Button variant="ghost" size="sm" onClick={clearNotifications}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    ล้าง
                  </Button>
                </div>
                {notifications.slice(-3).map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      notification.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span>{notification.message}</span>
                      <span className="text-xs opacity-75">
                        {notification.timestamp.toLocaleTimeString('th-TH')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download Interface */}
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={handleDownloadComplete}
        onDownloadError={handleDownloadError}
      />

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. เลือกรูปแบบไฟล์</h4>
              <p className="text-gray-600 ml-4">
                คลิกที่ปุ่ม PDF หรือ DOCX เพื่อเลือกรูปแบบที่ต้องการ 
                PDF เหมาะสำหรับการแชร์ ส่วน DOCX เหมาะสำหรับการแก้ไข
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. ปรับแต่งชื่อไฟล์</h4>
              <p className="text-gray-600 ml-4">
                ระบบจะสร้างชื่อไฟล์อัตโนมัติตามรูปแบบ: ชื่อเอกสาร-แหล่งที่มา-วันที่ 
                หรือคุณสามารถกำหนดชื่อเองได้
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. เลือกตัวเลือกเพิ่มเติม</h4>
              <p className="text-gray-600 ml-4">
                คลิก "แสดงตัวเลือกขั้นสูง" เพื่อปรับแต่งการรวมข้อมูลแหล่งที่มา 
                การเพิ่มลายน้ำ และระดับการบีบอัด
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">4. ดาวน์โหลดเอกสาร</h4>
              <p className="text-gray-600 ml-4">
                คลิกปุ่ม "ดาวน์โหลด" และรอให้ระบบประมวลผล 
                คุณจะเห็นความคืบหน้าและเวลาที่เหลือโดยประมาณ
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">5. จัดการประวัติการดาวน์โหลด</h4>
              <p className="text-gray-600 ml-4">
                ดูประวัติการดาวน์โหลดทั้งหมด ค้นหาไฟล์ที่ต้องการ 
                และดาวน์โหลดซ้ำได้ภายใน 7 วัน
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}