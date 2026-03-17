/**
 * @file DirectoryGrid.jsx
 * @description Home page with micro-hero, live filtering, category pills, and fluid tool grid
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toolRegistry, getCategories } from '../lib/toolRegistry';

function ToolCard({ tool }) {
  const showBadges = tool.processingMode !== 'local' || tool.status !== 'stable';
  return (
    <Link
      to={tool.path}
      className="flex flex-col p-4 bg-surface-1 border border-border rounded-md transition-micro cursor-pointer group hover:bg-surface-2 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-micro mb-1">
        {tool.name}
      </h3>
      {showBadges && (
        <div className="flex gap-1.5 mb-1.5">
          {tool.processingMode === 'remote' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-warning/10 text-status-warning border border-status-warning/30">
              Online
            </span>
          )}
          {tool.processingMode === 'hybrid' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-info/10 text-status-info border border-status-info/30">
              Online Optional
            </span>
          )}
          {tool.status === 'beta' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-accent-muted text-accent-text border border-accent/30">
              Beta
            </span>
          )}
          {tool.status === 'experimental' && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm bg-status-error/10 text-status-error border border-status-error/30">
              Experimental
            </span>
          )}
        </div>
      )}
      <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
    </Link>
  );
}

export default function DirectoryGrid() {
  const categories = getCategories();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = useMemo(() => {
    let results = toolRegistry;
    if (activeCategory) {
      results = results.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, activeCategory]);

  return (
    <div>
      {/* Micro-hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Client-Side Developer Utilities
        </h1>
        <p className="text-sm text-text-secondary mb-4 max-w-2xl">
          {toolRegistry.length} network, security, and parsing tools. All processing executes
          locally in your browser. Zero tracking. Zero telemetry.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            100% Local Processing
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="4.5" y1="4.5" x2="19.5" y2="19.5"/></svg>
            No Server Logs
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border text-xs text-text-secondary rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Open Source
          </span>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tools…"
          className="w-full max-w-md px-3 py-2 text-sm bg-surface-1 text-text-primary border border-border rounded shadow-sm placeholder:text-text-muted transition-micro hover:border-border-strong focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-micro ${
              !activeCategory
                ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-micro ${
                activeCategory === cat
                  ? 'bg-surface-1 text-text-primary shadow-sm ring-1 ring-border-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fluid Tool Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
      >
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">
          No tools match your search.
        </p>
      )}
    </div>
  );
}
