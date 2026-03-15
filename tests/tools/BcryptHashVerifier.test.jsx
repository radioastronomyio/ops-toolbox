import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BcryptHashVerifier from '../../src/tools/BcryptHashVerifier.jsx';

describe('BcryptHashVerifier', () => {
  it('renders without crashing', () => {
    render(<BcryptHashVerifier />);
    expect(screen.getByText('Bcrypt Hash Verifier')).toBeInTheDocument();
  });

  it('Hash panel: plain text input, salt rounds selector, Hash button present', () => {
    render(<BcryptHashVerifier />);
    expect(screen.getByText('Hash')).toBeInTheDocument(); // panel heading or button
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // salt rounds select
    expect(screen.getByText('Hash Password')).toBeInTheDocument();
  });

  it('Verify panel: plain text input, hash input, Verify button present', () => {
    render(<BcryptHashVerifier />);
    expect(screen.getByText('Verify Password')).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  it('Hash button is not disabled initially', () => {
    render(<BcryptHashVerifier />);
    expect(screen.getByText('Hash Password')).not.toBeDisabled();
  });

  it('Verify button is not disabled initially', () => {
    render(<BcryptHashVerifier />);
    expect(screen.getByText('Verify Password')).not.toBeDisabled();
  });
});
