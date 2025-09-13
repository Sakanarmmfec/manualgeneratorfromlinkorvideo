import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyStatus } from '../ApiKeyStatus';

describe('ApiKeyStatus', () => {
  const mockOnTestKey = vi.fn();
  const mockOnClearFallback = vi.fn();
  const mockOnSwitchToPrimary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with active status', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('สถานะ API Key')).toBeInTheDocument();
    expect(screen.getByText('API Key หลัก')).toBeInTheDocument();
    expect(screen.getByText('ใช้งานได้')).toBeInTheDocument();
  });

  it('renders with exhausted status', () => {
    render(
      <ApiKeyStatus
        status="exhausted"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('Token หมดอายุ')).toBeInTheDocument();
  });

  it('renders with invalid status', () => {
    render(
      <ApiKeyStatus
        status="invalid"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('ไม่ถูกต้อง')).toBeInTheDocument();
  });

  it('renders with testing status', () => {
    render(
      <ApiKeyStatus
        status="testing"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('กำลังตรวจสอบ...')).toBeInTheDocument();
  });

  it('shows fallback key type', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="fallback"
        hasFallback={true}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('API Key ผู้ใช้')).toBeInTheDocument();
  });

  it('shows test button when onTestKey is provided', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
        onTestKey={mockOnTestKey}
      />
    );

    const testButton = screen.getByText('ทดสอบ');
    expect(testButton).toBeInTheDocument();

    fireEvent.click(testButton);
    expect(mockOnTestKey).toHaveBeenCalled();
  });

  it('disables test button when loading', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
        onTestKey={mockOnTestKey}
        isLoading={true}
      />
    );

    const testButton = screen.getByRole('button', { name: /ทดสอบ/ });
    expect(testButton).toBeDisabled();
  });

  it('disables test button when testing', () => {
    render(
      <ApiKeyStatus
        status="testing"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
        onTestKey={mockOnTestKey}
      />
    );

    const testButton = screen.getByRole('button', { name: /ทดสอบ/ });
    expect(testButton).toBeDisabled();
  });

  it('shows management actions when using fallback key', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="fallback"
        hasFallback={true}
        canUseFallback={true}
        onSwitchToPrimary={mockOnSwitchToPrimary}
        onClearFallback={mockOnClearFallback}
      />
    );

    expect(screen.getByText('การจัดการ API Key:')).toBeInTheDocument();
    expect(screen.getByText('กลับไปใช้ Key หลัก')).toBeInTheDocument();
    expect(screen.getByText('ลบ API Key ผู้ใช้')).toBeInTheDocument();
  });

  it('calls onSwitchToPrimary when switch button is clicked', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="fallback"
        hasFallback={true}
        canUseFallback={true}
        onSwitchToPrimary={mockOnSwitchToPrimary}
      />
    );

    const switchButton = screen.getByText('กลับไปใช้ Key หลัก');
    fireEvent.click(switchButton);

    expect(mockOnSwitchToPrimary).toHaveBeenCalled();
  });

  it('calls onClearFallback when clear button is clicked', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={true}
        canUseFallback={true}
        onClearFallback={mockOnClearFallback}
      />
    );

    const clearButton = screen.getByText('ลบ API Key ผู้ใช้');
    fireEvent.click(clearButton);

    expect(mockOnClearFallback).toHaveBeenCalled();
  });

  it('shows fallback information', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={true}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('มี API Key สำรอง')).toBeInTheDocument();
    expect(screen.getByText('ได้')).toBeInTheDocument(); // อนุญาต User Key
  });

  it('shows no fallback information', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={false}
      />
    );

    expect(screen.getByText('ไม่มี API Key สำรอง')).toBeInTheDocument();
    expect(screen.getByText('ไม่ได้')).toBeInTheDocument(); // อนุญาต User Key
  });

  it('shows user key notice when using fallback', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="fallback"
        hasFallback={true}
        canUseFallback={true}
      />
    );

    expect(screen.getByText('กำลังใช้ API Key ของผู้ใช้')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ApiKeyStatus
        status="active"
        currentKeyType="primary"
        hasFallback={false}
        canUseFallback={true}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('disables management buttons when loading', () => {
    render(
      <ApiKeyStatus
        status="active"
        currentKeyType="fallback"
        hasFallback={true}
        canUseFallback={true}
        onSwitchToPrimary={mockOnSwitchToPrimary}
        onClearFallback={mockOnClearFallback}
        isLoading={true}
      />
    );

    const switchButton = screen.getByRole('button', { name: /กลับไปใช้ Key หลัก/ });
    const clearButton = screen.getByRole('button', { name: /ลบ API Key ผู้ใช้/ });

    expect(switchButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });
});