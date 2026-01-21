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
    Sun
} from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';

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

function App() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [theme, setTheme] = useState('dark');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const renderTimeout = useRef(null);

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    reRender();
  }, [theme]);

  // Debounced rendering
  useEffect(() => {
    if (renderTimeout.current) clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(() => {
      reRender();
    }, 300);
    return () => clearTimeout(renderTimeout.current);
  }, [code]);

  const reRender = async () => {
    if (!containerRef.current) return;
    
    try {
      setError(null);
      // Generate unique ID for each render to avoid conflicts
      const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
      
      const { svg } = await mermaid.render(id, code);
      containerRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError(err.message || 'Syntax Error');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    mermaid.initialize({ theme: newTheme === 'dark' ? 'dark' : 'default' });
  };

  const copySVG = () => {
    const svg = containerRef.current.innerHTML;
    navigator.clipboard.writeText(svg).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const downloadSVG = () => {
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

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={14} /> Live
            </div>
          </div>
          <div className="editor-container">
            <textarea
              className="editor-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Mermaid syntax here..."
              spellCheck="false"
            />
          </div>
          <div className="status-bar">
            <span>{code.split('\n').length} lines</span>
            {error && (
              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
