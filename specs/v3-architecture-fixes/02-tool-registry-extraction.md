# 02 — Extract Tool Registry from App.jsx

## Objective

`src/App.jsx` currently owns tool metadata, lazy imports, and routing. `src/components/DirectoryGrid.jsx` imports `toolsConfig` back from App just to read the metadata. This coupling blocks future features: search, filtering, docs links, badges, feature flags, per-tool help pages, and category landing pages all require tool metadata without importing the router.

Extract a standalone tool registry module that both routing and directory views derive from.

## Architecture

### New file: `src/lib/toolRegistry.js`

This is a **data-only module** — no React, no lazy imports, no components. It exports the tool manifest as a plain array of objects.

```js
// src/lib/toolRegistry.js

/**
 * Canonical tool registry. Every tool in the suite is registered here.
 * Routing, directory grid, search, docs, and badges all derive from this.
 *
 * To add a new tool:
 * 1. Add an entry to this array
 * 2. Add a lazy import in App.jsx mapped to the same `id`
 * 3. Create the component in src/tools/
 */
export const toolRegistry = [
  {
    id: 'subnet-calculator',
    name: 'Subnet Calculator',
    description: 'IPv4 CIDR arithmetic — network, broadcast, host range, and mask calculations.',
    path: 'subnet-calculator',
    category: 'Networking',
    componentPath: './tools/SubnetCalculator',
  },
  // ... all 25 tools
];
```

**Field definitions:**

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `string` | Unique identifier. Matches `path` for now but decouples identity from routing. |
| `name` | `string` | Display name shown in directory, nav, page titles. |
| `description` | `string` | One-line description for directory cards. |
| `path` | `string` | URL path segment (under `/`). |
| `category` | `string` | Grouping key for directory. Current values: `'Networking'`, `'Security'`, `'Data'`, `'Developer'`. |
| `componentPath` | `string` | Relative path to the component module (for documentation/reference — not used at runtime). |

**Important:** The `component` field (the actual React lazy reference) stays in `App.jsx`. The registry is data-only. This keeps `toolRegistry.js` importable from anywhere without pulling in React.

### Helper exports from `src/lib/toolRegistry.js`

```js
/**
 * Get all unique categories in display order.
 */
export function getCategories() {
  const seen = new Set();
  const categories = [];
  for (const tool of toolRegistry) {
    if (!seen.has(tool.category)) {
      seen.add(tool.category);
      categories.push(tool.category);
    }
  }
  return categories;
}

/**
 * Get tools filtered by category.
 */
export function getToolsByCategory(category) {
  return toolRegistry.filter(t => t.category === category);
}

/**
 * Find a tool by its path segment.
 */
export function getToolByPath(path) {
  return toolRegistry.find(t => t.path === path);
}

/**
 * Get the total tool count.
 */
export function getToolCount() {
  return toolRegistry.length;
}
```

### Modify: `src/App.jsx`

Remove the `toolsConfig` array and its metadata. Replace with:

1. Import `toolRegistry` from the new module
2. Keep the lazy imports as-is (these are React-specific and belong in the routing layer)
3. Build a lookup map from `id` → lazy component
4. Generate `<Route>` elements by iterating `toolRegistry` and resolving the component from the map

```js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { toolRegistry } from './lib/toolRegistry';
import ToolLayout from './components/ToolLayout';
import DirectoryGrid from './components/DirectoryGrid';

// Lazy-loaded components keyed by registry id
const toolComponents = {
  'subnet-calculator': lazy(() => import('./tools/SubnetCalculator')),
  'jwt-decoder': lazy(() => import('./tools/JwtDecoder')),
  'password-generator': lazy(() => import('./tools/PasswordGenerator')),
  'json-yaml': lazy(() => import('./tools/JsonYamlConverter')),
  'base64': lazy(() => import('./tools/Base64Codec')),
  'mermaid-renderer': lazy(() => import('./tools/mermaid-renderer/MermaidRenderer')),
  'cidr-expander': lazy(() => import('./tools/CidrExpander')),
  'mac-lookup': lazy(() => import('./tools/MacVendorLookup')),
  'url-parser': lazy(() => import('./tools/UrlParser')),
  'useragent-decoder': lazy(() => import('./tools/UserAgentDecoder')),
  'chmod-calculator': lazy(() => import('./tools/ChmodCalculator')),
  'ssh-keygen': lazy(() => import('./tools/SshKeyGenerator')),
  'x509-parser': lazy(() => import('./tools/X509Parser')),
  'file-hash-calculator': lazy(() => import('./tools/FileHashCalculator')),
  'bcrypt-hash-verifier': lazy(() => import('./tools/BcryptHashVerifier')),
  'json-diff': lazy(() => import('./tools/JsonDiff')),
  'csv-to-json': lazy(() => import('./tools/CsvToJson')),
  'sql-formatter': lazy(() => import('./tools/SqlFormatter')),
  'url-encoder': lazy(() => import('./tools/UrlQueryEncoder')),
  'cron-parser': lazy(() => import('./tools/CronParser')),
  'regex-tester': lazy(() => import('./tools/RegexTester')),
  'ascii-banner': lazy(() => import('./tools/AsciiBanner')),
  'uuid-generator': lazy(() => import('./tools/UuidGenerator')),
  'epoch-time': lazy(() => import('./tools/UnixEpochTool')),
  'markdown-previewer': lazy(() => import('./tools/MarkdownPreviewer')),
};

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500">
      Loading tool…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolLayout />}>
          <Route index element={<DirectoryGrid />} />
          {toolRegistry.map((tool) => {
            const Component = toolComponents[tool.id];
            if (!Component) {
              console.warn(`No component mapped for tool: ${tool.id}`);
              return null;
            }
            return (
              <Route
                key={tool.path}
                path={tool.path}
                element={
                  <Suspense fallback={<Loading />}>
                    <Component />
                  </Suspense>
                }
              />
            );
          })}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Critical:** Remove the `export const toolsConfig` entirely. Nothing should import from App.jsx for metadata anymore.

### Modify: `src/components/DirectoryGrid.jsx`

Change the import from:
```js
import { toolsConfig } from '../App';
```

To:
```js
import { toolRegistry, getCategories, getToolsByCategory } from '../lib/toolRegistry';
```

Update the component to use the new helpers:

```js
export default function DirectoryGrid() {
  const categories = getCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tool Directory</h1>
        <p className="text-slate-400">
          Self-hosted, client-side utilities for IT operations. Pick a tool to get started.
        </p>
      </div>
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getToolsByCategory(category).map((tool) => (
              <Link
                to={tool.path}
                key={tool.path}
                className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-sky-500 hover:-translate-y-0.5 transition-all group"
              >
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400 transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

Note: the field changed from `desc` to `description` in the registry. Update all references.

### Check for other consumers

Search the codebase for any file importing `toolsConfig` from `App` or `App.jsx`. Each must be updated to import from `toolRegistry` instead. Currently the only known consumer is `DirectoryGrid.jsx`, but verify with:

```bash
grep -r "toolsConfig" src/
grep -r "from.*App" src/components/
```

## Tests: `tests/lib/toolRegistry.test.js`

```
describe('toolRegistry')
  - exports an array of 25 tools
  - every tool has required fields: id, name, description, path, category, componentPath
  - no duplicate ids
  - no duplicate paths
  - every id matches its path (current invariant — may change later)

describe('getCategories')
  - returns array of unique category strings
  - preserves insertion order (Networking, Security, Data, Developer)

describe('getToolsByCategory')
  - returns only tools matching the given category
  - returns empty array for unknown category

describe('getToolByPath')
  - returns the correct tool for a known path
  - returns undefined for an unknown path

describe('getToolCount')
  - returns 25
```

## Tests: Update existing tests

Any test that imports `toolsConfig` from `App.jsx` must be updated to import from `toolRegistry`. Search:

```bash
grep -r "toolsConfig" tests/
```

## Done Criteria

- `npm run test` — all tests pass
- `src/lib/toolRegistry.js` exists with all 25 tools and helper functions
- `src/App.jsx` no longer exports `toolsConfig`
- `src/App.jsx` imports `toolRegistry` and maps ids to lazy components
- `src/components/DirectoryGrid.jsx` imports from `toolRegistry`, not from `App`
- No file in `src/` imports `toolsConfig` from `App` or `App.jsx`
- `grep -r "toolsConfig" src/` returns zero results
- All routes still work (verify by running dev server if possible)
