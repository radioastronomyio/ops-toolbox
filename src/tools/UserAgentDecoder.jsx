/**
 * @file UserAgentDecoder.jsx
 * @description Browser User-Agent string parser that extracts browser, OS, device, engine, and CPU info
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

function Field({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-text-secondary text-sm w-32 shrink-0">{label}</span>
      <span className="text-text-primary text-sm font-mono text-right break-all">
        {value || <span className="text-text-muted italic">Not detected</span>}
      </span>
    </div>
  );
}

function Section({ title, fields }) {
  return (
    <div className="bg-surface-1 border border-border rounded-md p-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">{title}</h3>
      {fields.map(([label, value]) => (
        <Field key={label} label={label} value={value} />
      ))}
    </div>
  );
}

export default function UserAgentDecoder() {
  // Pre-populate with the current browser's UA string for immediate feedback
  const [input, setInput] = useState(() => navigator.userAgent);
  const [result, setResult] = useState(() => {
    const ua = navigator.userAgent;
    return ua ? new UAParser(ua).getResult() : null;
  });
  const debouncedInput = useDebouncedValue(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setResult(null);
      return;
    }
    const parser = new UAParser(debouncedInput);
    setResult(parser.getResult());
  }, [debouncedInput]);

  function handleMyBrowser() {
    setInput(navigator.userAgent);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">User-Agent Decoder</h1>
        <p className="text-text-secondary">Parse browser User-Agent strings into browser, OS, device, and engine components.</p>
      </div>

      <div className="space-y-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          placeholder="Paste a User-Agent string here..."
          className="w-full bg-surface-1 border border-border-subtle text-text-primary rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent resize-none"
        />
        <button
          onClick={handleMyBrowser}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-black text-sm rounded-md transition-micro"
        >
          Use My Browser
        </button>
      </div>

      {!input.trim() && (
        <p className="text-text-muted text-sm">Enter a User-Agent string to decode</p>
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
