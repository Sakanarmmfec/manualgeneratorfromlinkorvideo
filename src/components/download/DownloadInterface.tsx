'use client';

import React, { useState, useCallback } from 'react';
import { GeneratedDocument } from '@/types';
import { DownloadPanel, DownloadOptions } from './DownloadPanel';
import { DownloadProgress } from './DownloadProgress';
import { ExportHistory } from './ExportHistory';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

export interface DownloadState {
  isDownloading: boolean;
  progress: number;
  status: 'preparing' | 'processing' | 'generating' | 'finalizing' | 'complete' | 'error';
  error?: string;
  estimatedTimeRemaining?: number;
  currentOptions?: DownloadOptions;
}

export interface DownloadInterfaceProps {
  document: GeneratedDocument;
  onDownloadComplete?: (filename: string, format: 'pdf' | 'docx') => void;
  onDownloadError?: (error: string) => void;
  className?: string;
}

export function DownloadInterface({
  document,
  onDownloadComplete,
  onDownloadError,
  className
}: DownloadInterfaceProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    status: 'preparing'
  });

  const [completedDownloads, setCompletedDownloads] = useState<Array<{
    filename: string;
    format: 'pdf' | 'docx';
    completedAt: Date;
  }>>([]);

  // Simulate download process with realistic progress updates
  const simulateDownload = useCallback(async (options: DownloadOptions) => {
    const stages = [
      { status: 'preparing' as const, duration: 1000, progressStart: 0, progressEnd: 15 },
      { status: 'processing' as const, duration: 3000, progressStart: 15, progressEnd: 45 },
      { status: 'generating' as const, duration: 4000, progressStart: 45, progressEnd: 85 },
      { status: 'finalizing' as const, duration: 2000, progressStart: 85, progressEnd: 100 }
    ];

    for (const stage of stages) {
      setDownloadState(prev => ({
        ...prev,
        status: stage.status,
        estimatedTimeRemaining: stages
          .slice(stages.indexOf(stage))
          .reduce((total, s) => total + s.duration, 0) / 1000
      }));

      // Animate progress within the stage
      const progressRange = stage.progressEnd - stage.progressStart;
      const steps = 20;
      const stepDuration = stage.duration / steps;

      for (let i = 0; i <= steps; i++) {
        const stageProgress = (i / steps) * progressRange;
        const totalProgress = stage.progressStart + stageProgress;
        
        setDownloadState(prev => ({
          ...prev,
          progress: totalProgress,
          estimatedTimeRemaining: Math.max(0, 
            (stages.slice(stages.indexOf(stage)).reduce((total, s) => total + s.duration, 0) - 
             (i / steps) * stage.duration) / 1000
          )
        }));

        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }

    // Complete the download
    setDownloadState(prev => ({
      ...prev,
      status: 'complete',
      progress: 100,
      estimatedTimeRemaining: 0
    }));

    // Add to completed downloads
    setCompletedDownloads(prev => [...prev, {
      filename: options.filename,
      format: options.format,
      completedAt: new Date()
    }]);

    // Notify parent component
    onDownloadComplete?.(options.filename, options.format);

    // Reset state after a delay
    setTimeout(() => {
      setDownloadState({
        isDownloading: false,
        progress: 0,
        status: 'preparing'
      });
    }, 3000);
  }, [onDownloadComplete]);

  const handleDownload = useCallback(async (options: DownloadOptions) => {
    try {
      setDownloadState({
        isDownloading: true,
        progress: 0,
        status: 'preparing',
        currentOptions: options,
        error: undefined
      });

      // Simulate potential errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }

      await simulateDownload(options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      
      setDownloadState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      onDownloadError?.(errorMessage);
    }
  }, [simulateDownload, onDownloadError]);

  const handleRetry = useCallback(() => {
    if (downloadState.currentOptions) {
      handleDownload(downloadState.currentOptions);
    }
  }, [downloadState.currentOptions, handleDownload]);

  const handleCancel = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      progress: 0,
      status: 'preparing'
    });
  }, []);

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Success Notifications */}
      {completedDownloads.length > 0 && (
        <div className="space-y-2">
          {completedDownloads.slice(-3).map((download, index) => (
            <Card key={index} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800">
                        ดาวน์โหลดเสร็จสิ้น
                      </p>
                      <p className="text-sm text-green-700">
                        {download.filename} ({download.format.toUpperCase()})
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompletedDownloads(prev => 
                      prev.filter((_, i) => i !== completedDownloads.length - 1 - index)
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Download Progress */}
      {downloadState.isDownloading && downloadState.currentOptions && (
        <DownloadProgress
          progress={downloadState.progress}
          format={downloadState.currentOptions.format}
          filename={downloadState.currentOptions.filename}
          status={downloadState.status}
          estimatedTimeRemaining={downloadState.estimatedTimeRemaining}
          error={downloadState.error}
          onCancel={downloadState.status !== 'complete' ? handleCancel : undefined}
          onRetry={downloadState.status === 'error' ? handleRetry : undefined}
        />
      )}

      {/* Main Download Panel */}
      <DownloadPanel
        document={document}
        onDownload={handleDownload}
        isDownloading={downloadState.isDownloading}
        downloadProgress={downloadState.progress}
      />

      {/* Quick Actions */}
      {!downloadState.isDownloading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">การดำเนินการด่วน</h3>
                <p className="text-sm text-gray-600 mt-1">
                  ดาวน์โหลดด้วยการตั้งค่าเริ่มต้น
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload({
                    format: 'pdf',
                    filename: `${document.title.replace(/[^a-zA-Z0-9ก-๙\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`,
                    includeSourceAttribution: true,
                    includeGenerationDate: true,
                    includeWatermark: false,
                    compressionLevel: 'medium'
                  })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF ด่วน
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload({
                    format: 'docx',
                    filename: `${document.title.replace(/[^a-zA-Z0-9ก-๙\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.docx`,
                    includeSourceAttribution: true,
                    includeGenerationDate: true,
                    includeWatermark: false,
                    compressionLevel: 'medium'
                  })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  DOCX ด่วน
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}