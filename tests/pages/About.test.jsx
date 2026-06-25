import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from '../../src/pages/About';

function renderAbout() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  );
}

describe('About', () => {
  it('renders the page heading and narrative', () => {
    renderAbout();
    expect(screen.getByRole('heading', { name: 'About Ops Toolbox' })).toBeInTheDocument();
    expect(screen.getByText(/runs entirely in the browser/i)).toBeInTheDocument();
  });

  it('links the GitHub repository (new tab, noopener)', () => {
    renderAbout();
    const gh = screen.getByRole('link', { name: /view on github/i });
    expect(gh).toHaveAttribute('href', 'https://github.com/radioastronomyio/ops-toolbox');
    expect(gh).toHaveAttribute('target', '_blank');
    expect(gh.getAttribute('rel')).toMatch(/noopener/);
  });

  it('links the consultancy (new tab, noopener)', () => {
    renderAbout();
    const link = screen.getByRole('link', { name: 'Donald Fountain' });
    expect(link).toHaveAttribute('href', 'https://donaldfountain.ai');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
  });

  it('links back to the tool directory', () => {
    renderAbout();
    const back = screen.getByRole('link', { name: /all tools/i });
    expect(back).toHaveAttribute('href', '/');
  });
});
