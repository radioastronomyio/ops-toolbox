# 16 — Regex Match Tester

## Objective

Interactive regular expression tester that evaluates a regex pattern against test strings in real-time, using the browser's native `RegExp` engine. Highlights all matches inline, shows capture groups, and provides match metadata (index, length). Useful for building and debugging regex patterns for log parsing, validation rules, and data extraction.

## Route

`/regex-tester`

## Dependencies

**None.** Uses native `RegExp`.

## Architecture

### Pure logic file: `src/lib/regexTester.js`

```js
// Compile a regex from pattern string and flags string.
// Returns { regex: RegExp, error: string|null }
export function compileRegex(pattern, flags) { ... }

// Execute regex against a test string.
// Returns { matches: Array<MatchResult>, error: string|null }
// MatchResult: { fullMatch: string, index: number, groups: Array<string|undefined>, namedGroups: object|null }
export function runMatches(regex, testString) { ... }

// Build an array of {text, isMatch, matchIndex} segments for inline highlighting.
// Used by the component to render highlighted test string.
// Returns Array<{text: string, isMatch: boolean, groupIndex: number|null}>
export function buildHighlightSegments(testString, matches) { ... }
```

### React component: `src/tools/RegexTester.jsx`

## Inputs

- **Pattern input** — text field for the regex pattern (without delimiters), e.g., `(\d+)`
- **Flags checkboxes** — g (global), i (case insensitive), m (multiline), s (dotAll) — g checked by default
- **Test string textarea** — multiline input for the string to test against
- **Quick reference** — collapsible cheat-sheet panel with common tokens: `.`, `\d`, `\w`, `\s`, `^`, `$`, `*`, `+`, `?`, `{n,m}`, `(...)`, `(?:...)`, `(?<name>...)`

## Outputs

- **Highlighted test string** — test string rendered with matched substrings highlighted in yellow/amber; capture groups in different colors (up to 4 group colors)
- **Match count badge** — "X matches" (or "No matches")
- **Matches table** — one row per match:
  - #, Full match, Index, Length, Capture groups (if any)
- **Pattern error** — red inline error beneath pattern input if regex is invalid (e.g., "Unterminated group")
- **Named groups panel** — shown if pattern contains `(?<name>...)`, displays name → value pairs

## Behavior

- Results update in real-time as pattern or test string changes (debounced 150 ms)
- Without `g` flag: finds only first match
- RegExp compilation errors show inline red error; test string remains editable
- Catastrophic backtracking is not defended against (native RegExp handles it at browser level)
- Empty pattern clears all results with no error
- Empty test string shows "No matches" with no error
- Quick reference panel is collapsed by default, toggleable

## Tests: `tests/lib/regexTester.test.js`

```
describe('compileRegex')
  - '\\d+', 'g' → { regex: RegExp, error: null }
  - '(unclosed', 'g' → { regex: null, error: <non-null string> }
  - '', 'gi' → { regex: /(?:)/gi, error: null }
  - valid pattern, invalid flag 'z' → { regex: null, error: <non-null> }

describe('runMatches')
  - /\d+/g against 'abc 123 def 456' → 2 matches: '123' at index 4, '456' at index 12
  - /(\w+)/g against 'hello world' → 2 matches with groups ['hello'], ['world']
  - /no-match/ against 'abc' → { matches: [], error: null }
  - /(?<year>\d{4})/ against '2026-03-15' → namedGroups: { year: '2026' }

describe('buildHighlightSegments')
  - 'hello world', [{fullMatch:'hello',index:0}] → [{text:'hello',isMatch:true}, {text:' world',isMatch:false}]
  - no matches → single segment with isMatch:false
  - match at end of string → correct boundary segments
```

## Tests: `tests/tools/RegexTester.test.jsx`

```
- renders without crashing
- pattern input field is present
- test string textarea is present
- flags checkboxes are present (g, i, m, s)
- g flag is checked by default
- quick reference toggle button is present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/regex-tester`
- Entering `\d+` with test string `abc 123 def 456` highlights both numbers
- Invalid regex shows inline error
- Capture groups appear in matches table
