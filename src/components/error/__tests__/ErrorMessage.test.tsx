import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';

describe('ErrorMessage', () => {
  it('renders error message with title and content', () => {
    render(
      <ErrorMessage
        title="Test Error"
        message="This is a test error message"
        severity="error"
      />
    );

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('This is a test error message')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(
      <ErrorMessage
        message="This is a test error message"
        severity="error"
      />
    );

    expect(screen.getByText('This is a test error message')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('applies correct styling for different severity levels', () => {
    const { rerender } = render(
      <ErrorMessage message="Error message" severity="error" />
    );

    let container = screen.getByText('Error message').closest('.rounded-lg');
    expect(container).toHaveClass('bg-red-50', 'border-red-200');

    rerender(<ErrorMessage message="Warning message" severity="warning" />);
    container = screen.getByText('Warning message').closest('.rounded-lg');
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200');

    rerender(<ErrorMessage message="Info message" severity="info" />);
    container = screen.getByText('Info message').closest('.rounded-lg');
    expect(container).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('shows dismiss button when dismissible is true', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage
        message="Dismissible error"
        severity="error"
        dismissible
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByRole('button');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when dismissible is false', () => {
    render(
      <ErrorMessage
        message="Non-dismissible error"
        severity="error"
        dismissible={false}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ErrorMessage message="Error with children" severity="error">
        <div>Additional content</div>
      </ErrorMessage>
    );

    expect(screen.getByText('Additional content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ErrorMessage
        message="Custom styled error"
        severity="error"
        className="custom-class"
      />
    );

    const container = screen.getByText('Custom styled error').closest('.rounded-lg');
    expect(container).toHaveClass('custom-class');
  });
});