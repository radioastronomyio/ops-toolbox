import React, { useState } from 'react';
import { hashPassword, verifyPassword, isBcryptHash } from '../lib/bcryptUtils';

export default function BcryptHashVerifier() {
  const [hashPlain, setHashPlain] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashResult, setHashResult] = useState('');
  const [hashTime, setHashTime] = useState(null);
  const [hashing, setHashing] = useState(false);

  const [verifyPlain, setVerifyPlain] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [copied, setCopied] = useState(false);

  async function handleHash() {
    if (!hashPlain) return;
    setHashing(true);
    setHashResult('');
    setHashTime(null);
    const start = performance.now();
    try {
      const h = await hashPassword(hashPlain, Number(saltRounds));
      const elapsed = (performance.now() - start).toFixed(0);
      setHashResult(h);
      setHashTime(elapsed);
    } finally {
      setHashing(false);
    }
  }

  async function handleVerify() {
    if (!verifyPlain || !verifyHash) return;
    if (!isBcryptHash(verifyHash)) {
      setVerifyResult({ valid: false, message: 'Invalid hash format' });
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const match = await verifyPassword(verifyPlain, verifyHash);
      setVerifyResult({
        valid: match,
        message: match ? 'Valid — password matches' : 'Invalid — password does not match',
      });
    } finally {
      setVerifying(false);
    }
  }

  function handleCopy() {
    if (hashResult) {
      navigator.clipboard.writeText(hashResult).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Bcrypt Hash Verifier</h1>

      {/* Hash panel */}
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Hash</h2>

        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Plain Text</label>
          <input
            type="text"
            value={hashPlain}
            onChange={e => setHashPlain(e.target.value)}
            placeholder="Enter password to hash"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Salt Rounds</label>
          <select
            value={saltRounds}
            onChange={e => setSaltRounds(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
          >
            {[4, 6, 8, 10, 12, 14].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleHash}
          disabled={hashing}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium"
        >
          {hashing ? 'Hashing…' : 'Hash Password'}
        </button>

        {hashResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-slate-900 border border-slate-700 rounded px-3 py-2 text-emerald-400 break-all">
                {hashResult}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {hashTime !== null && (
              <p className="text-xs text-slate-500">Computed in {hashTime}ms</p>
            )}
          </div>
        )}
      </div>

      {/* Verify panel */}
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Verify</h2>

        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Plain Text</label>
          <input
            type="text"
            value={verifyPlain}
            onChange={e => setVerifyPlain(e.target.value)}
            placeholder="Enter plain text password"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Bcrypt Hash</label>
          <input
            type="text"
            value={verifyHash}
            onChange={e => setVerifyHash(e.target.value)}
            placeholder="$2b$10$..."
            className="w-full font-mono bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium"
        >
          {verifying ? 'Verifying…' : 'Verify Password'}
        </button>

        {verifyResult && (
          <div
            className={`px-4 py-3 rounded font-medium ${
              verifyResult.valid
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}
          >
            {verifyResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
