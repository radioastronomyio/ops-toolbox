import { useState, useMemo } from 'react';
import { parseCIDR, calculateSubnet } from '../lib/subnet.js';

export default function SubnetCalculator() {
  const [cidrInput, setCidrInput] = useState('10.0.0.0/16');

  const result = useMemo(() => {
    try {
      const { ip, prefix } = parseCIDR(cidrInput);
      return calculateSubnet(ip, prefix);
    } catch (error) {
      return null;
    }
  }, [cidrInput]);

  const fields = [
    { label: 'Network Address', value: result?.networkAddress },
    { label: 'Broadcast Address', value: result?.broadcastAddress },
    { label: 'Subnet Mask', value: result?.subnetMask },
    { label: 'First Usable Host', value: result?.firstHost },
    { label: 'Last Usable Host', value: result?.lastHost },
    { label: 'Total Usable Hosts', value: result?.totalHosts.toLocaleString(), highlight: true },
    { label: 'Prefix Length', value: result ? `/${result.prefixLength}` : null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Subnet Calculator</h1>
        <p className="text-slate-400">Enter a CIDR block to calculate network parameters.</p>
      </div>

      <div>
        <label htmlFor="cidr-input" className="block text-sm font-medium text-slate-300 mb-2">
          CIDR Notation
        </label>
        <input
          id="cidr-input"
          type="text"
          value={cidrInput}
          onChange={(e) => setCidrInput(e.target.value)}
          placeholder="e.g., 192.168.1.0/24"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {!result && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Invalid CIDR notation.</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div
              key={field.label}
              className={`p-4 rounded-lg border ${
                field.highlight
                  ? 'bg-sky-900/20 border-sky-500'
                  : 'bg-slate-800 border-slate-600'
              }`}
            >
              <p className="text-sm font-medium text-slate-400 mb-1">{field.label}</p>
              <p className="text-lg font-mono text-white">{field.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
