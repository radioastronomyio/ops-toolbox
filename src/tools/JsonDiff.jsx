import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { parseJson, computeDiff, renderDiffHtml } from '../lib/jsonDiff';

export default function JsonDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diffHtml, setDiffHtml] = useState(null);
  const [delta, setDelta] = useState(null);
  const [leftError, setLeftError] = useState('');
  const [rightError, setRightError] = useState('');
  const [identical, setIdentical] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  function handleCompare() {
    const leftVal = left.trim() ? left : '{}';
    const rightVal = right.trim() ? right : '{}';

    const lResult = parseJson(leftVal);
    const rResult = parseJson(rightVal);

    setLeftError(lResult.error || '');
    setRightError(rResult.error || '');

    if (lResult.error || rResult.error) {
      setDiffHtml(null);
      setDelta(null);
      setIdentical(false);
      return;
    }

    const d = computeDiff(lResult.value, rResult.value);
    setDelta(d);

    if (!d) {
      setIdentical(true);
      setDiffHtml(null);
    } else {
      setIdentical(false);
      const html = renderDiffHtml(lResult.value, d);
      setDiffHtml(html);
    }
  }

  function handleSwap() {
    setLeft(right);
    setRight(left);
    setDiffHtml(null);
    setDelta(null);
    setIdentical(false);
    setLeftError('');
    setRightError('');
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">JSON Diff</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Original</label>
          <textarea
            value={left}
            onChange={e => setLeft(e.target.value)}
            placeholder="Original JSON..."
            rows={12}
            className="w-full font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-y"
          />
          {leftError && <p className="text-xs text-red-400">{leftError}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Modified</label>
          <textarea
            value={right}
            onChange={e => setRight(e.target.value)}
            placeholder="Modified JSON..."
            rows={12}
            className="w-full font-mono text-sm bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-y"
          />
          {rightError && <p className="text-xs text-red-400">{rightError}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
        >
          Compare
        </button>
        <button
          onClick={handleSwap}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium"
        >
          Swap
        </button>
      </div>

      {identical && (
        <div className="px-4 py-3 bg-slate-800 border border-slate-600 rounded text-slate-300">
          Identical — no differences found
        </div>
      )}

      {diffHtml && (
        <div className="space-y-3">
          <div
            data-testid="diff-output"
            className="bg-slate-900 border border-slate-700 rounded p-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(diffHtml) }}
          />

          <div>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              {showRaw ? 'Hide' : 'Show'} raw delta
            </button>
            {showRaw && (
              <pre className="mt-2 bg-slate-900 border border-slate-700 rounded p-4 text-xs font-mono text-slate-300 overflow-auto">
                {JSON.stringify(delta, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
