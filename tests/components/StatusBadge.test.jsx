import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../../src/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders the text label', () => {
    render(<StatusBadge status="success" label="All good" />);
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders children as the label when provided', () => {
    render(<StatusBadge status="info">Custom text</StatusBadge>);
    expect(screen.getByText('Custom text')).toBeInTheDocument();
  });

  it('renders an icon (shape) alongside the label — redundant encoding', () => {
    const { container } = render(<StatusBadge status="error" label="Failed" />);
    // An svg icon is rendered and is aria-hidden (presentational shape)
    const icon = container.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('encodes status through distinct icons per status value', () => {
    const icons = {};
    for (const status of ['success', 'error', 'warning', 'info', 'neutral']) {
      const { container } = render(<StatusBadge status={status} label={status} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      icons[status] = svg.innerHTML; // distinct icons produce distinct path data
    }
    const inners = Object.values(icons);
    expect(new Set(inners).size).toBe(5);
  });

  it('falls back to neutral for an unknown status', () => {
    const bogus = render(<StatusBadge status="bogus" label="huh" />);
    const neutral = render(<StatusBadge status="neutral" label="n" />);
    expect(bogus.container.querySelector('svg').innerHTML)
      .toBe(neutral.container.querySelector('svg').innerHTML);
  });

  it('applies the token-driven color class for the status', () => {
    render(<StatusBadge status="warning" label="careful" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-status-warning');
  });

  it('iconOnly suppresses the label text', () => {
    render(<StatusBadge status="info" label="hidden" iconOnly />);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('svg')).not.toBeNull();
  });

  it('never renders color alone — a label is present when text is given', () => {
    render(<StatusBadge status="error" label="Disk full" />);
    expect(screen.getByText('Disk full')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
