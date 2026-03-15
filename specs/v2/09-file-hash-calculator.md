# 09 — File Hash Calculator

## Objective

Drag-and-drop file integrity verifier that computes MD5, SHA-1, SHA-256, and SHA-512 digests for any file uploaded in the browser. All hashing runs entirely client-side — MD5 via `js-md5` (crypto.subtle does not support MD5) and SHA variants via the native `crypto.subtle` Web Crypto API. Users can paste an expected hash to instantly verify file integrity.

## Route

`/file-hash-calculator`

## Dependencies

```
npm install js-md5
```

- `js-md5` — MD5 digest in pure JS, browser-compatible
- `crypto.subtle` — native browser API for SHA-1, SHA-256, SHA-512 (no install)

## Architecture

### Pure logic file: `src/lib/fileHash.js`

```js
// Hash a file (File or Blob) with the given algorithm.
// algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'
// Returns Promise<string> — lowercase hex digest
export async function hashFile(file, algorithm) { ... }

// Hash an ArrayBuffer with SHA variant via crypto.subtle.
// Returns Promise<string> — lowercase hex digest
export async function hashBufferSHA(buffer, algorithm) { ... }

// Hash an ArrayBuffer with MD5 via js-md5.
// Returns string — lowercase hex digest
export function hashBufferMD5(buffer) { ... }

// Convert ArrayBuffer to lowercase hex string
export function bufferToHex(buffer) { ... }
```

### React component: `src/tools/FileHashCalculator.jsx`

## Inputs

- **File drop zone / file picker** — accepts any file type, any size. Drag-and-drop or click-to-browse.
- **Algorithm checkboxes** — MD5, SHA-1, SHA-256, SHA-512 (all checked by default)
- **Expected hash field** — optional text input; user pastes a known hash to verify against

## Outputs

- **File metadata row** — filename, size (human-readable, e.g., "4.2 MB"), MIME type
- **Hash results table** — one row per selected algorithm:
  - Algorithm label | hex digest (monospace, full width) | Copy button
- **Verification badge** (when expected hash field is filled):
  - Green "Match" badge if the pasted hash equals any computed digest (case-insensitive)
  - Red "No Match" badge otherwise
- **Progress indicator** — shown while hashing large files (spinner or progress bar)

## Behavior

- Drop or select a file → hashing begins immediately for all selected algorithms in parallel
- Large files (>50 MB) show a progress/spinner state; the UI remains responsive
- Changing algorithm checkboxes re-runs only the newly selected algorithms (cache previously computed digests in component state)
- Copy button copies the hex digest to clipboard; shows brief "Copied!" confirmation
- Expected hash comparison is case-insensitive and strips leading/trailing whitespace
- No file is uploaded anywhere — all processing is in-browser
- Error state if `crypto.subtle` is unavailable (non-HTTPS context): show inline warning

## Tests: `tests/lib/fileHash.test.js`

```
describe('bufferToHex')
  - empty buffer → ''
  - [0x00] → '00'
  - [0xde, 0xad, 0xbe, 0xef] → 'deadbeef'
  - [0xff] → 'ff'

describe('hashBufferMD5')
  - empty buffer → 'd41d8cd98f00b204e9800998ecf8427e'
  - Buffer of UTF-8 'hello' → '5d41402abc4b2a76b9719d911017c592'
  - Buffer of UTF-8 'abc' → '900150983cd24fb0d6963f7d28e17f72'

describe('hashBufferSHA')
  - SHA-256, empty buffer → 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  - SHA-256, UTF-8 'hello' → '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
  - SHA-512, UTF-8 'abc' → 'ddaf35a193617aba...' (first 16 chars: 'ddaf35a193617aba')
  - SHA-1, UTF-8 'hello' → 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'

describe('hashFile')
  - returns lowercase hex string for MD5
  - returns lowercase hex string for SHA-256
  - resolves with correct MD5 for a known small Blob
```

## Tests: `tests/tools/FileHashCalculator.test.jsx`

```
- renders without crashing
- renders drop zone and algorithm checkboxes
- all four algorithm checkboxes are checked by default
- expected hash input field is present
- no hash results shown before a file is selected
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/file-hash-calculator`
- Dropping a file triggers hashing and displays results for all checked algorithms
- Copy buttons copy correct digest to clipboard
- Expected hash field correctly shows Match / No Match badge
