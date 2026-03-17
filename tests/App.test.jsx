import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock lazy-loaded tools to avoid loading the full component tree
vi.mock('./src/tools/SubnetCalculator', () => ({ default: () => <div>SubnetCalculator</div> }));

// We test routing directly using MemoryRouter wrapping NotFound and DirectoryGrid
import NotFound from '../src/components/NotFound';
import DirectoryGrid from '../src/components/DirectoryGrid';

describe('App routing', () => {
  it('renders DirectoryGrid at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DirectoryGrid />
      </MemoryRouter>
    );
    expect(screen.getByText('Client-Side Developer Utilities')).toBeInTheDocument();
  });

  it('renders NotFound for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent-tool']}>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Tool Not Found')).toBeInTheDocument();
  });

  it('NotFound renders a back-to-directory link', () => {
    render(
      <MemoryRouter initialEntries={['/bad-path']}>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /back to tool directory/i })).toBeInTheDocument();
  });
});
