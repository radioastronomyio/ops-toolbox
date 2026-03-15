import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubnetCalculator from '../../src/tools/SubnetCalculator.jsx';

describe('SubnetCalculator', () => {
  it('renders without crashing', () => {
    render(<SubnetCalculator />);
    expect(screen.getByText('Subnet Calculator')).toBeInTheDocument();
  });

  it('shows default network 10.0.0.0/16', () => {
    render(<SubnetCalculator />);
    expect(screen.getByDisplayValue('10.0.0.0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('16')).toBeInTheDocument();
  });

  it('displays subnet table with one row initially', () => {
    render(<SubnetCalculator />);
    // The default 10.0.0.0/16 row should be visible
    expect(screen.getByText('10.0.0.0/16')).toBeInTheDocument();
  });

  it('split button exists on the row', () => {
    render(<SubnetCalculator />);
    expect(screen.getByText('Split')).toBeInTheDocument();
  });

  it('clicking split creates two rows', () => {
    render(<SubnetCalculator />);
    fireEvent.click(screen.getByText('Split'));
    expect(screen.getByText('10.0.0.0/17')).toBeInTheDocument();
    expect(screen.getByText('10.0.128.0/17')).toBeInTheDocument();
  });

  it('host count is correct for displayed subnets', () => {
    render(<SubnetCalculator />);
    // 10.0.0.0/16 has 65534 usable hosts
    expect(screen.getByText('65,534')).toBeInTheDocument();
  });
});
