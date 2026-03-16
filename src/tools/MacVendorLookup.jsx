import { useState } from 'react';
import { normalizeMac, extractOUI, isValidMac } from '../lib/mac.js';

export default function MacVendorLookup() {
  const [input, setInput] = useState('');
  const [normalizedMac, setNormalizedMac] = useState(null);
  const [oui, setOui] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [status, setStatus] = useState(null); // 'loading'|'success'|'notfound'|'unavailable'|'invalid'|null
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
        <h1 className="text-2xl font-bold text-white mb-2">MAC Vendor Lookup</h1>
        <p className="text-slate-400">Look up the manufacturer for a MAC address via OUI prefix.</p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. AA:BB:CC:DD:EE:FF"
          className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
        >
          Lookup
        </button>
      </form>

      {status === 'invalid' && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{errorMsg}</p>
        </div>
      )}

      {(normalizedMac || status === 'loading') && status !== 'invalid' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          {normalizedMac && (
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-400">Normalized MAC</dt>
                <dd className="text-white font-mono">{normalizedMac}</dd>
              </div>
              <div>
                <dt className="text-slate-400">OUI Prefix</dt>
                <dd className="text-white font-mono">{oui}</dd>
              </div>
              {status === 'loading' && (
                <div className="text-slate-400">Looking up vendor...</div>
              )}
              {status === 'success' && vendor && (
                <div>
                  <dt className="text-slate-400">Vendor</dt>
                  <dd className="text-emerald-400 font-semibold">{vendor}</dd>
                </div>
              )}
              {status === 'notfound' && (
                <p className="text-yellow-400">No vendor found for this OUI prefix</p>
              )}
              {status === 'unavailable' && (
                <p className="text-slate-400">
                  Vendor lookup API is not available. This feature requires api.donfather.dev which may not be deployed yet.
                </p>
              )}
            </dl>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Note: This tool queries api.donfather.dev for vendor data. No user data is transmitted — only the OUI prefix is sent.
      </p>
    </div>
  );
}
