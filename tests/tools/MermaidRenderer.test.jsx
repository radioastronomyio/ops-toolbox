import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MermaidRenderer from '../../src/tools/mermaid-renderer/MermaidRenderer.jsx';
import { getMermaidConfig } from '../../src/tools/mermaid-renderer/config.js';

// Mock mermaid module
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    registerLayoutLoaders: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('config.js', () => {
  it('getMermaidConfig(\'dark\', \'elk\') returns object with theme \'dark\' and layout \'elk\'', () => {
    const config = getMermaidConfig('dark', 'elk');
    expect(config).toEqual({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'antiscript',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear',
      },
      layout: 'elk',
      elk: {
        mergeEdges: true,
        nodePlacementStrategy: 'SIMPLE',
        cycleBreakingStrategy: 'GREEDY',
      },
    });
  });

  it('getMermaidConfig(\'light\', \'dagre\') returns object with theme \'default\' and layout \'dagre\'', () => {
    const config = getMermaidConfig('light', 'dagre');
    expect(config).toEqual({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'antiscript',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      layout: 'dagre',
    });
  });

  it('ELK config includes mergeEdges property when layout is \'elk\'', () => {
    const config = getMermaidConfig('dark', 'elk');
    expect(config.elk).toHaveProperty('mergeEdges');
    expect(config.elk.mergeEdges).toBe(true);
  });

  it('Dagre config does not include elk property', () => {
    const config = getMermaidConfig('dark', 'dagre');
    expect(config).not.toHaveProperty('elk');
  });
});

describe('MermaidRenderer component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing (may need to mock mermaid.render and mermaid.registerLayoutLoaders)', () => {
    render(<MermaidRenderer />);
    expect(screen.getByText('Mermaid Renderer')).toBeInTheDocument();
  });

  it('contains expected control buttons (theme toggle, layout toggle, copy/download)', () => {
    render(<MermaidRenderer />);
    
    expect(screen.getByTitle('Toggle Theme')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle Layout Engine')).toBeInTheDocument();
    expect(screen.getByTitle('Copy SVG')).toBeInTheDocument();
    expect(screen.getByTitle('Download SVG')).toBeInTheDocument();
    expect(screen.getByTitle('Download PNG')).toBeInTheDocument();
  });
});
