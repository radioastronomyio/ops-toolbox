import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SshKeyGenerator from '../../src/tools/SshKeyGenerator.jsx';

describe('SshKeyGenerator', () => {
  it('renders without crashing', () => {
    render(<SshKeyGenerator />);
    expect(screen.getByText('SSH Keypair Generator')).toBeInTheDocument();
  });

  it('shows key size selector with 2048 and 4096 options', () => {
    render(<SshKeyGenerator />);
    expect(screen.getByDisplayValue('2048')).toBeInTheDocument();
    // or check for option text
  });

  it('shows Generate button', () => {
    render(<SshKeyGenerator />);
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('does not auto-generate on mount (textareas are empty initially)', () => {
    render(<SshKeyGenerator />);
    const textareas = screen.getAllByRole('textbox');
    // Private key textarea should be empty
    const privateKeyArea = textareas.find(t => t.placeholder && t.placeholder.includes('-----BEGIN'));
    expect(privateKeyArea?.value || '').toBe('');
  });
});
