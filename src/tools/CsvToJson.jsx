import React, { useState, useRef } from 'react';
import { parseCsvString, toJsonString, detectDelimiter } from '../lib/csvToJson';

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
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? fileName.replace(/\.csv$/i, '.json') : 'output.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">CSV to JSON</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {['paste', 'upload'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
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
          className="w-full font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-y"
        />
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileChange}
            className="block text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-sky-600 file:text-white hover:file:bg-sky-500"
          />
          {fileName && <p className="text-sm text-slate-400">Loaded: {fileName}</p>}
          {fileWarning && <p className="text-sm text-amber-400">{fileWarning}</p>}
        </div>
      )}

      {/* Options */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Options</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={headerRow}
              onChange={e => setHeaderRow(e.target.checked)}
              className="rounded"
            />
            Header row
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={dynamicTyping}
              onChange={e => setDynamicTyping(e.target.checked)}
              className="rounded"
            />
            Dynamic typing
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
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
          <label className="text-sm text-slate-400">Delimiter:</label>
          <select
            value={delimiterMode}
            onChange={e => setDelimiterMode(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm focus:outline-none focus:border-sky-500"
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
              className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm text-center focus:outline-none focus:border-sky-500"
            />
          )}
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
      >
        Convert
      </button>

      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-300">{err.message}</p>
          ))}
        </div>
      )}

      {jsonOutput && (
        <div className="space-y-3">
          {stats && (
            <div className="flex gap-4 text-sm text-slate-400">
              <span>{stats.rows} rows</span>
              <span>{stats.cols} columns</span>
              <span>delimiter: <code className="font-mono text-slate-300">{stats.delimiter === '\t' ? '\\t' : stats.delimiter}</code></span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
            >
              Download
            </button>
          </div>

          <pre className="bg-slate-900 border border-slate-700 rounded p-4 text-sm font-mono text-slate-300 overflow-auto max-h-96">
            {jsonOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
