'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  History, 
  Download, 
  FileText, 
  File, 
  Trash2, 
  ExternalLink,
  Calendar,
  Clock,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { clsx } from 'clsx';

export interface ExportRecord {
  id: string;
  documentId: string;
  filename: string;
  format: 'pdf' | 'docx';
  fileSize: number;
  downloadUrl?: string;
  exportedAt: Date;
  options: {
    includeSourceAttribution: boolean;
    includeGenerationDate: boolean;
    includeWatermark: boolean;
    compressionLevel: 'low' | 'medium' | 'high';
  };
  status: 'completed' | 'expired' | 'error';
}

export interface ExportHistoryProps {
  documentId: string;
  className?: string;
}

// Mock data - in real implementation, this would come from an API
const mockExportHistory: ExportRecord[] = [
  {
    id: '1',
    documentId: 'doc-1',
    filename: 'user-manual-example-com-2024-01-15.pdf',
    format: 'pdf',
    fileSize: 2048576, // 2MB
    downloadUrl: '/downloads/user-manual-example-com-2024-01-15.pdf',
    exportedAt: new Date('2024-01-15T10:30:00'),
    options: {
      includeSourceAttribution: true,
      includeGenerationDate: true,
      includeWatermark: false,
      compressionLevel: 'medium'
    },
    status: 'completed'
  },
  {
    id: '2',
    documentId: 'doc-1',
    filename: 'user-manual-example-com-2024-01-15.docx',
    format: 'docx',
    fileSize: 1536000, // 1.5MB
    downloadUrl: '/downloads/user-manual-example-com-2024-01-15.docx',
    exportedAt: new Date('2024-01-15T10:25:00'),
    options: {
      includeSourceAttribution: true,
      includeGenerationDate: true,
      includeWatermark: true,
      compressionLevel: 'low'
    },
    status: 'completed'
  },
  {
    id: '3',
    documentId: 'doc-1',
    filename: 'user-manual-example-com-2024-01-14.pdf',
    format: 'pdf',
    fileSize: 0,
    exportedAt: new Date('2024-01-14T15:20:00'),
    options: {
      includeSourceAttribution: true,
      includeGenerationDate: false,
      includeWatermark: false,
      compressionLevel: 'high'
    },
    status: 'expired'
  },
  {
    id: '4',
    documentId: 'doc-1',
    filename: 'product-guide-example-com-2024-01-13.pdf',
    format: 'pdf',
    fileSize: 1800000, // 1.8MB
    downloadUrl: '/downloads/product-guide-example-com-2024-01-13.pdf',
    exportedAt: new Date('2024-01-13T14:15:00'),
    options: {
      includeSourceAttribution: true,
      includeGenerationDate: true,
      includeWatermark: false,
      compressionLevel: 'medium'
    },
    status: 'completed'
  },
  {
    id: '5',
    documentId: 'doc-1',
    filename: 'installation-manual-example-com-2024-01-12.docx',
    format: 'docx',
    fileSize: 2200000, // 2.2MB
    downloadUrl: '/downloads/installation-manual-example-com-2024-01-12.docx',
    exportedAt: new Date('2024-01-12T09:45:00'),
    options: {
      includeSourceAttribution: true,
      includeGenerationDate: true,
      includeWatermark: true,
      compressionLevel: 'low'
    },
    status: 'completed'
  }
];

export function ExportHistory({ documentId, className }: ExportHistoryProps) {
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ExportRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'expired'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Load export history (mock implementation)
  useEffect(() => {
    const history = mockExportHistory.filter(record => record.documentId === documentId);
    setExportHistory(history);
  }, [documentId]);

  // Filter history based on search and filters
  useEffect(() => {
    let filtered = exportHistory;

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (formatFilter !== 'all') {
      filtered = filtered.filter(record => record.format === formatFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Sort by export date (newest first)
    filtered.sort((a, b) => b.exportedAt.getTime() - a.exportedAt.getTime());

    setFilteredHistory(filtered);
  }, [exportHistory, searchTerm, formatFilter, statusFilter]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: ExportRecord['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      completed: 'พร้อมดาวน์โหลด',
      expired: 'หมดอายุ',
      error: 'เกิดข้อผิดพลาด'
    };

    return (
      <span className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
        styles[status]
      )}>
        {labels[status]}
      </span>
    );
  };

  const handleDownload = (record: ExportRecord) => {
    if (record.downloadUrl && record.status === 'completed') {
      // In real implementation, this would trigger the actual download
      window.open(record.downloadUrl, '_blank');
    }
  };

  const handleDelete = (recordId: string) => {
    setExportHistory(prev => prev.filter(record => record.id !== recordId));
  };

  const displayedHistory = isExpanded ? filteredHistory : filteredHistory.slice(0, 3);

  if (exportHistory.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-500">
          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>ยังไม่มีประวัติการดาวน์โหลด</p>
          <p className="text-sm mt-1">เมื่อคุณดาวน์โหลดเอกสาร ประวัติจะแสดงที่นี่</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            ประวัติการดาวน์โหลด ({exportHistory.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'ย่อ' : 'ขยาย'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {exportHistory.length > 3 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาชื่อไฟล์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as 'all' | 'pdf' | 'docx')}
                options={[
                  { value: 'all', label: 'ทุกรูปแบบ' },
                  { value: 'pdf', label: 'PDF' },
                  { value: 'docx', label: 'DOCX' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'expired')}
                options={[
                  { value: 'all', label: 'ทุกสถานะ' },
                  { value: 'completed', label: 'พร้อมดาวน์โหลด' },
                  { value: 'expired', label: 'หมดอายุ' }
                ]}
              />
            </div>
          </div>
        )}

        {/* History List */}
        <div className="space-y-3">
          {displayedHistory.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {record.format === 'pdf' ? (
                    <FileText className="h-8 w-8 text-red-500" />
                  ) : (
                    <File className="h-8 w-8 text-blue-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {record.filename}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {record.exportedAt.toLocaleDateString('th-TH')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {record.exportedAt.toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span>{formatFileSize(record.fileSize)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {getStatusBadge(record.status)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {record.status === 'completed' && record.downloadUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(record)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    ดาวน์โหลด
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(record.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {!isExpanded && filteredHistory.length > 3 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(true)}
            >
              แสดงเพิ่มเติม ({filteredHistory.length - 3} รายการ)
            </Button>
          </div>
        )}

        {/* Empty State for Filtered Results */}
        {filteredHistory.length === 0 && exportHistory.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>ไม่พบผลลัพธ์ที่ตรงกับการค้นหา</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFormatFilter('all');
                setStatusFilter('all');
              }}
              className="mt-2"
            >
              ล้างตัวกรอง
            </Button>
          </div>
        )}

        {/* Storage Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800">
              <p className="font-medium">หมายเหตุเกี่ยวกับการจัดเก็บไฟล์</p>
              <p className="mt-1">
                ไฟล์ที่ดาวน์โหลดจะถูกเก็บไว้เป็นเวลา 7 วัน หลังจากนั้นจะถูกลบอัตโนมัติ 
                หากต้องการเก็บไฟล์ไว้นาน กรุณาดาวน์โหลดและบันทึกในเครื่องของคุณ
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}