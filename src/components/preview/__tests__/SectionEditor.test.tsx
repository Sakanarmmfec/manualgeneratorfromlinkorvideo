import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SectionEditor } from '../SectionEditor';
import { DocumentSection } from '@/types';
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
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

const mockSection: DocumentSection = {
  id: 'test-section-1',
  title: 'Test Section Title',
  content: 'Test section content',
  level: 1,
  subsections: [],
  images: [],
  sectionType: 'introduction'
};

const mockProps = {
  section: mockSection,
  onUpdate: vi.fn(),
  onCancel: vi.fn(),
  onSave: vi.fn()
};

describe('SectionEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section editor with initial values', () => {
    render(<SectionEditor {...mockProps} />);
    
    expect(screen.getByDisplayValue('Test Section Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test section content')).toBeInTheDocument();
  });

  it('shows section type in header', () => {
    render(<SectionEditor {...mockProps} />);
    
    expect(screen.getByText('แก้ไขส่วน: introduction')).toBeInTheDocument();
  });

  it('updates title when input changes', () => {
    render(<SectionEditor {...mockProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Section Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    expect(titleInput).toHaveValue('Updated Title');
  });

  it('updates content when textarea changes', () => {
    render(<SectionEditor {...mockProps} />);
    
    const contentTextarea = screen.getByDisplayValue('Test section content');
    fireEvent.change(contentTextarea, { target: { value: 'Updated content' } });
    
    expect(contentTextarea).toHaveValue('Updated content');
  });

  it('shows validation error for empty title', async () => {
    render(<SectionEditor {...mockProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Section Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText('หัวข้อส่วนไม่สามารถเว้นว่างได้')).toBeInTheDocument();
    });
  });

  it('shows validation error for empty content', async () => {
    render(<SectionEditor {...mockProps} />);
    
    const contentTextarea = screen.getByDisplayValue('Test section content');
    fireEvent.change(contentTextarea, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText('เนื้อหาส่วนไม่สามารถเว้นว่างได้')).toBeInTheDocument();
    });
  });

  it('shows validation error for title too long', async () => {
    render(<SectionEditor {...mockProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Section Title');
    const longTitle = 'a'.repeat(201);
    fireEvent.change(titleInput, { target: { value: longTitle } });
    
    await waitFor(() => {
      expect(screen.getByText('หัวข้อส่วนต้องมีความยาวไม่เกิน 200 ตัวอักษร')).toBeInTheDocument();
    });
  });

  it('shows validation error for content too long', async () => {
    render(<SectionEditor {...mockProps} />);
    
    const contentTextarea = screen.getByDisplayValue('Test section content');
    const longContent = 'a'.repeat(10001);
    fireEvent.change(contentTextarea, { target: { value: longContent } });
    
    await waitFor(() => {
      expect(screen.getByText('เนื้อหาส่วนต้องมีความยาวไม่เกิน 10,000 ตัวอักษร')).toBeInTheDocument();
    });
  });

  it('disables save button when there are validation errors', async () => {
    render(<SectionEditor {...mockProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Section Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    await waitFor(() => {
      const saveButton = screen.getByText('บันทึก');
      expect(saveButton).toBeDisabled();
    });
  });

  it('calls onSave with updated section when save is clicked', async () => {
    render(<SectionEditor {...mockProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Section Title');
    const contentTextarea = screen.getByDisplayValue('Test section content');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'Updated content' } });
    
    const saveButton = screen.getByText('บันทึก');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        ...mockSection,
        title: 'Updated Title',
        content: 'Updated content'
      });
      expect(mockProps.onSave).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel is clicked', () => {
    render(<SectionEditor {...mockProps} />);
    
    const cancelButton = screen.getByText('ยกเลิก');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('resets values when cancel is clicked', () => {
    render(<SectionEditor {...mockProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Section Title');
    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    
    const cancelButton = screen.getByText('ยกเลิก');
    fireEvent.click(cancelButton);
    
    expect(titleInput).toHaveValue('Test Section Title');
  });

  it('toggles preview mode', () => {
    render(<SectionEditor {...mockProps} />);
    
    const previewButton = screen.getByText('ดูตัวอย่าง');
    fireEvent.click(previewButton);
    
    expect(screen.getByText('แก้ไข')).toBeInTheDocument();
  });

  it('shows character and word count', () => {
    render(<SectionEditor {...mockProps} />);
    
    expect(screen.getByText(/ตัวอักษร: \d+\/10,000/)).toBeInTheDocument();
    expect(screen.getByText(/คำ: \d+/)).toBeInTheDocument();
  });

  it('applies formatting when toolbar buttons are clicked', () => {
    render(<SectionEditor {...mockProps} />);
    
    const contentTextarea = screen.getByDisplayValue('Test section content');
    
    // Focus the textarea first
    fireEvent.focus(contentTextarea);
    
    // Set selection manually
    Object.defineProperty(contentTextarea, 'selectionStart', { value: 0, writable: true });
    Object.defineProperty(contentTextarea, 'selectionEnd', { value: 4, writable: true });
    
    const boldButton = screen.getByTitle('ตัวหนา');
    fireEvent.click(boldButton);
    
    // The formatting should be applied - check if the content has changed
    expect(contentTextarea.value).toMatch(/\*\*.*\*\*/);
  });
});