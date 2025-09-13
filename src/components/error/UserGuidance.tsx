'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { HelpTooltip } from './HelpTooltip';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Youtube, 
  FileText, 
  Settings,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
}

interface UserGuidanceProps {
  currentStep?: string;
  className?: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 'input',
    title: 'ใส่ URL หรือเนื้อหา',
    description: 'เริ่มต้นด้วยการใส่ URL ของผลิตภัณฑ์หรือวิดีโอ YouTube ที่ต้องการสร้างเอกสาร',
    icon: <Globe className="h-5 w-5" />,
    tips: [
      'URL ต้องเป็น https:// หรือ http://',
      'รองรับเว็บไซต์ผลิตภัณฑ์และวิดีโอ YouTube',
      'ตรวจสอบให้แน่ใจว่า URL สามารถเข้าถึงได้'
    ]
  },
  {
    id: 'type',
    title: 'เลือกประเภทเอกสาร',
    description: 'เลือกว่าต้องการสร้างคู่มือผู้ใช้หรือเอกสารผลิตภัณฑ์',
    icon: <FileText className="h-5 w-5" />,
    tips: [
      'คู่มือผู้ใช้: เน้นวิธีการใช้งานและแก้ไขปัญหา',
      'เอกสารผลิตภัณฑ์: เน้นคุณสมบัติและข้อมูลทางเทคนิค'
    ]
  },
  {
    id: 'options',
    title: 'ตั้งค่าตัวเลือก',
    description: 'เลือกตัวเลือกเพิ่มเติมตามประเภทของเนื้อหา',
    icon: <Settings className="h-5 w-5" />,
    tips: [
      'สำหรับเว็บไซต์: เลือกรวมรูปภาพหรือไม่',
      'สำหรับ YouTube: เลือกจับภาพหน้าจอหรือไม่',
      'ใส่คำแนะนำเพิ่มเติมได้ในช่องตัวเลือกขั้นสูง'
    ]
  },
  {
    id: 'processing',
    title: 'รอการประมวลผล',
    description: 'ระบบจะดึงข้อมูล แปลภาษา และจัดรูปแบบตามมาตรฐาน MFEC',
    icon: <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent" />,
    tips: [
      'การประมวลผลใช้เวลา 2-5 นาที',
      'สามารถยกเลิกหรือลองใหม่ได้ตลอดเวลา',
      'หากเกิดข้อผิดพลาด ระบบจะแสดงตัวเลือกแก้ไข'
    ]
  },
  {
    id: 'preview',
    title: 'ตรวจสอบและแก้ไข',
    description: 'ตรวจสอบเอกสารที่สร้างขึ้นและแก้ไขตามต้องการ',
    icon: <Eye className="h-5 w-5" />,
    tips: [
      'สามารถแก้ไขข้อความได้โดยตรง',
      'เปลี่ยนหรือเพิ่มรูปภาพได้',
      'ตรวจสอบการจัดรูปแบบตามมาตรฐาน MFEC'
    ]
  },
  {
    id: 'download',
    title: 'ดาวน์โหลดเอกสาร',
    description: 'ดาวน์โหลดเอกสารในรูปแบบ PDF หรือ DOCX',
    icon: <Download className="h-5 w-5" />,
    tips: [
      'รองรับรูปแบบ PDF และ DOCX',
      'ชื่อไฟล์จะรวมแหล่งที่มาและวันที่',
      'สามารถดูประวัติการดาวน์โหลดได้'
    ]
  }
];

const commonIssues = [
  {
    problem: 'URL ไม่สามารถเข้าถึงได้',
    solution: 'ตรวจสอบว่า URL ถูกต้องและเว็บไซต์สามารถเข้าถึงได้ หรือใช้การใส่เนื้อหาด้วยตนเอง'
  },
  {
    problem: 'การแปลภาษาไม่ถูกต้อง',
    solution: 'ใช้ฟีเจอร์แก้ไขในหน้าตรวจสอบเพื่อปรับปรุงการแปล'
  },
  {
    problem: 'รูปภาพไม่แสดงผล',
    solution: 'ตรวจสอบว่ารูปภาพสามารถเข้าถึงได้ หรือเพิ่มรูปภาพด้วยตนเองในหน้าแก้ไข'
  },
  {
    problem: 'API Key หมดอายุ',
    solution: 'ใส่ API Key ของคุณเองในหน้าต่างที่แสดงขึ้น'
  }
];

export function UserGuidance({ currentStep, className }: UserGuidanceProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(false);

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <div className={className}>
      {/* Quick Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <span>คู่มือการใช้งาน</span>
            </div>
            <HelpTooltip
              content="คู่มือฉบับย่อสำหรับการใช้งานระบบสร้างเอกสารอัตโนมัติ"
              title="เกี่ยวกับคู่มือนี้"
              trigger="click"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {guideSteps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg transition-colors ${
                  currentStep === step.id 
                    ? 'border-primary-300 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-4 text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 ${
                      currentStep === step.id ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <span className={`font-medium ${
                          currentStep === step.id ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedStep === step.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedStep === step.id && step.tips && (
                  <div className="px-4 pb-4">
                    <div className="ml-8 pl-3 border-l-2 border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        เทคนิคและข้อแนะนำ:
                      </h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="text-primary-500 mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span>ปัญหาที่พบบ่อย</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIssues(!showIssues)}
            >
              {showIssues ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        {showIssues && (
          <CardContent>
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    ปัญหา: {issue.problem}
                  </h4>
                  <p className="text-sm text-gray-600">
                    วิธีแก้ไข: {issue.solution}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}