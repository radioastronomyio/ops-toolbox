<!--
---
title: "Source"
description: "Application source code for the Ops Toolbox SPA"
author: "vintagedon"
date: "2026-03-16"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: shared
---
-->

# Source

Application source code for the Ops Toolbox single-page application. React 18 + Vite 5 + Tailwind CSS v3.

---

## 1. Contents

```
src/
├── App.jsx              # Router with lazy-loaded tool routes
├── main.jsx             # React entry point (BrowserRouter + StrictMode)
├── index.css            # Tailwind directives + CodeMirror overrides
├── tools/               # 25 tool UI components
├── components/          # Shared UI components (CopyButton, ErrorBanner, etc.)
├── hooks/               # Custom React hooks (useClipboard, useDebouncedValue)
└── lib/                 # Pure utility functions (no React dependencies)
```

---

## 2. Subdirectories

| Directory | Description |
|-----------|-------------|
| [tools/](tools/README.md) | One component per tool — UI layer only |
| [components/](components/README.md) | Shared UI primitives used across tools |
| [hooks/](hooks/README.md) | Custom hooks for clipboard and debounce |
| [lib/](lib/README.md) | Pure business logic — testable without React |

---

## 3. Related

| Document | Relationship |
|----------|--------------|
| [Repository Root](../README.md) | Parent directory |
| [Architecture](../docs/architecture.md) | How it all fits together |
| [Tests](../tests/) | Mirror structure for test suites |
