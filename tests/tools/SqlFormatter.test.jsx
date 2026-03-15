import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SqlFormatter from '../../src/tools/SqlFormatter.jsx';

describe('SqlFormatter', () => {
  it('renders without crashing', () => {
    render(<SqlFormatter />);
    expect(screen.getByText('SQL Formatter')).toBeInTheDocument();
  });

  it('SQL input textarea present', () => {
    render(<SqlFormatter />);
    // There's a textarea for input
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(1);
  });

  it('dialect selector present', () => {
    render(<SqlFormatter />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('Format button present', () => {
    render(<SqlFormatter />);
    expect(screen.getByText('Format')).toBeInTheDocument();
  });

  it('Copy button present', () => {
    render(<SqlFormatter />);
    expect(screen.getByText(/Copy/)).toBeInTheDocument();
  });

  it('keyword case selector present', () => {
    render(<SqlFormatter />);
    // At least 2 selects (dialect + keyword case)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });
});
