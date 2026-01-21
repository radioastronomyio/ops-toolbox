# Ops Toolbox Context

## Current State

**Last Updated:** 2025-01-21

### Recent Accomplishments

- Established project concept and scope via Claude discussion
- Conducted GDR (Gemini Deep Research) on mermaid layout optimization
- Confirmed ELK.js via `@mermaid-js/layout-elk` is the correct approach
- Created repo structure at `D:\development-repositories\ops-toolbox`
- Wrote memory bank documentation
- Implemented `mermaid-renderer` app with ELK layout and live preview (via Antigravity)
- Set up root landing page for the mono-repo
- Verified zero network calls and high-quality orthogonal layout
- Created shared design tokens at `shared/styles/tokens.css`
- Added JavaScript/JSX header standard to documentation-standards
- Added file headers to all source files
- Pushed to GitHub at `radioastronomyio/ops-toolbox`

### Current Phase

**Phase 1: MVP Implementation** is complete. Mermaid renderer is functional with ELK layout, live preview, theme toggle, and export capabilities. Ready for deployment.

### Active Work

Currently working on:

1. **Memory bank setup:** ✅ Complete
2. **Mermaid renderer implementation:** ✅ Complete
3. **Worklog documentation:** In progress
4. **Azure deployment pipeline:** Not started — next phase

## Next Steps

### Immediate (This Session)

1. Write worklog for `02-mermaid-renderer-implementation`
2. Final commit and merge to main

### Near-Term (Next Session)

1. Set up Azure Static Web Apps deployment workflow
2. Configure GitHub Actions for CI/CD
3. Deploy to Azure and verify production behavior
4. Update `apps/mermaid-renderer/README.md` with live URL

### Future / Backlog

- Subgraph label positioning refinement (labels outside boxes)
- WHOIS lookup utility
- Markdown preview utility
- Shared theme system across apps (tokens.css is the foundation)

## Active Decisions

### Pending Decisions

- **Custom domain:** Need to decide on domain/subdomain for deployment (TBD)

### Recent Decisions

- **2025-01-21 - Public repo:** Repository is public at `radioastronomyio/ops-toolbox`
- **2025-01-21 - JSDoc headers:** Adopted lightweight JSDoc-style headers for JS/JSX/TS files
- **2025-01-21 - Antigravity for implementation:** Used Google Antigravity IDE for autonomous implementation with browser validation
- **2025-01-20 - Mono-repo structure:** Chose mono-repo over separate repos for simplicity
- **2025-01-20 - ELK for layout:** Confirmed via GDR research that `@mermaid-js/layout-elk` provides the layout quality needed
- **2025-01-20 - React for mermaid-renderer:** Stateful live preview justifies React; other utilities may be simpler

## Blockers and Dependencies

### Current Blockers

None.

### External Dependencies

- **Azure Static Web Apps:** Account/subscription needed for deployment (assumed available)

## Notes and Observations

### Recent Insights

- Antigravity completed full implementation in ~5 minutes with browser-based validation
- Mermaid 11.x required for `registerLayoutLoaders` API (upgraded from initially planned 10.x)
- ELK layout produces clean hierarchical flow with orthogonal routing as expected
- Subgraph labels render inside boxes by default — refinement for external labels is a future enhancement

### Context for Next Session

Implementation is complete. Primary objective is Azure deployment:

1. Create `.github/workflows/azure-static-web-apps.yml`
2. Configure Azure Static Web App resource
3. Deploy and verify
4. Update README with live URL

Key files created this session:
- `apps/mermaid-renderer/App.jsx` — main React component
- `apps/mermaid-renderer/main.jsx` — entry point with ELK initialization  
- `apps/mermaid-renderer/styles.css` — dark/light theme styles
- `apps/mermaid-renderer/vite.config.js` — build configuration
- `shared/styles/tokens.css` — shared design tokens
- `index.html` (root) — landing page for mono-repo
- `docs/documentation-standards/script-header-javascript.md` — JS header standard
