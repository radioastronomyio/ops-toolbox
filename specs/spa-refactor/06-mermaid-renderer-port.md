# 06 — Mermaid Renderer Port

## Objective

Port the existing standalone `apps/mermaid-renderer/` application into the SPA as a tool route. Migrate its CSS to Tailwind. Preserve all existing functionality.

## Route

`/mermaid-renderer`

## Dependencies

These are already in the old app's package.json. Add them to the root package.json:

```
npm install mermaid @mermaid-js/layout-elk @codemirror/commands @codemirror/lang-markdown @codemirror/language @codemirror/state @codemirror/theme-one-dark @codemirror/view lucide-react
```

## Source Files to Port

From `apps/mermaid-renderer/`:

| Old File | New Location | Notes |
|----------|-------------|-------|
| `App.jsx` | `src/tools/mermaid-renderer/MermaidRenderer.jsx` | Main component — rename, adapt |
| `Editor.jsx` | `src/tools/mermaid-renderer/Editor.jsx` | CodeMirror wrapper — minimal changes |
| `config.js` | `src/tools/mermaid-renderer/config.js` | Mermaid config factory — no changes |
| `main.jsx` | N/A | Entry point logic moves to MermaidRenderer |
| `styles.css` | N/A | Migrate to Tailwind classes inline |
| `index.html` | N/A | Replaced by SPA entry |

## Key Changes

### 1. Mermaid + ELK initialization

Move ELK registration to a top-level side effect in `MermaidRenderer.jsx`:

```js
import elkLayouts from '@mermaid-js/layout-elk';
import mermaid from 'mermaid';
import { getMermaidConfig } from './config';

// Register ELK layout engine (runs once on module load)
mermaid.registerLayoutLoaders(elkLayouts);
```

### 2. Remove standalone app shell

The old `App.jsx` has its own header. In the SPA, `ToolLayout` provides the header. The mermaid-specific controls (theme toggle, layout toggle, copy/download buttons) should remain but live within the tool's own UI area.

### 3. CSS → Tailwind migration

Key mappings:
- `--bg-primary: #0f172a` → `bg-slate-900`
- `--bg-secondary: #1e293b` → `bg-slate-800`
- `--text-primary: #f8fafc` → `text-slate-50`
- `--text-secondary: #94a3b8` → `text-slate-400`
- `--accent-primary: #38bdf8` → `text-sky-400`
- `--border-color: #334155` → `border-slate-700`

CodeMirror overrides (`.cm-editor`, `.cm-gutters`, `.cm-error-line`) go in `src/index.css` — these can't be Tailwind utilities.

### 4. Theme toggle scope

Keep theme state local to the mermaid renderer. It controls diagram rendering theme, not the global SPA.

### 5. localStorage keys

Keep existing keys: `mermaid-theme`, `mermaid-layout`, `mermaid-auto-update`.

### 6. Layout

The mermaid renderer can work within ToolLayout's `max-w-7xl` container or override to `max-w-full` if it needs more space.

## Add to App.jsx

After porting, add to `toolsConfig`:

```js
{
  name: 'Mermaid Renderer',
  desc: 'Paste mermaid diagram code and get rendered SVG with ELK layout engine.',
  path: 'mermaid-renderer',
  category: 'Developer',
  component: MermaidRenderer,
}
```

And the lazy import:
```js
const MermaidRenderer = lazy(() => import('./tools/mermaid-renderer/MermaidRenderer'));
```

## Tests: `tests/tools/MermaidRenderer.test.jsx`

Mermaid and CodeMirror are DOM-heavy and difficult to fully test in jsdom. Focus on what's testable:

```
describe('config.js')
  - getMermaidConfig('dark', 'elk') returns object with theme 'dark' and layout 'elk'
  - getMermaidConfig('light', 'dagre') returns object with theme 'default' and layout 'dagre'
  - ELK config includes mergeEdges property when layout is 'elk'
  - Dagre config does not include elk property

describe('MermaidRenderer component')
  - renders without crashing (may need to mock mermaid.render and mermaid.registerLayoutLoaders)
  - contains expected control buttons (theme toggle, layout toggle, copy/download)
```

For mermaid.render and ELK, mock them in the test:
```js
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    registerLayoutLoaders: vi.fn(),
  },
}));
```

## Cleanup

After verifying the port works:

- Delete `apps/mermaid-renderer/` directory entirely
- Delete `apps/README.md`
- Remove `shared/styles/tokens.css` (superseded by Tailwind)

## Done Criteria

- `npm run test -- tests/tools/MermaidRenderer.test.jsx` — all pass
- All 6 tools visible in home directory grid
- `npm run test` — full suite passes (all specs)
- `npm run build` — succeeds with no errors
- `apps/mermaid-renderer/` deleted
