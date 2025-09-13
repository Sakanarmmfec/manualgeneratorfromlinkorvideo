import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyManager } from '../ApiKeyManager';
import { apiKeyManager } from '@/lib/config/APIKeyManager';

// Mock the API key manager
vi.mock('@/lib/config/APIKeyManager', () => ({
  apiKeyManager: {
    getKeyStatus: vi.fn(),
    validateKey: vi.fn(),
    setFallbackKey: vi.fn(),
    switchToFallback: vi.fn(),
    clearFallbackKey: vi.fn(),
    resetToPrimary: vi.fn(),
    testConfiguration: vi.fn()
  }
}));

const mockApiKeyManager = apiKeyManager as any;

describe('ApiKeyManager', () => {
  const mockOnApiKeyUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'active',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true
    });
  });

  it('renders with default status', async () => {
    render(<ApiKeyManager />);

    await waitFor(() => {
      expect(screen.getByText('สถานะ API Key')).toBeInTheDocument();
    });
  });

  it('shows API key input when primary key is exhausted', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'exhausted',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true
    });

    render(<ApiKeyManager />);

    await waitFor(() => {
      expect(screen.getByText('ใส่ API Key ของคุณ')).toBeInTheDocument();
    });
  });

  it('does not show API key input when user keys are not allowed', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'exhausted',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: false
    });

    render(<ApiKeyManager />);

    await waitFor(() => {
      expect(screen.queryByText('ใส่ API Key ของคุณ')).not.toBeInTheDocument();
    });
  });

  it('handles successful API key submission', async () => {
    mockApiKeyManager.getKeyStatus
      .mockReturnValueOnce({
        status: 'exhausted',
        currentKeyType: 'primary',
        hasFallback: false,
        canUseFallback: true
      })
      .mockReturnValueOnce({
        status: 'active',
        currentKeyType: 'fallback',
        hasFallback: true,
        canUseFallback: true
      });

    mockApiKeyManager.validateKey.mockResolvedValue(true);

    render(<ApiKeyManager onApiKeyUpdated={mockOnApiKeyUpdated} />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByText('ยืนยัน');

    fireEvent.change(input, { target: { value: 'sk-1234567890abcdef' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiKeyManager.validateKey).toHaveBeenCalledWith('sk-1234567890abcdef');
      expect(mockApiKeyManager.setFallbackKey).toHaveBeenCalledWith('sk-1234567890abcdef');
      expect(mockApiKeyManager.switchToFallback).toHaveBeenCalled();
      expect(mockOnApiKeyUpdated).toHaveBeenCalledWith(true);
    });
  });

  it('handles API key validation failure', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'exhausted',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true
    });

    mockApiKeyManager.validateKey.mockResolvedValue(false);

    render(<ApiKeyManager />);

    await waitFor(() => {
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByText('ยืนยัน');

    fireEvent.change(input, { target: { value: 'invalid-key' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Key ไม่ถูกต้องหรือไม่สามารถใช้งานได้')).toBeInTheDocument();
    });
  });

  it('handles test key functionality', async () => {
    mockApiKeyManager.testConfiguration.mockResolvedValue({
      isValid: true,
      keyType: 'primary'
    });

    render(<ApiKeyManager />);

    await waitFor(() => {
      expect(screen.getByText('ทดสอบ')).toBeInTheDocument();
    });

    const testButton = screen.getByText('ทดสอบ');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockApiKeyManager.testConfiguration).toHaveBeenCalled();
    });
  });

  it('handles clear fallback functionality', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'active',
      currentKeyType: 'primary',
      hasFallback: true,
      canUseFallback: true
    });

    render(<ApiKeyManager onApiKeyUpdated={mockOnApiKeyUpdated} />);

    await waitFor(() => {
      expect(screen.getByText('ลบ API Key ผู้ใช้')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('ลบ API Key ผู้ใช้');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockApiKeyManager.clearFallbackKey).toHaveBeenCalled();
      expect(mockOnApiKeyUpdated).toHaveBeenCalled();
    });
  });

  it('handles switch to primary functionality', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'active',
      currentKeyType: 'fallback',
      hasFallback: true,
      canUseFallback: true
    });

    render(<ApiKeyManager onApiKeyUpdated={mockOnApiKeyUpdated} />);

    await waitFor(() => {
      expect(screen.getByText('กลับไปใช้ Key หลัก')).toBeInTheDocument();
    });

    const switchButton = screen.getByText('กลับไปใช้ Key หลัก');
    fireEvent.click(switchButton);

    await waitFor(() => {
      expect(mockApiKeyManager.resetToPrimary).toHaveBeenCalled();
      expect(mockOnApiKeyUpdated).toHaveBeenCalled();
    });
  });

  it('shows input button when key is exhausted and input is hidden', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'exhausted',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true
    });

    render(<ApiKeyManager />);

    // Initially shows input form
    await waitFor(() => {
      expect(screen.getByText('ใส่ API Key ของคุณ')).toBeInTheDocument();
    });

    // Cancel the input form
    const cancelButton = screen.getByText('ยกเลิก');
    fireEvent.click(cancelButton);

    // Should show the input button
    await waitFor(() => {
      expect(screen.getByText('ใส่ API Key ของคุณ')).toBeInTheDocument();
    });
  });

  it('hides status when showStatus is false', () => {
    render(<ApiKeyManager showStatus={false} />);

    expect(screen.queryByText('สถานะ API Key')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ApiKeyManager className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles errors during key status loading', async () => {
    mockApiKeyManager.getKeyStatus.mockImplementation(() => {
      throw new Error('Failed to load status');
    });

    // Should not crash
    render(<ApiKeyManager />);

    await waitFor(() => {
      // Component should still render even if status loading fails
      expect(screen.getByText('สถานะ API Key')).toBeInTheDocument();
    });
  });

  it('handles errors during key testing', async () => {
    mockApiKeyManager.testConfiguration.mockRejectedValue(new Error('Test failed'));

    render(<ApiKeyManager />);

    await waitFor(() => {
      expect(screen.getByText('ทดสอบ')).toBeInTheDocument();
    });

    const testButton = screen.getByText('ทดสอบ');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาดในการทดสอบ API Key')).toBeInTheDocument();
    });
  });
});