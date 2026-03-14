# 00 — Shared Framework (SPA Scaffold)

## Objective

Transform the project from a monorepo of standalone apps into a single React SPA with client-side routing. This creates the foundation all tools build on. Includes Vitest setup for unit testing.

## Target Directory Structure

```
ops-toolbox/
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Router + lazy route definitions
│   ├── index.css                # Tailwind directives + global styles
│   ├── components/
│   │   ├── ToolLayout.jsx       # Shared shell (header, footer, <Outlet>)
│   │   └── DirectoryGrid.jsx    # Home page tool directory
│   ├── tools/
│   │   ├── SubnetCalculator.jsx
│   │   ├── JwtDecoder.jsx
│   │   ├── PasswordGenerator.jsx
│   │   ├── JsonYamlConverter.jsx
│   │   ├── Base64Codec.jsx
│   │   └── mermaid-renderer/    # Ported from apps/mermaid-renderer/
│   │       ├── MermaidRenderer.jsx
│   │       ├── Editor.jsx
│   │       └── config.js
│   └── lib/                     # Pure logic functions (testable without React)
│       ├── subnet.js
│       ├── base64.js
│       └── password.js
├── tests/
│   ├── setup.js                 # Vitest setup (jsdom, cleanup)
│   ├── lib/
│   │   ├── subnet.test.js
│   │   ├── base64.test.js
│   │   └── password.test.js
│   └── tools/
│       ├── SubnetCalculator.test.jsx
│       ├── JwtDecoder.test.jsx
│       ├── PasswordGenerator.test.jsx
│       ├── JsonYamlConverter.test.jsx
│       └── Base64Codec.test.jsx
├── index.html                   # SPA entry (replaces current static landing)
├── vite.config.js               # Root-level Vite config
├── tailwind.config.js
├── postcss.config.js
├── package.json                 # Single package (remove workspaces)
└── specs/                       # These spec documents
```

## Steps

### 1. Install dependencies

Update root `package.json` — remove `"workspaces"` config. Install:

```
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
```

Do NOT install tool-specific deps yet (those come in their respective specs).

### 2. Vitest setup

Add to `vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
});
```

`tests/setup.js`:
```js
import '@testing-library/jest-dom';
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 3. Tailwind setup

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

`postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Scrollbar styling */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #0f172a; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
```

### 4. SPA entry point

`index.html` (replaces current static landing page):
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ops Toolbox</title>
    <meta name="description" content="Client-side utility tools for IT operations. 100% local processing — data never leaves your browser." />
  </head>
  <body class="bg-slate-900 text-slate-300 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 5. App.jsx — routing and tool registry

The `toolsConfig` array is the single source of truth for all tools. The home page and router both consume it.

```jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ToolLayout from './components/ToolLayout';
import DirectoryGrid from './components/DirectoryGrid';

// Lazy-loaded tool routes
const SubnetCalculator = lazy(() => import('./tools/SubnetCalculator'));
const JwtDecoder = lazy(() => import('./tools/JwtDecoder'));
const PasswordGenerator = lazy(() => import('./tools/PasswordGenerator'));
const JsonYamlConverter = lazy(() => import('./tools/JsonYamlConverter'));
const Base64Codec = lazy(() => import('./tools/Base64Codec'));
// MermaidRenderer added in spec 06

export const toolsConfig = [
  {
    name: 'Subnet Calculator',
    desc: 'IPv4 CIDR arithmetic — network, broadcast, host range, and mask calculations.',
    path: 'subnet-calculator',
    category: 'Networking',
    component: SubnetCalculator,
  },
  {
    name: 'JWT Decoder',
    desc: 'Inspect JSON Web Token headers and payload claims without exposing secrets.',
    path: 'jwt-decoder',
    category: 'Security',
    component: JwtDecoder,
  },
  {
    name: 'Password Generator',
    desc: 'Cryptographically secure string generation using Web Crypto API entropy.',
    path: 'password-generator',
    category: 'Security',
    component: PasswordGenerator,
  },
  {
    name: 'JSON ↔ YAML',
    desc: 'Bidirectional conversion between JSON and YAML with real-time linting.',
    path: 'json-yaml',
    category: 'Data',
    component: JsonYamlConverter,
  },
  {
    name: 'Base64 Codec',
    desc: 'Encode and decode Base64 strings with support for UTF-8 and binary data.',
    path: 'base64',
    category: 'Data',
    component: Base64Codec,
  },
];

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
          {toolsConfig.map((tool) => (
            <Route
              key={tool.path}
              path={tool.path}
              element={
                <Suspense fallback={<Loading />}>
                  <tool.component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 6. ToolLayout.jsx

Persistent shell: header with logo + conditional "back to directory" link, footer with privacy guarantee, `<Outlet>` for active tool.

```jsx
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function ToolLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-300 font-sans">
      <header className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-bold text-slate-100 hover:text-sky-400 transition-colors">
            Ops <span className="text-sky-400">Toolbox</span>
          </Link>
          {!isHome && (
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700 transition-all"
            >
              ← All Tools
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800/50 py-6 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">100% Client-Side Processing</p>
        <p className="text-sm text-slate-400">Data never leaves your browser.</p>
      </footer>
    </div>
  );
}
```

### 7. DirectoryGrid.jsx

Home page: renders cards from `toolsConfig`. Grouped by category.

```jsx
import { Link } from 'react-router-dom';
import { toolsConfig } from '../App';

export default function DirectoryGrid() {
  const categories = {};
  toolsConfig.forEach((tool) => {
    if (!categories[tool.category]) categories[tool.category] = [];
    categories[tool.category].push(tool);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tool Directory</h1>
        <p className="text-slate-400">
          Self-hosted, client-side utilities for IT operations. Pick a tool to get started.
        </p>
      </div>
      {Object.entries(categories).map(([category, tools]) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link
                to={tool.path}
                key={tool.path}
                className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-sky-500 hover:-translate-y-0.5 transition-all group"
              >
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400 transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 8. Placeholder tools

Create each tool file (`src/tools/SubnetCalculator.jsx`, etc.) with a minimal placeholder:

```jsx
export default function ToolName() {
  return (
    <div className="text-slate-400">
      <h1 className="text-2xl font-bold text-white mb-2">Tool Name</h1>
      <p>Coming soon.</p>
    </div>
  );
}
```

### 9. Cleanup

- Remove `apps/mermaid-renderer/` from the workspace (do NOT delete yet — spec 06 ports it)
- Remove `"workspaces"` from root `package.json`
- The old root `index.html` is replaced by the SPA entry
- The old `shared/styles/tokens.css` is superseded by Tailwind — keep file but it's no longer imported

### 10. Verify

- `npm run dev` starts without errors
- `npm run test` passes (no tests yet, but should exit cleanly)
- `npm run build` succeeds

## Done Criteria

- SPA scaffold running locally with Vite
- Vitest configured and runnable
- All 5 tool routes exist (placeholder content)
- ToolLayout wraps all routes
- DirectoryGrid renders on home
- Tailwind styles apply (dark background, light text, card hover effects)
- `npm run test` exits cleanly
- `npm run build` succeeds
