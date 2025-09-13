'use client';

import React, { useState, useCallback } from 'react';
import { DocumentSection, GeneratedDocument, ImagePlacement } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionEditor } from './SectionEditor';
import { ImagePreview } from './ImagePreview';
import { DocumentToolbar } from './DocumentToolbar';
import { Edit3, Eye, Save, Download } from 'lucide-react';
import { clsx } from 'clsx';

interface DocumentPreviewProps {
  document: GeneratedDocument;
  onDocumentUpdate: (updatedDocument: GeneratedDocument) => void;
  onSave: () => void;
  onDownload: (format: 'pdf' | 'docx') => void;
  isEditing?: boolean;
  onEditModeChange: (isEditing: boolean) => void;
}

export function DocumentPreview({
  document,
  onDocumentUpdate,
  onSave,
  onDownload,
  isEditing = false,
  onEditModeChange
}: DocumentPreviewProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSectionUpdate = useCallback((sectionId: string, updatedSection: DocumentSection) => {
    const updateSections = (sections: DocumentSection[]): DocumentSection[] => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return updatedSection;
        }
        if (section.subsections.length > 0) {
          return {
            ...section,
            subsections: updateSections(section.subsections)
          };
        }
        return section;
      });
    };

    const updatedDocument = {
      ...document,
      content: {
        ...document.content,
        organizedSections: updateSections(document.content.organizedSections)
      }
    };

    onDocumentUpdate(updatedDocument);
    setHasUnsavedChanges(true);
  }, [document, onDocumentUpdate]);

  const handleImageUpdate = useCallback((sectionId: string, imageId: string, updatedImage: ImagePlacement) => {
    const updateSectionImages = (sections: DocumentSection[]): DocumentSection[] => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            images: section.images.map(img => 
              img.imageId === imageId ? updatedImage : img
            )
          };
        }
        if (section.subsections.length > 0) {
          return {
            ...section,
            subsections: updateSectionImages(section.subsections)
          };
        }
        return section;
      });
    };

    const updatedDocument = {
      ...document,
      content: {
        ...document.content,
        organizedSections: updateSectionImages(document.content.organizedSections)
      }
    };

    onDocumentUpdate(updatedDocument);
    setHasUnsavedChanges(true);
  }, [document, onDocumentUpdate]);

  const handleSave = useCallback(() => {
    onSave();
    setHasUnsavedChanges(false);
  }, [onSave]);

  const renderSection = (section: DocumentSection, level: number = 1) => {
    const isCurrentlyEditing = editingSection === section.id;
    
    return (
      <div key={section.id} className={clsx(
        'mb-6',
        level === 1 && 'border-b border-gray-200 pb-6'
      )}>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={clsx(
            'font-semibold text-gray-900 mfec-heading',
            level === 1 && 'text-2xl',
            level === 2 && 'text-xl',
            level === 3 && 'text-lg',
            level >= 4 && 'text-base'
          )}>
            {section.title}
          </h2>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingSection(isCurrentlyEditing ? null : section.id)}
            >
              {isCurrentlyEditing ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Section Content */}
        {isCurrentlyEditing ? (
          <SectionEditor
            section={section}
            onUpdate={(updatedSection) => handleSectionUpdate(section.id, updatedSection)}
            onCancel={() => setEditingSection(null)}
            onSave={() => setEditingSection(null)}
          />
        ) : (
          <div className="mfec-content">
            {/* Section Images - Top */}
            {section.images
              .filter(img => img.position === 'top')
              .map(image => (
                <ImagePreview
                  key={image.imageId}
                  image={image}
                  sectionId={section.id}
                  onUpdate={(updatedImage) => handleImageUpdate(section.id, image.imageId, updatedImage)}
                  isEditing={isEditing}
                />
              ))}

            {/* Section Text Content */}
            <div 
              className="prose prose-lg max-w-none mfec-text"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />

            {/* Section Images - Inline and Bottom */}
            {section.images
              .filter(img => img.position === 'inline' || img.position === 'bottom')
              .map(image => (
                <ImagePreview
                  key={image.imageId}
                  image={image}
                  sectionId={section.id}
                  onUpdate={(updatedImage) => handleImageUpdate(section.id, image.imageId, updatedImage)}
                  isEditing={isEditing}
                />
              ))}
          </div>
        )}

        {/* Subsections */}
        {section.subsections.length > 0 && (
          <div className="ml-4 mt-6">
            {section.subsections.map(subsection => 
              renderSection(subsection, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Document Toolbar */}
      <DocumentToolbar
        isEditing={isEditing}
        hasUnsavedChanges={hasUnsavedChanges}
        onEditModeChange={onEditModeChange}
        onSave={handleSave}
        onDownload={onDownload}
      />

      {/* Document Header */}
      <Card className="mb-6 mfec-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mfec-heading">
                {document.title}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                สร้างจาก: {document.sourceAttribution.originalUrl}
              </p>
              <p className="text-sm text-gray-500">
                สร้างเมื่อ: {new Date(document.generationMetadata.generatedAt).toLocaleDateString('th-TH')}
              </p>
            </div>
            <div className="mfec-logo">
              {/* MFEC Logo placeholder - will be replaced with actual logo */}
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm">MFEC</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Document Content */}
      <Card className="mfec-shadow">
        <CardContent className="p-8">
          <div className="mfec-document-content">
            {document.content.organizedSections.map(section => 
              renderSection(section)
            )}
          </div>

          {/* Document Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>เอกสารนี้สร้างโดยระบบสร้างเอกสารภาษาไทยอัตโนมัติของ MFEC</p>
            <p>แหล่งที่มา: {document.sourceAttribution.attribution}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}