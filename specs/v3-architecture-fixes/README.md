# Ops Toolbox — v3 Architecture Fixes

## Overview

This spec set addresses architectural findings from a GPT-5.4 extended thinking code review (Codex), following the v2 tool expansion. All 25 tools are functional — this pass hardens the platform layer.

## Source

Findings originate from four independent review passes: GLM-5, Greptile, Macroscope, and GPT-5.4 (Codex). Bug-level findings from the first three were already fixed. This spec addresses the architectural and correctness issues that remain.

## Execution Order

Specs are numbered 01–05 and **must execute sequentially**. Each spec builds on the previous — the manifest (02) must exist before the catch-all route (03) or shared primitives (04) can reference it.

| Spec | Description | Depends On |
|------|-------------|------------|
| 01 | RNG bias fix (rejection sampling) | None — independent |
| 02 | Tool registry extraction | None — independent but do after 01 |
| 03 | Catch-all 404 route | 02 (imports from registry) |
| 04 | Shared hooks and components | 02 (ToolPage uses registry metadata) |
| 05 | Registry metadata fields | 02, 04 (extends registry, updates ToolPage) |

## Agent Instructions

1. Read `AGENTS.md` at project root first
2. Read this README
3. Execute specs 01–05 sequentially
4. Run `npm run test` after each spec — do not proceed if tests fail
5. **Do NOT commit.** Commits are handled manually after review.

## Branching

Work on branch: `feature/v3-architecture`

```bash
git checkout -b feature/v3-architecture
```
