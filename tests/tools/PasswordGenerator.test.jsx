import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders mode toggle with Password and Passphrase buttons', () => {
    render(<PasswordGenerator />);
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Passphrase')).toBeInTheDocument();
  });

  it('switching to Passphrase mode shows word count slider', () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    expect(screen.getByLabelText('Word Count')).toBeInTheDocument();
  });

  it('switching to Passphrase mode hides character pool toggles', () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    expect(screen.queryByText('Uppercase')).not.toBeInTheDocument();
  });

  it('passphrase mode generates output with word separators', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    const pre = await waitFor(() => document.querySelector('pre.font-mono'));
    expect(pre).toBeInTheDocument();
    expect(pre.textContent).toMatch(/-/);
  });

  it('offers all published wordlists and updates entropy for a larger list', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));

    const selector = screen.getByLabelText('Wordlist');
    expect(screen.getByRole('option', { name: 'EFF Short 2.0 (1,296 words)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'EFF Long (7,776 words)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Original Diceware (7,776 entries)' })).toBeInTheDocument();
    await screen.findByText('62 bits');

    fireEvent.change(selector, { target: { value: 'eff-long' } });
    await screen.findByText('77 bits');
  });

  it('adds numeric padding with honest entropy guidance', async () => {
    render(<PasswordGenerator />);
    fireEvent.click(screen.getByText('Passphrase'));
    await screen.findByText('62 bits');

    expect(screen.getByText(/padding helps satisfy password rules/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Append numeric padding'));
    fireEvent.change(screen.getByLabelText('Padding digits'), { target: { value: '3' } });

    await screen.findByText('72 bits');
    const output = document.querySelector('pre.font-mono');
    expect(output.textContent).toMatch(/\d{3}$/);
  });
});
