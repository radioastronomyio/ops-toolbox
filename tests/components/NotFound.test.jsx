import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../src/components/NotFound';
import { toolRegistry } from '../../src/lib/toolRegistry';

function renderNotFound(path = '/nonexistent-tool') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotFound />
    </MemoryRouter>
  );
}

describe('NotFound', () => {
  it('renders 404 heading', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('displays the current pathname', () => {
    renderNotFound('/nonexistent-tool');
    expect(screen.getByText('/nonexistent-tool')).toBeInTheDocument();
  });

  it('renders a link back to /', () => {
    renderNotFound();
    const link = screen.getByRole('link', { name: /back to tool directory/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders tool suggestions from the registry', () => {
    renderNotFound();
    const suggestionLinks = screen.getAllByRole('link').filter(
      el => el.getAttribute('href') !== '/'
    );
    expect(suggestionLinks.length).toBe(3);
  });

  it('suggestion links point to valid tool paths', () => {
    renderNotFound();
    const validPaths = new Set(toolRegistry.map(t => `/${t.path}`));
    const suggestionLinks = screen.getAllByRole('link').filter(
      el => el.getAttribute('href') !== '/'
    );
    for (const link of suggestionLinks) {
      expect(validPaths.has(link.getAttribute('href'))).toBe(true);
    }
  });
});
