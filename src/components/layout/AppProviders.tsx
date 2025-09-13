'use client';

import React from 'react';
import { ApiKeyProvider } from '@/contexts/ApiKeyContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component wraps the application with necessary context providers
 * This includes API key management and other global state providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ApiKeyProvider>
      {children}
    </ApiKeyProvider>
  );
}