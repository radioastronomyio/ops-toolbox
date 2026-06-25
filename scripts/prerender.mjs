/**
 * @file prerender.mjs
 * @description Build-time prerender — emits one static HTML file per tool route (and /about) with route-specific <title>, Open Graph, Twitter, and canonical meta, all canonical to opstoolbox.dev. Runs after `vite build`. Adds no server and no runtime network call; the 100% client-side claim stays literally true.
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toolRegistry } from '../src/lib/toolRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = 'https://opstoolbox.dev';
const OG_IMAGE = `${ORIGIN}/logo.svg`;

const SITE = {
  title: 'Ops Toolbox — Client-Side Developer Utilities',
  description: 'Client-side utility tools for IT operations. 100% local processing — data never leaves your browser.',
};

const ABOUT = {
  title: 'About Ops Toolbox',
  description: 'About Ops Toolbox — a fully client-side, air-gap-friendly collection of IT operations utilities. No servers, no tracking.',
};

/**
 * Build the canonical + Open Graph + Twitter meta block for a route.
 */
function socialBlock({ title, description, url }) {
  return [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Ops Toolbox" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ].join('\n    ');
}

function renderRoute(shellTemplate, { title, description, url }) {
  let html = shellTemplate;
  // Route-specific <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  // Canonical
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  // Per-route description (kept in sync with og:description)
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${description}"`);
  // Replace the social-cards region (between markers)
  html = html.replace(
    /<!-- begin social cards[\s\S]*?end social cards -->/,
    `<!-- begin social cards (rewritten per-route at build time by scripts/prerender.mjs) -->\n    ${socialBlock({ title, description, url })}\n    <!-- end social cards -->`
  );
  return html;
}

function writeRoute(routePath, html) {
  const dir = routePath === '' ? DIST : join(DIST, routePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const shellPath = join(DIST, 'index.html');
const shell = readFileSync(shellPath, 'utf8');

// Home (canonical site defaults)
writeRoute('', renderRoute(shell, { title: SITE.title, description: SITE.description, url: `${ORIGIN}/` }));

// Every tool route
for (const tool of toolRegistry) {
  writeRoute(
    tool.path,
    renderRoute(shell, {
      title: `${tool.name} — Ops Toolbox`,
      description: tool.description,
      url: `${ORIGIN}/${tool.path}`,
    })
  );
}

// About page
writeRoute('about', renderRoute(shell, { title: ABOUT.title, description: ABOUT.description, url: `${ORIGIN}/about` }));

console.log(`prerender: wrote ${1 + toolRegistry.length + 1} route HTML files to dist/`);
