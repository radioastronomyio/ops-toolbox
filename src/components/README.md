<!--
---
title: "Components"
description: "Shared React UI components used across Ops Toolbox tools"
author: "vintagedon"
date: "2026-03-16"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: shared
---
-->

# Components

Shared React UI components used across multiple tools. These eliminate duplicated clipboard, error, and output patterns.

---

## 1. Contents

| Component | Purpose | Props |
|-----------|---------|-------|
| `CopyButton.jsx` | One-click clipboard copy with "Copied!" feedback | `text`, `label`, `className` |
| `ErrorBanner.jsx` | Inline error display with optional dismiss | `message`, `onDismiss` |
| `ResultPanel.jsx` | Read-only output panel with optional copy button | `value`, `label`, `error`, `copyable`, `mono`, `className` |
| `ToolLayout.jsx` | App shell — sticky header, nav, footer, `<Outlet />` | — |
| `DirectoryGrid.jsx` | Home page tool directory with category grouping and badges | — |
| `NotFound.jsx` | 404 page with path display and random tool suggestions | — |

---

## 2. Related

| Document | Relationship |
|----------|--------------|
| [Source Root](../README.md) | Parent directory |
| [Hooks](../hooks/README.md) | useClipboard (used by CopyButton) |
| [Tests](../../tests/components/) | Component test suites |
