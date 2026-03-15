import React, { useState, useEffect, useRef } from 'react';
import { getAvailableFonts, generateBanner } from '../lib/asciiBanner.js';

const PRESET_FONTS = ['Standard', 'Big', 'Slant', 'Banner', 'Block', 'Doom'];
const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'full', label: 'Full' },
  { value: 'fitted', label: 'Fitted' },
];

export default function AsciiBanner() {
  const [text, setText] = useState('');
  const [font, setFont] = useState('Standard');
  const [width, setWidth] = useState(80);
  const [layout, setLayout] = useState('default');
  const [output, setOutput] = useState('');
  const [fonts, setFonts] = useState([]);
  const debounceRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFonts(getAvailableFonts());
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateBanner(text, font, { width, horizontalLayout: layout })
        .then(result => setOutput(result))
        .catch(() => setOutput(''));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [text, font, width, layout]);

  const lines = output ? output.split('\n').length : 0;
  const chars = output ? output.length : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banner.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">ASCII Banner</h1>

      {/* Text input */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-slate-300">Text (max 50 chars)</label>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value.slice(0, 50))}
          placeholder="Hello World"
          maxLength={50}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Font options */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Font</label>
            <select
              value={font}
              onChange={e => setFont(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 focus:outline-none"
            >
              {fonts.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Width</label>
            <input
              type="number"
              value={width}
              onChange={e => setWidth(Math.min(200, Math.max(40, Number(e.target.value))))}
              min={40}
              max={200}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Layout</label>
            <select
              value={layout}
              onChange={e => setLayout(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 focus:outline-none"
            >
              {LAYOUT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preset font buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESET_FONTS.map(f => (
            <button
              key={f}
              onClick={() => setFont(f)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                font === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {lines} lines · {chars} characters
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded transition-colors"
            >
              Download
            </button>
          </div>
        </div>
        <pre className="bg-slate-900 rounded p-4 text-slate-300 text-xs font-mono overflow-x-auto whitespace-pre min-h-16">
          {output || <span className="text-slate-600">Output will appear here…</span>}
        </pre>
      </div>
    </div>
  );
}
