import { useState, useEffect } from 'react';
import { generatePassword, calculateEntropy, buildCharset, generatePassphrase, calculatePassphraseEntropy } from '../lib/password.js';
import { EFF_SHORT_WORDLIST } from '../lib/wordlist.js';
import { useClipboard } from '../hooks/useClipboard';
import ErrorBanner from '../components/ErrorBanner';

const SEPARATOR_OPTIONS = [
  { label: 'Hyphen (-)', value: '-' },
  { label: 'Dot (.)', value: '.' },
  { label: 'Underscore (_)', value: '_' },
  { label: 'Space ( )', value: ' ' },
  { label: 'None', value: '' },
];

export default function PasswordGenerator() {
  const [mode, setMode] = useState('password'); // 'password' | 'passphrase'

  // Password mode state
  const [length, setLength] = useState(24);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numeric, setNumeric] = useState(true);
  const [special, setSpecial] = useState(true);

  // Passphrase mode state
  const [wordCount, setWordCount] = useState(6);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(false);

  const [output, setOutput] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [error, setError] = useState(null);
  const { copy, copied } = useClipboard();

  useEffect(() => {
    if (mode === 'password') {
      const options = { uppercase, lowercase, numeric, special };
      const charset = buildCharset(options);
      if (length && charset) {
        try {
          const pw = generatePassword(length, options);
          setOutput(pw);
          setEntropy(calculateEntropy(pw.length, charset.length));
          setError(null);
        } catch (err) {
          setError(err.message);
          setOutput('');
          setEntropy(0);
        }
      } else {
        setError('Enable at least one character set');
        setOutput('');
        setEntropy(0);
      }
    } else {
      const phrase = generatePassphrase(wordCount, separator, capitalize);
      setOutput(phrase);
      setEntropy(calculatePassphraseEntropy(wordCount, EFF_SHORT_WORDLIST.length));
      setError(null);
    }
  }, [mode, length, uppercase, lowercase, numeric, special, wordCount, separator, capitalize]);

  const handleRegenerate = () => {
    if (mode === 'password') {
      const options = { uppercase, lowercase, numeric, special };
      const charset = buildCharset(options);
      if (charset) {
        const pw = generatePassword(length, options);
        setOutput(pw);
        setEntropy(calculateEntropy(pw.length, charset.length));
        setError(null);
      }
    } else {
      const phrase = generatePassphrase(wordCount, separator, capitalize);
      setOutput(phrase);
      setEntropy(calculatePassphraseEntropy(wordCount, EFF_SHORT_WORDLIST.length));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Password Generator</h1>
        <p className="text-slate-400">Generate cryptographically secure random passwords using Web Crypto API.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('password')}
          className={`px-4 py-2 rounded-lg font-medium ${mode === 'password' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
        >
          Password
        </button>
        <button
          onClick={() => setMode('passphrase')}
          className={`px-4 py-2 rounded-lg font-medium ${mode === 'passphrase' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
        >
          Passphrase
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel: Controls */}
        <div className="space-y-6">
          {mode === 'password' ? (
            <>
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
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setUppercase(!uppercase)}
                  className={`px-4 py-2 rounded-lg font-mono ${uppercase ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                >
                  Uppercase
                </button>
                <button
                  onClick={() => setLowercase(!lowercase)}
                  className={`px-4 py-2 rounded-lg font-mono ${lowercase ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                >
                  Lowercase
                </button>
                <button
                  onClick={() => setNumeric(!numeric)}
                  className={`px-4 py-2 rounded-lg font-mono ${numeric ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                >
                  0-9
                </button>
                <button
                  onClick={() => setSpecial(!special)}
                  className={`px-4 py-2 rounded-lg font-mono ${special ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                >
                  !@#$%^&*()
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Word count slider */}
              <div>
                <label htmlFor="word-count-slider" className="block text-sm font-medium text-slate-300 mb-2">
                  Word Count
                </label>
                <input
                  id="word-count-slider"
                  type="range"
                  min="3"
                  max="12"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 accent-blue-500"
                />
                <div className="mt-2">
                  <span className="text-sm text-slate-400">{wordCount} words</span>
                </div>
              </div>

              {/* Separator selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Separator</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 border border-slate-600"
                >
                  {SEPARATOR_OPTIONS.map(opt => (
                    <option key={opt.label} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Capitalize toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCapitalize(!capitalize)}
                  className={`px-4 py-2 rounded-lg font-medium ${capitalize ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  Capitalize
                </button>
                <span className="text-sm text-slate-400">Capitalize first letter of each word</span>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => copy(output)}
              disabled={!output || copied}
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

        {/* Right panel: Output */}
        <div className="space-y-4">
          <ErrorBanner message={error} />

          {!output && !error && (
            <div className="p-6 bg-slate-800 border border-slate-600 rounded-lg text-slate-400">
              <p>Adjust settings and click Regenerate to create a password.</p>
            </div>
          )}

          {output && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Generated {mode === 'passphrase' ? 'Passphrase' : 'Password'}</h2>
                <p className="text-slate-400 text-sm mb-2">Click "Copy to Clipboard" to copy.</p>
              </div>

              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                <pre className="bg-slate-900 border-slate-700 rounded-lg p-4 overflow-x-auto text-sm font-mono text-white break-all">
                  {output}
                </pre>
              </div>

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
