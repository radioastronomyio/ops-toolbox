# 03 — MAC Vendor Lookup

## Objective

Look up the vendor/manufacturer for a given MAC address by calling an external API. This is the one tool in the suite that makes a network request — all user data stays client-side; the API only returns vendor information.

## Route

`/mac-lookup`

## Dependencies

**None.** Uses native `fetch()`.

## API Contract

**Endpoint:** `https://api.donfather.dev/api/mac-lookup/{mac}`

- `{mac}` — First 6 hex chars (OUI prefix), normalized. Accept any common MAC format from the user and extract the OUI.
- **Response (expected):**
  ```json
  {
    "prefix": "AA:BB:CC",
    "vendor": "Cisco Systems, Inc."
  }
  ```
- **Error/unavailable:** HTTP 404 (not found), 500 (server error), or network failure.

**Important:** This API may not exist yet. The tool must handle unavailability gracefully.

## Architecture

### Pure logic: `src/lib/mac.js`

```js
// Normalize any MAC format to colon-separated uppercase
// Accepts: AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, AABB.CCDD.EEFF, AABBCCDDEEFF
// Returns uppercase colon-separated or null if invalid
export function normalizeMac(input) { ... }

// Extract OUI prefix (first 3 octets) from a normalized MAC
export function extractOUI(normalizedMac) { ... }

// Validate MAC address format
export function isValidMac(input) { ... }
```

### React component: `src/tools/MacVendorLookup.jsx`

## Inputs

- **MAC Address** text input — accepts any common format
- **Lookup** button (also triggers on Enter)

## Outputs

- **Normalized MAC** display — shows the cleaned-up MAC in `AA:BB:CC:DD:EE:FF` format
- **OUI Prefix** — the first 3 octets used for lookup
- **Vendor** — the manufacturer name returned by the API
- **Status states:**
  - Loading: "Looking up vendor..."
  - Success: vendor name displayed
  - Not found: "No vendor found for this OUI prefix"
  - API unavailable: "Vendor lookup API is not available. This feature requires api.donfather.dev which may not be deployed yet."
  - Invalid MAC: "Invalid MAC address format"

## Behavior

- Normalize the input MAC on submit
- Extract OUI, call `fetch(`https://api.donfather.dev/api/mac-lookup/${oui}`)`
- Handle all error cases (network error, 404, 500, timeout)
- Show a brief note below the result: "Note: This tool queries api.donfather.dev for vendor data. No user data is transmitted — only the OUI prefix is sent."

## Tests: `tests/lib/mac.test.js`

```
describe('normalizeMac')
  - 'AA:BB:CC:DD:EE:FF' → 'AA:BB:CC:DD:EE:FF'
  - 'aa:bb:cc:dd:ee:ff' → 'AA:BB:CC:DD:EE:FF'
  - 'AA-BB-CC-DD-EE-FF' → 'AA:BB:CC:DD:EE:FF'
  - 'AABB.CCDD.EEFF' → 'AA:BB:CC:DD:EE:FF'
  - 'AABBCCDDEEFF' → 'AA:BB:CC:DD:EE:FF'
  - 'invalid' → null
  - '' → null

describe('extractOUI')
  - 'AA:BB:CC:DD:EE:FF' → 'AA:BB:CC'

describe('isValidMac')
  - valid formats → true
  - 'GG:HH:II:JJ:KK:LL' → false (invalid hex)
  - too short → false
```

## Tests: `tests/tools/MacVendorLookup.test.jsx`

```
- renders without crashing
- shows error for invalid MAC input
- displays normalized MAC after submission
- (mock fetch) shows vendor name on successful API response
- (mock fetch) shows appropriate message on API failure
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/mac-lookup`
- Valid MAC input shows normalized format and OUI
- API success shows vendor name
- API failure shows graceful fallback message (not a crash)
