import { useState, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

// Test JWT from spec
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

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

    // Validate structure: must have exactly 2 periods (3 segments)
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
        <h1 className="text-2xl font-bold text-white mb-2">JWT Decoder</h1>
        <p className="text-slate-400">Decode and inspect JSON Web Tokens. Display header and payload as formatted JSON.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel: Token input */}
        <div className="space-y-4">
          <label htmlFor="jwt-input" className="block text-sm font-medium text-slate-300 mb-2">
            JWT Token
          </label>
          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste a JWT to inspect..."
            className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            Signature is not validated client-side. This tool only decodes the token structure.
          </p>
        </div>

        {/* Right panel: Decoded output */}
        <div className="space-y-4">
          {result.state === 'empty' && (
            <div className="p-6 bg-slate-800 border border-slate-600 rounded-lg text-slate-400">
              <p>Paste a JWT to inspect</p>
            </div>
          )}

          {result.state === 'error' && (
            <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{result.message}</p>
            </div>
          )}

          {result.state === 'success' && (
            <div className="space-y-4">
              {/* Header section */}
              <div>
                <h2 className="text-sm font-medium text-rose-400 mb-2">Header</h2>
                <pre className="bg-slate-800 border border-slate-600 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-300">
                  {JSON.stringify(result.header, null, 2)}
                </pre>
              </div>

              {/* Payload section */}
              <div>
                <h2 className="text-sm font-medium text-emerald-400 mb-2">Payload</h2>
                <pre className="bg-slate-800 border border-slate-600 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-300">
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>

              {/* Display human-readable dates for exp and iat */}
              {(result.payload.exp || result.payload.iat) && (
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-sm">
                  <h3 className="font-medium text-slate-300 mb-2">Timestamp Claims</h3>
                  {result.payload.iat && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issued At (iat):</span>
                      <span className="font-mono text-white">
                        {result.payload.iat} ({formatUnixTimestamp(result.payload.iat)})
                      </span>
                    </div>
                  )}
                  {result.payload.exp && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expiration (exp):</span>
                      <span className="font-mono text-white">
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
