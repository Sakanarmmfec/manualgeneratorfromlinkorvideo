import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressStatus, ProgressStatusData } from '../ProgressStatus';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';

const mockProgressData: ProgressStatusData = {
  currentStep: 'step2',
  currentStepTitle: 'Processing Content',
  currentStepDescription: 'Analyzing and processing the content',
  status: 'processing',
  estimatedTimeRemaining: 120,
  totalEstimatedTime: 300,
  elapsedTime: 180,
  completedSteps: 2,
  totalSteps: 5,
  processingSpeed: 1.5,
  lastUpdate: new Date('2024-01-01T12:00:00Z')
};

describe('ProgressStatus', () => {
  it('renders processing status correctly', () => {
    render(<ProgressStatus data={mockProgressData} />);
    
    expect(screen.getByText('กำลังดำเนินการ...')).toBeInTheDocument();
    expect(screen.getByText('Processing Content')).toBeInTheDocument();
    expect(screen.getByText('Analyzing and processing the content')).toBeInTheDocument();
  });

  it('displays time information correctly', () => {
    render(<ProgressStatus data={mockProgressData} />);
    
    expect(screen.getByText(/ใช้เวลาไปแล้ว:/)).toBeInTheDocument();
    expect(screen.getByText(/เหลืออีก:/)).toBeInTheDocument();
    expect(screen.getByText(/รวมทั้งหมด:/)).toBeInTheDocument();
  });

  it('shows progress information', () => {
    render(<ProgressStatus data={mockProgressData} />);
    
    expect(screen.getByText('ขั้นตอน:')).toBeInTheDocument();
    expect(screen.getByText('เปอร์เซ็นต์:')).toBeInTheDocument();
    expect(screen.getByText('ความเร็ว:')).toBeInTheDocument();
    // Check for the specific formatted values
    expect(screen.getByText((content, element) => {
      return element?.textContent === '2/5';
    })).toBeInTheDocument();
    // Use getAllByText for elements that appear multiple times
    expect(screen.getAllByText((content, element) => {
      return element?.textContent === '40%';
    })).toHaveLength(2); // Appears in both progress section and mini progress bar
    expect(screen.getByText((content, element) => {
      return element?.textContent === '1.5 ขั้นตอน/นาที';
    })).toBeInTheDocument();
  });

  it('displays system information', () => {
    render(<ProgressStatus data={mockProgressData} />);
    
    expect(screen.getByText(/อัปเดตล่าสุด:/)).toBeInTheDocument();
    expect(screen.getByText(/ขั้นตอนปัจจุบัน:/)).toBeInTheDocument();
    expect(screen.getByText('step2')).toBeInTheDocument();
  });

  it('renders completed status correctly', () => {
    const completedData: ProgressStatusData = {
      ...mockProgressData,
      status: 'completed',
      estimatedTimeRemaining: undefined
    };

    render(<ProgressStatus data={completedData} />);
    
    expect(screen.getAllByText('เสร็จสิ้น')).toHaveLength(2); // Appears in title and status badge
    expect(screen.getByText(/การสร้างเอกสารเสร็จสิ้นแล้ว/)).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    const failedData: ProgressStatusData = {
      ...mockProgressData,
      status: 'failed',
      estimatedTimeRemaining: undefined
    };

    render(<ProgressStatus data={failedData} />);
    
    expect(screen.getAllByText('เกิดข้อผิดพลาด')).toHaveLength(2); // Appears in title and status badge
    expect(screen.getByText(/เกิดข้อผิดพลาดในการสร้างเอกสาร/)).toBeInTheDocument();
  });

  it('renders cancelled status correctly', () => {
    const cancelledData: ProgressStatusData = {
      ...mockProgressData,
      status: 'cancelled',
      estimatedTimeRemaining: undefined
    };

    render(<ProgressStatus data={cancelledData} />);
    
    expect(screen.getAllByText('ยกเลิกแล้ว')).toHaveLength(2); // Appears in title and status badge
    expect(screen.getByText(/การสร้างเอกสารถูกยกเลิก/)).toBeInTheDocument();
  });

  it('formats time correctly', () => {
    const dataWithShortTime: ProgressStatusData = {
      ...mockProgressData,
      elapsedTime: 45,
      estimatedTimeRemaining: 30
    };

    render(<ProgressStatus data={dataWithShortTime} />);
    
    expect(screen.getByText('ใช้เวลาไปแล้ว:')).toBeInTheDocument();
    expect(screen.getByText('45 วินาที')).toBeInTheDocument();
    expect(screen.getByText('เหลืออีก:')).toBeInTheDocument();
    expect(screen.getByText('30 วินาที')).toBeInTheDocument();
  });

  it('does not show estimated time remaining for non-processing status', () => {
    const completedData: ProgressStatusData = {
      ...mockProgressData,
      status: 'completed',
      estimatedTimeRemaining: undefined
    };

    render(<ProgressStatus data={completedData} />);
    
    expect(screen.queryByText(/เหลืออีก:/)).not.toBeInTheDocument();
  });
});