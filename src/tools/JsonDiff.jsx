/**
 * @file JsonDiff.jsx
 * @description Side-by-side JSON structural diff viewer with sanitized HTML output via DOMPurify
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

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
    // Default to empty objects so diffing still works with one side blank
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
      <h1 className="text-2xl font-bold text-text-primary">JSON Diff</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-secondary">Original</label>
          <textarea
            value={left}
            onChange={e => setLeft(e.target.value)}
            placeholder="Original JSON..."
            rows={12}
            className="w-full font-mono text-sm bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-y"
          />
          {leftError && <p className="text-xs text-status-error">{leftError}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-secondary">Modified</label>
          <textarea
            value={right}
            onChange={e => setRight(e.target.value)}
            placeholder="Modified JSON..."
            rows={12}
            className="w-full font-mono text-sm bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-y"
          />
          {rightError && <p className="text-xs text-status-error">{rightError}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-black rounded font-medium"
        >
          Compare
        </button>
        <button
          onClick={handleSwap}
          className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text-primary rounded font-medium"
        >
          Swap
        </button>
      </div>

      {identical && (
        <div className="px-4 py-3 bg-surface-1 border border-border-subtle rounded text-text-secondary">
          Identical — no differences found
        </div>
      )}

      {diffHtml && (
        <div className="space-y-3">
          <div
            data-testid="diff-output"
            className="bg-bg border border-border rounded p-4 overflow-auto"
            /* Diff HTML is sanitized to prevent XSS from pasted JSON values */
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(diffHtml) }}
          />

          <div>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-accent hover:text-accent-hover"
            >
              {showRaw ? 'Hide' : 'Show'} raw delta
            </button>
            {showRaw && (
              <pre className="mt-2 bg-bg border border-border rounded p-4 text-xs font-mono text-text-secondary overflow-auto">
                {JSON.stringify(delta, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
