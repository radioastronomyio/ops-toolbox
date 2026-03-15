import { useState, useEffect, useRef } from 'react';
import { UAParser } from 'ua-parser-js';

function Field({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 text-sm w-32 shrink-0">{label}</span>
      <span className="text-white text-sm font-mono text-right break-all">
        {value || <span className="text-slate-500 italic">Not detected</span>}
      </span>
    </div>
  );
}

function Section({ title, fields }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{title}</h3>
      {fields.map(([label, value]) => (
        <Field key={label} label={label} value={value} />
      ))}
    </div>
  );
}

export default function UserAgentDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    setInput(ua);
    const parser = new UAParser(ua);
    setResult(parser.getResult());
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!input.trim()) {
        setResult(null);
        return;
      }
      const parser = new UAParser(input);
      setResult(parser.getResult());
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  function handleMyBrowser() {
    setInput(navigator.userAgent);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">User-Agent Decoder</h1>
        <p className="text-slate-400">Parse browser User-Agent strings into browser, OS, device, and engine components.</p>
      </div>

      <div className="space-y-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          placeholder="Paste a User-Agent string here..."
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
        <button
          onClick={handleMyBrowser}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
        >
          Use My Browser
        </button>
      </div>

      {!input.trim() && (
        <p className="text-slate-500 text-sm">Enter a User-Agent string to decode</p>
      )}

      {result && input.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section
            title="Browser"
            fields={[
              ['Name', result.browser?.name],
              ['Version', result.browser?.version],
              ['Major', result.browser?.major],
            ]}
          />
          <Section
            title="Engine"
            fields={[
              ['Name', result.engine?.name],
              ['Version', result.engine?.version],
            ]}
          />
          <Section
            title="OS"
            fields={[
              ['Name', result.os?.name],
              ['Version', result.os?.version],
            ]}
          />
          <Section
            title="Device"
            fields={[
              ['Type', result.device?.type],
              ['Vendor', result.device?.vendor],
              ['Model', result.device?.model],
            ]}
          />
          <Section
            title="CPU"
            fields={[
              ['Architecture', result.cpu?.architecture],
            ]}
          />
        </div>
      )}
    </div>
  );
}
