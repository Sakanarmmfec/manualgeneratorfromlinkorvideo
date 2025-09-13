import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DocumentToolbar } from '../DocumentToolbar';

const mockProps = {
  isEditing: false,
  hasUnsavedChanges: false,
  onEditModeChange: vi.fn(),
  onSave: vi.fn(),
  onDownload: vi.fn()
};

describe('DocumentToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders edit button in view mode', () => {
    render(<DocumentToolbar {...mockProps} />);
    
    expect(screen.getByText('แก้ไข')).toBeInTheDocument();
  });

  it('renders preview button in edit mode', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} />);
    
    expect(screen.getByText('ดูตัวอย่าง')).toBeInTheDocument();
  });

  it('shows save button when in edit mode', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} />);
    
    expect(screen.getByText('บันทึก')).toBeInTheDocument();
  });

  it('does not show save button when not in edit mode', () => {
    render(<DocumentToolbar {...mockProps} isEditing={false} />);
    
    expect(screen.queryByText('บันทึก')).not.toBeInTheDocument();
  });

  it('shows download buttons', () => {
    render(<DocumentToolbar {...mockProps} />);
    
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('DOCX')).toBeInTheDocument();
  });

  it('calls onEditModeChange when edit button is clicked', () => {
    render(<DocumentToolbar {...mockProps} />);
    
    const editButton = screen.getByText('แก้ไข');
    fireEvent.click(editButton);
    
    expect(mockProps.onEditModeChange).toHaveBeenCalledWith(true);
  });

  it('calls onEditModeChange when preview button is clicked', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} />);
    
    const previewButton = screen.getByText('ดูตัวอย่าง');
    fireEvent.click(previewButton);
    
    expect(mockProps.onEditModeChange).toHaveBeenCalledWith(false);
  });

  it('calls onSave when save button is clicked', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} hasUnsavedChanges={true} />);
    
    const saveButton = screen.getByText('บันทึก');
    fireEvent.click(saveButton);
    
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('calls onDownload with correct format when download buttons are clicked', () => {
    render(<DocumentToolbar {...mockProps} />);
    
    const pdfButton = screen.getByText('PDF');
    const docxButton = screen.getByText('DOCX');
    
    fireEvent.click(pdfButton);
    expect(mockProps.onDownload).toHaveBeenCalledWith('pdf');
    
    fireEvent.click(docxButton);
    expect(mockProps.onDownload).toHaveBeenCalledWith('docx');
  });

  it('shows saved status when no unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} hasUnsavedChanges={false} />);
    
    expect(screen.getByText('บันทึกแล้ว')).toBeInTheDocument();
  });

  it('shows unsaved changes status when there are unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} hasUnsavedChanges={true} />);
    
    expect(screen.getByText('มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก')).toBeInTheDocument();
  });

  it('disables save button when no unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} hasUnsavedChanges={false} />);
    
    const saveButton = screen.getByText('บันทึก');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when there are unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} hasUnsavedChanges={true} />);
    
    const saveButton = screen.getByText('บันทึก');
    expect(saveButton).not.toBeDisabled();
  });

  it('disables download buttons when there are unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} hasUnsavedChanges={true} />);
    
    const pdfButton = screen.getByText('PDF');
    const docxButton = screen.getByText('DOCX');
    
    expect(pdfButton).toBeDisabled();
    expect(docxButton).toBeDisabled();
  });

  it('enables download buttons when no unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} hasUnsavedChanges={false} />);
    
    const pdfButton = screen.getByText('PDF');
    const docxButton = screen.getByText('DOCX');
    
    expect(pdfButton).not.toBeDisabled();
    expect(docxButton).not.toBeDisabled();
  });

  it('shows help text when in edit mode', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} />);
    
    expect(screen.getByText(/คำแนะนำ:/)).toBeInTheDocument();
  });

  it('does not show help text when not in edit mode', () => {
    render(<DocumentToolbar {...mockProps} isEditing={false} />);
    
    expect(screen.queryByText(/คำแนะนำ:/)).not.toBeInTheDocument();
  });

  it('shows warning when there are unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} hasUnsavedChanges={true} />);
    
    expect(screen.getByText(/แจ้งเตือน:/)).toBeInTheDocument();
    expect(screen.getByText(/กรุณาบันทึกก่อนดาวน์โหลดเอกสาร/)).toBeInTheDocument();
  });

  it('does not show warning when no unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} hasUnsavedChanges={false} />);
    
    expect(screen.queryByText(/แจ้งเตือน:/)).not.toBeInTheDocument();
  });

  it('applies pulse animation to save button when there are unsaved changes', () => {
    render(<DocumentToolbar {...mockProps} isEditing={true} hasUnsavedChanges={true} />);
    
    const saveButton = screen.getByText('บันทึก');
    expect(saveButton).toHaveClass('animate-pulse');
  });
});