import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../Header';

import { vi } from 'vitest';
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

describe('Header', () => {
  it('renders MFEC logo and branding', () => {
    render(<Header />);

    expect(screen.getByAltText('MFEC Logo')).toBeInTheDocument();
    expect(screen.getByText('Thai Document Generator')).toBeInTheDocument();
    expect(screen.getByText('MFEC Automated Documentation System')).toBeInTheDocument();
  });

  it('displays navigation links on desktop', () => {
    render(<Header />);

    expect(screen.getByText('สร้างเอกสาร')).toBeInTheDocument();
    expect(screen.getByText('ประวัติ')).toBeInTheDocument();
    expect(screen.getByText('ช่วยเหลือ')).toBeInTheDocument();
  });

  it('has settings button', () => {
    render(<Header />);

    const settingsButton = screen.getByLabelText('ตั้งค่า');
    expect(settingsButton).toBeInTheDocument();
  });

  it('has mobile menu button', () => {
    render(<Header />);

    const mobileMenuButton = screen.getByLabelText('เปิดเมนู');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('opens mobile menu when button is clicked', () => {
    render(<Header />);

    const mobileMenuButton = screen.getByLabelText('เปิดเมนู');
    fireEvent.click(mobileMenuButton);

    // Mobile menu should be visible
    expect(screen.getByText('เมนู')).toBeInTheDocument();
  });

  it('applies MFEC header styling', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('mfec-header');
  });
});