import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnixEpochTool from '../../src/tools/UnixEpochTool.jsx';

describe('UnixEpochTool', () => {
  it('renders without crashing', () => {
    render(<UnixEpochTool />);
    expect(screen.getByText(/Unix Epoch/i)).toBeInTheDocument();
  });

  it('live epoch counter is displayed', () => {
    render(<UnixEpochTool />);
    expect(screen.getByText(/Current Epoch|Live/i)).toBeInTheDocument();
  });

  it('epoch input field is present', () => {
    render(<UnixEpochTool />);
    expect(screen.getByPlaceholderText(/epoch|timestamp/i)).toBeInTheDocument();
  });

  it('datetime-local input is present', () => {
    render(<UnixEpochTool />);
    expect(document.querySelector('input[type="datetime-local"]')).toBeInTheDocument();
  });

  it('UTC timezone row is shown', () => {
    render(<UnixEpochTool />);
    expect(screen.getByText('UTC')).toBeInTheDocument();
  });

  it('Copy buttons are present', () => {
    render(<UnixEpochTool />);
    expect(screen.getAllByText(/Copy/).length).toBeGreaterThanOrEqual(1);
  });
});
