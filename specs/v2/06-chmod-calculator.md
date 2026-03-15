# 06 — Chmod Permission Calculator

## Objective

Bidirectional converter between octal (e.g., `755`) and symbolic (e.g., `rwxr-xr-x`) Unix file permissions. Interactive checkboxes for each permission bit.

## Route

`/chmod-calculator`

## Dependencies

**None.** Pure bitwise operations.

## Architecture

### Pure logic: `src/lib/chmod.js`

```js
// Convert octal string (e.g., '755') to permission object
// Returns { owner: { read, write, execute }, group: { ... }, other: { ... }, octal, symbolic }
export function octalToPermissions(octalStr) { ... }

// Convert permission object back to octal string
export function permissionsToOctal(perms) { ... }

// Convert permission object to symbolic string (e.g., 'rwxr-xr-x')
export function permissionsToSymbolic(perms) { ... }

// Convert symbolic string to permission object
export function symbolicToPermissions(symbolic) { ... }

// Convert octal string directly to symbolic
export function octalToSymbolic(octalStr) { ... }

// Convert symbolic directly to octal
export function symbolicToOctal(symbolic) { ... }
```

Permission bits per digit: read=4, write=2, execute=1.

### React component: `src/tools/ChmodCalculator.jsx`

## Inputs

Three input modes, all synced bidirectionally:

1. **Octal input** — text field for 3-digit octal (e.g., `755`)
2. **Symbolic input** — text field for symbolic notation (e.g., `rwxr-xr-x`)
3. **Checkbox grid** — 3×3 grid of checkboxes:

| | Read | Write | Execute |
|---|---|---|---|
| Owner | ☑ | ☑ | ☑ |
| Group | ☑ | ☐ | ☑ |
| Other | ☑ | ☐ | ☑ |

Changing any input updates all three representations immediately.

## Outputs

- **Octal notation** — large, prominent display
- **Symbolic notation** — large, prominent display
- **Linux command** — `chmod 755 filename`
- **Common presets** — clickable quick-select buttons:
  - `777` (rwxrwxrwx) — "Full access"
  - `755` (rwxr-xr-x) — "Standard directory"
  - `644` (rw-r--r--) — "Standard file"
  - `600` (rw-------) — "Private file"
  - `400` (r--------) — "Read-only"

## Behavior

- Default: `755`
- Clicking a preset fills all inputs
- All inputs are bidirectionally synced
- Invalid octal (e.g., `999`, `abc`) shows inline error
- Invalid symbolic (wrong length, invalid chars) shows inline error

## Tests: `tests/lib/chmod.test.js`

```
describe('octalToSymbolic')
  - '755' → 'rwxr-xr-x'
  - '644' → 'rw-r--r--'
  - '777' → 'rwxrwxrwx'
  - '000' → '---------'
  - '400' → 'r--------'

describe('symbolicToOctal')
  - 'rwxr-xr-x' → '755'
  - 'rw-r--r--' → '644'
  - '---------' → '000'

describe('octalToPermissions')
  - '755' → owner: {read:true, write:true, execute:true}, group: {read:true, write:false, execute:true}, ...
  - '000' → all false

describe('permissionsToOctal')
  - round-trips correctly with octalToPermissions for '755', '644', '777', '000'
```

## Tests: `tests/tools/ChmodCalculator.test.jsx`

```
- renders without crashing
- displays default 755 in octal and symbolic
- clicking a preset updates displayed values
- checkbox grid renders with correct initial state
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/chmod-calculator`
- Bidirectional sync between all three input modes works
- Presets fill correctly
