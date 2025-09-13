'use client';

import { MainLayout } from '@/components/layout';
import { ApiKeySettings } from '@/components/api-key';

export default function ApiKeySettingsPage() {
  return (
    <MainLayout>
      <div className="py-8">
        <ApiKeySettings />
      </div>
    </MainLayout>
  );
}