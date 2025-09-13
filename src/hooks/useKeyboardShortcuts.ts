import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const metaMatch = !!shortcut.metaKey === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

// Predefined shortcuts for the application
export const createAppShortcuts = (actions: {
  onNewDocument?: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  onSearch?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'n',
    ctrlKey: true,
    action: actions.onNewDocument || (() => {}),
    description: 'สร้างเอกสารใหม่',
    category: 'เอกสาร'
  },
  {
    key: 's',
    ctrlKey: true,
    action: actions.onSave || (() => {}),
    description: 'บันทึกเอกสาร',
    category: 'เอกสาร'
  },
  {
    key: 'p',
    ctrlKey: true,
    action: actions.onPreview || (() => {}),
    description: 'แสดงตัวอย่าง',
    category: 'เอกสาร'
  },
  {
    key: 'd',
    ctrlKey: true,
    action: actions.onDownload || (() => {}),
    description: 'ดาวน์โหลดเอกสาร',
    category: 'เอกสาร'
  },
  {
    key: ',',
    ctrlKey: true,
    action: actions.onSettings || (() => {}),
    description: 'เปิดการตั้งค่า',
    category: 'ระบบ'
  },
  {
    key: '?',
    shiftKey: true,
    action: actions.onHelp || (() => {}),
    description: 'แสดงความช่วยเหลือ',
    category: 'ระบบ'
  },
  {
    key: 'k',
    ctrlKey: true,
    action: actions.onSearch || (() => {}),
    description: 'ค้นหา',
    category: 'นำทาง'
  },
  {
    key: 'z',
    ctrlKey: true,
    action: actions.onUndo || (() => {}),
    description: 'ยกเลิกการดำเนินการ',
    category: 'แก้ไข'
  },
  {
    key: 'y',
    ctrlKey: true,
    action: actions.onRedo || (() => {}),
    description: 'ทำซ้ำการดำเนินการ',
    category: 'แก้ไข'
  }
];

// Hook for displaying keyboard shortcuts help
export function useShortcutHelp() {
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  const groupShortcutsByCategory = (shortcuts: KeyboardShortcut[]) => {
    return shortcuts.reduce((groups, shortcut) => {
      const category = shortcut.category || 'อื่นๆ';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
      return groups;
    }, {} as Record<string, KeyboardShortcut[]>);
  };

  return { formatShortcut, groupShortcutsByCategory };
}