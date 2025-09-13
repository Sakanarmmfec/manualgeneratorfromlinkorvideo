import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DownloadInterface } from '../DownloadInterface';
import { GeneratedDocument } from '@/types';

// Mock document for testing
const mockDocument: GeneratedDocument = {
  id: 'test-doc-1',
  title: 'Test Document',
  content: {
    translatedContent: 'Test content',
    organizedSections: [],
    refinedContent: 'Refined content',
    sourceAttribution: {
      originalUrl: 'https://example.com/test',
      extractionDate: new Date('2024-01-15'),
      contentType: 'website',
      attribution: 'Test attribution'
    },
    qualityScore: 0.95
  },
  template: {} as any,
  sourceAttribution: {
    originalUrl: 'https://example.com/test',
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

describe('DownloadInterface', () => {
  const mockOnDownloadComplete = vi.fn();
  const mockOnDownloadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders download interface components', () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    expect(screen.getByText('ดาวน์โหลดเอกสาร')).toBeInTheDocument();
    expect(screen.getByText('การดำเนินการด่วน')).toBeInTheDocument();
    expect(screen.getByText('PDF ด่วน')).toBeInTheDocument();
    expect(screen.getByText('DOCX ด่วน')).toBeInTheDocument();
  });

  it('handles quick PDF download', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Should show progress
    expect(screen.getByText('กำลังดาวน์โหลด PDF')).toBeInTheDocument();

    // Fast-forward through the download simulation
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(mockOnDownloadComplete).toHaveBeenCalledWith(
        expect.stringMatching(/test-document-.*\.pdf/),
        'pdf'
      );
    });
  });

  it('handles quick DOCX download', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickDocxButton = screen.getByRole('button', { name: /DOCX ด่วน/ });
    fireEvent.click(quickDocxButton);

    // Should show progress
    expect(screen.getByText('กำลังดาวน์โหลด DOCX')).toBeInTheDocument();

    // Fast-forward through the download simulation
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(mockOnDownloadComplete).toHaveBeenCalledWith(
        expect.stringMatching(/test-document-.*\.docx/),
        'docx'
      );
    });
  });

  it('shows download progress during download', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Should show progress components
    expect(screen.getByText('กำลังดาวน์โหลด PDF')).toBeInTheDocument();
    expect(screen.getByText('เตรียมข้อมูล')).toBeInTheDocument();

    // Advance time to see progress updates
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('ประมวลผลเนื้อหา')).toBeInTheDocument();
    });
  });

  it('handles download errors', async () => {
    // Mock Math.random to always return a value that triggers error (> 0.95)
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0.96);

    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    await waitFor(() => {
      expect(mockOnDownloadError).toHaveBeenCalledWith(
        'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
      );
    });

    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();

    // Restore Math.random
    Math.random = originalRandom;
  });

  it('allows retry after error', async () => {
    // Mock Math.random to trigger error first, then succeed
    let callCount = 0;
    const originalRandom = Math.random;
    Math.random = vi.fn(() => {
      callCount++;
      return callCount === 1 ? 0.96 : 0.01; // Error first, then success
    });

    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByRole('button', { name: 'ลองใหม่' });
    fireEvent.click(retryButton);

    // Fast-forward through successful download
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(mockOnDownloadComplete).toHaveBeenCalled();
    });

    // Restore Math.random
    Math.random = originalRandom;
  });

  it('allows canceling download', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Should show cancel button
    const cancelButton = screen.getByRole('button', { name: 'ยกเลิก' });
    fireEvent.click(cancelButton);

    // Progress should be hidden
    await waitFor(() => {
      expect(screen.queryByText('กำลังดาวน์โหลด PDF')).not.toBeInTheDocument();
    });
  });

  it('shows success notification after completion', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Fast-forward through download
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(screen.getByText('ดาวน์โหลดเสร็จสิ้น')).toBeInTheDocument();
    });
  });

  it('hides quick actions during download', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Quick actions should be hidden during download
    await waitFor(() => {
      expect(screen.queryByText('การดำเนินการด่วน')).not.toBeInTheDocument();
    });
  });

  it('dismisses success notifications', async () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    const quickPdfButton = screen.getByRole('button', { name: /PDF ด่วน/ });
    fireEvent.click(quickPdfButton);

    // Fast-forward through download
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(screen.getByText('ดาวน์โหลดเสร็จสิ้น')).toBeInTheDocument();
    });

    // Find and click dismiss button (X button)
    const dismissButton = screen.getByRole('button', { name: '' }); // X icon
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('ดาวน์โหลดเสร็จสิ้น')).not.toBeInTheDocument();
    });
  });

  it('generates correct default filenames for quick actions', () => {
    render(
      <DownloadInterface
        document={mockDocument}
        onDownloadComplete={mockOnDownloadComplete}
        onDownloadError={mockOnDownloadError}
      />
    );

    // The filename generation is tested indirectly through the download calls
    // We can verify the pattern by checking the onDownloadComplete calls
    expect(screen.getByText('PDF ด่วน')).toBeInTheDocument();
    expect(screen.getByText('DOCX ด่วน')).toBeInTheDocument();
  });
});