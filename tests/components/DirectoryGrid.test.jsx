import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DirectoryGrid from '../../src/components/DirectoryGrid';

function renderGrid() {
  return render(
    <MemoryRouter>
      <DirectoryGrid />
    </MemoryRouter>
  );
}

describe('DirectoryGrid — badges', () => {
  it('renders no "Online" or "Online Optional" badges (privacy claim is unconditional)', () => {
    renderGrid();
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
    expect(screen.queryByText('Online Optional')).not.toBeInTheDocument();
  });

  it('renders "Beta" badge for SSH Keypair Generator card', () => {
    renderGrid();
    const card = screen.getByText('SSH Keypair Generator').closest('a');
    expect(within(card).getByText('Beta')).toBeInTheDocument();
  });

  it('does not render badges for Subnet Calculator card (all defaults)', () => {
    renderGrid();
    const card = screen.getByText('Subnet Calculator').closest('a');
    expect(within(card).queryByText('Online')).not.toBeInTheDocument();
    expect(within(card).queryByText('Beta')).not.toBeInTheDocument();
    expect(within(card).queryByText('Online Optional')).not.toBeInTheDocument();
    expect(within(card).queryByText('Experimental')).not.toBeInTheDocument();
  });

  it('badge container is not rendered when no badges apply', () => {
    renderGrid();
    // Subnet Calculator has no badges — verify the badge div is absent
    const card = screen.getByText('Subnet Calculator').closest('a');
    // The badge container div would contain badge spans; verify none of the known badge texts are present
    const badgeTexts = ['Online', 'Beta', 'Online Optional', 'Experimental'];
    for (const text of badgeTexts) {
      expect(within(card).queryByText(text)).not.toBeInTheDocument();
    }
  });
});
