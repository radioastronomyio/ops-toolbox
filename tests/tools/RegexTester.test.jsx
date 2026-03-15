import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegexTester from '../../src/tools/RegexTester.jsx';

describe('RegexTester', () => {
  it('renders without crashing', () => {
    render(<RegexTester />);
    expect(screen.getByText('Regex Tester')).toBeInTheDocument();
  });

  it('pattern input field is present', () => {
    render(<RegexTester />);
    expect(screen.getByPlaceholderText(/pattern|regex/i)).toBeInTheDocument();
  });

  it('test string textarea is present', () => {
    render(<RegexTester />);
    expect(screen.getByPlaceholderText(/test string/i)).toBeInTheDocument();
  });

  it('flags checkboxes present (g, i, m, s)', () => {
    render(<RegexTester />);
    expect(screen.getByLabelText('g')).toBeInTheDocument();
    expect(screen.getByLabelText('i')).toBeInTheDocument();
    expect(screen.getByLabelText('m')).toBeInTheDocument();
    expect(screen.getByLabelText('s')).toBeInTheDocument();
  });

  it('g flag is checked by default', () => {
    render(<RegexTester />);
    expect(screen.getByLabelText('g')).toBeChecked();
  });

  it('quick reference toggle button is present', () => {
    render(<RegexTester />);
    expect(screen.getByText(/Quick Reference|quick reference/i)).toBeInTheDocument();
  });
});
