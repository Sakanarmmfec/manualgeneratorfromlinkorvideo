'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Settings, Menu, Key, CheckCircle, AlertTriangle, XCircle, HelpCircle, Keyboard } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { Container } from './Container';
import { useApiKeyContext } from '@/contexts/ApiKeyContext';
import { useKeyboardShortcuts, createAppShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { animations } from '@/utils/animations';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const { keyState, isKeyValid } = useApiKeyContext();

  // Keyboard shortcuts
  const shortcuts = createAppShortcuts({
    onNewDocument: () => window.location.href = '/#generate',
    onSettings: () => window.location.href = '/settings/api-key',
    onHelp: () => setShowShortcutsHelp(true),
    onSearch: () => {
      const searchInput = document.querySelector('#url-input') as HTMLInputElement;
      searchInput?.focus();
    }
  });

  useKeyboardShortcuts(shortcuts);

  const getStatusIcon = () => {
    switch (keyState.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exhausted':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Key className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Key className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (keyState.status) {
      case 'active':
        return 'API Key ใช้งานได้';
      case 'exhausted':
        return 'API Key หมดอายุ';
      case 'invalid':
        return 'API Key ไม่ถูกต้อง';
      case 'testing':
        return 'กำลังตรวจสอบ API Key';
      default:
        return 'ไม่ทราบสถานะ API Key';
    }
  };

  return (
    <>
      <header className="mfec-header shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/mfec-logo.png"
                  alt="MFEC Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto drop-shadow-sm"
                  priority
                />
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    Thai Document Generator
                  </h1>
                  <p className="text-sm text-primary-600 font-medium">
                    MFEC Automated Documentation System
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#generate"
                className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium ${animations.transition}`}
              >
                สร้างเอกสาร
                <kbd className="ml-2 px-1 py-0.5 bg-gray-100 text-xs rounded">Ctrl+N</kbd>
              </a>
              <a
                href="#history"
                className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium ${animations.transition}`}
              >
                ประวัติ
              </a>
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium ${animations.transition} flex items-center space-x-1`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>ช่วยเหลือ</span>
                <kbd className="ml-1 px-1 py-0.5 bg-gray-100 text-xs rounded">?</kbd>
              </button>
            </nav>

            {/* API Key Status and Settings */}
            <div className="flex items-center space-x-2">
              {/* API Key Status Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                {getStatusIcon()}
                <span className="text-xs text-gray-600">
                  {keyState.currentKeyType === 'primary' ? 'หลัก' : 'ผู้ใช้'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Keyboard Shortcuts Help */}
                <button
                  onClick={() => setShowShortcutsHelp(true)}
                  className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md ${animations.transition} hidden sm:block`}
                  aria-label="คีย์บอร์ดลัด"
                  title="คีย์บอร์ดลัด (?)"
                >
                  <Keyboard className="h-5 w-5" />
                </button>

                {/* Settings */}
                <div className="relative group">
                  <Link
                    href="/settings/api-key"
                    className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md ${animations.transition}`}
                    aria-label="ตั้งค่า API Key"
                    title={getStatusText()}
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                  
                  {/* Tooltip */}
                  <div className={`absolute right-0 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 ${animations.transition} pointer-events-none whitespace-nowrap z-50`}>
                    {getStatusText()}
                    <div className="text-xs text-gray-300 mt-1">Ctrl+,</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="เปิดเมนู"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Navigation */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={shortcuts}
      />
    </>
  );
}