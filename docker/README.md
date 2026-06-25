<!--
---
title: "docker"
description: "nginx config for the self-host Docker image"
author: "VintageDon (https://github.com/vintagedon/)"
date: "2026-06-25"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: infrastructure
  - tech: [docker, nginx]
---
-->

# docker

nginx server config consumed by the multi-stage `Dockerfile` at build time.

---

## 1. Contents

```
docker/
├── nginx.conf    # SPA-aware server block (prerendered routes + SPA fallback)
└── README.md     # This file
```

---

## 2. Files

| File | Description | Status |
|------|-------------|--------|
| [nginx.conf](nginx.conf) | nginx `server` block copied to `/etc/nginx/conf.d/default.conf`. Serves the per-route prerendered HTML when present and falls back to the SPA shell for unknown routes, mirroring `staticwebapp.config.json`. | ✅ Active |

---

## 3. Routing model

The build prerenders `dist/<route>/index.html` for every tool route and `/about`. The
`location /` block tests `$uri/index.html` **before** the raw path so a request like
`/subnet-calculator` resolves straight to the prerendered file instead of matching the
directory and issuing a 301 trailing-slash redirect. Only when no file and no prerendered
route matches does it fall through to `/index.html` (the SPA shell), where React Router
renders the 404 view. Hashed assets under `/assets/` and root static files are served
directly with immutable / revalidating cache headers and never rewritten to the shell.

---

## 4. Related

| Document | Relationship |
|----------|--------------|
| [Parent](../README.md) | Repository root (Self-Host section) |
| [`../Dockerfile`](../Dockerfile) | Multi-stage build that consumes this config |
| [`../staticwebapp.config.json`](../staticwebapp.config.json) | Azure SWA routing this config mirrors |
