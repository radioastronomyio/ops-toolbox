import React, { useState, useEffect } from 'react';
import { encodeComponent, decodeComponent, parseUrl, buildUrl, parseQueryString } from '../lib/urlEncoder';
import { useClipboard } from '../hooks/useClipboard';

export default function UrlQueryEncoder() {
  const [activeTab, setActiveTab] = useState('encode');

  // Encode/Decode tab
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeMode, setEncodeMode] = useState('encode');
  const [encodeOutput, setEncodeOutput] = useState('');
  const [encodeError, setEncodeError] = useState('');
  const encodeCb = useClipboard();

  // URL Parser tab
  const [urlInput, setUrlInput] = useState('');
  const [parsedUrl, setParsedUrl] = useState(null);
  const [parseError, setParseError] = useState('');

  // Query Builder tab
  const [baseUrl, setBaseUrl] = useState('https://api.example.com/v1/endpoint');
  const [rows, setRows] = useState([{ key: '', value: '' }]);
  const [builtUrl, setBuiltUrl] = useState('');
  const [buildError, setBuildError] = useState('');
  const buildCb = useClipboard();

  // Real-time encode/decode
  useEffect(() => {
    if (!encodeInput) {
      setEncodeOutput('');
      setEncodeError('');
      return;
    }
    if (encodeMode === 'encode') {
      setEncodeOutput(encodeComponent(encodeInput));
      setEncodeError('');
    } else {
      const { decoded, error } = decodeComponent(encodeInput);
      if (error) {
        setEncodeError(error);
        setEncodeOutput('');
      } else {
        setEncodeOutput(decoded);
        setEncodeError('');
      }
    }
  }, [encodeInput, encodeMode]);

  function handleParseUrl() {
    const result = parseUrl(urlInput);
    if (result.error) {
      setParseError(result.error);
      setParsedUrl(null);
    } else {
      setParseError('');
      setParsedUrl(result);
    }
  }

  function handleBuildUrl() {
    try {
      const url = new URL(baseUrl);
      rows.forEach(r => { if (r.key) url.searchParams.append(r.key, r.value); });
      const result = url.toString();
      setBuiltUrl(result);
      setBuildError('');
    } catch (e) {
      setBuildError(e.message);
      setBuiltUrl('');
    }
  }

  function addRow() {
    setRows([...rows, { key: '', value: '' }]);
  }

  function removeRow(idx) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  function updateRow(idx, field, val) {
    setRows(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  }

  const tabs = [
    { id: 'encode', label: 'Encode / Decode' },
    { id: 'parser', label: 'URL Parser' },
    { id: 'builder', label: 'Query Builder' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">URL Query Encoder</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Encode/Decode Tab */}
      {activeTab === 'encode' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setEncodeMode('encode')}
              className={`px-3 py-1.5 rounded text-sm font-medium border ${
                encodeMode === 'encode'
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setEncodeMode('decode')}
              className={`px-3 py-1.5 rounded text-sm font-medium border ${
                encodeMode === 'decode'
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Decode
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-400">Input</label>
            <textarea
              value={encodeInput}
              onChange={e => setEncodeInput(e.target.value)}
              placeholder={encodeMode === 'encode' ? 'Enter text to encode...' : 'Enter encoded string to decode...'}
              rows={4}
              className="w-full font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-y"
            />
          </div>

          {encodeError && (
            <p className="text-sm text-red-400">{encodeError}</p>
          )}

          {encodeOutput && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-slate-400">Output</label>
                <button
                  onClick={() => encodeCb.copy(encodeOutput)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs"
                >
                  {encodeCb.copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-emerald-400 break-all">
                {encodeOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Parser Tab */}
      {activeTab === 'parser' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleParseUrl()}
              placeholder="https://example.com/path?q=test#section"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleParseUrl}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
            >
              Parse
            </button>
          </div>

          {parseError && <p className="text-sm text-red-400">{parseError}</p>}

          {parsedUrl && (
            <div className="space-y-4">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Protocol', parsedUrl.protocol],
                    ['Hostname', parsedUrl.hostname],
                    ['Port', parsedUrl.port || '—'],
                    ['Pathname', parsedUrl.pathname],
                    ['Search', parsedUrl.search || '—'],
                    ['Hash', parsedUrl.hash || '—'],
                  ].map(([key, val]) => (
                    <tr key={key} className="border-b border-slate-700">
                      <td className="py-2 pr-4 text-slate-400 font-medium w-28">{key}</td>
                      <td className="py-2 font-mono text-slate-200">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {Object.keys(parsedUrl.params).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-300">Query Parameters</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 text-left text-slate-400 font-medium">Key</th>
                        <th className="py-2 text-left text-slate-400 font-medium">Raw</th>
                        <th className="py-2 text-left text-slate-400 font-medium">Decoded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseQueryString(parsedUrl.search).map((p, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          <td className="py-2 pr-4 font-mono text-slate-200">{p.key}</td>
                          <td className="py-2 pr-4 font-mono text-slate-400">{p.encoded}</td>
                          <td className="py-2 font-mono text-slate-200">{p.decoded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Query Builder Tab */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm text-slate-400">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">Parameters</h3>
              <button
                onClick={addRow}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
              >
                Add Row
              </button>
            </div>

            {rows.map((row, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={row.key}
                  onChange={e => updateRow(idx, 'key', e.target.value)}
                  placeholder="key"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={e => updateRow(idx, 'value', e.target.value)}
                  placeholder="value"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => removeRow(idx)}
                  disabled={rows.length === 1}
                  className="px-2 py-1.5 text-slate-400 hover:text-red-400 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleBuildUrl}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
          >
            Build URL
          </button>

          {buildError && <p className="text-sm text-red-400">{buildError}</p>}

          {builtUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-slate-400">Result</label>
                <button
                  onClick={() => buildCb.copy(builtUrl)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs"
                >
                  {buildCb.copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-emerald-400 break-all">
                {builtUrl}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
