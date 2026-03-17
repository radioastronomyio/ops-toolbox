import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from '../../src/components/ErrorBanner';

describe('ErrorBanner', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<ErrorBanner message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the error message', () => {
    render(<ErrorBanner message="Something failed" />);
    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    render(<ErrorBanner message="Error" onDismiss={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
