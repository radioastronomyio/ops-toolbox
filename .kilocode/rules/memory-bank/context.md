# Ops Toolbox Context

## Current State
**Last Updated:** 2025-01-20

### Recent Accomplishments

- Established project concept and scope via Claude discussion
- Conducted GDR (Gemini Deep Research) on mermaid layout optimization
- Confirmed ELK.js via `@mermaid-js/layout-elk` is the correct approach
- Created repo structure at `D:\development-repositories\ops-toolbox`
- Wrote memory bank documentation

### Current Phase

We are currently in **Phase 1: MVP Implementation** which involves building the first utility (mermaid-renderer) with ELK layout integration.

### Active Work

Currently working on:

1. **Memory bank setup:** Complete — documentation written
2. **Mermaid renderer implementation:** Not started — next step
3. **Azure deployment pipeline:** Not started — after implementation

## Next Steps

### Immediate (This Session / Next Session)

1. Implement mermaid-renderer app in `apps/mermaid-renderer/`
   - React component with live preview
   - ELK layout integration via `@mermaid-js/layout-elk`
   - Export functions (copy SVG, download SVG, download PNG)
   - Dark/light theme toggle
   - Sample network diagram pre-loaded
2. Test against reference screenshots (UniFi topology)
3. Verify zero external network calls

### Near-Term (Next Few Sessions)

- Set up Vite workspace configuration
- Create Azure Static Web Apps deployment workflow
- Deploy to Azure and verify production behavior
- Create landing page linking to utilities

### Future / Backlog

- WHOIS lookup utility
- Markdown preview utility
- Shared theme system across apps

## Active Decisions

### Pending Decisions

- **Custom domain:** Need to decide on domain/subdomain for deployment (TBD)
- **Public vs private repo:** Currently unspecified

### Recent Decisions

- **2025-01-20 - Mono-repo structure:** Chose mono-repo over separate repos for simplicity
- **2025-01-20 - ELK for layout:** Confirmed via GDR research that `@mermaid-js/layout-elk` provides the layout quality needed
- **2025-01-20 - React for mermaid-renderer:** Stateful live preview justifies React; other utilities may be simpler

## Blockers and Dependencies

### Current Blockers

None — ready to implement.

### External Dependencies

- **Azure Static Web Apps:** Account/subscription needed for deployment (assumed available)
- **GitHub repo:** Need to push to GitHub for CI/CD (repo exists locally, remote TBD)

## Notes and Observations

### Recent Insights

- mermaid.live's "automatic" vs "manual" mode difference is dramatic — automatic mode produces usable network diagrams, manual mode produces chaos
- The GDR confirmed ELK is the layout engine behind the quality difference
- `@mermaid-js/layout-elk` is an official package, making integration straightforward

### Context for Next Session

Primary objective is implementing the mermaid-renderer app. Key files:
- `apps/mermaid-renderer/App.jsx` — main React component
- `apps/mermaid-renderer/index.html` — entry point

Reference materials:
- GDR output: `/mnt/user-data/uploads/Mermaid_Diagram_Rendering_Optimization.md` (in Claude context)
- One-pager: `/mnt/user-data/uploads/network-diagram-renderer-one-pager.md` (in Claude context)
- Screenshots showing automatic vs manual mode quality difference (in Claude context)

ELK integration pattern from GDR:
```javascript
import mermaid from 'mermaid';
import elkLayouts from '@mermaid-js/layout-elk';

mermaid.registerLayoutLoaders(elkLayouts);
mermaid.initialize({
  startOnLoad: false,
  layout: 'elk',
  elk: {
    mergeEdges: true,
    nodePlacementStrategy: 'BRANDES_KOEPF'
  }
});
```
