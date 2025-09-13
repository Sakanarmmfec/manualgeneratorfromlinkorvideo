import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DownloadPanel } from '../DownloadPanel';
import { GeneratedDocument } from '@/types';

// Mock document for testing
const mockDocument: GeneratedDocument = {
  id: 'test-doc-1',
  title: 'Test Document Title',
  content: {
    translatedContent: 'Test content',
    organizedSections: [],
    refinedContent: 'Refined content',
    sourceAttribution: {
      originalUrl: 'https://example.com/test-page',
      extractionDate: new Date('2024-01-15'),
      contentType: 'website',
      attribution: 'Test attribution'
    },
    qualityScore: 0.95
  },
  template: {} as any,
  sourceAttribution: {
    originalUrl: 'https://example.com/test-page',
    extractionDate: new Date('2024-01-15'),
    contentType: 'website',
    attribution: 'Test attribution'
  },
  generationMetadata: {
    generatedAt: new Date('2024-01-15T10:30:00'),
    processingTime: 45000,
    aiModel: 'gpt-4o',
    version: '1.0.0'
  },
  previewUrl: '/preview/test-doc-1',
  downloadFormats: ['pdf', 'docx']
};

describe('DownloadPanel', () => {
  const mockOnDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders download panel with format selection', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('ดาวน์โหลดเอกสาร')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('DOCX')).toBeInTheDocument();
  });

  it('generates default filename correctly', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    const filenameInput = screen.getByDisplayValue(/test-document-title-example-com-.*\.pdf/);
    expect(filenameInput).toBeInTheDocument();
  });

  it('switches between PDF and DOCX formats', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    const docxButton = screen.getByRole('button', { name: /DOCX/ });
    fireEvent.click(docxButton);

    // Check if filename extension changed to .docx
    expect(screen.getByDisplayValue(/\.docx$/)).toBeInTheDocument();
  });

  it('allows custom filename input', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    const filenameInput = screen.getByRole('textbox');
    fireEvent.change(filenameInput, { target: { value: 'custom-filename.pdf' } });

    expect(screen.getByDisplayValue('custom-filename.pdf')).toBeInTheDocument();
  });

  it('shows advanced options when toggled', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    const advancedButton = screen.getByText('แสดงตัวเลือกขั้นสูง');
    fireEvent.click(advancedButton);

    expect(screen.getByText('เพิ่มลายน้ำ MFEC')).toBeInTheDocument();
    expect(screen.getByText('ระดับการบีบอัด')).toBeInTheDocument();
  });

  it('calls onDownload with correct options', async () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /ดาวน์โหลด PDF/ });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockOnDownload).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'pdf',
          includeSourceAttribution: true,
          includeGenerationDate: true,
          includeWatermark: false,
          compressionLevel: 'medium'
        })
      );
    });
  });

  it('disables download button when downloading', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
        isDownloading={true}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /กำลังดาวน์โหลด/ });
    expect(downloadButton).toBeDisabled();
  });

  it('displays document information correctly', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    expect(screen.getByText('Test Document Title')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/test-page')).toBeInTheDocument();
    expect(screen.getByText(/15\/1\/2024/)).toBeInTheDocument(); // Thai date format
  });

  it('toggles checkboxes correctly', () => {
    render(
      <DownloadPanel
        document={mockDocument}
        onDownload={mockOnDownload}
      />
    );

    const sourceAttributionCheckbox = screen.getByRole('checkbox', { name: /รวมข้อมูลแหล่งที่มา/ });
    expect(sourceAttributionCheckbox).toBeChecked();

    fireEvent.click(sourceAttributionCheckbox);
    expect(sourceAttributionCheckbox).not.toBeChecked();
  });
});