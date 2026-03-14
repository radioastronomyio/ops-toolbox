/**
 * @file App.jsx
 * @description Main React component for mermaid diagram renderer with live preview and export
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import {
    AlertCircle,
    Check,
    Copy, Download,
    FileCode,
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
 * Replaces deprecated unescape(encodeURIComponent()) pattern
 */
const toBase64 = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
};

/**
 * Parse mermaid error message to extract line number
 * 
 * Mermaid error formats vary by diagram type and error source:
 * - "Parse error on line 5" (parser errors)
 * - "Error on line 12" (validation errors)  
 * - "5:" at start of line (some lexer errors)
 * 
 * Line numbers from mermaid are 1-indexed and absolute to input.
 * CodeMirror's doc.line() is also 1-indexed, so no conversion needed.
 * 
 * @param {string} msg - The error message from mermaid
 * @param {string} code - The full source code (for bounds checking)
 * @returns {number|null} 1-indexed line number or null if not parseable
 */
const parseMermaidError = (msg, code) => {
  if (!msg) return null;
  
  const match = msg.match(/line\s+(\d+)/i) || msg.match(/^(\d+):/m);
  if (!match) return null;
  
  const lineNum = parseInt(match[1], 10);
  const maxLine = code.split('\n').length;
  
  // Validate bounds (1-indexed, within document)
  if (lineNum < 1 || lineNum > maxLine) return null;
  
  return lineNum;
};

function App() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
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

  // Memoized render function to satisfy useEffect dependencies
  const reRender = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      setError(null);
      setErrorLine(null);
      // Generate unique ID for each render to avoid conflicts
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

  // Persist preferences and sync DOM
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('mermaid-theme', theme);
    localStorage.setItem('mermaid-layout', layout);
    localStorage.setItem('mermaid-auto-update', JSON.stringify(autoUpdate));
  }, [theme, layout, autoUpdate]);

  // Reinitialize mermaid and re-render on theme/layout change (always, regardless of autoUpdate)
  useEffect(() => {
    mermaid.initialize(getMermaidConfig(theme, layout));
    reRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, layout]);

  // Debounced rendering for code changes
  useEffect(() => {
    if (!autoUpdate) return;
    
    if (renderTimeout.current) clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(() => {
      reRender();
    }, 300);
    return () => clearTimeout(renderTimeout.current);
  }, [code, autoUpdate, reRender]);

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

    // Get dimensions
    const bbox = svgElement.getBBox ? svgElement.getBBox() : { width: 800, height: 600 };
    const width = svgElement.width.baseVal.value || bbox.width;
    const height = svgElement.height.baseVal.value || bbox.height;

    // Scale for better quality
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
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <FileCode size={24} />
          Ops Toolbox <span>Mermaid Renderer</span>
        </div>
        <div className="controls">
          <button className="btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="btn" onClick={toggleLayout} title="Toggle Layout Engine">
            {layout === 'elk' ? <Share2 size={18} /> : <Square size={18} />}
            {layout === 'elk' ? 'Dagre Layout' : 'ELK Layout'}
          </button>
          <button className="btn" onClick={copySVG} title="Copy SVG">
            {isCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            Copy SVG
          </button>
          <button className="btn" onClick={downloadSVG}>
            <Download size={18} />
            SVG
          </button>
          <button className="btn btn-primary" onClick={downloadPNG}>
            <ImageIcon size={18} />
            PNG
          </button>
        </div>
      </header>

      <main className="main-content">
        <aside className="editor-pane">
          <div className="editor-header">
            <span>Editor</span>
            <div className="editor-controls">
              {!autoUpdate && (
                <button 
                  className="icon-btn" 
                  onClick={reRender} 
                  title="Render Diagram"
                >
                  <Play size={14} />
                </button>
              )}
              <div 
                className={`toggle-switch ${autoUpdate ? 'active' : ''}`}
                onClick={() => setAutoUpdate(!autoUpdate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setAutoUpdate(!autoUpdate);
                  }
                }}
                tabIndex={0}
                role="switch"
                aria-checked={autoUpdate}
                title="Auto-update on change"
              >
                <div className="toggle-thumb" />
              </div>
              <span className="toggle-label">{autoUpdate ? 'Live' : 'Manual'}</span>
            </div>
          </div>
          <div className="editor-container">
            <Editor
              value={code}
              onChange={setCode}
              theme={theme}
              errorLine={errorLine}
            />
          </div>
          <div className="status-bar">
            <span>{code.split('\n').length} lines</span>
            {error && (
              <span 
                className="status-error"
                style={{ 
                  color: '#ef4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  cursor: errorLine ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
                onClick={() => {
                  if (errorLine) {
                    // Re-dispatch errorLine to trigger scroll in Editor
                    const currentLine = errorLine;
                    setErrorLine(null);
                    setTimeout(() => setErrorLine(currentLine), 10);
                  }
                }}
                title={errorLine ? `Click to scroll to line ${errorLine}` : null}
              >
                <AlertCircle size={14} /> {error}
              </span>
            )}
          </div>
        </aside>

        <section className="preview-pane">
          <div ref={containerRef} className="mermaid-output" />
        </section>
      </main>
    </div>
  );
}

export default App;
