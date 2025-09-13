'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  Download, 
  FileText, 
  File, 
  Settings, 
  Calendar,
  Link,
  Tag,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { GeneratedDocument } from '@/types';
import { DownloadProgress } from './DownloadProgress';
import { ExportHistory } from './ExportHistory';

export interface DownloadOptions {
  format: 'pdf' | 'docx';
  filename: string;
  includeSourceAttribution: boolean;
  includeGenerationDate: boolean;
  includeWatermark: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
}

export interface DownloadPanelProps {
  document: GeneratedDocument;
  onDownload: (options: DownloadOptions) => Promise<void>;
  isDownloading?: boolean;
  downloadProgress?: number;
  className?: string;
}

export function DownloadPanel({
  document,
  onDownload,
  isDownloading = false,
  downloadProgress = 0,
  className
}: DownloadPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx'>('pdf');
  const [customFilename, setCustomFilename] = useState('');
  const [includeSourceAttribution, setIncludeSourceAttribution] = useState(true);
  const [includeGenerationDate, setIncludeGenerationDate] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Generate default filename with source attribution
  const generateDefaultFilename = useCallback((format: 'pdf' | 'docx') => {
    const baseTitle = document.title
      .replace(/[^a-zA-Z0-9ก-๙\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase();
    
    const sourceUrl = new URL(document.sourceAttribution.originalUrl);
    const sourceDomain = sourceUrl.hostname.replace('www.', '');
    
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return `${baseTitle}-${sourceDomain}-${date}.${format}`;
  }, [document]);

  const currentFilename = customFilename || generateDefaultFilename(selectedFormat);
  
  // Initialize filename on first render
  React.useEffect(() => {
    if (!customFilename) {
      setCustomFilename(generateDefaultFilename(selectedFormat));
    }
  }, [selectedFormat, generateDefaultFilename, customFilename]);

  const handleDownload = useCallback(async () => {
    const options: DownloadOptions = {
      format: selectedFormat,
      filename: currentFilename,
      includeSourceAttribution,
      includeGenerationDate,
      includeWatermark,
      compressionLevel
    };

    await onDownload(options);
  }, [
    selectedFormat,
    currentFilename,
    includeSourceAttribution,
    includeGenerationDate,
    includeWatermark,
    compressionLevel,
    onDownload
  ]);

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Main Download Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            ดาวน์โหลดเอกสาร
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedFormat === 'pdf' ? 'primary' : 'outline'}
              size="lg"
              onClick={() => setSelectedFormat('pdf')}
              className="h-20 flex-col gap-2"
            >
              <FileText className="h-8 w-8" />
              <span>PDF</span>
              <span className="text-xs opacity-75">แนะนำสำหรับการแชร์</span>
            </Button>
            
            <Button
              variant={selectedFormat === 'docx' ? 'primary' : 'outline'}
              size="lg"
              onClick={() => setSelectedFormat('docx')}
              className="h-20 flex-col gap-2"
            >
              <File className="h-8 w-8" />
              <span>DOCX</span>
              <span className="text-xs opacity-75">แนะนำสำหรับการแก้ไข</span>
            </Button>
          </div>

          {/* Filename Configuration */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ชื่อไฟล์
            </label>
            <Input
              value={currentFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={generateDefaultFilename(selectedFormat)}
              className="font-mono text-sm"
            />
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>ชื่อไฟล์จะถูกสร้างอัตโนมัติตามรูปแบบ: ชื่อเอกสาร-แหล่งที่มา-วันที่</p>
                <p className="mt-1">ตัวอย่าง: <code className="bg-gray-100 px-1 rounded">{generateDefaultFilename(selectedFormat)}</code></p>
              </div>
            </div>
          </div>

          {/* Basic Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">ตัวเลือกพื้นฐาน</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvancedOptions ? 'ซ่อน' : 'แสดง'}ตัวเลือกขั้นสูง
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="source-attribution"
                  checked={includeSourceAttribution}
                  onChange={(e) => setIncludeSourceAttribution(e.target.checked)}
                />
                <label htmlFor="source-attribution" className="text-sm text-gray-700 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  รวมข้อมูลแหล่งที่มา
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="generation-date"
                  checked={includeGenerationDate}
                  onChange={(e) => setIncludeGenerationDate(e.target.checked)}
                />
                <label htmlFor="generation-date" className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  รวมวันที่สร้างเอกสาร
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="watermark"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                />
                <label htmlFor="watermark" className="text-sm text-gray-700">
                  เพิ่มลายน้ำ MFEC
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ระดับการบีบอัด
                </label>
                <Select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                  options={[
                    { value: 'low', label: 'ต่ำ (คุณภาพสูง, ไฟล์ใหญ่)' },
                    { value: 'medium', label: 'กลาง (สมดุล)' },
                    { value: 'high', label: 'สูง (ไฟล์เล็ก, คุณภาพลดลง)' }
                  ]}
                />
              </div>
            </div>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <DownloadProgress
              progress={downloadProgress}
              format={selectedFormat}
              filename={currentFilename}
            />
          )}

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            size="lg"
            className="w-full"
          >
            <Download className="h-5 w-5 mr-2" />
            {isDownloading ? 'กำลังดาวน์โหลด...' : `ดาวน์โหลด ${selectedFormat.toUpperCase()}`}
          </Button>

          {/* Document Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-medium">ข้อมูลเอกสาร:</span>
            </div>
            <div className="grid grid-cols-1 gap-1 ml-6 text-gray-600">
              <div>ชื่อ: {document.title}</div>
              <div>แหล่งที่มา: {document.sourceAttribution.originalUrl}</div>
              <div>สร้างเมื่อ: {new Date(document.generationMetadata.generatedAt).toLocaleDateString('th-TH')}</div>
              <div>รูปแบบที่รองรับ: {document.downloadFormats.join(', ')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <ExportHistory documentId={document.id} />
    </div>
  );
}