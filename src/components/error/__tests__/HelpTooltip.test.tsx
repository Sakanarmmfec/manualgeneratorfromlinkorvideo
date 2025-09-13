import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelpTooltip } from '../HelpTooltip';

describe('HelpTooltip', () => {
  it('renders help icon', () => {
    render(<HelpTooltip content="Help content" />);
    
    const helpButton = screen.getByRole('button', { name: /ความช่วยเหลือ/i });
    expect(helpButton).toBeInTheDocument();
  });

  it('shows tooltip on hover for hover trigger', async () => {
    render(<HelpTooltip content="Help content" trigger="hover" />);
    
    const helpButton = screen.getByRole('button');
    fireEvent.mouseEnter(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Help content')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave for hover trigger', async () => {
    render(<HelpTooltip content="Help content" trigger="hover" />);
    
    const helpButton = screen.getByRole('button');
    fireEvent.mouseEnter(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(helpButton);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('shows tooltip on click for click trigger', async () => {
    render(<HelpTooltip content="Help content" trigger="click" />);
    
    const helpButton = screen.getByRole('button');
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Help content')).toBeInTheDocument();
    });
  });

  it('shows close button for click trigger', async () => {
    render(<HelpTooltip content="Help content" trigger="click" />);
    
    const helpButton = screen.getByRole('button', { name: /ความช่วยเหลือ/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /ปิด/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  it('closes tooltip when close button is clicked', async () => {
    render(<HelpTooltip content="Help content" trigger="click" />);
    
    const helpButton = screen.getByRole('button', { name: /ความช่วยเหลือ/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /ปิด/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('renders title when provided', async () => {
    render(
      <HelpTooltip 
        content="Help content" 
        title="Help Title"
        trigger="click"
      />
    );
    
    const helpButton = screen.getByRole('button');
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('Help Title')).toBeInTheDocument();
      expect(screen.getByText('Help content')).toBeInTheDocument();
    });
  });

  it('renders React node content', async () => {
    const content = (
      <div>
        <strong>Bold text</strong>
        <p>Paragraph text</p>
      </div>
    );

    render(<HelpTooltip content={content} trigger="click" />);
    
    const helpButton = screen.getByRole('button');
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Paragraph text')).toBeInTheDocument();
    });
  });

  it('closes on escape key for click trigger', async () => {
    render(<HelpTooltip content="Help content" trigger="click" />);
    
    const helpButton = screen.getByRole('button');
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<HelpTooltip content="Help content" className="custom-class" />);
    
    const container = screen.getByRole('button').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});