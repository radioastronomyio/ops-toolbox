# Agent Instructions

## Project Identity

**Ops Toolbox** is a collection of client-side utility web tools for IT operations and platform engineering. All processing happens in the browser — no backends, no data transmission. Hosted on Azure Static Web Apps.

**Repository:** `radioastronomyio/ops-toolbox`
**Live:** `https://opstoolbox.donfather.dev/`
**Stack:** React 18, Vite 5, React Router v6, Tailwind CSS v3, Vitest, dark-mode-first

## Current State

**Active refactor:** Migrating from a monorepo of standalone apps (`apps/*` workspace pattern) to a single SPA with React Router. The existing `apps/mermaid-renderer/` is the only built app and must be ported into the new SPA structure.

**Refactor specs live in:** `specs/spa-refactor/`

Read them in order:

1. `00-shared-framework.md` — SPA scaffold, routing, layout, Tailwind, Vitest setup. **Build this first.**
2. `01-subnet-calculator.md` — IPv4 subnet calculator (pure logic in `src/lib/subnet.js`)
3. `02-jwt-decoder.md` — JWT token inspector
4. `03-password-generator.md` — Cryptographic password generator (pure logic in `src/lib/password.js`)
5. `04-json-yaml-converter.md` — Bidirectional JSON/YAML converter
6. `05-base64-codec.md` — Base64 encoder/decoder (pure logic in `src/lib/base64.js`)
7. `06-mermaid-renderer-port.md` — Port existing mermaid renderer into SPA

Each spec is a self-contained work unit with unit tests. Build sequentially. Run `npm run test` after each spec to verify.

## Testing Strategy

- **Test framework:** Vitest + @testing-library/react + jsdom
- **Pure logic** lives in `src/lib/` — tested with pure unit tests in `tests/lib/`
- **React components** tested with @testing-library/react in `tests/tools/`
- **Validation:** `npm run test` must pass after each spec is complete
- **Run tests:** `npm run test` (single run) or `npm run test:watch` (watch mode)

## Branching

Work on a single feature branch: `feature/spa-refactor`
Commit after each numbered spec is complete with a descriptive message.

## Key Constraints

- **100% client-side.** No API calls, no server-side processing, no analytics.
- **Privacy-first.** Data never leaves the browser.
- **Lazy loading.** Each tool route uses `React.lazy()` + `Suspense`.
- **Dark mode default.** Light mode toggle optional but not required for initial build.
- **Testable architecture:** Extract computation into `src/lib/` pure functions where applicable.

## What NOT To Do

- Do not create a backend or API functions
- Do not use `@cldn/ip` npm package (does not exist — GDR hallucination)
- Do not use Tailwind v4 (use v3 with PostCSS)
- Do not add analytics, telemetry, or third-party scripts
- Do not modify `.github/workflows/` yet (deployment config comes later)
