# AGENTS.md

Entry point for AI coding agents working on this repository.

## Project Identity

**Domain:** IT Operations / Web Utilities
**Repository:** https://github.com/radioastronomyio/ops-toolbox
**Live:** https://opstoolbox.donfather.dev/
**Purpose:** A collection of 25 client-side utility web tools for IT operations and platform engineering. All processing happens in the browser; no backends, no data transmission. Hosted on Azure Static Web Apps.

**Stack:** React 18, Vite 5, React Router v6, Tailwind CSS v3, Vitest, dual-theme (light/dark/system)

## Architecture

Single-page application with React Router v6. Tools are lazy-loaded via `React.lazy()` + `Suspense`.

- **`src/lib/toolRegistry.js`** — Canonical tool registry (data-only, no React). All routing, directory grid, badges, and search derive from this.
- **`src/lib/`** — Pure utility functions (no React dependencies). Business logic lives here.
- **`src/tools/`** — One React component per tool. UI layer only.
- **`src/components/`** — Shared UI: `CopyButton`, `ErrorBanner`, `ResultPanel`, `ToolLayout`, `DirectoryGrid`, `NotFound`, `SettingsFlyout` (non-modal flyout for theme/density/font settings).
- **`src/hooks/`** — `useClipboard` (clipboard with auto-reset), `useDebouncedValue` (debounce any value), `useTheme` (light/dark/system preference), `useDensity` (compact/default/comfortable layout density), `useFontFamily` (system/inter/mono font switching).
- **`src/styles/design-tokens.css`** — HSL-based CSS custom properties for all semantic color, typography, and motion tokens. Imported before Tailwind directives in `src/index.css`.
- **`src/App.jsx`** — Router with lazy imports mapped to registry IDs.

### Adding a Tool

1. Add entry to `src/lib/toolRegistry.js`
2. Create component in `src/tools/`
3. Add lazy import in `src/App.jsx` keyed to the registry `id`
4. Extract pure logic to `src/lib/` where applicable
5. Write tests, run `npm run test`

## Testing Strategy

- **Framework:** Vitest + @testing-library/react + jsdom
- **Pure logic** in `src/lib/` tested in `tests/lib/` (fast, no DOM)
- **React components** tested in `tests/tools/`, `tests/components/`, `tests/hooks/`
- **Pattern absence tests** in `tests/migration/` ensure banned patterns (hand-rolled clipboard, manual debounce) don't recur
- **Run:** `npm run test` (single run, 464 tests) or `npm run test:watch`

## Documentation

- **`docs/architecture.md`** — SPA architecture overview
- **`docs/apps/tool-reference.md`** — Complete reference for all 25 tools
- **`docs/documentation-standards/`** — Template library for READMEs, KB articles, script headers
- All source files have JSDoc `@file` headers per `docs/documentation-standards/script-header-javascript.md`

## Key Constraints

- **100% client-side.** No API calls except MAC Vendor Lookup (clearly labeled "Online").
- **Privacy-first.** Data never leaves the browser.
- **Lazy loading.** Each tool route uses `React.lazy()` + `Suspense`.
- **Dual-theme.** Dark mode is the default but theme is togglable (light/dark/system) via `useTheme` hook. Theme preference persists to `localStorage` key `ops-theme-preference`.
- **Testable architecture:** Extract computation into `src/lib/` pure functions.
- **Shared primitives:** Use `useClipboard`/`useDebouncedValue`/`CopyButton`/`ErrorBanner`; never hand-roll clipboard or debounce.
- **Rejection sampling:** `src/lib/password.js` uses rejection sampling for unbiased crypto RNG.
- **Semantic tokens only.** All colors use CSS custom property tokens via Tailwind semantic classes (`bg-surface-1`, `text-accent`, `text-status-error`, etc.). The default Tailwind color palette is intentionally disabled.

## What NOT To Do

- Do not create a backend or API functions
- Do not add analytics, telemetry, or third-party scripts
- Do not hand-roll clipboard copy (`setTimeout(() => setCopied(false), ...)`) — use `useClipboard` or `CopyButton`
- Do not hand-roll debounce (`debounceRef.current = setTimeout(...)`) — use `useDebouncedValue`
- Do not use Tailwind v4 (use v3 with PostCSS)
- Do not modify `.github/workflows/` without explicit approval
- Do not use raw Tailwind palette colors (`slate-*`, `sky-*`, `blue-*`, `red-*`, `green-*`, etc.) — use semantic tokens exclusively
- Do not hand-roll theme switching — use `useTheme` hook
- Do not add `transition-all` to `<body>` or `<html>` for theme switching — theme toggle must be instant
- Do not use `backdrop-filter` / `backdrop-blur` anywhere except the sticky header

## Specs

Feature specifications live in `spec/`. These are reference documents for completed work:

- `spec/v2/` — Original tool implementations (20 tools)
- `spec/v3-architecture-fixes/` — RNG bias fix, tool registry, 404 route, shared hooks/components, badges
- `spec/v3.1-primitives-migration/` — Migration of all tools to shared clipboard/debounce primitives
- `spec/v4-design-system/` — HSL token design system, dual-theme, density/font settings, full tool migration to semantic tokens

## Execution Environment

**Primary execution:** ML01 (`/opt/repos/ops-toolbox/`)
**Agent runtime:** OpenCode (global config at `~/.config/opencode/opencode.json`)
**Session management:** aoe (Agent of Empires)
**Strategic work:** Claude.ai Projects
**Agentic coding:** Claude Code, OpenCode

## Repository Structure

```
ops-toolbox/
├── .github/
│   └── workflows/                  # Azure Static Web Apps CI/CD
├── assets/                         # Repository images
├── docs/
│   ├── apps/                       # Tool reference documentation
│   └── documentation-standards/    # Templates, tagging strategy
├── internal-files/                 # Working documents
├── plans/                          # Development planning
├── shared/                         # Cross-project utilities
├── spec/                           # Feature specifications (by version)
├── src/
│   ├── components/                 # Shared UI components
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Pure utility functions (no React)
│   ├── styles/                     # Design tokens CSS
│   └── tools/                      # 25 tool components
├── staging/                        # Staged work (gitignored)
├── tests/                          # Vitest test suites
├── work-logs/                      # Development history
├── AGENTS.md                       # This file
├── CLAUDE.md                       # Pointer to AGENTS.md
├── index.html                      # SPA entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── staticwebapp.config.json        # Azure SWA routing config
├── LICENSE                         # MIT
└── README.md
```

## Conventions

- **Documentation:** Use templates from `docs/documentation-standards/`
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`, `test:`)
- **JSDoc:** All source files have `@file` headers
- **Frontmatter:** YAML frontmatter with tags from `docs/documentation-standards/tagging-strategy.md`
- **Interior READMEs:** Every directory has one

## Related Repositories

| Repository | Relationship |
|-----------|-------------|
| `proxmox-astronomy-lab` | Infrastructure context |
| `project-template-repository` | Base scaffolding patterns |
