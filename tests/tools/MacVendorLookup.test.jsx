import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MacVendorLookup from '../../src/tools/MacVendorLookup.jsx';

describe('MacVendorLookup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<MacVendorLookup />);
    expect(screen.getByText('MAC Vendor Lookup')).toBeInTheDocument();
  });

  it('shows error for invalid MAC input', () => {
    render(<MacVendorLookup />);
    fireEvent.change(screen.getByPlaceholderText(/AA:BB:CC/), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Lookup'));
    expect(screen.getByText('Invalid MAC address format')).toBeInTheDocument();
  });

  it('displays normalized MAC after submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ prefix: 'AA:BB:CC', vendor: 'Test Corp' }),
    }));

    render(<MacVendorLookup />);
    fireEvent.change(screen.getByPlaceholderText(/AA:BB:CC/), {
      target: { value: 'AABBCCDDEEFF' },
    });
    fireEvent.click(screen.getByText('Lookup'));
    expect(screen.getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
  });

  it('shows vendor name on successful API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ prefix: 'AA:BB:CC', vendor: 'Test Corp' }),
    }));

    render(<MacVendorLookup />);
    fireEvent.change(screen.getByPlaceholderText(/AA:BB:CC/), {
      target: { value: 'AA:BB:CC:DD:EE:FF' },
    });
    fireEvent.click(screen.getByText('Lookup'));

    const vendorEl = await screen.findByText('Test Corp');
    expect(vendorEl).toBeInTheDocument();
  });

  it('shows appropriate message on API failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    render(<MacVendorLookup />);
    fireEvent.change(screen.getByPlaceholderText(/AA:BB:CC/), {
      target: { value: 'AA:BB:CC:DD:EE:FF' },
    });
    fireEvent.click(screen.getByText('Lookup'));

    const msg = await screen.findByText(/Vendor lookup API is not available/);
    expect(msg).toBeInTheDocument();
  });
});
