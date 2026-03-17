import { useState, useEffect } from 'react';
import { parseURL } from '../lib/url-parser.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const DEFAULT_URL = 'https://example.com:8080/path/to/page?key=value&foo=bar#section';

const FIELDS = [
  ['Protocol', 'protocol'],
  ['Hostname', 'hostname'],
  ['Port', 'port'],
  ['Path', 'pathname'],
  ['Query String', 'search'],
  ['Hash', 'hash'],
  ['Origin', 'origin'],
  ['Username', 'username'],
];

export default function UrlParser() {
  const [input, setInput] = useState(DEFAULT_URL);
  const [result, setResult] = useState(() => parseURL(DEFAULT_URL));
  const [error, setError] = useState(null);
  const debouncedInput = useDebouncedValue(input, 200);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    const r = parseURL(debouncedInput);
    if (!r) {
      setError('Invalid URL format');
      setResult(null);
    } else {
      setError(null);
      setResult(r);
    }
  }, [debouncedInput]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">URL Parser</h1>
        <p className="text-slate-400">Inspect URL components — protocol, host, path, query params, and hash.</p>
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="https://example.com/path?key=value#hash"
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          {/* Core fields */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {FIELDS.map(([label, key]) => (
                  result[key] !== undefined && (
                    <tr key={key} className="border-b border-slate-700 last:border-0">
                      <td className="px-4 py-2 text-slate-400 w-36 font-medium">{label}</td>
                      <td className="px-4 py-2 text-white font-mono break-all">
                        {result[key] || <span className="text-slate-500">(empty)</span>}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>

          {/* Search params */}
          {Object.keys(result.searchParams).length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-slate-700/50 text-xs text-slate-400 uppercase font-medium">
                Search Parameters
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(result.searchParams).map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-700 last:border-0">
                      <td className="px-4 py-2 text-blue-400 font-mono w-1/3">{k}</td>
                      <td className="px-4 py-2 text-white font-mono break-all">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
