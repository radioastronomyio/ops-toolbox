<!--
---
title: "Script Header - JavaScript/JSX/TypeScript"
description: "Standard header format for JavaScript family files"
author: "vintagedon"
date: "2025-01-21"
version: "1.0"
status: "Active"
tags:
  - type: standard
  - domain: documentation
related_documents:
  - "[Python Header](script-header-python.md)"
  - "[PowerShell Header](script-header-powershell.md)"
  - "[Shell Header](script-header-shell.md)"
---
-->

# Script Header - JavaScript/JSX/TypeScript

## Overview

Standard JSDoc-style header for JavaScript, JSX, TypeScript, and TSX files in this repository.

---

## Template

```javascript
/**
 * @file filename.jsx
 * @description Brief description of file purpose
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */
```

---

## Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `@file` | Yes | Filename including extension |
| `@description` | Yes | One-line summary of file purpose |
| `@author` | Yes | GitHub username (vintagedon) |
| `@license` | Yes | License identifier (MIT) |
| `@see` | Yes | Repository URL |

---

## Which Files Get Headers

| File Type | Header Required | Notes |
|-----------|-----------------|-------|
| `.js` | Yes | Standalone scripts, configs |
| `.jsx` | Yes | React components |
| `.ts` | Yes | TypeScript files |
| `.tsx` | Yes | TypeScript React components |
| `.mjs` / `.cjs` | Yes | ES/CommonJS modules |
| `vite.config.js` | Yes | Build configuration |
| `.css` | Yes | Use CSS block comment style |
| `package.json` | No | JSON doesn't support comments |
| `index.html` | Optional | HTML comments less common |

---

## CSS Variant

For CSS files, use the same structure in CSS block comment syntax:

```css
/**
 * @file styles.css
 * @description Main stylesheet for application
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */
```

---

## Notes

- Header goes at the very top of the file, before any imports
- Keep descriptions concise — one line preferred
- Author is always the repository owner's GitHub username
- Repository URL should be the full HTTPS URL
