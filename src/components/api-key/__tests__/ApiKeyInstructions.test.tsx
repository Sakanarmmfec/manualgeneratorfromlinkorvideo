import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ApiKeyInstructions } from '../ApiKeyInstructions';

describe('ApiKeyInstructions', () => {
  it('renders full variant with all content', () => {
    render(
      <ApiKeyInstructions variant="full" showSecurityNotice={true} />
    );

    expect(screen.getByText('วิธีการรับ API Key')).toBeInTheDocument();
    expect(screen.getByText('ขั้นตอนการรับ API Key:')).toBeInTheDocument();
    expect(screen.getByText('เข้าสู่ระบบ MFEC LiteLLM Portal')).toBeInTheDocument();
    expect(screen.getByText('เปิด MFEC LiteLLM Portal')).toBeInTheDocument();
    expect(screen.getByText('ความปลอดภัย:')).toBeInTheDocument();
    expect(screen.getByText('เคล็ดลับ:')).toBeInTheDocument();
  });

  it('renders modal variant with warning', () => {
    render(
      <ApiKeyInstructions variant="modal" showSecurityNotice={false} />
    );

    expect(screen.getByText('Token หลักหมดอายุ')).toBeInTheDocument();
    expect(screen.getByText('กรุณาใส่ API Key ของคุณเพื่อดำเนินการต่อ')).toBeInTheDocument();
    expect(screen.getByText('เปิด MFEC LiteLLM Portal')).toBeInTheDocument();
    expect(screen.queryByText('เคล็ดลับ:')).not.toBeInTheDocument();
  });

  it('renders compact variant without portal link', () => {
    render(
      <ApiKeyInstructions variant="compact" showSecurityNotice={true} />
    );

    expect(screen.queryByText('วิธีการรับ API Key')).not.toBeInTheDocument();
    expect(screen.queryByText('เปิด MFEC LiteLLM Portal')).not.toBeInTheDocument();
    expect(screen.getByText('ความปลอดภัย:')).toBeInTheDocument();
    expect(screen.queryByText('เคล็ดลับ:')).not.toBeInTheDocument();
  });

  it('hides security notice when showSecurityNotice is false', () => {
    render(
      <ApiKeyInstructions variant="full" showSecurityNotice={false} />
    );

    expect(screen.queryByText('ความปลอดภัย:')).not.toBeInTheDocument();
  });

  it('shows all security features in security notice', () => {
    render(
      <ApiKeyInstructions variant="full" showSecurityNotice={true} />
    );

    expect(screen.getByText('API Key จะถูกใช้เฉพาะในเซสชันนี้')).toBeInTheDocument();
    expect(screen.getByText('ไม่มีการบันทึกหรือเก็บข้อมูลถาวร')).toBeInTheDocument();
    expect(screen.getByText('การเชื่อมต่อใช้ HTTPS เท่านั้น')).toBeInTheDocument();
    expect(screen.getByText('API Key จะถูกลบเมื่อปิดเบราว์เซอร์')).toBeInTheDocument();
  });

  it('shows all instruction steps', () => {
    render(
      <ApiKeyInstructions variant="full" showSecurityNotice={true} />
    );

    expect(screen.getByText('เข้าสู่ระบบ MFEC LiteLLM Portal')).toBeInTheDocument();
    expect(screen.getByText('ไปที่หน้า API Keys')).toBeInTheDocument();
    expect(screen.getByText('สร้าง API Key ใหม่')).toBeInTheDocument();
    expect(screen.getByText('คัดลอกและใส่ API Key')).toBeInTheDocument();
  });

  it('shows tips in full variant', () => {
    render(
      <ApiKeyInstructions variant="full" showSecurityNotice={true} />
    );

    expect(screen.getByText(/API Key ควรเริ่มต้นด้วย/)).toBeInTheDocument();
    expect(screen.getByText(/หากมีปัญหาในการเข้าถึง Portal/)).toBeInTheDocument();
  });
});