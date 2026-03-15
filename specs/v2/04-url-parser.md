# 04 — URL Parser & Extractor

## Objective

Parse any URL into its component parts using the native `URL` API. Display protocol, hostname, port, pathname, search params, hash, and origin.

## Route

`/url-parser`

## Dependencies

**None.** Uses native `URL` and `URLSearchParams` APIs.

## Architecture

### Pure logic: `src/lib/url-parser.js`

```js
// Parse a URL string into a structured object
// Returns null if URL is invalid
export function parseURL(urlString) {
  try {
    const url = new URL(urlString);
    return {
      href: url.href,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || '(default)',
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      username: url.username,
      password: url.password ? '••••••' : '', // mask password
      searchParams: Object.fromEntries(url.searchParams),
    };
  } catch {
    return null;
  }
}
```

### React component: `src/tools/UrlParser.jsx`

## Inputs

- **URL** text input — large, full-width
- Live parsing as user types (no button needed, debounce 200ms)
- Default: `https://example.com:8080/path/to/page?key=value&foo=bar#section`

## Outputs

Display each URL component in its own labeled row:

- Protocol, Hostname, Port, Path, Query String, Hash, Origin, Username
- **Search Parameters** table: key-value pairs from URLSearchParams, each on its own row
- If URL is invalid, show inline error: "Invalid URL format"

## Tests: `tests/lib/url-parser.test.js`

```
describe('parseURL')
  - full URL with all parts → correctly extracts each field
  - 'https://example.com' → hostname 'example.com', port '(default)', path '/'
  - URL with multiple query params → searchParams object has all key-value pairs
  - URL with hash → hash extracted
  - URL with username:password → password masked
  - 'not a url' → returns null
  - '' → returns null
```

## Tests: `tests/tools/UrlParser.test.jsx`

```
- renders without crashing
- displays parsed components for valid URL
- shows error for invalid URL
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/url-parser`
- Live parsing works as user types
