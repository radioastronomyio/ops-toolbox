# 10 — Bcrypt Hash Verifier

## Objective

Client-side tool for hashing plain-text strings with bcrypt and verifying plain-text passwords against existing bcrypt hashes. Uses `bcryptjs` — a pure-JavaScript port of bcrypt that runs entirely in the browser without any server calls. Useful for testing bcrypt hashes during development or validating password storage in authentication systems.

## Route

`/bcrypt-hash-verifier`

## Dependencies

```
npm install bcryptjs
```

- `bcryptjs` — pure-JS bcrypt implementation, browser-compatible

## Architecture

### Pure logic file: `src/lib/bcryptUtils.js`

```js
// Hash a plain-text string with bcrypt.
// saltRounds: number (4–14)
// Returns Promise<string> — bcrypt hash string (e.g., '$2a$10$...')
export async function hashPassword(plainText, saltRounds) { ... }

// Verify a plain-text string against a bcrypt hash.
// Returns Promise<boolean>
export async function verifyPassword(plainText, hash) { ... }

// Validate that a string looks like a bcrypt hash (basic format check).
// Returns boolean
export function isBcryptHash(str) { ... }
```

### React component: `src/tools/BcryptHashVerifier.jsx`

Two-panel layout: **Hash** panel (left/top) and **Verify** panel (right/bottom).

## Inputs

**Hash panel:**
- **Plain text input** — text field for the string to hash
- **Salt rounds selector** — dropdown or slider: 4, 6, 8, 10 (default), 12, 14
- **Hash button**

**Verify panel:**
- **Plain text input** — string to test against the hash
- **Bcrypt hash input** — the stored hash to verify against
- **Verify button**

## Outputs

**Hash panel:**
- Generated bcrypt hash — monospace, full-width, with Copy button
- Time taken (e.g., "Hashed in 312 ms")
- Cost factor note (e.g., "10 rounds ≈ ~300 ms on this device")

**Verify panel:**
- Green "Valid — password matches" badge on success
- Red "Invalid — password does not match" badge on failure
- Red "Invalid hash format" badge if the hash field is not a valid bcrypt hash

## Behavior

- Hash and verify operations are triggered by button click (not auto-run — bcrypt is CPU-intensive)
- While hashing/verifying, buttons are disabled and show a spinner with text: "Hashing…" / "Verifying…"
- Salt rounds dropdown updates a live cost estimate label: "~Xms on average hardware"
  - 10 rounds ≈ 100–300 ms, 12 ≈ 400–1200 ms, 14 ≈ 1600+ ms
- Plain-text inputs are never stored or sent anywhere
- Both panels operate independently
- "Copy" button on the generated hash copies to clipboard with brief "Copied!" confirmation
- Clearing the plain-text field resets result state

## Tests: `tests/lib/bcryptUtils.test.js`

```
describe('isBcryptHash')
  - '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' → true
  - '$2b$12$EXRkfkdmXn2gzds2SSitu.MW9.TNm0Uqn/9gfY8TfHGm5dVtBt8' → true
  - 'notahash' → false
  - '' → false
  - '$1$notbcrypt$...' → false

describe('hashPassword')
  - returns a string starting with '$2a$' or '$2b$'
  - returned hash is verifiable with bcryptjs.compare
  - salt rounds 4: hash round-trips correctly

describe('verifyPassword')
  - correct plain text → resolves true
  - wrong plain text → resolves false
  - valid hash format but wrong input → resolves false
```

## Tests: `tests/tools/BcryptHashVerifier.test.jsx`

```
- renders without crashing
- Hash panel: plain text input, salt rounds selector, and Hash button are present
- Verify panel: plain text input, hash input, and Verify button are present
- Hash button is present and not disabled initially
- Verify button is present and not disabled initially
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/bcrypt-hash-verifier`
- Hashing a string with any salt rounds produces a valid bcrypt hash
- Verifying correct plain text against its hash shows "Valid" badge
- Verifying incorrect plain text shows "Invalid" badge
