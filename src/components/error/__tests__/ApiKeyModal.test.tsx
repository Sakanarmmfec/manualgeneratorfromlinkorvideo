import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ApiKeyModal } from '../ApiKeyModal';
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
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('ApiKeyModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(<ApiKeyModal {...defaultProps} />);

    expect(screen.getByText('API Key หมดอายุ')).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<ApiKeyModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('API Key หมดอายุ')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ApiKeyModal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /ปิด/i });
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('validates API key input', () => {
    render(<ApiKeyModal {...defaultProps} />);

    const form = screen.getByTestId('api-key-form');
    fireEvent.submit(form);

    expect(screen.getByText('กรุณาใส่ API Key')).toBeInTheDocument();
  });

  it('validates API key length', () => {
    render(<ApiKeyModal {...defaultProps} />);

    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: 'short' } });

    const form = screen.getByTestId('api-key-form');
    fireEvent.submit(form);

    expect(screen.getByText('API Key ไม่ถูกต้อง')).toBeInTheDocument();
  });

  it('calls onSubmit with valid API key', () => {
    render(<ApiKeyModal {...defaultProps} />);

    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: 'sk-valid-api-key-123456789' } });

    const form = screen.getByTestId('api-key-form');
    fireEvent.submit(form);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith('sk-valid-api-key-123456789');
  });

  it('shows validation error when provided', () => {
    render(
      <ApiKeyModal 
        {...defaultProps} 
        validationError="Invalid API key format"
      />
    );

    expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
  });

  it('shows loading state when validating', () => {
    render(<ApiKeyModal {...defaultProps} isValidating={true} />);

    expect(screen.getByText('กำลังตรวจสอบ...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /กำลังตรวจสอบ/i })).toBeDisabled();
  });

  it('toggles password visibility', () => {
    render(<ApiKeyModal {...defaultProps} />);

    const input = screen.getByLabelText('API Key');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /แสดงรหัสผ่าน/i });
    fireEvent.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('disables close button when validating', () => {
    render(<ApiKeyModal {...defaultProps} isValidating={true} />);

    expect(screen.queryByRole('button', { name: /ปิด/i })).not.toBeInTheDocument();
  });

  it('resets form when modal opens', () => {
    const { rerender } = render(<ApiKeyModal {...defaultProps} isOpen={false} />);

    rerender(<ApiKeyModal {...defaultProps} isOpen={true} />);

    const input = screen.getByLabelText('API Key');
    expect(input).toHaveValue('');
  });

  it('uses custom title and description', () => {
    render(
      <ApiKeyModal 
        {...defaultProps}
        title="Custom Title"
        description="Custom description text"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });
});