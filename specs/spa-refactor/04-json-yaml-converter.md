# 04 — JSON ↔ YAML Converter

## Objective

Bidirectional conversion between JSON and YAML with real-time linting.

## Route

`/json-yaml`

## Dependencies

```
npm install js-yaml
```

## Inputs

- Two-pane editor layout (side-by-side on desktop, stacked on mobile)
- Left pane: input textarea
- Right pane: output (read-only display)
- Direction toggle button: "JSON → YAML" / "YAML → JSON"

## Computation

```js
import yaml from 'js-yaml';

// JSON to YAML
const parsed = JSON.parse(inputText);
const output = yaml.dump(parsed, { indent: 2, lineWidth: -1 });

// YAML to JSON
const parsed = yaml.load(inputText);
const output = JSON.stringify(parsed, null, 2);
```

Use `useMemo` keyed on `[inputText, direction]`.

## Outputs

- Converted text in the output pane
- If parse error: output pane shows error message with red accent border
- Pane headers show current format labels (e.g., "Input (JSON)" / "Output (YAML)")

## Default Content

Pre-populate the input with a sample JSON object:

```json
{
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
}
```

## Error Handling

- JSON parse errors: show `SyntaxError` message
- YAML parse errors: show `YAMLException` message from js-yaml
- Both should display in the output pane with red styling

## UI Notes

- Monospace font in both panes
- Panes should be equal width on desktop
- Direction toggle button between the pane headers
- Textareas should fill available vertical space
- Spellcheck off on both textareas

## Tests: `tests/tools/JsonYamlConverter.test.jsx`

```
describe('JSON to YAML conversion')
  - renders without crashing
  - default content (K8s manifest) is present in input on mount
  - converts valid JSON to YAML output containing expected keys (apiVersion, kind, metadata)
  - shows error for invalid JSON input

describe('YAML to JSON conversion')
  - after toggling direction, converts YAML input to JSON
  - shows error for invalid YAML input (e.g., tab indentation issues)

describe('Direction toggle')
  - toggle button text changes between "JSON → YAML" and "YAML → JSON"
  - output pane header reflects current output format
```

Since js-yaml does the heavy computation, no separate lib file is needed — test through the component.

## Done Criteria

- `npm run test -- tests/tools/JsonYamlConverter.test.jsx` — all pass
- Component renders and converts correctly at `/json-yaml`
