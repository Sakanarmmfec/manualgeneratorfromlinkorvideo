'use client';

import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { DocumentGenerationForm } from '@/components/generator';
import { FileText, Globe, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="text-center py-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          ยินดีต้อนรับสู่ระบบสร้างเอกสารภาษาไทย
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          สร้างคู่มือผู้ใช้และเอกสารผลิตภัณฑ์ภาษาไทยอย่างมืออาชีพ 
          ตามมาตรฐานรูปแบบของ MFEC โดยใช้เทคโนโลยี AI ขั้นสูง
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => document.getElementById('generate-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            เริ่มสร้างเอกสาร
          </Button>
          <Button variant="outline" size="lg">
            ดูตัวอย่าง
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        <div className="mfec-card p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mfec-shadow">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            สร้างเอกสารอัตโนมัติ
          </h3>
          <p className="text-gray-600 text-sm">
            สร้างคู่มือผู้ใช้และเอกสารผลิตภัณฑ์ภาษาไทยจาก URL โดยอัตโนมัติ
          </p>
        </div>

        <div className="mfec-card p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mfec-shadow">
            <Globe className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            รองรับหลายแหล่งข้อมูล
          </h3>
          <p className="text-gray-600 text-sm">
            ประมวลผลเนื้อหาจากเว็บไซต์และวิดีโอ YouTube ด้วยการสกัดข้อมูลอัจฉริยะ
          </p>
        </div>

        <div className="mfec-card p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mfec-shadow">
            <Zap className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ขับเคลื่อนด้วย AI
          </h3>
          <p className="text-gray-600 text-sm">
            การแปลและจัดระเบียบเนื้อหาด้วย AI ขั้นสูงตามมาตรฐาน MFEC
          </p>
        </div>

        <div className="mfec-card p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mfec-shadow">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            มาตรฐาน MFEC
          </h3>
          <p className="text-gray-600 text-sm">
            การจัดรูปแบบและการสร้างแบรนด์ที่สอดคล้องกับแนวทาง MFEC อย่างเป็นทางการ
          </p>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="mfec-card p-8 mt-12 mfec-shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          คู่มือเริ่มต้นใช้งาน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mfec-gradient text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ใส่ URL</h3>
            <p className="text-gray-600 text-sm">
              ระบุ URL ผลิตภัณฑ์หรือลิงก์วิดีโอ YouTube เพื่อสกัดเนื้อหา
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mfec-gradient text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ประมวลผลด้วย AI</h3>
            <p className="text-gray-600 text-sm">
              AI ของเราวิเคราะห์ แปล และจัดระเบียบเนื้อหาตามมาตรฐาน MFEC
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mfec-gradient text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ดาวน์โหลดเอกสาร</h3>
            <p className="text-gray-600 text-sm">
              ดูตัวอย่าง แก้ไขหากจำเป็น และดาวน์โหลดเอกสารภาษาไทยมืออาชีพของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* Document Generation Form Section */}
      <div id="generate-form" className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            สร้างเอกสารของคุณ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ใส่ URL ผลิตภัณฑ์หรือวิดีโอ YouTube เพื่อเริ่มสร้างเอกสารภาษาไทยมืออาชีพ
          </p>
        </div>
        <DocumentGenerationForm />
      </div>
    </MainLayout>
  );
}