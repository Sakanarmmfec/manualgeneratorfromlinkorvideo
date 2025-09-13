'use client';

import React from 'react';
import { X, FileText, History, HelpCircle, Settings, Home } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigationItems = [
    {
      name: 'หน้าหลัก',
      href: '#home',
      icon: Home,
      description: 'กลับสู่หน้าหลัก'
    },
    {
      name: 'สร้างเอกสาร',
      href: '#generate',
      icon: FileText,
      description: 'สร้างเอกสารภาษาไทยจาก URL'
    },
    {
      name: 'ประวัติเอกสาร',
      href: '#history',
      icon: History,
      description: 'ดูเอกสารที่สร้างไว้แล้ว'
    },
    {
      name: 'ช่วยเหลือ',
      href: '#help',
      icon: HelpCircle,
      description: 'คู่มือการใช้งานและการสนับสนุน'
    },
    {
      name: 'ตั้งค่า',
      href: '#settings',
      icon: Settings,
      description: 'กำหนดค่าแอปพลิเคชัน'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">เมนู</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="ปิดเมนู"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Icon className="h-5 w-5 text-gray-600 group-hover:text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.description}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            <div>Thai Document Generator v1.0</div>
            <div className="mt-1">© 2025 MFEC Public Company Limited</div>
          </div>
        </div>
      </div>
    </div>
  );
}