# Ops Toolbox Brief

Ops Toolbox is a mono-repo collection of self-hosted utility web applications for IT operations and network engineering workflows. Each app is a lightweight, single-purpose tool that replaces external SaaS dependencies where data sovereignty or simplicity matters — think mermaid.live, markdownlivepreview, WHOIS lookups, and similar "paste-and-go" utilities.

This project exists to eliminate the friction and security concerns of pasting potentially sensitive data into third-party web services. Network diagrams containing customer infrastructure, IP addresses from security investigations, and internal documentation shouldn't leave controlled environments. By self-hosting these utilities on Azure Static Web Apps, all processing happens client-side with zero data transmission.

The primary user is the repo owner (CrainBramp) — a network engineer who uses these tools daily. Secondary users may include coworkers who benefit from the same data sovereignty guarantees. The design philosophy is KISS: React or vanilla HTML, minimal dependencies, fast deployment, zero backend requirements.
