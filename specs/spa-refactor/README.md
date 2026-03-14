# SPA Refactor Specs

This directory contains the implementation specs for migrating ops-toolbox from a monorepo of standalone apps to a single React SPA.

## Execution Order

| # | Spec | What It Does | Tests |
|---|------|-------------|-------|
| 00 | [Shared Framework](00-shared-framework.md) | SPA scaffold — Vite, React Router, Tailwind, Vitest. **Build first.** | Setup only |
| 01 | [Subnet Calculator](01-subnet-calculator.md) | IPv4 CIDR calculator. Zero deps. | `tests/lib/subnet.test.js` + `tests/tools/SubnetCalculator.test.jsx` |
| 02 | [JWT Decoder](02-jwt-decoder.md) | Token header/payload inspector. Uses `jwt-decode`. | `tests/tools/JwtDecoder.test.jsx` |
| 03 | [Password Generator](03-password-generator.md) | Web Crypto API random strings. Zero deps. | `tests/lib/password.test.js` + `tests/tools/PasswordGenerator.test.jsx` |
| 04 | [JSON ↔ YAML Converter](04-json-yaml-converter.md) | Bidirectional converter. Uses `js-yaml`. | `tests/tools/JsonYamlConverter.test.jsx` |
| 05 | [Base64 Codec](05-base64-codec.md) | Encode/decode with UTF-8 support. Zero deps. | `tests/lib/base64.test.js` + `tests/tools/Base64Codec.test.jsx` |
| 06 | [Mermaid Renderer Port](06-mermaid-renderer-port.md) | Port existing app into SPA + Tailwind migration. | `tests/tools/MermaidRenderer.test.jsx` |

## Branch

All work on: `feature/spa-refactor`

## Validation Pattern

After completing each spec:
1. `npm run test` — all tests pass
2. `npm run build` — no build errors

## Key Decisions

- Single SPA (not workspace of apps)
- Tailwind v3 everywhere (replaces plain CSS + tokens.css)
- Vitest + @testing-library/react for validation
- Pure computation logic extracted to `src/lib/` for testability
- Lazy loading via `React.lazy()` + `Suspense` for each tool
- `toolsConfig` array in `App.jsx` is the single source of truth
- Dark mode default, slate color palette, sky accent
- `@cldn/ip` npm package does NOT exist — subnet calc uses pure bitwise math
