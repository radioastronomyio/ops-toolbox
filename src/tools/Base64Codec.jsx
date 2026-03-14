import { useState, useMemo } from 'react';
import { encodeBase64, decodeBase64 } from '../lib/base64.js';

function Base64Codec() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'

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
        <h1 className="text-2xl font-bold text-white mb-2">Base64 Codec</h1>
        <p className="text-slate-400">
          Encode and decode Base64 strings. Supports UTF-8 text properly.
        </p>
      </div>

      <div className="flex items-center justify-center mb-4">
        <button
          onClick={toggleMode}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label htmlFor="base64-input" className="block text-sm font-medium text-slate-300 mb-2">
            {mode === 'encode' ? 'Input (Text)' : 'Input (Base64)'}
          </label>
          <textarea
            id="base64-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4">
          <label htmlFor="base64-output" className="block text-sm font-medium text-slate-300 mb-2">
            {mode === 'encode' ? 'Output (Base64)' : 'Output (Text)'}
          </label>
          <div
            id="base64-output"
            className={`w-full h-96 px-4 py-3 rounded-lg font-mono text-sm overflow-auto ${
              error
                ? 'bg-red-900/20 border-2 border-red-500 text-red-400'
                : 'bg-slate-800 border border-slate-600 text-slate-300'
            }`}
          >
            {error ? (
              <div className="whitespace-pre-wrap">{error}</div>
            ) : (
              <div>
                <pre className="whitespace-pre-wrap">{output}</pre>
                {output && (
                  <div className="mt-4 text-xs text-slate-500">
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
