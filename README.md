<!--
---
title: "Ops Toolbox"
description: "Self-hosted utility web apps for IT operations"
author: "CrainBramp"
date: "2025-01-20"
version: "1.0"
status: "Active"
tags:
  - type: project-root
  - domain: utilities
  - tech: [react, vite, mermaid, azure-static-web-apps]
---
-->

# 🧰 Ops Toolbox

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Azure Static Web Apps](https://img.shields.io/badge/Azure-Static_Web_Apps-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/app-service/static)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> Self-hosted utility web apps for IT operations — because sensitive data shouldn't leave your network.

A mono-repo collection of lightweight, single-purpose web tools that run entirely client-side. No backends, no data transmission, no accounts. Paste your data, get your output, keep your privacy.

---

## 🎯 Why This Exists

Network engineers and IT professionals routinely use web-based utilities for quick tasks: rendering diagrams, previewing markdown, looking up IP ownership. The problem? Pasting customer network topologies, internal documentation, or security investigation data into third-party services creates compliance and security risks.

Ops Toolbox solves this by providing self-hosted alternatives that:

- Run 100% client-side — zero data leaves the browser
- Deploy to your infrastructure — Azure Static Web Apps, any static host, or localhost
- Do one thing well — focused utilities, not bloated platforms

---

## 📦 Utilities

| App | Description | Status |
|-----|-------------|--------|
| [Mermaid Renderer](apps/mermaid-renderer/) | Paste mermaid code → rendered diagram with ELK layout | 🔄 In Progress |
| [Markdown Preview](apps/markdown-preview/) | Live markdown preview with export | ⬜ Planned |
| [IP WHOIS Lookup](apps/whois-lookup/) | IP/domain ownership lookup for security investigations | ⬜ Planned |

### Mermaid Renderer

The flagship utility. Renders mermaid diagrams with the ELK layout engine for superior network topology visualization. Matches mermaid.live's "automatic" mode quality without sending your infrastructure diagrams to external services.

Features:
- Live preview with debounced input
- ELK.js layout (hierarchical, orthogonal routing, edge merging)
- Export: Copy SVG, Download SVG, Download PNG
- Dark/light theme toggle
- Sample network diagram included

### Markdown Preview

Simple markdown-to-HTML preview with live rendering. Export to HTML or copy rendered output.

### IP WHOIS Lookup

Look up IP address and domain ownership information. Useful for security investigations and the inevitable "where is my website hosted?" questions.

---

## 🏗️ Architecture

```
ops-toolbox/
├── apps/
│   ├── mermaid-renderer/     # React + mermaid.js + ELK
│   ├── markdown-preview/     # React or vanilla (TBD)
│   └── whois-lookup/         # Vanilla JS + public WHOIS APIs
├── shared/
│   └── styles/               # CSS variables, theme tokens
├── docs/
│   └── documentation-standards/
└── .github/
    └── workflows/            # Azure Static Web Apps CI/CD
```

Design principles:

- Client-side only — no backend, no server-side processing
- Independence — each app is self-contained, can be extracted if needed
- KISS — React where state management helps, vanilla JS where it doesn't

---

## 🚀 Getting Started

### Local Development

```bash
# Clone
git clone https://github.com/radioastronomyio/ops-toolbox.git
cd ops-toolbox

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Deployment

Push to `main` triggers GitHub Actions → Azure Static Web Apps deployment.

For manual deployment, upload the `dist/` directory to any static hosting provider.

---

## 📁 Repository Structure

```
ops-toolbox/
├── 📂 apps/                  # Individual utility applications
├── 📂 shared/                # Common styles and components
├── 📂 docs/                  # Documentation and templates
├── 📂 work-logs/             # Development milestone tracking
├── 📂 .kilocode/             # AI agent context (memory bank)
├── 📄 package.json           # Workspace configuration
├── 📄 AGENTS.md              # AI agent instructions
└── 📄 README.md              # This file
```

---

## 🔒 Security Model

Data handling: All processing happens in your browser. Network tab verification: zero outbound requests during operation (except initial page load).

Deployment options:
- Azure Static Web Apps (recommended)
- Any static hosting (Netlify, Vercel, GitHub Pages)
- Local file serving for air-gapped environments

Trust model: You control the hosting. No analytics, no telemetry, no third-party scripts.

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Mermaid.js](https://mermaid.js.org/) — Diagram rendering engine
- [ELK.js](https://github.com/kieler/elkjs) — Eclipse Layout Kernel for superior graph layouts
- [@mermaid-js/layout-elk](https://www.npmjs.com/package/@mermaid-js/layout-elk) — ELK integration for mermaid

---

Last Updated: 2025-01-20 | Phase 1: MVP Implementation
