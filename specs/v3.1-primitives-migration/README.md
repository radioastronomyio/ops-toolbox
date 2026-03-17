# Ops Toolbox — v3.1 Shared Primitives Migration

## Overview

Spec 04 of v3 created shared hooks (`useClipboard`, `useDebouncedValue`) and components (`CopyButton`, `ResultPanel`, `ErrorBanner`). No existing tools were migrated. This spec migrates all applicable tools to use the shared primitives, eliminating hand-rolled clipboard, debounce, and error display patterns.

## Scope

This is a single spec with four phases executed in one pass. All changes are mechanical replacements — no new features, no behavior changes. Every tool must produce identical user-visible behavior after migration.

| Phase | Description |
|-------|-------------|
| 01 | Migrate clipboard patterns to useClipboard / CopyButton |
| 02 | Migrate debounce patterns to useDebouncedValue |
| 03 | Migrate error displays to ErrorBanner |
| 04 | Verify and update tests |

## Agent Instructions

1. Read `AGENTS.md` at project root first
2. Read this spec fully before starting
3. Read the shared primitives source files before modifying any tool:
   - `src/hooks/useClipboard.js`
   - `src/hooks/useDebouncedValue.js`
   - `src/components/CopyButton.jsx`
   - `src/components/ResultPanel.jsx`
   - `src/components/ErrorBanner.jsx`
4. Execute phases 01–04 sequentially
5. Run `npm run test` after all phases — all existing tests must still pass
6. **Do NOT commit.** Commits are handled manually after review.

## Branching

```bash
git checkout -b feature/v3.1-primitives-migration
```

---

## Phase 01 — Clipboard Migration

### Pattern to Replace

Tools have a hand-rolled clipboard pattern:

```jsx
const [copied, setCopied] = useState(false);

const handleCopy = () => {
  navigator.clipboard.writeText(someValue).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
};

<button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
```

### Two Replacement Paths

**Path A — `CopyButton` component:** Use when the tool has one copy target and the button is standalone (not embedded in a table row or tightly coupled with other styled buttons).

```jsx
import CopyButton from '../components/CopyButton';
// Remove: copied state, handleCopy function
<CopyButton text={output} />
```

**Path B — `useClipboard` hook:** Use when the tool has multiple copy targets, or the copy button is inline with other action buttons of matching style where dropping in a different component would break visual consistency.

```jsx
import { useClipboard } from '../hooks/useClipboard';
const { copy, copied } = useClipboard();
// Remove: copied state, handleCopy function, setTimeout
// In handler: copy(someValue)
// In JSX: {copied ? 'Copied!' : 'Copy'} — unchanged
```

### Tool-by-Tool Migration Map

| Tool | File | Path | Details |
|------|------|------|---------|
| Password Generator | `PasswordGenerator.jsx` | **B** (`useClipboard`) | Copy button is a large styled action button alongside Regenerate. Keep existing button markup, swap internals. Remove `copied` state + `handleCopy` function. Use `const { copy, copied } = useClipboard()` and call `copy(output)` in onClick. |
| URL Query Encoder | `UrlQueryEncoder.jsx` | **B** — two instances | Has `encodeCopied`/`buildCopied` states and `copyEncode`/`copyBuild` functions. Replace with `const encodeCb = useClipboard()` and `const buildCb = useClipboard()`. Use `encodeCb.copy(encodeOutput)` / `encodeCb.copied` and `buildCb.copy(builtUrl)` / `buildCb.copied`. Remove both state variables and both handler functions. |
| UUID Generator | `UuidGenerator.jsx` | **A** (`CopyButton`) | Replace the "Copy All" button with `<CopyButton text={uuids.join('\n')} label="Copy All" />`. Adjust className if needed to match existing `bg-slate-700` style — pass `className="..."` prop to CopyButton. Remove `copied` state + `handleCopyAll`. |
| Markdown Previewer | `MarkdownPreviewer.jsx` | **B** — two instances | Has `copiedMd`/`copiedHtml` states and `handleCopyMarkdown`/`handleCopyHtml` functions. Replace with `const mdCb = useClipboard()` and `const htmlCb = useClipboard()`. Use `mdCb.copy(markdown)` / `mdCb.copied` and `htmlCb.copy(html)` / `htmlCb.copied`. Remove both state variables and both handler functions. |
| ASCII Banner | `AsciiBanner.jsx` | **A** (`CopyButton`) | Replace the Copy button with `<CopyButton text={output} />`. Keep the Download button as-is. Remove `copied` state + `handleCopy`. |
| SQL Formatter | `SqlFormatter.jsx` | **A** (`CopyButton`) | Replace the Copy button with `<CopyButton text={output} />`. Remove `copied` state + `handleCopy`. |
| Bcrypt Verifier | `BcryptHashVerifier.jsx` | **A** (`CopyButton`) | Replace the inline copy button next to hash result with `<CopyButton text={hashResult} />`. Remove `copied` state + `handleCopy`. |

### Explicitly SKIPPED — FileHashCalculator.jsx

The `FileHashCalculator` uses a per-algorithm clipboard pattern with object-keyed state (`copied[algo]`). This does not map to the single-boolean `useClipboard` hook. **Do not modify this file.** A future enhancement could create a `useMultiClipboard` hook, but that's out of scope.

### Tools With NO Clipboard Pattern (do not touch)

SubnetCalculator, JwtDecoder, JsonYamlConverter, Base64Codec, MermaidRenderer, CidrExpander, MacVendorLookup, UrlParser, UserAgentDecoder, ChmodCalculator, SshKeyGenerator, X509Parser, JsonDiff, CsvToJson, CronParser, RegexTester, UnixEpochTool.

---

## Phase 02 — Debounce Migration

### Pattern to Replace

Manual debounce via `useRef` + `setTimeout` + `clearTimeout`:

```jsx
const debounceRef = useRef(null);
useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    doExpensiveWork(input, optionA);
  }, 150);
  return () => clearTimeout(debounceRef.current);
}, [input, optionA]);
```

### Replacement

```jsx
import { useDebouncedValue } from '../hooks/useDebouncedValue';
const debouncedInput = useDebouncedValue(input, 150);

useEffect(() => {
  doExpensiveWork(debouncedInput, optionA);
}, [debouncedInput, optionA]);
```

Debounce only the primary text input the user types into. Config toggles (flags, font, options) should trigger immediately — they go in the `useEffect` dependency array directly, not through the debounce.

### Tool-by-Tool Migration Map

**RegexTester.jsx (150ms)**

```jsx
const debouncedPattern = useDebouncedValue(pattern, 150);
const debouncedTestString = useDebouncedValue(testString, 150);

useEffect(() => {
  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
  const { regex, error: compileError } = compileRegex(debouncedPattern, flagStr);
  if (compileError) {
    setError(compileError);
    setMatches([]);
    setSegments(debouncedTestString ? [{ text: debouncedTestString, isMatch: false, groupIndex: null }] : []);
    return;
  }
  setError(null);
  const { matches: m } = runMatches(regex, debouncedTestString);
  setMatches(m);
  setSegments(buildHighlightSegments(debouncedTestString, m));
}, [debouncedPattern, debouncedTestString, flags]);
```

Remove: `debounceRef`, manual `clearTimeout`/`setTimeout`, `useRef` import (if unused).

**MarkdownPreviewer.jsx (150ms)**

```jsx
const debouncedMarkdown = useDebouncedValue(markdown, 150);

useEffect(() => {
  setHtml(renderMarkdown(debouncedMarkdown, { gfm, breaks }));
}, [debouncedMarkdown, gfm, breaks]);
```

Remove: `debounceRef`, manual timeout pattern.

**AsciiBanner.jsx (300ms)**

```jsx
const debouncedText = useDebouncedValue(text, 300);

useEffect(() => {
  generateBanner(debouncedText, font, { width, horizontalLayout: layout })
    .then(result => setOutput(result))
    .catch(() => setOutput(''));
}, [debouncedText, font, width, layout]);
```

Remove: `debounceRef`, manual timeout pattern.

### All Other Tools — do not touch

---

## Phase 03 — Error Banner Migration

### Scope

Only migrate standalone error blocks that are visually separate from tool inputs/outputs. Do NOT migrate:
- Errors inside two-pane output areas (Base64Codec, JsonYamlConverter) — these replace output content
- Inline errors next to specific inputs (RegexTester, UrlQueryEncoder) — contextual positioning matters
- Complex status displays (BcryptHashVerifier verify result) — not a simple error

### Migration Map

| Tool | File | Dismiss? | Notes |
|------|------|----------|-------|
| SQL Formatter | `SqlFormatter.jsx` | Yes | Replace `{error && (<div className="px-4 py-3 bg-red-900/40 ...">...` with `<ErrorBanner message={error} onDismiss={() => setError('')} />` |
| Password Generator | `PasswordGenerator.jsx` | No | Replace the `{error && (<div className="p-6 bg-red-900/20 border border-red-500 ...">...` block with `<ErrorBanner message={error} />` |

That's it — only two tools qualify for clean ErrorBanner migration. All others have contextual error displays that should stay as-is.

---

## Phase 04 — Test Updates

### Principle

All existing tests must pass. The migration preserves user-visible behavior. Tests that check DOM text ("Copy", "Copied!") still work because the shared primitives render the same text.

### Likely Breakage Points

1. Tests that query for specific CSS classes on error containers — `ErrorBanner` uses its own classes. Fix the selector if needed.
2. Tests that check the exact DOM nesting of copy buttons — `CopyButton` wraps in its own element. Fix the selector.
3. Tests that mock `setTimeout` for clipboard reset — `useClipboard` handles this internally. The test may need to use `vi.useFakeTimers()` and `vi.advanceTimersByTime(2000)`.

### New Test — Pattern Absence Verification

Create `tests/migration/shared-primitives-usage.test.js`:

```js
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const TOOL_DIR = resolve(__dirname, '../../src/tools');
const CLIPBOARD_EXCLUDED = ['FileHashCalculator.jsx'];

function getToolFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.jsx')) {
      files.push(join(dir, entry.name));
    } else if (entry.isDirectory()) {
      files = files.concat(getToolFiles(join(dir, entry.name)));
    }
  }
  return files;
}

describe('shared primitives adoption', () => {
  const toolFiles = getToolFiles(TOOL_DIR);

  test('no tool uses hand-rolled clipboard pattern (except excluded)', () => {
    const pattern = /setTimeout\(\s*\(\)\s*=>\s*setCopied/;
    for (const file of toolFiles) {
      const name = file.split(/[\\/]/).pop();
      if (CLIPBOARD_EXCLUDED.includes(name)) continue;
      const content = readFileSync(file, 'utf-8');
      expect(content).not.toMatch(pattern);
    }
  });

  test('no tool uses hand-rolled debounce pattern', () => {
    const pattern = /debounceRef\.current\s*=\s*setTimeout/;
    for (const file of toolFiles) {
      const content = readFileSync(file, 'utf-8');
      expect(content).not.toMatch(pattern);
    }
  });
});
```

---

## Verification Checklist

After all phases:

- [ ] `npm run test` — all tests pass
- [ ] `grep -r "setTimeout.*setCopied" src/tools/` returns only `FileHashCalculator.jsx`
- [ ] `grep -r "debounceRef" src/tools/` returns zero results
- [ ] Every migrated tool's Copy button still works (same visible text, same behavior)
- [ ] Every debounced tool still debounces on fast typing
- [ ] No visual or behavioral changes in any tool
- [ ] Pattern absence test passes

## Do NOT

- Do not change tool logic, layouts, or features — only swap clipboard/debounce/error implementation
- Do not migrate `FileHashCalculator.jsx` clipboard (per-algo pattern)
- Do not migrate contextual inline errors (only standalone error banners)
- Do not add new features to any tool
- Do not modify shared primitive source files in `src/hooks/` or `src/components/`
- Do not create new shared primitives
