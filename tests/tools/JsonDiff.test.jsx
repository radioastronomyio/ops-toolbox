import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JsonDiff from '../../src/tools/JsonDiff.jsx';

describe('JsonDiff', () => {
  it('renders without crashing', () => {
    render(<JsonDiff />);
    expect(screen.getByText('JSON Diff')).toBeInTheDocument();
  });

  it('two textareas labeled Original and Modified', () => {
    render(<JsonDiff />);
    expect(screen.queryByPlaceholderText(/original/i) || screen.getByText(/Original/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/modified/i) || screen.getByText(/Modified/)).toBeInTheDocument();
  });

  it('Compare button is present', () => {
    render(<JsonDiff />);
    expect(screen.getByText('Compare')).toBeInTheDocument();
  });

  it('Swap button is present', () => {
    render(<JsonDiff />);
    expect(screen.getByText('Swap')).toBeInTheDocument();
  });

  it('no diff output shown before Compare is clicked', () => {
    render(<JsonDiff />);
    expect(screen.queryByTestId('diff-output')).not.toBeInTheDocument();
  });
});
