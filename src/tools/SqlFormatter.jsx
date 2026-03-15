import React, { useState, useEffect, useRef } from 'react';
import { formatSql } from '../lib/sqlFormat';

const DIALECTS = [
  { label: 'SQL (Standard)', value: 'sql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'T-SQL', value: 'transactsql' },
  { label: 'BigQuery', value: 'bigquery' },
  { label: 'SQLite', value: 'sqlite' },
];

const KEYWORD_CASES = [
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'lowercase', value: 'lower' },
  { label: 'preserve', value: 'preserve' },
];

const INDENT_OPTIONS = [
  { label: '2 spaces', tabWidth: 2, useTabs: false },
  { label: '4 spaces', tabWidth: 4, useTabs: false },
  { label: 'Tab', tabWidth: 1, useTabs: true },
];

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [keywordCase, setKeywordCase] = useState('upper');
  const [indentIdx, setIndentIdx] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  function handleFormat() {
    try {
      const { tabWidth, useTabs } = INDENT_OPTIONS[indentIdx];
      const result = formatSql(input, dialect, { keywordCase, tabWidth, useTabs });
      setOutput(result);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormat();
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const lineCount = output ? output.split('\n').length : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">SQL Formatter</h1>

      <textarea
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="SELECT*FROM users WHERE id=1 AND status='active'"
        rows={10}
        className="w-full font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-y"
      />

      {/* Options */}
      <div className="bg-slate-800 rounded-lg p-4 flex flex-wrap gap-6 items-end">
        <div className="space-y-1">
          <label className="block text-xs text-slate-400 uppercase tracking-wide">Dialect</label>
          <select
            value={dialect}
            onChange={e => setDialect(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500"
          >
            {DIALECTS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-400 uppercase tracking-wide">Keyword Case</label>
          <select
            value={keywordCase}
            onChange={e => setKeywordCase(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500"
          >
            {KEYWORD_CASES.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-400 uppercase tracking-wide">Indent</label>
          <select
            value={indentIdx}
            onChange={e => setIndentIdx(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500"
          >
            {INDENT_OPTIONS.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">Tip: Press Ctrl+Enter to format</p>

      <button
        onClick={handleFormat}
        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
      >
        Format
      </button>

      {error && (
        <div className="px-4 py-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{lineCount > 0 ? `${lineCount} line${lineCount !== 1 ? 's' : ''}` : ''}</span>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded text-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {output && (
          <pre className="bg-slate-900 border border-slate-700 rounded p-4 text-sm font-mono text-slate-300 overflow-auto max-h-96 whitespace-pre">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
