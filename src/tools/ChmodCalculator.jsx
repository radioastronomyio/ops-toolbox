import { useState } from 'react';
import { octalToPermissions, permissionsToOctal, permissionsToSymbolic, symbolicToPermissions } from '../lib/chmod.js';

const PRESETS = ['777', '755', '644', '600', '400'];
const DEFAULT = '755';

const ENTITIES = ['owner', 'group', 'other'];
const BITS = ['read', 'write', 'execute'];

function makeState(octalStr) {
  const perms = octalToPermissions(octalStr);
  if (!perms) return null;
  return {
    octal: perms.octal,
    symbolic: perms.symbolic,
    owner: perms.owner,
    group: perms.group,
    other: perms.other,
  };
}

export default function ChmodCalculator() {
  const [state, setState] = useState(() => makeState(DEFAULT));
  const [octalInput, setOctalInput] = useState(DEFAULT);
  const [symbolicInput, setSymbolicInput] = useState('rwxr-xr-x');
  const [octalError, setOctalError] = useState(null);
  const [symbolicError, setSymbolicError] = useState(null);

  function applyOctal(val) {
    const trimmed = val.trim();
    setOctalInput(trimmed);
    if (!/^[0-7]{1,3}$/.test(trimmed)) {
      setOctalError('Enter 1–3 octal digits (0–7)');
      return;
    }
    const s = makeState(trimmed);
    if (!s) {
      setOctalError('Invalid octal value');
      return;
    }
    setOctalError(null);
    setSymbolicError(null);
    setState(s);
    setSymbolicInput(s.symbolic);
  }

  function applySymbolic(val) {
    setSymbolicInput(val);
    if (val.length !== 9) {
      setSymbolicError('Must be exactly 9 characters (e.g. rwxr-xr-x)');
      return;
    }
    if (!/^[r\-][w\-][x\-][r\-][w\-][x\-][r\-][w\-][x\-]$/.test(val)) {
      setSymbolicError('Invalid symbolic format');
      return;
    }
    const perms = symbolicToPermissions(val);
    const octal = permissionsToOctal(perms);
    const symbolic = permissionsToSymbolic(perms);
    setSymbolicError(null);
    setOctalError(null);
    setState({ octal, symbolic, ...perms });
    setOctalInput(octal);
  }

  function applyPreset(preset) {
    const s = makeState(preset);
    if (!s) return;
    setState(s);
    setOctalInput(s.octal);
    setSymbolicInput(s.symbolic);
    setOctalError(null);
    setSymbolicError(null);
  }

  function toggleBit(entity, bit) {
    const newPerms = {
      owner: { ...state.owner },
      group: { ...state.group },
      other: { ...state.other },
    };
    newPerms[entity][bit] = !newPerms[entity][bit];
    const octal = permissionsToOctal(newPerms);
    const symbolic = permissionsToSymbolic(newPerms);
    setState({ octal, symbolic, ...newPerms });
    setOctalInput(octal);
    setSymbolicInput(symbolic);
    setOctalError(null);
    setSymbolicError(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Chmod Calculator</h1>
        <p className="text-slate-400">Bidirectional Unix permission converter: octal ↔ symbolic with interactive checkbox grid.</p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded font-mono transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Octal</label>
          <input
            type="text"
            value={octalInput}
            onChange={e => applyOctal(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
            maxLength={3}
          />
          {octalError && <p className="text-red-400 text-xs mt-1">{octalError}</p>}
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Symbolic</label>
          <input
            type="text"
            value={symbolicInput}
            onChange={e => applySymbolic(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-500"
            maxLength={9}
          />
          {symbolicError && <p className="text-red-400 text-xs mt-1">{symbolicError}</p>}
        </div>
      </div>

      {/* Checkbox grid */}
      {state && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-2 text-left text-slate-400 font-medium w-24"></th>
                <th className="px-4 py-2 text-center text-slate-400 font-medium">Read</th>
                <th className="px-4 py-2 text-center text-slate-400 font-medium">Write</th>
                <th className="px-4 py-2 text-center text-slate-400 font-medium">Execute</th>
              </tr>
            </thead>
            <tbody>
              {ENTITIES.map(entity => (
                <tr key={entity} className="border-b border-slate-700 last:border-0">
                  <td className="px-4 py-3 text-slate-300 font-medium capitalize">{entity}</td>
                  {BITS.map(bit => (
                    <td key={bit} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={state[entity][bit]}
                        onChange={() => toggleBit(entity, bit)}
                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {state && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-wrap gap-6">
          <div>
            <span className="text-slate-400 text-xs uppercase">Octal</span>
            <p className="text-white font-mono text-2xl mt-1">{state.octal}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase">Symbolic</span>
            <p className="text-white font-mono text-2xl mt-1">{state.symbolic}</p>
          </div>
        </div>
      )}
    </div>
  );
}
