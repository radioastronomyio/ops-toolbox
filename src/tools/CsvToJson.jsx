/**
 * @file CsvToJson.jsx
 * @description CSV to JSON converter with auto-delimiter detection, file upload, and configurable parsing options
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import React, { useState, useRef } from 'react';
import { parseCsvString, toJsonString, detectDelimiter } from '../lib/csvToJson';
import { useClipboard } from '../hooks/useClipboard';

export default function CsvToJson() {
  const [activeTab, setActiveTab] = useState('paste');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileWarning, setFileWarning] = useState('');

  const [headerRow, setHeaderRow] = useState(true);
  const [dynamicTyping, setDynamicTyping] = useState(true);
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [delimiterMode, setDelimiterMode] = useState('auto');
  const [manualDelimiter, setManualDelimiter] = useState(',');

  const [jsonOutput, setJsonOutput] = useState('');
  const [stats, setStats] = useState(null);
  const [errors, setErrors] = useState([]);
  const { copy, copied } = useClipboard();

  const fileRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFileWarning('File is larger than 5MB. Processing may be slow.');
    } else {
      setFileWarning('');
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setCsvText(ev.target.result);
    reader.readAsText(file);
  }

  function handleConvert() {
    if (!csvText.trim()) {
      setJsonOutput('');
      setStats(null);
      setErrors([]);
      return;
    }

    // Auto-detect samples only the first 500 chars for performance on large files
    const delimiter =
      delimiterMode === 'auto' ? detectDelimiter(csvText.slice(0, 500)) : manualDelimiter;

    const result = parseCsvString(csvText, {
      header: headerRow,
      dynamicTyping,
      skipEmptyLines,
      delimiter,
    });

    setErrors(result.errors || []);
    const json = toJsonString(result.data, 2);
    setJsonOutput(json);
    setStats({
      rows: result.data.length,
      cols: result.meta?.fields?.length ?? (result.data[0] ? Object.keys(result.data[0]).length : 0),
      delimiter,
    });
  }

  function handleDownload() {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? fileName.replace(/\.(csv|tsv|txt)$/i, '.json') : 'output.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">CSV to JSON</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-1 rounded-md p-1 w-fit">
        {['paste', 'upload'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-micro ${
              activeTab === tab
                ? 'bg-accent text-black'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'paste' ? 'Paste CSV' : 'Upload File'}
          </button>
        ))}
      </div>

      {activeTab === 'paste' ? (
        <textarea
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="Paste CSV data here..."
          rows={10}
          className="w-full font-mono text-sm bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-y"
        />
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileChange}
            className="block text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-accent file:text-black hover:file:bg-accent-hover"
          />
          {fileName && <p className="text-sm text-text-secondary">Loaded: {fileName}</p>}
          {fileWarning && <p className="text-sm text-status-warning">{fileWarning}</p>}
        </div>
      )}

      {/* Options */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Options</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={headerRow}
              onChange={e => setHeaderRow(e.target.checked)}
              className="rounded"
            />
            Header row
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={dynamicTyping}
              onChange={e => setDynamicTyping(e.target.checked)}
              className="rounded"
            />
            Dynamic typing
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={skipEmptyLines}
              onChange={e => setSkipEmptyLines(e.target.checked)}
              className="rounded"
            />
            Skip empty lines
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">Delimiter:</label>
          <select
            value={delimiterMode}
            onChange={e => setDelimiterMode(e.target.value)}
            className="bg-bg border border-border rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            <option value="auto">Auto-detect</option>
            <option value="manual">Manual</option>
          </select>
          {delimiterMode === 'manual' && (
            <input
              type="text"
              value={manualDelimiter}
              onChange={e => setManualDelimiter(e.target.value)}
              maxLength={1}
              className="w-12 bg-bg border border-border rounded px-2 py-1 text-text-primary text-sm text-center focus:outline-none focus:border-accent"
            />
          )}
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="px-5 py-2 bg-accent hover:bg-accent-hover text-black rounded font-medium"
      >
        Convert
      </button>

      {errors.length > 0 && (
        <div className="bg-status-error/10 border border-status-error/50 rounded p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-status-error">{err.message}</p>
          ))}
        </div>
      )}

      {jsonOutput && (
        <div className="space-y-3">
          {stats && (
            <div className="flex gap-4 text-sm text-text-secondary">
              <span>{stats.rows} rows</span>
              <span>{stats.cols} columns</span>
              <span>delimiter: <code className="font-mono text-text-primary">{stats.delimiter === '\t' ? '\\t' : stats.delimiter}</code></span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => copy(jsonOutput)}
              className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-text-primary rounded text-sm"
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-text-primary rounded text-sm"
            >
              Download
            </button>
          </div>

          <pre className="bg-bg border border-border rounded p-4 text-sm font-mono text-text-secondary overflow-auto max-h-96">
            {jsonOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
