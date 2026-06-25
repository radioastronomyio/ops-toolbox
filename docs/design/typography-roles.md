<!--
---
title: "Typography Roles"
description: "The UI and mono typographic roles, the type scale, and the micro-label convention for ops-toolbox"
author: "vintagedon"
date: "2026-06-24"
version: "1.0"
status: "Active"
tags:
  - type: reference
  - domain: design-system
  - tech: [css, design-tokens, tailwind]
  - audience: intermediate
related_documents:
  - "[Contrast Standard](contrast-standard.md)"
  - "[Architecture Overview](../architecture.md)"
  - "[Design Tokens](../../src/styles/design-tokens.css)"
---
-->

# Typography Roles

## 1. Purpose

ops-toolbox is a tool UI, not a reading surface. This document fixes the two typographic roles that apply, the rules each carries, the type scale, and the micro-label convention. It is the reference for every text decision in the app.

## 2. Roles

Two roles apply. A prose (serif) role is deliberately not adopted; there is no long-form reading content.

| Role | Font | Purpose | Rule |
|------|------|---------|------|
| UI | Inter (`--font-family-sans`) | Navigation, labels, table cells, chrome, body copy | Default sans for everything that is not data |
| Mono | JetBrains Mono (`--font-family-mono`) | Tabular data values (identifiers, hashes, addresses, code, output) | `font-variant-numeric: tabular-nums` so columns align |

The mono role carries `tabular-nums` globally via the `.font-mono` utility (see `src/index.css`). Any element using `font-mono` gets tabular figures automatically; never apply mono to running text.

## 3. Micro-Label Convention

Small uppercase section labels (flyout sections, footer, table headers, output groupings) use the `.micro-label` utility: `text-transform: uppercase` with `letter-spacing: 0.05em`. Pair it with a size utility (typically `text-xs`) and a color token. Do not hand-roll `uppercase tracking-*` for these; use `.micro-label`.

## 4. Type Scale

The base font size is `--base-font-size` (14px) on `<html>`, so `rem`-based sizes scale with the user's browser setting. Tailwind's scale is used throughout:

| Token | Size | Use |
|-------|------|-----|
| `text-2xl` | 1.5 rem (24px) | Page title (tool name) |
| `text-sm` | 0.875 rem (14px) | Body, labels, output |
| `text-xs` | 0.75 rem (12px) | Micro-labels, secondary meta |
| `text-[11px]` | 11px | Compact status meta (used sparingly) |

Mono data uses the same size tokens as its surrounding UI; the role difference is the family and tabular figures, not the size.

## 5. Density and Font Hooks

The `useDensity` hook (compact / default / comfortable) and the `useFontFamily` hook (system / Inter / mono) adjust spacing and the UI family at runtime. They do not change the role split or the rules above.

## 6. References

- Sentinel Design System, Section 7 (Typography Roles) — the source of the role discipline; the prose role is intentionally not adopted here
- `src/index.css` — `.font-mono` tabular-nums and `.micro-label` utility
