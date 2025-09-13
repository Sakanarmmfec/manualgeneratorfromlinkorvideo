'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Edit3, 
  Eye, 
  Save, 
  Download, 
  FileText, 
  File,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface DocumentToolbarProps {
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  onEditModeChange: (isEditing: boolean) => void;
  onSave: () => void;
  onDownload: (format: 'pdf' | 'docx') => void;
}

export function DocumentToolbar({
  isEditing,
  hasUnsavedChanges,
  onEditModeChange,
  onSave,
  onDownload
}: DocumentToolbarProps) {
  return (
    <Card className="mb-6 p-4 sticky top-4 z-40 bg-white/95 backdrop-blur-sm border-2">
      <div className="flex items-center justify-between">
        {/* Left Section - Edit Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant={isEditing ? "primary" : "outline"}
            size="sm"
            onClick={() => onEditModeChange(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                ดูตัวอย่าง
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                แก้ไข
              </>
            )}
          </Button>

          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSave}
              disabled={!hasUnsavedChanges}
              className={clsx(
                hasUnsavedChanges && "animate-pulse"
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              บันทึก
            </Button>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            {hasUnsavedChanges ? (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                บันทึกแล้ว
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Download Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">ดาวน์โหลด:</span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload('pdf')}
            disabled={hasUnsavedChanges}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload('docx')}
            disabled={hasUnsavedChanges}
          >
            <File className="h-4 w-4 mr-2" />
            DOCX
          </Button>
        </div>
      </div>

      {/* Help Text */}
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            💡 <strong>คำแนะนำ:</strong> คลิกที่ไอคอนแก้ไขข้างหัวข้อแต่ละส่วนเพื่อแก้ไขเนื้อหา 
            หรือคลิกที่รูปภาพเพื่อแก้ไขคำอธิบายและตำแหน่ง
          </p>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>แจ้งเตือน:</strong> คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก 
            กรุณาบันทึกก่อนดาวน์โหลดเอกสาร
          </p>
        </div>
      )}
    </Card>
  );
}