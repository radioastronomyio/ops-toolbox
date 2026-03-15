# 11 — JSON Diff & Patch

## Objective

Side-by-side JSON diff tool that computes the structural delta between two JSON documents and displays an annotated visual diff. Uses `jsondiffpatch` to analyze deep object trees and generate colored HTML output showing additions (green), deletions (red), and modifications (yellow). Useful for comparing API responses, config files, and infrastructure manifests.

## Route

`/json-diff`

## Dependencies

```
npm install jsondiffpatch
```

- `jsondiffpatch` — deep JSON diff/patch with HTML formatter

## Architecture

### Pure logic file: `src/lib/jsonDiff.js`

```js
// Compute the delta between two parsed JSON values.
// Returns jsondiffpatch delta object, or null if identical.
export function computeDiff(left, right) { ... }

// Render a delta to annotated HTML using jsondiffpatch's html formatter.
// Returns HTML string.
export function renderDiffHtml(left, delta) { ... }

// Parse a JSON string, returning { value, error }.
// error is null on success, string message on failure.
export function parseJson(str) { ... }
```

### React component: `src/tools/JsonDiff.jsx`

Two input panels side-by-side (stacked on mobile) with the diff output below.

## Inputs

- **Left panel textarea** — "Original" JSON, placeholder: `{ "key": "value" }`
- **Right panel textarea** — "Modified" JSON, placeholder: `{ "key": "updated" }`
- **Compare button** — triggers diff computation
- **Swap button** — swaps left and right inputs

## Outputs

- **Diff view** — annotated HTML rendered via `jsondiffpatch.formatters.html.format()`:
  - Green highlights: additions
  - Red highlights: deletions
  - Yellow/orange highlights: modifications
- **Summary line** — e.g., "3 additions, 1 deletion, 2 modifications" (derived from delta)
- **"Identical" message** — shown when both documents are equal
- **Inline parse errors** — shown beneath each textarea if the JSON is invalid (e.g., "Invalid JSON: Unexpected token }")
- **Raw delta panel** (collapsible) — shows the raw jsondiffpatch delta as formatted JSON

## Behavior

- Diff runs on button click (not auto-run — large documents can be slow)
- Both inputs are validated as JSON before diffing; invalid JSON shows inline error and blocks the diff
- jsondiffpatch CSS must be included for colored output — import `jsondiffpatch/dist/formatters-styles/html.css`
- Swap button exchanges left/right textarea content
- "Copy delta" button copies the raw delta JSON to clipboard
- Empty inputs treated as `{}` (empty object) for diff purposes

## Tests: `tests/lib/jsonDiff.test.js`

```
describe('parseJson')
  - '{"a":1}' → { value: { a: 1 }, error: null }
  - 'null' → { value: null, error: null }
  - '[]' → { value: [], error: null }
  - '{bad json}' → { value: null, error: <non-null string> }
  - '' → { value: null, error: <non-null string> }

describe('computeDiff')
  - identical objects → null (or undefined — no delta)
  - { a: 1 } vs { a: 2 } → delta showing 'a' modified
  - { a: 1 } vs { a: 1, b: 2 } → delta showing 'b' added
  - { a: 1, b: 2 } vs { a: 1 } → delta showing 'b' deleted
  - nested objects diff correctly

describe('renderDiffHtml')
  - returns a non-empty HTML string when delta is non-null
  - returned string contains '<ins' or '<del' markers for add/remove cases
```

## Tests: `tests/tools/JsonDiff.test.jsx`

```
- renders without crashing
- two textareas labeled "Original" and "Modified" are present
- Compare button is present
- Swap button is present
- no diff output shown before Compare is clicked
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/json-diff`
- Comparing two different JSON documents shows colored diff output
- Identical documents show "Identical" message
- Invalid JSON in either panel shows inline error and blocks comparison
