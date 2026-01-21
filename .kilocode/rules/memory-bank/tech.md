# Ops Toolbox Technology Stack

## Technology Stack

### Primary Technologies

- **React:** 18.x - UI framework for stateful applications (mermaid-renderer)
- **Vite:** 5.x - Build tooling, dev server, workspace support
- **mermaid.js:** 10.x - Diagram parsing and rendering
- **@mermaid-js/layout-elk:** Latest - ELK.js layout engine for superior diagram layouts

### Supporting Technologies

- **Tailwind CSS:** (optional) Utility-first styling if complexity warrants
- **CSS Variables:** Theme tokens for consistent styling across apps
- **Azure Static Web Apps:** Hosting platform with GitHub Actions integration

## Dependencies

### Core Dependencies (mermaid-renderer)

```json
{
  "mermaid": "^10.x",
  "@mermaid-js/layout-elk": "^0.x",
  "react": "^18.x",
  "react-dom": "^18.x"
}
```

### Dev Dependencies

```json
{
  "vite": "^5.x",
  "@vitejs/plugin-react": "^4.x"
}
```

## Development Environment

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm
- Git
- VS Code (recommended, workspace settings included)

### Setup Instructions

```bash
# Clone repository
git clone https://github.com/{owner}/ops-toolbox.git
cd ops-toolbox

# Install dependencies
npm install

# Start dev server (all apps)
npm run dev

# Start specific app
npm run dev --workspace=apps/mermaid-renderer

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables / Configuration

No environment variables required — all apps are client-side only with no external service dependencies.

## Infrastructure

### Hosting / Runtime Environment

- **Platform:** Azure Static Web Apps
- **Resources:** Minimal (static files, CDN-served)
- **Access:** Public URL (TBD, likely custom domain on .dev)
- **Cost:** Free tier sufficient for expected traffic

### CI/CD Pipeline

- **Platform:** GitHub Actions
- **Trigger:** Push to `main` branch
- **Process:** Build all apps → Deploy to Azure Static Web Apps
- **Workflow:** `.github/workflows/azure-static-web-apps.yml`

## Technical Constraints

### Performance Requirements

- Initial render: <1 second for typical diagrams
- Live preview: Debounced input (300ms) to prevent render thrashing
- Export: SVG/PNG generation client-side, instant for reasonable diagram sizes

### Security Constraints

- **Zero data transmission:** No fetch/XHR calls during operation
- **No analytics:** No tracking, telemetry, or third-party scripts
- **CSP compatible:** Should work with strict Content Security Policy

### Compatibility Requirements

- Modern browsers: Chrome 90+, Firefox 90+, Edge 90+, Safari 14+
- Mobile: Functional but not optimized (desktop-first use case)
- No IE11 support

## Development Workflow

### Version Control

- **Repository:** GitHub (private or public TBD)
- **Branching Strategy:** Simple — `main` is production, feature branches for development
- **Commit Conventions:** Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)

### Testing

- **Test Framework:** None initially (KISS principle)
- **Manual testing:** Verify against known mermaid diagrams
- **Future:** Add Playwright/Vitest if complexity warrants

### Build and Deployment

```bash
# Local development
npm run dev

# Production build
npm run build

# Deployment (automatic via GitHub Actions on push to main)
git push origin main
```

## Automation and Tooling

### Available Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build locally

### Development Tools

- **VS Code:** Primary editor, workspace settings in `.vscode/`
- **Vite:** HMR for fast development iteration
- **Browser DevTools:** Network tab verification (zero external calls)

## Troubleshooting

### Common Issues

#### ELK layout not applying
**Problem:** Diagrams render with Dagre layout instead of ELK  
**Solution:** Verify `@mermaid-js/layout-elk` is imported and `registerLayoutLoaders()` called before `mermaid.initialize()`

#### Diagram not rendering
**Problem:** Blank output or error  
**Solution:** Check browser console for mermaid parse errors. Validate syntax at mermaid.live first if needed.

#### Build fails
**Problem:** Vite build errors  
**Solution:** Verify Node.js version (18+), clear `node_modules` and reinstall

### Debug Commands

```bash
# Check Node version
node --version

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verbose build output
npm run build -- --debug
```

## Technical Documentation

- **Mermaid.js:** https://mermaid.js.org/
- **@mermaid-js/layout-elk:** https://www.npmjs.com/package/@mermaid-js/layout-elk
- **ELK.js:** https://github.com/kieler/elkjs
- **Vite:** https://vitejs.dev/
- **Azure Static Web Apps:** https://docs.microsoft.com/en-us/azure/static-web-apps/
