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

    setTimeout(() => {
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
        <h1 className="text-2xl font-bold text-white mb-2">SSH Keypair Generator</h1>
        <p className="text-slate-400">Generate RSA SSH keypairs in-browser using node-forge. Private key stays on your device.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Key Size</label>
            <select
              value={keySize}
              onChange={e => setKeySize(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="2048">2048</option>
              <option value="4096">4096</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Comment</label>
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {keySize === '4096' && (
          <p className="text-yellow-400 text-sm">
            Warning: 4096-bit key generation may take 10–30 seconds in-browser.
          </p>
        )}

        <button
          onClick={generate}
          disabled={generating}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          {generating ? 'Generating... (this may take a few seconds)' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {privateKey && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm font-medium">Private Key (PEM)</label>
            <button
              onClick={() => privateCb.copy(privateKey)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
            >
              {privateCb.copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded px-3 py-2 text-yellow-400 text-xs">
            Keep your private key secret. Never share it or commit it to version control.
          </div>
          <textarea
            readOnly
            value={privateKey}
            rows={10}
            placeholder="-----BEGIN RSA PRIVATE KEY-----"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 font-mono text-xs focus:outline-none resize-none"
          />
        </div>
      )}

      {publicKey && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm font-medium">Public Key (OpenSSH)</label>
            <button
              onClick={() => publicCb.copy(publicKey)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
            >
              {publicCb.copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={publicKey}
            rows={3}
            placeholder="ssh-rsa AAAA..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 font-mono text-xs focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
}
