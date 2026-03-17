/**
 * @file X509Parser.jsx
 * @description X.509 certificate parser for PEM-encoded certificates
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useRef } from 'react';
import { parseCertificate } from '../lib/x509.js';

const SAMPLE_PLACEHOLDER = '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----';

function formatDate(d) {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function getCertStatus(validFrom, validTo) {
  const now = new Date();
  if (!validFrom || !validTo) return null;
  const from = new Date(validFrom);
  const to = new Date(validTo);
  if (now < from) return { label: 'Not Yet Valid', color: 'text-status-warning' };
  if (now > to) return { label: 'Expired', color: 'text-status-error' };
  return { label: 'Valid', color: 'text-status-success' };
}

function Row({ label, value }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-2 text-text-secondary text-sm w-40 font-medium align-top">{label}</td>
      <td className="px-4 py-2 text-text-primary text-sm font-mono break-all">{value || <span className="text-text-muted">—</span>}</td>
    </tr>
  );
}

export default function X509Parser() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleChange(val) {
    setInput(val);
    if (!val.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    const parsed = parseCertificate(val);
    if (!parsed) {
      setError('Could not parse certificate. Ensure it\'s a valid PEM-encoded X.509 certificate.');
      setResult(null);
    } else {
      setError(null);
      setResult(parsed);
    }
  }

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      handleChange(text);
    };
    reader.readAsText(file);
  }

  const status = result ? getCertStatus(result.validFrom, result.validTo) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">X.509 Certificate Parser</h1>
        <p className="text-text-secondary">Parse PEM certificates: subject, issuer, validity, key info, and extensions.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-text-secondary text-sm font-medium">PEM Certificate</label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-surface-2 hover:bg-surface-3 text-text-primary text-xs rounded transition-micro"
          >
            Upload (.pem, .crt, .cer)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pem,.crt,.cer"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
        <textarea
          value={input}
          onChange={e => handleChange(e.target.value)}
          rows={8}
          placeholder={SAMPLE_PLACEHOLDER}
          className="w-full bg-surface-1 border border-border-subtle text-text-primary rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/50 rounded-md p-3 text-status-error text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-surface-1 border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <tbody>
              <Row label="Subject" value={result.subject} />
              <Row label="Issuer" value={result.issuer} />
              <Row label="Serial Number" value={result.serialNumber} />
              <Row label="Valid From" value={formatDate(result.validFrom)} />
              <Row label="Valid To" value={formatDate(result.validTo)} />
              {status && (
                <tr className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-text-secondary text-sm w-40 font-medium">Status</td>
                  <td className={`px-4 py-2 text-sm font-semibold ${status.color}`}>{status.label}</td>
                </tr>
              )}
              <Row label="Signature Alg." value={result.signatureAlgorithm} />
              <Row label="Public Key Alg." value={result.publicKeyAlgorithm} />
              {result.publicKeySize && <Row label="Public Key Size" value={result.publicKeySize + ' bits'} />}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
