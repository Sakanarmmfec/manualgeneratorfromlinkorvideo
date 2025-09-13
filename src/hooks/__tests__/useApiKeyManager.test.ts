import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApiKeyManager } from '../useApiKeyManager';
import { apiKeyManager } from '@/lib/config/APIKeyManager';
import { APIKeyError } from '@/types';

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

describe('useApiKeyManager', () => {
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

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useApiKeyManager());

    // Initial state should have loading as true, but it might be set to false immediately
    // depending on the implementation, so let's just check the final state
    await act(async () => {
      // Wait for initialization
    });

    expect(result.current.keyState).toEqual({
      status: 'active',
      currentKeyType: 'primary',
      hasFallback: false,
      canUseFallback: true,
      isLoading: false,
      error: null
    });
  });

  it('validates and sets API key successfully', async () => {
    mockApiKeyManager.validateKey.mockResolvedValue(true);
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.validateAndSetKey('sk-1234567890abcdef');
    });

    expect(success!).toBe(true);
    expect(mockApiKeyManager.validateKey).toHaveBeenCalledWith('sk-1234567890abcdef');
    expect(mockApiKeyManager.setFallbackKey).toHaveBeenCalledWith('sk-1234567890abcdef');
  });

  it('handles API key validation failure', async () => {
    mockApiKeyManager.validateKey.mockResolvedValue(false);
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.validateAndSetKey('invalid-key');
    });

    expect(success!).toBe(false);
    expect(result.current.keyState.error).toBe('API Key is invalid or cannot be used');
  });

  it('switches to fallback when primary is exhausted', async () => {
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
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    expect(result.current.keyState.status).toBe('exhausted');

    await act(async () => {
      await result.current.validateAndSetKey('sk-1234567890abcdef');
    });

    expect(mockApiKeyManager.switchToFallback).toHaveBeenCalled();
  });

  it('tests current key successfully', async () => {
    mockApiKeyManager.testConfiguration.mockResolvedValue({
      isValid: true,
      keyType: 'primary'
    });
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    let isValid: boolean;
    await act(async () => {
      isValid = await result.current.testCurrentKey();
    });

    expect(isValid!).toBe(true);
    expect(mockApiKeyManager.testConfiguration).toHaveBeenCalled();
  });

  it('handles key test failure', async () => {
    mockApiKeyManager.testConfiguration.mockResolvedValue({
      isValid: false,
      keyType: 'primary',
      error: 'Connection failed'
    });
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    let isValid: boolean;
    await act(async () => {
      isValid = await result.current.testCurrentKey();
    });

    expect(isValid!).toBe(false);
    expect(result.current.keyState.error).toBe('Connection failed');
  });

  it('clears fallback key', async () => {
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    act(() => {
      result.current.clearFallbackKey();
    });

    expect(mockApiKeyManager.clearFallbackKey).toHaveBeenCalled();
  });

  it('switches to primary key', async () => {
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    act(() => {
      result.current.switchToPrimary();
    });

    expect(mockApiKeyManager.resetToPrimary).toHaveBeenCalled();
  });

  it('handles key exhaustion', async () => {
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    await act(async () => {
      await result.current.handleApiKeyExhaustion();
    });

    expect(mockApiKeyManager.handleKeyExhaustion).toHaveBeenCalled();
  });

  it('handles key exhaustion error gracefully', async () => {
    mockApiKeyManager.handleKeyExhaustion.mockRejectedValue(
      new APIKeyError('Primary API key exhausted', 'KEY_EXHAUSTED', true)
    );
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    await act(async () => {
      await result.current.handleApiKeyExhaustion();
    });

    // Should not set error for expected KEY_EXHAUSTED error
    expect(result.current.keyState.error).toBeNull();
  });

  it('refreshes status', async () => {
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(mockApiKeyManager.getKeyStatus).toHaveBeenCalledTimes(2); // Once for init, once for refresh
  });

  it('handles errors during status loading', async () => {
    mockApiKeyManager.getKeyStatus.mockImplementation(() => {
      throw new Error('Status loading failed');
    });
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    expect(result.current.keyState.error).toBe('Status loading failed');
    expect(result.current.keyState.isLoading).toBe(false);
  });

  it('handles errors during key validation', async () => {
    mockApiKeyManager.validateKey.mockRejectedValue(new Error('Validation failed'));
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.validateAndSetKey('sk-1234567890abcdef');
    });

    expect(success!).toBe(false);
    expect(result.current.keyState.error).toBe('Failed to validate API key');
  });

  it('handles errors during key testing', async () => {
    mockApiKeyManager.testConfiguration.mockRejectedValue(new Error('Test failed'));
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    let isValid: boolean;
    await act(async () => {
      isValid = await result.current.testCurrentKey();
    });

    expect(isValid!).toBe(false);
    expect(result.current.keyState.error).toBe('Failed to test API key');
  });

  it('handles errors during fallback key clearing', async () => {
    mockApiKeyManager.clearFallbackKey.mockImplementation(() => {
      throw new Error('Clear failed');
    });
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    act(() => {
      result.current.clearFallbackKey();
    });

    expect(result.current.keyState.error).toBe('Failed to clear fallback key');
  });

  it('handles errors during primary key switching', async () => {
    mockApiKeyManager.resetToPrimary.mockImplementation(() => {
      throw new Error('Switch failed');
    });
    
    const { result } = renderHook(() => useApiKeyManager());

    await act(async () => {
      // Wait for initialization
    });

    act(() => {
      result.current.switchToPrimary();
    });

    expect(result.current.keyState.error).toBe('Failed to switch to primary key');
  });
});