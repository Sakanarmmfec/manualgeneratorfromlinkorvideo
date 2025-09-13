'use client';

import React, { useState } from 'react';
import { X, Keyboard, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { animations } from '@/utils/animations';
import { KeyboardShortcut, useShortcutHelp } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { formatShortcut, groupShortcutsByCategory } = useShortcutHelp();

  if (!isOpen) return null;

  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatShortcut(shortcut).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedShortcuts = groupShortcutsByCategory(filteredShortcuts);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${animations.scaleIn}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">คีย์บอร์ดลัด</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาคีย์บอร์ดลัด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="overflow-y-auto max-h-96">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="p-6 border-b border-gray-100 last:border-b-0">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                {category}
              </h3>
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={shortcut.key + index}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-gray-700">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-600">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredShortcuts.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Keyboard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบคีย์บอร์ดลัดที่ตรงกับการค้นหา</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              กด <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">?</kbd> เพื่อเปิดหน้านี้อีกครั้ง
            </p>
            <Button variant="primary" size="sm" onClick={onClose}>
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick shortcut display component for tooltips
interface ShortcutBadgeProps {
  shortcut: KeyboardShortcut;
  className?: string;
}

export function ShortcutBadge({ shortcut, className = '' }: ShortcutBadgeProps) {
  const { formatShortcut } = useShortcutHelp();

  return (
    <kbd className={`px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600 ${className}`}>
      {formatShortcut(shortcut)}
    </kbd>
  );
}

// Floating shortcut hint component
interface ShortcutHintProps {
  shortcut: KeyboardShortcut;
  show: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function ShortcutHint({ 
  shortcut, 
  show, 
  position = 'bottom',
  className = '' 
}: ShortcutHintProps) {
  const { formatShortcut } = useShortcutHelp();

  if (!show) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-10 ${animations.fadeIn} ${className}`}>
      <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
        <span className="mr-2">{shortcut.description}</span>
        <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">
          {formatShortcut(shortcut)}
        </kbd>
      </div>
    </div>
  );
}