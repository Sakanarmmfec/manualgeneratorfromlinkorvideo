'use client';

import React, { useState } from 'react';
import { 
  Book, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink,
  Play,
  FileText,
  Settings,
  Download,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import { animations } from '@/utils/animations';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  subsections?: HelpSection[];
}

interface HelpDocumentationProps {
  className?: string;
}

export function HelpDocumentation({ className = '' }: HelpDocumentationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));
  const [activeSection, setActiveSection] = useState('getting-started');

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'เริ่มต้นใช้งาน',
      icon: <Play className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Thai Document Generator เป็นระบบสร้างเอกสารภาษาไทยอัตโนมัติที่ใช้ AI 
            ในการแปลและจัดรูปแบบเนื้อหาจากลิงก์ผลิตภัณฑ์หรือวิดีโอ YouTube
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">ขั้นตอนการใช้งานเบื้องต้น:</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>ใส่ URL ผลิตภัณฑ์หรือวิดีโอ YouTube</li>
              <li>เลือกประเภทเอกสารที่ต้องการ</li>
              <li>ปรับตัวเลือกตามความต้องการ</li>
              <li>คลิก "สร้างเอกสาร" และรอผลลัพธ์</li>
              <li>แก้ไขและดาวน์โหลดเอกสาร</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">เคล็ดลับ:</h4>
                <p className="text-green-800 text-sm">
                  ใช้คีย์บอร์ดลัด Ctrl+N เพื่อเริ่มสร้างเอกสารใหม่ได้อย่างรวดเร็ว
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'supported-sources',
      title: 'แหล่งข้อมูลที่รองรับ',
      icon: <ExternalLink className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                เว็บไซต์ผลิตภัณฑ์
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• หน้าผลิตภัณฑ์ e-commerce</li>
                <li>• เว็บไซต์บริษัท</li>
                <li>• หน้าข้อมูลจำเพาะ</li>
                <li>• บล็อกและบทความ</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Play className="h-4 w-4 mr-2" />
                วิดีโอ YouTube
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• วิดีโอสาธิตผลิตภัณฑ์</li>
                <li>• คู่มือการใช้งาน</li>
                <li>• รีวิวและแนะนำ</li>
                <li>• วิดีโอการติดตั้ง</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">ข้อจำกัด:</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• เว็บไซต์ต้องเข้าถึงได้สาธารณะ</li>
                  <li>• วิดีโอ YouTube ต้องไม่มีการจำกัดอายุ</li>
                  <li>• เนื้อหาต้องเป็นภาษาอังกฤษหรือไทย</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'document-types',
      title: 'ประเภทเอกสาร',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">คู่มือผู้ใช้ (User Manual)</h4>
              <p className="text-gray-600 text-sm mb-3">
                เหมาะสำหรับการสร้างคู่มือการใช้งานที่มีขั้นตอนชัดเจน
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-gray-800 mb-2">โครงสร้างเอกสาร:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ข้อมูลเบื้องต้น</li>
                  <li>• การติดตั้งและเตรียมความพร้อม</li>
                  <li>• วิธีการใช้งานทีละขั้นตอน</li>
                  <li>• การแก้ไขปัญหาเบื้องต้น</li>
                  <li>• คำถามที่พบบ่อย</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">เอกสารผลิตภัณฑ์ (Product Document)</h4>
              <p className="text-gray-600 text-sm mb-3">
                เหมาะสำหรับการนำเสนอข้อมูลผลิตภัณฑ์และคุณสมบัติ
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-gray-800 mb-2">โครงสร้างเอกสาร:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ภาพรวมผลิตภัณฑ์</li>
                  <li>• คุณสมบัติและฟีเจอร์หลัก</li>
                  <li>• ข้อมูลจำเพาะทางเทคนิค</li>
                  <li>• ข้อดีและจุดเด่น</li>
                  <li>• การเปรียบเทียบ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-key-management',
      title: 'การจัดการ API Key',
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            ระบบใช้ API Key เพื่อเข้าถึงบริการ AI ของ MFEC สำหรับการแปลและประมวลผลเนื้อหา
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">API Key หลัก</h4>
              <p className="text-blue-800 text-sm">
                ระบบจะใช้ API Key หลักของ MFEC เป็นอันดับแรก 
                ซึ่งมีการจำกัดการใช้งานตามนโยบายของบริษัท
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">API Key ผู้ใช้</h4>
              <p className="text-green-800 text-sm mb-2">
                เมื่อ API Key หลักหมดอายุ คุณสามารถเพิ่ม API Key ของตัวเองได้
              </p>
              <div className="text-green-800 text-sm">
                <p className="font-medium mb-1">วิธีการรับ API Key:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>เข้าสู่ระบบ MFEC LiteLLM Portal</li>
                  <li>ไปที่หน้า API Keys</li>
                  <li>สร้าง API Key ใหม่</li>
                  <li>คัดลอกและใส่ในระบบ</li>
                </ol>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">ความปลอดภัย</h4>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• API Key จะถูกเก็บเฉพาะในเซสชันปัจจุบัน</li>
                <li>• ไม่มีการบันทึกข้อมูลถาวร</li>
                <li>• การเชื่อมต่อใช้ HTTPS เท่านั้น</li>
                <li>• API Key จะถูกลบเมื่อปิดเบราว์เซอร์</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts',
      title: 'คีย์บอร์ดลัด',
      icon: <HelpCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            ใช้คีย์บอร์ดลัดเพื่อเพิ่มประสิทธิภาพการทำงาน
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">เอกสาร</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">สร้างเอกสารใหม่</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+N</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">บันทึกเอกสาร</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+S</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">แสดงตัวอย่าง</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+P</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">ดาวน์โหลด</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+D</kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">ระบบ</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">การตั้งค่า</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+,</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">ความช่วยเหลือ</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">?</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">ค้นหา</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+K</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'การแก้ไขปัญหา',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">ปัญหาที่พบบ่อย</h4>
              
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-red-800">URL ไม่สามารถเข้าถึงได้</h5>
                  <ul className="text-red-700 text-sm mt-1 space-y-1">
                    <li>• ตรวจสอบว่า URL ถูกต้องและเข้าถึงได้</li>
                    <li>• ลองเปิด URL ในเบราว์เซอร์ก่อน</li>
                    <li>• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-red-800">API Key หมดอายุ</h5>
                  <ul className="text-red-700 text-sm mt-1 space-y-1">
                    <li>• ไปที่การตั้งค่า API Key</li>
                    <li>• เพิ่ม API Key ของคุณเอง</li>
                    <li>• ติดต่อทีม IT หาก API Key หลักมีปัญหา</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-red-800">การสร้างเอกสารล้มเหลว</h5>
                  <ul className="text-red-700 text-sm mt-1 space-y-1">
                    <li>• ลองใหม่อีกครั้งหลังจากรอสักครู่</li>
                    <li>• ตรวจสอบว่าเนื้อหามีภาษาที่รองรับ</li>
                    <li>• ลองใช้ URL อื่นเพื่อทดสอบ</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">เคล็ดลับเพิ่มประสิทธิภาพ</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• เลือก URL ที่มีเนื้อหาครบถ้วนและชัดเจน</li>
                <li>• ใส่คำแนะนำเพิ่มเติมเพื่อปรับแต่งผลลัพธ์</li>
                <li>• ตรวจสอบตัวอย่างก่อนดาวน์โหลด</li>
                <li>• ใช้คีย์บอร์ดลัดเพื่อทำงานได้เร็วขึ้น</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาหัวข้อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeSection === section.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className={`${
                  activeSection === section.id ? 'block' : 'hidden'
                } ${animations.fadeIn}`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  {section.icon}
                  <h1 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h1>
                </div>
                
                <div className="prose prose-gray max-w-none">
                  {section.content}
                </div>
              </div>
            ))}

            {filteredSections.length === 0 && (
              <div className="text-center py-12">
                <Book className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบหัวข้อที่ตรงกับการค้นหา</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}