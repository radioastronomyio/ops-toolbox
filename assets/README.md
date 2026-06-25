<!--
---
title: "Assets"
description: "Repository-owned images and static visual assets for ops-toolbox"
author: "VintageDon (https://github.com/vintagedon/)"
date: "2026-06-24"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: assets
---
-->

# Assets

Repository-owned images and visual assets for ops-toolbox. This is the canonical home for graphics that ship with the repo (logo, banners, screenshots). Browser-served assets live under `public/`; this directory holds the source/repository copies.

---

## 1. Contents

```
assets/
├── logo.svg              # Flat toolbox app-icon (no text); source copy of public/logo.svg
├── directory-hero.png    # README hero — the colored home directory (dark theme, 2880x1800 @2x)
├── og-banner.png         # Repository copy of the served social card (source: scripts/generate_og_card.py)
└── README.md             # This file
```

---

## 2. Files

| File | Description | Status |
|------|-------------|--------|
| [logo.svg](logo.svg) | Flat toolbox logo, accent teal, no text. Used as favicon and header mark. | ✅ Active |
| [directory-hero.png](directory-hero.png) | README hero screenshot of the home directory (dark theme). Captured via Playwright from the dev server. | ✅ Active |
| [og-banner.png](og-banner.png) | Repository copy of the 1200x630 social card; the served copy is `public/og.png`. Composed by `scripts/generate_og_card.py`. | ✅ Active |

---

## 4. Related

| Document | Relationship |
|----------|--------------|
| [Parent](../README.md) | Repository root |
| [`public/logo.svg`](../public/logo.svg) | Build-served copy of the logo |
| [`public/og.png`](../public/og.png) | Build-served copy of the social card |
| [`scripts/generate_og_card.py`](../scripts/generate_og_card.py) | Reproducible generator for the OG banner |
