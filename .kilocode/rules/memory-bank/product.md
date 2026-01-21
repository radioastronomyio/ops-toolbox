# Ops Toolbox Product Overview

## Problems Solved

This project addresses:

- **Data Sovereignty:** Pasting customer network topologies, internal IP addresses, or sensitive documentation into external services (mermaid.live, markdownlivepreview.com, WHOIS lookup sites) creates compliance and security risks for government customers and sensitive environments.

- **Tool Fragmentation:** Daily IT operations involve bouncing between multiple single-purpose web tools. Having a unified, self-hosted toolkit reduces context switching and ensures consistent availability.

- **Dependency on External Services:** Third-party tools can change, add tracking, go down, or sunset. Self-hosted alternatives provide stability and control.

## How It Works

Ops Toolbox is a mono-repo of independent web applications sharing a common deployment pipeline. Each app is designed as a standalone utility that runs entirely client-side — no backend, no data transmission, no accounts. Users access tools via a central landing page or direct URLs.

Key components:

- **apps/** — Individual utility applications (mermaid-renderer, whois-lookup, markdown-preview, etc.)
- **shared/** — Common styles, themes, and potentially shared components
- **Azure Static Web Apps** — Hosting with automatic CI/CD from GitHub

## Goals and Outcomes

### Primary Goals

1. **Replace mermaid.live** with self-hosted equivalent matching "automatic mode" layout quality using ELK.js
2. **Establish the mono-repo pattern** so adding future utilities is trivial
3. **Deploy to Azure Static Web Apps** with CI/CD pipeline

### User Experience Goals

- Paste input → see output instantly (sub-second for small inputs)
- Export results (SVG, PNG, copy to clipboard)
- Dark theme by default, light theme available
- Clear "no data transmitted" messaging for security-conscious users

### Success Metrics

- **Functional parity:** Mermaid renderer produces output quality matching mermaid.live automatic mode
- **Zero external calls:** Network tab shows no outbound requests during operation
- **Deployment speed:** New utility from scaffold to production in <1 hour
