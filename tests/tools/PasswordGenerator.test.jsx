import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordGenerator from '../../src/tools/PasswordGenerator.jsx';

describe('PasswordGenerator', () => {
  it('renders without crashing', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password Generator')).toBeInTheDocument();
  });

  it('displays a generated password on mount', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Generated Password')).toBeInTheDocument();
  });

  it('password display element has monospace styling (font-mono class)', () => {
    render(<PasswordGenerator />);
    const passwordElement = screen.getByText('Generated Password').closest('.space-y-4').querySelector('.font-mono');
    expect(passwordElement).toBeInTheDocument();
  });

  it('shows entropy estimate text', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password Entropy')).toBeInTheDocument();
  });

  it('displays error when all character pools are disabled', () => {
    render(<PasswordGenerator />);
    // Uncheck all character pools
    fireEvent.click(screen.getByText('Uppercase'));
    fireEvent.click(screen.getByText('Lowercase'));
    fireEvent.click(screen.getByText('0-9'));
    fireEvent.click(screen.getByText('!@#$%^&*()'));
    expect(screen.getByText('Enable at least one character set')).toBeInTheDocument();
  });
});
