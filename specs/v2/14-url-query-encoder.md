# 14 — URL Query Encoder

## Objective

Bidirectional URL encoding/decoding tool for query strings, full URLs, and individual components. Uses native `encodeURIComponent` / `decodeURIComponent` and `URL` API. Supports encoding full query strings, parsing individual key-value pairs, and constructing/deconstructing complete URLs. Essential for debugging REST API calls and building safe URL parameters.

## Route

`/url-encoder`

## Dependencies

**None.** Uses native `encodeURIComponent`, `decodeURIComponent`, and `URL` browser APIs.

## Architecture

### Pure logic file: `src/lib/urlEncoder.js`

```js
// Encode a string using encodeURIComponent.
// Returns encoded string.
export function encodeComponent(str) { ... }

// Decode a percent-encoded string using decodeURIComponent.
// Returns { decoded: string, error: string|null }
export function decodeComponent(str) { ... }

// Parse a URL string into its components using the URL API.
// Returns { protocol, hostname, port, pathname, search, hash, params: Object, error }
// params is a plain object of all query key-value pairs
export function parseUrl(urlString) { ... }

// Build a URL from a base and a params object.
// Returns full URL string.
export function buildUrl(base, params) { ... }

// Parse a raw query string (with or without leading '?') into key-value pairs.
// Returns Array<{key: string, encoded: string, decoded: string}>
export function parseQueryString(qs) { ... }
```

### React component: `src/tools/UrlQueryEncoder.jsx`

Three-tab layout: **Encode/Decode**, **URL Parser**, **Query Builder**.

## Inputs

**Encode/Decode tab:**
- **Input textarea** — raw or percent-encoded string
- **Mode toggle** — Encode / Decode (default: Encode)

**URL Parser tab:**
- **URL input** — full URL text field, e.g., `https://api.example.com/search?q=hello world&page=2`

**Query Builder tab:**
- **Base URL field** — e.g., `https://api.example.com/endpoint`
- **Key-value pair editor** — dynamic list of key/value inputs with Add/Remove row buttons

## Outputs

**Encode/Decode tab:**
- Output text field (read-only monospace) showing encoded or decoded result
- Copy button

**URL Parser tab:**
- Breakdown table: Protocol, Hostname, Port, Pathname, Hash
- Query parameters table: Key | Raw Value | Decoded Value — one row per param

**Query Builder tab:**
- Assembled URL (read-only, monospace, full width)
- Copy button

## Behavior

- Encode/Decode output updates in real-time as the user types (no button needed)
- Decode errors (malformed percent-encoding) show inline error: "Malformed encoding: [detail]"
- URL Parser validates input; shows "Invalid URL" if the URL API throws
- Query Builder assembles URL live as rows are edited
- Empty key fields in Query Builder are skipped
- All output fields have Copy buttons

## Tests: `tests/lib/urlEncoder.test.js`

```
describe('encodeComponent')
  - 'hello world' → 'hello%20world'
  - 'a=1&b=2' → 'a%3D1%26b%3D2'
  - 'https://example.com' → 'https%3A%2F%2Fexample.com'
  - '' → ''
  - 'abc123-_.~' → 'abc123-_.~' (unreserved chars unchanged)

describe('decodeComponent')
  - 'hello%20world' → { decoded: 'hello world', error: null }
  - 'a%3D1%26b%3D2' → { decoded: 'a=1&b=2', error: null }
  - '%GG' → { decoded: '', error: <non-null> }
  - '' → { decoded: '', error: null }

describe('parseQueryString')
  - '?name=Alice&age=30' → [{key:'name',encoded:'Alice',decoded:'Alice'}, {key:'age',encoded:'30',decoded:'30'}]
  - 'q=hello%20world' → [{key:'q',encoded:'hello%20world',decoded:'hello world'}]
  - '' → []
  - '?empty=' → [{key:'empty',encoded:'',decoded:''}]

describe('parseUrl')
  - 'https://example.com/path?q=test#section' → protocol:'https:', hostname:'example.com', pathname:'/path', hash:'#section', params:{q:'test'}
  - 'not a url' → { error: <non-null> }

describe('buildUrl')
  - 'https://api.example.com', {q:'hello world',page:'2'} → 'https://api.example.com?q=hello+world&page=2' or encodeURIComponent equivalent
```

## Tests: `tests/tools/UrlQueryEncoder.test.jsx`

```
- renders without crashing
- three tabs (Encode/Decode, URL Parser, Query Builder) are present
- Encode/Decode tab shows input textarea and output field
- URL Parser tab shows URL input field
- Query Builder tab shows base URL field and Add Row button
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/url-encoder`
- Typing in Encode mode produces percent-encoded output in real-time
- URL Parser correctly breaks down a full URL with query params
- Query Builder assembles a valid URL from key-value inputs
