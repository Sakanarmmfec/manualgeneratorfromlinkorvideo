import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ProgressControls } from '../ProgressControls';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('ProgressControls', () => {
  const mockHandlers = {
    onCancel: vi.fn(),
    onRetry: vi.fn(),
    onPreview: vi.fn(),
    onDownload: vi.fn(),
    onStartNew: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders processing controls correctly', () => {
    render(
      <ProgressControls
        status="processing"
        canCancel={true}
        onCancel={mockHandlers.onCancel}
      />
    );
    
    expect(screen.getByText('กำลังดำเนินการ...')).toBeInTheDocument();
    expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ProgressControls
        status="processing"
        canCancel={true}
        onCancel={mockHandlers.onCancel}
      />
    );
    
    fireEvent.click(screen.getByText('ยกเลิก'));
    expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders completed controls correctly', () => {
    render(
      <ProgressControls
        status="completed"
        canPreview={true}
        canDownload={true}
        onPreview={mockHandlers.onPreview}
        onDownload={mockHandlers.onDownload}
        onStartNew={mockHandlers.onStartNew}
      />
    );
    
    expect(screen.getByText('สร้างเอกสารเสร็จสิ้น')).toBeInTheDocument();
    expect(screen.getByText('ดูตัวอย่าง')).toBeInTheDocument();
    expect(screen.getByText('ดาวน์โหลด')).toBeInTheDocument();
    expect(screen.getByText('สร้างเอกสารใหม่')).toBeInTheDocument();
  });

  it('calls preview and download handlers correctly', () => {
    render(
      <ProgressControls
        status="completed"
        canPreview={true}
        canDownload={true}
        onPreview={mockHandlers.onPreview}
        onDownload={mockHandlers.onDownload}
      />
    );
    
    fireEvent.click(screen.getByText('ดูตัวอย่าง'));
    expect(mockHandlers.onPreview).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText('ดาวน์โหลด'));
    expect(mockHandlers.onDownload).toHaveBeenCalledTimes(1);
  });

  it('renders failed controls with error message', () => {
    render(
      <ProgressControls
        status="failed"
        canRetry={true}
        onRetry={mockHandlers.onRetry}
        error="Connection failed"
        retryCount={1}
        maxRetries={3}
      />
    );
    
    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    expect(screen.getByText('ลองใหม่แล้ว 1 ครั้ง')).toBeInTheDocument();
    expect(screen.getByText(/ลองใหม่ \(2 ครั้งเหลือ\)/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(
      <ProgressControls
        status="failed"
        canRetry={true}
        onRetry={mockHandlers.onRetry}
        retryCount={0}
        maxRetries={3}
      />
    );
    
    fireEvent.click(screen.getByText(/ลองใหม่/));
    expect(mockHandlers.onRetry).toHaveBeenCalledTimes(1);
  });

  it('disables retry when max retries reached', () => {
    render(
      <ProgressControls
        status="failed"
        canRetry={true}
        onRetry={mockHandlers.onRetry}
        retryCount={3}
        maxRetries={3}
      />
    );
    
    expect(screen.queryByText(/ลองใหม่ \(/)).not.toBeInTheDocument();
    expect(screen.getByText(/ลองใหม่ครบจำนวนแล้ว/)).toBeInTheDocument();
  });

  it('renders cancelled controls correctly', () => {
    render(
      <ProgressControls
        status="cancelled"
        canRetry={true}
        onRetry={mockHandlers.onRetry}
        onStartNew={mockHandlers.onStartNew}
      />
    );
    
    expect(screen.getByText('การสร้างเอกสารถูกยกเลิก')).toBeInTheDocument();
    expect(screen.getByText('เริ่มใหม่')).toBeInTheDocument();
    expect(screen.getByText('สร้างเอกสารใหม่')).toBeInTheDocument();
  });

  it('calls onStartNew when start new button is clicked', () => {
    render(
      <ProgressControls
        status="cancelled"
        onStartNew={mockHandlers.onStartNew}
      />
    );
    
    fireEvent.click(screen.getByText('สร้างเอกสารใหม่'));
    expect(mockHandlers.onStartNew).toHaveBeenCalledTimes(1);
  });

  it('does not render cancel button when canCancel is false', () => {
    render(
      <ProgressControls
        status="processing"
        canCancel={false}
        onCancel={mockHandlers.onCancel}
      />
    );
    
    expect(screen.queryByText('ยกเลิก')).not.toBeInTheDocument();
  });

  it('does not render preview/download buttons when not enabled', () => {
    render(
      <ProgressControls
        status="completed"
        canPreview={false}
        canDownload={false}
      />
    );
    
    expect(screen.queryByText('ดูตัวอย่าง')).not.toBeInTheDocument();
    expect(screen.queryByText('ดาวน์โหลด')).not.toBeInTheDocument();
  });
});