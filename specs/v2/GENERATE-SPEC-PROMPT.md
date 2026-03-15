# Spec Generator Prompt — Ops Toolbox v2

## Your Task

You are generating implementation specs for the ops-toolbox project. Each spec is a self-contained work unit that a coding agent will execute to build one tool.

## Context Files — Read These First

1. **GDR (master plan):** `.deep-research/gdr01-ops-toolbox.md` — Contains all 25 tools with descriptions, library pairings, and implementation notes.
2. **Existing spec template:** Read ANY spec in `specs/v2/` (e.g., `06-chmod-calculator.md`) to see the exact format to follow.
3. **Already-built tools:** Check `src/tools/` and `src/App.jsx` `toolsConfig` array to see what's already implemented.
4. **Already-written specs:** Check `specs/v2/` to see which spec numbers are taken.
5. **v2 README:** `specs/v2/README.md` — Has the master tool list and batch assignments.

## What to Generate

Generate the **next unwritten spec** in the sequence. The full list from the README:

| # | Tool | npm / API |
|---|------|-----------|
| 09 | File Hash Calculator | js-md5 + native crypto.subtle |
| 10 | Bcrypt Hash Verifier | bcryptjs |
| 11 | JSON Diff & Patch | jsondiffpatch |
| 12 | CSV to JSON Engine | papaparse |
| 13 | SQL Query Formatter | sql-formatter |
| 14 | URL Query Encoder | native encodeURIComponent |
| 15 | Cron Expression Parser | cronstrue |
| 16 | Regex Match Tester | native RegExp |
| 17 | ASCII Text Art Banner | figlet |
| 18 | UUID v4/v7 Generator | uuid |
| 19 | Unix Epoch Time Tool | native Date API |
| 20 | Markdown Previewer | marked + DOMPurify |

Check which spec numbers already exist in `specs/v2/`. Write the next one that's missing.

## Spec Format (match exactly)

Every spec MUST include these sections in this order:

```
# NN — Tool Name

## Objective
One paragraph. What this tool does and why.

## Route
`/url-path`

## Dependencies
List npm packages or "None" for native APIs. Include install commands.

## Architecture
### Pure logic file (if applicable): `src/lib/filename.js`
Function signatures with brief descriptions.
### React component: `src/tools/ComponentName.jsx`

## Inputs
What the user provides. Be specific about input types, defaults, validation.

## Outputs
What the user sees. Be specific about display format.

## Behavior
How the tool works. Auto-parse on input? Button trigger? Debounce? Error states?

## Tests: `tests/lib/filename.test.js` (if pure logic exists)
Specific test cases with expected values. Use describe/it structure.

## Tests: `tests/tools/ComponentName.test.jsx`
Component rendering tests. Keep these simple — renders, displays expected elements.

## Done Criteria
- npm run test passes
- Component renders at the route
- Key behaviors verified
```

## Rules

1. **One spec per run.** Write exactly one spec file, then stop.
2. **Match the format** of existing specs in `specs/v2/` exactly.
3. **Use the GDR** for library choices and implementation details, but verify the npm package names are real. Flag any that seem suspicious (like `@cldn/ip` which was a hallucination).
4. **Pure logic extraction:** If the tool has computation that can be tested without React, extract it to `src/lib/`. If it's just a thin wrapper around an npm package, skip the lib file.
5. **Test cases must have concrete expected values.** Not "returns correct result" but "input X → output Y".
6. **No cURL converter.** Skip it — deferred from this batch.
7. **File naming:** `NN-tool-name-slug.md` (e.g., `09-file-hash-calculator.md`)
8. **Do NOT modify existing specs or any other project files.** Only create the new spec file.

## After Writing

Report: "Wrote spec NN — Tool Name to specs/v2/NN-slug.md" and stop.
