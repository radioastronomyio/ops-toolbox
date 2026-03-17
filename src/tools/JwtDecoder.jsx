/**
 * @file JwtDecoder.jsx
 * @description JWT token decoder displaying header, payload, and human-readable timestamp claims
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

// Pre-populated with jwt.io example token so the UI isn't empty on first load
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Converts Unix epoch seconds (iat/exp claims) to locale-formatted date string
function formatUnixTimestamp(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

export default function JwtDecoder() {
  const [token, setToken] = useState(TEST_JWT);

  const result = useMemo(() => {
    // Check for empty input
    if (!token.trim()) {
      return { state: 'empty' };
    }

    // Quick structural check before attempting Base64Url decode
    const segments = token.split('.');
    if (segments.length !== 3) {
      return { state: 'error', message: 'Invalid format — a JWT must have three Base64Url segments separated by periods.' };
    }

    try {
      // Decode header and payload
      const header = jwtDecode(token, { header: true });
      const payload = jwtDecode(token);
      return { state: 'success', header, payload };
    } catch (error) {
      return { state: 'error', message: 'Decoding failed — Base64Url string is malformed.' };
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">JWT Decoder</h1>
        <p className="text-text-secondary">Decode and inspect JSON Web Tokens. Display header and payload as formatted JSON.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel: Token input */}
        <div className="space-y-4">
          <label htmlFor="jwt-input" className="block text-sm font-medium text-text-secondary mb-2">
            JWT Token
          </label>
          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste a JWT to inspect..."
            className="w-full h-64 px-4 py-3 bg-surface-1 border border-border-subtle rounded-md text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
          <p className="text-xs text-text-muted mt-2">
            Signature is not validated client-side. This tool only decodes the token structure.
          </p>
        </div>

        {/* Right panel: Decoded output */}
        <div className="space-y-4">
          {result.state === 'empty' && (
            <div className="p-6 bg-surface-1 border border-border-subtle rounded-md text-text-secondary">
              <p>Paste a JWT to inspect</p>
            </div>
          )}

          {result.state === 'error' && (
            <div className="p-6 bg-status-error/20 border border-status-error rounded-md">
              <p className="text-status-error">{result.message}</p>
            </div>
          )}

          {result.state === 'success' && (
            <div className="space-y-4">
              {/* Header section */}
              <div>
                <h2 className="text-sm font-medium text-status-error mb-2">Header</h2>
                <pre className="bg-surface-1 border border-border-subtle rounded-md p-4 overflow-x-auto text-sm font-mono text-text-secondary">
                  {JSON.stringify(result.header, null, 2)}
                </pre>
              </div>

              {/* Payload section */}
              <div>
                <h2 className="text-sm font-medium text-status-success mb-2">Payload</h2>
                <pre className="bg-surface-1 border border-border-subtle rounded-md p-4 overflow-x-auto text-sm font-mono text-text-secondary">
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>

              {/* Display human-readable dates for exp and iat */}
              {(result.payload.exp || result.payload.iat) && (
                <div className="bg-surface-1 border border-border-subtle rounded-md p-4 text-sm">
                  <h3 className="font-medium text-text-secondary mb-2">Timestamp Claims</h3>
                  {result.payload.iat && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Issued At (iat):</span>
                      <span className="font-mono text-text-primary">
                        {result.payload.iat} ({formatUnixTimestamp(result.payload.iat)})
                      </span>
                    </div>
                  )}
                  {result.payload.exp && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Expiration (exp):</span>
                      <span className="font-mono text-text-primary">
                        {result.payload.exp} ({formatUnixTimestamp(result.payload.exp)})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
