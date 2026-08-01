/**
 * @file PasswordGenerator.jsx
 * @description Cryptographic password/passphrase generator with entropy display and strength indicator
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect } from 'react';
import { generatePassword, calculateEntropy, buildCharset, generatePassphrase, calculatePassphraseEntropy } from '../lib/password.js';
import { DEFAULT_WORDLIST_ID, WORDLIST_OPTIONS, loadWordlist } from '../lib/wordlists.js';
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
  const [wordlistId, setWordlistId] = useState(DEFAULT_WORDLIST_ID);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(false);

  const [output, setOutput] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [error, setError] = useState(null);
  const [isLoadingWordlist, setIsLoadingWordlist] = useState(false);
  const { copy, copied } = useClipboard();

  // Auto-generate on any option change; entropy = log2(charset^length)
  useEffect(() => {
    let active = true;

    const generate = async () => {
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
        setIsLoadingWordlist(false);
        return;
      }

      setIsLoadingWordlist(true);
      setError(null);
      try {
        const wordlist = await loadWordlist(wordlistId);
        if (!active) return;
        const phrase = generatePassphrase(wordCount, separator, capitalize, wordlist);
        setOutput(phrase);
        setEntropy(calculatePassphraseEntropy(wordCount, wordlist.length));
      } catch (err) {
        if (!active) return;
        setError(err.message);
        setOutput('');
        setEntropy(0);
      } finally {
        if (active) setIsLoadingWordlist(false);
      }
    };

    generate();
    return () => {
      active = false;
    };
  }, [mode, length, uppercase, lowercase, numeric, special, wordCount, wordlistId, separator, capitalize]);

  const handleRegenerate = async () => {
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
      setIsLoadingWordlist(true);
      try {
        const wordlist = await loadWordlist(wordlistId);
        const phrase = generatePassphrase(wordCount, separator, capitalize, wordlist);
        setOutput(phrase);
        setEntropy(calculatePassphraseEntropy(wordCount, wordlist.length));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingWordlist(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Password Generator</h1>
        <p className="text-text-secondary">Generate cryptographically secure random passwords using Web Crypto API.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('password')}
          className={`px-4 py-2 rounded-md font-medium ${mode === 'password' ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary'}`}
        >
          Password
        </button>
        <button
          onClick={() => setMode('passphrase')}
          className={`px-4 py-2 rounded-md font-medium ${mode === 'passphrase' ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary'}`}
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
                <label htmlFor="length-slider" className="block text-sm font-medium text-text-secondary mb-2">
                  Password Length
                </label>
                <input
                  id="length-slider"
                  type="range"
                  min="8"
                  max="128"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-1 accent-accent focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-text-secondary">{length} characters</span>
                </div>
              </div>

              {/* Character pool toggles */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setUppercase(!uppercase)}
                  className={`px-4 py-2 rounded-md font-mono ${uppercase ? 'bg-accent border-accent text-black' : 'bg-surface-2 border-border-subtle text-text-secondary'}`}
                >
                  Uppercase
                </button>
                <button
                  onClick={() => setLowercase(!lowercase)}
                  className={`px-4 py-2 rounded-md font-mono ${lowercase ? 'bg-accent border-accent text-black' : 'bg-surface-2 border-border-subtle text-text-secondary'}`}
                >
                  Lowercase
                </button>
                <button
                  onClick={() => setNumeric(!numeric)}
                  className={`px-4 py-2 rounded-md font-mono ${numeric ? 'bg-accent border-accent text-black' : 'bg-surface-2 border-border-subtle text-text-secondary'}`}
                >
                  0-9
                </button>
                <button
                  onClick={() => setSpecial(!special)}
                  className={`px-4 py-2 rounded-md font-mono ${special ? 'bg-accent border-accent text-black' : 'bg-surface-2 border-border-subtle text-text-secondary'}`}
                >
                  !@#$%^&*()
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Wordlist selector */}
              <div>
                <label htmlFor="wordlist-selector" className="block text-sm font-medium text-text-secondary mb-2">
                  Wordlist
                </label>
                <select
                  id="wordlist-selector"
                  value={wordlistId}
                  onChange={(e) => setWordlistId(e.target.value)}
                  className="bg-surface-2 text-text-primary rounded-md px-3 py-2 border border-border-subtle"
                >
                  {WORDLIST_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-text-secondary">
                  Larger lists provide more entropy per randomly selected word.
                </p>
              </div>

              {/* Word count slider */}
              <div>
                <label htmlFor="word-count-slider" className="block text-sm font-medium text-text-secondary mb-2">
                  Word Count
                </label>
                <input
                  id="word-count-slider"
                  type="range"
                  min="3"
                  max="12"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-1 accent-accent"
                />
                <div className="mt-2">
                  <span className="text-sm text-text-secondary">{wordCount} words</span>
                </div>
              </div>

              {/* Separator selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Separator</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="bg-surface-2 text-text-primary rounded-md px-3 py-2 border border-border-subtle"
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
                  className={`px-4 py-2 rounded-md font-medium ${capitalize ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary'}`}
                >
                  Capitalize
                </button>
                <span className="text-sm text-text-secondary">Capitalize first letter of each word</span>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => copy(output)}
              disabled={!output || copied}
              className="px-6 py-3 bg-accent hover:bg-accent-hover border-accent text-black rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isLoadingWordlist}
              className="px-6 py-3 bg-status-success hover:opacity-90 border-status-success text-black rounded-md font-medium"
            >
              {isLoadingWordlist ? 'Loading wordlist…' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Right panel: Output */}
        <div className="space-y-4">
          <ErrorBanner message={error} />

          {isLoadingWordlist && (
            <div role="status" className="p-4 bg-surface-1 border border-border-subtle rounded-md text-text-secondary">
              Loading selected wordlist…
            </div>
          )}

          {!output && !error && (
            <div className="p-6 bg-surface-1 border border-border-subtle rounded-md text-text-secondary">
              <p>Adjust settings and click Regenerate to create a password.</p>
            </div>
          )}

          {output && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Generated {mode === 'passphrase' ? 'Passphrase' : 'Password'}</h2>
                <p className="text-text-secondary text-sm mb-2">Click "Copy to Clipboard" to copy.</p>
              </div>

              <div className="bg-surface-1 border border-border-subtle rounded-md p-6">
                <pre className="bg-bg border-border rounded-md p-4 overflow-x-auto text-sm font-mono text-text-primary break-all">
                  {output}
                </pre>
              </div>

              <div className="bg-surface-1 border border-border-subtle rounded-md p-4">
                <h3 className="text-lg font-medium text-text-secondary mb-2">Password Entropy</h3>
                <p className="text-4xl font-bold text-status-success mb-2">{entropy} bits</p>
                <p className="text-sm text-text-secondary">
                  {entropy >= 80 ? (
                    <span className="text-status-success">Strong password</span>
                  ) : entropy >= 60 ? (
                    <span className="text-status-warning">Moderate password</span>
                  ) : (
                    <span className="text-status-error">Weak password</span>
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
