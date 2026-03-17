/**
 * @file MacVendorLookup.jsx
 * @description MAC address vendor lookup using remote API (api.donfather.dev) for OUI-to-vendor resolution
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState } from 'react';
import { normalizeMac, extractOUI, isValidMac } from '../lib/mac.js';

export default function MacVendorLookup() {
  const [input, setInput] = useState('');
  const [normalizedMac, setNormalizedMac] = useState(null);
  const [oui, setOui] = useState(null);
  const [vendor, setVendor] = useState(null);
  // Status tracks the API request lifecycle: loading → success | notfound | unavailable | invalid
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLookup = async (e) => {
    e?.preventDefault();

    if (!isValidMac(input)) {
      setStatus('invalid');
      setErrorMsg('Invalid MAC address format');
      setNormalizedMac(null);
      setOui(null);
      setVendor(null);
      return;
    }

    const mac = normalizeMac(input);
    const ouiPrefix = extractOUI(mac);
    setNormalizedMac(mac);
    setOui(ouiPrefix);
    setVendor(null);
    setErrorMsg(null);
    setStatus('loading');

    // Only the 3-byte OUI prefix is sent to the API — no full MAC transmitted
    try {
      const response = await fetch(`https://api.donfather.dev/api/mac-lookup/${ouiPrefix}`);
      if (response.ok) {
        const data = await response.json();
        setVendor(data.vendor);
        setStatus('success');
      } else if (response.status === 404) {
        setStatus('notfound');
      } else {
        setStatus('unavailable');
      }
    } catch {
      setStatus('unavailable');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">MAC Vendor Lookup</h1>
        <p className="text-text-secondary">Look up the manufacturer for a MAC address via OUI prefix.</p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. AA:BB:CC:DD:EE:FF"
          className="flex-1 bg-surface-1 border border-border-subtle text-text-primary rounded-md px-4 py-3 font-mono focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-accent hover:bg-accent-hover text-black rounded-md font-medium"
        >
          Lookup
        </button>
      </form>

      {status === 'invalid' && (
        <div className="bg-status-error/20 border border-status-error rounded-md p-4">
          <p className="text-status-error">{errorMsg}</p>
        </div>
      )}

      {(normalizedMac || status === 'loading') && status !== 'invalid' && (
        <div className="bg-surface-1 border border-border rounded-md p-4 space-y-3">
          {normalizedMac && (
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-text-secondary">Normalized MAC</dt>
                <dd className="text-text-primary font-mono">{normalizedMac}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">OUI Prefix</dt>
                <dd className="text-text-primary font-mono">{oui}</dd>
              </div>
              {status === 'loading' && (
                <div className="text-text-secondary">Looking up vendor...</div>
              )}
              {status === 'success' && vendor && (
                <div>
                  <dt className="text-text-secondary">Vendor</dt>
                  <dd className="text-status-success font-semibold">{vendor}</dd>
                </div>
              )}
              {status === 'notfound' && (
                <p className="text-status-warning">No vendor found for this OUI prefix</p>
              )}
              {status === 'unavailable' && (
                <p className="text-text-secondary">
                  Vendor lookup API is not available. This feature requires api.donfather.dev which may not be deployed yet.
                </p>
              )}
            </dl>
          )}
        </div>
      )}

      <p className="text-xs text-text-muted">
        Note: This tool queries api.donfather.dev for vendor data. No user data is transmitted — only the OUI prefix is sent.
      </p>
    </div>
  );
}
