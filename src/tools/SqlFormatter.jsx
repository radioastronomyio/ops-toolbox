/**
 * @file SqlFormatter.jsx
 * @description SQL query formatter/beautifier supporting multiple dialects (PostgreSQL, MySQL, T-SQL, etc.)
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import React, { useState, useRef } from 'react';
import { formatSql } from '../lib/sqlFormat';
import CopyButton from '../components/CopyButton';
import ErrorBanner from '../components/ErrorBanner';

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

  // Ctrl+Enter / Cmd+Enter keyboard shortcut to format
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormat();
    }
  }

  const lineCount = output ? output.split('\n').length : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">SQL Formatter</h1>

      <textarea
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="SELECT*FROM users WHERE id=1 AND status='active'"
        rows={10}
        className="w-full font-mono text-sm bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-y"
      />

      {/* Options */}
      <div className="bg-surface-1 rounded-md p-4 flex flex-wrap gap-6 items-end">
        <div className="space-y-1">
          <label className="block text-xs text-text-secondary uppercase tracking-wide">Dialect</label>
          <select
            value={dialect}
            onChange={e => setDialect(e.target.value)}
            className="bg-bg border border-border rounded px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            {DIALECTS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-text-secondary uppercase tracking-wide">Keyword Case</label>
          <select
            value={keywordCase}
            onChange={e => setKeywordCase(e.target.value)}
            className="bg-bg border border-border rounded px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            {KEYWORD_CASES.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-text-secondary uppercase tracking-wide">Indent</label>
          <select
            value={indentIdx}
            onChange={e => setIndentIdx(Number(e.target.value))}
            className="bg-bg border border-border rounded px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            {INDENT_OPTIONS.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-text-muted">Tip: Press Ctrl+Enter to format</p>

      <button
        onClick={handleFormat}
        className="px-5 py-2 bg-accent hover:bg-accent-hover text-black rounded font-medium"
      >
        Format
      </button>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">{lineCount > 0 ? `${lineCount} line${lineCount !== 1 ? 's' : ''}` : ''}</span>
          <CopyButton text={output} className="py-1.5 text-sm" />
        </div>
        {output && (
          <pre className="bg-bg border border-border rounded p-4 text-sm font-mono text-text-secondary overflow-auto max-h-96 whitespace-pre">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
