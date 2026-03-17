/**
 * @file Base64Codec.jsx
 * @description Base64 encode/decode with UTF-8 support and real-time conversion via useMemo
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useMemo } from 'react';
import { encodeBase64, decodeBase64 } from '../lib/base64.js';

function Base64Codec() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'

  // Conversion runs synchronously on each input change — no button needed
  const { output, error, byteCount } = useMemo(() => {
    if (!inputText.trim()) {
      return { output: '', error: null, byteCount: 0 };
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeBase64(inputText);
        return { output: encoded, error: null, byteCount: new TextEncoder().encode(inputText).length };
      } else {
        const decoded = decodeBase64(inputText);
        return { output: decoded, error: null, byteCount: new TextEncoder().encode(decoded).length };
      }
    } catch (err) {
      return { output: '', error: err.message, byteCount: 0 };
    }
  }, [inputText, mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Base64 Codec</h1>
        <p className="text-text-secondary">
          Encode and decode Base64 strings. Supports UTF-8 text properly.
        </p>
      </div>

      <div className="flex items-center justify-center mb-4">
        <button
          onClick={toggleMode}
          className="px-6 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-md transition-micro"
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label htmlFor="base64-input" className="block text-sm font-medium text-text-secondary mb-2">
            {mode === 'encode' ? 'Input (Text)' : 'Input (Base64)'}
          </label>
          <textarea
            id="base64-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-surface-1 border border-border-subtle rounded-md text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4">
          <label htmlFor="base64-output" className="block text-sm font-medium text-text-secondary mb-2">
            {mode === 'encode' ? 'Output (Base64)' : 'Output (Text)'}
          </label>
          <div
            id="base64-output"
            className={`w-full h-96 px-4 py-3 rounded-md font-mono text-sm overflow-auto ${
              error
                ? 'bg-status-error/20 border-2 border-status-error text-status-error'
                : 'bg-surface-1 border border-border-subtle text-text-secondary'
            }`}
          >
            {error ? (
              <div className="whitespace-pre-wrap">{error}</div>
            ) : (
              <div>
                <pre className="whitespace-pre-wrap">{output}</pre>
                {output && (
                  <div className="mt-4 text-xs text-text-muted">
                    {byteCount} bytes
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Base64Codec;
