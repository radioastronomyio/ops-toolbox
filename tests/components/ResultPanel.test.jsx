import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultPanel from '../../src/components/ResultPanel';

beforeEach(() => {
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ResultPanel', () => {
  it('renders label and empty state when no value', () => {
    render(<ResultPanel label="Output" value="" />);
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('No output')).toBeInTheDocument();
  });

  it('renders value in a pre tag', () => {
    render(<ResultPanel value="some result" />);
    const pre = screen.getByText('some result').closest('pre');
    expect(pre).not.toBeNull();
  });

  it('renders error state with red styling when error prop is set', () => {
    render(<ResultPanel error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // Check error container has red border class
    const container = screen.getByText('Something went wrong').parentElement;
    expect(container.className).toContain('border-status-error');
  });

  it('shows CopyButton when copyable=true and value is present', () => {
    render(<ResultPanel value="copyable content" copyable={true} />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('hides CopyButton when copyable=false', () => {
    render(<ResultPanel value="content" copyable={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('hides CopyButton when error is present (even if value exists)', () => {
    render(<ResultPanel value="content" error="an error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies monospace font when mono=true (default)', () => {
    render(<ResultPanel value="mono content" />);
    const container = screen.getByText('mono content').closest('pre').parentElement;
    expect(container.className).toContain('font-mono');
  });
});
