import React, { useState, useEffect } from 'react';
import { compileRegex, runMatches, buildHighlightSegments } from '../lib/regexTester.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const QUICK_REF = [
  { token: '.', desc: 'Any character except newline' },
  { token: '\\d', desc: 'Digit [0-9]' },
  { token: '\\D', desc: 'Non-digit' },
  { token: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
  { token: '\\W', desc: 'Non-word char' },
  { token: '\\s', desc: 'Whitespace' },
  { token: '\\S', desc: 'Non-whitespace' },
  { token: '^', desc: 'Start of string/line' },
  { token: '$', desc: 'End of string/line' },
  { token: '*', desc: '0 or more' },
  { token: '+', desc: '1 or more' },
  { token: '?', desc: '0 or 1 (optional)' },
  { token: '{n,m}', desc: 'Between n and m times' },
  { token: '[abc]', desc: 'Character class' },
  { token: '(abc)', desc: 'Capture group' },
  { token: '(?:abc)', desc: 'Non-capture group' },
  { token: '(?<name>)', desc: 'Named capture group' },
  { token: 'a|b', desc: 'Alternation (a or b)' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [segments, setSegments] = useState([]);
  const [error, setError] = useState(null);
  const [showRef, setShowRef] = useState(false);
  const debouncedPattern = useDebouncedValue(pattern, 150);
  const debouncedTestString = useDebouncedValue(testString, 150);

  useEffect(() => {
    const flagStr = Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join('');
    const { regex, error: compileError } = compileRegex(debouncedPattern, flagStr);
    if (compileError) {
      setError(compileError);
      setMatches([]);
      setSegments(debouncedTestString ? [{ text: debouncedTestString, isMatch: false, groupIndex: null }] : []);
      return;
    }
    setError(null);
    const { matches: m } = runMatches(regex, debouncedTestString);
    setMatches(m);
    setSegments(buildHighlightSegments(debouncedTestString, m));
  }, [debouncedPattern, debouncedTestString, flags]);

  const toggleFlag = (flag) => setFlags(f => ({ ...f, [flag]: !f[flag] }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Regex Tester</h1>

      {/* Pattern + flags */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-lg">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="pattern"
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 font-mono text-lg">/</span>
          <div className="flex items-center gap-3 ml-2">
            {['g', 'i', 'm', 's'].map(flag => (
              <label key={flag} className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id={`flag-${flag}`}
                  checked={flags[flag]}
                  onChange={() => toggleFlag(flag)}
                  className="accent-blue-500"
                />
                <span className="text-slate-300 font-mono">{flag}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {/* Quick reference toggle */}
      <div>
        <button
          onClick={() => setShowRef(r => !r)}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Quick Reference {showRef ? '▲' : '▼'}
        </button>
        {showRef && (
          <div className="mt-2 bg-slate-800 rounded-lg p-4 grid grid-cols-2 gap-2">
            {QUICK_REF.map(({ token, desc }) => (
              <div key={token} className="flex gap-2 text-sm">
                <code className="text-yellow-400 font-mono w-24 shrink-0">{token}</code>
                <span className="text-slate-400">{desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test string */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-slate-300">Test String</label>
        <textarea
          value={testString}
          onChange={e => setTestString(e.target.value)}
          placeholder="test string"
          rows={5}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500 resize-y"
        />
      </div>

      {/* Highlighted output */}
      {testString && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-slate-400">Highlighted Matches</h2>
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="bg-slate-900 rounded px-3 py-2 font-mono text-sm whitespace-pre-wrap break-all">
            {segments.map((seg, i) =>
              seg.isMatch ? (
                <mark key={i} className="bg-yellow-400 text-slate-900 rounded">{seg.text}</mark>
              ) : (
                <span key={i} className="text-slate-300">{seg.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Matches table */}
      {matches.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-medium text-slate-400">Match Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">Full Match</th>
                  <th className="text-left py-2 px-2">Index</th>
                  <th className="text-left py-2 px-2">Length</th>
                  <th className="text-left py-2 px-2">Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="text-slate-300 border-b border-slate-700/50">
                    <td className="py-2 px-2 text-slate-500">{i + 1}</td>
                    <td className="py-2 px-2 font-mono text-yellow-400">{m.fullMatch}</td>
                    <td className="py-2 px-2 font-mono">{m.index}</td>
                    <td className="py-2 px-2 font-mono">{m.fullMatch.length}</td>
                    <td className="py-2 px-2 font-mono text-xs">
                      {m.namedGroups
                        ? JSON.stringify(m.namedGroups)
                        : m.groups.length > 0
                        ? JSON.stringify(m.groups)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
