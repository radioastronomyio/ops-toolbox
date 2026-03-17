/**
 * @file MermaidRenderer.jsx
 * @description Main component for mermaid diagram renderer with live preview and export
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Moon,
  Play,
  Share2,
  Square,
  Sun
} from 'lucide-react';
import mermaid from 'mermaid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getMermaidConfig } from './config';
import Editor from './Editor';

const DEFAULT_DIAGRAM = `flowchart TB
    subgraph WAN["WAN Zone"]
        ISP[Internet]
        end
    
    subgraph CORE["Core Infrastructure"]
        FW[Firewall]
        RTR[Core Router]
        end
    
    subgraph DIST["Distribution"]
        SW1[Switch-01]
        SW2[Switch-02]
        end
    
    subgraph ACCESS["Access Layer"]
        AP1[AP-Office]
        AP2[AP-Lab]
        SRV[Server]
        WS1[Workstation-1]
        WS2[Workstation-2]
        end
    
    ISP --> FW
    FW --> RTR
    RTR --> SW1
    RTR --> SW2
    SW1 --> AP1
    SW1 --> SRV
    SW2 --> AP2
    SW2 --> WS1
    SW2 --> WS2`;

/**
 * Convert string to base64, handling unicode characters properly
 */
const toBase64 = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
};

/**
 * Parse mermaid error message to extract line number
 */
const parseMermaidError = (msg, code) => {
  if (!msg) return null;

  const match = msg.match(/line\s+(\d+)/i) || msg.match(/^(\d+):/m);
  if (!match) return null;

  const lineNum = parseInt(match[1], 10);
  const maxLine = code.split('\n').length;

  if (lineNum < 1 || lineNum > maxLine) return null;

  return lineNum;
};

function MermaidRenderer() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [elkReady, setElkReady] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('mermaid-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [layout, setLayout] = useState(() => {
    try {
      return localStorage.getItem('mermaid-layout') || 'elk';
    } catch {
      return 'elk';
    }
  });
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);
  const [errorLine, setErrorLine] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(() => {
    try {
      const saved = localStorage.getItem('mermaid-auto-update');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const containerRef = useRef(null);
  const renderTimeout = useRef(null);

  // Register ELK layout engine (runs once on module load)
  useEffect(() => {
    import('@mermaid-js/layout-elk').then(elkModule => {
      const loaders = elkModule.default ?? elkModule;
      if (typeof loaders === 'function') {
        loaders(mermaid);
        setElkReady(true);
      } else if (loaders && typeof loaders === 'object') {
        mermaid.registerLayoutLoaders(loaders);
        setElkReady(true);
      } else {
        console.error('ELK module format not recognized:', elkModule);
        setLayout('dagre');
      }
    }).catch(err => {
      console.error('Failed to load ELK layout engine:', err);
      setLayout('dagre');
    });
  }, []);

  // Memoized render function
  const reRender = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      setError(null);
      setErrorLine(null);
      const id = 'mermaid-svg-' + Math.random().toString(36).slice(2, 11);
      const { svg } = await mermaid.render(id, code);
      containerRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid render error:', err);
      const msg = err.message || 'Syntax Error';
      setError(msg);
      setErrorLine(parseMermaidError(msg, code));
    }
  }, [code]);

  // Persist preferences
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('mermaid-theme', theme);
    localStorage.setItem('mermaid-layout', layout);
    localStorage.setItem('mermaid-auto-update', JSON.stringify(autoUpdate));
  }, [theme, layout, autoUpdate]);

  // Initialize mermaid and render on theme/layout/elkReady change
  useEffect(() => {
    if (!elkReady && layout === 'elk') return;
    mermaid.initialize(getMermaidConfig(theme, layout));
    reRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, layout, elkReady]);

  // Debounced rendering for code changes
  useEffect(() => {
    if (!autoUpdate) return;
    if (!elkReady && layout === 'elk') return;

    if (renderTimeout.current) clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(() => {
      reRender();
    }, 300);
    return () => clearTimeout(renderTimeout.current);
  }, [code, autoUpdate, reRender, elkReady, layout]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLayout = () => {
    setLayout(prev => prev === 'elk' ? 'dagre' : 'elk');
  };

  const copySVG = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.innerHTML;
    navigator.clipboard.writeText(svg)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Clipboard copy error:', err);
        setError(err?.message || 'Failed to copy to clipboard');
      });
  };

  const downloadSVG = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.innerHTML;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const bbox = svgElement.getBBox ? svgElement.getBBox() : { width: 800, height: 600 };
    const width = svgElement.width.baseVal.value || bbox.width;
    const height = svgElement.height.baseVal.value || bbox.height;

    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;

    img.onload = () => {
      ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'diagram.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = 'data:image/svg+xml;base64,' + toBase64(svgData);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Mermaid Renderer</h1>
        <p className="text-text-secondary">
          Paste mermaid diagram code and get rendered SVG with ELK layout engine.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 hover:bg-surface-2 text-text-secondary text-sm font-medium rounded-md border border-border transition-micro"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button
          onClick={toggleLayout}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 hover:bg-surface-2 text-text-secondary text-sm font-medium rounded-md border border-border transition-micro"
          title="Toggle Layout Engine"
        >
          {layout === 'elk' ? <Share2 size={16} /> : <Square size={16} />}
          {layout === 'elk' ? 'Dagre' : 'ELK'}
        </button>
        <button
          onClick={copySVG}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 hover:bg-surface-2 text-text-secondary text-sm font-medium rounded-md border border-border transition-micro"
          title="Copy SVG"
        >
          {isCopied ? <Check size={16} className="text-status-success" /> : <Copy size={16} />}
          Copy SVG
        </button>
        <button
          onClick={downloadSVG}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 hover:bg-surface-2 text-text-secondary text-sm font-medium rounded-md border border-border transition-micro"
          title="Download SVG"
        >
          <Download size={16} />
          SVG
        </button>
        <button
          onClick={downloadPNG}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent-hover text-black text-sm font-medium rounded-md transition-micro"
          title="Download PNG"
        >
          <ImageIcon size={16} />
          PNG
        </button>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
        {/* Editor pane */}
        <div className="flex flex-col border border-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-surface-1 border-b border-border text-xs text-text-secondary uppercase tracking-wide">
            <span>Editor</span>
            <div className="flex items-center gap-3">
              {!autoUpdate && (
                <button
                  className="text-text-secondary hover:text-accent transition-micro"
                  onClick={reRender}
                  title="Render Diagram"
                >
                  <Play size={14} />
                </button>
              )}
              <button
                className={`relative w-8 h-[18px] rounded-full transition-micro cursor-pointer ${autoUpdate ? 'bg-status-success' : 'bg-surface-3'}`}
                onClick={() => setAutoUpdate(!autoUpdate)}
                role="switch"
                aria-checked={autoUpdate}
                title="Auto-update on change"
              >
                <span className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform ${autoUpdate ? 'left-[18px]' : 'left-[2px]'}`} />
              </button>
              <span className="text-text-muted text-[11px] font-semibold min-w-[40px]">{autoUpdate ? 'Live' : 'Manual'}</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-bg">
            <Editor
              value={code}
              onChange={setCode}
              theme={theme}
              errorLine={errorLine}
            />
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-1 border-t border-border text-xs text-text-muted">
            <span>{code.split('\n').length} lines</span>
            {error && (
              <span
                className="flex items-center gap-1 text-status-error cursor-pointer"
                onClick={() => {
                  if (errorLine) {
                    const currentLine = errorLine;
                    setErrorLine(null);
                    setTimeout(() => setErrorLine(currentLine), 10);
                  }
                }}
                title={errorLine ? `Click to scroll to line ${errorLine}` : undefined}
              >
                <AlertCircle size={12} /> {error}
              </span>
            )}
          </div>
        </div>

        {/* Preview pane */}
        <div className="flex items-center justify-center border border-border rounded-md bg-bg overflow-auto p-4">
          <div ref={containerRef} className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
        </div>
      </div>
    </div>
  );
}

export default MermaidRenderer;
