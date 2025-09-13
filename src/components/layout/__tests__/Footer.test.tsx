import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../Footer';

import { vi } from 'vitest';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
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

describe('Footer', () => {
  it('renders MFEC branding and company information', () => {
    render(<Footer />);

    expect(screen.getByAltText('MFEC Logo')).toBeInTheDocument();
    expect(screen.getByText('MFEC Public Company Limited')).toBeInTheDocument();
    expect(screen.getByText(/Leading technology solutions provider/)).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<Footer />);

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('www.mfec.co.th')).toBeInTheDocument();
    expect(screen.getByText('info@mfec.co.th')).toBeInTheDocument();
    expect(screen.getByText('+66 (0) 2 513 2900')).toBeInTheDocument();
  });

  it('displays application information', () => {
    render(<Footer />);

    expect(screen.getByText('Application Info')).toBeInTheDocument();
    expect(screen.getByText('Thai Document Generator v1.0')).toBeInTheDocument();
    expect(screen.getByText('Automated documentation system')).toBeInTheDocument();
    expect(screen.getByText('Powered by AI technology')).toBeInTheDocument();
  });

  it('displays copyright information', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);

    expect(screen.getByText(`© ${currentYear} MFEC Public Company Limited. All rights reserved.`)).toBeInTheDocument();
  });

  it('displays source attribution notice', () => {
    render(<Footer />);

    expect(screen.getByText('Generated documents include source attribution as required')).toBeInTheDocument();
  });

  it('displays powered by MFEC AI', () => {
    render(<Footer />);

    expect(screen.getByText('Powered by')).toBeInTheDocument();
    expect(screen.getByText('MFEC AI')).toBeInTheDocument();
  });

  it('applies MFEC footer styling', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('mfec-footer');
  });

  it('has external link to MFEC website', () => {
    render(<Footer />);

    const mfecLink = screen.getByText('www.mfec.co.th');
    expect(mfecLink.closest('a')).toHaveAttribute('href', 'https://www.mfec.co.th');
    expect(mfecLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(mfecLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});