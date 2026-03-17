# 03 — Catch-All 404 Route

## Objective

The SPA currently defines only known tool routes. Azure Static Web Apps rewrites all paths to `index.html` via `staticwebapp.config.json`. Any typo, stale docs link, or renamed tool path renders a blank page — no error, no recovery. Add a `*` catch-all route that shows a clear "not found" page with navigation back to the tool directory.

## Architecture

### New file: `src/components/NotFound.jsx`

A simple, styled 404 page that fits the existing dark-mode design. It should:

1. Show a clear "Tool Not Found" heading
2. Show the attempted path (from `useLocation`)
3. Provide a link back to the tool directory (`/`)
4. Optionally show a few suggested tools (random or popular picks from the registry)

```jsx
import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../lib/toolRegistry';

export default function NotFound() {
  const location = useLocation();

  // Pick 3 random tools as suggestions
  const suggestions = [...toolRegistry]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-slate-600 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-slate-300 mb-2">Tool Not Found</h2>
      <p className="text-slate-400 mb-8">
        Nothing lives at <code className="text-sky-400 bg-slate-800 px-2 py-0.5 rounded">{location.pathname}</code>
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors mb-8"
      >
        Back to Tool Directory
      </Link>
      <div className="text-sm text-slate-500">
        <p className="mb-3">Or try one of these:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map(tool => (
            <Link
              key={tool.path}
              to={`/${tool.path}`}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Modify: `src/App.jsx`

Add the catch-all route as the **last child** inside the `<Route path="/" element={<ToolLayout />}>` block:

```jsx
import NotFound from './components/NotFound';

// ... inside Routes, after all tool routes:
<Route path="*" element={<NotFound />} />
```

The complete route structure should be:

```jsx
<Route path="/" element={<ToolLayout />}>
  <Route index element={<DirectoryGrid />} />
  {toolRegistry.map((tool) => { /* ... existing tool routes */ })}
  <Route path="*" element={<NotFound />} />
</Route>
```

**Important:** The `*` route must be inside the `<ToolLayout>` wrapper so the header/nav chrome still renders. The 404 content appears in the main content area, not as a completely unstyled blank page.

## Do NOT

- Do not lazy-load `NotFound` — it's tiny and should load instantly
- Do not add a redirect — show the 404 at the bad URL so the user can see what went wrong
- Do not modify `staticwebapp.config.json` — the SPA fallback rewrite is correct as-is

## Tests: `tests/components/NotFound.test.jsx`

```
describe('NotFound')
  - renders 404 heading
  - displays the current pathname
  - renders a link back to /
  - renders tool suggestions from the registry
  - suggestion links point to valid tool paths
```

### Integration test (add to existing App tests or create new):

`tests/App.test.jsx` (create if it doesn't exist):

```
describe('App routing')
  - renders DirectoryGrid at /
  - renders NotFound for unknown paths like /nonexistent-tool
  - NotFound is inside the ToolLayout wrapper (has nav elements)
```

Use `MemoryRouter` with `initialEntries` to test routing without a real browser.

## Done Criteria

- `npm run test` — all tests pass
- Navigating to `/some-garbage-path` in the dev server shows the 404 page
- The 404 page displays inside the standard layout (nav/header visible)
- The "Back to Tool Directory" link works
- Tool suggestion links navigate to real tools
