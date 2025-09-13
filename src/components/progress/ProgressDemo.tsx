'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { ProgressTracker } from './ProgressTracker';
import { Play, RotateCcw } from 'lucide-react';

export function ProgressDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [key, setKey] = useState(0); // Force re-render of ProgressTracker

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setKey(prev => prev + 1); // Force component re-mount
  };

  const handleCancel = () => {
    console.log('Progress cancelled');
  };

  const handleRetry = () => {
    console.log('Progress retried');
  };

  const handlePreview = () => {
    console.log('Preview document');
    alert('ตัวอย่างเอกสาร (ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป)');
  };

  const handleDownload = () => {
    console.log('Download document');
    alert('ดาวน์โหลดเอกสาร (ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป)');
  };

  const handleStartNew = () => {
    console.log('Start new document');
    handleReset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ทดสอบระบบติดตามความคืบหน้า</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              ทดสอบการทำงานของระบบติดตามความคืบหน้าในการสร้างเอกสาร 
              รวมถึงการแสดงสถานะ การยกเลิก และการลองใหม่
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleStart}
                disabled={isRunning}
              >
                <Play className="h-4 w-4 mr-1" />
                เริ่มทดสอบ
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                รีเซ็ต
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <ProgressTracker
          key={key}
          isVisible={isRunning}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
}