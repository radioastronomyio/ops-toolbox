# Ops Toolbox Architecture

## Overview

Ops Toolbox is architected as a mono-repo containing multiple independent web applications. Each application is self-contained within `apps/{app-name}/` and can be developed, tested, and deployed independently while sharing common infrastructure (CI/CD, styling tokens, build tooling).

The architecture prioritizes simplicity over sophistication. Apps are React (or vanilla HTML/JS where simpler) single-page applications with zero backend dependencies. All processing happens client-side in the browser.

## Core Components

### apps/
**Purpose:** Individual utility applications  
**Location:** `apps/{app-name}/`  
**Key Characteristics:** Each app is independently deployable, contains its own README, and follows the same structural pattern (index.html, App.jsx or main.js, local assets).

### shared/
**Purpose:** Common resources across applications  
**Location:** `shared/`  
**Key Characteristics:** CSS variables for theming, potentially shared React components if patterns emerge. Currently minimal — establish patterns as apps are built.

### .github/workflows/
**Purpose:** CI/CD pipeline for Azure Static Web Apps deployment  
**Location:** `.github/workflows/`  
**Key Characteristics:** Single workflow handling the mono-repo, routing, and deployment.

## Structure

```
ops-toolbox/
├── README.md                 # Landing page / index of utilities
├── package.json              # Workspace config, shared dependencies
├── vite.config.js            # Build configuration (if using Vite workspaces)
├── shared/
│   ├── styles/               # CSS variables, theme tokens
│   └── README.md
├── apps/
│   ├── mermaid-renderer/     # First utility - mermaid diagram renderer
│   │   ├── index.html
│   │   ├── App.jsx
│   │   └── README.md
│   ├── whois-lookup/         # Future: IP/domain WHOIS lookup
│   ├── markdown-preview/     # Future: Markdown live preview
│   └── ...
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml
└── .kilocode/
    └── rules/
        └── memory-bank/      # This documentation
```

## Design Patterns and Principles

### Key Patterns

- **Client-side only:** No backend, no API calls, no data leaves the browser
- **Single-file apps:** Where possible, minimize file count per utility
- **Progressive complexity:** Start simple (vanilla HTML), add React only when state management justifies it

### Design Principles

1. **KISS:** Simple tools that do one thing well
2. **Data sovereignty:** Zero external data transmission is a hard requirement
3. **Fast deployment:** New utility from idea to production in minimal time
4. **Independence:** Apps can be extracted to standalone repos if needed

## Integration Points

### Internal Integrations

- **Shared styles:** Apps import CSS variables from `shared/styles/` for consistent theming
- **Landing page:** Root `index.html` links to all available utilities

### External Integrations

- **Azure Static Web Apps:** Hosting and CDN
- **GitHub Actions:** CI/CD pipeline triggered on push to main

## Architectural Decisions

### AD-001: Mono-repo over separate repos
**Date:** 2025-01-19  
**Decision:** Single repository containing all utilities  
**Rationale:** Simpler dependency management, shared CI/CD, easier to establish patterns. Apps are small enough that mono-repo overhead is minimal.  
**Alternatives Considered:** Separate repos per utility (rejected: too much overhead for simple tools)  
**Implications:** Need workspace-aware build tooling (Vite workspaces or similar)

### AD-002: React for stateful apps, vanilla for simple ones
**Date:** 2025-01-19  
**Decision:** Use React where state management adds value, vanilla HTML/JS otherwise  
**Rationale:** Mermaid renderer benefits from React (live preview, debouncing, theme state). A simple WHOIS lookup might just be a form and fetch.  
**Alternatives Considered:** All React (rejected: overkill for simple utilities), all vanilla (rejected: reinventing React poorly for stateful apps)  
**Implications:** Per-app decision on framework, documented in each app's README

### AD-003: ELK.js for mermaid layout
**Date:** 2025-01-19  
**Decision:** Use `@mermaid-js/layout-elk` package for diagram layout  
**Rationale:** GDR research confirmed ELK provides superior hierarchical layout matching mermaid.live's "automatic" mode. Dagre (default) produces unusable output for complex network topologies.  
**Alternatives Considered:** Dagre default (rejected: poor layout quality), Cytoscape.js (deferred: higher complexity, Phase 2 consideration)  
**Implications:** Additional dependency, but straightforward integration

## Constraints and Limitations

- **Client-side only:** Cannot perform operations requiring server execution
- **Browser compatibility:** Target modern browsers (Chrome, Firefox, Edge), no IE11
- **Static hosting:** No server-side logic, all routing handled client-side or via static config

## Future Considerations

### Planned Utilities

- **mermaid-renderer** — Phase 1 (active)
- **whois-lookup** — IP/domain WHOIS for security investigations
- **markdown-preview** — Live markdown rendering with export

### Scalability Considerations

- If app count grows significantly (10+), may need better landing page navigation
- If shared components proliferate, consider extracting to internal package

### Known Technical Debt

- None yet — project is new
