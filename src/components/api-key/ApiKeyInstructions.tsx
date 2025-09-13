'use client';

import React from 'react';
import { ExternalLink, Key, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ApiKeyInstructionsProps {
  variant?: 'full' | 'compact' | 'modal';
  showSecurityNotice?: boolean;
  className?: string;
}

export function ApiKeyInstructions({
  variant = 'full',
  showSecurityNotice = true,
  className = ''
}: ApiKeyInstructionsProps) {
  const isCompact = variant === 'compact';
  const isModal = variant === 'modal';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {!isCompact && (
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            วิธีการรับ API Key
          </h3>
        </div>
      )}

      {/* Warning for Modal */}
      {isModal && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Token หลักหมดอายุ</p>
              <p>กรุณาใส่ API Key ของคุณเพื่อดำเนินการต่อ</p>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-step Instructions */}
      <div className="space-y-3">
        {!isCompact && (
          <h4 className="text-sm font-medium text-gray-900">ขั้นตอนการรับ API Key:</h4>
        )}
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium">เข้าสู่ระบบ MFEC LiteLLM Portal</p>
              <p className="text-gray-600">ใช้บัญชี MFEC ของคุณเพื่อเข้าสู่ระบบ</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium">ไปที่หน้า API Keys</p>
              <p className="text-gray-600">หาเมนู "API Keys" หรือ "การจัดการ API Key"</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium">สร้าง API Key ใหม่</p>
              <p className="text-gray-600">คลิก "สร้าง API Key ใหม่" หรือคัดลอก Key ที่มีอยู่</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium">คัดลอกและใส่ API Key</p>
              <p className="text-gray-600">นำ API Key มาใส่ในช่องด้านล่าง</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Link */}
      {!isCompact && (
        <div className="flex items-center justify-center">
          <a
            href="https://gpt.mfec.co.th"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span className="font-medium">เปิด MFEC LiteLLM Portal</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Security Notice */}
      {showSecurityNotice && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-2">ความปลอดภัย:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>API Key จะถูกใช้เฉพาะในเซสชันนี้</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>ไม่มีการบันทึกหรือเก็บข้อมูลถาวร</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>การเชื่อมต่อใช้ HTTPS เท่านั้น</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>API Key จะถูกลบเมื่อปิดเบราว์เซอร์</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Additional Tips */}
      {variant === 'full' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-2">เคล็ดลับ:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• API Key ควรเริ่มต้นด้วย "sk-" หรือรูปแบบที่ MFEC กำหนด</li>
                <li>• หากมีปัญหาในการเข้าถึง Portal ให้ติดต่อทีม IT ของ MFEC</li>
                <li>• API Key จะหมดอายุตามนโยบายของ MFEC</li>
                <li>• สามารถใช้ API Key เดียวกันในหลายเซสชัน</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}