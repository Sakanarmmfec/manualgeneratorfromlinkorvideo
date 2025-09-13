import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyProvider } from '@/contexts/ApiKeyContext';
import { ApiKeyManager } from './ApiKeyManager';
import { ApiKeyModal } from '@/components/error/ApiKeyModal';
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
    testConfiguration: vi.fn(),
    handleKeyExhaustion: vi.fn()
  }
}));

const mockApiKeyManager = apiKeyManager as any;

// Integration test component
function TestApp() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <ApiKeyProvider>
      <div>
        <h1>Test Application</h1>
        <ApiKeyManager 
          onApiKeyUpdated={(hasValidKey) => {
            console.log('API key updated:', hasValidKey);
          }}
        />
        <button onClick={() => setShowModal(true)}>
          Show API Key Modal
        </button>
        <ApiKeyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          autoManage={true}
        />
      </div>
    </ApiKeyProvider>
  );
}

describe('API Key Management Integration', () => {
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

  it('should render complete API key management system', async () => {
    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText('Test Application')).toBeInTheDocument();
      expect(screen.getByText('สถานะ API Key')).toBeInTheDocument();
    });
  });

  it('should handle complete key exhaustion workflow', async () => {
    // Start with exhausted key
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

    render(<TestApp />);

    // Should show API key input when exhausted
    await waitFor(() => {
      expect(screen.getByText('ใส่ API Key ของคุณ')).toBeInTheDocument();
    });

    // Enter API key
    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByText('ยืนยัน');

    fireEvent.change(input, { target: { value: 'sk-1234567890abcdef' } });
    fireEvent.click(submitButton);

    // Should validate and set the key
    await waitFor(() => {
      expect(mockApiKeyManager.validateKey).toHaveBeenCalledWith('sk-1234567890abcdef');
      expect(mockApiKeyManager.setFallbackKey).toHaveBeenCalledWith('sk-1234567890abcdef');
      expect(mockApiKeyManager.switchToFallback).toHaveBeenCalled();
    });
  });

  it('should handle modal-based API key input', async () => {
    mockApiKeyManager.validateKey.mockResolvedValue(true);

    render(<TestApp />);

    // Open modal
    const modalButton = screen.getByText('Show API Key Modal');
    fireEvent.click(modalButton);

    await waitFor(() => {
      expect(screen.getByText('API Key หมดอายุ')).toBeInTheDocument();
    });

    // Enter API key in modal
    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByText('ยืนยัน');

    fireEvent.change(input, { target: { value: 'sk-modal-test-key' } });
    fireEvent.click(submitButton);

    // Should validate the key
    await waitFor(() => {
      expect(mockApiKeyManager.validateKey).toHaveBeenCalledWith('sk-modal-test-key');
    });
  });

  it('should handle key testing workflow', async () => {
    mockApiKeyManager.testConfiguration.mockResolvedValue({
      isValid: true,
      keyType: 'primary'
    });

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText('ทดสอบ')).toBeInTheDocument();
    });

    // Test the key
    const testButton = screen.getByText('ทดสอบ');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockApiKeyManager.testConfiguration).toHaveBeenCalled();
    });
  });

  it('should handle fallback key management', async () => {
    // Start with fallback key active
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'active',
      currentKeyType: 'fallback',
      hasFallback: true,
      canUseFallback: true
    });

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText('กลับไปใช้ Key หลัก')).toBeInTheDocument();
      expect(screen.getByText('ลบ API Key ผู้ใช้')).toBeInTheDocument();
    });

    // Switch to primary
    const switchButton = screen.getByText('กลับไปใช้ Key หลัก');
    fireEvent.click(switchButton);

    expect(mockApiKeyManager.resetToPrimary).toHaveBeenCalled();

    // Clear fallback
    const clearButton = screen.getByText('ลบ API Key ผู้ใช้');
    fireEvent.click(clearButton);

    expect(mockApiKeyManager.clearFallbackKey).toHaveBeenCalled();
  });

  it('should handle validation errors gracefully', async () => {
    // Start with exhausted key
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'exhausted',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true
    });

    mockApiKeyManager.validateKey.mockResolvedValue(false);

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    });

    // Enter invalid API key
    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByText('ยืนยัน');

    fireEvent.change(input, { target: { value: 'invalid-key' } });
    fireEvent.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('API Key ไม่ถูกต้องหรือไม่สามารถใช้งานได้')).toBeInTheDocument();
    });
  });

  it('should handle network errors during validation', async () => {
    mockApiKeyManager.getKeyStatus.mockReturnValue({
      status: 'exhausted',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true
    });

    mockApiKeyManager.validateKey.mockRejectedValue(new Error('Network error'));

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    });

    // Enter API key that will cause network error
    const input = screen.getByLabelText('API Key');
    const submitButton = screen.getByText('ยืนยัน');

    fireEvent.change(input, { target: { value: 'sk-network-error-key' } });
    fireEvent.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาดในการตรวจสอบ API Key')).toBeInTheDocument();
    });
  });
});