import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CopyButton from '../../src/components/CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders with default "Copy" label', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<CopyButton text="hello" label="Copy Output" />);
    expect(screen.getByRole('button', { name: 'Copy Output' })).toBeInTheDocument();
  });

  it('is disabled when text prop is empty', () => {
    render(<CopyButton text="" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when text prop is falsy', () => {
    render(<CopyButton text={null} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls clipboard API on click', async () => {
    render(<CopyButton text="test content" />);
    await fireEvent.click(screen.getByRole('button'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content');
  });

  it('shows "Copied!" after click', async () => {
    render(<CopyButton text="test content" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
