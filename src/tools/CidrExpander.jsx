/**
 * @file CidrExpander.jsx
 * @description CIDR range expander showing network summary and individual IP enumeration
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect } from 'react';
import { expandCIDR } from '../lib/subnet.js';
import { useClipboard } from '../hooks/useClipboard';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export default function CidrExpander() {
  const [input, setInput] = useState('192.168.1.0/24');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { copy, copied } = useClipboard();
  const debouncedInput = useDebouncedValue(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    const r = expandCIDR(debouncedInput.trim());
    if (!r) {
      setError('Invalid CIDR format');
      setResult(null);
    } else {
      setError(null);
      setResult(r);
    }
  }, [debouncedInput]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">CIDR Range Expander</h1>
        <p className="text-text-secondary">Expand a CIDR block into its full IP range.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">CIDR Input</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. 192.168.1.0/24"
          className="w-full bg-surface-1 border border-border-subtle text-text-primary rounded-md px-4 py-3 font-mono focus:outline-none focus:border-accent"
        />
        {error && <p className="text-status-error text-sm mt-2">{error}</p>}
      </div>

      {result && (
        <>
          {/* Summary card */}
          <div className="bg-surface-1 border border-border rounded-md p-4">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Summary</h2>
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
                  <dt className="text-text-secondary">{label}</dt>
                  <dd className="text-text-primary font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* IP list */}
          {result.ips ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  IP Addresses ({result.totalIPs.toLocaleString()})
                </h2>
                <button
                  onClick={() => copy(result.ips.join('\n'))}
                  className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-black rounded-md"
                >
                  {copied ? 'Copied!' : 'Copy List'}
                </button>
              </div>
              <pre className="bg-bg border border-border rounded-md p-4 text-sm font-mono text-text-secondary max-h-80 overflow-y-auto">
                {result.ips.join('\n')}
              </pre>
            </div>
          ) : (
            /* Large ranges (e.g. /8) skip enumeration to avoid freezing the browser */
            <div className="bg-surface-1 border border-border rounded-md p-4 text-text-secondary">
              Range too large to enumerate ({result.totalIPs.toLocaleString()} IPs). Showing summary only.
            </div>
          )}
        </>
      )}
    </div>
  );
}
