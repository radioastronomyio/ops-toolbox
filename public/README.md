<!--
---
title: "Public"
description: "Build-served static assets for ops-toolbox — logo, OG card, and robots.txt copied to the dist root"
author: "VintageDon (https://github.com/vintagedon/)"
date: "2026-06-25"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: architecture
  - tech: [vite]
related_documents:
  - "[Assets](../assets/README.md)"
  - "[Architecture Overview](../docs/architecture.md)"
  - "[Scripts](../scripts/README.md)"
---
-->

# Public

Browser-served static assets. Vite copies everything in `public/` to the root of `dist/` at build time, so each file is served from the site root (e.g. `public/logo.svg` → `/logo.svg`).

---

## 1. Contents

```
public/
├── logo.svg         # Favicon and header mark (flat toolbox, no text)
├── og.png           # 1200x630 social card (source: scripts/generate_og_card.py)
├── robots.txt       # Crawler allow-all + sitemap pointer
└── README.md        # This file
```

> Note: `sitemap.xml` and `llms.txt` are **not** stored here. They are generated into `dist/` at build time by `scripts/generate-meta.mjs` (from the tool registry), so they never drift from the actual routes.

---

## 2. Files

| File | Description | Status |
|------|-------------|--------|
| [logo.svg](logo.svg) | Flat toolbox logo, accent teal, no text. Used as favicon and header mark. | Active |
| [og.png](og.png) | 1200x630 social card for Open Graph / Twitter unfurls. Composed by [`scripts/generate_og_card.py`](../scripts/generate_og_card.py); a repository source copy lives at [`assets/og-banner.png`](../assets/og-banner.png). | Active |
| [robots.txt](robots.txt) | `User-agent: *`, `Allow: /`, and `Sitemap: https://opstoolbox.dev/sitemap.xml`. Served at `/robots.txt`. | Active |

---

## 3. Related

| Document | Relationship |
|----------|--------------|
| [Parent](../README.md) | Repository root |
| [Assets](../assets/README.md) | Repository-owned source copies of the visual assets |
| [Scripts](../scripts/README.md) | `generate_og_card.py` (OG card) and `generate-meta.mjs` (sitemap/llms) |
| [Architecture Overview](../docs/architecture.md) | Section 9 documents how these assets are served on Azure and nginx |
