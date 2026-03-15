import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChmodCalculator from '../../src/tools/ChmodCalculator.jsx';

describe('ChmodCalculator', () => {
  it('renders without crashing', () => {
    render(<ChmodCalculator />);
    expect(screen.getByText('Chmod Calculator')).toBeInTheDocument();
  });

  it('displays default 755 in octal', () => {
    render(<ChmodCalculator />);
    expect(screen.getByDisplayValue('755')).toBeInTheDocument();
  });

  it('displays default rwxr-xr-x in symbolic', () => {
    render(<ChmodCalculator />);
    expect(screen.getByDisplayValue('rwxr-xr-x')).toBeInTheDocument();
  });

  it('clicking 777 preset updates values', () => {
    render(<ChmodCalculator />);
    fireEvent.click(screen.getByText('777'));
    expect(screen.getByDisplayValue('777')).toBeInTheDocument();
  });

  it('checkbox grid renders', () => {
    render(<ChmodCalculator />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(9);
  });
});
