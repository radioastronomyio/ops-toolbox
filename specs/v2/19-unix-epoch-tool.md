# 19 — Unix Epoch Time Tool

## Objective

Bidirectional Unix timestamp converter. Converts epoch integers (seconds or milliseconds) to human-readable dates and vice versa, using the native `Date` API. Displays the timestamp in multiple timezones simultaneously. Also shows the current epoch time with a live counter.

## Route

`/epoch-time`

## Dependencies

**None.** Uses native `Date` API and `Intl.DateTimeFormat`.

## Architecture

### Pure logic file: `src/lib/epochUtils.js`

```js
// Convert a Unix timestamp to a Date object.
// Accepts seconds (10-digit) or milliseconds (13-digit) automatically.
// Returns { date: Date, unit: 'seconds'|'milliseconds', error: string|null }
export function fromEpoch(value) { ... }

// Convert a Date object to Unix timestamp in both seconds and milliseconds.
// Returns { seconds: number, milliseconds: number }
export function toEpoch(date) { ... }

// Format a Date in a given timezone using Intl.DateTimeFormat.
// timezone: IANA timezone string (e.g., 'America/New_York') or 'UTC' or 'local'
// Returns formatted string, e.g., 'Mon, 15 Mar 2026 09:00:00 UTC'
export function formatInTimezone(date, timezone) { ... }

// Parse an ISO-8601 or natural date string to a Date object.
// Returns { date: Date, error: string|null }
export function parseHumanDate(str) { ... }

// Detect if a numeric string represents seconds or milliseconds.
// Returns 'seconds' | 'milliseconds'
export function detectUnit(numericStr) { ... }
```

### React component: `src/tools/UnixEpochTool.jsx`

Two-panel layout: **Epoch → Human** and **Human → Epoch**, plus a live "Current Epoch" display.

## Inputs

**Epoch → Human panel:**
- **Epoch input** — numeric text field; accepts both seconds (10-digit) and milliseconds (13-digit)
- **Unit toggle** — Auto-detect (default), Seconds, Milliseconds

**Human → Epoch panel:**
- **Date-time input** — `<input type="datetime-local">` for local time
- **OR** freeform text field for ISO 8601 strings (e.g., `2026-03-15T09:00:00Z`)

## Outputs

**Epoch → Human panel:**
- Detected unit label ("Interpreted as: seconds")
- Formatted date/time in multiple timezones (at minimum: UTC, Local browser timezone, and 3 common zones: America/New_York, Europe/London, Asia/Tokyo)
- ISO 8601 string
- Relative time (e.g., "2 days ago", "in 5 hours") using simple calculation

**Human → Epoch panel:**
- Epoch in seconds
- Epoch in milliseconds
- Both displayed as monospace numbers with Copy buttons

**Live counter (top of page):**
- Current Unix timestamp in seconds, updating every second via `setInterval`
- Copy button

## Behavior

- Epoch → Human: parses on input change in real-time (no button needed)
- Human → Epoch: parses on input change in real-time
- Auto-detect: 13-digit input treated as milliseconds; ≤10-digit as seconds; negative values supported (pre-1970 dates)
- Invalid epoch (non-numeric, out-of-range for Date): shows inline error
- Invalid human date: shows inline error
- Live counter runs on mount, cleared on unmount
- Common quick-presets beneath live counter: "Now", "Start of today (UTC)", "Unix epoch origin (0)"

## Tests: `tests/lib/epochUtils.test.js`

```
describe('detectUnit')
  - '1710500000' (10-digit) → 'seconds'
  - '1710500000000' (13-digit) → 'milliseconds'
  - '0' → 'seconds'
  - '9999999999' (10-digit) → 'seconds'
  - '10000000000' (11-digit) → 'milliseconds'

describe('fromEpoch')
  - '1710500000' → date.getFullYear() === 2024, unit: 'seconds'
  - '0' → date equals new Date(0), unit: 'seconds'
  - '1710500000000' → date equals new Date(1710500000000), unit: 'milliseconds'
  - 'abc' → { error: <non-null> }
  - '-86400' → date is 1 day before epoch (1969-12-31)

describe('toEpoch')
  - new Date(0) → { seconds: 0, milliseconds: 0 }
  - new Date(1000) → { seconds: 1, milliseconds: 1000 }
  - new Date('2026-01-01T00:00:00Z') → { seconds: 1767225600, milliseconds: 1767225600000 }

describe('parseHumanDate')
  - '2026-03-15T09:00:00Z' → { date: valid Date, error: null }
  - '2026-01-01' → { date: valid Date, error: null }
  - 'not a date' → { error: <non-null> }
  - '' → { error: <non-null> }

describe('formatInTimezone')
  - new Date(0), 'UTC' → contains '1970'
  - new Date(0), 'America/New_York' → contains '1969' (Dec 31 1969 in ET)
```

## Tests: `tests/tools/UnixEpochTool.test.jsx`

```
- renders without crashing
- live current epoch counter is displayed
- epoch input field is present
- datetime-local input is present
- timezone output rows include UTC
- Copy buttons are present for epoch values
```

## Done Criteria

- `npm run test` — all pass
- Component renders at `/epoch-time`
- Entering epoch `0` shows 1970-01-01T00:00:00Z in UTC panel
- Live counter increments every second
- Entering a date-time shows correct epoch in seconds and milliseconds
