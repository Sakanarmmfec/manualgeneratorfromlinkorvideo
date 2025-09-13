import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MainLayout } from './MainLayout';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}));

describe('MainLayout', () => {
  it('renders children content', () => {
    render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders header with MFEC branding', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Thai Document Generator')).toBeInTheDocument();
    expect(screen.getByText('MFEC Automated Documentation System')).toBeInTheDocument();
  });

  it('renders footer with MFEC information', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('MFEC Public Company Limited')).toBeInTheDocument();
    expect(screen.getByText(/© \d{4} MFEC Public Company Limited/)).toBeInTheDocument();
  });

  it('has proper responsive structure', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex-1', 'py-8');
  });
});