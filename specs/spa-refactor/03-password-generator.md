# 03 — Password Generator

## Objective

Generate cryptographically secure random passwords using the Web Crypto API.

## Route

`/password-generator`

## Dependencies

**None.** Uses native `window.crypto.getRandomValues()`.

## Architecture

### Pure logic: `src/lib/password.js`

Export these pure functions:

- `generatePassword(length, charset)` — takes length and charset string, returns generated password. Uses `crypto.getRandomValues()`.
- `buildCharset(options)` — takes `{ uppercase, lowercase, numeric, special }` booleans, returns concatenated charset string or null if all disabled.
- `calculateEntropy(length, charsetSize)` — returns bits of entropy as integer.

Character pools:
```js
const POOLS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  special: '!@#$%^&*()_+-={}|;:,.<>?',
};
```

### React component: `src/tools/PasswordGenerator.jsx`

Imports from `src/lib/password.js`, handles UI state.

## Inputs

- **Length slider:** Range 8–128, default 24. Show current value.
- **Character pool toggles** (checkboxes or toggle buttons):
  - Uppercase (A-Z) — default ON
  - Lowercase (a-z) — default ON
  - Numbers (0-9) — default ON
  - Symbols (!@#$%^&*()_+-={}|;:,.<>?) — default ON

## Outputs

- Generated password displayed large and monospace in a prominent card
- "Copy to Clipboard" button
- "Regenerate" button
- Entropy estimate: `Math.floor(length * Math.log2(charset.length))` bits

## Behavior

- Auto-generate on mount and whenever length or pool toggles change
- Use `useCallback` for the generation function
- If all pools are disabled, show error: "Enable at least one character set."

## UI Notes

- Password display should be the visual focal point — large monospace text, centered
- Copy button with brief "Copied!" feedback (1.5s timeout)
- Slider should show the current value label
- Entropy display can be subtle (small text, muted color)

## Tests: `tests/lib/password.test.js`

```
describe('buildCharset')
  - all enabled → returns string with length 26+26+10+25 = 87
  - only uppercase → returns 26 chars
  - none enabled → returns null

describe('generatePassword')
  - returns string of requested length
  - only contains characters from provided charset
  - two consecutive calls produce different results (probabilistic — run 10x, assert not all identical)

describe('calculateEntropy')
  - length=24, charsetSize=87 → Math.floor(24 * Math.log2(87)) = 153
  - length=8, charsetSize=26 → Math.floor(8 * Math.log2(26)) = 37
  - length=128, charsetSize=10 → Math.floor(128 * Math.log2(10)) = 425
```

Note: `generatePassword` uses `crypto.getRandomValues()` which is available in Node.js 19+ and in jsdom/vitest environments. If it's not available, mock `globalThis.crypto` in the test setup.

## Tests: `tests/tools/PasswordGenerator.test.jsx`

```
- renders without crashing
- displays a generated password on mount
- password display element has monospace styling (font-mono class)
- shows entropy estimate text
- displays error when all character pools are disabled (simulate unchecking all)
```

## Done Criteria

- `npm run test -- tests/lib/password.test.js` — all pass
- `npm run test -- tests/tools/PasswordGenerator.test.jsx` — all pass
- Component renders and generates correctly at `/password-generator`
