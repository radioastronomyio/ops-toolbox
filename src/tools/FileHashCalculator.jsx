/**
 * @file FileHashCalculator.jsx
 * @description File hash calculator supporting MD5, SHA-1, SHA-256, SHA-512 with in-browser Web Crypto API
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useRef, useCallback } from 'react';
import { hashFile } from '../lib/fileHash.js';

const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileHashCalculator() {
  const [file, setFile] = useState(null);
  const [selectedAlgos, setSelectedAlgos] = useState(
    Object.fromEntries(ALGORITHMS.map(a => [a, true]))
  );
  const [hashes, setHashes] = useState({});
  const [hashing, setHashing] = useState(false);
  const [expectedHash, setExpectedHash] = useState('');
  const [copied, setCopied] = useState({});
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const hashGeneration = useRef(0);

  // Generation counter prevents stale results when a new file is selected mid-hash
  async function computeHashes(f, algos) {
    const gen = ++hashGeneration.current;
    setHashing(true);
    setHashes({});
    const results = {};
    const selected = ALGORITHMS.filter(a => algos[a]);
    await Promise.all(
      selected.map(async (algo) => {
        try {
          const h = await hashFile(f, algo);
          results[algo] = h;
        } catch (e) {
          results[algo] = 'Error: ' + e.message;
        }
      })
    );
    // Discard results if a newer file was selected while hashing
    if (gen !== hashGeneration.current) return;
    setHashes(results);
    setHashing(false);
  }

  function handleFileSelect(f) {
    if (!f) return;
    setFile(f);
    computeHashes(f, selectedAlgos);
  }

  function handleFileInput(e) {
    handleFileSelect(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    handleFileSelect(f);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function toggleAlgo(algo) {
    const next = { ...selectedAlgos, [algo]: !selectedAlgos[algo] };
    setSelectedAlgos(next);
    if (file) computeHashes(file, next);
  }

  function copyHash(algo, value) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(prev => ({ ...prev, [algo]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [algo]: false })), 2000);
    });
  }

  const hasResults = file && Object.keys(hashes).length > 0;

  // Case-insensitive comparison against an optional user-provided expected hash
  function getVerificationStatus(algo, hash) {
    if (!expectedHash.trim()) return null;
    const norm = expectedHash.trim().toLowerCase();
    if (hash.toLowerCase() === norm) return 'match';
    return 'nomatch';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">File Hash Calculator</h1>
        <p className="text-text-secondary">Compute MD5, SHA-1, SHA-256, SHA-512 digests for any file. All processing in-browser.</p>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border-subtle hover:border-accent rounded-md p-10 text-center cursor-pointer transition-micro"
      >
        <p className="text-text-secondary text-sm">Drop a file here or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Algorithm checkboxes */}
      <div className="flex flex-wrap gap-4">
        {ALGORITHMS.map(algo => (
          <label key={algo} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedAlgos[algo]}
              onChange={() => toggleAlgo(algo)}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-text-secondary text-sm font-mono">{algo}</span>
          </label>
        ))}
      </div>

      {/* Expected hash input */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">Expected Hash (optional)</label>
        <input
          type="text"
          value={expectedHash}
          onChange={e => setExpectedHash(e.target.value)}
          placeholder="Paste expected hash to verify"
          className="w-full bg-surface-1 border border-border-subtle text-text-primary rounded-md px-4 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {/* File metadata */}
      {file && (
        <div className="bg-surface-1 border border-border rounded-md p-4 space-y-1">
          <div className="flex gap-4 text-sm flex-wrap">
            <span className="text-text-secondary">Name: <span className="text-text-primary font-mono">{file.name}</span></span>
            <span className="text-text-secondary">Size: <span className="text-text-primary">{formatSize(file.size)}</span></span>
            <span className="text-text-secondary">Type: <span className="text-text-primary font-mono">{file.type || 'unknown'}</span></span>
          </div>
        </div>
      )}

      {/* Hashing spinner */}
      {hashing && (
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <svg className="animate-spin h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Computing hashes...
        </div>
      )}

      {/* Results table */}
      {hasResults && !hashing && (
        <div className="bg-surface-1 border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/50">
                <th className="px-4 py-2 text-left text-text-secondary font-medium w-24">Algorithm</th>
                <th className="px-4 py-2 text-left text-text-secondary font-medium">Hash</th>
                <th className="px-4 py-2 text-text-secondary font-medium w-24 text-center">Status</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {ALGORITHMS.filter(a => hashes[a] !== undefined).map(algo => {
                const hash = hashes[algo];
                const status = getVerificationStatus(algo, hash);
                return (
                  <tr key={algo} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-text-secondary font-mono">{algo}</td>
                    <td className="px-4 py-2 text-text-primary font-mono text-xs break-all">{hash}</td>
                    <td className="px-4 py-2 text-center">
                      {status === 'match' && (
                        <span className="text-status-success text-xs font-semibold">Match</span>
                      )}
                      {status === 'nomatch' && (
                        <span className="text-status-error text-xs font-semibold">No Match</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => copyHash(algo, hash)}
                        className="px-2 py-1 bg-surface-2 hover:bg-surface-3 text-text-primary text-xs rounded transition-micro"
                      >
                        {copied[algo] ? 'Copied!' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
