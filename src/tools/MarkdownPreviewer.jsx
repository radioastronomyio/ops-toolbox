import React, { useState, useEffect, useRef } from 'react';
import { renderMarkdown, countWords, estimateReadTime } from '../lib/markdownUtils.js';

const DEFAULT_CONTENT = `# Welcome to Markdown Previewer

A **live editor** with _GitHub Flavored Markdown_ support.

## Features

- GFM tables and task lists
- Code blocks with syntax hints
- XSS-safe rendering via DOMPurify
- Split, editor-only, or preview-only views

## Code Example

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table Example

| Name     | Role      | Score |
|----------|-----------|-------|
| Alice    | Developer | 95    |
| Bob      | Designer  | 88    |

## Links

Visit [GitHub](https://github.com) for more info.
`;

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(DEFAULT_CONTENT);
  const [html, setHtml] = useState('');
  const [gfm, setGfm] = useState(true);
  const [breaks, setBreaks] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setHtml(renderMarkdown(markdown, { gfm, breaks }));
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [markdown, gfm, breaks]);

  const words = countWords(markdown);
  const readTime = estimateReadTime(markdown);
  const lines = markdown ? markdown.split('\n').length : 0;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    });
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const showEditor = viewMode === 'split' || viewMode === 'editor';
  const showPreview = viewMode === 'split' || viewMode === 'preview';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-100">Markdown Previewer</h1>

        {/* Options bar */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              id="gfm-toggle"
              checked={gfm}
              onChange={e => setGfm(e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-sm text-slate-300">GFM</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              id="breaks-toggle"
              checked={breaks}
              onChange={e => setBreaks(e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-sm text-slate-300">Line Breaks</span>
          </label>
          <button
            onClick={() => setMarkdown('')}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* View mode */}
        <div className="flex gap-1">
          {['split', 'editor', 'preview'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm rounded capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {mode === 'split' ? 'Split' : mode === 'editor' ? 'Editor' : 'Preview'}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded"
          >
            {copiedMd ? 'Copied!' : 'Copy Markdown'}
          </button>
          <button
            onClick={handleCopyHtml}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded"
          >
            {copiedHtml ? 'Copied!' : 'Copy HTML'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded"
          >
            Download .md
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="text-sm text-slate-500">
        {words} words · {readTime} · {lines} lines
      </div>

      {/* Panes */}
      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {showEditor && (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-700">Markdown input</div>
            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              className="w-full bg-slate-900 text-slate-300 font-mono text-sm p-4 focus:outline-none resize-none"
              style={{ minHeight: '480px' }}
              spellCheck={false}
            />
          </div>
        )}
        {showPreview && (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-700">Rendered output</div>
            <div
              data-testid="preview-pane"
              className="p-4 prose prose-invert prose-slate max-w-none overflow-auto"
              style={{ minHeight: '480px' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
