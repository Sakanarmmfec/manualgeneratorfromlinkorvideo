import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar, ProgressStep } from '../ProgressBar';
import { expect } from 'vitest';
import { it } from 'vitest';
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
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';

const mockSteps: ProgressStep[] = [
  {
    id: 'step1',
    title: 'Step 1',
    description: 'First step description',
    status: 'completed',
    estimatedDuration: 10,
    actualDuration: 8
  },
  {
    id: 'step2',
    title: 'Step 2',
    description: 'Second step description',
    status: 'in_progress',
    estimatedDuration: 15
  },
  {
    id: 'step3',
    title: 'Step 3',
    description: 'Third step description',
    status: 'pending',
    estimatedDuration: 20
  },
  {
    id: 'step4',
    title: 'Step 4',
    description: 'Fourth step description',
    status: 'failed',
    estimatedDuration: 12
  }
];

describe('ProgressBar', () => {
  it('renders all steps correctly', () => {
    render(<ProgressBar steps={mockSteps} currentStepId="step2" />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Step 4')).toBeInTheDocument();
  });

  it('displays correct progress percentage', () => {
    render(<ProgressBar steps={mockSteps} currentStepId="step2" />);
    
    // 1 completed step out of 4 total = 25%
    expect(screen.getByText('1 จาก 4 ขั้นตอน')).toBeInTheDocument();
  });

  it('shows step descriptions', () => {
    render(<ProgressBar steps={mockSteps} currentStepId="step2" />);
    
    expect(screen.getByText('First step description')).toBeInTheDocument();
    expect(screen.getByText('Second step description')).toBeInTheDocument();
    expect(screen.getByText('Third step description')).toBeInTheDocument();
    expect(screen.getByText('Fourth step description')).toBeInTheDocument();
  });

  it('displays duration information correctly', () => {
    render(<ProgressBar steps={mockSteps} currentStepId="step2" />);
    
    // Completed step shows actual duration
    expect(screen.getByText('8s')).toBeInTheDocument();
    
    // Pending step shows estimated duration
    expect(screen.getByText('~15s')).toBeInTheDocument();
    expect(screen.getByText('~20s')).toBeInTheDocument();
  });

  it('applies correct CSS classes for different step statuses', () => {
    const { container } = render(<ProgressBar steps={mockSteps} currentStepId="step2" />);
    
    // Check for status-specific classes (this is a simplified check)
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument(); // completed
    expect(container.querySelector('.bg-primary-600')).toBeInTheDocument(); // in_progress
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument(); // failed
  });

  it('shows loading spinner for in-progress step', () => {
    const { container } = render(<ProgressBar steps={mockSteps} currentStepId="step2" />);
    
    // Check for spinner (animate-spin class)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles empty steps array', () => {
    render(<ProgressBar steps={[]} />);
    
    expect(screen.getByText('0 จาก 0 ขั้นตอน')).toBeInTheDocument();
  });
});