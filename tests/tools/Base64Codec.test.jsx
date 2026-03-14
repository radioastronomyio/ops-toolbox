import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Base64Codec from '../../src/tools/Base64Codec.jsx';

describe('Base64Codec', () => {
  it('renders without crashing', () => {
    render(<Base64Codec />);
    expect(screen.getByText('Base64 Codec')).toBeInTheDocument();
  });

  it('encodes text input and shows base64 output', () => {
    render(<Base64Codec />);

    const textarea = screen.getByLabelText(/Input \(Text\)/i);
    fireEvent.change(textarea, { target: { value: 'Hello, World!' } });

    expect(screen.getByText('SGVsbG8sIFdvcmxkIQ==')).toBeInTheDocument();
  });

  it('shows error for invalid base64 in decode mode', () => {
    render(<Base64Codec />);

    // Toggle to decode mode
    const toggleButton = screen.getByText('Encode');
    fireEvent.click(toggleButton);

    const textarea = screen.getByLabelText(/Input \(Base64\)/i);
    fireEvent.change(textarea, { target: { value: 'not-valid-base64!!!' } });

    expect(screen.getByText(/Invalid Base64 string/i)).toBeInTheDocument();
  });

  it('direction toggle switches between Encode and Decode labels', () => {
    render(<Base64Codec />);

    expect(screen.getByText('Encode')).toBeInTheDocument();

    const toggleButton = screen.getByText('Encode');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Decode')).toBeInTheDocument();
  });
});
