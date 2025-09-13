import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainLayout } from '../MainLayout';

import { vi } from 'vitest';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
}));

describe('MainLayout', () => {
  it('renders the main layout structure', () => {
    render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );

    // Check if main layout elements are present
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('displays MFEC branding in header', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getAllByAltText('MFEC Logo')).toHaveLength(2); // Header and footer
    expect(screen.getByText('Thai Document Generator')).toBeInTheDocument();
    expect(screen.getByText('MFEC Automated Documentation System')).toBeInTheDocument();
  });

  it('displays MFEC branding in footer', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('MFEC Public Company Limited')).toBeInTheDocument();
    expect(screen.getByText(/© \d{4} MFEC Public Company Limited/)).toBeInTheDocument();
    expect(screen.getByText('MFEC AI')).toBeInTheDocument();
  });

  it('has proper responsive structure', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const layout = screen.getByRole('main').parentElement;
    expect(layout).toHaveClass('min-h-screen', 'flex', 'flex-col');
  });

  it('includes navigation elements', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('สร้างเอกสาร')).toBeInTheDocument();
    expect(screen.getByText('ประวัติ')).toBeInTheDocument();
    expect(screen.getByText('ช่วยเหลือ')).toBeInTheDocument();
  });
});