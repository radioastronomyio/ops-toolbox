import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownPreviewer from '../../src/tools/MarkdownPreviewer.jsx';

describe('MarkdownPreviewer', () => {
  it('renders without crashing', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByText('Markdown Previewer')).toBeInTheDocument();
  });

  it('editor textarea is present', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('preview pane is present', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByTestId('preview-pane')).toBeInTheDocument();
  });

  it('GFM toggle is present and checked by default', () => {
    render(<MarkdownPreviewer />);
    const gfmCheckbox = screen.getByLabelText(/GFM|GitHub Flavored/i);
    expect(gfmCheckbox).toBeChecked();
  });

  it('Copy Markdown button present', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByText('Copy Markdown')).toBeInTheDocument();
  });

  it('Copy HTML button present', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByText('Copy HTML')).toBeInTheDocument();
  });

  it('view mode toggle buttons present', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByText('Split')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('stats bar is present', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByText(/words|min read/i)).toBeInTheDocument();
  });
});
