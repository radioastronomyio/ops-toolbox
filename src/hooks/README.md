<!--
---
title: "Hooks"
description: "Custom React hooks for clipboard and debounce"
author: "vintagedon"
date: "2026-03-16"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: shared
---
-->

# Hooks

Custom React hooks shared across tool components. These replace hand-rolled clipboard and debounce patterns that were previously duplicated in each tool.

---

## 1. Contents

### `useClipboard(resetMs = 2000)`

Async clipboard write with auto-reset feedback.

```javascript
const { copy, copied } = useClipboard();
// copy(text) — writes to clipboard, sets copied = true
// copied — auto-resets to false after resetMs
```

### `useDebouncedValue(value, delayMs = 300)`

Debounce any value with configurable delay.

```javascript
const debouncedInput = useDebouncedValue(input, 200);
// debouncedInput updates delayMs after the last input change
```

---

## 2. Related

| Document | Relationship |
|----------|--------------|
| [Source Root](../README.md) | Parent directory |
| [CopyButton](../components/CopyButton.jsx) | Uses useClipboard internally |
| [Tests](../../tests/hooks/) | Hook test suites |
