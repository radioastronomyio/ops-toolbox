/**
 * @file RegexTester.jsx
 * @description Interactive regex pattern tester with live match highlighting and capture group inspection
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

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

  // Recompile regex and rerun matches on debounced input changes
  useEffect(() => {
    // Build flag string from boolean map, e.g. { g: true, i: false } -> "g"
    const flagStr = Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join('');
    const { regex, error: compileError } = compileRegex(debouncedPattern, flagStr);
    if (compileError) {
      setError(compileError);
      setMatches([]);
      // On compile error, show full test string unhighlighted so user still sees their text
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
      <h1 className="text-2xl font-bold text-text-primary">Regex Tester</h1>

      {/* Pattern + flags */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-mono text-lg">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="pattern"
            className="flex-1 bg-bg border border-border rounded px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-accent"
          />
          <span className="text-text-secondary font-mono text-lg">/</span>
          <div className="flex items-center gap-3 ml-2">
            {['g', 'i', 'm', 's'].map(flag => (
              <label key={flag} className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id={`flag-${flag}`}
                  checked={flags[flag]}
                  onChange={() => toggleFlag(flag)}
                  className="accent-accent"
                />
                <span className="text-text-secondary font-mono">{flag}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-status-error text-sm">{error}</p>}
      </div>

      {/* Quick reference toggle */}
      <div>
        <button
          onClick={() => setShowRef(r => !r)}
          className="text-accent hover:text-accent-hover text-sm transition-micro"
        >
          Quick Reference {showRef ? '▲' : '▼'}
        </button>
        {showRef && (
          <div className="mt-2 bg-surface-1 rounded-md p-4 grid grid-cols-2 gap-2">
            {QUICK_REF.map(({ token, desc }) => (
              <div key={token} className="flex gap-2 text-sm">
                <code className="text-status-warning font-mono w-24 shrink-0">{token}</code>
                <span className="text-text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test string */}
      <div className="bg-surface-1 rounded-md p-4 space-y-3">
        <label className="block text-sm font-medium text-text-secondary">Test String</label>
        <textarea
          value={testString}
          onChange={e => setTestString(e.target.value)}
          placeholder="test string"
          rows={5}
          className="w-full bg-bg border border-border rounded px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-accent resize-y"
        />
      </div>

      {/* Highlighted output */}
      {testString && (
        <div className="bg-surface-1 rounded-md p-4 space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-text-secondary">Highlighted Matches</h2>
            <span className="bg-accent text-black text-xs px-2 py-0.5 rounded-full">
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="bg-bg rounded px-3 py-2 font-mono text-sm whitespace-pre-wrap break-all">
            {segments.map((seg, i) =>
              seg.isMatch ? (
                <mark key={i} className="bg-status-warning text-bg rounded">{seg.text}</mark>
              ) : (
                <span key={i} className="text-text-secondary">{seg.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Matches table */}
      {matches.length > 0 && (
        <div className="bg-surface-1 rounded-md p-4 space-y-3">
          <h2 className="text-sm font-medium text-text-secondary">Match Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary border-b border-border">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">Full Match</th>
                  <th className="text-left py-2 px-2">Index</th>
                  <th className="text-left py-2 px-2">Length</th>
                  <th className="text-left py-2 px-2">Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="text-text-secondary border-b border-border/50">
                    <td className="py-2 px-2 text-text-muted">{i + 1}</td>
                    <td className="py-2 px-2 font-mono text-status-warning">{m.fullMatch}</td>
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
