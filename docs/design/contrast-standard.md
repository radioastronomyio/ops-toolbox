<!--
---
title: "Contrast Standard"
description: "The WCAG AA contrast rule every ops-toolbox palette is audited against, stated in USWDS luminance-grade terms"
author: "vintagedon"
date: "2026-06-24"
version: "1.0"
status: "Active"
tags:
  - type: reference
  - domain: accessibility
  - tech: [css, design-tokens]
  - audience: intermediate
related_documents:
  - "[Architecture Overview](../architecture.md)"
  - "[Design Tokens](../../src/styles/design-tokens.css)"
  - "[Accessibility Layer](../../src/styles/accessibility.css)"
---
-->

# Contrast Standard

## 1. Purpose

This is the contrast rule every ops-toolbox palette is audited against. A theme ships only when its token pairs meet the thresholds below. The High-Contrast Slate theme is the accessibility guarantee; Light and Dark are the working themes. All three are bound by the same standard.

## 2. The Rule

Contrast is governed by USWDS luminance-grade mathematics, translated to WCAG 2.1 levels:

| Use | Minimum grade delta | WCAG level |
|-----|---------------------|------------|
| Body text (normal, < 18pt / < 14pt bold) | 50 | AA (4.5:1) |
| Large text (>= 18pt / >= 14pt bold) and UI component boundaries | 40 | AA (3:1) |
| Enhanced contrast | 70 | AAA (7:1) |

A "grade" is the perceptual luminance of a color on the USWDS 0-100 scale. The deltas above are the construction rule: pick text and surface grades at least this far apart and the ratio holds by construction. The authoritative check is still the computed WCAG relative-luminance contrast ratio.

## 3. Required Token Pairs

Every theme must clear these pairs. Body pairs target 4.5:1; boundary pairs target 3:1.

| Foreground | Against | Threshold |
|------------|---------|-----------|
| `--color-text-primary` | `--color-bg-base`, `--color-surface-1`, `--color-surface-2` | 4.5:1 |
| `--color-text-secondary` | `--color-bg-base`, `--color-surface-1`, `--color-surface-2` | 4.5:1 |
| `--color-text-muted` | `--color-bg-base` | 4.5:1 |
| `--color-accent-text` | `--color-bg-base`, `--color-surface-1` | 4.5:1 |
| Status tokens (`success`, `error`, `warning`, `info`) used as text | `--color-bg-base` | 4.5:1 |
| Button label on accent fill (e.g. black on `--color-accent-base`) | `--color-accent-base` | 4.5:1 |
| `--color-border-default` | `--color-bg-base`, `--color-surface-1` | 3:1 |
| `--color-border-strong` | `--color-bg-base` | 3:1 |

## 4. Proving a Theme

A theme is proven by computing the WCAG contrast ratio for every required pair and confirming none falls below threshold. The Slate theme is verified this way at authoring time and re-checked by an automated contrast pass on a representative tool page. This standard does not re-derive the Light or Dark palettes; an audit of those against every pair is a separate spec.

## 5. References

- WCAG 2.1 Success Criterion 1.4.3 (Contrast - Minimum) and 1.4.11 (Non-text Contrast)
- USWDS Design Tokens - luminance / grade system
- Sentinel Design System, Section 11 (Accessibility Baseline)
