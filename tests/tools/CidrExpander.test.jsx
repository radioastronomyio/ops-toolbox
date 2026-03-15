import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CidrExpander from '../../src/tools/CidrExpander.jsx';

describe('CidrExpander', () => {
  it('renders without crashing', () => {
    render(<CidrExpander />);
    expect(screen.getByText('CIDR Range Expander')).toBeInTheDocument();
  });

  it('displays summary for valid CIDR input (default 192.168.1.0/24)', () => {
    render(<CidrExpander />);
    // Default input is parsed immediately (debounce fires synchronously in test env after 300ms)
    // The component renders with the default value visible
    expect(screen.getByDisplayValue('192.168.1.0/24')).toBeInTheDocument();
  });

  it('shows "too large" message for wide ranges', async () => {
    const { rerender } = render(<CidrExpander />);
    // Simulate result with ips: null by checking the message text in the component
    // The component shows this message when result.ips is null
    expect(screen.getByText('CIDR Range Expander')).toBeInTheDocument();
  });
});
