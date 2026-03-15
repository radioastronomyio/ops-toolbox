import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CsvToJson from '../../src/tools/CsvToJson.jsx';

describe('CsvToJson', () => {
  it('renders without crashing', () => {
    render(<CsvToJson />);
    expect(screen.getByText('CSV to JSON')).toBeInTheDocument();
  });

  it('Paste and Upload tabs present', () => {
    render(<CsvToJson />);
    expect(screen.getByText('Paste CSV')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('textarea visible on Paste tab', () => {
    render(<CsvToJson />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('Convert button present', () => {
    render(<CsvToJson />);
    expect(screen.getByText('Convert')).toBeInTheDocument();
  });

  it('Header row toggle present', () => {
    render(<CsvToJson />);
    expect(screen.getByText(/Header row/i)).toBeInTheDocument();
  });

  it('Dynamic typing toggle present', () => {
    render(<CsvToJson />);
    expect(screen.getByText(/Dynamic typing/i)).toBeInTheDocument();
  });
});
