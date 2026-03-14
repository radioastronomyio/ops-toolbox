# 02 — JWT Decoder

## Objective

Decode and inspect JSON Web Tokens. Display header and payload as formatted JSON. Does NOT validate signatures.

## Route

`/jwt-decoder`

## Dependencies

```
npm install jwt-decode
```

## Inputs

- Large textarea for pasting a JWT string
- Placeholder: a sample JWT (e.g., the standard `eyJhbGciOiJIUzI1NiIs...` example)

## Computation

```js
import { jwtDecode } from 'jwt-decode';

const header = jwtDecode(token, { header: true });
const payload = jwtDecode(token);
```

Before decoding, validate structure: must contain exactly 2 period characters (3 segments).

## Outputs

Two-panel layout (stacked on mobile, side-by-side on desktop):

**Left/Top panel:** Token input textarea
**Right/Bottom panel:** Decoded output with two sections:
1. **Header** — JSON.stringify(header, null, 2) in a `<pre>` block. Use a rose/red accent color for the section label.
2. **Payload** — JSON.stringify(payload, null, 2) in a `<pre>` block. Use an emerald/green accent color for the section label.

If token has `exp` or `iat` claims, display the human-readable date alongside the unix timestamp.

## Error Handling

- Empty input: show "Paste a JWT to inspect" placeholder state
- Structural error (not 3 segments): "Invalid format — a JWT must have three Base64Url segments separated by periods."
- Decode error: "Decoding failed — Base64Url string is malformed."

## UI Notes

- Monospace font for token input and decoded output
- Real-time decoding on input change via `useMemo`
- No debounce needed (jwt-decode is fast)
- Add a note: "Signature is not validated client-side. This tool only decodes the token structure."

## Tests: `tests/tools/JwtDecoder.test.jsx`

Use a known test JWT. You can construct one from base64-encoding known header/payload JSON:

```js
// Test token: header={"alg":"HS256","typ":"JWT"}, payload={"sub":"1234567890","name":"John Doe","iat":1516239022}
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
```

Tests:
```
- renders without crashing
- decodes a valid JWT and displays header alg field
- decodes a valid JWT and displays payload sub field
- shows error for input with wrong number of segments
- shows placeholder state when input is empty
- displays human-readable date for iat claim
```

## Done Criteria

- `npm run test -- tests/tools/JwtDecoder.test.jsx` — all pass
- Component renders and decodes correctly at `/jwt-decoder`
