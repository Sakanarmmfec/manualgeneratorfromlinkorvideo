'use client';

import React, { useState, useCallback, useRef } from 'react';
import { ImagePlacement } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { 
  Edit3, 
  Save, 
  X, 
  Upload, 
  Trash2, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';
import { clsx } from 'clsx';

interface ImagePreviewProps {
  image: ImagePlacement;
  sectionId: string;
  onUpdate: (updatedImage: ImagePlacement) => void;
  isEditing: boolean;
}

export function ImagePreview({ image, sectionId, onUpdate, isEditing }: ImagePreviewProps) {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [caption, setCaption] = useState(image.caption);
  const [position, setPosition] = useState(image.position);
  const [size, setSize] = useState(image.size);
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    const updatedImage: ImagePlacement = {
      ...image,
      caption: caption.trim(),
      position,
      size
    };
    onUpdate(updatedImage);
    setIsEditingImage(false);
  }, [image, caption, position, size, onUpdate]);

  const handleCancel = useCallback(() => {
    setCaption(image.caption);
    setPosition(image.position);
    setSize(image.size);
    setIsEditingImage(false);
  }, [image]);

  const handleImageReplace = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload the file and get a new URL
    // For now, we'll create a local URL for preview
    const newImageUrl = URL.createObjectURL(file);
    
    const updatedImage: ImagePlacement = {
      ...image,
      imageId: `${image.imageId}_${Date.now()}` // Generate new ID for replaced image
    };
    
    onUpdate(updatedImage);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [image, onUpdate]);

  const handleRemoveImage = useCallback(() => {
    // In a real implementation, you might want to confirm deletion
    // For now, we'll just update with empty image data
    const updatedImage: ImagePlacement = {
      ...image,
      imageId: '',
      caption: ''
    };
    onUpdate(updatedImage);
  }, [image, onUpdate]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-xs';
      case 'medium':
        return 'max-w-md';
      case 'large':
        return 'max-w-2xl';
      default:
        return 'max-w-md';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'mb-4';
      case 'bottom':
        return 'mt-4';
      case 'inline':
        return 'my-2';
      default:
        return 'my-2';
    }
  };

  // Don't render if image is removed
  if (!image.imageId) {
    return null;
  }

  return (
    <div className={clsx(
      'relative group',
      getPositionClasses(),
      position === 'inline' ? 'inline-block mr-4' : 'block'
    )}>
      {/* Image Container */}
      <div className={clsx(
        'relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50',
        getSizeClasses(),
        isZoomed && 'fixed inset-0 z-50 max-w-none bg-black bg-opacity-90 flex items-center justify-center'
      )}>
        {/* Image */}
        <img
          src={`/api/placeholder/400/300?text=${encodeURIComponent(image.caption || 'Image')}`}
          alt={image.caption}
          className={clsx(
            'w-full h-auto object-cover transition-transform duration-200',
            isZoomed ? 'max-h-screen max-w-screen cursor-zoom-out' : 'cursor-zoom-in hover:scale-105'
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom Overlay */}
        {isZoomed && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Edit Overlay */}
        {isEditing && !isZoomed && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditingImage(true)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Image Caption */}
      {!isEditingImage && image.caption && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">
          {image.caption}
        </p>
      )}

      {/* Image Editor */}
      {isEditingImage && (
        <Card className="absolute top-0 left-0 right-0 z-10 p-4 bg-white shadow-lg border-2 border-primary-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">แก้ไขรูปภาพ</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="คำอธิบายรูปภาพ"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="ใส่คำอธิบายรูปภาพ..."
              />

              <Select
                label="ตำแหน่งรูปภาพ"
                value={position}
                onChange={(e) => setPosition(e.target.value as 'top' | 'bottom' | 'inline')}
                options={[
                  { value: 'top', label: 'ด้านบน' },
                  { value: 'inline', label: 'ในเนื้อหา' },
                  { value: 'bottom', label: 'ด้านล่าง' }
                ]}
              />
            </div>

            <div>
              <Select
                label="ขนาดรูปภาพ"
                value={size}
                onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}
                options={[
                  { value: 'small', label: 'เล็ก' },
                  { value: 'medium', label: 'กลาง' },
                  { value: 'large', label: 'ใหญ่' }
                ]}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                เปลี่ยนรูปภาพ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                ลบรูปภาพ
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageReplace}
        className="hidden"
      />
    </div>
  );
}