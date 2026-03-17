/**
 * @file SshKeyGenerator.jsx
 * @description In-browser RSA SSH keypair generator using node-forge; private key never leaves the client
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState } from 'react';
import forge from 'node-forge';
import { useClipboard } from '../hooks/useClipboard';

export default function SshKeyGenerator() {
  const [keySize, setKeySize] = useState('2048');
  const [comment, setComment] = useState('ops-toolbox-local');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const privateCb = useClipboard();
  const publicCb = useClipboard();

  function generate() {
    setGenerating(true);
    setError(null);
    setPrivateKey('');
    setPublicKey('');

    // setTimeout(0) yields to the event loop so the UI can show the "Generating..." state
    setTimeout(() => {
      // workers: -1 uses Web Workers when available for non-blocking key generation
      forge.pki.rsa.generateKeyPair({ bits: parseInt(keySize, 10), workers: -1 }, (err, keypair) => {
        if (err) {
          setError('Key generation failed: ' + err.message);
          setGenerating(false);
          return;
        }
        try {
          const privPem = forge.pki.privateKeyToPem(keypair.privateKey);
          const pubSsh = forge.ssh.publicKeyToOpenSSH(keypair.publicKey, comment);
          setPrivateKey(privPem);
          setPublicKey(pubSsh);
        } catch (e) {
          setError('Failed to export keys: ' + e.message);
        }
        setGenerating(false);
      });
    }, 0);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">SSH Keypair Generator</h1>
        <p className="text-text-secondary">Generate RSA SSH keypairs in-browser using node-forge. Private key stays on your device.</p>
      </div>

      <div className="bg-surface-1 border border-border rounded-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">Key Size</label>
            <select
              value={keySize}
              onChange={e => setKeySize(e.target.value)}
              className="w-full bg-surface-2 border border-border-subtle text-text-primary rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="2048">2048</option>
              <option value="4096">4096</option>
            </select>
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">Comment</label>
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-surface-2 border border-border-subtle text-text-primary rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {keySize === '4096' && (
          <p className="text-status-warning text-sm">
            Warning: 4096-bit key generation may take 10–30 seconds in-browser.
          </p>
        )}

        <button
          onClick={generate}
          disabled={generating}
          className="px-6 py-2 bg-accent hover:bg-accent-hover disabled:bg-surface-3 disabled:cursor-not-allowed text-black text-sm rounded-md transition-micro"
        >
          {generating ? 'Generating... (this may take a few seconds)' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/50 rounded-md p-3 text-status-error text-sm">
          {error}
        </div>
      )}

      {privateKey && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-text-secondary text-sm font-medium">Private Key (PEM)</label>
            <button
              onClick={() => privateCb.copy(privateKey)}
              className="px-3 py-1 bg-surface-2 hover:bg-surface-3 text-text-primary text-xs rounded transition-micro"
            >
              {privateCb.copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-status-warning/15 border border-status-warning/30 rounded px-3 py-2 text-status-warning text-xs">
            Keep your private key secret. Never share it or commit it to version control.
          </div>
          <textarea
            readOnly
            value={privateKey}
            rows={10}
            placeholder="-----BEGIN RSA PRIVATE KEY-----"
            className="w-full bg-surface-1 border border-border text-text-primary rounded-md px-4 py-3 font-mono text-xs focus:outline-none resize-none"
          />
        </div>
      )}

      {publicKey && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-text-secondary text-sm font-medium">Public Key (OpenSSH)</label>
            <button
              onClick={() => publicCb.copy(publicKey)}
              className="px-3 py-1 bg-surface-2 hover:bg-surface-3 text-text-primary text-xs rounded transition-micro"
            >
              {publicCb.copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={publicKey}
            rows={3}
            placeholder="ssh-rsa AAAA..."
            className="w-full bg-surface-1 border border-border text-text-primary rounded-md px-4 py-3 font-mono text-xs focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
}
