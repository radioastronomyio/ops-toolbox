import { useState, useEffect } from 'react';
import { generatePassword, calculateEntropy, buildCharset } from '../lib/password.js';

export default function PasswordGenerator() {
  const [length, setLength] = useState(24);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numeric, setNumeric] = useState(true);
  const [special, setSpecial] = useState(true);

  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Auto-generate on mount and when settings change
  useEffect(() => {
    const options = { uppercase, lowercase, numeric, special };
    const charset = buildCharset(options);

    if (length && charset) {
      try {
        const newPassword = generatePassword(length, options);
        setPassword(newPassword);
        setEntropy(calculateEntropy(newPassword.length, charset.length));
        setError(null);
      } catch (err) {
        setError(err.message);
        setPassword('');
        setEntropy(0);
      }
    } else {
      setError('Enable at least one character set');
      setPassword('');
      setEntropy(0);
    }
  }, [length, uppercase, lowercase, numeric, special]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Regenerate
  const handleRegenerate = () => {
    try {
      const options = { uppercase, lowercase, numeric, special };
      const charset = buildCharset(options);
      const newPassword = generatePassword(length, options);
      setPassword(newPassword);
      setEntropy(calculateEntropy(newPassword.length, charset.length));
      setError(null);
    } catch (err) {
      setError(err.message);
      setPassword('');
      setEntropy(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Password Generator</h1>
        <p className="text-slate-400">Generate cryptographically secure random passwords using Web Crypto API.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel: Controls */}
        <div className="space-y-6">
          {/* Length slider */}
          <div>
            <label htmlFor="length-slider" className="block text-sm font-medium text-slate-300 mb-2">
              Password Length
            </label>
            <input
              id="length-slider"
              type="range"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-400">{length} characters</span>
            </div>
          </div>

          {/* Character pool toggles */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUppercase(!uppercase)}
                className={`px-4 py-2 rounded-lg font-mono ${
                  uppercase ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                Uppercase
              </button>
              <button
                onClick={() => setLowercase(!lowercase)}
                className={`px-4 py-2 rounded-lg font-mono ${
                  lowercase ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                Lowercase
              </button>
              <button
                onClick={() => setNumeric(!numeric)}
                className={`px-4 py-2 rounded-lg font-mono ${
                  numeric ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                0-9
              </button>
              <button
                onClick={() => setSpecial(!special)}
                className={`px-4 py-2 rounded-lg font-mono ${
                  special ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                !@#$%^&*()
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                disabled={!password || copied}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 border-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleRegenerate}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white rounded-lg font-medium"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Right panel: Output */}
        <div className="space-y-4">
          {error && (
            <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!password && !error && (
            <div className="p-6 bg-slate-800 border border-slate-600 rounded-lg text-slate-400">
              <p>Adjust settings and click Regenerate to create a password.</p>
            </div>
          )}

          {password && (
            <>
              {/* Generated password */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Generated Password</h2>
                <p className="text-slate-400 text-sm mb-2">Click "Copy to Clipboard" to copy.</p>
              </div>

              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                <pre className="bg-slate-900 border-slate-700 rounded-lg p-4 overflow-x-auto text-sm font-mono text-white break-all">
                  {password}
                </pre>
              </div>

              {/* Entropy */}
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-300 mb-2">Password Entropy</h3>
                <p className="text-4xl font-bold text-emerald-400 mb-2">{entropy} bits</p>
                <p className="text-sm text-slate-400">
                  {entropy >= 80 ? (
                    <span className="text-emerald-400">Strong password</span>
                  ) : entropy >= 60 ? (
                    <span className="text-yellow-400">Moderate password</span>
                  ) : (
                    <span className="text-red-400">Weak password</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
