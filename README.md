<!--
---
title: "Ops Toolbox"
description: "Self-hosted, client-side utility web tools for IT operations and platform engineering"
author: "VintageDon"
date: "2026-03-29"
version: "3.1"
status: "Active"
tags:
  - type: project-root
  - domain: utilities
  - tech: [react, vite, tailwind, vitest, azure-static-web-apps]
---
-->

# Ops Toolbox

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest)](https://vitest.dev)
[![Azure Static Web Apps](https://img.shields.io/badge/Azure-Static_Web_Apps-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/app-service/static)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> Self-hosted utility web tools for IT operations: sensitive data shouldn't leave your network.

A single-page application with 25 client-side utility tools for network engineers, security analysts, and platform engineers. All processing happens in the browser; zero backends, zero data transmission, zero analytics. Paste your data, get your output, keep your privacy.

**Live:** [opstoolbox.donfather.dev](https://opstoolbox.donfather.dev/)

---

## Why This Exists

IT professionals routinely use web-based utilities for quick tasks: subnet calculations, JWT inspection, diagram rendering, password generation. The problem? Pasting customer network topologies, security tokens, or internal configurations into third-party services creates compliance and data sovereignty risks.

Ops Toolbox solves this by providing self-hosted alternatives that:

- **Run 100% client-side:** zero data leaves the browser (verify via DevTools Network tab)
- **Deploy to your infrastructure:** Azure Static Web Apps, any static host, or localhost
- **Do one thing well:** focused utilities, not bloated platforms

If you're already familiar with the project, skip to [Quick Start](#-quick-start).

---

## Tools

### Networking (3)

| Tool | Description | Mode |
|------|-------------|------|
| Subnet Calculator | IPv4 CIDR arithmetic: network, broadcast, host range, mask, interactive tree splitting | Local |
| CIDR Expander | Expand a CIDR block into its full IP range with enumeration | Local |
| MAC Vendor Lookup | Look up manufacturer for a MAC address via OUI prefix | Online |

### Security (6)

| Tool | Description | Mode |
|------|-------------|------|
| JWT Decoder | Inspect JWT headers and payload claims without exposing secrets | Local |
| Password Generator | Cryptographically secure passwords and passphrases (Web Crypto API, rejection sampling) | Local |
| SSH Keypair Generator | Generate RSA SSH keypairs in-browser using node-forge | Local |
| X.509 Parser | Parse PEM certificates: subject, issuer, validity, key info, extensions | Local |
| File Hash Calculator | Compute MD5, SHA-1, SHA-256, SHA-512 digests for any file | Local |
| Bcrypt Verifier | Hash strings with bcrypt and verify passwords against stored hashes | Local |

### Data (5)

| Tool | Description | Mode |
|------|-------------|------|
| JSON ↔ YAML | Bidirectional conversion with real-time linting | Local |
| Base64 Codec | Encode and decode Base64 with UTF-8 and binary support | Local |
| JSON Diff | Side-by-side structural diff with color-coded changes | Local |
| CSV to JSON | Convert CSV files/text to JSON with delimiter auto-detection | Local |
| SQL Formatter | Pretty-print SQL with dialect support (PostgreSQL, MySQL, T-SQL, BigQuery) | Local |

### Developer (11)

| Tool | Description | Mode |
|------|-------------|------|
| Mermaid Renderer | Render mermaid diagrams with ELK layout engine for superior network topologies | Local |
| URL Parser | Inspect URL components: protocol, host, path, query params, hash | Local |
| User-Agent Decoder | Parse UA strings into browser, OS, device, and engine components | Local |
| Chmod Calculator | Bidirectional Unix permission converter: octal ↔ symbolic ↔ checkboxes | Local |
| URL Encoder | Encode/decode URL components, parse URLs, build query strings | Local |
| Cron Parser | Translate cron expressions to human descriptions, preview next run times | Local |
| Regex Tester | Test patterns with live match highlighting and capture group display | Local |
| ASCII Banner | Generate terminal-style ASCII art banners with figlet fonts | Local |
| UUID Generator | Cryptographically secure UUID v4 and v7 with bulk and format options | Local |
| Unix Epoch | Convert timestamps to human dates and back, with live counter | Local |
| Markdown Previewer | Live GFM Markdown editor with XSS-safe HTML preview via DOMPurify | Local |

**Mode key:** `Local` = 100% browser processing, works offline. `Online` = requires network access for API calls.

---

## Architecture

Ops Toolbox is a React 18 SPA with code-split tool routes. Pure computation lives in `src/lib/` (testable without React), UI components in `src/tools/`, and shared primitives in `src/components/` and `src/hooks/`.

```
                    ┌─────────────┐
                    │  index.html │
                    │  + main.jsx │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   App.jsx   │  React Router v6
                    │  (router)   │  lazy-loaded routes
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───┐ ┌──────▼──────┐
       │ ToolLayout   │ │ 404  │ │ Directory   │
       │ (nav/footer) │ │      │ │ Grid (home) │
       └──────┬──────┘ └──────┘ └─────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌──▼──┐ ┌───▼───┐
│Tool 1 │ │ ... │ │Tool 25│  React.lazy() per tool
└───┬───┘ └──┬──┘ └───┬───┘
    │        │        │
    └────────┼────────┘
             │
      ┌──────▼──────┐
      │   src/lib/   │  Pure functions (no React)
      │  (business   │  Tested with Vitest
      │   logic)     │
      └─────────────┘
```

### Key Architectural Decisions

| Decision | Implementation | Rationale |
|----------|---------------|-----------|
| Tool Registry | `src/lib/toolRegistry.js`, data-only module, no React imports | Single source of truth for routing, directory, badges, and search |
| Code Splitting | `React.lazy()` + `Suspense` per tool route | Only load the tool the user navigates to |
| Logic Extraction | Pure functions in `src/lib/`, components in `src/tools/` | Testable without rendering; lib tests are fast |
| Shared Primitives | `useClipboard`, `useDebouncedValue`, `CopyButton`, `ErrorBanner` | Eliminate hand-rolled clipboard/debounce across 25 tools |
| Rejection Sampling | `src/lib/password.js` | Eliminate modulo bias in cryptographic random generation |
| Semantic Design Tokens | HSL CSS custom properties, raw Tailwind palette disabled | Consistent theming across light/dark/system modes |

---

## 📁 Repository Structure

```
ops-toolbox/
├── 📂 .github/workflows/          # Azure Static Web Apps CI/CD
├── 📂 assets/                     # Repository images
├── 📂 docs/
│   ├── 📂 apps/                   # Tool reference documentation
│   └── 📂 documentation-standards/# Templates, tagging strategy
├── 📂 internal-files/             # Working documents
├── 📂 shared/                     # Cross-project utilities
├── 📂 spec/                       # Feature specifications (by version)
├── 📂 src/
│   ├── 📂 components/             # Shared UI: CopyButton, ErrorBanner, ResultPanel
│   ├── 📂 hooks/                  # Custom hooks: useClipboard, useDebouncedValue, useTheme
│   ├── 📂 lib/                    # Pure utility functions (no React)
│   ├── 📂 styles/                 # Design tokens CSS
│   └── 📂 tools/                  # 25 tool components (one per tool)
├── 📂 staging/                    # Staged work
├── 📂 tests/                      # Vitest test suites (mirrors src/ structure)
├── 📂 work-logs/                  # Development history
├── 📄 AGENTS.md                   # Agent context
├── 📄 CLAUDE.md                   # Pointer to AGENTS.md
├── 📄 index.html                  # SPA entry point
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 tailwind.config.js
├── 📄 staticwebapp.config.json    # Azure SWA routing
├── 📄 LICENSE                     # MIT
└── 📄 README.md                   # This file
```

---

## Project Status

| Area | Status | Notes |
|------|--------|-------|
| Core SPA Framework | Production | React Router, lazy loading, 404 handling |
| Tool Suite (25 tools) | Production | 24 stable, 1 beta (SSH Keygen) |
| Shared Primitives | Production | Clipboard, debounce, CopyButton, ErrorBanner |
| Tool Registry | Production | Metadata, badges, query helpers |
| Test Suite | Production | 464 tests, 54 files, Vitest + Testing Library |
| Documentation | Active | Standards, tool reference, architecture |
| CI/CD | Production | Azure Static Web Apps via GitHub Actions |

---

## 🚀 Quick Start

### Local Development

```bash
git clone https://github.com/radioastronomyio/ops-toolbox.git
cd ops-toolbox
npm install
npm run dev          # Dev server at localhost:5173
```

### Testing

```bash
npm run test         # Single run (464 tests)
npm run test:watch   # Watch mode
```

### Production Build

```bash
npm run build        # Output to dist/
npm run preview      # Preview the production build
```

### Deployment

Push to `main` triggers GitHub Actions to Azure Static Web Apps deployment.

For manual deployment, upload the `dist/` directory to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.) or serve locally for air-gapped environments.

---

## Security Model

**Data handling:** All processing happens in your browser. Network tab verification: zero outbound requests during operation (except initial page load and MAC Vendor Lookup which calls the OUI API).

**Trust model:** You control the hosting. No analytics, no telemetry, no third-party scripts. The only tool that makes network requests is MAC Vendor Lookup, which is clearly labeled with an "Online" badge.

**Cryptography:** Password generation uses the Web Crypto API with rejection sampling to eliminate modulo bias. SSH key generation uses node-forge's RSA implementation. No secrets are transmitted or stored.

---

## 🎯 Target Audience

| Audience | Use Case |
|----------|----------|
| Network Engineers | Subnet calculations, CIDR expansion, MAC lookups, diagram rendering |
| Security Analysts | JWT inspection, certificate parsing, file hashing, password generation |
| Platform Engineers | Cron parsing, regex testing, Base64/URL encoding, UUID generation |
| DevOps / SRE | SQL formatting, JSON/YAML conversion, Markdown preview |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Mermaid.js](https://mermaid.js.org/) + [ELK.js](https://github.com/kieler/elkjs) for diagram rendering with superior layout
- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [DOMPurify](https://github.com/cure53/DOMPurify) + [marked](https://marked.js.org/) for safe Markdown rendering
- [node-forge](https://github.com/digitalbazaar/forge) for SSH key generation
- [pkijs](https://github.com/nicktomlin/pkijs) + [asn1js](https://github.com/nicktomlin/asn1js) for X.509 certificate parsing
- Open source community for all the libraries that make this possible

---

Last Updated: 2026-03-29 | v3.1: Shared Primitives Migration Complete
