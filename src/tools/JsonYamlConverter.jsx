/**
 * @file JsonYamlConverter.jsx
 * @description Bidirectional JSON/YAML converter with real-time parsing via js-yaml
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useMemo } from 'react';
import yaml from 'js-yaml';

const DEFAULT_JSON = `{
  "apiVersion": "v1",
  "kind": "Service",
  "metadata": {
    "name": "my-service",
    "namespace": "production"
  },
  "spec": {
    "selector": {
      "app": "my-app"
    },
    "ports": [
      { "port": 80, "targetPort": 8080 }
    ]
  }
}`;

function JsonYamlConverter() {
  const [inputText, setInputText] = useState(DEFAULT_JSON);
  const [direction, setDirection] = useState('json-to-yaml'); // 'json-to-yaml' or 'yaml-to-json'

  const { output, error } = useMemo(() => {
    if (!inputText.trim()) {
      return { output: '', error: null };
    }

    try {
      if (direction === 'json-to-yaml') {
        const parsed = JSON.parse(inputText);
        // lineWidth: -1 disables wrapping so long strings stay on one line
        const yamlOutput = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
        return { output: yamlOutput, error: null };
      } else {
        const parsed = yaml.load(inputText);
        const jsonOutput = JSON.stringify(parsed, null, 2);
        return { output: jsonOutput, error: null };
      }
    } catch (err) {
      return { output: '', error: err.message };
    }
  }, [inputText, direction]);

  const toggleDirection = () => {
    setDirection(prev => prev === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml');
  };

  const inputFormat = direction === 'json-to-yaml' ? 'JSON' : 'YAML';
  const outputFormat = direction === 'json-to-yaml' ? 'YAML' : 'JSON';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">JSON ↔ YAML Converter</h1>
        <p className="text-text-secondary">
          Bidirectional conversion between JSON and YAML with real-time parsing.
        </p>
      </div>

      <div className="flex items-center justify-center mb-4">
        <button
          onClick={toggleDirection}
          className="px-6 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-md transition-micro"
        >
          {direction === 'json-to-yaml' ? 'JSON → YAML' : 'YAML → JSON'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label htmlFor="json-yaml-input" className="block text-sm font-medium text-text-secondary mb-2">
            Input ({inputFormat})
          </label>
          <textarea
            id="json-yaml-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-surface-1 border border-border-subtle rounded-md text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4">
          <label htmlFor="json-yaml-output" className="block text-sm font-medium text-text-secondary mb-2">
            Output ({outputFormat})
          </label>
          <div
            id="json-yaml-output"
            className={`w-full h-96 px-4 py-3 rounded-md font-mono text-sm overflow-auto ${
              error
                ? 'bg-status-error/20 border-2 border-status-error text-status-error'
                : 'bg-surface-1 border border-border-subtle text-text-secondary'
            }`}
          >
            {error ? (
              <div className="whitespace-pre-wrap">{error}</div>
            ) : (
              <pre className="whitespace-pre-wrap">{output}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JsonYamlConverter;
