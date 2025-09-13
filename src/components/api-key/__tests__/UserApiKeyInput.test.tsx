import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserApiKeyInput } from '../UserApiKeyInput';

describe('UserApiKeyInput', () => {
  const mockOnApiKeySubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    expect(screen.getByText('ใส่ API Key ของคุณ')).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByText('ยืนยัน')).toBeInTheDocument();
  });

  it('shows instructions when showInstructions is true', () => {
    render(
      <UserApiKeyInput 
        onApiKeySubmit={mockOnApiKeySubmit}
        showInstructions={true}
      />
    );

    expect(screen.getByText('Token หลักหมดอายุ')).toBeInTheDocument();
    expect(screen.getByText('วิธีการรับ API Key')).toBeInTheDocument();
    expect(screen.getAllByText('เปิด MFEC LiteLLM Portal')).toHaveLength(1);
  });

  it('hides instructions when showInstructions is false', () => {
    render(
      <UserApiKeyInput 
        onApiKeySubmit={mockOnApiKeySubmit}
        showInstructions={false}
      />
    );

    expect(screen.queryByText('Token หลักหมดอายุ')).not.toBeInTheDocument();
    expect(screen.queryByText('วิธีการรับ API Key')).not.toBeInTheDocument();
  });

  it('validates empty API key', async () => {
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const form = screen.getByTestId('user-api-key-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('กรุณาใส่ API Key')).toBeInTheDocument();
    });

    expect(mockOnApiKeySubmit).not.toHaveBeenCalled();
  });

  it('validates short API key', async () => {
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: 'short' } });

    const submitButton = screen.getByText('ยืนยัน');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Key ไม่ถูกต้อง')).toBeInTheDocument();
    });

    expect(mockOnApiKeySubmit).not.toHaveBeenCalled();
  });

  it('submits valid API key', async () => {
    const validApiKey = 'sk-1234567890abcdef';
    
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: validApiKey } });

    const submitButton = screen.getByText('ยืนยัน');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnApiKeySubmit).toHaveBeenCalledWith(validApiKey);
    });
  });

  it('toggles API key visibility', () => {
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('แสดงรหัสผ่าน');

    expect(input.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('shows validation error', () => {
    const errorMessage = 'Invalid API key format';
    
    render(
      <UserApiKeyInput 
        onApiKeySubmit={mockOnApiKeySubmit}
        validationError={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('disables form when validating', () => {
    render(
      <UserApiKeyInput 
        onApiKeySubmit={mockOnApiKeySubmit}
        isValidating={true}
      />
    );

    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByRole('button', { name: /กำลังตรวจสอบ/ });
    const toggleButton = screen.getByLabelText('แสดงรหัสผ่าน');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(toggleButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <UserApiKeyInput 
        onApiKeySubmit={mockOnApiKeySubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('ยกเลิก');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('resets form when reset button is clicked', () => {
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test-key' } });

    expect(input.value).toBe('test-key');

    const resetButton = screen.getByText('ล้างข้อมูล');
    fireEvent.click(resetButton);

    expect(input.value).toBe('');
  });

  it('shows security notice', () => {
    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    expect(screen.getByText('ความปลอดภัย:')).toBeInTheDocument();
    expect(screen.getByText('API Key จะถูกใช้เฉพาะในเซสชันนี้')).toBeInTheDocument();
    expect(screen.getByText('ไม่มีการบันทึกหรือเก็บข้อมูลถาวร')).toBeInTheDocument();
    expect(screen.getByText('การเชื่อมต่อใช้ HTTPS เท่านั้น')).toBeInTheDocument();
  });

  it('handles async submission errors', async () => {
    const errorMessage = 'Network error';
    mockOnApiKeySubmit.mockRejectedValue(new Error(errorMessage));

    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: 'sk-1234567890abcdef' } });

    const submitButton = screen.getByText('ยืนยัน');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('trims whitespace from API key', async () => {
    const apiKeyWithSpaces = '  sk-1234567890abcdef  ';
    const trimmedApiKey = 'sk-1234567890abcdef';

    render(
      <UserApiKeyInput onApiKeySubmit={mockOnApiKeySubmit} />
    );

    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: apiKeyWithSpaces } });

    const submitButton = screen.getByText('ยืนยัน');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnApiKeySubmit).toHaveBeenCalledWith(trimmedApiKey);
    });
  });
});