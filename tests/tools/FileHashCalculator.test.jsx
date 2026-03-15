import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileHashCalculator from '../../src/tools/FileHashCalculator.jsx';

describe('FileHashCalculator', () => {
  it('renders without crashing', () => {
    render(<FileHashCalculator />);
    expect(screen.getByText('File Hash Calculator')).toBeInTheDocument();
  });

  it('renders drop zone', () => {
    render(<FileHashCalculator />);
    expect(screen.getByText(/drop.*file|drag.*file|click.*browse/i)).toBeInTheDocument();
  });

  it('all four algorithm checkboxes are checked by default', () => {
    render(<FileHashCalculator />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);
    checkboxes.slice(0, 4).forEach(cb => expect(cb).toBeChecked());
  });

  it('expected hash input field is present', () => {
    render(<FileHashCalculator />);
    expect(screen.getByPlaceholderText(/expected|paste.*hash/i)).toBeInTheDocument();
  });

  it('no hash results shown before a file is selected', () => {
    render(<FileHashCalculator />);
    // Results table is not shown, but algorithm labels in checkboxes may be
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
