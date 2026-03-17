# 01 — Fix RNG Bias in Password and Passphrase Generation

## Objective

Both `generatePassword()` and `generatePassphrase()` in `src/lib/password.js` use modulo reduction (`randomValue % poolLength`) to map random bytes into the character/word pool. This introduces bias unless `poolLength` evenly divides the RNG range (256 for `Uint8Array`, 2^32 for `Uint32Array`). Neither the character sets (86 chars) nor the wordlist (1296 words) divide evenly. For a security-facing tool, this must use rejection sampling.

## Problem Detail

**Password generation (line ~31):**
`Uint8Array` produces values 0–255. With a charset of 86 characters, `256 % 86 = 84`, meaning the first 84 characters have a ~1.17% chance each while the last 2 have a ~0.78% chance. Over long passwords this is measurable.

**Passphrase generation (line ~57):**
`Uint32Array` produces values 0–4294967295. With 1296 words, `4294967296 % 1296 = 1072`, meaning 1072 of the 1296 words have one extra mapping. The bias is smaller (~0.025%) but still wrong in principle for a security tool.

## Fix: Rejection Sampling

Replace modulo with rejection sampling in both functions. The pattern is:

1. Calculate the largest multiple of `poolLength` that fits within the RNG range
2. If the random value falls at or above that threshold, discard and redraw
3. Otherwise, use `value % poolLength` (now uniform)

## Files to Modify

### `src/lib/password.js`

**Replace `generatePassword`:**

```js
export function generatePassword(length, options) {
  const charset = buildCharset(options);
  if (!charset) {
    throw new Error('At least one character set must be enabled');
  }

  const poolSize = charset.length;
  // Largest multiple of poolSize that fits in a Uint8 (0–255)
  const maxValid = 256 - (256 % poolSize);

  let password = '';
  while (password.length < length) {
    const randomValues = window.crypto.getRandomValues(new Uint8Array(length * 2));
    for (let i = 0; i < randomValues.length && password.length < length; i++) {
      if (randomValues[i] < maxValid) {
        password += charset[randomValues[i] % poolSize];
      }
      // else: reject this byte, try next
    }
  }

  return password;
}
```

Key points:
- Over-request bytes (`length * 2`) to minimize redraw loops. For 86 chars, rejection rate is ~66% of 256 = ~170/256 accepted. Actually: `maxValid = 256 - (256 % 86) = 256 - 84 = 172`. So 172/256 ≈ 67% acceptance. `length * 2` provides enough headroom.
- For very large charsets (close to 256), rejection rate approaches 0. For small charsets, it's higher but still terminates quickly.
- The while loop guarantees we always get enough characters.

**Replace `generatePassphrase`:**

```js
export function generatePassphrase(wordCount, separator = '-', capitalize = false) {
  const wordlist = EFF_SHORT_WORDLIST;
  const poolSize = wordlist.length;
  // Largest multiple of poolSize that fits in a Uint32 (0–4294967295)
  const maxValid = 4294967296 - (4294967296 % poolSize);

  const words = [];
  while (words.length < wordCount) {
    const randomValues = window.crypto.getRandomValues(new Uint32Array(wordCount * 2));
    for (let i = 0; i < randomValues.length && words.length < wordCount; i++) {
      if (randomValues[i] < maxValid) {
        let word = wordlist[randomValues[i] % poolSize];
        if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(word);
      }
    }
  }

  return words.join(separator);
}
```

Same pattern: over-request, reject values above the uniform threshold, loop until we have enough.

## Do NOT Modify

- `calculateEntropy` — already correct
- `calculatePassphraseEntropy` — already correct
- `buildCharset` — already correct
- `wordlist.js` — already fixed in prior pass

## Tests: `tests/lib/password.test.js`

Update or add the following tests. Existing tests for `calculateEntropy`, `calculatePassphraseEntropy`, and `buildCharset` should remain unchanged.

```
describe('generatePassword — rejection sampling')
  - generates a password of the requested length (8, 16, 32, 64)
  - all characters in output are from the selected charset
  - throws if no character set is enabled
  - two consecutive calls produce different results (probabilistic — run 10x, assert not all equal)
  - works with a single character set enabled (e.g., lowercase only — pool=26, high rejection rate)

describe('generatePassphrase — rejection sampling')
  - generates correct number of words (split by separator)
  - all words in output exist in EFF_SHORT_WORDLIST
  - default separator is '-'
  - capitalize option capitalizes first letter of each word
  - custom separator works
  - two consecutive calls produce different results (probabilistic)
```

The critical new test is **"all characters/words in output are from the pool"** — this validates the rejection sampling isn't introducing off-by-one errors.

Add a statistical distribution test (optional but recommended):

```
describe('generatePassword — distribution uniformity')
  - generates 10000 single-character passwords with lowercase only (pool=26)
  - counts frequency of each character
  - asserts no character appears more than 15% or less than 1% of the time
  (This is a loose bound that will pass deterministically but would catch
   a broken modulo that maps some chars 2x more than others)
```

## Done Criteria

- `npm run test` — all tests pass
- `generatePassword` uses rejection sampling, not modulo
- `generatePassphrase` uses rejection sampling, not modulo
- No `randomValue % charset.length` or `val % wordlist.length` patterns remain in password.js
- Statistical distribution test passes (if implemented)
