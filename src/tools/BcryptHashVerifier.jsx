/**
 * @file BcryptHashVerifier.jsx
 * @description Bcrypt hash generation and password verification with configurable salt rounds
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import React, { useState } from 'react';
import { hashPassword, verifyPassword, isBcryptHash } from '../lib/bcryptUtils';
import CopyButton from '../components/CopyButton';

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
    // Reject early if the hash doesn't match $2a$/$2b$ format to avoid wasting CPU
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Bcrypt Hash Verifier</h1>

      {/* Hash panel */}
      <div className="bg-surface-1 rounded-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Hash</h2>

        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Plain Text</label>
          <input
            type="text"
            value={hashPlain}
            onChange={e => setHashPlain(e.target.value)}
            placeholder="Enter password to hash"
            className="w-full bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Salt Rounds</label>
          <select
            value={saltRounds}
            onChange={e => setSaltRounds(e.target.value)}
            className="bg-bg border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
          >
            {[4, 6, 8, 10, 12, 14].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleHash}
          disabled={hashing}
          className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-black rounded font-medium"
        >
          {hashing ? 'Hashing…' : 'Hash Password'}
        </button>

        {hashResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-bg border border-border rounded px-3 py-2 text-status-success break-all">
                {hashResult}
              </code>
              <CopyButton text={hashResult} className="py-2 text-sm whitespace-nowrap" />
            </div>
            {hashTime !== null && (
              <p className="text-xs text-text-muted">Computed in {hashTime}ms</p>
            )}
          </div>
        )}
      </div>

      {/* Verify panel */}
      <div className="bg-surface-1 rounded-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Verify</h2>

        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Plain Text</label>
          <input
            type="text"
            value={verifyPlain}
            onChange={e => setVerifyPlain(e.target.value)}
            placeholder="Enter plain text password"
            className="w-full bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Bcrypt Hash</label>
          <input
            type="text"
            value={verifyHash}
            onChange={e => setVerifyHash(e.target.value)}
            placeholder="$2b$10$..."
            className="w-full font-mono bg-bg border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-black rounded font-medium"
        >
          {verifying ? 'Verifying…' : 'Verify Password'}
        </button>

        {verifyResult && (
          <div
            className={`px-4 py-3 rounded font-medium ${
              verifyResult.valid
                ? 'bg-status-success/20 text-status-success border border-status-success/50'
                : 'bg-status-error/20 text-status-error border border-status-error/50'
            }`}
          >
            {verifyResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
