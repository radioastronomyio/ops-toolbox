# 12 — CSV to JSON Engine

## Objective

High-performance CSV parser that converts CSV files or pasted CSV text into formatted JSON. Uses `papaparse` for robust delimiter detection, header row handling, and type inference. Supports large files via PapaParse's streaming parser without locking the UI thread.

## Route

`/csv-to-json`

## Dependencies

```
npm install papaparse
```

- `papaparse` — fast, RFC 4180-compliant CSV parser with browser streaming support

## Architecture

### Pure logic file: `src/lib/csvToJson.js`

```js
// Parse a CSV string synchronously using PapaParse.
// options: { header: boolean, skipEmptyLines: boolean, dynamicTyping: boolean }
// Returns { data: Array, errors: Array, meta: object }
export function parseCsvString(csvString, options) { ... }

// Convert PapaParse result data to a formatted JSON string.
// indent: number (default 2)
// Returns string
export function toJsonString(data, indent) { ... }

// Detect delimiter from a CSV string sample (first 1024 chars).
// Returns detected delimiter character or ',' as fallback.
export function detectDelimiter(sample) { ... }
```

### React component: `src/tools/CsvToJson.jsx`

Tab-based input: "Paste CSV" tab and "Upload File" tab. Output below.

## Inputs

- **Paste tab** — textarea for pasting CSV text directly
- **Upload tab** — file picker accepting `.csv` and `.txt` files
- **Options panel:**
  - **Header row** toggle — treat first row as keys (default: on)
  - **Dynamic typing** toggle — auto-convert numbers/booleans (default: on)
  - **Skip empty lines** toggle (default: on)
  - **Delimiter** — auto-detect (default) or manual override (comma, semicolon, tab, pipe)
- **Convert button**

## Outputs

- **JSON output** — syntax-highlighted, formatted JSON in a code block (monospace)
- **Stats bar** — "X rows parsed, Y columns, Z errors"
- **Errors panel** (collapsible) — list of PapaParse errors with row/column info
- **Copy JSON** button — copies full JSON string to clipboard
- **Download JSON** button — triggers browser download of `output.json`
- **Row count badge** — shown inline with output panel header

## Behavior

- Conversion triggered by button click
- File upload reads file as text then passes to PapaParse
- Files larger than 5 MB show a warning: "Large file — parsing may take a moment"
- Auto-detects delimiter on paste or file load; shows detected delimiter in options panel
- Empty CSV (no rows after header) shows "No data rows found" message
- Invalid/unparseable input shows PapaParse error details
- Download button creates a Blob URL and auto-clicks an anchor element
- Both tabs share the same options panel

## Tests: `tests/lib/csvToJson.test.js`

```
describe('detectDelimiter')
  - 'a,b,c\n1,2,3' → ','
  - 'a;b;c\n1;2;3' → ';'
  - 'a\tb\tc\n1\t2\t3' → '\t'
  - 'a|b|c\n1|2|3' → '|'

describe('parseCsvString')
  - 'name,age\nAlice,30\nBob,25' with header:true → data: [{name:'Alice',age:30},{name:'Bob',age:25}]
  - 'a,b\n1,2' with dynamicTyping:false → values are strings '1','2'
  - empty string → data: [], no throw
  - single column, multiple rows → array of objects with one key each

describe('toJsonString')
  - [{a:1}] with indent 2 → '[\n  {\n    "a": 1\n  }\n]'
  - [] → '[]'
  - [{a:'hello'}] → contains '"a": "hello"'
```

## Tests: `tests/tools/CsvToJson.test.jsx`

```
- renders without crashing
- Paste and Upload tabs are present
- textarea is visible on Paste tab
- file input is present on Upload tab
- Convert button is present
- options toggles (Header row, Dynamic typing) are present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/csv-to-json`
- Pasting CSV and clicking Convert produces valid JSON output
- Header row toggle correctly includes/excludes header as keys
- Copy and Download buttons function correctly
