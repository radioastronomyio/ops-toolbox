import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CronParser from '../../src/tools/CronParser.jsx';

describe('CronParser', () => {
  it('renders without crashing', () => {
    render(<CronParser />);
    expect(screen.getByText('Cron Parser')).toBeInTheDocument();
  });

  it('cron expression input has default value', () => {
    render(<CronParser />);
    expect(screen.getByDisplayValue('0 9 * * 1-5')).toBeInTheDocument();
  });

  it('preset buttons are rendered', () => {
    render(<CronParser />);
    expect(screen.getByText('Every minute')).toBeInTheDocument();
  });

  it('next runs count selector is present', () => {
    render(<CronParser />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('description output area is present', () => {
    render(<CronParser />);
    // Default expression should show a description
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
  });
});
