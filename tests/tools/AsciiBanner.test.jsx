import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AsciiBanner from '../../src/tools/AsciiBanner.jsx';

describe('AsciiBanner', () => {
  it('renders without crashing', () => {
    render(<AsciiBanner />);
    expect(screen.getByText('ASCII Banner')).toBeInTheDocument();
  });

  it('text input field is present', () => {
    render(<AsciiBanner />);
    expect(screen.getByPlaceholderText('Hello World')).toBeInTheDocument();
  });

  it('font selector dropdown is present', () => {
    render(<AsciiBanner />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('preset font buttons rendered', () => {
    render(<AsciiBanner />);
    // Preset buttons may share text with dropdown options; use getAllByText
    expect(screen.getAllByText('Standard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Big').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Slant').length).toBeGreaterThanOrEqual(1);
  });

  it('Copy button present', () => {
    render(<AsciiBanner />);
    expect(screen.getByText(/Copy/)).toBeInTheDocument();
  });

  it('Download button present', () => {
    render(<AsciiBanner />);
    expect(screen.getByText(/Download/)).toBeInTheDocument();
  });

  it('output pre block present', () => {
    render(<AsciiBanner />);
    expect(document.querySelector('pre')).toBeInTheDocument();
  });
});
