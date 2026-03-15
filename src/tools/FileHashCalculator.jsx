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

  async function computeHashes(f, algos) {
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

  function getVerificationStatus(algo, hash) {
    if (!expectedHash.trim()) return null;
    const norm = expectedHash.trim().toLowerCase();
    if (hash.toLowerCase() === norm) return 'match';
    return 'nomatch';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">File Hash Calculator</h1>
        <p className="text-slate-400">Compute MD5, SHA-1, SHA-256, SHA-512 digests for any file. All processing in-browser.</p>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg p-10 text-center cursor-pointer transition-colors"
      >
        <p className="text-slate-400 text-sm">Drop a file here or click to browse</p>
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
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-slate-300 text-sm font-mono">{algo}</span>
          </label>
        ))}
      </div>

      {/* Expected hash input */}
      <div>
        <label className="block text-slate-400 text-sm mb-1">Expected Hash (optional)</label>
        <input
          type="text"
          value={expectedHash}
          onChange={e => setExpectedHash(e.target.value)}
          placeholder="Paste expected hash to verify"
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* File metadata */}
      {file && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-1">
          <div className="flex gap-4 text-sm flex-wrap">
            <span className="text-slate-400">Name: <span className="text-white font-mono">{file.name}</span></span>
            <span className="text-slate-400">Size: <span className="text-white">{formatSize(file.size)}</span></span>
            <span className="text-slate-400">Type: <span className="text-white font-mono">{file.type || 'unknown'}</span></span>
          </div>
        </div>
      )}

      {/* Hashing spinner */}
      {hashing && (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Computing hashes...
        </div>
      )}

      {/* Results table */}
      {hasResults && !hashing && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-700/50">
                <th className="px-4 py-2 text-left text-slate-400 font-medium w-24">Algorithm</th>
                <th className="px-4 py-2 text-left text-slate-400 font-medium">Hash</th>
                <th className="px-4 py-2 text-slate-400 font-medium w-24 text-center">Status</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {ALGORITHMS.filter(a => hashes[a] !== undefined).map(algo => {
                const hash = hashes[algo];
                const status = getVerificationStatus(algo, hash);
                return (
                  <tr key={algo} className="border-b border-slate-700 last:border-0">
                    <td className="px-4 py-2 text-slate-300 font-mono">{algo}</td>
                    <td className="px-4 py-2 text-white font-mono text-xs break-all">{hash}</td>
                    <td className="px-4 py-2 text-center">
                      {status === 'match' && (
                        <span className="text-green-400 text-xs font-semibold">Match</span>
                      )}
                      {status === 'nomatch' && (
                        <span className="text-red-400 text-xs font-semibold">No Match</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => copyHash(algo, hash)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
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
