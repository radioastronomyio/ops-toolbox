# 15 — Cron Expression Parser

## Objective

Interactive cron expression tool that translates POSIX cron syntax into human-readable descriptions and displays upcoming scheduled run times. Uses `cronstrue` to convert expressions like `0 */6 * * *` into "Every 6 hours" and native `Date` API to compute next N occurrences. Also supports common presets and a visual field editor.

## Route

`/cron-parser`

## Dependencies

```
npm install cronstrue
```

- `cronstrue` — cron expression to human-readable description
- `Date` API — native, for computing next run times

## Architecture

### Pure logic file: `src/lib/cronUtils.js`

```js
// Convert a cron expression to a human-readable description.
// Returns { description: string, error: string|null }
export function describeExpression(expr) { ... }

// Parse a cron expression string into its 5 fields.
// Returns { minute, hour, dom, month, dow } or null if invalid field count
export function parseFields(expr) { ... }

// Compute the next N scheduled dates from now (or from a given Date).
// Returns Array<Date> of length n, or empty array if expression is invalid.
// Uses simple brute-force iteration (minute-by-minute for up to 4 years).
export function getNextRuns(expr, n, fromDate) { ... }

// Validate whether a cron expression is parseable by cronstrue.
// Returns boolean
export function isValidExpression(expr) { ... }
```

### React component: `src/tools/CronParser.jsx`

## Inputs

- **Cron expression input** — text field, default: `0 9 * * 1-5` (weekdays at 9am)
- **Number of upcoming runs** — dropdown: 5, 10, 20 (default: 5)
- **Timezone selector** — dropdown of common timezones (UTC, America/New_York, America/Los_Angeles, Europe/London, Asia/Tokyo) plus "Local" (default: Local)
- **Preset buttons** — quick-fill common expressions:
  - `* * * * *` — Every minute
  - `0 * * * *` — Every hour
  - `0 9 * * 1-5` — Weekdays at 9am
  - `0 0 * * *` — Daily at midnight
  - `0 0 1 * *` — Monthly on 1st
  - `0 0 * * 0` — Weekly on Sunday

## Outputs

- **Human-readable description** — prominent display, e.g., "At 09:00 AM, Monday through Friday"
- **Field breakdown table** — 5 columns: Minute | Hour | Day of Month | Month | Day of Week — shows parsed value or "Any"
- **Next N run times** — list of upcoming dates/times formatted as: `Mon, 17 Mar 2026 09:00:00 (in 2 days)`
- **Error state** — "Invalid cron expression" if cronstrue throws

## Behavior

- Description and next runs update in real-time as the user types (debounced 300 ms)
- Invalid expression shows red error message under input, clears results
- Preset buttons fill the input field and immediately trigger parse
- Timezone selector affects how next run times are displayed (uses `Intl.DateTimeFormat`)
- getNextRuns brute-forces minute-by-minute iteration from `fromDate` (defaults to `new Date()`)
- Maximum iteration cap: 4 years worth of minutes (~2.1M iterations) to avoid infinite loops on impossible expressions like `0 0 31 2 *`

## Tests: `tests/lib/cronUtils.test.js`

```
describe('describeExpression')
  - '* * * * *' → { description: 'Every minute', error: null }
  - '0 9 * * 1-5' → description contains '9' and 'Monday' (or equivalent)
  - '0 0 1 * *' → description contains 'midnight' or '12:00 AM' and '1st'
  - 'invalid expr' → { description: '', error: <non-null> }
  - '*/5 * * * *' → description contains '5 minutes'

describe('parseFields')
  - '0 9 * * 1-5' → { minute:'0', hour:'9', dom:'*', month:'*', dow:'1-5' }
  - '*/5 * * * *' → { minute:'*/5', hour:'*', dom:'*', month:'*', dow:'*' }
  - 'too few fields' → null
  - '0 0 1 2 3 4 5' (too many) → null

describe('isValidExpression')
  - '* * * * *' → true
  - '0 9 * * MON-FRI' → true
  - 'not-cron' → false
  - '' → false

describe('getNextRuns')
  - '* * * * *' returns array of length n
  - '0 0 31 2 *' (impossible: Feb 31) → returns [] (no runs found within cap)
  - Returns Date objects
  - Each returned date is after fromDate
```

## Tests: `tests/tools/CronParser.test.jsx`

```
- renders without crashing
- cron expression input is present with default value '0 9 * * 1-5'
- preset buttons are rendered
- next runs count selector is present
- description output area is present
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/cron-parser`
- Typing `* * * * *` shows "Every minute" description
- Preset buttons fill expression and show correct description
- Next run times list updates on expression change
