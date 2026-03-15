import React, { useState } from 'react';
import { generateBatch, formatUuid, isValidUuid } from '../lib/uuidUtils.js';

const FORMAT_OPTIONS = [
  { value: 'hyphenated', label: 'Hyphenated' },
  { value: 'no-hyphens', label: 'No hyphens' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'uppercase-no-hyphens', label: 'UPPERCASE no hyphens' },
];

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

function extractV7Timestamp(uuid) {
  try {
    const hex = uuid.replace(/-/g, '').slice(0, 12);
    const ms = parseInt(hex, 16);
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

export default function UuidGenerator() {
  const [version, setVersion] = useState('v4');
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState('hyphenated');
  const [uuids, setUuids] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const batch = generateBatch(version, count);
    setUuids(batch.map(u => formatUuid(u, format)));
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const v7ts = version === 'v7' && count === 1 && uuids.length === 1
    ? extractV7Timestamp(uuids[0].toLowerCase().replace(/[^0-9a-f]/g, '') + '00000000000000000000000000000000'.slice(uuids[0].replace(/[^0-9a-fA-F]/g, '').length))
    : null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">UUID Generator</h1>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Version toggle */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-400 mr-2">Version:</span>
            {['v4', 'v7'].map(v => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                  version === v ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Count:</label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              min={1}
              max={100}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Format */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Format:</label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none"
            >
              {FORMAT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
        >
          Generate
        </button>
      </div>

      {/* Output */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">Generated UUIDs</h2>
          <button
            onClick={handleCopyAll}
            disabled={uuids.length === 0}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-sm rounded transition-colors"
          >
            {copied ? 'Copied!' : 'Copy All'}
          </button>
        </div>
        <div className="bg-slate-900 rounded p-3 space-y-1 max-h-80 overflow-y-auto min-h-8">
          {uuids.length === 0 ? (
            <p className="text-slate-600 text-sm">Click Generate to create UUIDs.</p>
          ) : (
            uuids.map((u, i) => (
              <div key={i} className="font-mono text-sm text-slate-300">{u}</div>
            ))
          )}
        </div>
      </div>

      {/* v7 timestamp panel */}
      {version === 'v7' && count === 1 && uuids.length === 1 && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          <h2 className="text-sm font-medium text-slate-400">v7 Timestamp</h2>
          <p className="text-slate-300 text-sm font-mono">
            {(() => {
              try {
                const raw = uuids[0].toLowerCase().replace(/-/g, '');
                const ms = parseInt(raw.slice(0, 12), 16);
                return new Date(ms).toISOString();
              } catch {
                return 'Unable to extract timestamp';
              }
            })()}
          </p>
        </div>
      )}

      {/* Nil UUID reference */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Nil UUID</h2>
        <code className="text-slate-300 font-mono text-sm">{NIL_UUID}</code>
        <p className="text-slate-500 text-xs mt-1">All zeros — used as a null/placeholder UUID</p>
      </div>
    </div>
  );
}
