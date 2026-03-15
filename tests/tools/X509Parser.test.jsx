import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import X509Parser from '../../src/tools/X509Parser.jsx';

describe('X509Parser', () => {
  it('renders without crashing', () => {
    render(<X509Parser />);
    expect(screen.getByText('X.509 Certificate Parser')).toBeInTheDocument();
  });

  it('shows textarea for PEM input', () => {
    render(<X509Parser />);
    expect(screen.getByPlaceholderText(/BEGIN CERTIFICATE/)).toBeInTheDocument();
  });

  it('shows upload button', () => {
    render(<X509Parser />);
    expect(screen.getByText(/Upload/)).toBeInTheDocument();
  });

  it('displays error for invalid PEM input', () => {
    render(<X509Parser />);
    const textarea = screen.getByPlaceholderText(/BEGIN CERTIFICATE/);
    fireEvent.change(textarea, { target: { value: 'not a valid certificate' } });
    expect(screen.getByText(/Could not parse certificate/)).toBeInTheDocument();
  });
});
