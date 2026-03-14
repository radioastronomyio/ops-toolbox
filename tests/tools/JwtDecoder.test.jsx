import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JwtDecoder from '../../src/tools/JwtDecoder.jsx';

// Mock Date.toLocaleString for consistent test output
const mockDate = new Date('2018-01-18T01:30:22.000Z');
vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(mockDate.toLocaleString());

describe('JwtDecoder', () => {
  it('renders without crashing', () => {
    render(<JwtDecoder />);
    expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
  });

  it('decodes a valid JWT and displays header alg field', () => {
    render(<JwtDecoder />);

    // Find HS256 in the header section (not in timestamp section)
    const headerSection = screen.getByText('Header').closest('.space-y-4');
    expect(headerSection).toHaveTextContent('HS256');
  });

  it('decodes a valid JWT and displays payload sub field', () => {
    render(<JwtDecoder />);

    // Find 1234567890 in the payload section (not in timestamp section)
    const payloadSection = screen.getByText('Payload').closest('.space-y-4');
    expect(payloadSection).toHaveTextContent('1234567890');
  });

  it('shows error for input with wrong number of segments', () => {
    render(<JwtDecoder />);

    const textarea = screen.getByLabelText(/JWT Token/i);
    fireEvent.change(textarea, { target: { value: 'invalid.jwt' } });

    expect(screen.getByText('Invalid format — a JWT must have three Base64Url segments separated by periods.')).toBeInTheDocument();
  });

  it('shows placeholder state when input is empty', () => {
    render(<JwtDecoder />);

    const textarea = screen.getByLabelText(/JWT Token/i);
    fireEvent.change(textarea, { target: { value: '' } });

    expect(screen.getByText('Paste a JWT to inspect')).toBeInTheDocument();
  });

  it('displays human-readable date for iat claim', () => {
    render(<JwtDecoder />);

    expect(screen.getByText('Issued At (iat):')).toBeInTheDocument();
    // Look for timestamp in the timestamp section specifically
    const timestampSection = screen.getByText('Timestamp Claims').closest('.space-y-4');
    expect(timestampSection).toHaveTextContent('1516239022');
  });
});
