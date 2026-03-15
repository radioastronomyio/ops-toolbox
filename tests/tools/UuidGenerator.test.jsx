import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UuidGenerator from '../../src/tools/UuidGenerator.jsx';

describe('UuidGenerator', () => {
  it('renders without crashing', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
  });

  it('v4 and v7 toggle buttons present', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('v4')).toBeInTheDocument();
    expect(screen.getByText('v7')).toBeInTheDocument();
  });

  it('count input present with default value 1', () => {
    render(<UuidGenerator />);
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  it('Generate button present', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('Copy All button present', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('Copy All')).toBeInTheDocument();
  });

  it('format selector present', () => {
    render(<UuidGenerator />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
