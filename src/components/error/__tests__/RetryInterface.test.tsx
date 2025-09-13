import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { RetryInterface } from '../RetryInterface';

describe('RetryInterface', () => {
  const defaultProps = {
    error: 'Test error message',
    onRetry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error message and retry button', () => {
    render(<RetryInterface {...defaultProps} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ลองใหม่/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<RetryInterface {...defaultProps} />);

    const retryButton = screen.getByRole('button', { name: /ลองใหม่/i });
    fireEvent.click(retryButton);

    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows retry count when provided', () => {
    render(<RetryInterface {...defaultProps} retryCount={2} maxRetries={3} />);

    expect(screen.getByText('ความพยายามครั้งที่ 2 จาก 3 ครั้ง')).toBeInTheDocument();
  });

  it('disables retry button when max retries reached', () => {
    render(<RetryInterface {...defaultProps} retryCount={3} maxRetries={3} />);

    expect(screen.queryByRole('button', { name: /ลองใหม่/i })).not.toBeInTheDocument();
    expect(screen.getByText(/ไม่สามารถดำเนินการได้/)).toBeInTheDocument();
  });

  it('shows loading state when retrying', () => {
    render(<RetryInterface {...defaultProps} isRetrying={true} />);

    expect(screen.getByText('กำลังลองใหม่...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /กำลังลองใหม่/i })).toBeDisabled();
  });

  it('shows settings button when showSettings is true', () => {
    const onSettings = vi.fn();
    render(
      <RetryInterface
        {...defaultProps}
        showSettings={true}
        onSettings={onSettings}
      />
    );

    const settingsButton = screen.getByRole('button', { name: /ตั้งค่า/i });
    expect(settingsButton).toBeInTheDocument();

    fireEvent.click(settingsButton);
    expect(onSettings).toHaveBeenCalledTimes(1);
  });

  it('shows cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    render(<RetryInterface {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/i });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses custom title when provided', () => {
    render(<RetryInterface {...defaultProps} title="Custom Error Title" />);

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });
});