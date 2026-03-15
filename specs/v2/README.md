# Ops Toolbox — v2 Specs

## Overview

This spec set extends the ops-toolbox SPA from 6 tools to 25, fixes existing bugs, and upgrades the subnet calculator to a visual split/join design.

## Execution Order

Specs are numbered 00–20 and should be executed sequentially. Each spec is a self-contained work unit with its own tests and done criteria.

## Batch Execution

Specs are designed to run in batches of ~5 per agent session:

| Batch | Specs | Description |
|-------|-------|-------------|
| A | 00–04 | Bugfixes, Subnet v2, CIDR Expander, MAC Lookup, URL Parser |
| B | 05–09 | UA Decoder, Chmod, SSH Keygen, X.509 Parser, File Hash |
| C | 10–14 | Bcrypt, JSON Diff, CSV→JSON, SQL Formatter, URL Encoder |
| D | 15–20 | Cron Parser, Regex Tester, ASCII Art, UUID, Epoch, Markdown |

## Agent Instructions

1. Read `AGENTS.md` at project root first
2. Read this README
3. Read the specs for your assigned batch
4. Execute sequentially — do not skip ahead
5. Run `npm run test` after each spec — do not proceed if tests fail
6. After each spec, register the new tool in `src/App.jsx` `toolsConfig` array
7. **Do NOT commit.** Commits are handled manually after review.

## API Dependency

Spec 03 (MAC Vendor Lookup) calls `https://api.donfather.dev/api/mac-lookup/{mac}`. This API may not exist yet. The tool must handle API unavailability gracefully with a user-facing message. All user data stays client-side — the API call only returns vendor information.

## Spec Format

Each spec defines:
- **Route** — URL path within the SPA
- **Dependencies** — npm packages or native APIs
- **Architecture** — file locations, pure logic extraction
- **Inputs / Outputs / Behavior** — functional requirements
- **Tests** — unit test expectations
- **Done Criteria** — what "finished" means
