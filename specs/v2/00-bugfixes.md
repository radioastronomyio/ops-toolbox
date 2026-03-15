# 00 — Bugfixes (Existing Tools)

## Objective

Fix three issues in existing tools before adding new ones.

---

## Fix 1: Password Entropy shows NaN

### Problem

`calculateEntropy()` in `src/lib/password.js` accepts `charset` as its second parameter and internally calls `charset.length`. But both call sites in `PasswordGenerator.jsx` pass `charset.length` (a number). Calling `.length` on a number returns `undefined`, producing `NaN` from `Math.log2()`.

### Fix

Change the function signature in `src/lib/password.js` to accept `poolSize` (a number) directly:

```js
export function calculateEntropy(length, poolSize) {
  if (length === 0 || !poolSize) return 0;
  return Math.floor(length * Math.log2(poolSize));
}
```

No changes needed in `PasswordGenerator.jsx` — it already passes `charset.length`.

### Test update

In `tests/lib/password.test.js`, verify:
- `calculateEntropy(24, 86)` → `Math.floor(24 * Math.log2(86))` = 153
- `calculateEntropy(8, 26)` → 37
- `calculateEntropy(0, 86)` → 0
- `calculateEntropy(24, 0)` → 0

Note: The special character pool `'!@#$%^&*()_+-={}|;:,.<>?'` contains **24** characters, so full charset is 26+26+10+24 = **86**, not 87. Fix any test assertions that use 87.

---

## Fix 2: Mermaid Renderer — ELK layout fails to load

### Problem

Console error: `TypeError: e is not iterable` at `registerLayoutLoaders`. The dynamic import of `@mermaid-js/layout-elk` returns an ES module object. The `registerLayoutLoaders` function in mermaid v11 expects the loader registrations, but the module's default export may need to be unwrapped.

### Fix

In `src/tools/mermaid-renderer/MermaidRenderer.jsx`, update the ELK import handler:

```js
useEffect(() => {
  import('@mermaid-js/layout-elk').then(elkModule => {
    const loaders = elkModule.default ?? elkModule;
    if (typeof loaders === 'function') {
      // Some versions export a single registration function
      loaders(mermaid);
      setElkReady(true);
    } else if (loaders && typeof loaders === 'object') {
      mermaid.registerLayoutLoaders(loaders);
      setElkReady(true);
    } else {
      console.error('ELK module format not recognized:', elkModule);
      // Fall back to dagre
      setLayout('dagre');
    }
  }).catch(err => {
    console.error('Failed to load ELK layout engine:', err);
    setLayout('dagre');
  });
}, []);
```

**Important:** If the above still fails, the fallback approach is to check what the module actually exports at runtime. Add a `console.log('ELK module:', Object.keys(elkModule))` temporarily to diagnose, then adjust. The critical behavior is: **if ELK fails, fall back to dagre silently** rather than showing a broken empty preview.

Also update `securityLevel` in `config.js` — `'antiscript'` was deprecated in mermaid v10. Change to `'strict'`:

```js
securityLevel: 'strict',
```

### Test

No unit test for this — it's a runtime integration fix. Verify manually:
- Mermaid renderer loads and displays the default diagram
- Toggling between ELK and Dagre layouts works
- If ELK fails to register, renderer falls back to Dagre without a blank preview

---

## Fix 3: Add Passphrase Generator Mode

### Problem

Password generator only supports random character strings. Users want a "correct horse battery staple" style passphrase option using a word list.

### Architecture

#### Word list: `src/lib/wordlist.js`

Export a const array of words. Use the EFF short wordlist (1296 words, designed for diceware). This is a static array — no fetch, no external dependency.

```js
// src/lib/wordlist.js
export const EFF_SHORT_WORDLIST = [
  'acid', 'acorn', 'acre', 'acts', 'afar', ...
  // Full 1296-word EFF short wordlist
];
```

Source: https://www.eff.org/dice — use the "short wordlist" (5-letter average, 1296 entries = 6^4, maps to 4 dice).

#### Pure logic additions to `src/lib/password.js`

Add:

```js
import { EFF_SHORT_WORDLIST } from './wordlist.js';

export function generatePassphrase(wordCount, separator = '-', capitalize = false) {
  const wordlist = EFF_SHORT_WORDLIST;
  const randomValues = new Uint32Array(wordCount);
  crypto.getRandomValues(randomValues);

  const words = Array.from(randomValues).map(val => {
    const word = wordlist[val % wordlist.length];
    return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });

  return words.join(separator);
}

export function calculatePassphraseEntropy(wordCount, wordlistSize) {
  if (wordCount === 0 || !wordlistSize) return 0;
  return Math.floor(wordCount * Math.log2(wordlistSize));
}
```

#### UI changes to `src/tools/PasswordGenerator.jsx`

Add a mode toggle at the top: **"Password"** | **"Passphrase"**

When mode is "Passphrase":
- Replace length slider with **Word Count** slider: range 3–12, default 6
- Replace character pool toggles with:
  - **Separator** selector: `-` (default), `.`, `_`, ` ` (space), (none)
  - **Capitalize** toggle (capitalize first letter of each word)
- Generated output shows the passphrase
- Entropy calculation uses `calculatePassphraseEntropy(wordCount, 1296)`
- Copy and Regenerate buttons work the same

When mode is "Password":
- Existing behavior unchanged

### Tests: `tests/lib/password.test.js` (additions)

```
describe('generatePassphrase')
  - returns string with correct number of words (split by separator)
  - default separator is '-'
  - capitalize option capitalizes first letter of each word
  - custom separator works (e.g., '.')
  - two consecutive calls produce different results (probabilistic)

describe('calculatePassphraseEntropy')
  - wordCount=6, wordlistSize=1296 → Math.floor(6 * Math.log2(1296)) = 62
  - wordCount=8, wordlistSize=1296 → 82
  - wordCount=0 → 0
```

### Tests: `tests/tools/PasswordGenerator.test.jsx` (additions)

```
- renders mode toggle (Password / Passphrase)
- switching to Passphrase mode shows word count slider
- switching to Passphrase mode hides character pool toggles
- passphrase mode generates output with word separators
```

---

## Done Criteria

- `npm run test` — all existing tests still pass with updated assertions
- Password entropy displays a valid number (not NaN)
- Mermaid renderer displays diagrams on load (ELK or dagre fallback)
- Passphrase mode generates word-based passwords with correct entropy display
