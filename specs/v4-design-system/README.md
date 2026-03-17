# Ops Toolbox — v4 Design System Implementation

## Overview

This spec implements a cohesive design system across the entire application, replacing the current fragmented slate/sky Tailwind defaults with a mathematically grounded HSL token architecture, dual-theme support (light/dark/system), user-configurable typography, and a restructured home page with live filtering.

## Source

Design decisions derive from two Gemini Deep Research passes:

- `.deep-research/gdr02-design-system-results.pdf` — Token architecture, component patterns, typography, anti-patterns, FOUC prevention
- `.deep-research/gdr02-design-system-results-v2.md` — Layout methodologies, accent color candidates, responsive grid, settings flyout, transition kinetics

Key decisions made during review (not in GDR documents):

- **Accent color:** Desaturated Teal (Hue 180) — Candidate One from v2
- **Font size:** User-configurable with 14px default, not fixed 13px
- **Home page:** Unified fluid grid with live filter + category pills, no recently-used
- **Navigation:** Search/filter input, not command palette
- **Amber accent:** Rejected (theatrical)

## Execution Order

Phases execute sequentially. Each phase builds on the previous — tokens must exist before components can consume them.

| Phase | Description | Depends On |
|-------|-------------|------------|
| 01 | Design token CSS + Tailwind config lockdown | None |
| 02 | Typography integration (fonts, scale, configurable sizing) | 01 |
| 03 | FOUC prevention + theme engine foundation | 01, 02 |
| 04 | Transition kinetics (CSS custom properties for motion) | 01 |
| 05 | Settings flyout component (theme, density, font family) | 01, 02, 03 |
| 06 | Global shell migration (ToolLayout, NotFound) | 01–05 |
| 07 | Home page restructure (DirectoryGrid, micro-hero, filtering) | 01–06 |
| 08 | Shared component migration (CopyButton, ResultPanel, ErrorBanner) | 01–06 |
| 09 | Tool page migration (all 25 tools) | 01–08 |

## Agent Instructions

1. Read `AGENTS.md` at project root first
2. Read this spec fully before starting any phase
3. Read the GDR source documents for context:
   - `.deep-research/gdr02-design-system-results.pdf`
   - `.deep-research/gdr02-design-system-results-v2.md`
4. Execute phases 01–09 sequentially
5. Run `npm run test` after each phase — all existing tests must still pass
6. **Do NOT commit.** Commits are handled manually after review.

## Branching

```bash
git checkout -b feature/v4-design-system
```

---

## Phase 01 — Design Token Architecture

Create the HSL-based CSS custom properties file and lock down the Tailwind configuration to consume only semantic tokens.

### 01a — Create `src/styles/design-tokens.css`

Create this file with the complete dual-theme token set. Values use raw HSL components (no `hsl()` wrapper) so Tailwind can inject `<alpha-value>` for opacity modifiers.

```css
/**
 * @file design-tokens.css
 * @description HSL design tokens for dual-theme (light/dark) token architecture
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

@layer base {

  /* ─── Light Theme (default) ─── */
  :root {
    /* Background & Surfaces */
    --color-bg-base:        220 20% 98%;
    --color-surface-1:      0 0% 100%;
    --color-surface-2:      220 15% 95%;
    --color-surface-3:      220 15% 90%;

    /* Borders */
    --color-border-subtle:  220 15% 90%;
    --color-border-default: 220 15% 80%;
    --color-border-strong:  220 15% 60%;

    /* Text */
    --color-text-primary:   220 20% 10%;
    --color-text-secondary: 220 15% 35%;
    --color-text-muted:     220 15% 55%;

    /* Accent — Desaturated Teal */
    --color-accent-base:    180 40% 40%;
    --color-accent-hover:   180 50% 35%;
    --color-accent-muted:   180 30% 90%;
    --color-accent-text:    180 70% 25%;

    /* Semantic */
    --color-success:        150 80% 30%;
    --color-error:          0 70% 45%;
    --color-warning:        40 90% 50%;
    --color-info:           210 70% 50%;
  }

  /* ─── Dark Theme ─── */
  .dark {
    /* Background & Surfaces */
    --color-bg-base:        220 10% 6%;
    --color-surface-1:      220 10% 10%;
    --color-surface-2:      220 10% 14%;
    --color-surface-3:      220 10% 18%;

    /* Borders */
    --color-border-subtle:  220 10% 14%;
    --color-border-default: 220 10% 20%;
    --color-border-strong:  220 10% 35%;

    /* Text */
    --color-text-primary:   220 15% 95%;
    --color-text-secondary: 220 10% 70%;
    --color-text-muted:     220 10% 45%;

    /* Accent — Desaturated Teal */
    --color-accent-base:    180 50% 60%;
    --color-accent-hover:   180 60% 65%;
    --color-accent-muted:   180 40% 15%;
    --color-accent-text:    180 60% 70%;

    /* Semantic */
    --color-success:        150 60% 45%;
    --color-error:          0 60% 60%;
    --color-warning:        40 80% 60%;
    --color-info:           210 60% 60%;
  }
}
```

### 01b — Replace `tailwind.config.js`

Replace the entire file. This config consumes only semantic tokens and disables defaults.

```js
/**
 * @file tailwind.config.js
 * @description Tailwind v3 config consuming HSL design tokens — default palette disabled
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      bg: 'hsl(var(--color-bg-base) / <alpha-value>)',
      surface: {
        1: 'hsl(var(--color-surface-1) / <alpha-value>)',
        2: 'hsl(var(--color-surface-2) / <alpha-value>)',
        3: 'hsl(var(--color-surface-3) / <alpha-value>)',
      },
      border: {
        subtle: 'hsl(var(--color-border-subtle) / <alpha-value>)',
        DEFAULT: 'hsl(var(--color-border-default) / <alpha-value>)',
        strong: 'hsl(var(--color-border-strong) / <alpha-value>)',
      },
      text: {
        primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
        muted: 'hsl(var(--color-text-muted) / <alpha-value>)',
      },
      accent: {
        DEFAULT: 'hsl(var(--color-accent-base) / <alpha-value>)',
        hover: 'hsl(var(--color-accent-hover) / <alpha-value>)',
        muted: 'hsl(var(--color-accent-muted) / <alpha-value>)',
        text: 'hsl(var(--color-accent-text) / <alpha-value>)',
      },
      status: {
        success: 'hsl(var(--color-success) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
        info: 'hsl(var(--color-info) / <alpha-value>)',
      },
    },
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      none: '0 0 #0000',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-family-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-family-mono)', 'ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

**Critical:** This uses `theme.colors` (replacement), NOT `theme.extend.colors` (extension). The entire default Tailwind color palette (slate, sky, blue, red, etc.) is now unavailable. All references to `bg-slate-*`, `text-sky-*`, `border-slate-*`, etc. in the codebase will break and must be replaced in phases 06–09.

### 01c — Update `src/index.css`

Add the token import at the top of the file, before the Tailwind directives:

```css
@import './styles/design-tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ... rest of existing file unchanged ... */
```

Update the scrollbar colors to use the new token values (these are outside Tailwind's purview and must remain as raw values matching the dark-mode tokens):

```css
::-webkit-scrollbar-track { background: hsl(220 10% 6%); }
::-webkit-scrollbar-thumb { background: hsl(220 10% 20%); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: hsl(220 10% 45%); }
```

Update CodeMirror overrides similarly — replace hardcoded hex values with values matching the dark-mode surface/border tokens:

```css
.cm-gutters {
  background-color: transparent;
  border-right: 1px solid hsl(220 10% 20%);
  color: hsl(220 10% 45%);
  min-width: 40px;
}

.cm-error-line {
  background-color: hsl(0 60% 60% / 0.15) !important;
}

.cm-error-line::after {
  background-color: hsl(0 60% 60%);
}
```

### Phase 01 Verification

- `npm run build` succeeds (Tailwind compiles without errors)
- The app will look broken at this point — that is expected. Default palette references are now invalid.
- `grep -r "bg-slate\|text-slate\|border-slate\|bg-sky\|text-sky\|border-sky\|bg-blue\|text-blue" src/` will show all files that need migration in later phases

---

## Phase 02 — Typography Integration

### 02a — Add Google Fonts to `index.html`

Add preconnect hints and the font import inside `<head>`, before any stylesheets:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 02b — Add Typography Custom Properties

Add to `src/styles/design-tokens.css` inside the `:root` block:

```css
    /* Typography */
    --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-family-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    --base-font-size: 14px;
```

And inside the `.dark` block, add the same values (they are theme-independent but must be present for completeness):

```css
    /* Typography (theme-independent, duplicated for clarity) */
    --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-family-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    --base-font-size: 14px;
```

### 02c — Set Root Font Size

Add to `src/index.css` inside the `@layer base` block (create one if needed, or add to the token file's existing `@layer base`):

```css
html {
  font-size: var(--base-font-size);
}
```

### Phase 02 Verification

- The app renders with Inter for UI text and JetBrains Mono for code blocks
- Changing `--base-font-size` in browser DevTools scales the entire UI proportionally
- Font loading does not cause visible FOIT (the `display=swap` parameter handles this)

---

## Phase 03 — FOUC Prevention and Theme Engine

### 03a — Add Blocking Theme Script to `index.html`

Insert this synchronous script in `<head>`, AFTER the font links and BEFORE any other scripts:

```html
<script>
  try {
    var t = localStorage.getItem('ops-theme-preference');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && d)) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0E1013';
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#F8F9FA';
    } else {
      if (d) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#0E1013';
      } else {
        document.documentElement.style.backgroundColor = '#F8F9FA';
      }
    }
  } catch (e) {}
</script>
```

### 03b — Update `<body>` and `<html>` Tags

Change `index.html`:

```html
<html lang="en" class="dark">
```

The `class="dark"` is the initial default (prevents flash). The blocking script above immediately corrects it based on stored preference or system setting.

Remove the hardcoded colors from the `<body>` tag:

```html
<body class="antialiased">
```

The `bg-slate-900 text-slate-300` classes are replaced by token-driven styles in the shell (Phase 06).

### 03c — Create Theme Hook `src/hooks/useTheme.js`

```js
/**
 * @file useTheme.js
 * @description Theme management hook — light/dark/system with localStorage persistence
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-theme-preference';

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved) {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  // Clear the inline backgroundColor set by the FOUC script
  document.documentElement.style.backgroundColor = '';
}

export function useTheme() {
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const resolved = preference === 'system' ? getSystemPreference() : preference;

  const setTheme = useCallback((value) => {
    setPreference(value);
    try {
      if (value === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  }, []);

  // Apply on mount and when preference changes
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (preference !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemPreference());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [preference]);

  return { preference, resolved, setTheme };
}
```

### Phase 03 Verification

- On first load with no localStorage key, the app follows system preference with no white flash
- Setting `ops-theme-preference` to `light` in DevTools > Application > Local Storage, then reloading, produces a light-themed page with no dark flash
- The `useTheme` hook can be tested by importing it in ToolLayout temporarily

---

## Phase 04 — Transition Kinetics

### 04a — Add Motion Tokens to `src/styles/design-tokens.css`

Add to the `:root` block (these are theme-independent):

```css
    /* Motion */
    --duration-micro:  150ms;
    --duration-enter:  250ms;
    --duration-exit:   200ms;
    --ease-micro:      cubic-bezier(0.4, 0, 0.2, 1);
    --ease-enter:      ease-out;
    --ease-exit:       ease-in;
```

Duplicate into the `.dark` block as well (same values).

### 04b — Add Utility Classes

Add to `src/index.css` after the Tailwind directives:

```css
/* Standardized transition utilities */
@layer utilities {
  .transition-micro {
    transition-property: background-color, border-color, color, box-shadow;
    transition-duration: var(--duration-micro);
    transition-timing-function: var(--ease-micro);
  }
  .transition-enter {
    transition-property: transform, opacity;
    transition-duration: var(--duration-enter);
    transition-timing-function: var(--ease-enter);
  }
  .transition-exit {
    transition-property: transform, opacity;
    transition-duration: var(--duration-exit);
    transition-timing-function: var(--ease-exit);
  }
}
```

### Phase 04 Verification

- `transition-micro` class is available in Tailwind's utility scan
- Browser DevTools shows the correct computed transition values

---

## Phase 05 — Settings Flyout

### 05a — Create Density Hook `src/hooks/useDensity.js`

```js
/**
 * @file useDensity.js
 * @description Interface density management — adjusts root font size via CSS custom property
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-density-preference';
const DENSITY_MAP = {
  compact: '13px',
  default: '14px',
  comfortable: '16px',
};

export function useDensity() {
  const [density, setDensityState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'default';
    } catch {
      return 'default';
    }
  });

  const setDensity = useCallback((value) => {
    setDensityState(value);
    try {
      if (value === 'default') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', DENSITY_MAP[density] || '14px');
  }, [density]);

  return { density, setDensity };
}
```

### 05b — Create Font Family Hook `src/hooks/useFontFamily.js`

```js
/**
 * @file useFontFamily.js
 * @description Font family preference management — system native, Inter, or monospace-heavy
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ops-font-preference';
const FONT_MAP = {
  system: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  inter: {
    sans: '"Inter", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
  mono: {
    sans: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
};

export function useFontFamily() {
  const [fontFamily, setFontFamilyState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'inter';
    } catch {
      return 'inter';
    }
  });

  const setFontFamily = useCallback((value) => {
    setFontFamilyState(value);
    try {
      if (value === 'inter') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fonts = FONT_MAP[fontFamily] || FONT_MAP.inter;
    document.documentElement.style.setProperty('--font-family-sans', fonts.sans);
    document.documentElement.style.setProperty('--font-family-mono', fonts.mono);
  }, [fontFamily]);

  return { fontFamily, setFontFamily };
}
```

### 05c — Create `src/components/SettingsFlyout.jsx`

```jsx
/**
 * @file SettingsFlyout.jsx
 * @description Non-modal settings flyout for theme, density, and font family preferences
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useRef, useEffect } from 'react';

/**
 * Segmented control for 2-3 options.
 */
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex p-0.5 bg-surface-2 border border-border rounded-md">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-micro ${
            value === opt.value
              ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsFlyout({ theme, density, fontFamily }) {
  const [open, setOpen] = useState(false);
  const flyoutRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        flyoutRef.current && !flyoutRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-micro"
        aria-label="Display settings"
        aria-expanded={open}
      >
        {/* Settings gear icon — inline SVG to avoid lucide dependency in shell */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          ref={flyoutRef}
          className="absolute right-0 top-full mt-2 w-64 bg-surface-1 border border-border rounded-md shadow-sm p-4 space-y-4 z-50 transition-enter"
          role="dialog"
          aria-label="Display settings"
        >
          {/* Theme */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide">Theme</label>
            <SegmentedControl
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              value={theme.preference}
              onChange={theme.setTheme}
            />
          </div>

          {/* Density */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide">Density</label>
            <SegmentedControl
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'default', label: 'Default' },
                { value: 'comfortable', label: 'Comfortable' },
              ]}
              value={density.density}
              onChange={density.setDensity}
            />
          </div>

          {/* Font */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide">Font</label>
            <SegmentedControl
              options={[
                { value: 'system', label: 'System' },
                { value: 'inter', label: 'Inter' },
                { value: 'mono', label: 'Mono' },
              ]}
              value={fontFamily.fontFamily}
              onChange={fontFamily.setFontFamily}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Phase 05 Verification

- Each hook reads and writes the correct localStorage key
- Changing density in DevTools (`--base-font-size`) scales the entire UI
- Changing font family in DevTools (`--font-family-sans`) swaps the typeface
- Flyout opens/closes on click, closes on Escape and outside click

---

## Phase 06 — Global Shell Migration

### 06a — Rewrite `src/components/ToolLayout.jsx`

Replace the entire file. This integrates the settings flyout and migrates all hardcoded colors to tokens.

```jsx
/**
 * @file ToolLayout.jsx
 * @description Main app shell with sticky header, settings flyout, content outlet, and privacy footer
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useDensity } from '../hooks/useDensity';
import { useFontFamily } from '../hooks/useFontFamily';
import SettingsFlyout from './SettingsFlyout';

export default function ToolLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const theme = useTheme();
  const density = useDensity();
  const fontFamily = useFontFamily();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-secondary font-sans">
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-bold text-text-primary hover:text-accent transition-micro">
            Ops <span className="text-accent">Toolbox</span>
          </Link>
          <div className="flex items-center gap-2">
            {!isHome && (
              <Link
                to="/"
                className="text-sm text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-3 px-3 py-1.5 rounded-md border border-border transition-micro"
              >
                ← All Tools
              </Link>
            )}
            <SettingsFlyout theme={theme} density={density} fontFamily={fontFamily} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border-subtle py-6 text-center">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">100% Client-Side Processing</p>
        <p className="text-sm text-text-secondary">Data never leaves your browser.</p>
      </footer>
    </div>
  );
}
```

### 06b — Migrate `src/components/NotFound.jsx`

Replace all color references:

| Old Class | New Class |
|-----------|-----------|
| `text-slate-600` | `text-text-muted` |
| `text-slate-300` | `text-text-primary` |
| `text-slate-400` | `text-text-secondary` |
| `text-slate-500` | `text-text-muted` |
| `text-sky-400` | `text-accent` |
| `bg-slate-800` | `bg-surface-2` |
| `border-slate-700` | `border-border` |
| `bg-sky-600` | `bg-accent` |
| `hover:bg-sky-500` | `hover:bg-accent-hover` |
| `hover:border-sky-500` | `hover:border-accent` |
| `hover:text-sky-400` | `hover:text-accent` |
| `rounded-lg` | `rounded-md` |

The primary CTA button ("Back to Tool Directory") currently uses white text on blue. With teal accent, use dark text: replace `text-white` with `text-black` on the accent-background button (teal at 60% lightness in dark mode needs dark text for contrast).

### 06c — Update Loading Fallback in `src/App.jsx`

Replace:
```jsx
<div className="flex items-center justify-center h-64 text-slate-500">
```
With:
```jsx
<div className="flex items-center justify-center h-64 text-text-muted">
```

### Phase 06 Verification

- Header renders with teal accent on "Toolbox"
- Settings gear icon is visible and opens the flyout
- Theme switching works (light/dark/system) with instant toggle, no flash
- Density switching scales the entire UI
- Footer uses token colors
- "← All Tools" button uses token colors
- 404 page uses token colors

---

## Phase 07 — Home Page Restructure

### 07a — Rewrite `src/components/DirectoryGrid.jsx`

This is a full rewrite. The new component implements:
- Micro-hero value proposition section
- Live search filter input
- Category pill toggles with cumulative filtering
- Unified fluid grid using `auto-fit` / `minmax(320px, 1fr)`
- Responsive breakpoints per v2 spec
- Tool cards using the component pattern from GDR v1 Section 3.1

```jsx
/**
 * @file DirectoryGrid.jsx
 * @description Home page with micro-hero, live filtering, category pills, and fluid tool grid
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toolRegistry, getCategories } from '../lib/toolRegistry';

function ToolCard({ tool }) {
  const showBadges = tool.processingMode !== 'local' || tool.status !== 'stable';
  return (
    <Link
      to={tool.path}
      className="flex flex-col p-4 bg-surface-1 border border-border rounded-md transition-micro cursor-pointer group hover:bg-surface-2 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-micro mb-1">
        {tool.name}
      </h3>
      {showBadges && (
        <div className="flex gap-1.5 mb-1.5">
          {tool.processingMode === 'remote' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-warning/10 text-status-warning border border-status-warning/30">
              Online
            </span>
          )}
          {tool.processingMode === 'hybrid' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-info/10 text-status-info border border-status-info/30">
              Online Optional
            </span>
          )}
          {tool.status === 'beta' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-accent-muted text-accent-text border border-accent/30">
              Beta
            </span>
          )}
          {tool.status === 'experimental' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-error/10 text-status-error border border-status-error/30">
              Experimental
            </span>
          )}
        </div>
      )}
      <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
    </Link>
  );
}

export default function DirectoryGrid() {
  const categories = getCategories();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = useMemo(() => {
    let results = toolRegistry;
    if (activeCategory) {
      results = results.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, activeCategory]);

  return (
    <div>
      {/* Micro-hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Client-Side Developer Utilities
        </h1>
        <p className="text-sm text-text-secondary mb-4 max-w-2xl">
          {toolRegistry.length} network, security, and parsing tools. All processing executes
          locally in your browser. Zero tracking. Zero telemetry.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            100% Local Processing
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="4.5" y1="4.5" x2="19.5" y2="19.5"/></svg>
            No Server Logs
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Open Source
          </span>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tools…"
          className="w-full max-w-md px-3 py-2 text-sm bg-surface-1 text-text-primary border border-border rounded shadow-sm placeholder:text-text-muted transition-micro hover:border-border-strong focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-micro ${
              !activeCategory
                ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-micro ${
                activeCategory === cat
                  ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fluid Tool Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
      >
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">
          No tools match your search.
        </p>
      )}
    </div>
  );
}
```

### Phase 07 Verification

- Home page shows micro-hero with trust badges
- Search input filters tools in real time with zero latency
- Category pills filter tools; selecting a category while searching narrows results cumulatively
- Grid is fluid — resize browser to confirm: 1 column on narrow, 2 at ~700px, 3 at ~1060px, 4 at ~1400px
- Grid does not exceed 1440px max-width (inherited from the `max-w-7xl` container in ToolLayout)
- Tool cards use `transition-micro` for hover states
- Cards have `focus-visible` ring for keyboard navigation

---

## Phase 08 — Shared Component Migration

Migrate all shared components to use design tokens. These are mechanical color replacements.

### 08a — `src/components/CopyButton.jsx`

| Old | New |
|-----|-----|
| `bg-slate-700` | `bg-surface-2` |
| `hover:bg-slate-600` | `hover:bg-surface-3` |
| `text-slate-200` | `text-text-primary` |
| `transition-colors` | `transition-micro` |

### 08b — `src/components/ResultPanel.jsx`

| Old | New |
|-----|-----|
| `text-slate-400` (label) | `text-text-secondary` |
| `bg-slate-900` (code block) | `bg-surface-2` |
| `border-slate-700` | `border-border` |
| `text-slate-300` | `text-text-primary` |
| `text-slate-600` (empty state) | `text-text-muted` |
| `bg-red-900/20` | `bg-status-error/20` |
| `border-red-500` | `border-status-error` |
| `text-red-400` | `text-status-error` |
| `rounded-lg` | `rounded-md` |

### 08c — `src/components/ErrorBanner.jsx`

| Old | New |
|-----|-----|
| `bg-red-900/30` | `bg-status-error/10` |
| `border-red-700` | `border-status-error/50` |
| `text-red-300` | `text-status-error` |
| `text-red-400` | `text-status-error` |
| `hover:text-red-200` | `hover:text-text-primary` |
| `rounded-lg` | `rounded-md` |
| `transition-colors` | `transition-micro` |

### Phase 08 Verification

- CopyButton renders correctly in both themes
- ResultPanel shows correct surface/border/text colors in both themes
- ErrorBanner renders correctly in both themes
- All existing tests still pass

---

## Phase 09 — Tool Page Migration

This is the largest phase. Every tool component in `src/tools/` must be migrated from hardcoded Tailwind colors to semantic tokens. The changes are mechanical — no logic changes, no feature changes, no layout changes.

### Universal Replacement Map

Apply these substitutions across ALL tool files. Use find-and-replace, but verify each replacement visually — some tools may use colors in context-specific ways that need judgment.

**Backgrounds:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-slate-900` | `bg-bg` |
| `bg-slate-800` | `bg-surface-1` |
| `bg-slate-800/50` | `bg-surface-1/50` |
| `bg-slate-700` | `bg-surface-2` |
| `bg-slate-700/50` | `bg-surface-2/50` |
| `bg-slate-600` | `bg-surface-3` |

**Text:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `text-white` | `text-text-primary` |
| `text-slate-100` | `text-text-primary` |
| `text-slate-200` | `text-text-primary` |
| `text-slate-300` | `text-text-secondary` |
| `text-slate-400` | `text-text-secondary` |
| `text-slate-500` | `text-text-muted` |
| `text-slate-600` | `text-text-muted` |
| `text-sky-400` | `text-accent` |
| `text-sky-500` | `text-accent` |
| `text-sky-300` | `text-accent` |
| `text-blue-400` | `text-accent` |
| `text-blue-500` | `text-accent` |

**Borders:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `border-slate-600` | `border-border-subtle` |
| `border-slate-700` | `border-border` |
| `border-slate-700/50` | `border-border/50` |
| `border-slate-800` | `border-border` |
| `border-sky-500` | `border-accent` |
| `border-blue-500` | `border-accent` |

**Interactive states:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `hover:bg-slate-700` | `hover:bg-surface-2` |
| `hover:bg-slate-600` | `hover:bg-surface-3` |
| `hover:border-sky-500` | `hover:border-accent` |
| `hover:border-slate-600` | `hover:border-border-strong` |
| `hover:text-white` | `hover:text-text-primary` |
| `hover:text-sky-400` | `hover:text-accent` |
| `bg-sky-600` | `bg-accent` |
| `bg-sky-500` | `bg-accent` |
| `hover:bg-sky-500` | `hover:bg-accent-hover` |
| `hover:bg-sky-700` | `hover:bg-accent-hover` |

**Focus states:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `focus:ring-sky-500` | `focus:ring-accent` |
| `focus:border-sky-500` | `focus:border-accent` |

**Semantic colors:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-red-900/20` | `bg-status-error/20` |
| `bg-red-900/30` | `bg-status-error/10` |
| `bg-red-900/40` | `bg-status-error/15` |
| `border-red-500` | `border-status-error` |
| `border-red-700` | `border-status-error/50` |
| `text-red-400` | `text-status-error` |
| `text-red-500` | `text-status-error` |
| `bg-green-900/20` | `bg-status-success/20` |
| `bg-green-900/30` | `bg-status-success/10` |
| `border-green-500` | `border-status-success` |
| `border-green-700` | `border-status-success/50` |
| `text-green-400` | `text-status-success` |
| `text-green-500` | `text-status-success` |
| `bg-amber-900/40` | `bg-status-warning/15` |
| `border-amber-700/50` | `border-status-warning/30` |
| `text-amber-400` | `text-status-warning` |
| `bg-purple-900/40` | `bg-accent-muted` |
| `border-purple-700/50` | `border-accent/30` |
| `text-purple-400` | `text-accent-text` |
| `bg-blue-900/40` | `bg-status-info/15` |
| `border-blue-700/50` | `border-status-info/30` |
| `text-blue-400` | `text-status-info` |

**Border radius (enforce mechanical aesthetic):**

| Old Pattern | New Pattern |
|-------------|-------------|
| `rounded-lg` (on containers/cards) | `rounded-md` |
| `rounded-xl` | `rounded-md` |
| `rounded-2xl` | `rounded-lg` |

Do NOT change `rounded-full` (used on avatars/pills) or `rounded` (already correct).

**Transitions:**

| Old Pattern | New Pattern |
|-------------|-------------|
| `transition-colors` | `transition-micro` |
| `transition-all` (on interactive elements) | `transition-micro` |

Do NOT replace `transition-all` on elements that animate transform (e.g., `hover:-translate-y-0.5`). Those need both color and transform transitions — use Tailwind's default `transition-all` or explicit `transition-[background-color,border-color,color,transform]`.

### Tool File List

All files in `src/tools/` requiring migration:

```
SubnetCalculator.jsx
CidrExpander.jsx
MacVendorLookup.jsx
JwtDecoder.jsx
PasswordGenerator.jsx
SshKeyGenerator.jsx
X509Parser.jsx
FileHashCalculator.jsx
BcryptHashVerifier.jsx
JsonYamlConverter.jsx
Base64Codec.jsx
JsonDiff.jsx
CsvToJson.jsx
SqlFormatter.jsx
UrlParser.jsx
UserAgentDecoder.jsx
ChmodCalculator.jsx
UrlQueryEncoder.jsx
CronParser.jsx
RegexTester.jsx
AsciiBanner.jsx
UuidGenerator.jsx
UnixEpochTool.jsx
MarkdownPreviewer.jsx
mermaid-renderer/MermaidRenderer.jsx
```

### Special Cases

**SubnetCalculator.jsx:** Uses a `PALETTE` array with raw hex colors for subnet visualization. Do NOT migrate these — they are data visualization colors, not UI tokens. Leave as-is.

**MermaidRenderer.jsx:** Uses Mermaid's internal theme system. Mermaid configuration colors are separate from UI tokens. Migrate only the surrounding UI (inputs, buttons, layout) — do not attempt to theme Mermaid diagrams through the token system.

**Tools with CodeMirror:** (MermaidRenderer, MarkdownPreviewer) — CodeMirror theme overrides are handled in `index.css` (Phase 01). Only migrate the non-CodeMirror UI elements within these tools.

### Phase 09 Verification

- `grep -r "bg-slate\|text-slate\|border-slate\|bg-sky\|text-sky\|border-sky\|bg-blue\|text-blue\|bg-red\|text-red\|border-red\|bg-green\|text-green\|border-green" src/` returns ZERO results from `src/tools/` and `src/components/` (exceptions: SubnetCalculator's PALETTE array, Mermaid config)
- All 25 tools render correctly in dark mode
- All 25 tools render correctly in light mode
- All 25 tools render correctly at compact, default, and comfortable density
- All existing tests pass (`npm run test`)
- No visual regressions — each tool's layout, spacing, and interaction behavior is identical to pre-migration

---

## Post-Migration Verification Checklist

After all phases:

- [ ] `npm run build` — production build succeeds with no warnings
- [ ] `npm run test` — all tests pass
- [ ] Dark mode: full visual audit of all 25 tools + home page + 404
- [ ] Light mode: full visual audit of all 25 tools + home page + 404
- [ ] Settings flyout: theme toggle works (light/dark/system)
- [ ] Settings flyout: density toggle works (compact/default/comfortable)
- [ ] Settings flyout: font toggle works (system/Inter/mono)
- [ ] FOUC: reload in dark mode — no white flash
- [ ] FOUC: reload in light mode — no dark flash
- [ ] Home page: search filter works with instant response
- [ ] Home page: category pills filter cumulatively with search
- [ ] Home page: grid is fluid across viewports (resize from 375px to 1920px)
- [ ] Keyboard navigation: Tab through tool cards, visible focus ring
- [ ] Hardcoded color grep returns zero results (minus documented exceptions)
- [ ] localStorage keys are correct: `ops-theme-preference`, `ops-density-preference`, `ops-font-preference`

## AGENTS.md Updates Required

After this spec is implemented, update `AGENTS.md` to reflect:

- Dark mode is now togglable (not hardcoded)
- Colors use semantic tokens (`bg-surface-1`, `text-accent`), never raw Tailwind palette colors
- New hooks: `useTheme`, `useDensity`, `useFontFamily`
- New component: `SettingsFlyout`
- New file: `src/styles/design-tokens.css`
- Add to "What NOT To Do": Do not use raw Tailwind colors (slate, sky, blue, red, etc.) — use semantic tokens exclusively

## Do NOT

- Do not change tool logic, computation, or features — this is a visual migration only
- Do not add new tools
- Do not modify `src/lib/` files (pure logic, no UI)
- Do not introduce CSS-in-JS or any styling approach other than Tailwind utilities + CSS custom properties
- Do not use Tailwind's default color palette — it is intentionally disabled
- Do not use `rounded-lg` on interactive elements (max `rounded-md`) — `rounded-lg` is reserved for the outermost container only
- Do not add `transition-all` to `<body>` or `<html>` for theme switching — theme toggle must be instant
- Do not use `backdrop-filter` / `backdrop-blur` anywhere except the sticky header
- Do not introduce animation libraries — CSS transitions only
