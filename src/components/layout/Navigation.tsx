'use client';

import React, { useState } from 'react';
import { X, FileText, History, HelpCircle, Settings } from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const navigationItems = [
    {
      name: 'Generate Document',
      href: '#generate',
      icon: FileText,
      description: 'Create new Thai documents from URLs'
    },
    {
      name: 'Document History',
      href: '#history',
      icon: History,
      description: 'View previously generated documents'
    },
    {
      name: 'Help & Support',
      href: '#help',
      icon: HelpCircle,
      description: 'Get help and documentation'
    },
    {
      name: 'Settings',
      href: '#settings',
      icon: Settings,
      description: 'Configure application settings'
    }
  ];

  return (
    <>
      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
                      <Icon className="h-5 w-5 text-gray-600 group-hover:text-primary-600 mt-0.5" />
                      <div>
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
          </div>
        </div>
      )}
    </>
  );
}

export function MobileNavigationButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      aria-label="Open menu"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}