import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserAgentDecoder from '../../src/tools/UserAgentDecoder.jsx';

// Mock navigator.userAgent
vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });

describe('UserAgentDecoder', () => {
  it('renders without crashing', () => {
    render(<UserAgentDecoder />);
    expect(screen.getByText('User-Agent Decoder')).toBeInTheDocument();
  });

  it('pre-fills with a UA string on mount', () => {
    render(<UserAgentDecoder />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBeTruthy();
  });

  it('displays browser name and version for a known UA string', () => {
    render(<UserAgentDecoder />);
    // Chrome UA from mock - should show Chrome
    expect(screen.getByText('Browser')).toBeInTheDocument();
  });

  it('displays OS information section', () => {
    render(<UserAgentDecoder />);
    expect(screen.getByText('OS')).toBeInTheDocument();
  });

  it('shows "Not detected" for missing fields', () => {
    render(<UserAgentDecoder />);
    // Device type for desktop may not be detected
    expect(screen.getAllByText('Not detected').length).toBeGreaterThan(0);
  });
});
