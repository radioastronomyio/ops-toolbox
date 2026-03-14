import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubnetCalculator from '../../src/tools/SubnetCalculator.jsx';

describe('SubnetCalculator', () => {
  it('renders without crashing', () => {
    render(<SubnetCalculator />);
    expect(screen.getByText('Subnet Calculator')).toBeInTheDocument();
  });

  it('displays default value (10.0.0.0/16) results on mount', () => {
    render(<SubnetCalculator />);

    expect(screen.getByText('10.0.0.0')).toBeInTheDocument();
    expect(screen.getByText('10.0.255.255')).toBeInTheDocument();
    expect(screen.getByText('255.255.0.0')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('10.0.255.254')).toBeInTheDocument();
    expect(screen.getByText('65,534')).toBeInTheDocument();
    expect(screen.getByText('/16')).toBeInTheDocument();
  });

  it('shows error message for invalid input', () => {
    render(<SubnetCalculator />);

    const input = screen.getByLabelText(/CIDR Notation/i);
    fireEvent.change(input, { target: { value: 'invalid' } });

    expect(screen.getByText('Invalid CIDR notation.')).toBeInTheDocument();
  });

  it('displays correct number of result cards (7 fields)', () => {
    render(<SubnetCalculator />);

    const labels = [
      'Network Address',
      'Broadcast Address',
      'Subnet Mask',
      'First Usable Host',
      'Last Usable Host',
      'Total Usable Hosts',
      'Prefix Length'
    ];

    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('updates results when input changes', () => {
    render(<SubnetCalculator />);

    const input = screen.getByLabelText(/CIDR Notation/i);
    fireEvent.change(input, { target: { value: '192.168.1.0/24' } });

    expect(screen.getByText('192.168.1.0')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.255')).toBeInTheDocument();
    expect(screen.getByText('255.255.255.0')).toBeInTheDocument();
    expect(screen.getByText('254')).toBeInTheDocument();
    expect(screen.getByText('/24')).toBeInTheDocument();
  });
});
