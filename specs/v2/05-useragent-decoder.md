# 05 — User-Agent Decoder

## Objective

Parse a User-Agent string into its component parts: browser name/version, OS name/version, device type, and engine.

## Route

`/useragent-decoder`

## Dependencies

- `ua-parser-js` — client-side UA string parser

Install: `npm install ua-parser-js`

## Architecture

### React component: `src/tools/UserAgentDecoder.jsx`

No separate lib file needed — `ua-parser-js` is already a well-structured library.

## Inputs

- **User-Agent string** textarea — large, multiline
- **"Use My Browser"** button — auto-fills with `navigator.userAgent`
- Default: pre-filled with the user's own browser UA string

## Outputs

Display parsed results in labeled cards/sections:

- **Browser:** name, version, major version
- **Engine:** name, version
- **OS:** name, version
- **Device:** type (desktop/mobile/tablet), vendor, model (if detectable)
- **CPU:** architecture (if detectable)

Show "Not detected" for any field the parser can't extract.

## Behavior

- Parse on input change (debounce 300ms)
- Pre-fill with current browser UA on mount
- Invalid or empty input shows "Enter a User-Agent string to decode"

## Tests: `tests/tools/UserAgentDecoder.test.jsx`

```
- renders without crashing
- pre-fills with a UA string on mount
- displays browser name and version for a known UA string
- displays OS information
- shows "Not detected" for missing fields
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/useragent-decoder`
- Correctly parses common UA strings (Chrome, Firefox, Safari, mobile)
