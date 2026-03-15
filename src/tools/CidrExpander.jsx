import { useState, useEffect, useRef } from 'react';
import { expandCIDR } from '../lib/subnet.js';

export default function CidrExpander() {
  const [input, setInput] = useState('192.168.1.0/24');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!input.trim()) {
        setResult(null);
        setError(null);
        return;
      }
      const r = expandCIDR(input.trim());
      if (!r) {
        setError('Invalid CIDR format');
        setResult(null);
      } else {
        setError(null);
        setResult(r);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  const handleCopy = async () => {
    if (!result?.ips) return;
    try {
      await navigator.clipboard.writeText(result.ips.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">CIDR Range Expander</h1>
        <p className="text-slate-400">Expand a CIDR block into its full IP range.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">CIDR Input</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. 192.168.1.0/24"
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-blue-500"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {result && (
        <>
          {/* Summary card */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {[
                ['Network', result.networkStr],
                ['Broadcast', result.broadcastStr],
                ['First Host', result.firstHostStr],
                ['Last Host', result.lastHostStr],
                ['Total IPs', result.totalIPs.toLocaleString()],
                ['Usable Hosts', result.hosts.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="text-white font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* IP list */}
          {result.ips ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  IP Addresses ({result.totalIPs.toLocaleString()})
                </h2>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                >
                  {copied ? 'Copied!' : 'Copy List'}
                </button>
              </div>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-300 max-h-80 overflow-y-auto">
                {result.ips.join('\n')}
              </pre>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-400">
              Range too large to enumerate ({result.totalIPs.toLocaleString()} IPs). Showing summary only.
            </div>
          )}
        </>
      )}
    </div>
  );
}
