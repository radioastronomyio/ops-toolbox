# 05 — Base64 Codec

## Objective

Encode and decode Base64 strings. Supports UTF-8 text properly (not just ASCII).

## Route

`/base64`

## Dependencies

**None.** Uses native browser APIs.

## Architecture

### Pure logic: `src/lib/base64.js`

Export these pure functions:

- `encodeBase64(text)` — UTF-8 safe encode. Returns base64 string.
- `decodeBase64(base64String)` — UTF-8 safe decode. Returns decoded text. Throws on invalid input.

**Encode (text → Base64):**
```js
export function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}
```

**Decode (Base64 → text):**
```js
export function decodeBase64(base64String) {
  const binary = atob(base64String);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
```

### React component: `src/tools/Base64Codec.jsx`

Imports from `src/lib/base64.js`, handles UI state.

## Inputs

- Two-pane layout (like the JSON/YAML converter)
- Left pane: input textarea
- Right pane: output (read-only)
- Direction toggle: "Encode" / "Decode"

## Outputs

- Converted string in output pane
- If decode error (invalid Base64): show error in output pane
- Show byte count of output as a subtle label

## Error Handling

- Invalid Base64 on decode: "Invalid Base64 string — contains characters outside the Base64 alphabet."
- Empty input: empty output (no error)

## UI Notes

- Monospace font in both panes
- Same layout pattern as the JSON/YAML converter for visual consistency
- Direction toggle between pane headers
- Spellcheck off

## Tests: `tests/lib/base64.test.js`

```
describe('encodeBase64')
  - 'Hello, World!' → 'SGVsbG8sIFdvcmxkIQ=='
  - '' (empty string) → '' (empty string)
  - 'café' → 'Y2Fmw6k=' (UTF-8 encoding of é is 2 bytes)
  - 'こんにちは' → correct base64 (verify round-trip)

describe('decodeBase64')
  - 'SGVsbG8sIFdvcmxkIQ==' → 'Hello, World!'
  - '' → ''
  - 'Y2Fmw6k=' → 'café'
  - 'not-valid-base64!!!' → throws

describe('round-trip')
  - decodeBase64(encodeBase64(text)) === text for: ASCII, UTF-8 (café), emoji (🚀), CJK (こんにちは)
```

## Tests: `tests/tools/Base64Codec.test.jsx`

```
- renders without crashing
- encodes text input and shows base64 output
- shows error for invalid base64 in decode mode
- direction toggle switches between Encode and Decode labels
```

## Done Criteria

- `npm run test -- tests/lib/base64.test.js` — all pass
- `npm run test -- tests/tools/Base64Codec.test.jsx` — all pass
- Component renders and converts correctly at `/base64`
