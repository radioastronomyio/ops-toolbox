# 18 — UUID v4/v7 Generator

## Objective

Generates cryptographically secure UUIDs in v4 (random) and v7 (time-ordered, sortable) formats using the `uuid` npm package, which derives randomness from `crypto.getRandomValues()`. Supports bulk generation, multiple output formats (standard hyphenated, no-hyphens, uppercase), and nil UUID display.

## Route

`/uuid-generator`

## Dependencies

```
npm install uuid
```

- `uuid` — RFC 4122-compliant UUID generation (v4, v7) using Web Crypto API

## Architecture

### Pure logic file: `src/lib/uuidUtils.js`

```js
// Generate a single UUID v4 string.
// Returns string (lowercase hyphenated, e.g., '550e8400-e29b-41d4-a716-446655440000')
export function generateV4() { ... }

// Generate a single UUID v7 string (time-ordered).
// Returns string
export function generateV7() { ... }

// Generate n UUIDs of the given version.
// version: 'v4' | 'v7'
// Returns Array<string>
export function generateBatch(version, n) { ... }

// Format a UUID string.
// format: 'hyphenated' | 'no-hyphens' | 'uppercase' | 'uppercase-no-hyphens'
// Returns formatted string
export function formatUuid(uuid, format) { ... }

// Validate a UUID string (any version).
// Returns boolean
export function isValidUuid(str) { ... }
```

### React component: `src/tools/UuidGenerator.jsx`

## Inputs

- **Version selector** — toggle buttons: v4 (default), v7
- **Count** — number input: 1–100, default: 1
- **Format selector** — dropdown: Hyphenated (default), No hyphens, UPPERCASE, UPPERCASE no hyphens
- **Generate button**
- **Auto-regenerate toggle** — when on, generates new UUID(s) every time the page is focused or on a manual refresh button click

## Outputs

- **UUID list** — generated UUIDs, one per line in a monospace code block
- **Copy All button** — copies all UUIDs (newline-separated) to clipboard
- **Copy individual button** — per-UUID copy icon for single-UUID generation
- **Timestamp info** (v7 only) — shows the embedded timestamp for v7 UUIDs: "Embedded time: 2026-03-15T09:00:00.000Z"
- **Nil UUID reference** — static display of `00000000-0000-0000-0000-000000000000`

## Behavior

- Clicking Generate (or pressing Enter in the count field) produces new UUIDs immediately
- Version toggle or format change does not auto-regenerate (user must click Generate)
- Count clamped to 1–100; values outside range are corrected on blur
- Copy All copies newline-separated list
- Individual copy buttons appear on hover for each UUID row
- v7 timestamp panel only visible when version is v7 and count is 1

## Tests: `tests/lib/uuidUtils.test.js`

```
describe('generateV4')
  - returns a string matching /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  - successive calls return different values

describe('generateV7')
  - returns a string matching /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  - successive calls return values where v7 UUIDs are sortable (later call > earlier call lexicographically)

describe('generateBatch')
  - generateBatch('v4', 5) → array of length 5
  - all elements are valid v4 UUIDs
  - generateBatch('v7', 3) → array of length 3, all valid v7 UUIDs

describe('formatUuid')
  - '550e8400-e29b-41d4-a716-446655440000', 'no-hyphens' → '550e8400e29b41d4a716446655440000'
  - '550e8400-e29b-41d4-a716-446655440000', 'uppercase' → '550E8400-E29B-41D4-A716-446655440000'
  - '550e8400-e29b-41d4-a716-446655440000', 'hyphenated' → '550e8400-e29b-41d4-a716-446655440000'

describe('isValidUuid')
  - '550e8400-e29b-41d4-a716-446655440000' → true
  - '00000000-0000-0000-0000-000000000000' → true
  - 'not-a-uuid' → false
  - '' → false
```

## Tests: `tests/tools/UuidGenerator.test.jsx`

```
- renders without crashing
- v4 and v7 version toggle buttons are present
- count input is present with default value 1
- Generate button is present
- Copy All button is present
- format selector dropdown is present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/uuid-generator`
- Clicking Generate produces the correct number of UUIDs in the selected version
- Format selector correctly transforms output
- Copy All copies all UUIDs to clipboard as newline-separated string
