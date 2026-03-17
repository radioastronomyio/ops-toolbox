# 04 — Shared Hooks and Components

## Objective

The 25-tool codebase has repeated patterns across nearly every tool component: clipboard copy with "Copied!" feedback, debounced input, result/output panels with copy buttons, and error banners. Each tool implements these independently with slight variations. This creates copy-paste maintenance and inconsistent UX (some tools reset "Copied!" after 2000ms, some after 1500ms, some don't reset at all).

Extract shared hooks and components that tools can opt into. This is additive — existing tools continue working. New tools should use these, and existing tools can be migrated incrementally (not in this spec).

## Architecture

### New file: `src/hooks/useClipboard.js`

A hook that wraps `navigator.clipboard.writeText` with "Copied!" state management.

```js
import { useState, useCallback, useRef } from 'react';

/**
 * Clipboard copy hook with automatic reset.
 * @param {number} resetMs - Time in ms before `copied` resets to false. Default 2000.
 * @returns {{ copy: (text: string) => Promise<void>, copied: boolean }}
 */
export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  }, [resetMs]);

  return { copy, copied };
}
```

Key points:
- Clears previous timeout on rapid re-copies (no stale state)
- Returns a stable `copy` function (memoized with useCallback)
- Fails silently with console error (clipboard API can fail in non-secure contexts)

### New file: `src/hooks/useDebouncedValue.js`

A hook that debounces a value by a configurable delay.

```js
import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the input value.
 * @param {*} value - The value to debounce.
 * @param {number} delayMs - Debounce delay in milliseconds. Default 300.
 * @returns {*} The debounced value.
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
```

### New file: `src/components/CopyButton.jsx`

A self-contained copy button that uses `useClipboard` internally.

```jsx
import { useClipboard } from '../hooks/useClipboard';

/**
 * A button that copies text to clipboard and shows "Copied!" feedback.
 * @param {{ text: string, label?: string, className?: string }} props
 */
export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const { copy, copied } = useClipboard();

  return (
    <button
      onClick={() => copy(text)}
      disabled={!text}
      className={`px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded text-xs transition-colors ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
```

### New file: `src/components/ResultPanel.jsx`

A standardized output panel with optional copy button, used for displaying tool results.

```jsx
import CopyButton from './CopyButton';

/**
 * A read-only output panel with optional copy button.
 * @param {{ value: string, label?: string, error?: string|null, copyable?: boolean, mono?: boolean, className?: string }} props
 */
export default function ResultPanel({
  value = '',
  label = 'Output',
  error = null,
  copyable = true,
  mono = true,
  className = '',
}) {
  const hasContent = value || error;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm text-slate-400">{label}</label>
        {copyable && value && !error && <CopyButton text={value} />}
      </div>
      <div
        className={`w-full min-h-[3rem] px-3 py-2 rounded-lg text-sm overflow-auto ${
          mono ? 'font-mono' : ''
        } ${
          error
            ? 'bg-red-900/20 border-2 border-red-500 text-red-400'
            : 'bg-slate-900 border border-slate-700 text-slate-300'
        }`}
      >
        {error ? (
          <div className="whitespace-pre-wrap">{error}</div>
        ) : value ? (
          <pre className="whitespace-pre-wrap">{value}</pre>
        ) : (
          <span className="text-slate-600">No output</span>
        )}
      </div>
    </div>
  );
}
```

### New file: `src/components/ErrorBanner.jsx`

A dismissible error banner for tool-level errors.

```jsx
/**
 * An inline error banner.
 * @param {{ message: string|null, onDismiss?: () => void }} props
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-200 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

## File Summary

| File | Type | Purpose |
|------|------|---------|
| `src/hooks/useClipboard.js` | Hook | Clipboard copy with auto-reset feedback |
| `src/hooks/useDebouncedValue.js` | Hook | Value debouncing |
| `src/components/CopyButton.jsx` | Component | Self-contained copy-to-clipboard button |
| `src/components/ResultPanel.jsx` | Component | Standardized output display with copy |
| `src/components/ErrorBanner.jsx` | Component | Dismissible error message |

## Do NOT

- Do not refactor existing tools to use these primitives in this spec. That's a separate migration task.
- Do not create a `ToolPage` wrapper component yet — that comes in spec 05 if registry metadata supports it.
- Do not add any new npm dependencies. Everything here is pure React.

## Tests: `tests/hooks/useClipboard.test.js`

```
describe('useClipboard')
  - copy() writes text to navigator.clipboard
  - copied is true immediately after copy()
  - copied resets to false after the configured timeout
  - rapid re-copy clears the previous timeout (no double-reset)
  - copy() handles clipboard API failure gracefully (no throw)
```

Use `vi.useFakeTimers()` for timeout testing. Mock `navigator.clipboard.writeText` with `vi.fn()`.

## Tests: `tests/hooks/useDebouncedValue.test.js`

```
describe('useDebouncedValue')
  - returns the initial value immediately
  - updates the debounced value after the delay
  - resets the timer on rapid value changes (only last value propagates)
  - respects custom delay values
```

Use `vi.useFakeTimers()` and `renderHook` from `@testing-library/react`.

## Tests: `tests/components/CopyButton.test.jsx`

```
describe('CopyButton')
  - renders with default "Copy" label
  - renders with custom label
  - is disabled when text prop is empty/falsy
  - calls clipboard API on click
  - shows "Copied!" after click
```

## Tests: `tests/components/ResultPanel.test.jsx`

```
describe('ResultPanel')
  - renders label and empty state when no value
  - renders value in a pre tag
  - renders error state with red styling when error prop is set
  - shows CopyButton when copyable=true and value is present
  - hides CopyButton when copyable=false
  - hides CopyButton when error is present (even if value exists)
  - applies monospace font when mono=true (default)
```

## Tests: `tests/components/ErrorBanner.test.jsx`

```
describe('ErrorBanner')
  - renders nothing when message is null
  - renders the error message
  - renders dismiss button when onDismiss is provided
  - calls onDismiss when dismiss button is clicked
  - does not render dismiss button when onDismiss is not provided
```

## Done Criteria

- `npm run test` — all tests pass (new + existing)
- All 5 new files exist and export correctly
- No existing tool behavior changed
- Hooks are importable from `src/hooks/`
- Components are importable from `src/components/`
- `useClipboard` correctly manages timeout cleanup
- `ResultPanel` switches between value/error/empty states
