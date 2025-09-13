import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DownloadProgress } from '../DownloadProgress';

describe('DownloadProgress', () => {
  const defaultProps = {
    progress: 50,
    format: 'pdf' as const,
    filename: 'test-document.pdf'
  };

  it('renders progress information correctly', () => {
    render(<DownloadProgress {...defaultProps} />);

    expect(screen.getByText('กำลังดาวน์โหลด PDF')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays correct format icon', () => {
    const { rerender } = render(<DownloadProgress {...defaultProps} format="pdf" />);
    
    // PDF should show FileText icon (red)
    expect(document.querySelector('.text-red-500')).toBeInTheDocument();

    rerender(<DownloadProgress {...defaultProps} format="docx" />);
    
    // DOCX should show File icon (blue)
    expect(document.querySelector('.text-blue-500')).toBeInTheDocument();
  });

  it('shows progress bar with correct width', () => {
    render(<DownloadProgress {...defaultProps} progress={75} />);

    const progressBar = document.querySelector('.bg-blue-500');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('displays current stage based on progress', () => {
    const { rerender } = render(<DownloadProgress {...defaultProps} progress={10} />);
    expect(screen.getByText('เตรียมข้อมูล')).toBeInTheDocument();

    rerender(<DownloadProgress {...defaultProps} progress={30} />);
    expect(screen.getByText('ประมวลผลเนื้อหา')).toBeInTheDocument();

    rerender(<DownloadProgress {...defaultProps} progress={70} />);
    expect(screen.getByText('สร้างเอกสาร')).toBeInTheDocument();

    rerender(<DownloadProgress {...defaultProps} progress={90} />);
    expect(screen.getByText('จัดรูปแบบขั้นสุดท้าย')).toBeInTheDocument();
  });

  it('shows estimated time remaining', () => {
    render(
      <DownloadProgress 
        {...defaultProps} 
        estimatedTimeRemaining={120}
      />
    );

    expect(screen.getByText('เหลืออีก: 2:00')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const mockOnRetry = vi.fn();
    
    render(
      <DownloadProgress 
        {...defaultProps} 
        status="error"
        error="Network connection failed"
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: 'ลองใหม่' });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('displays completion state correctly', () => {
    render(
      <DownloadProgress 
        {...defaultProps} 
        status="complete"
        progress={100}
      />
    );

    expect(screen.getByText('เสร็จสิ้น')).toBeInTheDocument();
    expect(screen.getByText('ดาวน์โหลดเสร็จสิ้น')).toBeInTheDocument();
    expect(screen.getByText('ไฟล์ถูกบันทึกเรียบร้อยแล้ว')).toBeInTheDocument();
  });

  it('shows cancel button when provided', () => {
    const mockOnCancel = vi.fn();
    
    render(
      <DownloadProgress 
        {...defaultProps} 
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'ยกเลิก' });
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('formats time correctly', () => {
    const { rerender } = render(
      <DownloadProgress 
        {...defaultProps} 
        estimatedTimeRemaining={45}
      />
    );

    expect(screen.getByText('เหลืออีก: 45วินาที')).toBeInTheDocument();

    rerender(
      <DownloadProgress 
        {...defaultProps} 
        estimatedTimeRemaining={90}
      />
    );

    expect(screen.getByText('เหลืออีก: 1:30')).toBeInTheDocument();
  });

  it('shows stage indicators with correct states', () => {
    render(<DownloadProgress {...defaultProps} progress={30} />);

    const stageIndicators = document.querySelectorAll('.w-3.h-3.rounded-full');
    
    // First stage (completed) should have blue background
    expect(stageIndicators[0]).toHaveClass('bg-blue-500');
    
    // Later stages should have white background
    expect(stageIndicators[2]).toHaveClass('bg-white');
  });

  it('updates elapsed time', () => {
    vi.useFakeTimers();
    
    render(<DownloadProgress {...defaultProps} />);
    
    expect(screen.getByText('เวลาที่ใช้: 0วินาที')).toBeInTheDocument();
    
    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);
    
    expect(screen.getByText('เวลาที่ใช้: 5วินาที')).toBeInTheDocument();
    
    vi.useRealTimers();
  });
});