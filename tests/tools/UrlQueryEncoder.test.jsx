import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UrlQueryEncoder from '../../src/tools/UrlQueryEncoder.jsx';

describe('UrlQueryEncoder', () => {
  it('renders without crashing', () => {
    render(<UrlQueryEncoder />);
    expect(screen.getByText('URL Query Encoder')).toBeInTheDocument();
  });

  it('three tabs present', () => {
    render(<UrlQueryEncoder />);
    expect(screen.getByText('Encode / Decode')).toBeInTheDocument();
    expect(screen.getByText('URL Parser')).toBeInTheDocument();
    expect(screen.getByText('Query Builder')).toBeInTheDocument();
  });

  it('Encode/Decode tab shows textarea', () => {
    render(<UrlQueryEncoder />);
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(1);
  });

  it('URL Parser tab shows URL input when clicked', () => {
    render(<UrlQueryEncoder />);
    fireEvent.click(screen.getByText('URL Parser'));
    expect(screen.getByPlaceholderText(/https:\/\//i)).toBeInTheDocument();
  });

  it('Query Builder tab shows Add Row button when clicked', () => {
    render(<UrlQueryEncoder />);
    fireEvent.click(screen.getByText('Query Builder'));
    expect(screen.getByText(/Add Row/)).toBeInTheDocument();
  });
});
