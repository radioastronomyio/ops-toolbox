/**
 * @file UuidGenerator.jsx
 * @description UUID v4 (random) and v7 (timestamp-sortable) generator with batch output and format options
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import React, { useState } from 'react';
import { generateBatch, formatUuid, isValidUuid } from '../lib/uuidUtils.js';
import CopyButton from '../components/CopyButton';

const FORMAT_OPTIONS = [
  { value: 'hyphenated', label: 'Hyphenated' },
  { value: 'no-hyphens', label: 'No hyphens' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'uppercase-no-hyphens', label: 'UPPERCASE no hyphens' },
];

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

/** Extract the embedded millisecond timestamp from the first 48 bits of a UUID v7 */
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

  const handleGenerate = () => {
    const batch = generateBatch(version, count);
    setUuids(batch.map(u => formatUuid(u, format)));
  };

  // Pad hex to 32 chars before extracting timestamp (handles non-hyphenated formats)
  const v7ts = version === 'v7' && count === 1 && uuids.length === 1
    ? extractV7Timestamp(uuids[0].toLowerCase().replace(/[^0-9a-f]/g, '') + '00000000000000000000000000000000'.slice(uuids[0].replace(/[^0-9a-fA-F]/g, '').length))
    : null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">UUID Generator</h1>

      {/* Controls */}
      <div className="bg-surface-1 rounded-md p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Version toggle */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-text-secondary mr-2">Version:</span>
            {['v4', 'v7'].map(v => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`px-3 py-1.5 rounded text-sm font-mono transition-micro ${
                  version === v ? 'bg-accent text-black' : 'bg-surface-2 hover:bg-surface-3 text-text-primary'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Count:</label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              min={1}
              max={100}
              className="w-20 bg-bg border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
            />
          </div>

          {/* Format */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Format:</label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value)}
              className="bg-bg border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
            >
              {FORMAT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-black rounded font-medium transition-micro"
        >
          Generate
        </button>
      </div>

      {/* Output */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-secondary">Generated UUIDs</h2>
          <CopyButton
            text={uuids.join('\n')}
            label="Copy All"
            className="py-1.5 text-sm"
          />
        </div>
        <div className="bg-bg rounded p-3 space-y-1 max-h-80 overflow-y-auto min-h-8">
          {uuids.length === 0 ? (
            <p className="text-text-muted text-sm">Click Generate to create UUIDs.</p>
          ) : (
            uuids.map((u, i) => (
              <div key={i} className="font-mono text-sm text-text-secondary">{u}</div>
            ))
          )}
        </div>
      </div>

      {/* v7 timestamp panel */}
      {version === 'v7' && count === 1 && uuids.length === 1 && (
        <div className="bg-surface-1 rounded-md p-4 space-y-2">
          <h2 className="text-sm font-medium text-text-secondary">v7 Timestamp</h2>
          <p className="text-text-secondary text-sm font-mono">
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
      <div className="bg-surface-1 rounded-md p-4">
        <h2 className="text-sm font-medium text-text-secondary mb-2">Nil UUID</h2>
        <code className="text-text-secondary font-mono text-sm">{NIL_UUID}</code>
        <p className="text-text-muted text-xs mt-1">All zeros — used as a null/placeholder UUID</p>
      </div>
    </div>
  );
}
